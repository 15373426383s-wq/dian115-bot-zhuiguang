export const LIMIT = 120;
export const FEEDS = {'douban-tv':'豆瓣剧集','douban-movie':'豆瓣电影','douban-soon':'豆瓣即将上映',bangumi:'Bangumi 新番'};
export const DEFAULT_CONFIG = {proxyId:null,proxyName:'',auto:false,intervalMinutes:60,feeds:{'douban-tv':true,'douban-movie':true,'douban-soon':true,bangumi:true},minScore:7,minVotes:0,yearFrom:new Date().getFullYear(),include:'',exclude:'',pageCount:2,minWish:5000,soonWindowDays:30};
export const initialState = () => ({version:1,records:{},blocks:{},catalog:{},review:{},logs:[],lastSync:0,lastAuto:0});
export const initialConfig = () => structuredClone(DEFAULT_CONFIG);
export const identity = x => `${x.media_type}:${Number(x.tmdb_id)}:${x.media_type==='movie'?0:Number(x.season)}`;
export const sourceKey = x => `${x.source}:${x.id}`;
export const slotUsed = r => !['blocked','complete'].includes(r.status);
export const occupied = s => Object.values(s.records).filter(slotUsed).length;
export const fault = message => new Error(message);
export function cleanError(e){return String(e?.data?.error||e?.response?.data?.error||e?.message||e||'操作失败').replace(/https?:\/\/[^\s]+/gi,'[远端地址]').slice(0,260);}
export const statusCode = e => Number(e?.status||e?.response?.status);
export const titleKey = s => String(s||'').normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'');
export function canonicalWork(raw){
  const source=raw?.source,id=String(raw?.id||'');
  if(!['douban','bangumi'].includes(source)||!/^\d+$/.test(id)||!String(raw.title||'').trim())throw fault('作品数据无效');
  return {...raw,id,source,title:String(raw.title).slice(0,300),originalTitle:String(raw.originalTitle||'').slice(0,300),mediaType:['movie','tv'].includes(raw.mediaType)?raw.mediaType:'tv',year:String(raw.year||'').slice(0,4),score:Number(raw.score)||0,votes:Number(raw.votes)||0,cover:safeCover(raw.cover),url:source==='douban'?`https://movie.douban.com/subject/${id}/`:`https://bgm.tv/subject/${id}`};
}
export function safeCover(value){try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return '';if(!(u.hostname==='lain.bgm.tv'||u.hostname==='image.tmdb.org'||/^(?:img\d*|img)\.doubanio\.com$/.test(u.hostname)))return '';u.protocol='https:';return u.href;}catch{return '';}}
export function normalizeConfig(raw){
  const c={...initialConfig(),...raw,feeds:{...DEFAULT_CONFIG.feeds,...raw.feeds}};
  if(c.proxyId!==null&&(!Number.isSafeInteger(c.proxyId)||c.proxyId<=0))throw fault('请选择具有独立 ID 的固定 Emby 实例');
  if(c.auto&&!c.proxyId)throw fault('启用自动追新前，请先选择固定 Emby 实例');
  if(!Number.isFinite(Number(c.minWish)))c.minWish=5000;
  if(!Number.isFinite(Number(c.soonWindowDays)))c.soonWindowDays=30;
  for(const [k,min,max] of [['minScore',0,10],['minVotes',0,1000000],['yearFrom',1900,2100],['intervalMinutes',15,1440],['pageCount',1,5],['minWish',0,1000000],['soonWindowDays',1,365]])if(!Number.isFinite(Number(c[k]))||Number(c[k])<min||Number(c[k])>max)throw fault('筛选设置超出范围');
  for(const k of ['minVotes','yearFrom','intervalMinutes','pageCount','minWish','soonWindowDays'])c[k]=Math.trunc(Number(c[k]));
  c.minScore=Number(c.minScore);c.auto=!!c.auto;c.include=String(c.include||'').slice(0,200);c.exclude=String(c.exclude||'').slice(0,200);c.proxyName=String(c.proxyName||'').slice(0,160);
  c.feeds=Object.fromEntries(Object.keys(FEEDS).map(k=>[k,!!c.feeds[k]]));return c;
}
export function eligible(work,c){
  const feed=work.feed||(work.source==='bangumi'?'bangumi':`douban-${work.mediaType}`);
  const text=[work.title,work.originalTitle,...(work.tags||[])].join(' ').toLowerCase();
  const words=s=>String(s||'').split(/[,，\n]/).map(x=>x.trim().toLowerCase()).filter(Boolean);
  // 即将上映的电影尚无评分/投票，跳过分数与投票门槛（年份与关键词仍生效）。
  const scoreOk=feed==='douban-soon'||work.score>=c.minScore;
  const votesOk=feed==='douban-soon'||work.votes>=c.minVotes;
  // 移植 honue「豆瓣即将播出」规则：按「想看人数阈值」+「上映窗口」筛选（评分/投票不适用）。
  let soonOk=true;
  if(feed==='douban-soon'){
    const wish=Number(work.wish)||0;
    const windowMs=Number(c.soonWindowDays||30)*86400000;
    const rel=Number(work.releaseAt)||0, now=Date.now();
    soonOk=wish>=Number(c.minWish||5000)&&rel>=now-86400000&&rel-now<=windowMs;
  }
  return !!c.feeds[feed]&&scoreOk&&votesOk&&soonOk&&Number(work.year)>=c.yearFrom&&(!words(c.include).length||words(c.include).some(x=>text.includes(x)))&&!words(c.exclude).some(x=>text.includes(x));
}
export function blockRecord(s,r,reason='host-deleted'){
  const stamp={at:Date.now(),reason,title:r.work.title,key:r.key};s.blocks[r.key]=stamp;
  for(const k of r.sourceKeys)s.blocks[k]=stamp;
  r.status='blocked';r.blockReason=reason;r.blockedAt=stamp.at;
}
export function isBlocked(s,work,key){return !!(s.blocks[sourceKey(work)]||(key&&s.blocks[key]));}
export function addLog(s,message,level='info'){ s.logs=[{at:Date.now(),message,level}].concat(Array.isArray(s.logs)?s.logs:[]).slice(0,100); }
