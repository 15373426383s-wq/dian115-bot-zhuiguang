import {canonicalWork,fault,FEEDS,sourceKey,cleanError,initialState} from './model.js';
import {change,read,mutate} from './store.js';
import {controlled,renderKey} from './httpx.js';
const UA='Zhuiguang/1.0.0 (DIAN115 trusted extension; public catalog reader)';

// 详情缓存：成功解析的作品持久化到插件 KV，TTL 内不重复抓取源站（核心风控手段）。
const DETAIL_TTL=6*60*60*1000;
const DETAIL_CAP=300;
let detailCache=null,detailDirty=false;
async function loadDetailCache(ctx){if(detailCache)return;try{const c=(await read(ctx,'detailCache',{})).value||{};detailCache=new Map(Object.entries(c));}catch{detailCache=new Map();}}
async function saveDetailCache(ctx){if(!detailCache||!detailDirty)return;const arr=[...detailCache.entries()].sort((a,b)=>b[1].expire-a[1].expire).slice(0,DETAIL_CAP);const obj={};for(const [k,v] of arr)obj[k]=v;await mutate(ctx,'detailCache',()=>obj,{});detailDirty=false;}
function getCachedDetail(sk){const e=detailCache?.get(sk);return e&&e.expire>Date.now()?e.work:null;}
function setCachedDetail(sk,work){if(!detailCache)detailCache=new Map();detailCache.set(sk,{expire:Date.now()+DETAIL_TTL,work});detailDirty=true;}

// 目录拉取冷却：自动轮在冷却期内复用上次快照，不重复打源站（默认 10 分钟）。
const FEED_COOLDOWN_MS=10*60*1000;

async function request(ctx,url,{json,...options}={}){
  const host=new URL(url).hostname;
  const key=(json?'P:':'G:')+url+(json?':'+JSON.stringify(json):'');
  const r=await controlled(ctx,host,key,()=>ctx.http.request({url,method:json?'POST':'GET',...(json?{json}:{}),headers:{'User-Agent':url.includes('douban.com')?'Mozilla/5.0':UA,Accept:'application/json,text/html;q=0.9',...(url.includes('douban.com')?{Referer:'https://movie.douban.com/'}:{})},timeout_seconds:25,max_bytes:3*1024*1024,cache_seconds:30,session:'public-catalog',...options}));
  if(r.status!==200)throw fault(`来源返回 HTTP ${r.status}，请稍后刷新`);
  if(r.url&&new URL(r.url).hostname!==host)throw fault('来源跳转至验证页面，请稍后刷新');
  return r;
}
function data(r){try{return r.data??JSON.parse(r.body);}catch{throw fault('来源返回的内容无法解析，保留上次数据');}}
export function parseDoubanList(d,mediaType){
  if(!Array.isArray(d?.subjects))throw fault('豆瓣列表结构已变化，保留上次数据');
  return d.subjects.map(x=>canonicalWork({source:'douban',id:x.id,title:x.title,mediaType,score:x.rate,cover:x.cover,year:x.year||'',progress:x.episodes_info||'',votes:0,summary:'',tags:[]}));
}
export function parseBangumiSubject(x,weekday=0){
  if(x.type!==2)throw fault('Bangumi 条目不是动画');
  return canonicalWork({source:'bangumi',id:x.id,title:x.name_cn||x.name,originalTitle:x.name,mediaType:x.platform==='剧场版'?'movie':'tv',year:String(x.date||x.air_date||'').slice(0,4),airDate:x.date||x.air_date||'',weekday:weekday||x.air_weekday||0,score:x.rating?.score,votes:x.rating?.total,cover:x.images?.large||x.images?.common,summary:x.summary||'',episodes:x.total_episodes||x.eps||0,tags:(x.tags||[]).slice(0,12).map(t=>t.name),detailed:!!x.platform});
}
export function parseCalendar(d){
  if(!Array.isArray(d)||d.length!==7||new Set(d.map(x=>x.weekday?.id)).size!==7||d.some(x=>!Array.isArray(x.items)||x.weekday.id<1||x.weekday.id>7))throw fault('Bangumi 日历结构无效，保留上次数据');
  return d.flatMap(day=>day.items.filter(x=>x.type===2).map(x=>parseBangumiSubject(x,day.weekday.id)));
}
// 豆瓣“即将上映”页（cinema/later/beijing/）解析：与详情页共用 UA/Referer/缓存容错。
// 即将上映的电影尚无评分与投票，按 honue「豆瓣即将播出」规则改取：上映日月（计算上映窗口）、
// 「想看人数」（阈值筛选）与封面；年份用于 TMDB 匹配与年份门槛。
// 注意：ctx.html.load() 返回 HTMLSelection（find/toArray/map…），不可当作 Cheerio 的 $ 直接调用。
const SOON_DATE_RE=/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]/;
const SOON_WISH_RE=/([\d.]+)\s*(万)?\s*人想看/;
// 「想看人数」既可能是 449 人，也可能是 1.2 万人，统一折算成人数。
export function parseWish(text){
  const m=String(text||'').match(SOON_WISH_RE);
  if(!m)return 0;
  const n=Number(m[1]);
  if(!Number.isFinite(n))return 0;
  return Math.round(m[2]?n*10000:n);
}
// 从上映文字推出月份/日期与上映年份（跨年时自动落到下一年）。
export function parseSoonDate(text,now=new Date()){
  const m=String(text||'').match(SOON_DATE_RE);
  if(!m)return {month:0,day:0,year:'',releaseAt:0};
  const month=Number(m[1]),day=Number(m[2]);
  if(!month||!day||month>12||day>31)return {month:0,day:0,year:'',releaseAt:0};
  const thisYear=now.getFullYear(),thisMonth=now.getMonth()+1;
  const year=month<thisMonth?thisYear+1:thisYear;
  return {month,day,year:String(year),releaseAt:new Date(year,month-1,day).getTime()};
}
export function parseDoubanSoon(ctx,html){
  const root=ctx.html.load(html,{baseURL:'https://movie.douban.com/'});
  const seen=new Map();
  // 真实结构：#showing-soon > .item；片名 h3 a，上映日为首个 li.dt，想看数在 li.dt.last 的 span 内。
  // 只用 length/eq 遍历：宿主 HTMLSelection 与 cheerio 语义一致，toArray 的元素类型两者不同。
  const picked=[];
  const collect=sel=>{for(let i=0;i<sel.length;i++)picked.push(sel.eq(i));};
  let sel=root.find('#showing-soon .item');
  if(!sel.length)sel=root.find('.show-list .list-item');
  if(sel.length)collect(sel);
  else{
    // 兜底：结构变化时按 subject 链接回溯所属条目。
    const anchors=root.find('a[href*="/subject/"]');
    for(let i=0;i<anchors.length;i++){const item=anchors.eq(i).closest('.item');if(item.length)picked.push(item);}
  }
  for(const node of picked){
    const link=node.find('a[href*="/subject/"]').first();
    const m=(link.attr('href')||'').match(/\/subject\/(\d+)/);
    if(!m)continue;
    const id=m[1];
    if(seen.has(id))continue;
    const title=(node.find('h3 a').first().text().trim())||link.text().trim();
    if(!title)continue;
    const text=node.text()||'';
    const dateText=node.find('li.dt').first().text()||'';
    const {year,releaseAt}=parseSoonDate(dateText.match(SOON_DATE_RE)?dateText:text);
    const wish=parseWish(text);
    const img=node.find('img').first().attr('src')||'';
    seen.set(id,canonicalWork({source:'douban',id,title,mediaType:'movie',feed:'douban-soon',year,score:0,votes:0,wish,releaseAt,cover:img,tags:[]}));
  }
  if(!seen.size)throw fault('豆瓣即将上映页面结构已变化，保留上次数据');
  return [...seen.values()];
}
export async function loadFeed(ctx,feed,pageCount=2){
  if(!(feed in FEEDS))throw fault('未知来源');
  let items=[];
  if(feed==='bangumi')items=parseCalendar(data(await request(ctx,'https://api.bgm.tv/calendar')));
  else if(feed==='douban-soon'){const r=await request(ctx,'https://movie.douban.com/cinema/later/beijing/',{response_type:'text'});items=parseDoubanSoon(ctx,r.body);}
  else for(let page=0;page<Math.max(1,Math.min(5,pageCount));page++){
    const q=new URLSearchParams({type:feed==='douban-tv'?'tv':'movie',tag:'热门',sort:'recommend',page_limit:'50',page_start:String(page*50)});
    const batch=parseDoubanList(data(await request(ctx,'https://movie.douban.com/j/search_subjects?'+q)),feed==='douban-tv'?'tv':'movie');
    items.push(...batch);if(batch.length<50)break;await ctx.sleep(350);
  }
  items=[...new Map(items.map(w=>[sourceKey(w),w])).values()];
  const result={items,at:Date.now(),error:'',mode:'snapshot'};
  await change(ctx,s=>{s.catalog[feed]=result;});return result;
}
// force=true（UI 手动刷新）忽略冷却；自动轮传 false，冷却期内复用快照。
export async function refreshCatalog(ctx,feeds,pageCount=2,{force=false}={}){
  const results={};
  let st=null;
  if(!force){try{st=(await read(ctx,'state',initialState())).value;}catch{}}
  for(const feed of feeds){
    if(!force&&st?.catalog?.[feed]?.at&&Date.now()-st.catalog[feed].at<FEED_COOLDOWN_MS){results[feed]=st.catalog[feed];continue;}
    try{results[feed]=await loadFeed(ctx,feed,pageCount);}
    catch(e){const error=cleanError(e);await change(ctx,s=>{s.catalog[feed]={...(s.catalog[feed]||{items:[],at:0,mode:'snapshot'}),error};});results[feed]={error};}
  }
  return results;
}
export function parseDoubanDetail(ctx,html,work){
  const $=ctx.html.load(html,{baseURL:work.url}),heading=$.find('h1').text().trim();
  if(!heading||!$.find('#info').length)throw fault('豆瓣详情不可用，可能需要稍后重试');
  let ld={};
  for(const node of $.find('script[type="application/ld+json"]').toArray()){
    try{const candidate=JSON.parse(node.text().replace(/[\u0000-\u001f]/g,' '));if(candidate['@type']==='Movie'||candidate['@type']==='TVSeries')ld=candidate;}catch{/* HTML fields below remain authoritative. */}
  }
  const info=$.find('#info').text(),imdb=info.match(/IMDb\s*:\s*(tt\d+)/i)?.[1]||'';
  const year=$.find('h1 .year').text().match(/\d{4}/)?.[0]||String(ld.datePublished||'').slice(0,4);
  const title=$.find('h1 [property="v:itemreviewed"]').text().trim()||work.title;
  const votes=Number($.find('[property="v:votes"]').text())||Number(ld.aggregateRating?.ratingCount)||0;
  const score=Number($.find('[property="v:average"]').text())||Number(ld.aggregateRating?.ratingValue)||0;
  const mediaType=ld['@type']==='TVSeries'||/集数\s*:/.test(info)?'tv':ld['@type']==='Movie'?'movie':work.mediaType;
  return canonicalWork({...work,title:work.title,originalTitle:title,mediaType,unknownType:false,year,imdb,score,votes,summary:$.find('[property="v:summary"]').text().trim().slice(0,4000),tags:$.find('[property="v:genre"]').toArray().map(x=>x.text()),detailed:true});
}
export async function loadDetail(ctx,raw){
  const work=canonicalWork(raw);
  if(work.detailed)return work;            // 已经是完整详情（如复核记录里存的），无需再抓源站
  if(work.feed==='douban-soon'){
    // 即将上映：列表已含上映年月与类型，跳过详情页抓取，降低豆瓣访问压力（风控友好）。
    return canonicalWork({...work,detailed:true});
  }
  const sk=sourceKey(work);
  const cached=getCachedDetail(sk);
  if(cached)return cached;                 // 命中 6h 详情缓存，彻底跳过对外请求
  let parsed;
  if(work.source==='bangumi'){
    const d=data(await request(ctx,`https://api.bgm.tv/v0/subjects/${work.id}`));if(String(d.id)!==work.id)throw fault('Bangumi 返回了不同的作品');
    parsed=parseBangumiSubject(d,work.weekday);
  }else{
    const r=await request(ctx,work.url,{response_type:'text'});
    try{parsed=parseDoubanDetail(ctx,r.body,work);}
    catch(e){
      if(!/id=["']sec["']|载入中|验证码/.test(r.body))throw e;
      const id=ctx.id||ctx.plugin.id;
      const capabilities=await ctx.api.get(`/api/extensions/v3/${id}/network-capabilities`);
      if(!capabilities.render_configured)throw fault('豆瓣详情返回验证页，自动订阅暂停；可手动核对 TMDB 后订阅');
      // 渲染极重且最易风控：走专项限速 + 单飞，且结果同样进入详情缓存。
      const rendered=await controlled(ctx,'__render__',renderKey(work.url),()=>ctx.http.render({url:work.url,session:'public-catalog',timeout_seconds:60}));
      parsed=parseDoubanDetail(ctx,rendered.html,work);
    }
  }
  setCachedDetail(sk,parsed);
  return parsed;
}
export async function searchCatalog(ctx,source,query){
  if(!query.trim()||query.length>100)throw fault('请输入 1–100 字的片名');
  if(source==='bangumi'){
    const d=data(await request(ctx,'https://api.bgm.tv/v0/search/subjects?limit=20&offset=0',{json:{keyword:query.trim(),sort:'match',filter:{type:[2],nsfw:false}}}));
    if(!Array.isArray(d.data))throw fault('Bangumi 搜索结构无效');return d.data.map(x=>parseBangumiSubject(x));
  }
  const d=data(await request(ctx,'https://movie.douban.com/j/subject_suggest?q='+encodeURIComponent(query.trim())));
  if(!Array.isArray(d))throw fault('豆瓣搜索结构无效');
  // Suggestions don't contain an authoritative movie/TV classification: resolve it from detail below.
  return d.filter(x=>/^\d+$/.test(String(x.id))).map(x=>canonicalWork({source:'douban',id:x.id,title:x.title,originalTitle:x.sub_title,year:x.year,cover:x.img,mediaType:'tv',unknownType:true}));
}
export {loadDetailCache,saveDetailCache};
