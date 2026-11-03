import {config,state,change} from '../lib/store.js';
import {LIMIT,FEEDS,occupied,eligible,isBlocked,sourceKey,cleanError,addLog,canonicalWork,fault,blockRecord} from '../lib/model.js';
import {refreshCatalog,loadDetail,loadDetailCache,saveDetailCache} from '../lib/catalog.js';
import {automaticMatch,ensureInstance} from '../lib/metadata.js';
import {createSubscription,reconcile,stopSubscription,recoverMutation} from '../lib/subscriptions.js';
export async function run(ctx,input={}){
  await loadDetailCache(ctx)
  try{
  if(input.action==='create'){
    if(!input.confirmed)throw fault('请先确认 TMDB 媒体及季数');
    let work;
    try{work=await loadDetail(ctx,input.work);}catch(e){if(input.work?.source!=='douban')throw e;work=canonicalWork(input.work);}
    return createSubscription(ctx,work,input.choice,{restore:input.restore===true});
  }
  if(input.action==='confirm-absent'){
    if(input.confirmedAbsent!==true)throw fault('需要人工确认宿主未创建该订阅');
    await reconcile(ctx);
    await change(ctx,s=>{const r=s.records[input.key];if(!r||r.hostId||!['unknown','submitting','attention'].includes(r.status))throw fault('记录已经变化，请重新核对');blockRecord(s,r,'user-confirmed-absent');addLog(s,`用户确认「${r.work.title}」未创建，已停订`);});
    return {blocked:true};
  }
  if(input.action==='stop')return stopSubscription(ctx,input.key);
  const synced=await reconcile(ctx);
  let pool=synced; // 本轮回传的订阅池快照；新建意图会并入，避免同轮内同 identity 重复创建
  if(input.action==='sync')return {synced:true};
  if(input.action==='auto')return discover(ctx,pool,{force:true}); // 立即追新：手动触发，跳过间隔门控
  return discover(ctx,pool,{force:false}); // 周期运行（保留间隔门控）
  }finally{
    await saveDetailCache(ctx)
  }
}
// 自动发现 + 按规则订阅。force=true 为手动「立即追新」（忽略间隔门控）；false 为周期运行。
async function discover(ctx,pool,{force=false}={}){
  const c=await config(ctx),s=(await state(ctx)).value;
  if(Object.values(s.records).some(r=>['unknown','submitting','attention','delete_unknown','deleting'].includes(r.status)))return {attention:true};
  if(!c.auto)return {skipped:'请先在「追新规则」开启自动追新'};
  if(!force&&Date.now()-s.lastAuto<c.intervalMinutes*60000)return {skipped:true};
  await ensureInstance(ctx,c.proxyId);
  const fresh=await refreshCatalog(ctx,Object.keys(FEEDS).filter(f=>c.feeds[f]),c.pageCount);
  // Failed feeds preserve display caches but cached items never enter this automatic run.
  const works=[...new Map(Object.values(fresh).filter(x=>!x.error).flatMap(x=>x.items).map(w=>[sourceKey(w),w])).values()];
  let done=0,failed=0,created=0,inspected=0;
  const started=Date.now(),unavailableFeeds=new Set(),start=works.length?(s.autoCursor||0)%works.length:0;
  // 本地镜像：避免每轮每个作品都重读存储；创建成功后同步计数与已处理集合。
  let cursor=start,occ=occupied(s),handled=new Set(Object.values(s.records).flatMap(r=>r.sourceKeys));
  await ctx.task.update({total:works.length,done,failed,message:'读取最新公开目录，核对固定媒体库'});
  for(let offset=0;offset<works.length;offset++){
    const index=(start+offset)%works.length,raw=works[index],feed=raw.source==='bangumi'?'bangumi':`douban-${raw.mediaType}`,sk=sourceKey(raw);
    cursor=(index+1)%Math.max(1,works.length);
    if(inspected>=24||Date.now()-started>6*60*1000)break;
    if(!c.auto||occ>=LIMIT)break;
    if(unavailableFeeds.has(feed)){done++;continue;}
    if(isBlocked(s,raw)||handled.has(sk)){done++;continue;}
    try{
      // Cheap score/keyword checks are only an optimization; full detail supplies year and vote count.
      if(raw.score<c.minScore){done++;continue;}
      inspected++;const work=await loadDetail(ctx,raw);
      if(eligible(work,c)){
        const choice=await automaticMatch(ctx,work);
        if(choice){const result=await createSubscription(ctx,work,choice,{automatic:true,list:pool});
          if(result.hostId){created++;occ++;handled.add(sk);
            // 并入本地池快照，使后续同 identity 的作品命中已建意图而非重复创建。
            pool.push({id:result.hostId,tmdb_id:choice.tmdbId,media_type:choice.mediaType,season:choice.mediaType==='movie'?0:Number(choice.season),proxy_id:c.proxyId});
          }}
        else await change(ctx,x=>{x.review[sk]={work,at:Date.now(),reason:'片名、年份或季数存在歧义，请手动匹配'};const keys=Object.keys(x.review);for(const key of keys.slice(0,Math.max(0,keys.length-300)))delete x.review[key];});
      }
      done++;
    }catch(e){
      failed++;await change(ctx,x=>{addLog(x,`${raw.title}：${cleanError(e)}`,'warning');});
      if(/来源返回|验证页|详情不可用|快照无法|实例已停用/.test(cleanError(e)))unavailableFeeds.add(feed);
      // Unknown external results remain occupied and need review; do not send other automatic writes this round.
      if(Object.values((await state(ctx)).value.records).some(r=>['unknown','submitting','attention'].includes(r.status)))break;
    }
    await ctx.task.update({total:works.length,done,failed,message:`已处理 ${done+failed} 项，新增 ${created} 条订阅`});
    await ctx.sleep(500);
  }
  await change(ctx,x=>{x.lastAuto=Date.now();x.autoCursor=cursor;addLog(x,`追新检查完成：新增 ${created} 条，${failed} 项需稍后检查`);});
  await ctx.task.update({total:works.length,done,failed,message:`追新完成：新增 ${created} 条`});
  await ctx.task.checkpoint({kind:'done',result:{done,failed,created}});return {done,failed,created};
}
export async function recover(ctx,checkpoint){return recoverMutation(ctx,checkpoint);}
