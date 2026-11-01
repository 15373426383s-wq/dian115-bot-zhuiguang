import {config} from '../lib/store.js';
import {refreshCatalog,loadDetail,searchCatalog,loadDetailCache,saveDetailCache} from '../lib/catalog.js';
import {matchCandidates,tmdbDetail} from '../lib/metadata.js';
import {FEEDS,canonicalWork,cleanError} from '../lib/model.js';
export async function run(ctx,input={}){
  await loadDetailCache(ctx)
  try{
    if(input.action==='match'){
      let work,notice='';
      try{work=await loadDetail(ctx,input.work);}catch(e){if(input.work?.source!=='douban')throw e;work=canonicalWork(input.work);notice=cleanError(e)+'；本次需要你亲自确认片名、年份与季数。';}
      return {work,notice,candidates:await matchCandidates(ctx,work,input.query||'')};
    }
    if(input.action==='tmdb')return tmdbDetail(ctx,input.mediaType,input.tmdbId);
    if(input.action==='search')return {items:await searchCatalog(ctx,input.source,input.query)};
    const c=await config(ctx);return refreshCatalog(ctx,input.feed?[input.feed]:Object.keys(FEEDS),c.pageCount,{force:true});
  }finally{
    await saveDetailCache(ctx)
  }
}
export async function recover(){return {action:'resume'};}
