import {LIMIT,fault,identity,sourceKey,occupied,isBlocked,blockRecord,addLog,statusCode} from './model.js';
import {state,change,config} from './store.js';
import {makeBody,librarySnapshot,ensureInstance,sameIntent} from './metadata.js';

// 并发分页拉取订阅池（限并发 5），避免大池顺序拉取拖慢每轮；命中末页即停。
export async function hostList(ctx){
  const items=[];
  let offset=0,stop=false;
  while(offset<20000&&!stop){
    const batch=[];
    for(let i=0;i<5&&offset<20000;i++,offset+=500)batch.push(offset);
    const results=await Promise.all(batch.map(o=>ctx.api.get(`/api/subscribe/pool/intents?limit=500&offset=${o}`)));
    for(const r of results){
      if(r?.code!=='ok'||!Array.isArray(r.data)||r.data.some(x=>!Number.isSafeInteger(x.id)||!['movie','tv'].includes(x.media_type)))throw fault('宿主订阅列表不完整，本次不判断删除');
      items.push(...r.data);
      if(r.data.length<500)stop=true;
    }
  }
  if(offset>=20000&&!stop)throw fault('宿主订阅分页未完成，本次保留所有订阅');
  return [...new Map(items.map(x=>[x.id,x])).values()];
}
// 按 identity(tmdb:季:类型) 建索引，把 O(记录×池) 的比对降到 O(1)。
function indexByIdentity(list){const m=new Map();for(const x of list){const k=identity(x);let arr=m.get(k);if(!arr){arr=[];m.set(k,arr);}arr.push(x);}return m;}
async function getIntent(ctx,id){
  try{const r=await ctx.api.get(`/api/subscribe/pool/intents/${id}`);if(r?.code!=='ok'||Number(r.data?.id)!==id)throw fault('宿主订阅详情无法核对');return r.data;}
  catch(e){if(statusCode(e)===404)return null;throw e;}
}
function adopt(s,r,sub){
  if(!sameIntent(sub,r.body)){r.status='attention';r.error='宿主订阅的媒体或固定实例不一致，请人工核对';return;}
  r.hostId=sub.id;r.hostState=sub.state;r.covered=sub.covered_episodes||'';r.needed=sub.needed_episodes||'';r.syncedAt=Date.now();r.error='';
  r.status=r.status==='deleting'||r.status==='delete_unknown'?'delete_unknown':sub.media_type==='movie'&&sub.state==='landed'?'complete':'active';
}
export async function reconcile(ctx){
  const list=await hostList(ctx),idx=indexByIdentity(list),snapshot=(await state(ctx)).value;
  for(const [key,record] of Object.entries(snapshot.records)){
    if(record.status==='blocked')continue;
    if(record.hostId){
      // Missing from a paged list is not sufficient: only an authoritative detail 404 creates a tombstone.
      const sub=idx.get(identity(record.body))?.find(x=>x.id===record.hostId)||await getIntent(ctx,record.hostId);
      await change(ctx,s=>{const r=s.records[key];if(!r||r.hostId!==record.hostId||r.status==='blocked')return;
        if(!sub){blockRecord(s,r,r.blockReason||'host-deleted');addLog(s,`「${r.work.title}」已从宿主删除，停止自动订阅`);}
        else adopt(s,r,sub);
      });
    }else if(['submitting','unknown','attention'].includes(record.status)){
      const matches=(idx.get(identity(record.body))||[]).filter(x=>sameIntent(x,record.body));
      if(matches.length===1)await change(ctx,s=>{const r=s.records[key];if(r&&!r.hostId&&['submitting','unknown','attention'].includes(r.status)){adopt(s,r,matches[0]);addLog(s,`已找回「${r.work.title}」的订阅回执`);}});
    }
  }
  await change(ctx,s=>{s.lastSync=Date.now();});return list;
}
export async function createSubscription(ctx,work,choice,{automatic=false,restore=false,list=null}={}){
  const cfg=await config(ctx);await ensureInstance(ctx,cfg.proxyId);
  if(automatic&&!cfg.auto)return {skipped:'自动订阅已暂停'};
  const body=await makeBody(ctx,work,choice,cfg.proxyId),key=identity(body),sk=sourceKey(work);
  const activeList=list||await reconcile(ctx),before=(await state(ctx)).value;
  if(isBlocked(before,work,key)&&!restore)return {skipped:'已停订；仅可手动恢复'};
  if(restore&&(automatic||before.records[key]?.status!=='blocked'))throw fault('只有已确认停订的记录可以手动恢复');
  const existingRecord=before.records[key];
  if(existingRecord&&existingRecord.status!=='blocked'){
    await change(ctx,s=>{const r=s.records[key];if(r&&!r.sourceKeys.includes(sk))r.sourceKeys.push(sk);});
    return {existing:true,record:existingRecord};
  }
  if(occupied(before)>=LIMIT)throw fault('已达到 120 条订阅上限（包含提交中及待核对记录）');
  const same=(activeList&&indexByIdentity(activeList).get(key))||[],existing=same.find(x=>sameIntent(x,body));
  if(same.length&&!existing)throw fault('该作品已在宿主使用其他或未明确的 Emby 实例订阅，请先在宿主核对');
  const snapshot=existing?{complete:false,body}:await librarySnapshot(ctx,body);
  await ctx.task.checkpoint({kind:'create',key});
  await change(ctx,s=>{
    if(occupied(s)>=LIMIT)throw fault('已达到 120 条订阅上限');
    if(isBlocked(s,work,key)&&!restore)throw fault('作品已停订');
    const old=s.records[key];if(old&&old.status!=='blocked')throw fault('该作品已存在，请刷新查看');
    if(restore){if(old?.status!=='blocked')throw fault('停订记录已变化');delete s.blocks[key];for(const alias of old.sourceKeys)delete s.blocks[alias];delete s.blocks[sk];}
    const r={key,work,sourceKeys:[...new Set([...(old?.sourceKeys||[]),sk])],body:snapshot.body,proxyId:cfg.proxyId,proxyName:cfg.proxyName,status:snapshot.complete?'complete':'prepared',createdAt:Date.now(),generation:(old?.generation||0)+1,hostId:null,error:'',automatic};
    s.records[key]=r;delete s.review[sk];if(existing)adopt(s,r,existing);
    if(snapshot.complete)addLog(s,`「${work.title}」已在固定 Emby 实例中，无需重复订阅`);
  });
  if(existing||snapshot.complete){await ctx.task.checkpoint({kind:'done',result:{key,existing:!!existing,complete:snapshot.complete}});return {key,existing:!!existing,complete:snapshot.complete};}
  const latest=await config(ctx);
  if(latest.proxyId!==cfg.proxyId||(automatic&&!latest.auto)){
    await change(ctx,s=>{const r=s.records[key];if(r?.status==='prepared'){if(restore)blockRecord(s,r,'restore-not-submitted');else delete s.records[key];}});throw fault('配置已改变，本次尚未提交，请重新操作');
  }
  // The reservation occupies a slot before crossing the external mutation boundary.
  await change(ctx,s=>{const r=s.records[key];if(r.status!=='prepared'||isBlocked(s,work,key))throw fault('订阅状态已变化');r.status='submitting';r.submittedAt=Date.now();});
  let result;
  try{
    result=await ctx.api.post('/api/subscribe/pool/intents',snapshot.body);
    if(result?.code!=='ok'||!Number.isSafeInteger(result.data?.id)||!sameIntent(result.data,snapshot.body))throw fault('宿主返回的订阅无法核对');
  }catch(e){
    await change(ctx,s=>{const r=s.records[key];r.status='unknown';r.error='提交结果未知，请核对宿主；不会自动重复提交';addLog(s,`「${work.title}」提交结果待核对`,'warning');});
    throw fault('订阅提交结果未知，已保留名额与检查点，请使用「核对」');
  }
  await change(ctx,s=>{adopt(s,s.records[key],result.data);addLog(s,`已订阅「${work.title}」至 ${cfg.proxyName||'固定 Emby'}`);});
  await ctx.task.checkpoint({kind:'done',result:{key,hostId:result.data.id}});return {key,hostId:result.data.id};
}
export async function stopSubscription(ctx,key){
  await reconcile(ctx);
  const record=(await state(ctx)).value.records[key];if(!record)throw fault('订阅不存在');if(record.status==='blocked')return {blocked:true};
  if(['unknown','submitting','attention'].includes(record.status)&&!record.hostId)throw fault('此订阅提交结果未知，先在宿主核对，不能释放名额或重发');
  await ctx.task.checkpoint({kind:'stop',key});
  await change(ctx,s=>{const r=s.records[key];blockRecord(s,r,'user-stopped');if(r.hostId)r.status='deleting';});
  if(record.hostId){
    try{const r=await ctx.api.delete(`/api/subscribe/pool/intents/${record.hostId}`);if(r?.code!=='ok')throw fault('删除结果无法确认');}
    catch(e){if(statusCode(e)!==404){await change(ctx,s=>{s.records[key].status='delete_unknown';s.records[key].error='停订已记住，宿主删除结果待核对';});throw fault('已阻止自动订阅，宿主删除结果待核对');}}
    const remaining=await getIntent(ctx,record.hostId);
    if(remaining){await change(ctx,s=>{s.records[key].status='delete_unknown';});throw fault('宿主订阅仍存在，请到宿主核对；停订标记已保留');}
  }
  await change(ctx,s=>{blockRecord(s,s.records[key],'user-stopped');addLog(s,`已停止订阅「${record.work.title}」`);});
  await ctx.task.checkpoint({kind:'done',result:{blocked:true}});return {blocked:true};
}
export async function recoverMutation(ctx,checkpoint){
  await reconcile(ctx);
  if(checkpoint?.kind==='done')return {action:'complete',result:checkpoint.result};
  const s=(await state(ctx)).value,r=s.records[checkpoint?.key];
  if(checkpoint?.kind==='create'&&r?.status==='prepared'){
    await change(ctx,x=>{const current=x.records[r.key];if(current?.status==='prepared'){if(current.generation>1)blockRecord(x,current,'restore-not-submitted');else delete x.records[r.key];}});
    return {action:'complete',result:{notSubmitted:true}};
  }
  if(r&&['active','complete','blocked'].includes(r.status))return {action:'complete',result:{key:r.key,status:r.status}};
  if(Object.values(s.records).some(x=>['submitting','unknown','attention','deleting','delete_unknown'].includes(x.status)))return {action:'attention'};
  return {action:'complete',result:{reconciled:true}};
}
