import {initialState,initialConfig,fault,statusCode} from './model.js';
export const keyPath=(ctx,key)=>`/api/extensions/v3/${encodeURIComponent(ctx.id||ctx.plugin.id)}/storage/${encodeURIComponent(key)}`;
export async function read(ctx,key,fallback=null){const r=await ctx.api.get(keyPath(ctx,key));if(!r||typeof r.revision!=='number')throw fault('插件存储响应无效');return {value:r.value??structuredClone(fallback),revision:r.revision};}
export async function mutate(ctx,key,fn,fallback=null){
  for(let i=0;i<8;i++){const r=await read(ctx,key,fallback),result=fn(r.value);try{await ctx.api.put(keyPath(ctx,key),{value:r.value,expected_revision:r.revision});return result;}catch(e){if(statusCode(e)!==409)throw e;}}
  throw fault('保存遇到并发冲突，请刷新后重试');
}
export const state=ctx=>read(ctx,'state',initialState());
export const change=(ctx,fn)=>mutate(ctx,'state',fn,initialState());
export const config=async ctx=>(await read(ctx,'config',initialConfig())).value;
