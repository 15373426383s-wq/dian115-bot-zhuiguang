// 追光 · 豆瓣即将上映 / Bangumi 新番 —— DIAN115 页面插件（干净重写）
// 修复：① 发现页勾选 + 批量订阅（原压缩包无此能力，导致“勾选后点击保存无效”）
//       ② 封面统一走宿主代理并加占位兜底（修复“图片显示不全”）
//       ③ 规则页清晰开启自动追新，并提供“立即追新”手动触发（修复“没自动订阅”）
// 后端契约保持不变：storage(state/config) + tasks.run(browse/engine) + plugin-host/emby + tmdb。

const FEEDS = {'douban-tv':'豆瓣剧集','douban-movie':'豆瓣电影','douban-soon':'豆瓣即将上映',bangumi:'Bangumi 新番'};
const WEEKDAYS = ['周一','周二','周三','周四','周五','周六','周日'];
const STATUS_NAMES = {prepared:'待提交',submitting:'正在提交',unknown:'结果待核对',active:'追更中',complete:'已入库',blocked:'已停订',attention:'需人工核对',deleting:'正在停订',delete_unknown:'删除待核对'};
const JOB_NAMES = {browse:'发现与媒体匹配', engine:'追新订阅与核对'};
const TASK_STATES = {queued:'排队中', running:'运行中', succeeded:'成功', failed:'失败', cancelled:'已取消', attention_required:'需核对'};
const HOST_NAMES = {pending:'等待资源',searching:'搜索资源',transferring:'转存中',partial:'部分入库',caught_up:'已追平',landed:'已入库',failed:'等待处理',expired:'已结束'};
const DEFAULT_CONFIG = ()=>({proxyId:null,proxyName:'',auto:false,intervalMinutes:60,feeds:{'douban-tv':true,'douban-movie':true,'douban-soon':true,bangumi:true},minScore:7,minVotes:0,yearFrom:new Date().getFullYear(),include:'',exclude:'',pageCount:2,minWish:5000,soonWindowDays:30});
const INITIAL_STATE = ()=>({version:1,records:{},blocks:{},catalog:{},review:{},logs:[],lastSync:0,lastAuto:0});
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
// 宿主的 HTTP 错误有时只带 message（"Request failed with status code 400"），故两种都认。
function errStatus(e){
  if(!e) return 0;
  const direct = e.status || (e.response&&e.response.status) || (e.response&&e.response.data&&e.response.data.status);
  if(Number.isFinite(Number(direct)) && Number(direct)>=100) return Number(direct);
  const m = /status code (\d{3})/i.exec(String(e.message||e));
  return m?Number(m[1]):0;
}
function humanError(e){
  const msg = (e&&e.message)||String(e);
  const st = errStatus(e);
  if(st===401||st===403) return '登录状态已失效，请刷新宿主页面后重试';
  if(st===404) return '宿主接口不存在（插件与宿主版本可能不匹配），请刷新页面重试';
  if(st===409) return '数据刚被其他页面改过，请刷新后重试';
  if(st===429) return '操作太频繁，宿主暂时限流，请等几秒再试';
  if(st>=500) return `宿主内部错误（HTTP ${st}），请稍后重试`;
  if(st>=400) return `宿主拒绝了这次请求（HTTP ${st}）。先刷新页面重试；仍失败请到「记录」查看最近任务。`;
  return msg;
}

function el(tag, props, children){
  const n = document.createElement(tag);
  if(props) for(const k in props){
    const v = props[k];
    if(k==='class') n.className = v;
    else if(k==='text') n.textContent = v;
    else if(k==='html') n.innerHTML = v;
    else if(k==='disabled') n.disabled = !!v;
    // checked / selected / value 必须走 property：setAttribute('checked', false) 会把属性设成字符串
    // "false"，而布尔属性只要出现就算真 —— 结果每一张卡片的勾选框都被渲染成已勾选。
    else if(k==='checked'||k==='selected') n[k] = !!v;
    else if(k==='value') n.value = v==null?'':v;
    else if(k.startsWith('on') && typeof v==='function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if(v!=null) n.setAttribute(k, v);
  }
  if(children!=null) (Array.isArray(children)?children:[children]).forEach(c=>{
    if(c==null) return;
    n.append(c.nodeType?c:document.createTextNode(String(c)));
  });
  return n;
}
function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); return node; }
function fmtTime(t){ return t? new Date(t).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'尚未同步'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

export async function mount(root, ctx){
  let disposed = false;
  const pid = ctx.id || (ctx.plugin&&ctx.plugin.id);
  const storePath = (key)=>`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIContentType(key)}`;
  function encodeURIContentType(k){ return encodeURIComponent(k); }

  // ---- 存储 ----
  async function apiGet(key, fallback){
    let r;
    try{ r = await ctx.api.get(`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIComponent(key)}`); }
    catch(e){
      // 首次安装 / 卸载重装后存储键还不存在，宿主会用 4xx 表达“没有这个键”。
      // 这不是故障，按“还没有值”处理，否则整页会被顶成一条红色报错。
      const st = errStatus(e);
      if(st===404) return { value: structuredClone(fallback!=null?fallback:null), revision:0 };
      throw e;
    }
    if(!r || typeof r.revision!=='number') throw new Error('插件存储响应无效');
    return { value: r.value!=null?r.value:structuredClone(fallback!=null?fallback:null), revision: r.revision };
  }
  async function apiPut(key, fn, fallback){
    for(let i=0;i<8;i++){
      const cur = await apiGet(key, fallback);
      const out = fn(cur.value);
      try{ await ctx.api.put(`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIComponent(key)}`, {value:out, expected_revision:cur.revision}); return out; }
      catch(e){ if(errStatus(e)!==409) throw e; }
    }
    throw new Error('保存遇到并发冲突（可能有另一个页面同时修改），请刷新后重试');
  }

  // ---- 任务 ----
  async function runTask(jobId, input, runId){
    // 宿主签名是 tasks.run(job, business_key, input)：第二参是稳定业务键，第三参才是任务载荷。
    const key = runId || `${jobId}:${input&&input.action||'run'}:${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let task = await ctx.tasks.run(jobId, key, input);
    const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
    for(let guard=0; guard<600 && !disposed; guard++){
      if(['succeeded','failed','cancelled','attention_required'].includes(task.status)) break;
      await wait(650);
      task = await ctx.tasks.get(task.id);
    }
    if(disposed) throw new Error('页面已关闭');
    if(task.status!=='succeeded') throw new Error(task.status==='attention_required'?'任务需要核对，请在运行记录中恢复核对':(task.error||task.message||'任务未完成'));
    return task.result;
  }

  // ---- 封面代理（统一走宿主，并发受限，避免防盗链导致“图片显示不全”也避免打爆宿主） ----
  const _imgCache = new Map();   // url -> dataUrl（只存成功结果）
  const _imgWait = new Map();    // url -> [apply...]（同一地址的重渲染复用一次请求）
  const _imgTries = new Map();   // url -> 已失败次数（失败不写缓存，给后续重试机会）
  const _imgQueue = []; let _imgActive = 0; const IMG_CONC = 4;
  // 所有封面都必须经过队列：直接并发请求会被宿主代理限流，表现就是“图片显示不全”。
  function enqueueCover(url, apply){
    if(!url || disposed) return;
    if(_imgCache.has(url)){ apply(_imgCache.get(url)); return; }
    if(_imgWait.has(url)){ _imgWait.get(url).push(apply); return; }
    _imgWait.set(url, [apply]); _imgQueue.push(url); pumpCovers();
  }
  function pumpCovers(){
    while(_imgActive < IMG_CONC && _imgQueue.length){
      const url = _imgQueue.shift(); _imgActive++;
      doProxy(url).then(d=>{
        if(d){
          _imgCache.set(url, d); _imgTries.delete(url);
          const waiting = _imgWait.get(url) || []; _imgWait.delete(url);
          if(!disposed) waiting.forEach(fn=>{ try{ fn(d); }catch(e){} });
          return;
        }
        // 失败不写缓存：原先把 null 缓存下来，订阅页复用同一地址时会直接放弃，图就永远空白。
        const tries = (_imgTries.get(url)||0) + 1; _imgTries.set(url, tries);
        if(tries < 3 && !disposed){ _imgQueue.push(url); return; }
        const waiting = _imgWait.get(url) || []; _imgWait.delete(url); _imgTries.delete(url);
        if(!disposed) waiting.forEach(fn=>{ try{ fn(null); }catch(e){} });
      }).finally(()=>{ _imgActive--; pumpCovers(); });
    }
  }
  // 后端给的是大图（Bangumi images.large / 豆瓣 l_ratio_poster），单张常超宿主代理上限而整批失败。
  // 卡片尺寸只需要中图，降级后体积降到几十分之一，既快又不会触发 max_bytes。
  function shrinkCover(url){
    if(!url) return url;
    return String(url)
      .replace('/pic/cover/l/', '/pic/cover/c/')
      .replace('/view/photo/l_ratio_poster/', '/view/photo/m_ratio_poster/')
      .replace('/view/photo/l/public/', '/view/photo/m/public/');
  }
  // 豆瓣图片同一 path 在多个 img 节点、多种尺寸规格下等价。
  // 宿主出口偶尔被某个 CDN 节点要求验证（返回 200 + text/html），换节点/换规格基本都能拿到真图。
  function coverVariants(rawUrl){
    const base = shrinkCover(rawUrl);
    const list = [base];
    const host = /^(https?:\/\/)img\d\.doubanio\.com\/(.+)$/.exec(base);
    if(host){ ['1','2','3'].forEach(n=>list.push(`${host[1]}img${n}.doubanio.com/${host[2]}`)); }
    const ratio = base.match(/\/view\/photo\/[sml]_ratio_poster\//);
    if(ratio){ ['m','l'].forEach(c=>list.push(base.replace(ratio[0], `/view/photo/${c}_ratio_poster/`))); }
    const sized = base.match(/\/pic\/cover\/[csml]\//);
    if(sized){ ['c','m','l'].forEach(c=>list.push(base.replace(sized[0], `/pic/cover/${c}/`))); }
    return [...new Set(list)];
  }
  async function doProxy(rawUrl){
    const referer = String(rawUrl).includes('doubanio.com') ? 'https://movie.douban.com/' : 'https://bgm.tv/';
    const variants = coverVariants(rawUrl);
    for(let vi=0; vi<variants.length; vi++){
      if(disposed) return null;
      const url = variants[vi];
      for(let attempt=0; attempt<2; attempt++){
        try{
          const r = await ctx.http.request({url, headers:{Referer:referer,'User-Agent':'Mozilla/5.0'}, response_type:'base64', timeout_seconds:20, max_bytes:6*1024*1024, cache_seconds:86400, session:'public-covers'});
          const ct = pickContentType(r);
          if(r.status===200 && /^image\//.test(ct) && r.body_base64) return `data:${ct};base64,${r.body_base64}`;
        }catch(e){}
        await sleep(200*(attempt+1));
      }
    }
    return null;
  }
  function pickContentType(r){
    const h = r&&r.headers; if(!h) return '';
    const entry = Array.isArray(h)?h.find(([k])=>String(k).toLowerCase()==='content-type'):h['content-type']||h['Content-Type'];
    const v = Array.isArray(entry)?entry[0]:entry;
    return String(v||'').split(';')[0];
  }
  function attachCover(posterWrap, url){
    const img = posterWrap.querySelector('.poster-img');
    const fb = posterWrap.querySelector('.poster-fallback');
    // 用透明度而不是 hidden 切换：display:none 会让浏览器永远不加载这张图，onload 也就永远不会来。
    const fail = ()=>{ if(img){ img.classList.remove('ready'); img.removeAttribute('src'); } if(fb) fb.classList.remove('hidden'); };
    if(!url){ fail(); return; }
    enqueueCover(url, dataUrl=>{
      if(!img || !dataUrl){ fail(); return; }
      img.onload = ()=>{ img.classList.add('ready'); if(fb) fb.classList.add('hidden'); };
      img.onerror = fail;
      img.src = dataUrl;
    });
  }

  // ---- 配置校验（与后端 normalizeConfig 对齐） ----
  // 字段级校验：一次性收集所有问题，指明是哪一项、允许范围、当前值。
  const CONFIG_RULES = [
    ['minScore','最低评分',0,10,'float'],
    ['minVotes','最低投票数',0,1000000,'int'],
    ['yearFrom','起始年份',1900,2100,'int'],
    ['intervalMinutes','检查间隔（分钟）',15,1440,'int'],
    ['pageCount','豆瓣片单读取页数',1,5,'int'],
    ['minWish','即将上映·想看人数阈值',0,1000000,'int'],
    ['soonWindowDays','即将上映·上映窗口(天)',1,365,'int']
  ];
  function validateConfig(raw){
    const base = DEFAULT_CONFIG();
    const c = Object.assign({}, base, raw||{}, {feeds:Object.assign({}, base.feeds, (raw&&raw.feeds)||{})});
    const issues = [];
    CONFIG_RULES.forEach(([key,label,min,max,kind])=>{
      const rawV = c[key];
      const n = (rawV===''||rawV===null||rawV===undefined)?NaN:Number(rawV);
      if(!Number.isFinite(n)){ issues.push({key,msg:`${label}需要填写数字（${min}–${max}）`}); c[key]=base[key]; return; }
      if(n<min||n>max){ issues.push({key,msg:`${label}需在 ${min}–${max} 之间，你填的是 ${n}`}); c[key]=base[key]; return; }
      c[key] = kind==='int' ? Math.trunc(n) : n;
    });
    c.proxyId = (c.proxyId==null||c.proxyId==='') ? null : Number(c.proxyId);
    if(c.proxyId!==null && (!Number.isSafeInteger(c.proxyId)||c.proxyId<=0)){ issues.push({key:'proxyId',msg:'请选择具有独立 ID 的固定 Emby 实例'}); c.proxyId=null; }
    c.auto = !!c.auto;
    if(c.auto && !c.proxyId) issues.push({key:'auto',msg:'启用自动追新前，请先选择固定 Emby 实例'});
    c.include=String(c.include||'').slice(0,200); c.exclude=String(c.exclude||'').slice(0,200); c.proxyName=String(c.proxyName||'').slice(0,160);
    c.feeds=Object.fromEntries(Object.keys(FEEDS).map(k=>[k,!!c.feeds[k]]));
    return {value:c, issues};
  }
  function normalizeConfig(raw){ const r=validateConfig(raw); if(r.issues.length) throw new Error(r.issues.map(i=>i.msg).join('；')); return r.value; }

  // ---- 应用状态 ----
  const S = {
    tab:'discover', config:DEFAULT_CONFIG(), db:INITIAL_STATE(), emby:[], runs:[],
    feed:'all', query:'', searchSource:'douban', sort:'default', remote:null, weekday:0,
    busy:false, error:'', toast:'', lastFetch:0, sourceErrors:[],
    selection:new Set(), // 发现页勾选的作品 sourceKey 集合
    detail:null, candidates:[], matchQuery:'', seasons:[], season:0, notice:'', restore:false,
    confirmStop:null, dialogOpen:false, dirty:false, fieldErrors:{},
  };

  // ---- 数据加载 ----
  async function loadConfig(){ S.config = await apiGet('config', DEFAULT_CONFIG()).then(r=>{ S.dirty=false; return r.value; }); }
  async function loadDb(){ S.db = (await apiGet('state', INITIAL_STATE())).value; }
  async function loadEmby(){ const r = await ctx.api.get('/api/plugin-host/emby/instances'); if(!Array.isArray(r.items)) throw new Error('Emby 实例列表无效'); S.emby = r.items; }
  async function loadRuns(){ S.runs = await ctx.tasks.list(20); }
  async function loadAll(){ await loadConfig(); await loadDb(); try{ await loadEmby(); }catch(e){} try{ await loadRuns(); }catch(e){} if(!Object.keys(S.db.catalog).length) await refreshCatalog(); }

  async function refreshCatalog(){
    S.remote=null;
    await runTask('browse', S.feed==='all'?{}:{feed:S.feed}, `browse:refresh:${Date.now()}`);
    await loadDb();
    S.lastFetch = Math.max(0, ...Object.values(S.db.catalog).map(v=>v.at||0));
    S.sourceErrors = Object.entries(S.db.catalog).filter(([k,v])=>v.error && (S.feed==='all'||S.feed===k)).map(([k,v])=>`${FEEDS[k]}：${v.error}`);
    rerenderTab();
  }
  async function searchCatalog(){
    if(!S.query.trim()){ S.remote=null; rerenderTab(); return; }
    const r = await runTask('browse', {action:'search', source:S.searchSource, query:S.query.trim()}, `browse:search:${Date.now()}`);
    S.remote = r.items||[]; rerenderTab();
  }
  async function openWork(work){
    S.detail = work; S.candidates=[]; S.matchQuery=work.title; S.seasons=[]; S.season=0; S.restore=false; S.confirmStop=null;
    // 先立刻弹出对话框再等匹配：否则 TMDB 查询要几秒，用户会以为“点了没反应”。
    S.dialogOpen=true; S.notice='正在匹配 TMDB，请稍候…'; rerenderDialog();
    try{
      const m = await runTask('browse', {action:'match', work}, `browse:match:${Date.now()}`);
      S.detail = m.work||work; S.candidates = m.candidates||[]; S.notice = m.notice||'';
    }catch(e){ S.notice = (e&&e.message)||'匹配失败'; }
    rerenderDialog();
  }
  async function rematch(){
    const m = await runTask('browse', {action:'match', work:S.detail, query:S.matchQuery}, `browse:match:${Date.now()}`);
    S.candidates = m.candidates||[]; S.notice = m.notice||''; rerenderDialog();
  }
  async function chooseTmdb(cand){
    S.season=0; S.seasons=[];
    if(cand.media_type==='movie'){ S.season=0; rerenderDialog(); return; }
    const d = await runTask('browse', {action:'tmdb', mediaType:cand.media_type, tmdbId:cand.id}, `browse:tmdb:${Date.now()}`);
    S.seasons = (d.seasons||[]).filter(s=>s.season_number>0);
    const first = S.seasons.find(s=>s.season_number>0); S.season = first?first.season_number:0;
    rerenderDialog();
  }
  async function createSub(){
    if(S.dirty) throw new Error('规则有未保存的修改，请先保存');
    if(!S.config.proxyId) throw new Error('请先到「追新规则」选择固定 Emby 实例');
    const cand = S.candidates.find(c=>c.__picked);
    if(!cand) throw new Error('请选择一个 TMDB 作品');
    const choice = {tmdbId:cand.id, mediaType:cand.media_type, season:cand.media_type==='movie'?0:Number(S.season)};
    const key = S.detail.source+':'+S.detail.id;
    const gen = ((S.db.records[identityKey(choice)]&&S.db.records[identityKey(choice)].generation)||0)+1;
    await runTask('engine', {action:'create', work:S.detail, choice, confirmed:true, restore:S.restore}, `create:${key}:${choice.media_type}:${cand.id}:${choice.season}:${S.config.proxyId}:g${gen}`);
    toast('订阅已创建'); closeDialog(); await loadDb();
  }
  async function askStop(record){ S.confirmStop = record; S.detail=null; S.dialogOpen=true; rerenderDialog(); }
  async function stopSub(){
    const v = S.confirmStop;
    await runTask('engine', v.confirmAbsent?{action:'confirm-absent',key:v.key,confirmedAbsent:true}:{action:'stop',key:v.key}, `${v.confirmAbsent?'confirm-absent':'stop'}:${v.key}:g${v.generation}`);
    toast('已停订，不会自动重新添加'); closeDialog(); await loadDb();
  }
  async function saveRules(){
    const {value:v, issues} = validateConfig(S.config);
    if(issues.length){
      S.fieldErrors = {};
      issues.forEach(i=>{ if(i.key) S.fieldErrors[i.key]=i.msg; });
      throw new Error(`有 ${issues.length} 项不符合要求，已在对应字段下方标出：` + issues.map(i=>i.msg).join('；'));
    }
    S.fieldErrors = {};
    const inst = v.proxyId ? S.emby.find(j=>j.id===v.proxyId) : null;
    if(v.proxyId && !inst) throw new Error(`找不到 ID 为 ${v.proxyId} 的 Emby 实例，请在宿主确认实例存在后刷新本页重选`);
    if(v.proxyId && !inst.api_key_configured) throw new Error(`实例「${inst.name}」还没有配置 API 密钥，无法作为固定实例`);
    v.proxyName = inst ? inst.name : '';
    await apiPut('config', ()=>Object.assign({}, v), DEFAULT_CONFIG());
    // 回读确认：宿主若静默丢弃写入，这里直接报出来，不再“看起来保存了其实没存”。
    const back = await apiGet('config', DEFAULT_CONFIG());
    const keys = ['proxyId','auto','minScore','minVotes','yearFrom','intervalMinutes','pageCount','minWish','soonWindowDays','include','exclude'];
    const diff = keys.filter(k=>String(back.value[k]==null?'':back.value[k]) !== String(v[k]==null?'':v[k]));
    if(diff.length) throw new Error('保存未生效：'+diff.join('、')+' 与提交值不一致，请重试或刷新页面');
    S.config = Object.assign(DEFAULT_CONFIG(), back.value, {feeds:Object.assign({}, DEFAULT_CONFIG().feeds, back.value.feeds||{})});
    S.dirty = false;
    toast('规则已保存');
  }
  async function runAutoNow(){
    await runTask('engine', {action:'auto'}, `engine:auto:${Date.now()}`);
    await loadDb(); toast('已触发立即追新');
  }
  async function syncNow(){ await runTask('engine', {action:'sync'}, `engine:sync:${Date.now()}`); await loadDb(); toast('已核对宿主订阅，停订标记已保存'); }
  async function retryRun(id){ await ctx.tasks.retry(id); await loadRuns(); toast('已请求宿主恢复核对'); }

  function identityKey(choice){ return `${choice.media_type}:${Number(choice.tmdbId)}:${choice.media_type==='movie'?0:Number(choice.season)}`; }
  function sourceKeyOf(w){ return `${w.source}:${w.id}`; }
  function itemBadge(work){
    const rec = Object.values(S.db.records).find(r=>r.sourceKeys.includes(sourceKeyOf(work)));
    if(rec) return STATUS_NAMES[rec.status]||rec.status;
    if(S.db.blocks && S.db.blocks[sourceKeyOf(work)]) return '已停订';
    const rev = Object.values(S.db.review||{}).find(r=>r.work && sourceKeyOf(r.work)===sourceKeyOf(work));
    return rev?'待手动匹配':'';
  }

  // ---- 批量订阅（核心修复：原包无此能力） ----
  function toggleSelect(work){ const k=sourceKeyOf(work); if(S.selection.has(k)) S.selection.delete(k); else S.selection.add(k); updateBulkBar(); }
  function selectAllVisible(on){ visibleItems().forEach(w=>{ const k=sourceKeyOf(w); if(on) S.selection.add(k); else S.selection.delete(k); }); updateBulkBar(); }
  // 片单可能有数百部；首屏只渲染一页，避免同时发起数百次封面代理请求。
  const PAGE_SIZE = 60;
  function discoverKey(){ return [S.feed||'all', S.query||'', S.sort||''].join('|'); }
  function visibleItems(){
    const all = currentItems();
    if(S._dkey !== discoverKey()){ S._dkey = discoverKey(); S.viewLimit = PAGE_SIZE; }
    return all.slice(0, S.viewLimit || PAGE_SIZE);
  }
  function currentItems(){
    const src = S.remote || itemsForFeed(S.feed);
    let arr = src.filter(w=>(!S.weekday||w.weekday===S.weekday) && (!S.query||S.remote||[w.title,w.originalTitle].join(' ').toLowerCase().includes(S.query.toLowerCase())));
    if(S.sort==='score') arr=[...arr].sort((a,b)=>b.score-a.score);
    if(S.sort==='date') arr=[...arr].sort((a,b)=>String(b.airDate||b.year||'').localeCompare(String(a.airDate||a.year||'')));
    return arr;
  }
  function itemsForFeed(feed){
    if(feed==='all'){ const m=new Map(); for(const v of Object.values(S.db.catalog)) (v.items||[]).forEach(w=>m.set(sourceKeyOf(w),w)); return [...m.values()]; }
    return (S.db.catalog[feed]&&S.db.catalog[feed].items)||[];
  }
  async function subscribeSelected(){
    const items = currentItems().filter(w=>S.selection.has(sourceKeyOf(w)));
    if(!items.length){ toast('请先勾选作品'); return; }
    if(!S.config.proxyId) throw new Error('请先到「追新规则」选择固定 Emby 实例');
    if(S.dirty) throw new Error('规则有未保存的修改，请先保存');
    let created=0, skipped=0, needManual=[], failed=[];
    for(const work of items){
      if(disposed) break;
      try{
        const choice = await autoMatch(work);
        if(!choice){ needManual.push(work); continue; }
        const key = sourceKeyOf(work);
        const gen = ((S.db.records[identityKey(choice)]&&S.db.records[identityKey(choice)].generation)||0)+1;
        const r = await runTask('engine', {action:'create', work, choice, confirmed:true}, `create:${key}:${choice.mediaType}:${choice.tmdbId}:${choice.season}:${S.config.proxyId}:g${gen}`);
        if(r.hostId||r.existing||r.complete) created++; else if(r.skipped) skipped++;
      }catch(e){ failed.push(`${work.title}：${e&&e.message?e.message:String(e)}`); }
    }
    await loadDb();
    S.selection.clear(); updateBulkBar();
    const parts=[`新增 ${created} 条`];
    if(skipped) parts.push(`跳过 ${skipped} 条`);
    if(needManual.length) parts.push(`${needManual.length} 条待手动匹配`);
    if(failed.length) parts.push(`${failed.length} 条失败`);
    S.error = failed.slice(0,3).join('；');
    toast('批量订阅：'+parts.join('，'));
    if(needManual.length) openWork(needManual[0]); else rerenderTab();
  }
  async function autoMatch(work){
    const m = await runTask('browse', {action:'match', work}, `browse:match:${Date.now()}`);
    const cands = m.candidates||[];
    const exact = cands.filter(c=>c.exact && String(c.year)===String(work.year||''));
    if(exact.length!==1) return null;
    const x=exact[0];
    const d = await runTask('browse', {action:'tmdb', mediaType:x.media_type, tmdbId:x.id}, `browse:tmdb:${Date.now()}`);
    const seasons=(d.seasons||[]).filter(s=>s.season_number>0);
    if(x.media_type==='tv' && (seasons.length!==1 || String(seasons[0].air_date||'').slice(0,4)!==String(work.year||''))) return null;
    return {tmdbId:x.id, mediaType:x.media_type, season:x.media_type==='movie'?0:seasons[0].season_number};
  }

  // ---- 渲染外壳 ----
  const wrap = el('section',{class:'zg-app'});
  const style = el('style',{text:CSS});
  wrap.append(style);
  const rail = el('nav',{class:'zg-rail glass', 'aria-label':'主导航'});
  rail.append(el('div',{class:'zg-mark', 'aria-hidden':'true', text:'追'}));
  const tabs = [['discover','发现','compass'],['library','订阅','bookmark'],['rules','规则','sliders'],['activity','记录','activity']];
  tabs.forEach(([id,label,icon])=>{
    const b = el('button',{class:'zg-tab'+(S.tab===id?' active':''), 'aria-current':S.tab===id?'page':null, title:label, onClick:()=>switchTab(id)}, [
      el('span',{class:'zg-ico', text:iconGlyph(icon)}), el('span',{text:label})
    ]);
    rail.append(b);
  });
  const main = el('div',{class:'zg-main'});
  const shell = el('div',{class:'zg-shell'});
  shell.append(rail, main);
  wrap.append(shell);
  root.append(wrap);

  function switchTab(id){ S.tab=id; if(id==='activity'){ loadRuns().catch(()=>{}); } if(id==='rules'){ loadEmby().catch(()=>{}); } rerenderAll(); }
  function rerenderAll(){ clear(main); main.append(renderHeader()); main.append(renderTab()); }
  function rerenderTab(){ const old = main.querySelector('.zg-tabbody'); if(old) old.remove(); main.append(renderTab()); }
  function renderHeader(){
    const inst = S.config.proxyId ? (S.config.proxyName || ('实例 #'+S.config.proxyId)) : '未绑定实例';
    return el('header',{class:'zg-header'},[
      el('div',{class:'zg-title'},[el('h1',{text:'追光'}), el('p',{text:'豆瓣影视与 Bangumi 新番，静候更新'})]),
      el('div',{class:'zg-header-side'},[
        S.busy?el('span',{class:'zg-spinner'}):null,
        el('span',{class:'instance-pill glass', title:'固定 Emby 实例'},[
          el('span',{class:'status-dot'+(S.config.proxyId?'':' offline')}),
          el('span',{html:'固定实例 · <b>'+esc(inst)+'</b>'})
        ])
      ]),
      S.error?el('div',{class:'alert error', text:S.error}):null
    ]);
  }
  function renderTab(){
    const body = el('div',{class:'zg-tabbody'});
    if(S.tab==='discover') body.append(renderDiscover());
    else if(S.tab==='library') body.append(renderLibrary());
    else if(S.tab==='rules') body.append(renderRules());
    else body.append(renderActivity());
    return body;
  }

  // ---- 发现页 ----
  function renderDiscover(){
    const box = el('div',{class:'zg-disc'});
    // 来源筛选
    const chips = el('div',{class:'zg-chips'});
    [['all','为你发现'],...Object.entries(FEEDS).map(([id,label])=>[id,label])].forEach(([id,label])=>{
      chips.append(el('button',{class:'zg-chip'+(S.feed===id?' selected':''), 'aria-pressed':S.feed===id, onClick:()=>{S.feed=id; S.remote=null; S.query=''; S.weekday=0; refreshCatalog().then(rerenderTab).catch(showError);}},[
        id!=='all'?el('span',{class:'src-dot '+(id==='bangumi'?'pink':'green')}):null, label
      ]));
    });
    // 搜索 + 排序
    const form = el('form',{class:'zg-search', onSubmit:(e)=>{e.preventDefault(); searchCatalog().then(rerenderTab).catch(showError);}});
    const input = el('input',{class:'zg-input', placeholder:'寻找你的下一部…', 'aria-label':'搜索片名', value:S.query, oninput:(e)=>{S.query=e.target.value;}});
    const sel = el('select',{class:'zg-select', 'aria-label':'搜索来源', onchange:(e)=>{S.searchSource=e.target.value;}});
    sel.append(el('option',{value:'douban',text:'豆瓣'}), el('option',{value:'bangumi',text:'Bangumi'}));
    sel.value=S.searchSource;
    form.append(input, sel, el('button',{class:'zg-go',type:'submit',text:'搜索', disabled:S.busy}));
    const sortSel = el('select',{class:'zg-select', 'aria-label':'片单排序', onchange:(e)=>{S.sort=e.target.value; rerenderTab();}});
    sortSel.append(el('option',{value:'default',text:'推荐顺序'}),el('option',{value:'score',text:'评分优先'}),el('option',{value:'date',text:'最新播出'}));
    sortSel.value=S.sort;
    // Bangumi 星期筛选
    let weekBar=null;
    if(S.feed==='bangumi'){ weekBar = el('div',{class:'zg-chips'}); WEEKDAYS.forEach((d,i)=>weekBar.append(el('button',{class:'zg-chip'+(S.weekday===(i+1)?' selected':''), onClick:()=>{S.weekday=i+1; rerenderTab();}}, d))); }
    const toolbar = el('div',{class:'zg-toolbar'},[chips, form, sortSel]);
    box.append(toolbar); if(weekBar) box.append(weekBar);

    // 来源错误提示
    S.sourceErrors.forEach(e=>box.append(el('div',{class:'alert warn', text:e})));

    // 批量操作条
    const bulkBar = el('div',{class:'zg-bulk', id:'zg-bulk'});
    bulkBar.append(
      el('label',{class:'zg-checkall'},[el('input',{type:'checkbox', onchange:(e)=>selectAllVisible(e.target.checked)}),'全选本页']),
      el('button',{class:'zg-btn primary', id:'zg-subscribe-selected', text:`订阅所选 (${S.selection.size})`, onClick:()=>busyWrap(subscribeSelected).then(rerenderTab).catch(showError)}),
      el('button',{class:'zg-btn', text:'清空选择', onClick:()=>{S.selection.clear(); updateBulkBar();}})
    );
    box.append(bulkBar);

    // 网格
    const all = currentItems();
    const items = visibleItems();
    const grid = el('div',{class:'zg-grid'});
    if(!all.length){
      grid.append(el('div',{class:'zg-empty'},[el('div',{class:'zg-ico big',text:'◎'}), el('h3',{text:S.busy?'正在寻找好故事':(S.remote?'没有匹配的搜索结果':'还没有片单')}), el('p',{text:'调整筛选条件，或刷新公开片单。'}),
        el('button',{class:'zg-btn',text:'刷新片单', onClick:()=>busyWrap(refreshCatalog).then(rerenderTab).catch(showError)})]));
    } else {
      items.forEach(w=>grid.append(renderCard(w)));
    }
    box.append(grid);
    if(all.length > items.length){
      box.append(el('div',{class:'zg-more'},[
        el('button',{class:'zg-btn', text:`显示更多（已显示 ${items.length} / ${all.length}）`, onClick:()=>{ S.viewLimit=(S.viewLimit||PAGE_SIZE)+PAGE_SIZE; rerenderTab(); }})
      ]));
    }
    box.append(el('div',{class:'zg-foot'},[el('span',{text:'好故事不必急着看，先把期待收藏好。'}),el('span',{text:'公开目录快照 · 资源搜索由宿主完成'})]));
    return box;
  }
  function renderCard(w){
    const k=sourceKeyOf(w);
    const poster = el('div',{class:'poster'});
    const fb = el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}), el('span',{text:w.title})]);
    const img = el('img',{class:'poster-img', alt:w.title+'海报', decoding:'async'});
    poster.append(fb, img);
    attachCover(poster, w.cover, w.title);
    const card = el('article',{class:'media-card'+(S.selection.has(k)?' selected':'')},[
      el('label',{class:'card-check'},[el('input',{type:'checkbox', checked:S.selection.has(k), onchange:()=>{toggleSelect(w); card.classList.toggle('selected');}})]),
      el('button',{class:'poster-btn', 'aria-label':'查看并订阅 '+w.title, onClick:()=>busyWrap(()=>openWork(w)).catch(showError)},[poster]),
      el('div',{class:'card-meta'},[
        el('h3',{text:w.title}),
        el('p',{text:[w.year||'待确认年份', w.source==='bangumi'?(w.weekday?WEEKDAYS[w.weekday-1]+'放送':'动画'):w.mediaType==='movie'?'电影':(w.progress||'剧集')].join(' · ')}),
        el('div',{class:'card-tags'},[
          el('span',{class:'src-tag '+w.source, text:w.source==='douban'?'豆瓣':'Bangumi'}),
          w.score?el('span',{class:'score'},[el('span',{class:'zg-ico',text:'★'}),Number(w.score).toFixed(1)]):null,
          itemBadge(w)?el('span',{class:'badge', text:itemBadge(w)}):null
        ])
      ]),
      el('button',{class:'card-plus', 'aria-label':'订阅 '+w.title, onClick:()=>busyWrap(()=>openWork(w)).catch(showError)},[el('span',{class:'zg-ico',text:'＋'})])
    ]);
    return card;
  }
  function updateBulkBar(){
    const bar = main.querySelector('#zg-bulk'); if(!bar) return;
    const b = bar.querySelector('#zg-subscribe-selected'); if(b) b.textContent = `订阅所选 (${S.selection.size})`;
    const all = main.querySelector('.zg-checkall input'); if(all){ const items=currentItems(); all.checked = items.length>0 && items.every(w=>S.selection.has(sourceKeyOf(w))); }
  }

  // ---- 我的订阅 ----
  function renderLibrary(){
    const box = el('div',{class:'zg-lib'});
    box.append(el('div',{class:'page-title'},[el('div',{class:'eyebrow',text:'YOUR WATCHLIST'}),el('h1',{text:'每一部，都有下文。'}),el('p',{text:'固定媒体库，持续追踪。宿主删除后，我们会记住你的选择。'})]));
    const filterBar = el('div',{class:'zg-chips'});
    [['all','全部'],['active','追更中'],['complete','已入库'],['blocked','已停订']].forEach(([id,label])=>{
      const cur = S._libFilter||'all';
      filterBar.append(el('button',{class:'zg-chip'+(cur===id?' selected':''), onClick:()=>{S._libFilter=id; rerenderTab();}}, label));
    });
    box.append(filterBar);
    const recs = Object.values(S.db.records).sort((a,b)=>b.createdAt-a.createdAt);
    const filt = recs.filter(r=>{ const f=S._libFilter||'all'; return f==='all'||(f==='blocked'?r.status==='blocked':f==='complete'?r.status==='complete':!['complete','blocked'].includes(r.status)); });
    const grid = el('div',{class:'zg-grid'});
    if(!filt.length) grid.append(el('div',{class:'zg-empty'},[el('h3',{text:'还没有订阅'}),el('p',{text:'去发现页，选一部你期待的故事。'}),el('button',{class:'zg-btn',text:'去发现',onClick:()=>switchTab('discover')})]));
    filt.forEach(r=>{
      const poster = el('div',{class:'poster'}); const fb=el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}),el('span',{text:r.work&&r.work.title||'作品'})]); const img=el('img',{class:'poster-img',decoding:'async'}); poster.append(fb,img);
      if(r.work) attachCover(poster, r.work.cover, r.work.title);
      grid.append(el('article',{class:'media-card'},[poster, el('div',{class:'card-meta'},[
        el('h3',{text:(r.work&&r.work.title)||'作品'}),
        el('p',{text:STATUS_NAMES[r.status]||r.status}),
        r.covered?el('p',{class:'sub',text:'已拥有 '+r.covered+' 集'}):null,
        r.error?el('p',{class:'err',text:r.error}):null,
        el('button',{class:'zg-btn small', text:r.status==='blocked'?'恢复订阅':'停止订阅', onClick:()=>busyWrap(()=>askStop(r)).catch(showError)})
      ])]));
    });
    box.append(grid);
    return box;
  }

  // ---- 追新规则 ----
  function renderRules(){
    const box = el('div',{class:'zg-rules'});
    box.append(el('div',{class:'page-title'},[el('div',{class:'eyebrow',text:'RULES'}),el('h1',{text:'把期待交给规则。'}),el('p',{text:'固定一个 Emby 实例，开启自动追新，剩下的交给宿主。'})]));
    const form = el('div',{class:'zg-form glass'});
    // Emby 实例
    const instSel = el('select',{class:'zg-input', 'aria-label':'固定 Emby 实例', onchange:(e)=>{S.config.proxyId=e.target.value?Number(e.target.value):null; S.dirty=true; clearFieldError('proxyId',e.target);}});
    instSel.append(el('option',{value:'',text:'— 请选择固定 Emby 实例 —'}));
    S.emby.forEach(j=>instSel.append(el('option',{value:String(j.id), text:j.name+(j.api_key_configured?'':'（未配置密钥）')})));
    instSel.value = S.config.proxyId!=null?String(S.config.proxyId):'';
    form.append(field('固定 Emby 实例', instSel, '每条订阅只认定一个媒体库；实例不可用时暂停处理，不切换到其他媒体库。更改此设置只影响新订阅。', 'proxyId'));
    // 自动追新开关
    const autoWrap = el('label',{class:'zg-switch'});
    const autoCb = el('input',{type:'checkbox', checked:!!S.config.auto, onchange:(e)=>{S.config.auto=e.target.checked; S.dirty=true; clearFieldError('auto',e.target); updateRulesValidity();}});
    autoWrap.append(autoCb, el('span',{class:'slider'}), el('span',{class:'switch-label', text:'启用自动追新'}));
    form.append(field('自动追新', autoWrap, '开启后，插件按间隔自动从公开目录发现并订阅符合条件的作品（需先选择 Emby 实例）。也可随时点“立即追新”手动触发。', 'auto'));
    // 来源
    const feedsWrap = el('div',{class:'zg-feeds'});
    Object.keys(FEEDS).forEach(f=>{ const l=el('label',{class:'zg-check'}); const c=el('input',{type:'checkbox',checked:!!S.config.feeds[f],onchange:(e)=>{S.config.feeds[f]=e.target.checked;S.dirty=true;}}); l.append(c, FEEDS[f]); feedsWrap.append(l); });
    form.append(field('订阅来源', feedsWrap, '豆瓣剧集 / 豆瓣电影 / Bangumi 新番。'));
    // 筛选
    form.append(field('最低评分', numInput('minScore',0,10,0.1), '0–10，豆瓣评分/新番评分门槛', 'minScore'));
    form.append(field('最低投票数', numInput('minVotes',0,1000000,1), '0–1000000', 'minVotes'));
    form.append(field('起始年份', numInput('yearFrom',1900,2100,1), '1900–2100', 'yearFrom'));
    form.append(field('仅包含关键词', textInput('include','如：科幻,悬疑'), '逗号分隔，命中任一即保留', 'include'));
    form.append(field('排除关键词', textInput('exclude','如：真人秀'), '逗号分隔，命中即跳过', 'exclude'));
    form.append(field('检查间隔（分钟）', numInput('intervalMinutes',15,1440,5), '15–1440 分钟，仅在开启自动追新时生效', 'intervalMinutes'));
    form.append(field('豆瓣片单读取页数', numInput('pageCount',1,5,1), '1–5 页，页数越多抓取越慢', 'pageCount'));
    // 即将上映（豆瓣即将上映）专用筛选：按「想看人数阈值」+「上映窗口」过滤（评分/投票不适用）
    form.append(field('即将上映·想看人数阈值', numInput('minWish',0,1000000,100), '0–1000000，低于此值不自动订阅', 'minWish'));
    form.append(field('即将上映·上映窗口(天)', numInput('soonWindowDays',1,365,1), '1–365 天，只追这段时间内上映的', 'soonWindowDays'));
    box.append(form);
    box.append(el('div',{class:'zg-actions'},[
      el('button',{class:'zg-btn primary', text:'保存规则', onClick:()=>busyWrap(saveRules).then(rerenderTab).catch(showError), disabled:S.busy}),
      el('button',{class:'zg-btn', text:'立即追新一次', onClick:()=>busyWrap(runAutoNow).then(rerenderTab).catch(showError), disabled:S.busy}),
      el('button',{class:'zg-btn', text:'核对宿主订阅', onClick:()=>busyWrap(syncNow).then(rerenderTab).catch(showError), disabled:S.busy})
    ]));
    updateRulesValidity();
    return box;
  }
  function field(label, control, hint, key){
    const err = key && S.fieldErrors ? S.fieldErrors[key] : '';
    return el('div',{class:'zg-field'+(err?' invalid':''), 'data-field':key||null},[
      el('label',{class:'zg-label',text:label}), control,
      hint?el('p',{class:'zg-hint',text:hint}):null,
      err?el('p',{class:'zg-err',text:err}):null
    ]);
  }
  function clearFieldError(key, node){
    if(!S.fieldErrors || !S.fieldErrors[key]) return;
    delete S.fieldErrors[key];
    const f = node && node.closest ? node.closest('.zg-field') : null;
    if(f){ f.classList.remove('invalid'); const e=f.querySelector('.zg-err'); if(e) e.remove(); }
    if(S.error && /不符合要求|需在|需要填写/.test(S.error)){ S.error=''; rerenderHeaderOnly(); }
  }
  function numInput(key,min,max,step){
    const raw = S.config[key];
    return el('input',{class:'zg-input',type:'number',value:(raw==null||raw==='')?'':String(raw),min,max,step,
      oninput:(e)=>{ S.config[key]=e.target.value; S.dirty=true; clearFieldError(key,e.target); updateRulesValidity(); }});
  }
  function textInput(key,ph){
    return el('input',{class:'zg-input',type:'text',value:String(S.config[key]==null?'':S.config[key]),placeholder:ph,
      oninput:(e)=>{ S.config[key]=e.target.value; S.dirty=true; clearFieldError(key,e.target); }});
  }
  function updateRulesValidity(){}

  // ---- 运行记录 ----
  function renderActivity(){
    const box = el('div',{class:'zg-act'});
    box.append(el('div',{class:'page-title'},[el('div',{class:'eyebrow',text:'ACTIVITY'}),el('h1',{text:'每一次追新，都有迹可循。'}),el('p',{text:'最近一次追新：'+fmtTime(S.db.lastAuto)+'；最近核对：'+fmtTime(S.db.lastSync)})]));
    box.append(el('div',{class:'zg-actions'},[el('button',{class:'zg-btn',text:'核对宿主订阅',onClick:()=>busyWrap(syncNow).then(rerenderTab).catch(showError),disabled:S.busy})]));
    const logs = (S.db.logs||[]).slice(0,40);
    box.append(el('h3',{class:'zg-sub',text:'日志'}));
    const logBox = el('div',{class:'zg-logs glass'});
    if(!logs.length) logBox.append(el('div',{class:'zg-empty small',text:'暂无日志 · 每次追新与核对都会记录在这里'}));
    logs.forEach(l=>logBox.append(el('div',{class:'log-item '+(l.level==='warning'?'warn':'')},[el('span',{class:'log-time',text:fmtTime(l.at)}), el('span',{class:'log-msg',text:l.message})])));
    box.append(logBox);
    box.append(el('h3',{class:'zg-sub',text:'运行任务'}));
    const runsBox = el('div',{class:'zg-runs glass'});
    if(!S.runs.length) runsBox.append(el('div',{class:'zg-empty small',text:'暂无运行记录'}));
    S.runs.forEach(t=>{
      const name = JOB_NAMES[t.job_id] || t.job_id || '任务';
      const res = t.result && t.result.created!=null ? `新增 ${t.result.created} 条` : (t.result && t.result.done!=null ? `处理 ${t.result.done} 项` : '');
      const sub = [fmtTime(t.created_at), res, t.attempted>1?`第 ${t.attempted} 次`:'', t.status==='failed'?(t.message||'').slice(0,40):''].filter(Boolean).join(' · ');
      runsBox.append(el('div',{class:'run-item'},[
        el('span',{class:'run-title'},[el('b',{text:name}), el('span',{class:'run-sub',text:sub||'—'})]),
        el('span',{class:'run-status '+t.status,text:TASK_STATES[t.status]||t.status}),
        t.status==='attention_required'?el('button',{class:'zg-btn small',text:'恢复核对',onClick:()=>busyWrap(()=>retryRun(t.id)).catch(showError)}):null
      ]));
    });
    box.append(runsBox);
    return box;
  }

  // ---- 详情 / 匹配对话框 ----
  function renderDialog(){
    let dlg = main.querySelector('.zg-dialog');
    if(!S.dialogOpen){ if(dlg) dlg.remove(); return; }
    if(!dlg){
      const back = el('div',{class:'zg-dialog-back', onClick:()=>{S.dialogOpen=false; rerenderDialog();}});
      const card = el('div',{class:'zg-dialog-card glass'});
      dlg = el('div',{class:'zg-dialog', id:'zg-dialog'},[back, card]);
      main.append(dlg);
    }
    const card = dlg.querySelector('.zg-dialog-card'); clear(card);
    const w = S.detail;
    const poster = el('div',{class:'poster small'}); const fb=el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}),el('span',{text:(w&&w.title)||'作品'})]); const img=el('img',{class:'poster-img',decoding:'async'}); poster.append(fb,img);
    if(w) attachCover(poster, w.cover, w.title);
    card.append(el('button',{class:'zg-close',text:'✕','aria-label':'关闭',onClick:()=>{S.dialogOpen=false; rerenderDialog();}}));
    card.append(el('div',{class:'dlg-top'},[poster, el('div',{},[el('h2',{text:(w&&w.title)||'作品'}), el('p',{text:(w&&[w.year,'·',w.source==='bangumi'?'动画':'影视'].join(' '))||''}), S.notice?el('p',{class:'dlg-notice',text:S.notice}):null])]));
    if(S.candidates.length){
      card.append(el('h3',{class:'zg-sub',text:'匹配 TMDB 媒体'}));
      const list = el('div',{class:'zg-cands'});
      S.candidates.forEach(c=>{
        const pick = ()=>{ S.candidates.forEach(x=>x.__picked=false); c.__picked=true; chooseTmdb(c).then(rerenderDialog).catch(err=>{S.notice=err.message;rerenderDialog();}); };
        list.append(el('button',{class:'cand'+(c.__picked?' picked':''), onClick:pick},[
          el('span',{text:c.title||c.name}), el('span',{class:'cand-year',text:c.year||''}), c.exact?el('span',{class:'cand-exact',text:'精确'}):null
        ]));
      });
      card.append(list);
      if(S.seasons.length){
        const sel = el('select',{class:'zg-input', 'aria-label':'选择季', onchange:(e)=>{S.season=Number(e.target.value);}});
        S.seasons.forEach(s=>sel.append(el('option',{value:String(s.season_number),text:'第 '+s.season_number+' 季'+(s.air_date?'（'+String(s.air_date).slice(0,4)+'）':'')})));
        sel.value=String(S.season);
        card.append(field('选择季数', sel));
      }
    } else {
      card.append(el('p',{class:'dlg-notice',text:'未找到 TMDB 候选，请调整片名后重新匹配。'}));
      const q = el('input',{class:'zg-input',value:S.matchQuery,oninput:(e)=>{S.matchQuery=e.target.value;}});
      card.append(field('片名 / 原名', q, ''));
      card.append(el('button',{class:'zg-btn',text:'重新匹配',onClick:()=>busyWrap(rematch).then(rerenderDialog).catch(err=>{S.notice=err.message;rerenderDialog();})}));
    }
    if(S.confirmStop){
      card.append(el('h3',{class:'zg-sub',text:'停止订阅'}));
      card.append(el('p',{class:'dlg-notice',text:S.confirmStop.status==='unknown'?'此订阅提交结果未知，先在宿主核对，不能释放名额或重发。':''}));
      card.append(el('button',{class:'zg-btn danger',text:S.confirmStop.confirmAbsent?'确认未创建并停订':'停止订阅',onClick:()=>busyWrap(stopSub).then(renderDialog).catch(err=>{S.error=err.message;rerenderDialog();rerenderHeaderOnly();})}));
    } else if(S.candidates.length){
      card.append(el('button',{class:'zg-btn primary',text:S.restore?'手动恢复订阅':'创建订阅',onClick:()=>busyWrap(createSub).then(rerenderTab).catch(err=>{S.error=err.message;rerenderDialog();rerenderHeaderOnly();})},));
    }
    return dlg;
  }
  // renderDialog 自身幂等（无对话框时移除、有则重建），这里只做语义化别名，供各处统一调用。
  function rerenderDialog(){ return renderDialog(); }
  function closeDialog(){ S.dialogOpen=false; S.notice=''; S.candidates=[]; S.seasons=[]; rerenderDialog(); updateBulkBar(); }

  // ---- 小工具 ----
  async function busyWrap(fn){ S.busy=true; S.error=''; rerenderHeaderOnly(); try{ return await fn(); } finally { S.busy=false; rerenderHeaderOnly(); } }
  function showError(err){
    S.error=humanError(err); S.busy=false;
    rerenderHeaderOnly(); rerenderTab();
    const bad = main.querySelector('.zg-field.invalid');
    if(bad && bad.scrollIntoView) bad.scrollIntoView({block:'center', behavior:'smooth'});
  }
  function rerenderHeaderOnly(){ const old=main.querySelector('.zg-header'); if(old){ const h=renderHeader(); old.replaceWith(h); } else main.prepend(renderHeader()); }
  function toast(msg){
    // 挂在 .zg-app 上而不是 header 里：每次操作后 header 会整块重渲染，挂里面会被一起删掉，
    // 表现就是“点了保存什么提示都没有”，误以为保存失效。
    S.toast=msg;
    const old=wrap.querySelector('.zg-toast'); if(old) old.remove();
    wrap.append(el('div',{class:'zg-toast',text:msg}));
    setTimeout(()=>{ S.toast=''; const t=wrap.querySelector('.zg-toast'); if(t) t.remove(); }, 6000);
  }

  // 初始加载
  rerenderAll();
  loadAll().then(()=>{ rerenderAll(); updateBulkBar(); }).catch(err=>{ S.error=humanError(err); rerenderAll(); });
  const poll = setInterval(()=>{ if(!S.busy){ loadDb().then(()=>{ if(S.tab==='library'||S.tab==='activity') rerenderTab(); }).catch(()=>{}); } }, 20000);

  return ()=>{ disposed=true; clearInterval(poll); wrap.remove(); };
}

// ---- 静态资源 ----
const CSS = `
.zg-app{--bg:#f5f7f5;--surface:#fff;--text:#203b39;--muted:#5c706d;--border:#dbe5e0;--accent:#0d7569;--accent-soft:#e0eee8;--glass:rgba(255,255,255,.68);--glass-edge:rgba(255,255,255,.95);--shadow:0 12px 40px -22px #385c4b38;--error:#a83239;--warm:#85591f;color:var(--text);background:var(--bg);font:14px/1.55 -apple-system,BlinkMacSystemFont,"SF Pro Display","PingFang SC","Microsoft YaHei",sans-serif;min-height:100vh;color-scheme:light;isolation:isolate;-webkit-font-smoothing:antialiased}
.zg-app *{box-sizing:border-box}
.zg-app[data-theme=dark]{--bg:#121d20;--surface:#1c2c2e;--text:#e6efea;--muted:#a4bab5;--border:#3b504e;--accent:#a0e0cb;--accent-soft:#2b4943;--glass:rgba(34,52,54,.8);--glass-edge:rgba(255,255,255,.07);--shadow:0 12px 40px -22px #00000080;--error:#ff9aa0;--warm:#e4bd86;color-scheme:dark}
.zg-shell{max-width:1920px;margin:0 auto;display:grid;grid-template-columns:92px minmax(0,1fr);min-height:100vh;background:radial-gradient(ellipse at 15% 0%,#dae8dc70,transparent 40%),radial-gradient(ellipse at 100% 30%,#e4e9db60,transparent 50%)}
.zg-app[data-theme=dark] .zg-shell{background:radial-gradient(ellipse at 15% 0%,#1b303380,transparent 42%),radial-gradient(ellipse at 100% 30%,#16262a70,transparent 50%)}
.zg-app .glass{background:var(--glass);border:1px solid var(--glass-edge);box-shadow:var(--shadow),inset 0 1px 0 var(--glass-edge);backdrop-filter:blur(24px) saturate(135%);-webkit-backdrop-filter:blur(24px) saturate(135%)}
.zg-app .zg-rail{border-radius:0 28px 28px 0;position:sticky;top:0;height:100vh;max-height:1000px;display:flex;flex-direction:column;align-items:center;gap:5px;padding:26px 8px;z-index:5;border-left:0}
.zg-app .zg-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:linear-gradient(150deg,#216b5d,#0b423d);color:#fff;font-size:16px;font-weight:700;box-shadow:inset 0 1px #ffffff60,0 4px 10px #25524720;margin-bottom:16px;letter-spacing:1px}
.zg-app .zg-tab{width:62px;padding:10px 0 8px;display:flex;flex-direction:column;align-items:center;gap:5px;border:0;border-radius:14px;background:transparent;color:var(--muted);font:inherit;font-size:10px;font-weight:600;cursor:pointer;transition:background .16s,color .16s}
.zg-app .zg-tab:hover{color:var(--text);background:var(--accent-soft)}
.zg-app .zg-tab.active{color:var(--accent);background:var(--accent-soft)}
.zg-app .zg-ico{font-style:normal;font-size:17px;line-height:1}
.zg-app .zg-ico.big{font-size:34px;opacity:.45}
.zg-app .zg-main{padding:0 42px 72px;min-width:0}
.zg-app .zg-header{min-height:100px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.zg-app .zg-title h1{margin:0;font-size:21px;font-weight:650;letter-spacing:-.3px}
.zg-app .zg-title p{margin:3px 0 0;color:var(--muted);font-size:11px;letter-spacing:.3px}
.zg-app .zg-header-side{display:flex;align-items:center;gap:12px;margin-left:auto}
.zg-app .instance-pill{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 16px;border-radius:99px;font-size:11px;color:var(--muted);white-space:nowrap}
.zg-app .instance-pill b{color:var(--text);font-weight:600}
.zg-app .status-dot{width:5px;height:5px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.zg-app .status-dot.offline{background:var(--muted);box-shadow:none}
.zg-app .zg-spinner{width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:zg-spin .8s linear infinite}
@keyframes zg-spin{to{transform:rotate(360deg)}}
.zg-app .alert{display:flex;align-items:center;gap:10px;flex-basis:100%;padding:12px 15px;border:1px solid var(--border);border-radius:12px;background:var(--surface);font-size:12px;margin:0 0 14px;overflow-wrap:anywhere;line-height:1.6}
.zg-app .alert.error{background:#fceced;border-color:#f0c9cc;color:var(--error)}
.zg-app .alert.warn{background:#fdf4e6;border-color:#eddcbf;color:var(--warm)}
.zg-app[data-theme=dark] .alert.error{background:#3a2325;border-color:#5c3134}
.zg-app[data-theme=dark] .alert.warn{background:#3a3226;border-color:#5c4a31}
.zg-app .zg-toast{position:fixed;bottom:26px;left:50%;transform:translateX(-50%);z-index:60;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 40px);padding:13px 22px;border-radius:99px;background:var(--surface);border:1px solid var(--glass-edge);box-shadow:0 18px 50px -24px #223c3366;color:var(--accent);font-size:12px;font-weight:600}
.zg-app .zg-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:0 0 22px}
.zg-app .zg-chips{display:flex;flex-wrap:wrap;align-items:center;gap:3px;padding:5px;border-radius:16px;background:var(--glass);border:1px solid var(--glass-edge);box-shadow:var(--shadow);backdrop-filter:blur(20px)}
.zg-app .zg-chip{display:inline-flex;align-items:center;min-height:34px;padding:0 13px;border:0;border-radius:12px;background:transparent;color:var(--muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s,color .15s}
.zg-app .zg-chip:hover{color:var(--text)}
.zg-app .zg-chip.selected{background:var(--accent-soft);color:var(--accent)}
.zg-app .src-dot{display:inline-block;width:5px;height:5px;border-radius:50%;margin-right:6px;vertical-align:middle}
.zg-app .src-dot.green{background:#2f9e7f}.zg-app .src-dot.pink{background:#d3809f}
.zg-app .zg-search{display:flex;align-items:center;gap:8px;flex:1;min-width:200px;max-width:340px}
.zg-app .zg-input{width:100%;min-height:44px;padding:0 14px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text);font:inherit;font-size:13px;outline:none;transition:border-color .15s,box-shadow .15s}
.zg-app .zg-input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.zg-app .zg-select{min-height:44px;padding:0 12px;border:1px solid var(--border);border-radius:13px;background:var(--surface);color:var(--text);font:inherit;font-size:13px;outline:none;cursor:pointer}
.zg-app .zg-go{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 18px;border:1px solid transparent;border-radius:13px;background:var(--accent);color:#fff;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.zg-app .zg-go:disabled{opacity:.55;cursor:default}
.zg-app .zg-bulk{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:0 0 22px;padding:10px 14px;border-radius:16px;background:var(--glass);border:1px solid var(--glass-edge);box-shadow:var(--shadow);backdrop-filter:blur(20px)}
.zg-app .zg-checkall{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--muted);cursor:pointer}
.zg-app input[type=checkbox]{accent-color:var(--accent);width:15px;height:15px;cursor:pointer;margin:0}
.zg-app .zg-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:10px 16px;border:1px solid var(--border);border-radius:12px;background:var(--glass);color:var(--text);font:inherit;font-size:12px;font-weight:600;cursor:pointer;transition:.15s;white-space:nowrap}
.zg-app .zg-btn:hover{border-color:var(--accent);color:var(--accent)}
.zg-app .zg-btn.primary{background:var(--accent);border-color:transparent;color:#fff;box-shadow:0 10px 22px -14px #0d7569}
.zg-app .zg-btn.primary:hover{color:#fff;filter:brightness(1.06)}
.zg-app[data-theme=dark] .zg-btn.primary{color:#0e1a18}
.zg-app .zg-btn.small{min-height:32px;padding:6px 12px;font-size:11px}
.zg-app .zg-btn.danger{background:#b8404a;border-color:transparent;color:#fff}
.zg-app .zg-btn:disabled{opacity:.55;cursor:default}
.zg-app .zg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(152px,1fr));gap:27px 21px}
.zg-app .zg-more{display:flex;justify-content:center;margin:26px 0 0}
.zg-app .media-card{position:relative;min-width:0}
.zg-app .poster-btn{display:block;width:100%;padding:0;border:0;background:none;cursor:pointer;text-align:left;color:inherit;font:inherit}
.zg-app .poster{position:relative;width:100%;aspect-ratio:2/3;border-radius:13px;overflow:hidden;background:var(--accent-soft);box-shadow:0 5px 14px -8px #344d4260;display:flex;align-items:center;justify-content:center;transition:transform .18s,box-shadow .18s}
.zg-app .media-card:hover .poster{transform:translateY(-3px);box-shadow:0 16px 28px -16px #344d4290}
.zg-app .media-card.selected .poster{box-shadow:0 0 0 2px var(--accent),0 14px 26px -16px #344d4290}
.zg-app .poster-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .25s}
.zg-app .poster-img.ready{opacity:1}
.zg-app .poster-fallback{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;padding:14px;text-align:center;color:var(--muted);font-size:11px;line-height:1.5}
.zg-app .poster-fallback.hidden{display:none}
.zg-app .card-check{position:absolute;top:9px;left:9px;z-index:3;width:24px;height:24px;border-radius:7px;background:#ffffffd9;backdrop-filter:blur(10px);display:grid;place-items:center;box-shadow:0 2px 6px #223c3320}
.zg-app .card-plus{position:absolute;bottom:10px;right:10px;z-index:3;width:31px;height:31px;display:grid;place-items:center;border:1px solid #ffffff80;border-radius:50%;background:#ffffffc9;backdrop-filter:blur(16px);color:#1b5244;font-size:15px;line-height:1;cursor:pointer;box-shadow:0 3px 10px #223c3326}
.zg-app .card-plus:hover{background:#fff}
.zg-app .card-meta{padding-top:11px}
.zg-app .card-meta h3{margin:0;font-size:12.5px;font-weight:600;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zg-app .card-meta p{margin:4px 0 0;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.zg-app .card-meta p.sub{color:#2f9e7f}
.zg-app .card-meta p.err{color:var(--error)}
.zg-app .card-tags{display:flex;flex-wrap:wrap;align-items:center;gap:5px;margin-top:7px}
.zg-app .src-tag{font-size:9px;font-weight:600;padding:3px 7px;border-radius:6px;background:var(--accent-soft);color:var(--accent)}
.zg-app .src-tag.bangumi{background:#fdeef4;color:#a34a72}
.zg-app[data-theme=dark] .src-tag.bangumi{background:#3d2a33;color:#f0a9c8}
.zg-app .score{font-size:11px;font-weight:600;color:var(--warm)}
.zg-app .badge{font-size:9px;font-weight:600;padding:3px 7px;border-radius:6px;background:var(--accent-soft);color:var(--accent)}
.zg-app .zg-empty{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:13px;min-height:280px;padding:40px 18px;text-align:center;color:var(--muted)}
.zg-app .zg-empty h3{margin:0;font-size:15px;font-weight:600;color:var(--text)}
.zg-app .zg-empty p{margin:0;font-size:12px}
.zg-app .zg-empty.small{min-height:0;padding:20px;font-size:12px}
.zg-app .zg-foot{display:flex;justify-content:space-between;gap:14px;margin-top:26px;font-size:11px;color:var(--muted)}
.zg-app .page-title{padding:26px 0 30px}
.zg-app .page-title .eyebrow{display:flex;align-items:center;gap:8px;font-size:9px;font-weight:650;letter-spacing:2px;color:var(--accent);text-transform:uppercase}
.zg-app .page-title h1{margin:7px 0 7px;font-size:26px;font-weight:650;letter-spacing:-.5px}
.zg-app .page-title p{margin:0;font-size:12px;color:var(--muted)}
.zg-app .zg-form{padding:27px;border-radius:22px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 24px}
.zg-app .zg-field{display:flex;flex-direction:column;gap:8px;margin-bottom:19px;font-size:12px;min-width:0}
.zg-app .zg-field.invalid .zg-input,.zg-app .zg-field.invalid .zg-select{border-color:var(--error);box-shadow:0 0 0 3px #fbe3e4}
.zg-app .zg-label{font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.2px}
.zg-app .zg-hint{margin:0;font-size:11px;line-height:1.55;color:var(--muted);opacity:.9}
.zg-app .zg-err{margin:0;font-size:11px;font-weight:600;color:var(--error)}
.zg-app .zg-switch{display:inline-flex;align-items:center;gap:10px;cursor:pointer;min-height:24px}
.zg-app .zg-switch input{display:none}
.zg-app .zg-switch .slider{position:relative;width:44px;height:25px;border-radius:99px;background:var(--border);transition:background .16s;flex:none}
.zg-app .zg-switch .slider::after{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #223c3350;transition:transform .16s}
.zg-app .zg-switch input:checked+.slider{background:var(--accent)}
.zg-app .zg-switch input:checked+.slider::after{transform:translateX(19px)}
.zg-app .switch-label{font-size:12px;font-weight:600}
.zg-app .zg-feeds{display:flex;flex-wrap:wrap;gap:8px}
.zg-app .zg-check{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);font-size:12px;cursor:pointer}
.zg-app .zg-check:hover{border-color:var(--accent)}
.zg-app .zg-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.zg-app .zg-sub{margin:26px 0 12px;font-size:13px;font-weight:650;letter-spacing:.2px}
.zg-app .zg-logs{padding:4px 18px;border-radius:18px;max-height:340px;overflow:auto}
.zg-app .log-item{display:flex;gap:14px;padding:11px 0;border-bottom:1px solid var(--border);font-size:12px;line-height:1.55}
.zg-app .log-item:last-child{border-bottom:0}
.zg-app .log-time{flex:none;color:var(--muted);font-variant-numeric:tabular-nums;font-size:11px}
.zg-app .log-msg{min-width:0;overflow-wrap:anywhere}
.zg-app .log-item.warn .log-msg{color:var(--warm)}
.zg-app .zg-runs{padding:4px 18px;border-radius:18px}
.zg-app .run-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);font-size:12px}
.zg-app .run-item:last-child{border-bottom:0}
.zg-app .run-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.zg-app .run-title b{font-size:12px;font-weight:600;letter-spacing:.2px}
.zg-app .run-sub{font-size:11px;font-weight:400;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.zg-app .run-status{flex:none;padding:3px 9px;border-radius:99px;background:var(--accent-soft);color:var(--accent);font-size:10px;font-weight:600}
.zg-app .run-status.failed{background:#fce8e9;color:var(--error)}
.zg-app .run-status.attention_required{background:#fdf2e2;color:var(--warm)}
.zg-app[data-theme=dark] .run-status.failed{background:#3a2325}
.zg-app[data-theme=dark] .run-status.attention_required{background:#3a3226}
.zg-app .zg-dialog{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px;background:#203b3926;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}
.zg-app[data-theme=dark] .zg-dialog{background:#0006}
.zg-app .zg-dialog-back{position:absolute;inset:0}
.zg-app .zg-dialog-card{position:relative;width:min(680px,100%);max-height:85vh;overflow:auto;overscroll-behavior:contain;padding:27px;border-radius:25px;background:var(--surface);border:1px solid var(--glass-edge);box-shadow:0 30px 80px -40px #223c3370}
.zg-app .zg-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border:1px solid var(--border);border-radius:50%;background:var(--surface);color:var(--muted);font-size:14px;line-height:1;cursor:pointer}
.zg-app .zg-close:hover{color:var(--text);border-color:var(--accent)}
.zg-app .dlg-top{display:flex;gap:18px;margin:0 0 16px}
.zg-app .dlg-top .poster{flex:none;width:104px;border-radius:12px}
.zg-app .dlg-top h2{margin:0 0 4px;font-size:19px;font-weight:650;letter-spacing:-.3px;padding-right:24px}
.zg-app .dlg-top p{margin:0 0 6px;font-size:12px;color:var(--muted);line-height:1.6}
.zg-app .dlg-notice{display:block;margin:8px 0 0;font-size:11px;color:var(--warm)}
.zg-app .zg-cands{display:flex;flex-direction:column;gap:8px;margin:12px 0 0}
.zg-app .cand{display:flex;align-items:center;gap:10px;width:100%;padding:11px 13px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--text);font:inherit;font-size:12px;text-align:left;cursor:pointer}
.zg-app .cand:hover{border-color:var(--accent)}
.zg-app .cand.picked{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.zg-app .cand-year{color:var(--muted);font-size:11px}
.zg-app .cand-exact{margin-left:auto;font-size:9px;font-weight:600;padding:3px 7px;border-radius:6px;background:var(--accent-soft);color:var(--accent)}

/* ===== 平板：左侧竖栏保留，内容改单列，避免两列表单被压扁 ===== */
@media (max-width:900px){
.zg-app .zg-main{padding:0 26px 56px}
.zg-app .zg-header{min-height:84px}
.zg-app .zg-form{grid-template-columns:minmax(0,1fr);padding:22px}
.zg-app .page-title{padding:18px 0 22px}
.zg-app .page-title h1{font-size:23px}
.zg-app .zg-grid{grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:24px 16px}
}

/* ===== 手机：竖栏转顶部横向导航，全部单列铺满 ===== */
@media (max-width:680px){
.zg-app{min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-text-size-adjust:100%}
.zg-app .zg-shell{grid-template-columns:minmax(0,1fr);min-height:100vh;min-height:100dvh}
/* 92px 竖栏在手机上占掉四分之一宽度，改成可横向滑动的顶部条 */
.zg-app .zg-rail{position:sticky;top:0;height:auto;max-height:none;flex-direction:row;align-items:center;justify-content:flex-start;gap:2px;padding:7px 8px;border-radius:0 0 18px 18px;border-left:1px solid var(--glass-edge);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.zg-app .zg-rail::-webkit-scrollbar{display:none}
.zg-app .zg-mark{width:32px;height:32px;border-radius:10px;font-size:13px;margin:0 8px 0 2px;flex:none;letter-spacing:0}
.zg-app .zg-tab{flex:1 0 auto;width:auto;min-width:0;padding:6px 11px;flex-direction:row;gap:5px;border-radius:10px;font-size:11px;white-space:nowrap}
.zg-app .zg-ico{font-size:15px}
.zg-app .zg-main{padding:0 15px calc(44px + env(safe-area-inset-bottom))}
.zg-app .zg-header{min-height:0;flex-direction:column;align-items:flex-start;gap:9px;padding:13px 0 2px}
.zg-app .zg-header-side{margin-left:0;width:100%;gap:10px}
.zg-app .zg-title h1{font-size:19px}
.zg-app .zg-title p{font-size:10.5px}
.zg-app .instance-pill{flex:0 0 auto;align-self:flex-start;min-height:32px;padding:0 12px;font-size:10.5px}
.zg-app .alert{font-size:11.5px;padding:10px 12px;border-radius:11px;margin-bottom:12px}
.zg-app .zg-toolbar{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
.zg-app .zg-chips{flex-wrap:nowrap;overflow-x:auto;gap:2px;padding:4px;border-radius:14px;scrollbar-width:none;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 18px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 18px),transparent)}
.zg-app .zg-chips::-webkit-scrollbar{display:none}
.zg-app .zg-chip{flex:none;padding:0 11px;font-size:11.5px}
.zg-app .zg-search{max-width:none;min-width:0;gap:8px}
.zg-app .zg-search .zg-input{flex:1 1 0;min-width:0}
.zg-app .zg-search .zg-select{flex:none;max-width:40%}
.zg-app .zg-go{flex:none;padding:0 15px}
.zg-app .zg-bulk{gap:8px;padding:9px 11px;margin-bottom:16px}
.zg-app .zg-checkall{flex:1 0 100%;font-size:11.5px}
.zg-app .zg-bulk .zg-btn{flex:1 1 0;min-width:0;padding:10px 8px;font-size:11.5px}
.zg-app .zg-grid{grid-template-columns:repeat(auto-fill,minmax(102px,1fr));gap:20px 12px}
.zg-app .poster{border-radius:11px}
.zg-app .card-meta{padding-top:9px}
.zg-app .card-meta h3{font-size:11.5px}
.zg-app .card-meta p{font-size:10px}
.zg-app .card-plus{display:none}
.zg-app .zg-more .zg-btn{width:100%}
.zg-app .zg-foot{flex-direction:column;gap:4px;font-size:10px;margin-top:20px}
.zg-app .page-title{padding:15px 0 18px}
.zg-app .page-title h1{font-size:20px;margin:6px 0}
.zg-app .page-title p{font-size:11px;line-height:1.6}
.zg-app .zg-form{padding:16px;border-radius:18px;gap:0}
.zg-app .zg-field{margin-bottom:16px;gap:7px}
.zg-app .zg-label{font-size:11px}
.zg-app .zg-hint,.zg-app .zg-err{font-size:10.5px;line-height:1.5}
/* iOS 在 16px 以下的输入框聚焦时会强制放大整页，这里统一抬到 16px */
.zg-app .zg-input,.zg-app .zg-select,.zg-app select{font-size:16px;min-height:46px}
.zg-app .zg-check{font-size:11.5px;padding:7px 10px}
.zg-app .switch-label{font-size:11.5px}
.zg-app .zg-switch .slider{width:42px;height:24px}
.zg-app .zg-switch .slider::after{width:18px;height:18px}
.zg-app .zg-switch input:checked+.slider::after{transform:translateX(18px)}
.zg-app .zg-actions{gap:9px;margin-top:12px}
.zg-app .zg-actions .zg-btn{flex:1 1 calc(50% - 5px);min-width:0;padding:10px 8px;font-size:11.5px}
.zg-app .zg-actions .zg-btn:first-child{flex-basis:100%}
.zg-app .zg-sub{margin:18px 0 9px;font-size:12px}
.zg-app .zg-logs{padding:2px 13px;border-radius:14px;max-height:none}
.zg-app .log-item{flex-direction:column;gap:2px;padding:9px 0;font-size:11.5px}
.zg-app .zg-runs{padding:2px 13px;border-radius:14px}
.zg-app .run-item{flex-wrap:wrap;gap:6px 10px;padding:10px 0}
.zg-app .run-title{flex:1 1 165px}
.zg-app .run-sub{white-space:normal}
.zg-app .zg-toast{bottom:18px;width:calc(100vw - 32px);max-width:none;padding:11px 18px;font-size:11.5px;justify-content:center;border-radius:16px}
/* 详情弹窗改底部抽屉：手机上居中弹窗会被首页地址栏和软键盘顶掉 */
.zg-app .zg-dialog{align-items:flex-end;padding:0}
.zg-app .zg-dialog-card{width:100%;max-height:90vh;max-height:90dvh;padding:20px 17px calc(22px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;border-bottom:0}
.zg-app .zg-close{top:12px;right:12px;width:30px;height:30px}
.zg-app .dlg-top{gap:14px}
.zg-app .dlg-top .poster{width:82px;border-radius:10px}
.zg-app .dlg-top h2{font-size:16.5px;padding-right:26px}
.zg-app .dlg-top p{font-size:11px}
.zg-app .dlg-notice{font-size:10.5px}
.zg-app .cand{font-size:11.5px;padding:10px 11px}
}
`;

function iconGlyph(name){
  const m={compass:'◎',bookmark:'☰',sliders:'⚙',activity:'⟳',search:'⌕',arrow:'→',film:'▣',star:'★',check:'✓',plus:'＋'};
  return m[name]||'•';
}
