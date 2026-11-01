// 豆瓣“即将上映”解析器的 DOM 回归：用真实页面片段跑通选择器与字段提取。
// 需要可选依赖 cheerio；未安装时整体跳过（宿主内由实机验证覆盖）。
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,join} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
let cheerio=null;
for(const name of ['cheerio','D:/WorkBuddy1/2026-10-31-19-52-28/_scratch_dep/node_modules/cheerio']){
  try{cheerio=require(name);break;}catch{/* 继续尝试下一个候选 */}}
const {parseDoubanSoon}=await import(pathToFileURL(join(here,'..','lib','catalog.js')).href);

const fixture=readFileSync(join(here,'fixtures','douban-later-beijing.html'),'utf8');

test('豆瓣即将上映：解析出条目并带齐上映日/想看数/封面',{skip:cheerio?false:'未安装 cheerio，跳过 DOM 回归'},()=>{
  const ctx={html:{load:(src,opts)=>cheerio.load(src,opts).root()}};
  const items=parseDoubanSoon(ctx,fixture);
  assert.ok(items.length>0,'应至少解析出 1 条');
  for(const item of items){
    assert.equal(item.source,'douban');
    assert.equal(item.feed,'douban-soon');
    assert.equal(item.mediaType,'movie');
    assert.match(item.id,/^\d+$/);
    assert.ok(item.title.length>0);
    assert.ok(item.releaseAt>0,`${item.title} 应有上映时间`);
    assert.ok(item.wish>0,`${item.title} 应有想看人数`);
    assert.ok(item.cover.startsWith('https://'),`${item.title} 应有 https 封面`);
    assert.match(item.year,/^\d{4}$/);
  }
});

test('豆瓣即将上映：想看人数可被阈值筛选（honue 风格 minWish）',{skip:cheerio?false:'未安装 cheerio，跳过 DOM 回归'},()=>{
  const ctx={html:{load:(src,opts)=>cheerio.load(src,opts).root()}};
  const items=parseDoubanSoon(ctx,fixture);
  const hot=items.filter(i=>i.wish>=5000);
  assert.ok(hot.length>0,'应存在想看数 >= 5000 的条目');
  for(const i of hot)assert.ok(i.wish>=5000);
});

test('豆瓣即将上映：重复 subject 只保留一条',{skip:cheerio?false:'未安装 cheerio，跳过 DOM 回归'},()=>{
  const ctx={html:{load:(src,opts)=>cheerio.load(src,opts).root()}};
  const items=parseDoubanSoon(ctx,fixture);
  assert.equal(new Set(items.map(i=>i.id)).size,items.length);
});
