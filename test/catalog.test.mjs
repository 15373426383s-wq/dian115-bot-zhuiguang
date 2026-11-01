// 豆瓣“即将上映”解析的纯逻辑回归：想看人数折算与上映日期/跨年推算。
import test from 'node:test';
import assert from 'node:assert/strict';
import {parseWish,parseSoonDate} from '../lib/catalog.js';

test('想看人数：普通数字',()=>{
  assert.equal(parseWish('449人想看'),449);
  assert.equal(parseWish('10427人想看'),10427);
  assert.equal(parseWish('12 人想看'),12);
});

test('想看人数：万人单位折算',()=>{
  assert.equal(parseWish('1.2万人想看'),12000);
  assert.equal(parseWish('3万人想看'),30000);
});

test('想看人数：无匹配返回 0',()=>{
  assert.equal(parseWish('即将上映'),0);
  assert.equal(parseWish(''),0);
  assert.equal(parseWish(undefined),0);
});

test('上映日期：同年',()=>{
  const now=new Date(2026,10,1);
  const r=parseSoonDate('11月03日',now);
  assert.equal(r.month,11);
  assert.equal(r.day,3);
  assert.equal(r.year,'2026');
  assert.equal(r.releaseAt,new Date(2026,10,3).getTime());
});

test('上映日期：跨年落到下一年',()=>{
  const now=new Date(2026,10,1);
  const r=parseSoonDate('01月15日',now);
  assert.equal(r.year,'2027');
  assert.equal(r.releaseAt,new Date(2027,0,15).getTime());
});

test('上映日期：同月同日不跨年',()=>{
  const now=new Date(2026,10,1);
  assert.equal(parseSoonDate('11月01日',now).year,'2026');
});

test('上映日期：兼容“号”与空格写法',()=>{
  const now=new Date(2026,10,1);
  assert.equal(parseSoonDate('12月1号',now).day,1);
  assert.equal(parseSoonDate('12 月 1 日',now).month,12);
});

test('上映日期：非法输入不产出时间戳',()=>{
  const now=new Date(2026,10,1);
  for(const bad of ['', '待定', '13月45日', '0月0日']){
    const r=parseSoonDate(bad,now);
    assert.equal(r.releaseAt,0,`bad=${bad}`);
    assert.equal(r.year,'');
  }
});
