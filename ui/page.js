// 追光 · 豆瓣即将上映 / Bangumi 新番 —— DIAN115 页面插件（干净重写）
// 修复：① 发现页勾选 + 批量订阅（原压缩包无此能力，导致“勾选后点击保存无效”）
//       ② 封面统一走宿主代理并加占位兜底（修复“图片显示不全”）
//       ③ 规则页清晰开启自动追新，并提供“立即追新”手动触发（修复“没自动订阅”）
// 后端契约保持不变：storage(state/config) + tasks.run(browse/engine) + plugin-host/emby + tmdb。

const FEEDS = {'douban-tv':'豆瓣剧集','douban-movie':'豆瓣电影','douban-soon':'豆瓣即将上映',bangumi:'Bangumi 新番'};
const WEEKDAYS = ['周一','周二','周三','周四','周五','周六','周日'];
const STATUS_NAMES = {prepared:'待提交',submitting:'正在提交',unknown:'结果待核对',active:'追更中',complete:'已入库',blocked:'已停订',attention:'需人工核对',deleting:'正在停订',delete_unknown:'删除待核对'};
const HOST_NAMES = {pending:'等待资源',searching:'搜索资源',transferring:'转存中',partial:'部分入库',caught_up:'已追平',landed:'已入库',failed:'等待处理',expired:'已结束'};
const DEFAULT_CONFIG = ()=>({proxyId:null,proxyName:'',auto:false,intervalMinutes:60,feeds:{'douban-tv':true,'douban-movie':true,'douban-soon':true,bangumi:true},minScore:7,minVotes:0,yearFrom:new Date().getFullYear(),include:'',exclude:'',pageCount:2,minWish:5000,soonWindowDays:30});
const INITIAL_STATE = ()=>({version:1,records:{},blocks:{},catalog:{},review:{},logs:[],lastSync:0,lastAuto:0});

function el(tag, props, children){
  const n = document.createElement(tag);
  if(props) for(const k in props){
    const v = props[k];
    if(k==='class') n.className = v;
    else if(k==='text') n.textContent = v;
    else if(k==='html') n.innerHTML = v;
    else if(k==='disabled') n.disabled = !!v;
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

export async function mount(root, ctx){
  let disposed = false;
  const pid = ctx.id || (ctx.plugin&&ctx.plugin.id);
  const storePath = (key)=>`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIContentType(key)}`;
  function encodeURIContentType(k){ return encodeURIComponent(k); }

  // ---- 存储 ----
  async function apiGet(key, fallback){
    const r = await ctx.api.get(`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIComponent(key)}`);
    if(!r || typeof r.revision!=='number') throw new Error('插件存储响应无效');
    return { value: r.value!=null?r.value:structuredClone(fallback!=null?fallback:null), revision: r.revision };
  }
  async function apiPut(key, fn, fallback){
    for(let i=0;i<8;i++){
      const cur = await apiGet(key, fallback);
      const out = fn(cur.value);
      try{ await ctx.api.put(`/api/extensions/v3/${encodeURIComponent(pid)}/storage/${encodeURIComponent(key)}`, {value:cur.value, expected_revision:cur.revision}); return out; }
      catch(e){ if(!/409/.test(String(e&&(e.status||e.response&&e.response.status)))) throw e; }
    }
    throw new Error('保存遇到并发冲突，请刷新后重试');
  }

  // ---- 任务 ----
  async function runTask(jobId, input, runId){
    let task = await ctx.tasks.run(jobId, input, runId || `${jobId}:${input&&input.action||'run'}:${Date.now()}-${Math.random().toString(36).slice(2)}`);
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
  const _imgQueue = []; let _imgInflight = 0; const _imgCache = new Map();
  function enqueueCover(url, apply){
    if(!url) return;
    if(_imgCache.has(url)){ apply(_imgCache.get(url)); return; }
    _imgQueue.push({url, apply, sig:++_imgSeen});
    pumpCovers();
  }
  let _imgSeen = 0;
  function pumpCovers(){
    while(_imgInflight < 6 && _imgQueue.length){
      const job = _imgQueue.shift(); _imgInflight++;
      doProxy(job.url).then(d=>{ _imgCache.set(job.url, d); }).finally(()=>{ _imgInflight--; pumpCovers(); });
    }
  }
  async function doProxy(url){
    try{
      const r = await ctx.http.request({url, headers:{Referer: url.includes('doubanio.com')?'https://movie.douban.com/':'https://bgm.tv/','User-Agent':'Mozilla/5.0'}, response_type:'base64', timeout_seconds:15, max_bytes:1024*1024, cache_seconds:86400, session:'public-covers'});
      const ct = pickContentType(r);
      if(r.status===200 && /^image\//.test(ct) && r.body_base64) return `data:${ct};base64,${r.body_base64}`;
    }catch(e){}
    return null;
  }
  function pickContentType(r){
    const h = r&&r.headers; if(!h) return '';
    const entry = Array.isArray(h)?h.find(([k])=>String(k).toLowerCase()==='content-type'):h['content-type']||h['Content-Type'];
    const v = Array.isArray(entry)?entry[0]:entry;
    return String(v||'').split(';')[0];
  }
  async function imageProxy(url){
    if(!url) return null;
    try{
      const r = await ctx.http.request({url, headers:{Referer: url.includes('doubanio.com')?'https://movie.douban.com/':'https://bgm.tv/','User-Agent':'Mozilla/5.0'}, response_type:'base64', timeout_seconds:15, max_bytes:1024*1024, cache_seconds:86400, session:'public-covers'});
      const ct = pickContentType(r);
      if(r.status===200 && /^image\//.test(ct) && r.body_base64) return `data:${ct};base64,${r.body_base64}`;
    }catch(e){}
    return null;
  }
  function attachCover(posterWrap, url, title){
    const img = posterWrap.querySelector('.poster-img');
    const fb = posterWrap.querySelector('.poster-fallback');
    if(!url){ if(fb) fb.classList.remove('hidden'); return; }
    imageProxy(url).then(dataUrl=>{
      if(disposed) return;
      if(dataUrl){ img.src=dataUrl; img.hidden=false; img.onerror=()=>{ img.hidden=true; if(fb) fb.classList.remove('hidden'); }; if(fb) fb.classList.add('hidden'); }
      else { img.hidden=true; if(fb) fb.classList.remove('hidden'); }
    });
  }

  // ---- 配置校验（与后端 normalizeConfig 对齐） ----
  function normalizeConfig(raw){
    const c = Object.assign(DEFAULT_CONFIG(), raw||{}, {feeds:Object.assign({'douban-tv':true,'douban-movie':true,'douban-soon':true,bangumi:true}, (raw&&raw.feeds)||{})});
    if(c.proxyId!==null && (!Number.isSafeInteger(c.proxyId)||c.proxyId<=0)) throw new Error('请选择具有独立 ID 的固定 Emby 实例');
    if(c.auto && !c.proxyId) throw new Error('启用自动追新前，请先选择固定 Emby 实例');
    if(!Number.isFinite(Number(c.minWish))) c.minWish=5000;
    if(!Number.isFinite(Number(c.soonWindowDays))) c.soonWindowDays=30;
    for(const [k,min,max] of [['minScore',0,10],['minVotes',0,1000000],['yearFrom',1900,2100],['intervalMinutes',15,1440],['pageCount',1,5],['minWish',0,1000000],['soonWindowDays',1,365]])
      if(!Number.isFinite(Number(c[k]))||Number(c[k])<min||Number(c[k])>max) throw new Error('筛选设置超出范围');
    for(const k of ['minVotes','yearFrom','intervalMinutes','pageCount','minWish','soonWindowDays']) c[k]=Math.trunc(Number(c[k]));
    c.minScore=Number(c.minScore); c.auto=!!c.auto;
    c.include=String(c.include||'').slice(0,200); c.exclude=String(c.exclude||'').slice(0,200); c.proxyName=String(c.proxyName||'').slice(0,160);
    c.feeds=Object.fromEntries(Object.keys(FEEDS).map(k=>[k,!!c.feeds[k]]));
    return c;
  }

  // ---- 应用状态 ----
  const S = {
    tab:'discover', config:DEFAULT_CONFIG(), db:INITIAL_STATE(), emby:[], runs:[],
    feed:'all', query:'', searchSource:'douban', sort:'default', remote:null, weekday:0,
    busy:false, error:'', toast:'', lastFetch:0, sourceErrors:[],
    selection:new Set(), // 发现页勾选的作品 sourceKey 集合
    detail:null, candidates:[], matchQuery:'', seasons:[], season:0, notice:'', restore:false,
    confirmStop:null, dialogOpen:false, dirty:false,
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
    S.detail = work; S.candidates=[]; S.matchQuery=work.title; S.seasons=[]; S.season=0; S.notice=''; S.restore=false; S.confirmStop=null; S.dialogOpen=true;
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
    const v = normalizeConfig(S.config);
    const inst = S.emby.find(j=>j.id===v.proxyId && j.api_key_configured);
    if(v.proxyId && !inst) throw new Error('所选 Emby 实例不可用，请刷新实例列表');
    v.proxyName = inst?inst.name:'';
    await apiPut('config', ()=>Object.assign({}, v), DEFAULT_CONFIG());
    S.config = v; S.dirty=false; toast('规则已保存；已有订阅继续使用原来的固定实例');
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
  function selectAllVisible(on){ const items = currentItems(); items.forEach(w=>{ const k=sourceKeyOf(w); if(on) S.selection.add(k); else S.selection.delete(k); }); updateBulkBar(); }
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
    let created=0, skipped=0, needManual=[];
    for(const work of items){
      if(disposed) break;
      try{
        const choice = await autoMatch(work);
        if(!choice){ needManual.push(work); continue; }
        const key = sourceKeyOf(work);
        const gen = ((S.db.records[identityKey(choice)]&&S.db.records[identityKey(choice)].generation)||0)+1;
        const r = await runTask('engine', {action:'create', work, choice, confirmed:true}, `create:${key}:${choice.mediaType}:${choice.tmdbId}:${choice.season}:${S.config.proxyId}:g${gen}`);
        if(r.hostId||r.existing||r.complete) created++; else if(r.skipped) skipped++;
      }catch(e){ needManual.push(work); }
    }
    await loadDb();
    S.selection.clear(); updateBulkBar();
    if(needManual.length){ openWork(needManual[0]); toast(`已订阅 ${created} 条，${needManual.length} 条需手动匹配`); }
    else toast(`批量订阅完成：新增 ${created} 条${skipped?`，跳过 ${skipped} 条`:''}`);
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
  const wrap = el('section',{class:'zg'});
  const style = el('style',{text:CSS});
  wrap.append(style);
  const rail = el('nav',{class:'zg-rail glass', 'aria-label':'主导航'});
  const tabs = [['discover','发现','compass'],['library','我的订阅','bookmark'],['rules','追新规则','sliders'],['activity','运行记录','activity']];
  tabs.forEach(([id,label,icon])=>{
    const b = el('button',{class:'zg-tab'+(S.tab===id?' active':''), 'aria-current':S.tab===id?'page':null, onClick:()=>switchTab(id)}, [
      el('span',{class:'zg-ico', text:iconGlyph(icon)}), el('span',{text:label})
    ]);
    rail.append(b);
  });
  const main = el('div',{class:'zg-main'});
  wrap.append(rail, main);
  root.append(wrap);

  function switchTab(id){ S.tab=id; if(id==='activity'){ loadRuns().catch(()=>{}); } if(id==='rules'){ loadEmby().catch(()=>{}); } rerenderAll(); }
  function rerenderAll(){ clear(main); main.append(renderHeader()); main.append(renderTab()); }
  function rerenderTab(){ const old = main.querySelector('.zg-tabbody'); if(old) old.remove(); main.append(renderTab()); }
  function renderHeader(){
    return el('header',{class:'zg-header'},[
      el('div',{class:'zg-title'},[el('h1',{text:'追光'}), el('p',{text:'豆瓣影视与 Bangumi 新番，静候更新'})]),
      S.busy?el('span',{class:'zg-spinner'}):null,
      S.error?el('div',{class:'alert error', text:S.error}):null,
      S.toast?el('div',{class:'zg-toast', text:S.toast}):null
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
      chips.append(el('button',{class:'zg-chip'+(S.feed===id?' selected':''), 'aria-pressed':S.feed===id, onClick:()=>{S.feed=id; S.remote=null; S.query=''; S.weekday=0; refreshCatalog().then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();});}},[
        id!=='all'?el('span',{class:'src-dot '+(id==='bangumi'?'pink':'green')}):null, label
      ]));
    });
    // 搜索 + 排序
    const form = el('form',{class:'zg-search', onSubmit:(e)=>{e.preventDefault(); searchCatalog().then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();});}});
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
      el('button',{class:'zg-btn primary', id:'zg-subscribe-selected', text:`订阅所选 (${S.selection.size})`, onClick:()=>busyWrap(subscribeSelected).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();})}),
      el('button',{class:'zg-btn', text:'清空选择', onClick:()=>{S.selection.clear(); updateBulkBar();}})
    );
    box.append(bulkBar);

    // 网格
    const items = currentItems();
    const grid = el('div',{class:'zg-grid'});
    if(!items.length){
      grid.append(el('div',{class:'zg-empty'},[el('div',{class:'zg-ico big',text:'◎'}), el('h3',{text:S.busy?'正在寻找好故事':(S.remote?'没有匹配的搜索结果':'还没有片单')}), el('p',{text:'调整筛选条件，或刷新公开片单。'}),
        el('button',{class:'zg-btn',text:'刷新片单', onClick:()=>busyWrap(refreshCatalog).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();})})]));
    } else {
      items.forEach(w=>grid.append(renderCard(w)));
    }
    box.append(grid);
    box.append(el('div',{class:'zg-foot'},[el('span',{text:'好故事不必急着看，先把期待收藏好。'}),el('span',{text:'公开目录快照 · 资源搜索由宿主完成'})]));
    return box;
  }
  function renderCard(w){
    const k=sourceKeyOf(w);
    const poster = el('div',{class:'poster'});
    const fb = el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}), el('span',{text:w.title})]);
    const img = el('img',{class:'poster-img', alt:w.title+'海报', loading:'lazy', decoding:'async', hidden:true});
    poster.append(fb, img);
    attachCover(poster, w.cover, w.title);
    const card = el('article',{class:'media-card'+(S.selection.has(k)?' selected':'')},[
      el('label',{class:'card-check'},[el('input',{type:'checkbox', checked:S.selection.has(k), onchange:()=>{toggleSelect(w); card.classList.toggle('selected');}})]),
      el('button',{class:'poster-btn', 'aria-label':'查看并订阅 '+w.title, onClick:()=>busyWrap(()=>openWork(w)).catch(err=>{S.error=err.message;rerenderTab();})},[poster]),
      el('div',{class:'card-meta'},[
        el('h3',{text:w.title}),
        el('p',{text:[w.year||'待确认年份', w.source==='bangumi'?(w.weekday?WEEKDAYS[w.weekday-1]+'放送':'动画'):w.mediaType==='movie'?'电影':(w.progress||'剧集')].join(' · ')}),
        el('div',{class:'card-tags'},[
          el('span',{class:'src-tag '+w.source, text:w.source==='douban'?'豆瓣':'Bangumi'}),
          w.score?el('span',{class:'score'},[el('span',{class:'zg-ico',text:'★'}),Number(w.score).toFixed(1)]):null,
          itemBadge(w)?el('span',{class:'badge', text:itemBadge(w)}):null
        ])
      ]),
      el('button',{class:'card-plus', 'aria-label':'订阅 '+w.title, onClick:()=>busyWrap(()=>openWork(w)).catch(err=>{S.error=err.message;rerenderTab();})},[el('span',{class:'zg-ico',text:'＋'})])
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
      const poster = el('div',{class:'poster'}); const fb=el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}),el('span',{text:r.work&&r.work.title||'作品'})]); const img=el('img',{class:'poster-img',loading:'lazy',decoding:'async',hidden:true}); poster.append(fb,img);
      if(r.work) attachCover(poster, r.work.cover, r.work.title);
      grid.append(el('article',{class:'media-card'},[poster, el('div',{class:'card-meta'},[
        el('h3',{text:(r.work&&r.work.title)||'作品'}),
        el('p',{text:STATUS_NAMES[r.status]||r.status}),
        r.covered?el('p',{class:'sub',text:'已拥有 '+r.covered+' 集'}):null,
        r.error?el('p',{class:'err',text:r.error}):null,
        el('button',{class:'zg-btn small', text:r.status==='blocked'?'恢复订阅':'停止订阅', onClick:()=>busyWrap(()=>askStop(r)).catch(err=>{S.error=err.message;rerenderTab();})})
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
    const instSel = el('select',{class:'zg-input', 'aria-label':'固定 Emby 实例', onchange:(e)=>{S.config.proxyId=Number(e.target.value)||null; S.dirty=true;}});
    instSel.append(el('option',{value:'',text:'— 请选择固定 Emby 实例 —'}));
    S.emby.forEach(j=>instSel.append(el('option',{value:String(j.id), text:j.name+(j.api_key_configured?'':'（未配置密钥）')})));
    instSel.value = S.config.proxyId!=null?String(S.config.proxyId):'';
    form.append(field('固定 Emby 实例', instSel, '每条订阅只认定一个媒体库；实例不可用时暂停处理，不切换到其他媒体库。更改此设置只影响新订阅。'));
    // 自动追新开关
    const autoWrap = el('label',{class:'zg-switch'});
    const autoCb = el('input',{type:'checkbox', checked:!!S.config.auto, onchange:(e)=>{S.config.auto=e.target.checked; S.dirty=true; updateRulesValidity();}});
    autoWrap.append(autoCb, el('span',{class:'slider'}), el('span',{class:'switch-label', text:'启用自动追新'}));
    form.append(field('自动追新', autoWrap, '开启后，插件按间隔自动从公开目录发现并订阅符合条件的作品（需先选择 Emby 实例）。也可随时点“立即追新”手动触发。'));
    // 立即追新按钮
    form.append(el('button',{class:'zg-btn primary', text:'立即追新一次', onClick:()=>busyWrap(runAutoNow).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();}), disabled:S.busy}));
    // 来源
    const feedsWrap = el('div',{class:'zg-feeds'});
    Object.keys(FEEDS).forEach(f=>{ const l=el('label',{class:'zg-check'}); const c=el('input',{type:'checkbox',checked:!!S.config.feeds[f],onchange:(e)=>{S.config.feeds[f]=e.target.checked;S.dirty=true;}}); l.append(c, FEEDS[f]); feedsWrap.append(l); });
    form.append(field('订阅来源', feedsWrap, '豆瓣剧集 / 豆瓣电影 / Bangumi 新番。'));
    // 筛选
    form.append(field('最低评分', numInput('minScore',0,10,0.1)));
    form.append(field('最低投票数', numInput('minVotes',0,1000000,1)));
    form.append(field('起始年份', numInput('yearFrom',1900,2100,1)));
    form.append(field('仅包含关键词', textInput('include','如：科幻,悬疑')));
    form.append(field('排除关键词', textInput('exclude','如：真人秀')));
    form.append(field('检查间隔（分钟）', numInput('intervalMinutes',15,1440,5)));
    form.append(field('豆瓣片单读取页数', numInput('pageCount',1,5,1)));
    // 即将上映（豆瓣即将上映）专用筛选：按「想看人数阈值」+「上映窗口」过滤（评分/投票不适用）
    form.append(field('即将上映·想看人数阈值', numInput('minWish',0,1000000,100)));
    form.append(field('即将上映·上映窗口(天)', numInput('soonWindowDays',1,365,1)));
    box.append(form);
    box.append(el('div',{class:'zg-actions'},[
      el('button',{class:'zg-btn primary', text:'保存规则', onClick:()=>busyWrap(saveRules).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();}), disabled:S.busy}),
      el('button',{class:'zg-btn', text:'核对宿主订阅', onClick:()=>busyWrap(syncNow).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();}), disabled:S.busy})
    ]));
    updateRulesValidity();
    return box;
  }
  function field(label, control, hint){ return el('div',{class:'zg-field'},[el('label',{class:'zg-label',text:label}), control, hint?el('p',{class:'zg-hint',text:hint}):null]); }
  function numInput(key,min,max,step){ const i=el('input',{class:'zg-input',type:'number',value:Number(S.config[key]),min,max,step,oninput:(e)=>{S.config[key]=Number(e.target.value);S.dirty=true;updateRulesValidity();}}); return i; }
  function textInput(key,ph){ return el('input',{class:'zg-input',type:'text',value:String(S.config[key]||''),placeholder:ph,oninput:(e)=>{S.config[key]=e.target.value;S.dirty=true;}}); }
  function updateRulesValidity(){ const btn = main.querySelector('.zg-actions .primary'); }

  // ---- 运行记录 ----
  function renderActivity(){
    const box = el('div',{class:'zg-act'});
    box.append(el('div',{class:'page-title'},[el('div',{class:'eyebrow',text:'ACTIVITY'}),el('h1',{text:'每一次追新，都有迹可循。'}),el('p',{text:'最近一次追新：'+fmtTime(S.db.lastAuto)+'；最近核对：'+fmtTime(S.db.lastSync)})]));
    box.append(el('div',{class:'zg-actions'},[el('button',{class:'zg-btn',text:'核对宿主订阅',onClick:()=>busyWrap(syncNow).then(rerenderTab).catch(err=>{S.error=err.message;rerenderTab();}),disabled:S.busy})]));
    const logs = (S.db.logs||[]).slice(0,40);
    box.append(el('h3',{class:'zg-sub',text:'日志'}));
    const logBox = el('div',{class:'zg-logs glass'});
    if(!logs.length) logBox.append(el('div',{class:'zg-empty small',text:'暂无日志'}));
    logs.forEach(l=>logBox.append(el('div',{class:'log-item '+(l.level==='warning'?'warn':'')},[el('span',{class:'log-time',text:fmtTime(l.at)}), el('span',{class:'log-msg',text:l.message})])));
    box.append(logBox);
    box.append(el('h3',{class:'zg-sub',text:'运行任务'}));
    const runsBox = el('div',{class:'zg-runs glass'});
    if(!S.runs.length) runsBox.append(el('div',{class:'zg-empty small',text:'暂无运行记录'}));
    S.runs.forEach(t=>runsBox.append(el('div',{class:'run-item'},[el('span',{class:'run-title',text:(t.title||t.id||'任务')}), el('span',{class:'run-status '+t.status,text:t.status}), t.status==='attention_required'?el('button',{class:'zg-btn small',text:'恢复核对',onClick:()=>busyWrap(()=>retryRun(t.id)).catch(err=>{S.error=err.message;rerenderTab();})},):null])));
    box.append(runsBox);
    return box;
  }

  // ---- 详情 / 匹配对话框 ----
  function renderDialog(){
    const dlg = main.querySelector('.zg-dialog');
    if(!S.dialogOpen){ if(dlg) dlg.remove(); return; }
    if(!dlg){
      const back = el('div',{class:'zg-dialog-back', onClick:()=>{S.dialogOpen=false; rerenderDialog();}});
      const card = el('div',{class:'zg-dialog-card glass'});
      dlg = el('div',{class:'zg-dialog', id:'zg-dialog'},[back, card]);
      main.append(dlg);
    }
    const card = dlg.querySelector('.zg-dialog-card'); clear(card);
    const w = S.detail;
    const poster = el('div',{class:'poster small'}); const fb=el('div',{class:'poster-fallback'},[el('span',{class:'zg-ico',text:'◎'}),el('span',text:(w&&w.title)||'作品'})]); const img=el('img',{class:'poster-img',loading:'lazy',decoding:'async',hidden:true}); poster.append(fb,img);
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
      card.append(el('button',{class:'zg-btn danger',text:S.confirmStop.confirmAbsent?'确认未创建并停订':'停止订阅',onClick:()=>busyWrap(stopSub).then(renderDialog).catch(err=>{S.error=err.message;rerenderDialog();})}));
    } else if(S.candidates.length){
      card.append(el('button',{class:'zg-btn primary',text:S.restore?'手动恢复订阅':'创建订阅',onClick:()=>busyWrap(createSub).then(rerenderTab).catch(err=>{S.error=err.message;rerenderDialog();})},));
    }
    return dlg;
  }

  // ---- 小工具 ----
  async function busyWrap(fn){ S.busy=true; S.error=''; rerenderHeaderOnly(); try{ return await fn(); } finally { S.busy=false; rerenderHeaderOnly(); } }
  function rerenderHeaderOnly(){ const old=main.querySelector('.zg-header'); if(old){ const h=renderHeader(); old.replaceWith(h); } else main.prepend(renderHeader()); }
  function toast(msg){ S.toast=msg; const old=main.querySelector('.zg-toast'); if(old) old.remove(); main.querySelector('.zg-header').append(el('div',{class:'zg-toast',text:msg})); setTimeout(()=>{ S.toast=''; const t=main.querySelector('.zg-toast'); if(t) t.remove(); }, 4200); }

  // 初始加载
  rerenderAll();
  loadAll().then(()=>{ rerenderAll(); updateBulkBar(); }).catch(err=>{ S.error=err.message||String(err); rerenderAll(); });
  const poll = setInterval(()=>{ if(!S.busy){ loadDb().then(()=>{ if(S.tab==='library'||S.tab==='activity') rerenderTab(); }).catch(()=>{}); } }, 20000);

  return ()=>{ disposed=true; clearInterval(poll); wrap.remove(); };
}

// ---- 静态资源 ----
const CSS = `
.zg{background:var(--app-bg,#0f1115);color:var(--app-text,#e8eaf0);min-height:100%;display:flex;gap:0;padding:0;box-sizing:border-box;font:14px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","Microsoft YaHei",sans-serif}
.zg *{box-sizing:border-box}
.zg-rail{position:sticky;top:0;align-self:flex-start;width:188px;min-height:100vh;padding:18px 12px;display:flex;flex-direction:column;gap:6px}
.zg-tab{display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;border:none;border-radius:12px;background:transparent;color:var(--app-text-secondary,#9aa3b2);font:inherit;font-weight:600;cursor:pointer;text-align:left}
.zg-tab:hover{color:var(--app-text,#e8eaf0);background:var(--app-surface,#1a1d24)}
.zg-tab.active{color:#fff;background:var(--app-accent,#7c5cff)}
.zg-ico{font-style:normal;display:inline-block}
.zg-ico.big{font-size:40px;opacity:.5}
.zg-main{flex:1;min-width:0;padding:18px 22px 60px}
.zg-header{display:flex;align-items:center;gap:14px;margin:0 0 16px;min-height:34px}
.zg-title h1{margin:0;font-size:22px;font-weight:700}
.zg-title p{margin:2px 0 0;color:var(--app-text-secondary,#9aa3b2);font-size:13px}
.zg-spinner{width:18px;height:18px;border:2px solid var(--app-border,#2a2f3a);border-top-color:var(--app-accent,#7c5cff);border-radius:50%;animation:zg-spin .8s linear infinite}
@keyframes zg-spin{to{transform:rotate(360deg)}}
.alert{margin:0 0 12px;padding:10px 14px;border-radius:10px;font-size:13px}
.alert.error{background:rgba(255,90,90,.12);color:#ff8a8a;border:1px solid rgba(255,90,90,.3)}
.alert.warn{background:rgba(255,190,90,.12);color:#ffcf8a;border:1px solid rgba(255,190,90,.3)}
.zg-toast{margin-left:auto;padding:8px 14px;border-radius:999px;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);font-size:13px;color:var(--app-text,#e8eaf0)}
.zg-toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 12px}
.zg-chips{display:flex;flex-wrap:wrap;gap:8px}
.zg-chip{padding:7px 14px;font:inherit;color:var(--app-text-secondary,#9aa3b2);background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:999px;cursor:pointer}
.zg-chip:hover{color:var(--app-text,#e8eaf0);border-color:var(--app-accent,#7c5cff)}
.zg-chip.selected{color:#fff;background:var(--app-accent,#7c5cff);border-color:var(--app-accent,#7c5cff)}
.src-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px}
.src-dot.green{background:#3ecf8e}.src-dot.pink{background:#ff7ac6}
.zg-search{display:flex;gap:8px;align-items:center}
.zg-input{flex:1;min-width:160px;min-height:40px;padding:0 14px;font:inherit;color:inherit;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:10px;outline:none}
.zg-input:focus{border-color:var(--app-accent,#7c5cff)}
.zg-select{padding:0 10px;min-height:40px;font:inherit;color:inherit;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:10px;outline:none}
.zg-go{min-height:40px;padding:0 18px;font:inherit;font-weight:600;color:#fff;background:var(--app-accent,#7c5cff);border:none;border-radius:10px;cursor:pointer}
.zg-go:disabled{opacity:.5;cursor:default}
.zg-bulk{display:flex;align-items:center;gap:12px;margin:0 0 14px;padding:8px 12px;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:12px}
.zg-checkall{display:flex;align-items:center;gap:6px;color:var(--app-text-secondary,#9aa3b2);font-size:13px;cursor:pointer}
.zg-btn{padding:9px 16px;font:inherit;font-weight:600;color:var(--app-text,#e8eaf0);background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:10px;cursor:pointer}
.zg-btn:hover{border-color:var(--app-accent,#7c5cff)}
.zg-btn.primary{color:#fff;background:var(--app-accent,#7c5cff);border-color:var(--app-accent,#7c5cff)}
.zg-btn.small{padding:6px 12px;font-size:13px}
.zg-btn.danger{color:#fff;background:#e0533d;border-color:#e0533d}
.zg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
.media-card{position:relative;display:flex;flex-direction:column;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:14px;overflow:hidden;transition:.15s}
.media-card:hover{transform:translateY(-3px);border-color:var(--app-accent,#7c5cff);box-shadow:0 8px 24px rgba(0,0,0,.35)}
.media-card.selected{border-color:var(--app-accent,#7c5cff);box-shadow:0 0 0 2px var(--app-accent,#7c5cff)}
.card-check{position:absolute;top:8px;left:8px;z-index:3;width:22px;height:22px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);border-radius:6px}
.card-check input{width:16px;height:16px;cursor:pointer}
.poster-btn{border:none;padding:0;background:none;cursor:pointer;display:block;width:100%}
.poster{position:relative;width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#2a2f3a,#1a1d24);display:flex;align-items:center;justify-content:center;overflow:hidden}
.poster.small{aspect-ratio:2/3;width:120px}
.poster-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.poster-fallback{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;text-align:center;color:var(--app-text-secondary,#9aa3b2);font-size:13px}
.poster-fallback.hidden{display:none}
.poster-fallback .zg-ico{font-size:30px;opacity:.5}
.card-meta{padding:10px 12px 12px}
.card-meta h3{margin:0;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-meta p{margin:3px 0 0;font-size:12px;color:var(--app-text-secondary,#9aa3b2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-meta p.sub{color:#3ecf8e}.card-meta p.err{color:#ff8a8a}
.card-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;align-items:center}
.src-tag{font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(124,92,255,.18);color:#c9bcff}
.src-tag.bangumi{background:rgba(255,122,198,.18);color:#ffb3e0}
.score{display:inline-flex;align-items:center;gap:3px;font-size:12px;color:#ffcf6a}
.badge{font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(62,207,142,.16);color:#7fe3b0}
.card-plus{position:absolute;top:8px;right:8px;z-index:3;width:30px;height:30px;border:none;border-radius:8px;background:rgba(0,0,0,.45);color:#fff;font-size:16px;cursor:pointer}
.card-plus:hover{background:var(--app-accent,#7c5cff)}
.zg-empty{padding:48px 20px;text-align:center;color:var(--app-text-secondary,#9aa3b2);grid-column:1/-1}
.zg-empty h3{margin:0 0 6px}.zg-empty p{margin:0 0 12px;font-size:13px}
.zg-empty.small{padding:20px}
.zg-foot{display:flex;justify-content:space-between;margin-top:18px;font-size:12px;color:var(--app-text-secondary,#9aa3b2)}
.page-title{margin:0 0 16px}.page-title .eyebrow{font-size:12px;letter-spacing:2px;color:var(--app-accent,#7c5cff);font-weight:700}.page-title h1{margin:4px 0 6px;font-size:24px}.page-title p{margin:0;color:var(--app-text-secondary,#9aa3b2);font-size:13px}
.glass{background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:16px}
.zg-form{padding:18px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.zg-field{display:flex;flex-direction:column;gap:6px}
.zg-label{font-weight:600;font-size:13px}
.zg-hint{margin:0;font-size:12px;color:var(--app-text-secondary,#9aa3b2)}
.zg-switch{display:flex;align-items:center;gap:10px;cursor:pointer}
.zg-switch input{display:none}
.zg-switch .slider{width:42px;height:24px;border-radius:999px;background:var(--app-border,#2a2f3a);position:relative;transition:.15s;flex:none}
.zg-switch .slider::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:.15s}
.zg-switch input:checked+.slider{background:var(--app-accent,#7c5cff)}
.zg-switch input:checked+.slider::after{transform:translateX(18px)}
.switch-label{font-weight:600;font-size:14px}
.zg-feeds{display:flex;flex-wrap:wrap;gap:12px}
.zg-check{display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px}
.zg-actions{display:flex;gap:12px;margin-top:16px}
.zg-lib .zg-grid,.zg-act .zg-grid{margin-top:14px}
.zg-sub{margin:18px 0 8px;font-size:15px}
.zg-logs{padding:12px 14px;max-height:320px;overflow:auto}
.log-item{display:flex;gap:12px;padding:6px 0;border-bottom:1px solid var(--app-border,#2a2f3a);font-size:13px}
.log-time{color:var(--app-text-secondary,#9aa3b2);flex:none;font-variant-numeric:tabular-nums}
.log-item.warn .log-msg{color:#ffcf8a}
.zg-runs{padding:10px 14px}
.run-item{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--app-border,#2a2f3a);font-size:13px}
.run-title{flex:1}.run-status{flex:none;padding:2px 8px;border-radius:999px;background:rgba(124,92,255,.16);color:#c9bcff;font-size:12px}
.run-status.failed{background:rgba(255,90,90,.16);color:#ff8a8a}
.run-status.attention_required{background:rgba(255,190,90,.16);color:#ffcf8a}
.zg-dialog{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;z-index:50}
.zg-dialog-back{position:absolute;inset:0}
.zg-dialog-card{position:relative;width:min(480px,100%);max-height:86vh;overflow:auto;padding:22px;background:var(--app-surface,#1a1d24);border:1px solid var(--app-border,#2a2f3a);border-radius:18px}
.zg-close{position:absolute;top:12px;right:12px;width:30px;height:30px;border:none;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:15px;cursor:pointer}
.dlg-top{display:flex;gap:16px;margin-bottom:14px}
.dlg-top .poster{flex:none;width:110px}
.dlg-top h2{margin:0;font-size:18px}.dlg-top p{margin:4px 0 0;color:var(--app-text-secondary,#9aa3b2);font-size:13px}
.dlg-notice{color:#ffcf8a;font-size:13px}
.zg-cands{display:flex;flex-direction:column;gap:8px;margin-top:6px}
.cand{display:flex;align-items:center;gap:10px;padding:10px 12px;text-align:left;font:inherit;color:inherit;background:var(--app-bg,#0f1115);border:1px solid var(--app-border,#2a2f3a);border-radius:10px;cursor:pointer}
.cand:hover{border-color:var(--app-accent,#7c5cff)}
.cand.picked{border-color:var(--app-accent,#7c5cff);box-shadow:0 0 0 2px var(--app-accent,#7c5cff)}
.cand-year{color:var(--app-text-secondary,#9aa3b2);font-size:12px}.cand-exact{margin-left:auto;font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(62,207,142,.16);color:#7fe3b0}
`;

function iconGlyph(name){
  const m={compass:'◎',bookmark:'▾',sliders:'⚙',activity:'⟳',search:'⌕',arrow:'→',film:'▣',star:'★',check:'✓',plus:'＋'};
  return m[name]||'•';
}
