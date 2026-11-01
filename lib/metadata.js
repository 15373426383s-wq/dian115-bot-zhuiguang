import {fault,titleKey,identity} from './model.js';
export async function instances(ctx){const r=await ctx.api.get('/api/plugin-host/emby/instances');if(!Array.isArray(r.items))throw fault('无法读取 Emby 实例');return r.items;}
export async function ensureInstance(ctx,id){
  if(!Number.isSafeInteger(id)||id<=0)throw fault('请先选择固定 Emby 实例；不使用动态默认实例');
  const found=(await instances(ctx)).find(x=>x.id===id&&x.api_key_configured);if(!found)throw fault('固定 Emby 实例已停用或未配置，订阅已暂停');return found;
}
export async function tmdbDetail(ctx,type,id){
  if(!['movie','tv'].includes(type)||!Number.isSafeInteger(Number(id))||Number(id)<=0)throw fault('TMDB 选择无效');
  const d=await ctx.api.get(`/api/tmdb/${type}/${Number(id)}`);if(Number(d?.id)!==Number(id))throw fault('TMDB 返回了不一致的媒体');return d;
}
export async function matchCandidates(ctx,work,query=''){
  const q=query||work.title;
  const r=await ctx.api.get('/api/tmdb/search?q='+encodeURIComponent(q)+'&page=1');
  if(!Array.isArray(r.results))throw fault('TMDB 搜索结果无效');
  return r.results.filter(x=>['movie','tv'].includes(x.media_type)&&(work.unknownType||x.media_type===work.mediaType)).slice(0,16).map(x=>({...x,year:String(x.release_date||x.first_air_date||'').slice(0,4),exact:[x.title,x.name,x.original_title,x.original_name].some(t=>t&&[work.title,work.originalTitle].some(w=>titleKey(w)===titleKey(t)))}));
}
export async function automaticMatch(ctx,work){
  if(work.unknownType)return null;
  const matches=(await matchCandidates(ctx,work)).filter(x=>x.exact&&x.year===work.year);
  if(matches.length!==1)return null;
  const x=matches[0],d=await tmdbDetail(ctx,x.media_type,x.id);
  const imdb=d.imdb_id||d.external_ids?.imdb_id;
  if(work.imdb&&imdb&&work.imdb!==imdb)return null;
  // A Bangumi subject can be a cour or a sequel. Multiple TMDB seasons always need a manual choice.
  const seasons=(d.seasons||[]).filter(s=>s.season_number>0);
  if(x.media_type==='tv'&&(seasons.length!==1||String(seasons[0].air_date||'').slice(0,4)!==work.year))return null;
  return {tmdbId:x.id,mediaType:x.media_type,season:x.media_type==='movie'?0:seasons[0].season_number};
}
export async function makeBody(ctx,work,choice,proxyId){
  const d=await tmdbDetail(ctx,choice.mediaType,choice.tmdbId),season=choice.mediaType==='movie'?0:Number(choice.season);
  if(!work.unknownType&&choice.mediaType!==work.mediaType)throw fault('媒体类型不一致，请重新匹配');
  if(!Number.isInteger(season)||season<0||season>1000)throw fault('请选择准确的季数');
  const imdb=d.imdb_id||d.external_ids?.imdb_id;if(work.imdb&&imdb&&work.imdb!==imdb)throw fault('IMDb 标识不一致，已阻止错误订阅');
  const part=(d.seasons||[]).find(s=>s.season_number===season);
  if(choice.mediaType==='tv'&&!part)throw fault('TMDB 没有此季，请重新选择');
  return {tmdb_id:Number(d.id),media_type:choice.mediaType,title:d.title||d.name,year:String(d.release_date||d.first_air_date||'').slice(0,4),poster_path:d.poster_path||'',backdrop_path:d.backdrop_path||'',season,total_episodes:choice.mediaType==='tv'?Number(part.episode_count)||0:0,episode_scope_mode:'follow',proxy_id:proxyId};
}
export async function librarySnapshot(ctx,body){
  await ensureInstance(ctx,body.proxy_id);
  if(body.media_type==='tv'){
    const q=new URLSearchParams({proxy_id:String(body.proxy_id),tmdb_id:String(body.tmdb_id),season:String(body.season),total_episodes:String(body.total_episodes)});
    const r=await ctx.api.get('/api/plugin-host/emby/episodes?'+q);
    if(r.proxy_id!==body.proxy_id||Number(r.tmdb_id)!==body.tmdb_id||r.season!==body.season||typeof r.covered_episodes!=='string'||typeof r.needed_episodes!=='string'||typeof r.complete!=='boolean')throw fault('Emby 缺集快照无法核对，暂停提交');
    // Follow subscriptions still need to exist when the currently known episodes are all present.
    return {complete:false,body:{...body,library_snapshot_provided:true,initial_covered_episodes:r.covered_episodes,initial_needed_episodes:r.needed_episodes}};
  }
  for(let offset=0;offset<1000;offset+=50){
    const q=new URLSearchParams({proxy_id:String(body.proxy_id),q:body.title,type:'Movie',limit:'50',offset:String(offset)});
    const r=await ctx.api.get('/api/plugin-host/emby/items?'+q);
    if(!Array.isArray(r.items)||!Number.isInteger(r.total)||r.items.some(x=>x.proxy_id!==body.proxy_id))throw fault('Emby 电影快照无法核对');
    if(r.items.some(x=>x.type==='Movie'&&Object.entries(x.provider_ids||{}).some(([k,v])=>k.toLowerCase()==='tmdb'&&String(v)===String(body.tmdb_id))))return {complete:true,body};
    // A title search can prove a positive TMDB match, but cannot prove absence under another title.
    // Leave the authoritative movie-library check to the host, with the same explicit proxy_id.
    if(offset+r.items.length>=r.total)return {complete:false,body:{...body,library_snapshot_provided:false}};
    if(r.items.length<50)throw fault('Emby 列表未完整返回，保留现状');
  }
  throw fault('Emby 查询超过分页上限，请缩小媒体库匹配范围');
}
export function sameIntent(sub,body){return identity(sub)===identity(body)&&Number(sub.proxy_id)===body.proxy_id;}
