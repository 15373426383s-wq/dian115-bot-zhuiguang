/**
* @vue/shared v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function pi(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const s of e.split(",")) t[s] = 1;
  return (s) => s in t;
}
const oe = {}, zt = [], Ct = () => {
}, ln = () => !1, Ms = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Es = (e) => e.startsWith("onUpdate:"), tt = Object.assign, an = (e, t) => {
  const s = e.indexOf(t);
  s > -1 && e.splice(s, 1);
}, vo = Object.prototype.hasOwnProperty, te = (e, t) => vo.call(e, t), H = Array.isArray, ht = (e) => cs(e) === "[object Map]", at = (e) => cs(e) === "[object Set]", Mi = (e) => cs(e) === "[object Date]", se = (e) => typeof e == "function", pe = (e) => typeof e == "string", Xe = (e) => typeof e == "symbol", re = (e) => e !== null && typeof e == "object", cn = (e) => (re(e) || se(e)) && se(e.then) && se(e.catch), pn = Object.prototype.toString, cs = (e) => pn.call(e), yo = (e) => cs(e).slice(8, -1), un = (e) => cs(e) === "[object Object]", ui = (e) => pe(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Jt = /* @__PURE__ */ pi(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), As = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((s) => t[s] || (t[s] = e(s)));
}, wo = /-\w/g, Le = As(
  (e) => e.replace(wo, (t) => t.slice(1).toUpperCase())
), _o = /\B([A-Z])/g, Mt = As(
  (e) => e.replace(_o, "-$1").toLowerCase()
), dn = As((e) => e.charAt(0).toUpperCase() + e.slice(1)), Ls = As(
  (e) => e ? `on${dn(e)}` : ""
), Je = (e, t) => !Object.is(e, t), ms = (e, ...t) => {
  for (let s = 0; s < e.length; s++)
    e[s](...t);
}, fn = (e, t, s, i = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: i,
    value: s
  });
}, Os = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ei;
const Is = () => Ei || (Ei = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Rs(e) {
  if (H(e)) {
    const t = {};
    for (let s = 0; s < e.length; s++) {
      const i = e[s], n = pe(i) ? So(i) : Rs(i);
      if (n)
        for (const o in n)
          t[o] = n[o];
    }
    return t;
  } else if (pe(e) || re(e))
    return e;
}
const ko = /;(?![^(]*\))/g, zo = /:([^]+)/, Co = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function So(e) {
  const t = {};
  return e.replace(Co, (s) => s.startsWith("/*") ? "" : s).split(ko).forEach((s) => {
    if (s) {
      const i = s.split(zo);
      i.length > 1 && (t[i[0].trim()] = i[1].trim());
    }
  }), t;
}
function ke(e) {
  let t = "";
  if (pe(e))
    t = e;
  else if (H(e))
    for (let s = 0; s < e.length; s++) {
      const i = ke(e[s]);
      i && (t += i + " ");
    }
  else if (re(e))
    for (const s in e)
      e[s] && (t += s + " ");
  return t.trim();
}
const To = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly", Mo = /* @__PURE__ */ pi(To);
function gn(e) {
  return !!e || e === "";
}
function Eo(e, t, s) {
  if (e.length !== t.length) return !1;
  let i = !0;
  for (let n = 0; i && n < e.length; n++)
    i = ct(e[n], t[n], s);
  return i;
}
function Ai(e, t, s) {
  if (e.size !== t.size) return !1;
  const i = Array.from(t), n = new Uint8Array(i.length);
  for (const o of e) {
    let r = -1;
    for (let l = 0; l < i.length; l++)
      if (!n[l] && ct(o, i[l], s)) {
        r = l;
        break;
      }
    if (r < 0) return !1;
    n[r] = 1;
  }
  return !0;
}
function Ao(e, t, s) {
  let i = ht(e), n = ht(t);
  if (i || n || (i = at(e), n = at(t), i || n))
    return i && n ? Ai(e, t, s) : !1;
  const o = Object.keys(e).length, r = Object.keys(t).length;
  if (o !== r)
    return !1;
  for (const l in e) {
    const u = e.hasOwnProperty(l), m = t.hasOwnProperty(l);
    if (u && !m || !u && m || !ct(e[l], t[l], s))
      return !1;
  }
  return String(e) === String(t);
}
function Oi(e, t, s, i) {
  s || (s = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()]);
  const [n, o] = s;
  if (n.has(e) || o.has(t))
    return n.get(e) === t && o.get(t) === e;
  n.set(e, t), o.set(t, e);
  const r = i(e, t, s);
  return n.delete(e), o.delete(t), r;
}
function ct(e, t, s) {
  if (e === t) return !0;
  let i = Mi(e), n = Mi(t);
  return i || n ? i && n ? e.getTime() === t.getTime() : !1 : (i = Xe(e), n = Xe(t), i || n ? e === t : (i = H(e), n = H(t), i || n ? i && n ? Oi(e, t, s, Eo) : !1 : (i = re(e), n = re(t), i || n ? !i || !n ? !1 : Oi(e, t, s, Ao) : String(e) === String(t))));
}
function di(e, t) {
  return e.findIndex((s) => ct(s, t));
}
const hn = (e) => !!(e && e.__v_isRef === !0), O = (e) => pe(e) ? e : e == null ? "" : H(e) || re(e) && (e.toString === pn || !se(e.toString)) ? hn(e) ? O(e.value) : JSON.stringify(e, mn, 2) : String(e), mn = (e, t) => hn(t) ? mn(e, t.value) : ht(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (s, [i, n], o) => (s[Ds(i, o) + " =>"] = n, s),
    {}
  )
} : at(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((s) => Ds(s))
} : Xe(t) ? Ds(t) : re(t) && !H(t) && !un(t) ? String(t) : t, Ds = (e, t = "") => {
  var s;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    Xe(e) ? `Symbol(${(s = e.description) != null ? s : t})` : e
  );
};
/**
* @vue/reactivity v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ue;
class Oo {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this._warnOnRun = !0, this.__v_skip = !0, !t && ue && (ue.active ? (this.parent = ue, this.index = (ue.scopes || (ue.scopes = [])).push(
      this
    ) - 1) : (this._active = !1, this._warnOnRun = !1));
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, s;
      if (this.scopes) {
        const i = this.scopes.slice();
        for (t = 0, s = i.length; t < s; t++)
          i[t].pause();
      }
      for (t = 0, s = this.effects.length; t < s; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, s;
      if (this.scopes) {
        const n = this.scopes.slice();
        for (t = 0, s = n.length; t < s; t++)
          n[t].resume();
      }
      const i = this.effects.slice();
      for (t = 0, s = i.length; t < s; t++)
        i[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const s = ue;
      try {
        return ue = this, t();
      } finally {
        ue = s;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = ue, ue = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (ue === this)
        ue = this.prevScope;
      else {
        let t = ue;
        for (; t; ) {
          if (t.prevScope === this) {
            t.prevScope = this.prevScope;
            break;
          }
          t = t.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let s, i;
      for (s = 0, i = this.effects.length; s < i; s++)
        this.effects[s].stop();
      for (this.effects.length = 0, s = 0, i = this.cleanups.length; s < i; s++)
        this.cleanups[s]();
      if (this.cleanups.length = 0, this.scopes) {
        const n = this.scopes.slice();
        for (s = 0, i = n.length; s < i; s++)
          n[s].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const n = this.parent.scopes.pop();
        n && n !== this && (this.parent.scopes[this.index] = n, n.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function Io() {
  return ue;
}
let ie;
const Hs = /* @__PURE__ */ new WeakSet();
class xn {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, ue && (ue.active ? ue.effects.push(this) : this.flags &= -2);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Hs.has(this) && (Hs.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || vn(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Ii(this), yn(this);
    const t = ie, s = De;
    ie = this, De = !0;
    try {
      return this.fn();
    } finally {
      wn(this), ie = t, De = s, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        hi(t);
      this.deps = this.depsTail = void 0, Ii(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Hs.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    ei(this) && this.run();
  }
  get dirty() {
    return ei(this);
  }
}
let bn = 0, Zt, Xt;
function vn(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Xt, Xt = e;
    return;
  }
  e.next = Zt, Zt = e;
}
function fi() {
  bn++;
}
function gi() {
  if (--bn > 0)
    return;
  if (Xt) {
    let t = Xt;
    for (Xt = void 0; t; ) {
      const s = t.next;
      t.next = void 0, t.flags &= -9, t = s;
    }
  }
  let e;
  for (; Zt; ) {
    let t = Zt;
    for (Zt = void 0; t; ) {
      const s = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (i) {
          e || (e = i);
        }
      t = s;
    }
  }
  if (e) throw e;
}
function yn(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function wn(e) {
  let t, s = e.depsTail, i = s;
  for (; i; ) {
    const n = i.prevDep;
    i.version === -1 ? (i === s && (s = n), hi(i), Ro(i)) : t = i, i.dep.activeLink = i.prevActiveLink, i.prevActiveLink = void 0, i = n;
  }
  e.deps = t, e.depsTail = s;
}
function ei(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (_n(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function _n(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === ss) || (e.globalVersion = ss, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !ei(e))))
    return;
  e.flags |= 2;
  const t = e.dep, s = ie, i = De;
  ie = e, De = !0;
  try {
    yn(e);
    const n = e.fn(e._value);
    (t.version === 0 || Je(n, e._value)) && (e.flags |= 128, e._value = n, t.version++);
  } catch (n) {
    throw t.version++, n;
  } finally {
    ie = s, De = i, wn(e), e.flags &= -3;
  }
}
function hi(e, t = !1) {
  const { dep: s, prevSub: i, nextSub: n } = e;
  if (i && (i.nextSub = n, e.prevSub = void 0), n && (n.prevSub = i, e.nextSub = void 0), s.subs === e && (s.subs = i, !i && s.computed)) {
    s.computed.flags &= -5;
    for (let o = s.computed.deps; o; o = o.nextDep)
      hi(o, !0);
  }
  !t && !--s.sc && s.map && s.map.delete(s.key);
}
function Ro(e) {
  const { prevDep: t, nextDep: s } = e;
  t && (t.nextDep = s, e.prevDep = void 0), s && (s.prevDep = t, e.nextDep = void 0);
}
let De = !0;
const kn = [];
function pt() {
  kn.push(De), De = !1;
}
function ut() {
  const e = kn.pop();
  De = e === void 0 ? !0 : e;
}
function Ii(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const s = ie;
    ie = void 0;
    try {
      t();
    } finally {
      ie = s;
    }
  }
}
let ss = 0;
class $o {
  constructor(t, s) {
    this.sub = t, this.dep = s, this.version = s.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class mi {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0;
  }
  track(t) {
    if (!ie || !De || ie === this.computed)
      return;
    let s = this.activeLink;
    if (s === void 0 || s.sub !== ie)
      s = this.activeLink = new $o(ie, this), ie.deps ? (s.prevDep = ie.depsTail, ie.depsTail.nextDep = s, ie.depsTail = s) : ie.deps = ie.depsTail = s, zn(s);
    else if (s.version === -1 && (s.version = this.version, s.nextDep)) {
      const i = s.nextDep;
      i.prevDep = s.prevDep, s.prevDep && (s.prevDep.nextDep = i), s.prevDep = ie.depsTail, s.nextDep = void 0, ie.depsTail.nextDep = s, ie.depsTail = s, ie.deps === s && (ie.deps = i);
    }
    return s;
  }
  trigger(t) {
    this.version++, ss++, this.notify(t);
  }
  notify(t) {
    fi();
    try {
      for (let s = this.subs; s; s = s.prevSub)
        s.sub.notify() && s.sub.dep.notify();
    } finally {
      gi();
    }
  }
}
function zn(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let i = t.deps; i; i = i.nextDep)
        zn(i);
    }
    const s = e.dep.subs;
    s !== e && (e.prevSub = s, s && (s.nextSub = e)), e.dep.subs = e;
  }
}
const ti = /* @__PURE__ */ new WeakMap(), St = /* @__PURE__ */ Symbol(
  ""
), si = /* @__PURE__ */ Symbol(
  ""
), is = /* @__PURE__ */ Symbol(
  ""
);
function ge(e, t, s) {
  if (De && ie) {
    let i = ti.get(e);
    i || ti.set(e, i = /* @__PURE__ */ new Map());
    let n = i.get(s);
    n || (i.set(s, n = new mi()), n.map = i, n.key = s), n.track();
  }
}
function rt(e, t, s, i, n, o) {
  const r = ti.get(e);
  if (!r) {
    ss++;
    return;
  }
  const l = (u) => {
    u && u.trigger();
  };
  if (fi(), t === "clear")
    r.forEach(l);
  else {
    const u = H(e), m = u && ui(s);
    if (u && s === "length") {
      const h = Number(i);
      r.forEach((y, M) => {
        (M === "length" || M === is || !Xe(M) && M >= h) && l(y);
      });
    } else
      switch ((s !== void 0 || r.has(void 0)) && l(r.get(s)), m && l(r.get(is)), t) {
        case "add":
          u ? m && l(r.get("length")) : (l(r.get(St)), ht(e) && l(r.get(si)));
          break;
        case "delete":
          u || (l(r.get(St)), ht(e) && l(r.get(si)));
          break;
        case "set":
          ht(e) && l(r.get(St));
          break;
      }
  }
  gi();
}
function $t(e) {
  const t = /* @__PURE__ */ Z(e);
  return t === e || (ge(t, "iterate", is), /* @__PURE__ */ Ne(e)) ? t : /* @__PURE__ */ Qe(e) ? /* @__PURE__ */ mt(e) ? t.map((s) => xt(Fe(s))) : t.map(xt) : t.map(Fe);
}
function $s(e) {
  return ge(e = /* @__PURE__ */ Z(e), "iterate", is), e;
}
function qe(e, t) {
  return /* @__PURE__ */ Qe(e) ? xt(/* @__PURE__ */ mt(e) ? Fe(t) : t) : Fe(t);
}
const No = {
  __proto__: null,
  [Symbol.iterator]() {
    return Us(this, Symbol.iterator, (e) => qe(this, e));
  },
  concat(...e) {
    return $t(this).concat(
      ...e.map((t) => H(t) ? $t(t) : t)
    );
  },
  entries() {
    return Us(this, "entries", (e) => (e[1] = qe(this, e[1]), e));
  },
  every(e, t) {
    return it(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return it(
      this,
      "filter",
      e,
      t,
      (s) => s.map((i) => qe(this, i)),
      arguments
    );
  },
  find(e, t) {
    return it(
      this,
      "find",
      e,
      t,
      (s) => qe(this, s),
      arguments
    );
  },
  findIndex(e, t) {
    return it(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return it(
      this,
      "findLast",
      e,
      t,
      (s) => qe(this, s),
      arguments
    );
  },
  findLastIndex(e, t) {
    return it(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return it(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return Bs(this, "includes", e);
  },
  indexOf(...e) {
    return Bs(this, "indexOf", e);
  },
  join(e) {
    return $t(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return Bs(this, "lastIndexOf", e);
  },
  map(e, t) {
    return it(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return Kt(this, "pop");
  },
  push(...e) {
    return Kt(this, "push", e);
  },
  reduce(e, ...t) {
    return $i(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return $i(this, "reduceRight", e, t);
  },
  shift() {
    return Kt(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return it(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return Kt(this, "splice", e);
  },
  toReversed() {
    return $t(this).toReversed();
  },
  toSorted(e) {
    return $t(this).toSorted(e);
  },
  toSpliced(...e) {
    return $t(this).toSpliced(...e);
  },
  unshift(...e) {
    return Kt(this, "unshift", e);
  },
  values() {
    return Us(this, "values", (e) => qe(this, e));
  }
};
function Us(e, t, s) {
  const i = $s(e), n = i[t], o = n.call(i);
  if (i !== e && !/* @__PURE__ */ Ne(e)) {
    if (o[Symbol.toStringTag] === "Array Iterator") {
      const r = Object.create(Object.getPrototypeOf(o));
      return r.next = () => Ri(o.next(), s), n !== Cn[t] && Object.defineProperties(r, {
        return: {
          get() {
            const l = o.return;
            return typeof l == "function" ? l.bind(o) : l;
          }
        },
        throw: {
          get() {
            const l = o.throw;
            return typeof l == "function" ? l.bind(o) : l;
          }
        }
      }), r;
    }
    o._next = o.next, o.next = () => Ri(o._next(), s);
  }
  return o;
}
function Ri(e, t) {
  return e.done || (e.value = t(e.value)), e;
}
const Cn = Array.prototype;
function it(e, t, s, i, n, o) {
  const r = $s(e), l = r !== e && !/* @__PURE__ */ Ne(e), u = r[t];
  if (u !== Cn[t]) {
    const y = u.apply(e, o);
    return l ? Fe(y) : y;
  }
  let m = s;
  r !== e && (l ? m = function(y, M) {
    return s.call(this, qe(e, y), M, e);
  } : s.length > 2 && (m = function(y, M) {
    return s.call(this, y, M, e);
  }));
  const h = u.call(r, m, i);
  return l && n ? n(h) : h;
}
function $i(e, t, s, i) {
  const n = $s(e), o = n !== e && !/* @__PURE__ */ Ne(e);
  let r = s, l = !1;
  n !== e && (o ? (l = i.length === 0, r = function(m, h, y) {
    return l && (l = !1, m = qe(e, m)), s.call(this, m, qe(e, h), y, e);
  }) : s.length > 3 && (r = function(m, h, y) {
    return s.call(this, m, h, y, e);
  }));
  const u = n[t](r, ...i);
  return l ? qe(e, u) : u;
}
function Bs(e, t, s) {
  const i = /* @__PURE__ */ Z(e);
  ge(i, "iterate", is);
  const n = i[t](...s);
  return (n === -1 || n === !1) && /* @__PURE__ */ vi(s[0]) ? (s[0] = /* @__PURE__ */ Z(s[0]), i[t](...s)) : n;
}
function Kt(e, t, s = []) {
  pt(), fi();
  const i = (/* @__PURE__ */ Z(e))[t].apply(e, s);
  return gi(), ut(), i;
}
const Fo = /* @__PURE__ */ pi("__proto__,__v_isRef,__isVue"), Sn = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(Xe)
);
function Po(e) {
  Xe(e) || (e = String(e));
  const t = /* @__PURE__ */ Z(this);
  return ge(t, "has", e), t.hasOwnProperty(e);
}
class Tn {
  constructor(t = !1, s = !1) {
    this._isReadonly = t, this._isShallow = s;
  }
  get(t, s, i) {
    if (s === "__v_skip") return t.__v_skip;
    const n = this._isReadonly, o = this._isShallow;
    if (s === "__v_isReactive")
      return !n;
    if (s === "__v_isReadonly")
      return n;
    if (s === "__v_isShallow")
      return o;
    if (s === "__v_raw")
      return i === (n ? o ? qo : On : o ? An : En).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(i) ? t : void 0;
    const r = H(t);
    if (!n) {
      let u;
      if (r && (u = No[s]))
        return u;
      if (s === "hasOwnProperty")
        return Po;
    }
    const l = Reflect.get(
      t,
      s,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ ce(t) ? t : i
    );
    if ((Xe(s) ? Sn.has(s) : Fo(s)) || (n || ge(t, "get", s), o))
      return l;
    if (/* @__PURE__ */ ce(l)) {
      const u = r && ui(s) ? l : l.value;
      return n && re(u) ? /* @__PURE__ */ ni(u) : u;
    }
    return re(l) ? n ? /* @__PURE__ */ ni(l) : /* @__PURE__ */ In(l) : l;
  }
}
class Mn extends Tn {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, s, i, n) {
    let o = t[s];
    const r = H(t) && ui(s);
    if (!this._isShallow) {
      const m = /* @__PURE__ */ Qe(o);
      if (!/* @__PURE__ */ Ne(i) && !/* @__PURE__ */ Qe(i) && (o = /* @__PURE__ */ Z(o), i = /* @__PURE__ */ Z(i)), !r && /* @__PURE__ */ ce(o) && !/* @__PURE__ */ ce(i))
        return m || (o.value = i), !0;
    }
    const l = r ? Number(s) < t.length : te(t, s), u = Reflect.set(
      t,
      s,
      i,
      /* @__PURE__ */ ce(t) ? t : n
    );
    return t === /* @__PURE__ */ Z(n) && u && (l ? Je(i, o) && rt(t, "set", s, i) : rt(t, "add", s, i)), u;
  }
  deleteProperty(t, s) {
    const i = te(t, s);
    t[s];
    const n = Reflect.deleteProperty(t, s);
    return n && i && rt(t, "delete", s, void 0), n;
  }
  has(t, s) {
    const i = Reflect.has(t, s);
    return (!Xe(s) || !Sn.has(s)) && ge(t, "has", s), i;
  }
  ownKeys(t) {
    return ge(
      t,
      "iterate",
      H(t) ? "length" : St
    ), Reflect.ownKeys(t);
  }
}
class jo extends Tn {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, s) {
    return !0;
  }
  deleteProperty(t, s) {
    return !0;
  }
}
const Vo = /* @__PURE__ */ new Mn(), Lo = /* @__PURE__ */ new jo(), Do = /* @__PURE__ */ new Mn(!0);
const ii = (e) => e, us = (e) => Reflect.getPrototypeOf(e);
function Ho(e, t, s) {
  return function(...i) {
    const n = this.__v_raw, o = /* @__PURE__ */ Z(n), r = ht(o), l = e === "entries" || e === Symbol.iterator && r, u = e === "keys" && r, m = n[e](...i), h = s ? ii : t ? xt : Fe;
    return !t && ge(
      o,
      "iterate",
      u ? si : St
    ), tt(
      // inheriting all iterator properties
      Object.create(m),
      {
        // iterator protocol
        next() {
          const { value: y, done: M } = m.next();
          return M ? { value: y, done: M } : {
            value: l ? [h(y[0]), h(y[1])] : h(y),
            done: M
          };
        }
      }
    );
  };
}
function ds(e) {
  return function(...t) {
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function Uo(e, t) {
  const s = {
    get(n) {
      const o = this.__v_raw, r = /* @__PURE__ */ Z(o), l = /* @__PURE__ */ Z(n);
      e || (Je(n, l) && ge(r, "get", n), ge(r, "get", l));
      const { has: u } = us(r), m = t ? ii : e ? xt : Fe;
      if (u.call(r, n))
        return m(o.get(n));
      if (u.call(r, l))
        return m(o.get(l));
      o !== r && o.get(n);
    },
    get size() {
      const n = this.__v_raw;
      return !e && ge(/* @__PURE__ */ Z(n), "iterate", St), n.size;
    },
    has(n) {
      const o = this.__v_raw, r = /* @__PURE__ */ Z(o), l = /* @__PURE__ */ Z(n);
      return e || (Je(n, l) && ge(r, "has", n), ge(r, "has", l)), n === l ? o.has(n) : o.has(n) || o.has(l);
    },
    forEach(n, o) {
      const r = this, l = r.__v_raw, u = /* @__PURE__ */ Z(l), m = t ? ii : e ? xt : Fe;
      return !e && ge(u, "iterate", St), l.forEach((h, y) => n.call(o, m(h), m(y), r));
    }
  };
  return tt(
    s,
    e ? {
      add: ds("add"),
      set: ds("set"),
      delete: ds("delete"),
      clear: ds("clear")
    } : {
      add(n) {
        const o = /* @__PURE__ */ Z(this), r = us(o), l = /* @__PURE__ */ Z(n), u = !t && !/* @__PURE__ */ Ne(n) && !/* @__PURE__ */ Qe(n) ? l : n;
        return r.has.call(o, u) || Je(n, u) && r.has.call(o, n) || Je(l, u) && r.has.call(o, l) || (o.add(u), rt(o, "add", u, u)), this;
      },
      set(n, o) {
        !t && !/* @__PURE__ */ Ne(o) && !/* @__PURE__ */ Qe(o) && (o = /* @__PURE__ */ Z(o));
        const r = /* @__PURE__ */ Z(this), { has: l, get: u } = us(r);
        let m = l.call(r, n);
        m || (n = /* @__PURE__ */ Z(n), m = l.call(r, n));
        const h = u.call(r, n);
        return r.set(n, o), m ? Je(o, h) && rt(r, "set", n, o) : rt(r, "add", n, o), this;
      },
      delete(n) {
        const o = /* @__PURE__ */ Z(this), { has: r, get: l } = us(o);
        let u = r.call(o, n);
        u || (n = /* @__PURE__ */ Z(n), u = r.call(o, n)), l && l.call(o, n);
        const m = o.delete(n);
        return u && rt(o, "delete", n, void 0), m;
      },
      clear() {
        const n = /* @__PURE__ */ Z(this), o = n.size !== 0, r = n.clear();
        return o && rt(
          n,
          "clear",
          void 0,
          void 0
        ), r;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((n) => {
    s[n] = Ho(n, e, t);
  }), s;
}
function xi(e, t) {
  const s = Uo(e, t);
  return (i, n, o) => n === "__v_isReactive" ? !e : n === "__v_isReadonly" ? e : n === "__v_isShallow" ? t : n === "__v_raw" ? i : Reflect.get(
    te(s, n) && n in i ? s : i,
    n,
    o
  );
}
const Bo = {
  get: /* @__PURE__ */ xi(!1, !1)
}, Ko = {
  get: /* @__PURE__ */ xi(!1, !0)
}, Wo = {
  get: /* @__PURE__ */ xi(!0, !1)
};
const En = /* @__PURE__ */ new WeakMap(), An = /* @__PURE__ */ new WeakMap(), On = /* @__PURE__ */ new WeakMap(), qo = /* @__PURE__ */ new WeakMap();
function Go(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
// @__NO_SIDE_EFFECTS__
function In(e) {
  return /* @__PURE__ */ Qe(e) ? e : bi(
    e,
    !1,
    Vo,
    Bo,
    En
  );
}
// @__NO_SIDE_EFFECTS__
function Yo(e) {
  return bi(
    e,
    !1,
    Do,
    Ko,
    An
  );
}
// @__NO_SIDE_EFFECTS__
function ni(e) {
  return bi(
    e,
    !0,
    Lo,
    Wo,
    On
  );
}
function bi(e, t, s, i, n) {
  if (!re(e) || e.__v_raw && !(t && e.__v_isReactive) || e.__v_skip || !Object.isExtensible(e))
    return e;
  const o = n.get(e);
  if (o)
    return o;
  const r = Go(yo(e));
  if (r === 0)
    return e;
  const l = new Proxy(
    e,
    r === 2 ? i : s
  );
  return n.set(e, l), l;
}
// @__NO_SIDE_EFFECTS__
function mt(e) {
  return /* @__PURE__ */ Qe(e) ? /* @__PURE__ */ mt(e.__v_raw) : !!(e && e.__v_isReactive);
}
// @__NO_SIDE_EFFECTS__
function Qe(e) {
  return !!(e && e.__v_isReadonly);
}
// @__NO_SIDE_EFFECTS__
function Ne(e) {
  return !!(e && e.__v_isShallow);
}
// @__NO_SIDE_EFFECTS__
function vi(e) {
  return e ? !!e.__v_raw : !1;
}
// @__NO_SIDE_EFFECTS__
function Z(e) {
  const t = e && e.__v_raw;
  return t ? /* @__PURE__ */ Z(t) : e;
}
function Jo(e) {
  return !te(e, "__v_skip") && Object.isExtensible(e) && fn(e, "__v_skip", !0), e;
}
const Fe = (e) => re(e) ? /* @__PURE__ */ In(e) : e, xt = (e) => re(e) ? /* @__PURE__ */ ni(e) : e;
// @__NO_SIDE_EFFECTS__
function ce(e) {
  return e ? e.__v_isRef === !0 : !1;
}
// @__NO_SIDE_EFFECTS__
function Q(e) {
  return Zo(e, !1);
}
function Zo(e, t) {
  return /* @__PURE__ */ ce(e) ? e : new Xo(e, t);
}
class Xo {
  constructor(t, s) {
    this.dep = new mi(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = s ? t : /* @__PURE__ */ Z(t), this._value = s ? t : Fe(t), this.__v_isShallow = s;
  }
  get value() {
    return this.dep.track(), this._value;
  }
  set value(t) {
    const s = this._rawValue, i = this.__v_isShallow || /* @__PURE__ */ Ne(t) || /* @__PURE__ */ Qe(t);
    t = i ? t : /* @__PURE__ */ Z(t), Je(t, s) && (this._rawValue = t, this._value = i ? t : Fe(t), this.dep.trigger());
  }
}
function g(e) {
  return /* @__PURE__ */ ce(e) ? e.value : e;
}
const Qo = {
  get: (e, t, s) => t === "__v_raw" ? e : g(Reflect.get(e, t, s)),
  set: (e, t, s, i) => {
    const n = e[t];
    return /* @__PURE__ */ ce(n) && !/* @__PURE__ */ ce(s) ? (n.value = s, !0) : Reflect.set(e, t, s, i);
  }
};
function Rn(e) {
  return /* @__PURE__ */ mt(e) ? e : new Proxy(e, Qo);
}
class er {
  constructor(t, s, i) {
    this.fn = t, this.setter = s, this._value = void 0, this.dep = new mi(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = ss - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !s, this.isSSR = i;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    ie !== this)
      return vn(this, !0), !0;
  }
  get value() {
    const t = this.dep.track();
    return _n(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter && this.setter(t);
  }
}
// @__NO_SIDE_EFFECTS__
function tr(e, t, s = !1) {
  let i, n;
  return se(e) ? i = e : (i = e.get, n = e.set), new er(i, n, s);
}
const fs = {}, ys = /* @__PURE__ */ new WeakMap();
let kt;
function sr(e, t = !1, s = kt) {
  if (s) {
    let i = ys.get(s);
    i || ys.set(s, i = []), i.push(e);
  }
}
function ir(e, t, s = oe) {
  const { immediate: i, deep: n, once: o, scheduler: r, augmentJob: l, call: u } = s, m = (N) => n ? N : /* @__PURE__ */ Ne(N) || n === !1 || n === 0 ? lt(N, 1) : lt(N);
  let h, y, M, z, D = !1, V = !1;
  if (/* @__PURE__ */ ce(e) ? (y = () => e.value, D = /* @__PURE__ */ Ne(e)) : /* @__PURE__ */ mt(e) ? (y = () => m(e), D = !0) : H(e) ? (V = !0, D = e.some((N) => /* @__PURE__ */ mt(N) || /* @__PURE__ */ Ne(N)), y = () => e.map((N) => {
    if (/* @__PURE__ */ ce(N))
      return N.value;
    if (/* @__PURE__ */ mt(N))
      return m(N);
    if (se(N))
      return u ? u(N, 2) : N();
  })) : se(e) ? t ? y = u ? () => u(e, 2) : e : y = () => {
    if (M) {
      pt();
      try {
        M();
      } finally {
        ut();
      }
    }
    const N = kt;
    kt = h;
    try {
      return u ? u(e, 3, [z]) : e(z);
    } finally {
      kt = N;
    }
  } : y = Ct, t && n) {
    const N = y, G = n === !0 ? 1 / 0 : n;
    y = () => lt(N(), G);
  }
  const ne = Io(), W = () => {
    h.stop(), ne && ne.active && an(ne.effects, h);
  };
  if (o && t) {
    const N = t;
    t = (...G) => {
      try {
        return N(...G);
      } finally {
        W();
      }
    };
  }
  let U = V ? new Array(e.length).fill(fs) : fs;
  const j = (N) => {
    if (!(!(h.flags & 1) || !h.dirty && !N))
      if (t) {
        const G = h.run();
        if (N || n || D || (V ? G.some((Ae, de) => Je(Ae, U[de])) : Je(G, U))) {
          const Ae = kt;
          pt();
          try {
            M && M(), kt = h;
            const de = [
              G,
              // pass undefined as the old value when it's changed for the first time
              U === fs ? void 0 : V && U[0] === fs ? [] : U,
              z
            ];
            U = G, u ? u(t, 3, de) : (
              // @ts-expect-error
              t(...de)
            );
          } finally {
            kt = Ae, ut();
          }
        }
      } else
        h.run();
  };
  return l && l(j), h = new xn(y), h.scheduler = r ? () => r(j, !1) : j, z = (N) => sr(N, !1, h), M = h.onStop = () => {
    const N = ys.get(h);
    if (N) {
      if (u)
        u(N, 4);
      else
        for (const G of N) G();
      ys.delete(h);
    }
  }, t ? i ? j(!0) : U = h.run() : r ? r(j.bind(null, !0), !0) : h.run(), W.pause = h.pause.bind(h), W.resume = h.resume.bind(h), W.stop = W, W;
}
function lt(e, t = 1 / 0, s) {
  if (t <= 0 || !re(e) || e.__v_skip || (s = s || /* @__PURE__ */ new Map(), (s.get(e) || 0) >= t))
    return e;
  if (s.set(e, t), t--, /* @__PURE__ */ ce(e))
    lt(e.value, t, s);
  else if (H(e))
    for (let i = 0; i < e.length; i++)
      lt(e[i], t, s);
  else if (at(e) || ht(e))
    e.forEach((i) => {
      lt(i, t, s);
    });
  else if (un(e)) {
    for (const i in e)
      lt(e[i], t, s);
    for (const i of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, i) && lt(e[i], t, s);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function ps(e, t, s, i) {
  try {
    return i ? e(...i) : e();
  } catch (n) {
    Ns(n, t, s);
  }
}
function et(e, t, s, i) {
  if (se(e)) {
    const n = ps(e, t, s, i);
    return n && cn(n) && n.catch((o) => {
      Ns(o, t, s);
    }), n;
  }
  if (H(e)) {
    const n = [];
    for (let o = 0; o < e.length; o++)
      n.push(et(e[o], t, s, i));
    return n;
  }
}
function Ns(e, t, s, i = !0) {
  const n = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: r } = t && t.appContext.config || oe;
  if (t) {
    let l = t.parent;
    const u = t.proxy, m = `https://vuejs.org/error-reference/#runtime-${s}`;
    for (; l; ) {
      const h = l.ec;
      if (h) {
        for (let y = 0; y < h.length; y++)
          if (h[y](e, u, m) === !1)
            return;
      }
      l = l.parent;
    }
    if (o) {
      pt(), ps(o, null, 10, [
        e,
        u,
        m
      ]), ut();
      return;
    }
  }
  nr(e, s, n, i, r);
}
function nr(e, t, s, i = !0, n = !1) {
  if (n)
    throw e;
  console.error(e);
}
const ve = [];
let Ve = -1;
const Ge = [];
let ft = null, Nt = 0;
const $n = /* @__PURE__ */ Promise.resolve();
let ws = null;
function _s(e) {
  const t = ws || $n;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function or(e) {
  let t = Ve + 1, s = ve.length;
  for (; t < s; ) {
    const i = t + s >>> 1, n = ve[i], o = ns(n);
    o < e || o === e && n.flags & 2 ? t = i + 1 : s = i;
  }
  return t;
}
function yi(e) {
  if (!(e.flags & 1)) {
    const t = ns(e), s = ve[ve.length - 1];
    !s || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= ns(s) ? ve.push(e) : ve.splice(or(t), 0, e), e.flags |= 1, Nn();
  }
}
function Nn() {
  ws || (ws = $n.then(jn));
}
function rr(e) {
  if (!H(e))
    ft && e.id === -1 ? ft.splice(Nt + 1, 0, e) : e.flags & 1 || (Ge.push(e), e.flags |= 1);
  else
    for (let t = 0; t < e.length; t++)
      Ge.push(e[t]);
  Nn();
}
function Fn(e, t, s, i = Ve + 1) {
  for (; i < ve.length; i++) {
    const n = ve[i];
    if (n && n.flags & 2) {
      if (e && n.id !== e.uid || t !== void 0 && !(n.id >= t))
        continue;
      ve.splice(i, 1), i = e ? i - 1 : Ve, n.flags & 4 && (n.flags &= -2), n(), n.flags & 4 || (n.flags &= -2);
    }
  }
}
function Pn(e, t, s = 0) {
  if (Ge.length) {
    let i = Ge, n = 0;
    if (t) {
      i = [];
      for (let r = 0; r < Ge.length; r++) {
        const l = Ge[r];
        (l.i !== void 0 ? !l.i || l.i.uid < s : t.has(l)) ? Ge[n++] = l : i.push(l);
      }
    }
    const o = [...new Set(i)].sort((r, l) => ns(r) - ns(l));
    if (Ge.length = n, ft) {
      for (let r = 0; r < o.length; r++)
        ft.push(o[r]);
      return;
    }
    for (ft = o, Nt = 0; Nt < ft.length; Nt++) {
      const r = ft[Nt];
      r.flags & 4 && (r.flags &= -2), r.flags & 8 || r(), r.flags &= -2;
    }
    ft = null, Nt = 0;
  }
}
let Ks = !1;
function lr(e, t) {
  if (Ks) {
    e();
    return;
  }
  const s = t === void 0 ? void 0 : new Set(Ge);
  e(), Ks = !0;
  try {
    Fn(void 0, t), Pn(void 0, s, t);
  } finally {
    Ks = !1;
  }
}
const ns = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function jn(e) {
  try {
    for (Ve = 0; Ve < ve.length; Ve++) {
      const t = ve[Ve];
      t && !(t.flags & 8) && (t.flags & 4 && (t.flags &= -2), ps(
        t,
        t.i,
        t.i ? 15 : 14
      ), t.flags & 4 || (t.flags &= -2));
    }
  } finally {
    for (; Ve < ve.length; Ve++) {
      const t = ve[Ve];
      t && (t.flags &= -2);
    }
    Ve = -1, ve.length = 0, Pn(), ws = null, (ve.length || Ge.length) && jn();
  }
}
let $e = null, Vn = null;
function ks(e) {
  const t = $e;
  return $e = e, Vn = e && e.type.__scopeId || null, t;
}
function ar(e, t = $e, s) {
  if (!t || e._n)
    return e;
  const i = (...n) => {
    i._d && Di(-1);
    const o = ks(t), r = Tt.length;
    let l;
    try {
      l = e(...n);
    } finally {
      for (let u = Tt.length; u > r; u--) oo();
      ks(o), i._d && Di(1);
    }
    return l;
  };
  return i._n = !0, i._c = !0, i._d = !0, i;
}
function be(e, t) {
  if ($e === null)
    return e;
  const s = Vs($e), i = e.dirs || (e.dirs = []);
  for (let n = 0; n < t.length; n++) {
    let [o, r, l, u = oe] = t[n];
    o && (se(o) && (o = {
      mounted: o,
      updated: o
    }), o.deep && lt(r), i.push({
      dir: o,
      instance: s,
      value: r,
      oldValue: void 0,
      arg: l,
      modifiers: u
    }));
  }
  return e;
}
function wt(e, t, s, i) {
  const n = e.dirs, o = t && t.dirs;
  for (let r = 0; r < n.length; r++) {
    const l = n[r];
    o && (l.oldValue = o[r].value);
    let u = l.dir[i];
    u && (pt(), et(u, s, 8, [
      e.el,
      l,
      e,
      t
    ]), ut());
  }
}
function cr(e, t) {
  if (Me) {
    let s = Me.provides;
    const i = Me.parent && Me.parent.provides;
    i === s && (s = Me.provides = Object.create(i)), s[e] = t;
  }
}
function Ln(e, t, s = !1) {
  const i = Wr();
  if (i || Pt) {
    let n = Pt ? Pt._context.provides : i ? i.parent == null || i.ce ? i.vnode.appContext && i.vnode.appContext.provides : i.parent.provides : void 0;
    if (n && e in n)
      return n[e];
    if (arguments.length > 1)
      return s && se(t) ? t.call(i && i.proxy) : t;
  }
}
const pr = /* @__PURE__ */ Symbol.for("v-scx"), ur = () => Ln(pr);
function dr(e, t, s) {
  return fr(e, t, s);
}
function fr(e, t, s = oe) {
  const { immediate: i, deep: n, flush: o, once: r } = s, l = tt({}, s), u = t && i || !t && o !== "post";
  let m;
  if (ls) {
    if (o === "sync") {
      const z = ur();
      m = z.__watcherHandles || (z.__watcherHandles = []);
    } else if (!u) {
      const z = () => {
      };
      return z.stop = Ct, z.resume = Ct, z.pause = Ct, z;
    }
  }
  const h = Me;
  l.call = (z, D, V) => et(z, h, D, V);
  let y = !1;
  o === "post" ? l.scheduler = (z) => {
    z.i = h, _e(z, h && h.suspense);
  } : o !== "sync" && (y = !0, l.scheduler = (z, D) => {
    D ? z() : yi(z);
  }), l.augmentJob = (z) => {
    t && (z.flags |= 4), y && (z.flags |= 2, h && (z.id = h.uid, z.i = h));
  };
  const M = ir(e, t, l);
  return ls && (m ? m.push(M) : u && M()), M;
}
const gr = /* @__PURE__ */ Symbol("_vte"), Fs = (e) => e.__isTeleport, Ws = /* @__PURE__ */ Symbol("_leaveCb");
function hr(e) {
  let t = e[0];
  if (e.length > 1) {
    for (const s of e)
      if (s.type !== He) {
        t = s;
        break;
      }
  }
  return t;
}
function Dn(e) {
  if (!Hn(e))
    return Fs(e.type) && e.children ? hr(e.children) : e;
  if (e.component)
    return e.component.subTree;
  const { shapeFlag: t, children: s } = e;
  if (s) {
    if (t & 16)
      return s[0];
    if (t & 32 && se(s.default))
      return s.default();
  }
}
function zs(e, t) {
  if (e.shapeFlag & 6 && e.component) {
    e.transition = t;
    const s = e.component.subTree;
    zs(
      Fs(s.type) && Dn(s) || s,
      t
    );
  } else if (e.shapeFlag & 128)
    e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback);
  else if (e.transition = t, e.type === ee && H(e.children)) {
    const s = qn(e.children, !1);
    s && zs(s, t);
  }
}
function oi(e) {
  if (e.component)
    return oi(e.component.subTree);
  if (e.type === ee) {
    const t = H(e.children) && qn(e.children, !1);
    return t ? oi(t) : void 0;
  }
  if (e.type !== He)
    return e;
}
function mr(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
function Ni(e, t) {
  let s;
  return !!((s = Object.getOwnPropertyDescriptor(e, t)) && !s.configurable);
}
const Cs = /* @__PURE__ */ new WeakMap();
function Qt(e, t, s, i, n = !1) {
  if (H(e)) {
    e.forEach(
      (V, ne) => Qt(
        V,
        t && (H(t) ? t[ne] : t),
        s,
        i,
        n
      )
    );
    return;
  }
  if (es(i) && !n) {
    i.shapeFlag & 512 && i.type.__asyncResolved && i.component.subTree.component && Qt(e, t, s, i.component.subTree);
    return;
  }
  const o = i.shapeFlag & 4 ? Vs(i.component) : i.el, r = n ? null : o, { i: l, r: u } = e, m = t && t.r, h = l.refs === oe ? l.refs = {} : l.refs, y = l.setupState, M = /* @__PURE__ */ Z(y), z = y === oe ? ln : (V) => Ni(h, V) ? !1 : te(M, V), D = (V, ne) => !(ne && Ni(h, ne));
  if (m != null && m !== u) {
    if (Fi(t), pe(m))
      h[m] = null, z(m) && (y[m] = null);
    else if (/* @__PURE__ */ ce(m)) {
      const V = t;
      D(m, V.k) && (m.value = null), V.k && (h[V.k] = null);
    }
  }
  if (se(u))
    ps(u, l, 12, [r, h]);
  else {
    const V = pe(u), ne = /* @__PURE__ */ ce(u);
    if (V || ne) {
      const W = () => {
        if (e.f) {
          const U = V ? z(u) ? y[u] : h[u] : D() || !e.k ? u.value : h[e.k];
          if (n)
            H(U) && an(U, o);
          else if (H(U))
            U.includes(o) || U.push(o);
          else if (V)
            h[u] = [o], z(u) && (y[u] = h[u]);
          else {
            const j = [o];
            D(u, e.k) && (u.value = j), e.k && (h[e.k] = j);
          }
        } else V ? (h[u] = r, z(u) && (y[u] = r)) : ne && (D(u, e.k) && (u.value = r), e.k && (h[e.k] = r));
      };
      if (r) {
        const U = () => {
          W(), Cs.delete(e);
        };
        U.id = -1, Cs.set(e, U), _e(U, s);
      } else
        Fi(e), W();
    }
  }
}
function Fi(e) {
  const t = Cs.get(e);
  t && (t.flags |= 8, Cs.delete(e));
}
Is().requestIdleCallback;
Is().cancelIdleCallback;
const es = (e) => !!e.type.__asyncLoader, Hn = (e) => e.type.__isKeepAlive;
function xr(e, t, s = Me, i = !1) {
  if (s) {
    const n = s[e] || (s[e] = []), o = t.__weh || (t.__weh = (...r) => {
      pt();
      const l = zi(s), u = et(t, s, e, r);
      return l(), ut(), u;
    });
    return i ? n.unshift(o) : n.push(o), o;
  }
}
const Un = (e) => (t, s = Me) => {
  (!ls || e === "sp") && xr(e, (...i) => t(...i), s);
}, Bn = Un("m"), Kn = Un("um"), br = /* @__PURE__ */ Symbol.for("v-ndc");
function Se(e, t, s, i) {
  let n;
  const o = s, r = H(e);
  if (r || pe(e)) {
    const l = r && /* @__PURE__ */ mt(e);
    let u = !1, m = !1;
    l && (u = !/* @__PURE__ */ Ne(e), m = /* @__PURE__ */ Qe(e), e = $s(e)), n = new Array(e.length);
    for (let h = 0, y = e.length; h < y; h++)
      n[h] = t(
        u ? m ? xt(Fe(e[h])) : Fe(e[h]) : e[h],
        h,
        void 0,
        o
      );
  } else if (typeof e == "number")
    if (!Number.isInteger(e) || e < 0)
      n = [];
    else {
      n = new Array(e);
      for (let l = 0; l < e; l++)
        n[l] = t(l + 1, l, void 0, o);
    }
  else if (re(e))
    if (e[Symbol.iterator])
      n = Array.from(
        e,
        (l, u) => t(l, u, void 0, o)
      );
    else {
      const l = Object.keys(e);
      n = new Array(l.length);
      for (let u = 0, m = l.length; u < m; u++) {
        const h = l[u];
        n[u] = t(e[h], h, u, o);
      }
    }
  else
    n = [];
  return n;
}
const ri = (e) => e ? co(e) ? Vs(e) : ri(e.parent) : null, ts = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ tt(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => e.props,
    $attrs: (e) => e.attrs,
    $slots: (e) => e.slots,
    $refs: (e) => e.refs,
    $parent: (e) => ri(e.parent),
    $root: (e) => ri(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => e.type,
    $forceUpdate: (e) => e.f || (e.f = () => {
      yi(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = _s.bind(e.proxy)),
    $watch: (e) => Ct
  })
), qs = (e, t) => e !== oe && !e.__isScriptSetup && te(e, t), vr = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: s, setupState: i, data: n, props: o, accessCache: r, type: l, appContext: u } = e;
    if (t[0] !== "$") {
      const M = r[t];
      if (M !== void 0)
        switch (M) {
          case 1:
            return i[t];
          case 2:
            return n[t];
          case 4:
            return s[t];
          case 3:
            return o[t];
        }
      else {
        if (qs(i, t))
          return r[t] = 1, i[t];
        if (te(o, t))
          return r[t] = 3, o[t];
        if (s !== oe && te(s, t))
          return r[t] = 4, s[t];
        r[t] = 0;
      }
    }
    const m = ts[t];
    let h, y;
    if (m)
      return t === "$attrs" && ge(e.attrs, "get", ""), m(e);
    if (
      // css module (injected by vue-loader)
      (h = l.__cssModules) && (h = h[t])
    )
      return h;
    if (s !== oe && te(s, t))
      return r[t] = 4, s[t];
    if (
      // global properties
      y = u.config.globalProperties, te(y, t)
    )
      return y[t];
  },
  set({ _: e }, t, s) {
    const { data: i, setupState: n, ctx: o } = e;
    return qs(n, t) ? (n[t] = s, !0) : te(e.props, t) || t[0] === "$" && t.slice(1) in e ? !1 : (o[t] = s, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: s, ctx: i, appContext: n, props: o, type: r }
  }, l) {
    let u;
    return !!(s[l] || qs(t, l) || te(o, l) || te(i, l) || te(ts, l) || te(n.config.globalProperties, l) || (u = r.__cssModules) && u[l]);
  },
  defineProperty(e, t, s) {
    return s.get != null ? e._.accessCache[t] = 0 : te(s, "value") && this.set(e, t, s.value, null), Reflect.defineProperty(e, t, s);
  }
};
function Wn() {
  return {
    app: null,
    config: {
      isNativeTag: ln,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let yr = 0;
function wr(e, t) {
  return function(i, n = null) {
    se(i) || (i = tt({}, i)), n != null && !re(n) && (n = null);
    const o = Wn(), r = /* @__PURE__ */ new WeakSet(), l = [];
    let u = !1;
    const m = o.app = {
      _uid: yr++,
      _component: i,
      _props: n,
      _container: null,
      _context: o,
      _instance: null,
      version: Xr,
      get config() {
        return o.config;
      },
      set config(h) {
      },
      use(h, ...y) {
        return r.has(h) || (h && se(h.install) ? (r.add(h), h.install(m, ...y)) : se(h) && (r.add(h), h(m, ...y))), m;
      },
      mixin(h) {
        return m;
      },
      component(h, y) {
        return y ? (o.components[h] = y, m) : o.components[h];
      },
      directive(h, y) {
        return y ? (o.directives[h] = y, m) : o.directives[h];
      },
      mount(h, y, M) {
        if (!u) {
          const z = m._ceVNode || B(i, n);
          return z.appContext = o, M === !0 ? M = "svg" : M === !1 && (M = void 0), e(z, h, M), u = !0, m._container = h, h.__vue_app__ = m, Vs(z.component);
        }
      },
      onUnmount(h) {
        l.push(h);
      },
      unmount() {
        u && (et(
          l,
          m._instance,
          16
        ), e(null, m._container), delete m._container.__vue_app__);
      },
      provide(h, y) {
        return o.provides[h] = y, m;
      },
      runWithContext(h) {
        const y = Pt;
        Pt = m;
        try {
          return h();
        } finally {
          Pt = y;
        }
      }
    };
    return m;
  };
}
let Pt = null;
const _r = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Le(t)}Modifiers`] || e[`${Mt(t)}Modifiers`];
function kr(e, t, ...s) {
  if (e.isUnmounted) return;
  const i = e.vnode.props || oe;
  let n = s;
  const o = t.startsWith("update:"), r = o && _r(i, t.slice(7));
  r && (r.trim && (n = s.map((h) => pe(h) ? h.trim() : h)), r.number && (n = n.map(Os)));
  let l, u = i[l = Ls(t)] || // also try camelCase event handler (#2249)
  i[l = Ls(Le(t))];
  !u && o && (u = i[l = Ls(Mt(t))]), u && et(
    u,
    e,
    6,
    n
  );
  const m = i[l + "Once"];
  if (m) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[l])
      return;
    e.emitted[l] = !0, et(
      m,
      e,
      6,
      n
    );
  }
}
function zr(e, t, s = !1) {
  const i = t.emitsCache, n = i.get(e);
  if (n !== void 0)
    return n;
  const o = e.emits;
  let r = {};
  return o ? (H(o) ? o.forEach((l) => r[l] = null) : tt(r, o), re(e) && i.set(e, r), r) : (re(e) && i.set(e, null), null);
}
function Ps(e, t) {
  return !e || !Ms(t) ? !1 : (t = t.slice(2), t = t === "Once" ? t : t.replace(/Once$/, ""), te(e, t[0].toLowerCase() + t.slice(1)) || te(e, Mt(t)) || te(e, t));
}
function Pi(e) {
  const {
    type: t,
    vnode: s,
    proxy: i,
    withProxy: n,
    propsOptions: [o],
    slots: r,
    attrs: l,
    emit: u,
    render: m,
    renderCache: h,
    props: y,
    data: M,
    setupState: z,
    ctx: D,
    inheritAttrs: V
  } = e, ne = ks(e);
  let W, U;
  try {
    if (s.shapeFlag & 4) {
      const N = n || i, G = N;
      W = Ye(
        m.call(
          G,
          N,
          h,
          y,
          z,
          M,
          D
        )
      ), U = l;
    } else {
      const N = t;
      W = Ye(
        N.length > 1 ? N(
          y,
          { attrs: l, slots: r, emit: u }
        ) : N(
          y,
          null
        )
      ), U = t.props ? l : Cr(l);
    }
  } catch (N) {
    Tt.length = 0, Ns(N, e, 1), W = B(He);
  }
  let j = W;
  if (U && V !== !1) {
    const N = Object.keys(U), { shapeFlag: G } = j;
    N.length && G & 7 && (o && N.some(Es) && (U = Sr(
      U,
      o
    )), j = jt(j, U, !1, !0));
  }
  if (s.dirs && (j = jt(j, null, !1, !0), j.dirs = j.dirs ? j.dirs.concat(s.dirs) : s.dirs), s.transition) {
    const N = Fs(j.type) && Dn(j) || j;
    zs(N, s.transition);
  }
  return W = j, ks(ne), W;
}
function qn(e, t = !0) {
  let s;
  for (let i = 0; i < e.length; i++) {
    const n = e[i];
    if (ki(n)) {
      if (n.type !== He || n.children === "v-if") {
        if (s)
          return;
        s = n;
      }
    } else
      return;
  }
  return s;
}
const Cr = (e) => {
  let t;
  for (const s in e)
    (s === "class" || s === "style" || Ms(s)) && ((t || (t = {}))[s] = e[s]);
  return t;
}, Sr = (e, t) => {
  const s = {};
  for (const i in e)
    (!Es(i) || !(i.slice(9) in t)) && (s[i] = e[i]);
  return s;
};
function Tr(e, t, s) {
  const { props: i, children: n, component: o } = e, { props: r, children: l, patchFlag: u } = t, m = o.emitsOptions;
  if (t.dirs || t.transition)
    return !0;
  if (s && u >= 0) {
    if (u & 1024)
      return !0;
    if (u & 16)
      return i ? ji(i, r, m) : !!r;
    if (u & 8) {
      const h = t.dynamicProps;
      for (let y = 0; y < h.length; y++) {
        const M = h[y];
        if (Gn(r, i, M) && !Ps(m, M))
          return !0;
      }
    }
  } else
    return (n || l) && (!l || !l.$stable) ? !0 : i === r ? !1 : i ? r ? ji(i, r, m) : !0 : !!r;
  return !1;
}
function ji(e, t, s) {
  const i = Object.keys(t);
  if (i.length !== Object.keys(e).length)
    return !0;
  for (let n = 0; n < i.length; n++) {
    const o = i[n];
    if (!te(e, o) || Gn(t, e, o) && !Ps(s, o))
      return !0;
  }
  return !1;
}
function Gn(e, t, s) {
  const i = e[s], n = t[s];
  return s === "style" && re(i) && re(n) ? !ct(i, n) : i !== n;
}
function Mr({ vnode: e, parent: t, suspense: s }, i) {
  for (; t; ) {
    const n = t.subTree;
    if (n.suspense && n.suspense.activeBranch === e && (n.suspense.vnode.el = n.el = i, e = n), n === e)
      (e = t.vnode).el = i, t = t.parent;
    else
      break;
  }
  s && s.activeBranch === e && (s.vnode.el = i);
}
const Yn = {}, Jn = () => Object.create(Yn), Zn = (e) => Object.getPrototypeOf(e) === Yn;
function Er(e, t, s, i = !1) {
  const n = {}, o = Jn();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), Xn(e, t, n, o);
  for (const r in e.propsOptions[0])
    r in n || (n[r] = void 0);
  s ? e.props = i ? n : /* @__PURE__ */ Yo(n) : e.type.props ? e.props = n : e.props = o, e.attrs = o;
}
function Ar(e, t, s, i) {
  const {
    props: n,
    attrs: o,
    vnode: { patchFlag: r }
  } = e, l = /* @__PURE__ */ Z(n), [u] = e.propsOptions;
  let m = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (i || r > 0) && !(r & 16)
  ) {
    if (r & 8) {
      const h = e.vnode.dynamicProps;
      for (let y = 0; y < h.length; y++) {
        let M = h[y];
        if (Ps(e.emitsOptions, M))
          continue;
        const z = t[M];
        if (u)
          if (te(o, M))
            z !== o[M] && (o[M] = z, m = !0);
          else {
            const D = Le(M);
            n[D] = li(
              u,
              l,
              D,
              z,
              e,
              !1
            );
          }
        else
          z !== o[M] && (o[M] = z, m = !0);
      }
    }
  } else {
    Xn(e, t, n, o) && (m = !0);
    let h;
    for (const y in l)
      (!t || // for camelCase
      !te(t, y) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((h = Mt(y)) === y || !te(t, h))) && (u ? s && // for camelCase
      (s[y] !== void 0 || // for kebab-case
      s[h] !== void 0) && (n[y] = li(
        u,
        l,
        y,
        void 0,
        e,
        !0
      )) : delete n[y]);
    if (o !== l)
      for (const y in o)
        (!t || !te(t, y)) && (delete o[y], m = !0);
  }
  m && rt(e.attrs, "set", "");
}
function Xn(e, t, s, i) {
  const [n, o] = e.propsOptions;
  let r = !1, l;
  if (t)
    for (let u in t) {
      if (Jt(u))
        continue;
      const m = t[u];
      let h;
      n && te(n, h = Le(u)) ? !o || !o.includes(h) ? s[h] = m : (l || (l = {}))[h] = m : Ps(e.emitsOptions, u) || (!(u in i) || m !== i[u]) && (i[u] = m, r = !0);
    }
  if (o) {
    const u = /* @__PURE__ */ Z(s), m = l || oe;
    for (let h = 0; h < o.length; h++) {
      const y = o[h];
      s[y] = li(
        n,
        u,
        y,
        m[y],
        e,
        !te(m, y)
      );
    }
  }
  return r;
}
function li(e, t, s, i, n, o) {
  const r = e[s];
  if (r != null) {
    const l = te(r, "default");
    if (l && i === void 0) {
      const u = r.default;
      if (r.type !== Function && !r.skipFactory && se(u)) {
        const { propsDefaults: m } = n;
        if (s in m)
          i = m[s];
        else {
          const h = zi(n);
          i = m[s] = u.call(
            null,
            t
          ), h();
        }
      } else
        i = u;
      n.ce && n.ce._setProp(s, i);
    }
    r[
      0
      /* shouldCast */
    ] && (o && !l ? i = !1 : r[
      1
      /* shouldCastTrue */
    ] && (i === "" || i === Mt(s)) && (i = !0));
  }
  return i;
}
function Or(e, t, s = !1) {
  const i = t.propsCache, n = i.get(e);
  if (n)
    return n;
  const o = e.props, r = {}, l = [];
  if (!o)
    return re(e) && i.set(e, zt), zt;
  if (H(o))
    for (let m = 0; m < o.length; m++) {
      const h = Le(o[m]);
      Vi(h) && (r[h] = oe);
    }
  else if (o)
    for (const m in o) {
      const h = Le(m);
      if (Vi(h)) {
        const y = o[m], M = r[h] = H(y) || se(y) ? { type: y } : tt({}, y), z = M.type;
        let D = !1, V = !0;
        if (H(z))
          for (let ne = 0; ne < z.length; ++ne) {
            const W = z[ne], U = se(W) && W.name;
            if (U === "Boolean") {
              D = !0;
              break;
            } else U === "String" && (V = !1);
          }
        else
          D = se(z) && z.name === "Boolean";
        M[
          0
          /* shouldCast */
        ] = D, M[
          1
          /* shouldCastTrue */
        ] = V, (D || te(M, "default")) && l.push(h);
      }
    }
  const u = [r, l];
  return re(e) && i.set(e, u), u;
}
function Vi(e) {
  return e[0] !== "$" && !Jt(e);
}
const wi = (e) => e === "_" || e === "_ctx" || e === "$stable", _i = (e) => H(e) ? e.map(Ye) : [Ye(e)], Ir = (e, t, s) => {
  if (t._n)
    return t;
  const i = ar((...n) => _i(t(...n)), s);
  return i._c = !1, i;
}, Qn = (e, t, s) => {
  const i = e._ctx;
  for (const n in e) {
    if (wi(n)) continue;
    const o = e[n];
    if (se(o))
      t[n] = Ir(n, o, i);
    else if (o != null) {
      const r = _i(o);
      t[n] = () => r;
    }
  }
}, eo = (e, t) => {
  const s = _i(t);
  e.slots.default = () => s;
}, to = (e, t, s) => {
  for (const i in t)
    (s || !wi(i)) && (e[i] = t[i]);
}, Rr = (e, t, s) => {
  const i = e.slots = Jn();
  if (e.vnode.shapeFlag & 32) {
    const n = t._;
    n ? (to(i, t, s), s && fn(i, "_", n, !0)) : Qn(t, i);
  } else t && eo(e, t);
}, $r = (e, t, s) => {
  const { vnode: i, slots: n } = e;
  let o = !0, r = oe;
  if (i.shapeFlag & 32) {
    const l = t._;
    l ? s && l === 1 ? o = !1 : to(n, t, s) : (o = !t.$stable, Qn(t, n)), r = t;
  } else t && (eo(e, t), r = { default: 1 });
  if (o)
    for (const l in n)
      !wi(l) && r[l] == null && delete n[l];
}, _e = Vr;
function Nr(e) {
  return Fr(e);
}
function Fr(e, t) {
  const s = Is();
  s.__VUE__ = !0;
  const {
    insert: i,
    remove: n,
    patchProp: o,
    createElement: r,
    createText: l,
    createComment: u,
    setText: m,
    setElementText: h,
    parentNode: y,
    nextSibling: M,
    setScopeId: z = Ct,
    insertStaticContent: D
  } = e, V = (a, f, x, k = null, b = null, _ = null, T = void 0, C = null, S = !!f.dynamicChildren) => {
    if (a === f)
      return;
    a && !Wt(a, f) && (k = Re(a), Ce(a, b, _, !0), a = null), f.patchFlag === -2 && (S = !1, f.dynamicChildren = null), f.dynamicChildren && a && a.dynamicChildren && a.dynamicChildren.hasOnce && (f.dynamicChildren === zt && (f.dynamicChildren = []), f.dynamicChildren.hasOnce = !0);
    const { type: w, ref: R, shapeFlag: E } = f;
    switch (w) {
      case js:
        ne(a, f, x, k);
        break;
      case He:
        W(a, f, x, k);
        break;
      case Ys:
        a == null && U(f, x, k, T);
        break;
      case ee:
        we(
          a,
          f,
          x,
          k,
          b,
          _,
          T,
          C,
          S
        );
        break;
      default:
        E & 1 ? G(
          a,
          f,
          x,
          k,
          b,
          _,
          T,
          C,
          S
        ) : E & 6 ? Oe(
          a,
          f,
          x,
          k,
          b,
          _,
          T,
          C,
          S
        ) : (E & 64 || E & 128) && w.process(
          a,
          f,
          x,
          k,
          b,
          _,
          T,
          C,
          S,
          me
        );
    }
    R != null && b ? Qt(R, a && a.ref, _, f || a, !f) : R == null && a && a.ref != null && Qt(a.ref, null, _, a, !0);
  }, ne = (a, f, x, k) => {
    if (a == null)
      i(
        f.el = l(f.children),
        x,
        k
      );
    else {
      const b = f.el = a.el;
      f.children !== a.children && m(b, f.children);
    }
  }, W = (a, f, x, k) => {
    a == null ? i(
      f.el = u(f.children || ""),
      x,
      k
    ) : f.el = a.el;
  }, U = (a, f, x, k) => {
    [a.el, a.anchor] = D(
      a.children,
      f,
      x,
      k,
      a.el,
      a.anchor
    );
  }, j = ({ el: a, anchor: f }, x, k) => {
    let b;
    for (; a && a !== f; )
      b = M(a), i(a, x, k), a = b;
    i(f, x, k);
  }, N = ({ el: a, anchor: f }) => {
    let x;
    for (; a && a !== f; )
      x = M(a), n(a), a = x;
    n(f);
  }, G = (a, f, x, k, b, _, T, C, S) => {
    if (f.type === "svg" ? T = "svg" : f.type === "math" && (T = "mathml"), a == null)
      Ae(
        f,
        x,
        k,
        b,
        _,
        T,
        C,
        S
      );
    else {
      const w = a.el && a.el._isVueCE ? a.el : null;
      try {
        w && w._beginPatch(), Ue(
          a,
          f,
          b,
          _,
          T,
          C,
          S
        );
      } finally {
        w && w._endPatch();
      }
    }
  }, Ae = (a, f, x, k, b, _, T, C) => {
    let S, w;
    const { props: R, shapeFlag: E, transition: F, dirs: p } = a;
    if (S = a.el = r(
      a.type,
      _,
      R && R.is,
      R
    ), E & 8 ? h(S, a.children) : E & 16 && he(
      a.children,
      S,
      null,
      k,
      b,
      Gs(a, _),
      T,
      C
    ), p && wt(a, null, k, "created"), de(S, a, a.scopeId, T, k), R) {
      for (const d in R)
        d !== "value" && !Jt(d) && o(S, d, null, R[d], _, k);
      "value" in R && o(S, "value", null, R.value, _), (w = R.onVnodeBeforeMount) && Ke(w, k, a);
    }
    p && wt(a, null, k, "beforeMount");
    const K = Pr(b, F);
    K && F.beforeEnter(S), i(S, f, x), ((w = R && R.onVnodeMounted) || K || p) && _e(() => {
      try {
        w && Ke(w, k, a), K && F.enter(S), p && wt(a, null, k, "mounted");
      } finally {
      }
    }, b);
  }, de = (a, f, x, k, b) => {
    if (x && z(a, x), k)
      for (let _ = 0; _ < k.length; _++)
        z(a, k[_]);
    if (b) {
      let _ = b.subTree;
      if (f === _ || no(_.type) && (_.ssContent === f || _.ssFallback === f)) {
        const T = b.vnode;
        de(
          a,
          T,
          T.scopeId,
          T.slotScopeIds,
          b.parent
        );
      }
    }
  }, he = (a, f, x, k, b, _, T, C, S = 0) => {
    for (let w = S; w < a.length; w++) {
      const R = a[w] = C ? ot(a[w]) : Ye(a[w]);
      V(
        null,
        R,
        f,
        x,
        k,
        b,
        _,
        T,
        C
      );
    }
  }, Ue = (a, f, x, k, b, _, T) => {
    const C = f.el = a.el;
    let { patchFlag: S, dynamicChildren: w, dirs: R } = f;
    S |= a.patchFlag & 16;
    const E = a.props || oe, F = f.props || oe;
    let p;
    if (x && _t(x, !1), (p = F.onVnodeBeforeUpdate) && Ke(p, x, f, a), R && wt(f, a, x, "beforeUpdate"), x && _t(x, !0), // #6385 the old vnode may be a user-wrapped non-isomorphic block
    // Force full diff when block metadata is unstable.
    w && (!a.dynamicChildren || a.dynamicChildren.length !== w.length) && (S = 0, T = !1, w = null), (E.innerHTML && F.innerHTML == null || E.textContent && F.textContent == null) && h(C, ""), w ? ze(
      a.dynamicChildren,
      w,
      C,
      x,
      k,
      Gs(f, b),
      _
    ) : T || st(
      a,
      f,
      C,
      null,
      x,
      k,
      Gs(f, b),
      _,
      !1
    ), S > 0) {
      if (S & 16)
        ye(C, E, F, x, b);
      else if (S & 2 && E.class !== F.class && o(C, "class", null, F.class, b), S & 4 && o(C, "style", E.style, F.style, b), S & 8) {
        const K = f.dynamicProps;
        for (let d = 0; d < K.length; d++) {
          const P = K[d], q = E[P], le = F[P];
          (le !== q || P === "value") && o(C, P, q, le, b, x);
        }
      }
      S & 1 && a.children !== f.children && h(C, f.children);
    } else !T && w == null && ye(C, E, F, x, b);
    ((p = F.onVnodeUpdated) || R) && _e(() => {
      p && Ke(p, x, f, a), R && wt(f, a, x, "updated");
    }, k);
  }, ze = (a, f, x, k, b, _, T) => {
    for (let C = 0; C < f.length; C++) {
      const S = a[C], w = f[C], R = S.el || ai(S), E = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        R && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (S.type === ee || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !Wt(S, w) || // - In the case of a component, it could contain anything.
        S.shapeFlag & 198) ? y(R) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          x
        )
      );
      V(
        S,
        w,
        E,
        null,
        k,
        b,
        _,
        T,
        !0
      );
    }
  }, ye = (a, f, x, k, b) => {
    if (f !== x) {
      if (f !== oe)
        for (const _ in f)
          !Jt(_) && !(_ in x) && o(
            a,
            _,
            f[_],
            null,
            b,
            k
          );
      for (const _ in x) {
        if (Jt(_)) continue;
        const T = x[_], C = f[_];
        T !== C && _ !== "value" && o(a, _, C, T, b, k);
      }
      "value" in x && o(a, "value", f.value, x.value, b);
    }
  }, we = (a, f, x, k, b, _, T, C, S) => {
    const w = f.el = a ? a.el : l(""), R = f.anchor = a ? a.anchor : l("");
    let { patchFlag: E, dynamicChildren: F, slotScopeIds: p } = f;
    p && (C = C ? C.concat(p) : p), a == null ? (i(w, x, k), i(R, x, k), he(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      f.children || [],
      x,
      R,
      b,
      _,
      T,
      C,
      S
    )) : E > 0 && E & 64 && F && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    a.dynamicChildren && a.dynamicChildren.length === F.length ? (ze(
      a.dynamicChildren,
      F,
      x,
      b,
      _,
      T,
      C
    ), // #2080 if the stable fragment has a key, it's a <template v-for> that may
    //  get moved around. Make sure all root level vnodes inherit el.
    // #2134 or if it's a component root, it may also get moved around
    // as the component is being moved.
    (f.key != null || b && f === b.subTree) && so(
      a,
      f,
      !0
      /* shallow */
    )) : st(
      a,
      f,
      x,
      R,
      b,
      _,
      T,
      C,
      S
    );
  }, Oe = (a, f, x, k, b, _, T, C, S) => {
    f.slotScopeIds = C, a == null ? f.shapeFlag & 512 ? b.ctx.activate(
      f,
      x,
      k,
      T,
      S
    ) : bt(
      f,
      x,
      k,
      b,
      _,
      T,
      S
    ) : Lt(a, f, S);
  }, bt = (a, f, x, k, b, _, T) => {
    const C = a.component = Kr(
      a,
      k,
      b
    );
    if (Hn(a) && (C.ctx.renderer = me), qr(C, !1, T), C.asyncDep) {
      if (b && b.registerDep(
        C,
        vt,
        T,
        _
      ), !a.el) {
        const S = C.subTree = B(He);
        W(null, S, f, x), a.placeholder = S.el;
      }
    } else
      vt(
        C,
        a,
        f,
        x,
        b,
        _,
        T
      );
  }, Lt = (a, f, x) => {
    const k = f.component = a.component;
    if (Tr(a, f, x))
      if (k.asyncDep && !k.asyncResolved) {
        f.el = a.el, f.placeholder = a.placeholder, Pe(k, f, x);
        return;
      } else
        k.next = f, k.update();
    else
      f.el = a.el, f.placeholder = a.placeholder, k.vnode = f;
  }, vt = (a, f, x, k, b, _, T) => {
    const C = () => {
      if (a.isMounted) {
        let { next: E, bu: F, u: p, parent: K, vnode: d } = a;
        {
          const fe = io(a);
          if (fe) {
            E && (E.el = d.el, Pe(a, E, T)), fe.asyncDep.then(() => {
              _e(() => {
                a.isUnmounted || w();
              }, b);
            });
            return;
          }
        }
        let P = E, q;
        _t(a, !1), E ? (E.el = d.el, Pe(a, E, T)) : E = d, F && ms(F), (q = E.props && E.props.onVnodeBeforeUpdate) && Ke(q, K, E, d), _t(a, !0);
        const le = Pi(a), xe = a.subTree;
        a.subTree = le, V(
          xe,
          le,
          // parent may have changed if it's in a teleport
          y(xe.el),
          // anchor may have changed if it's in a fragment
          Re(xe),
          a,
          b,
          _
        ), E.el = le.el, P === null && Mr(a, le.el), p && _e(p, b), (q = E.props && E.props.onVnodeUpdated) && _e(
          () => Ke(q, K, E, d),
          b
        );
      } else {
        let E;
        const { el: F, props: p } = f, { bm: K, m: d, parent: P, root: q, type: le } = a, xe = es(f);
        _t(a, !1), K && ms(K), !xe && (E = p && p.onVnodeBeforeMount) && Ke(E, P, f), _t(a, !0);
        {
          q.ce && q.ce._hasShadowRoot() && q.ce._injectChildStyle(
            le,
            a.parent ? a.parent.type : void 0
          );
          const fe = a.subTree = Pi(a);
          V(
            null,
            fe,
            x,
            k,
            a,
            b,
            _
          ), f.el = fe.el;
        }
        if (d && _e(d, b), !xe && (E = p && p.onVnodeMounted)) {
          const fe = f;
          _e(
            () => Ke(E, P, fe),
            b
          );
        }
        (f.shapeFlag & 256 || P && es(P.vnode) && P.vnode.shapeFlag & 256) && a.a && _e(a.a, b), a.isMounted = !0, f = x = k = null;
      }
    };
    a.scope.on();
    const S = a.effect = new xn(C);
    a.scope.off();
    const w = a.update = S.run.bind(S), R = a.job = S.runIfDirty.bind(S);
    R.i = a, R.id = a.uid, S.scheduler = () => yi(R), _t(a, !0), w();
  }, Pe = (a, f, x) => {
    f.component = a;
    const k = a.vnode.props;
    a.vnode = f, a.next = null, Ar(a, f.props, k, x), $r(a, f.children, x), pt(), Fn(a), ut();
  }, st = (a, f, x, k, b, _, T, C, S = !1) => {
    const w = a && a.children, R = a ? a.shapeFlag : 0, E = f.children, { patchFlag: F, shapeFlag: p } = f;
    if (F > 0) {
      if (F & 128) {
        At(
          w,
          E,
          x,
          k,
          b,
          _,
          T,
          C,
          S
        );
        return;
      } else if (F & 256) {
        Et(
          w,
          E,
          x,
          k,
          b,
          _,
          T,
          C,
          S
        );
        return;
      }
    }
    p & 8 ? (R & 16 && Ie(w, b, _), E !== w && h(x, E)) : R & 16 ? p & 16 ? At(
      w,
      E,
      x,
      k,
      b,
      _,
      T,
      C,
      S
    ) : Ie(w, b, _, !0) : (R & 8 && h(x, ""), p & 16 && he(
      E,
      x,
      k,
      b,
      _,
      T,
      C,
      S
    ));
  }, Et = (a, f, x, k, b, _, T, C, S) => {
    a = a || zt, f = f || zt;
    const w = a.length, R = f.length, E = Math.min(w, R);
    let F;
    for (F = 0; F < E; F++) {
      const p = f[F] = S ? ot(f[F]) : Ye(f[F]);
      V(
        a[F],
        p,
        x,
        null,
        b,
        _,
        T,
        C,
        S
      );
    }
    w > R ? Ie(
      a,
      b,
      _,
      !0,
      !1,
      E
    ) : he(
      f,
      x,
      k,
      b,
      _,
      T,
      C,
      S,
      E
    );
  }, At = (a, f, x, k, b, _, T, C, S) => {
    let w = 0;
    const R = f.length;
    let E = a.length - 1, F = R - 1;
    for (; w <= E && w <= F; ) {
      const p = a[w], K = f[w] = S ? ot(f[w]) : Ye(f[w]);
      if (Wt(p, K))
        V(
          p,
          K,
          x,
          null,
          b,
          _,
          T,
          C,
          S
        );
      else
        break;
      w++;
    }
    for (; w <= E && w <= F; ) {
      const p = a[E], K = f[F] = S ? ot(f[F]) : Ye(f[F]);
      if (Wt(p, K))
        V(
          p,
          K,
          x,
          null,
          b,
          _,
          T,
          C,
          S
        );
      else
        break;
      E--, F--;
    }
    if (w > E) {
      if (w <= F) {
        const p = F + 1, K = p < R ? f[p].el : k;
        for (; w <= F; )
          V(
            null,
            f[w] = S ? ot(f[w]) : Ye(f[w]),
            x,
            K,
            b,
            _,
            T,
            C,
            S
          ), w++;
      }
    } else if (w > F)
      for (; w <= E; )
        Ce(a[w], b, _, !0), w++;
    else {
      const p = w, K = w, d = /* @__PURE__ */ new Map();
      for (w = K; w <= F; w++) {
        const v = f[w] = S ? ot(f[w]) : Ye(f[w]);
        v.key != null && d.set(v.key, w);
      }
      let P, q = 0;
      const le = F - K + 1;
      let xe = !1, fe = 0;
      const Be = new Array(le);
      for (w = 0; w < le; w++) Be[w] = 0;
      for (w = p; w <= E; w++) {
        const v = a[w];
        if (q >= le) {
          Ce(v, b, _, !0);
          continue;
        }
        let $;
        if (v.key != null)
          $ = d.get(v.key);
        else
          for (P = K; P <= F; P++)
            if (Be[P - K] === 0 && Wt(v, f[P])) {
              $ = P;
              break;
            }
        $ === void 0 ? Ce(v, b, _, !0) : (Be[$ - K] = w + 1, $ >= fe ? fe = $ : xe = !0, V(
          v,
          f[$],
          x,
          null,
          b,
          _,
          T,
          C,
          S
        ), q++);
      }
      const Ht = xe ? jr(Be) : zt;
      for (P = Ht.length - 1, w = le - 1; w >= 0; w--) {
        const v = K + w, $ = f[v], J = f[v + 1], ae = v + 1 < R ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          J.el || ai(J)
        ) : k;
        Be[w] === 0 ? V(
          null,
          $,
          x,
          ae,
          b,
          _,
          T,
          C,
          S
        ) : xe && (P < 0 || w !== Ht[P] ? je($, x, ae, 2) : P--);
      }
    }
  }, je = (a, f, x, k, b = null) => {
    const { el: _, type: T, transition: C, children: S, shapeFlag: w } = a;
    if (w & 6) {
      je(a.component.subTree, f, x, k);
      return;
    }
    if (w & 128) {
      a.suspense.move(f, x, k);
      return;
    }
    if (w & 64) {
      T.move(a, f, x, me);
      return;
    }
    if (T === ee) {
      i(_, f, x);
      for (let E = 0; E < S.length; E++)
        je(S[E], f, x, k);
      i(a.anchor, f, x);
      return;
    }
    if (T === Ys) {
      j(a, f, x);
      return;
    }
    if (k !== 2 && w & 1 && C)
      if (k === 0)
        C.persisted && !_[Ws] ? i(_, f, x) : (C.beforeEnter(_), i(_, f, x), _e(() => C.enter(_), b));
      else {
        const { leave: E, delayLeave: F, afterLeave: p } = C, K = () => {
          a.ctx.isUnmounted ? n(_) : i(_, f, x);
        }, d = () => {
          const P = _._isLeaving || !!_[Ws];
          _._isLeaving && _[Ws](
            !0
            /* cancelled */
          ), C.persisted && !P ? K() : E(_, () => {
            K(), p && p();
          });
        };
        F ? F(_, K, d) : d();
      }
    else
      i(_, f, x);
  }, Ce = (a, f, x, k = !1, b = !1) => {
    const {
      type: _,
      props: T,
      ref: C,
      children: S,
      dynamicChildren: w,
      shapeFlag: R,
      patchFlag: E,
      dirs: F,
      cacheIndex: p,
      memo: K
    } = a;
    if ((E === -2 || w && w.hasOnce) && (b = !1), C != null && (pt(), Qt(C, null, x, a, !0), ut()), p != null && (!a.ctx || a.ctx === f) && (f.renderCache[p] = void 0), R & 256) {
      f.ctx.deactivate(a);
      return;
    }
    const d = R & 1 && F, P = !es(a);
    let q;
    if (P && (q = T && T.onVnodeBeforeUnmount) && Ke(q, f, a), R & 6)
      Dt(a.component, x, k);
    else {
      if (R & 128) {
        a.suspense.unmount(x, k);
        return;
      }
      d && wt(a, null, f, "beforeUnmount"), R & 64 ? a.type.remove(
        a,
        f,
        x,
        me,
        k
      ) : w && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !w.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (_ !== ee || E > 0 && E & 64) ? Ie(
        w,
        f,
        x,
        !1,
        !0
      ) : (_ === ee && E & 384 || !b && R & 16) && Ie(S, f, x), k && Ot(a);
    }
    const le = K != null && p == null;
    (P && (q = T && T.onVnodeUnmounted) || d || le) && _e(() => {
      q && Ke(q, f, a), d && wt(a, null, f, "unmounted"), le && (a.el = null);
    }, x);
  }, Ot = (a) => {
    const { type: f, el: x, anchor: k, transition: b } = a, _ = f === ee;
    if (_ && !b) {
      It(x, k);
      return;
    }
    if (f === Ys) {
      N(a), b && !b.persisted && b.afterLeave && b.afterLeave();
      return;
    }
    const T = _ ? oi(a) : a, C = () => {
      _ ? y(x) && It(x, k) : n(x), b && !b.persisted && b.afterLeave && b.afterLeave();
    };
    if (T && T.shapeFlag & 1 && b && !b.persisted) {
      const { leave: S, delayLeave: w } = b, R = T.el, E = () => S(R, C);
      w ? w(R, C, E) : E();
    } else
      C();
  }, It = (a, f) => {
    let x;
    for (; a !== f; )
      x = M(a), n(a), a = x;
    n(f);
  }, Dt = (a, f, x) => {
    const { bum: k, scope: b, job: _, subTree: T, um: C, m: S, a: w } = a;
    Li(S), Li(w), k && ms(k), b.stop(), _ ? (_.flags |= 8, Ce(T, a, f, x)) : a.vnode.el && T && (T.transition = a.vnode.transition, Ce(T, a, f, x)), C && _e(C, f), _e(() => {
      a.isUnmounted = !0;
    }, f);
  }, Ie = (a, f, x, k = !1, b = !1, _ = 0) => {
    for (let T = _; T < a.length; T++)
      Ce(a[T], f, x, k, b);
  }, Re = (a) => {
    if (a.shapeFlag & 6)
      return Re(a.component.subTree);
    if (a.shapeFlag & 128)
      return a.suspense.next();
    const f = M(a.anchor || a.el), x = f && f[gr];
    return x ? M(x) : f;
  }, yt = (a, f, x) => {
    const k = a && f._vnode ? void 0 : a && a.component ? a.component.uid : Br();
    lr(() => {
      a == null ? f._vnode && Ce(f._vnode, null, null, !0) : V(
        f._vnode || null,
        a,
        f,
        null,
        null,
        null,
        x
      ), f._vnode = a;
    }, k);
  }, me = {
    p: V,
    um: Ce,
    m: je,
    r: Ot,
    mt: bt,
    mc: he,
    pc: st,
    pbc: ze,
    n: Re,
    o: e
  };
  return {
    render: yt,
    hydrate: void 0,
    createApp: wr(yt)
  };
}
function Gs({ type: e, props: t }, s) {
  return s === "svg" && e === "foreignObject" || s === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : s;
}
function _t({ effect: e, job: t }, s) {
  s ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function Pr(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function so(e, t, s = !1) {
  const i = e.children, n = t.children;
  if (H(i) && H(n))
    for (let o = 0; o < i.length; o++) {
      const r = i[o];
      let l = n[o];
      l.shapeFlag & 1 && !l.dynamicChildren && ((l.patchFlag <= 0 || l.patchFlag === 32) && (l = n[o] = ot(n[o]), l.el = r.el), !s && l.patchFlag !== -2 && so(r, l)), l.type === js && (l.patchFlag === -1 && (l = n[o] = ot(l)), l.el = r.el), l.type === He && !l.el && (l.el = r.el);
    }
}
function jr(e) {
  const t = e.slice(), s = [0];
  let i, n, o, r, l;
  const u = e.length;
  for (i = 0; i < u; i++) {
    const m = e[i];
    if (m !== 0) {
      if (n = s[s.length - 1], e[n] < m) {
        t[i] = n, s.push(i);
        continue;
      }
      for (o = 0, r = s.length - 1; o < r; )
        l = o + r >> 1, e[s[l]] < m ? o = l + 1 : r = l;
      m < e[s[o]] && (o > 0 && (t[i] = s[o - 1]), s[o] = i);
    }
  }
  for (o = s.length, r = s[o - 1]; o-- > 0; )
    s[o] = r, r = t[r];
  return s;
}
function io(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : io(t);
}
function Li(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
function ai(e) {
  if (e.placeholder)
    return e.placeholder;
  const t = e.component;
  return t ? ai(t.subTree) : null;
}
const no = (e) => e.__isSuspense;
function Vr(e, t) {
  t && t.pendingBranch ? H(e) ? t.effects.push(...e) : t.effects.push(e) : rr(e);
}
const ee = /* @__PURE__ */ Symbol.for("v-fgt"), js = /* @__PURE__ */ Symbol.for("v-txt"), He = /* @__PURE__ */ Symbol.for("v-cmt"), Ys = /* @__PURE__ */ Symbol.for("v-stc"), Tt = [];
let Ee = null;
function A(e = !1) {
  Tt.push(Ee = e ? null : []);
}
function oo() {
  Tt.pop(), Ee = Tt[Tt.length - 1] || null;
}
let os = 1;
function Di(e, t = !1) {
  os += e, e < 0 && Ee && t && (Ee.hasOnce = !0);
}
function ro(e) {
  return e.dynamicChildren = os > 0 ? Ee || zt : null, oo(), os > 0 && Ee && Ee.push(e), e;
}
function I(e, t, s, i, n, o) {
  return ro(
    c(
      e,
      t,
      s,
      i,
      n,
      o,
      !0
    )
  );
}
function Ft(e, t, s, i, n) {
  return ro(
    B(
      e,
      t,
      s,
      i,
      n,
      !0
    )
  );
}
function ki(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function Wt(e, t) {
  return e.type === t.type && e.key === t.key;
}
const lo = ({ key: e }) => e ?? null, xs = ({
  ref: e,
  ref_key: t,
  ref_for: s
}) => (typeof e == "number" && (e = "" + e), e != null ? pe(e) || /* @__PURE__ */ ce(e) || se(e) ? { i: $e, r: e, k: t, f: !!s } : e : null);
function c(e, t = null, s = null, i = 0, n = null, o = e === ee ? 0 : 1, r = !1, l = !1) {
  const u = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && lo(t),
    ref: t && xs(t),
    scopeId: Vn,
    slotScopeIds: null,
    children: s,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: i,
    dynamicProps: n,
    dynamicChildren: null,
    appContext: null,
    ctx: $e
  };
  return l ? (Ss(u, s), o & 128 && e.normalize(u)) : s && (u.shapeFlag |= pe(s) ? 8 : 16), os > 0 && // avoid a block node from tracking itself
  !r && // has current parent block
  Ee && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (u.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  u.patchFlag !== 32 && Ee.push(u), u;
}
const B = Lr;
function Lr(e, t = null, s = null, i = 0, n = null, o = !1) {
  if ((!e || e === br) && (e = He), ki(e)) {
    const l = jt(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return s && Ss(l, s), os > 0 && !o && Ee && (l.shapeFlag & 6 ? Ee[Ee.indexOf(e)] = l : Ee.push(l)), l.patchFlag = -2, l;
  }
  if (Zr(e) && (e = e.__vccOpts), t) {
    t = Dr(t);
    let { class: l, style: u } = t;
    l && !pe(l) && (t.class = ke(l)), re(u) && (/* @__PURE__ */ vi(u) && !H(u) && (u = tt({}, u)), t.style = Rs(u));
  }
  const r = pe(e) ? 1 : no(e) ? 128 : Fs(e) ? 64 : re(e) ? 4 : se(e) ? 2 : 0;
  return c(
    e,
    t,
    s,
    i,
    n,
    r,
    o,
    !0
  );
}
function Dr(e) {
  return e ? /* @__PURE__ */ vi(e) || Zn(e) ? tt({}, e) : e : null;
}
function jt(e, t, s = !1, i = !1) {
  const { props: n, ref: o, patchFlag: r, children: l, transition: u } = e, m = t ? Hr(n || {}, t) : n, h = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: m,
    key: m && lo(m),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      s && o ? H(o) ? o.concat(xs(t)) : [o, xs(t)] : xs(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: l,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== ee ? r === -1 ? 16 : r | 16 : r,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: u,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && jt(e.ssContent),
    ssFallback: e.ssFallback && jt(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce,
    cacheIndex: e.cacheIndex
  };
  return u && i && zs(
    h,
    u.clone(h)
  ), h;
}
function L(e = " ", t = 0) {
  return B(js, null, e, t);
}
function X(e = "", t = !1) {
  return t ? (A(), Ft(He, null, e)) : B(He, null, e);
}
function Ye(e) {
  return e == null || typeof e == "boolean" ? B(He) : H(e) ? B(
    ee,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : ki(e) ? ot(e) : B(js, null, String(e));
}
function ot(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : jt(e);
}
function Ss(e, t) {
  let s = 0;
  const { shapeFlag: i } = e;
  if (t == null)
    t = null;
  else if (H(t))
    s = 16;
  else if (typeof t == "object")
    if (i & 65) {
      const n = t.default;
      n && (n._c && (n._d = !1), Ss(e, n()), n._c && (n._d = !0));
      return;
    } else {
      s = 32;
      const n = t._;
      !n && !Zn(t) ? t._ctx = $e : n === 3 && $e && ($e.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else if (se(t)) {
    if (i & 65) {
      Ss(e, { default: t });
      return;
    }
    t = { default: t, _ctx: $e }, s = 32;
  } else
    t = String(t), i & 64 ? (s = 16, t = [L(t)]) : s = 8;
  e.children = t, e.shapeFlag |= s;
}
function Hr(...e) {
  const t = {};
  for (let s = 0; s < e.length; s++) {
    const i = e[s];
    for (const n in i)
      if (n === "class")
        t.class !== i.class && (t.class = ke([t.class, i.class]));
      else if (n === "style")
        t.style = Rs([t.style, i.style]);
      else if (Ms(n)) {
        const o = t[n], r = i[n];
        r && o !== r && !(H(o) && o.includes(r)) ? t[n] = o ? [].concat(o, r) : r : r == null && o == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !Es(n) && (t[n] = r);
      } else n !== "" && (t[n] = i[n]);
  }
  return t;
}
function Ke(e, t, s, i = null) {
  et(e, t, 7, [
    s,
    i
  ]);
}
const Ur = Wn();
let ao = 0;
function Br() {
  return ao;
}
function Kr(e, t, s) {
  const i = e.type, n = (t ? t.appContext : e.appContext) || Ur, o = {
    uid: ao++,
    vnode: e,
    type: i,
    parent: t,
    appContext: n,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new Oo(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(n.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Or(i, n),
    emitsOptions: zr(i, n),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: oe,
    // inheritAttrs
    inheritAttrs: i.inheritAttrs,
    // state
    ctx: oe,
    data: oe,
    props: oe,
    attrs: oe,
    slots: oe,
    refs: oe,
    setupState: oe,
    setupContext: null,
    // suspense related
    suspense: s,
    suspenseId: s ? s.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = kr.bind(null, o), e.ce && e.ce(o), o;
}
let Me = null;
const Wr = () => Me || $e;
let Ts, rs;
{
  const e = Is(), t = (s, i) => {
    let n;
    return (n = e[s]) || (n = e[s] = []), n.push(i), (o) => {
      n.length > 1 ? n.forEach((r) => r(o)) : n[0](o);
    };
  };
  Ts = t(
    "__VUE_INSTANCE_SETTERS__",
    (s) => Me = s
  ), rs = t(
    "__VUE_SSR_SETTERS__",
    (s) => ls = s
  );
}
const zi = (e) => {
  const t = Me;
  return Ts(e), e.scope.on(), () => {
    e.scope.off(), Ts(t);
  };
}, Hi = () => {
  Me && Me.scope.off(), Ts(null);
};
function co(e) {
  return e.vnode.shapeFlag & 4;
}
let ls = !1;
function qr(e, t = !1, s = !1) {
  t && rs(t);
  const { props: i, children: n } = e.vnode, o = co(e);
  Er(e, i, o, t), Rr(e, n, s || t);
  const r = o ? Gr(e, t) : void 0;
  return t && rs(!1), r;
}
function Gr(e, t) {
  const s = e.type;
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, vr);
  const { setup: i } = s;
  if (i) {
    pt();
    const n = e.setupContext = i.length > 1 ? Jr(e) : null, o = zi(e), r = ps(
      i,
      e,
      0,
      [
        e.props,
        n
      ]
    ), l = cn(r);
    if (ut(), o(), (l || e.sp) && !es(e) && mr(e), l) {
      if (r.then(Hi, Hi), t)
        return r.then((u) => {
          rs(!0);
          try {
            Ui(e, u, t);
          } finally {
            rs(!1);
          }
        }).catch((u) => {
          Ns(u, e, 0);
        });
      e.asyncDep = r;
    } else
      Ui(e, r);
  } else
    po(e);
}
function Ui(e, t, s) {
  se(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : re(t) && (e.setupState = Rn(t)), po(e);
}
function po(e, t, s) {
  const i = e.type;
  e.render || (e.render = i.render || Ct);
}
const Yr = {
  get(e, t) {
    return ge(e, "get", ""), e[t];
  }
};
function Jr(e) {
  const t = (s) => {
    e.exposed = s || {};
  };
  return {
    attrs: new Proxy(e.attrs, Yr),
    slots: e.slots,
    emit: e.emit,
    expose: t
  };
}
function Vs(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(Rn(Jo(e.exposed)), {
    get(t, s) {
      if (s in t)
        return t[s];
      if (s in ts)
        return ts[s](e);
    },
    has(t, s) {
      return s in t || s in ts;
    }
  })) : e.proxy;
}
function Zr(e) {
  return se(e) && "__vccOpts" in e;
}
const We = (e, t) => /* @__PURE__ */ tr(e, t, ls), Xr = "3.5.44";
/**
* @vue/runtime-dom v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let ci;
const Bi = typeof window < "u" && window.trustedTypes;
if (Bi)
  try {
    ci = /* @__PURE__ */ Bi.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch {
  }
const uo = ci ? (e) => ci.createHTML(e) : (e) => e, Qr = "http://www.w3.org/2000/svg", el = "http://www.w3.org/1998/Math/MathML", nt = typeof document < "u" ? document : null, Ki = nt && /* @__PURE__ */ nt.createElement("template"), tl = {
  insert: (e, t, s) => {
    t.insertBefore(e, s || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, s, i) => {
    const n = t === "svg" ? nt.createElementNS(Qr, e) : t === "mathml" ? nt.createElementNS(el, e) : s ? nt.createElement(e, { is: s }) : nt.createElement(e);
    return e === "select" && i && i.multiple != null && n.setAttribute("multiple", i.multiple), n;
  },
  createText: (e) => nt.createTextNode(e),
  createComment: (e) => nt.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => nt.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, s, i, n, o) {
    const r = s ? s.previousSibling : t.lastChild;
    if (n && (n === o || n.nextSibling))
      for (; t.insertBefore(n.cloneNode(!0), s), !(n === o || !(n = n.nextSibling)); )
        ;
    else {
      Ki.innerHTML = uo(
        i === "svg" ? `<svg>${e}</svg>` : i === "mathml" ? `<math>${e}</math>` : e
      );
      const l = Ki.content;
      if (i === "svg" || i === "mathml") {
        const u = l.firstChild;
        for (; u.firstChild; )
          l.appendChild(u.firstChild);
        l.removeChild(u);
      }
      t.insertBefore(l, s);
    }
    return [
      // first
      r ? r.nextSibling : t.firstChild,
      // last
      s ? s.previousSibling : t.lastChild
    ];
  }
}, sl = /* @__PURE__ */ Symbol("_vtc");
function il(e, t, s) {
  const i = e[sl];
  i && (t = (t ? [t, ...i] : [...i]).join(" ")), t == null ? e.removeAttribute("class") : s ? e.setAttribute("class", t) : e.className = t;
}
const Wi = /* @__PURE__ */ Symbol("_vod"), nl = /* @__PURE__ */ Symbol("_vsh"), ol = /* @__PURE__ */ Symbol(""), rl = /(?:^|;)\s*display\s*:/;
function ll(e, t, s) {
  const i = e.style, n = pe(s);
  let o = !1;
  if (s && !n) {
    if (t)
      if (pe(t))
        for (const r of t.split(";")) {
          const l = r.slice(0, r.indexOf(":")).trim();
          s[l] == null && Yt(i, l, "");
        }
      else
        for (const r in t)
          s[r] == null && Yt(i, r, "");
    for (const r in s) {
      r === "display" && (o = !0);
      const l = s[r];
      l != null ? cl(
        e,
        r,
        !pe(t) && t ? t[r] : void 0,
        l
      ) || Yt(i, r, l) : Yt(i, r, "");
    }
  } else if (n) {
    if (t !== s) {
      const r = i[ol];
      r && (s += ";" + r), i.cssText = s, o = rl.test(s);
    }
  } else t && e.removeAttribute("style");
  Wi in e && ((!n || t !== s) && (e[Wi] = o ? i.display : ""), e[nl] && (i.display = "none"));
}
const gs = /\s*!important$/;
function Yt(e, t, s) {
  if (H(s))
    s.forEach((i) => Yt(e, t, i));
  else if (s == null && (s = ""), t.startsWith("--"))
    gs.test(s) ? e.setProperty(t, s.replace(gs, ""), "important") : e.setProperty(t, s);
  else {
    const i = al(e, t);
    gs.test(s) ? e.setProperty(
      Mt(i),
      s.replace(gs, ""),
      "important"
    ) : e[i] = s;
  }
}
const qi = ["Webkit", "Moz", "ms"], Js = {};
function al(e, t) {
  const s = Js[t];
  if (s)
    return s;
  let i = Le(t);
  if (i !== "filter" && i in e)
    return Js[t] = i;
  i = dn(i);
  for (let n = 0; n < qi.length; n++) {
    const o = qi[n] + i;
    if (o in e)
      return Js[t] = o;
  }
  return t;
}
function cl(e, t, s, i) {
  return e.tagName === "TEXTAREA" && (t === "width" || t === "height") && pe(i) && s === i;
}
const Gi = "http://www.w3.org/1999/xlink";
function Yi(e, t, s, i, n, o = Mo(t)) {
  i && t.startsWith("xlink:") ? s == null ? e.removeAttributeNS(Gi, t.slice(6, t.length)) : e.setAttributeNS(Gi, t, s) : s == null || o && !gn(s) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : Xe(s) ? String(s) : s
  );
}
function Ji(e, t, s, i, n) {
  if (t === "innerHTML" || t === "textContent") {
    s != null && (e[t] = t === "innerHTML" ? uo(s) : s);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const l = o === "OPTION" ? e.getAttribute("value") || "" : e.value, u = s == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(s);
    (l !== u || !("_value" in e)) && (e.value = u), s == null && e.removeAttribute(t), e._value = s;
    return;
  }
  let r = !1;
  if (s === "" || s == null) {
    const l = typeof e[t];
    l === "boolean" ? s = gn(s) : s == null && l === "string" ? (s = "", r = !0) : l === "number" && (s = 0, r = !0);
  }
  try {
    e[t] = s;
  } catch {
  }
  r && e.removeAttribute(n || t);
}
function gt(e, t, s, i) {
  e.addEventListener(t, s, i);
}
function pl(e, t, s, i) {
  e.removeEventListener(t, s, i);
}
const Zi = /* @__PURE__ */ Symbol("_vei");
function ul(e, t, s, i, n = null) {
  const o = e[Zi] || (e[Zi] = {}), r = o[t];
  if (i && r)
    r.value = i;
  else {
    const [l, u] = gl(t);
    if (i) {
      const m = o[t] = xl(
        i,
        n
      );
      gt(e, l, m, u);
    } else r && (pl(e, l, r, u), o[t] = void 0);
  }
}
const dl = /(Once|Passive|Capture)$/, fl = /^on:?(?:Once|Passive|Capture)$/;
function gl(e) {
  let t, s;
  for (; (s = e.match(dl)) && !fl.test(e); )
    t || (t = {}), e = e.slice(0, e.length - s[1].length), t[s[1].toLowerCase()] = !0;
  return [e[2] === ":" ? e.slice(3) : Mt(e.slice(2)), t];
}
let Zs = 0;
const hl = /* @__PURE__ */ Promise.resolve(), ml = () => Zs || (hl.then(() => Zs = 0), Zs = Date.now());
function xl(e, t) {
  const s = (i) => {
    if (!i._vts)
      i._vts = Date.now();
    else if (i._vts <= s.attached)
      return;
    const n = s.value;
    if (H(n)) {
      const o = i.stopImmediatePropagation;
      i.stopImmediatePropagation = () => {
        o.call(i), i._stopped = !0;
      };
      const r = n.slice(), l = [i];
      for (let u = 0; u < r.length && !i._stopped; u++) {
        const m = r[u];
        m && et(
          m,
          t,
          5,
          l
        );
      }
    } else
      et(
        n,
        t,
        5,
        [i]
      );
  };
  return s.value = e, s.attached = ml(), s;
}
const Xi = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, bl = (e, t, s, i, n, o) => {
  const r = n === "svg";
  t === "class" ? il(e, i, r) : t === "style" ? ll(e, s, i) : Ms(t) ? Es(t) || ul(e, t, s, i, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : vl(e, t, i, r)) ? (Ji(e, t, i), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && Yi(e, t, i, r, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && // #12408 check if it's declared prop or it's async custom element
  (yl(e, t) || // @ts-expect-error _def is private
  e._def.__asyncLoader && (/[A-Z]/.test(t) || !pe(i))) ? Ji(e, Le(t), i, o, t) : (t === "true-value" ? e._trueValue = i : t === "false-value" && (e._falseValue = i), Yi(e, t, i, r));
};
function vl(e, t, s, i) {
  if (i)
    return !!(t === "innerHTML" || t === "textContent" || t in e && Xi(t) && se(s));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "sandbox" && e.tagName === "IFRAME" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const n = e.tagName;
    if (n === "IMG" || n === "VIDEO" || n === "CANVAS" || n === "SOURCE")
      return !1;
  }
  return Xi(t) && pe(s) ? !1 : t in e;
}
function yl(e, t) {
  const s = (
    // @ts-expect-error _def is private
    e._def.props
  );
  if (!s)
    return !1;
  const i = Le(t);
  return Array.isArray(s) ? s.some((n) => Le(n) === i) : Object.keys(s).some((n) => Le(n) === i);
}
const Vt = (e) => {
  const t = e.props["onUpdate:modelValue"] || !1;
  return H(t) ? (s) => ms(t, s) : t;
};
function wl(e) {
  e.target.composing = !0;
}
function Qi(e) {
  const t = e.target;
  t.composing && (t.composing = !1, t.dispatchEvent(new Event("input")));
}
const Ze = /* @__PURE__ */ Symbol("_assign"), hs = /* @__PURE__ */ Symbol("_initialValue");
function Xs(e, t, s) {
  return t && (e = e.trim()), s && (e = Os(e)), e;
}
const dt = {
  created(e, { modifiers: { lazy: t, trim: s, number: i } }, n) {
    e.parentNode && (e.type === "text" ? e[hs] = e.defaultValue.replace(/[\r\n]/g, "") : e.type === "textarea" && (e[hs] = e.defaultValue.replace(/\r\n?/g, `
`))), e[Ze] = Vt(n);
    const o = i || n.props && n.props.type === "number";
    gt(e, t ? "change" : "input", (r) => {
      r.target.composing || e[Ze](Xs(e.value, s, o));
    }), (s || o) && gt(e, "change", () => {
      e.value = Xs(e.value, s, o);
    }), t || (gt(e, "compositionstart", wl), gt(e, "compositionend", Qi), gt(e, "change", Qi));
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(e, { value: t, modifiers: { trim: s, number: i } }) {
    const n = t ?? "", o = e[hs];
    delete e[hs], o !== void 0 && (e.type === "text" || e.type === "textarea") && e.value !== o ? e[Ze](Xs(e.value, s, i)) : e.value = n;
  },
  beforeUpdate(e, { value: t, oldValue: s, modifiers: { lazy: i, trim: n, number: o } }, r) {
    if (e[Ze] = Vt(r), e.composing) return;
    const l = (o || e.type === "number") && !/^0\d/.test(e.value) ? Os(e.value) : e.value, u = t ?? "";
    if (l === u)
      return;
    const m = e.getRootNode();
    (m instanceof Document || m instanceof ShadowRoot) && m.activeElement === e && e.type !== "range" && (i && t === s || n && e.value.trim() === u) || (e.value = u);
  }
}, en = {
  // #4096 array checkboxes need to be deep traversed
  deep: !0,
  created(e, t, s) {
    e[Ze] = Vt(s), gt(e, "change", () => {
      const i = e._modelValue, n = as(e), o = e.checked, r = e[Ze];
      if (H(i)) {
        const l = di(i, n), u = l !== -1;
        if (o && !u)
          r(i.concat(n));
        else if (!o && u) {
          const m = [...i];
          m.splice(l, 1), r(m);
        }
      } else if (at(i)) {
        const l = new Set(i);
        o ? l.add(n) : l.delete(n), r(l);
      } else
        r(fo(e, o));
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: tn,
  beforeUpdate(e, t, s) {
    e[Ze] = Vt(s), tn(e, t, s);
  }
};
function tn(e, { value: t, oldValue: s }, i) {
  e._modelValue = t;
  let n;
  if (H(t))
    n = di(t, i.props.value) > -1;
  else if (at(t))
    n = t.has(i.props.value);
  else {
    if (t === s) return;
    n = ct(t, fo(e, !0));
  }
  e.checked !== n && (e.checked = n);
}
const qt = {
  // <select multiple> value need to be deep traversed
  deep: !0,
  created(e, { value: t, modifiers: { number: s } }, i) {
    e._modelValue = t, gt(e, "change", () => {
      const n = Array.prototype.filter.call(e.options, (u) => u.selected).map(
        (u) => s ? Os(as(u)) : as(u)
      ), o = e.multiple, r = o ? at(e._modelValue) ? new Set(n) : n : n[0], l = e._pendingValue = [
        o,
        o ? H(r) ? n.slice() : n : r
      ];
      try {
        e[Ze](r);
      } finally {
        _s(() => {
          e._pendingValue === l && (e._pendingValue = void 0);
        });
      }
    }), e[Ze] = Vt(i);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(e, { value: t }) {
    sn(e, t);
  },
  beforeUpdate(e, { value: t }, s) {
    e._modelValue = t, e[Ze] = Vt(s);
  },
  updated(e, { value: t }) {
    const s = e._pendingValue;
    e._pendingValue = void 0, (!s || s[0] !== e.multiple || !_l(t, s[1], s[0])) && sn(e, t);
  }
};
function _l(e, t, s) {
  if (!s || H(e)) return ct(e, t);
  if (at(e)) {
    if (e.size !== t.length) return !1;
    for (const i of t)
      if (!e.has(i)) return !1;
    return !0;
  }
  return !1;
}
function sn(e, t) {
  const s = e.multiple, i = H(t);
  if (!(s && !i && !at(t))) {
    for (let n = 0, o = e.options.length; n < o; n++) {
      const r = e.options[n], l = as(r);
      if (s)
        if (i) {
          const u = typeof l;
          u === "string" || u === "number" ? r.selected = t.some((m) => String(m) === String(l)) : r.selected = di(t, l) > -1;
        } else
          r.selected = t.has(l);
      else if (ct(as(r), t)) {
        e.selectedIndex !== n && (e.selectedIndex = n);
        return;
      }
    }
    !s && e.selectedIndex !== -1 && (e.selectedIndex = -1);
  }
}
function as(e) {
  return "_value" in e ? e._value : e.value;
}
function fo(e, t) {
  const s = t ? "_trueValue" : "_falseValue";
  return s in e ? e[s] : t;
}
const kl = ["ctrl", "shift", "alt", "meta"], zl = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => kl.some((s) => e[`${s}Key`] && !t.includes(s))
}, Gt = (e, t) => {
  if (!e) return e;
  const s = e._withMods || (e._withMods = {}), i = t.join(".");
  return s[i] || (s[i] = ((n, ...o) => {
    for (let r = 0; r < t.length; r++) {
      const l = zl[t[r]];
      if (l && l(n, t)) return;
    }
    return e(n, ...o);
  }));
}, Cl = /* @__PURE__ */ tt({ patchProp: bl }, tl);
let nn;
function Sl() {
  return nn || (nn = Nr(Cl));
}
const Tl = ((...e) => {
  const t = Sl().createApp(...e), { mount: s } = t;
  return t.mount = (i) => {
    const n = El(i);
    if (!n) return;
    const o = t._component;
    !se(o) && !o.render && !o.template && (o.template = n.innerHTML), n.nodeType === 1 && (n.textContent = "");
    const r = s(n, !1, Ml(n));
    return n instanceof Element && (n.removeAttribute("v-cloak"), n.setAttribute("data-v-app", "")), r;
  }, t;
});
function Ml(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function El(e) {
  return pe(e) ? document.querySelector(e) : e;
}
const Al = ["width", "height"], Ol = ["d"], Y = {
  __name: "Icon",
  props: { name: String, size: { default: 20 } },
  setup(e) {
    const t = { compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM16 8l-2.5 5.5L8 16l2.5-5.5L16 8Z", bookmark: "M6 3h12v18l-6-4-6 4V3Z", sliders: "M4 7h16M4 17h16M8 4v6M16 14v6", activity: "M3 12h4l3-8 4 16 3-8h4", search: "M21 21l-5-5M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z", refresh: "M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M18 18a8 8 0 0 1-13-2", plus: "M12 5v14M5 12h14", arrow: "M5 12h14m-5-5 5 5-5 5", check: "m5 12 4 4L19 6", close: "m6 6 12 12M6 18 18 6", server: "M4 3h16v7H4zM4 14h16v7H4zM7 6h.01M7 17h.01", shield: "m12 3 8 4v6c0 5-8 9-8 9s-8-4-8-9V7l8-4Zm-4 9 3 3 5-6", clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2", star: "m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9L6.4 20l1.1-6.1L3 9.5l6.2-.9L12 3Z", play: "m8 4 13 8-13 8V4Z", external: "M14 3h7v7m0-7L10 14M10 3H4v17h17v-6", pause: "M8 4v16M16 4v16", film: "M3 4h18v16H3zM7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4", spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" };
    return (s, i) => (A(), I("svg", {
      width: e.size,
      height: e.size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.6",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true"
    }, [
      c("path", {
        d: t[e.name] || t.compass
      }, null, 8, Ol)
    ], 8, Al));
  }
}, go = { "douban-tv": "豆瓣剧集", "douban-movie": "豆瓣电影", bangumi: "Bangumi 新番" }, ho = { proxyId: null, proxyName: "", auto: !1, intervalMinutes: 60, feeds: { "douban-tv": !0, "douban-movie": !0, "douban-soon": !0, bangumi: !0 }, minScore: 7, minVotes: 0, yearFrom: (/* @__PURE__ */ new Date()).getFullYear(), include: "", exclude: "", pageCount: 2 }, mo = () => ({ version: 1, records: {}, blocks: {}, catalog: {}, review: {}, logs: [], lastSync: 0, lastAuto: 0 }), bs = () => structuredClone(ho), Il = (e) => `${e.media_type}:${Number(e.tmdb_id)}:${e.media_type === "movie" ? 0 : Number(e.season)}`, vs = (e) => `${e.source}:${e.id}`, Rl = (e) => !["blocked", "complete"].includes(e.status), $l = (e) => Object.values(e.records).filter(Rl).length, Te = (e) => new Error(e);
function on(e) {
  var t, s, i;
  return String(((t = e == null ? void 0 : e.data) == null ? void 0 : t.error) || ((i = (s = e == null ? void 0 : e.response) == null ? void 0 : s.data) == null ? void 0 : i.error) || (e == null ? void 0 : e.message) || e || "操作失败").replace(/https?:\/\/[^\s]+/gi, "[远端地址]").slice(0, 260);
}
const Nl = (e) => {
  var t;
  return Number((e == null ? void 0 : e.status) || ((t = e == null ? void 0 : e.response) == null ? void 0 : t.status));
};
function xo(e) {
  try {
    const t = new URL(e);
    return !["http:", "https:"].includes(t.protocol) || t.username || t.password || !(t.hostname === "lain.bgm.tv" || t.hostname === "image.tmdb.org" || /^(?:img\d*|img)\.doubanio\.com$/.test(t.hostname)) ? "" : (t.protocol = "https:", t.href);
  } catch {
    return "";
  }
}
function rn(e) {
  const t = { ...bs(), ...e, feeds: { ...ho.feeds, ...e.feeds } };
  if (t.proxyId !== null && (!Number.isSafeInteger(t.proxyId) || t.proxyId <= 0)) throw Te("请选择具有独立 ID 的固定 Emby 实例");
  if (t.auto && !t.proxyId) throw Te("启用自动追新前，请先选择固定 Emby 实例");
  for (const [s, i, n] of [["minScore", 0, 10], ["minVotes", 0, 1e6], ["yearFrom", 1900, 2100], ["intervalMinutes", 15, 1440], ["pageCount", 1, 5]]) if (!Number.isFinite(Number(t[s])) || Number(t[s]) < i || Number(t[s]) > n) throw Te("筛选设置超出范围");
  for (const s of ["minVotes", "yearFrom", "intervalMinutes", "pageCount"]) t[s] = Math.trunc(Number(t[s]));
  return t.minScore = Number(t.minScore), t.auto = !!t.auto, t.include = String(t.include || "").slice(0, 200), t.exclude = String(t.exclude || "").slice(0, 200), t.proxyName = String(t.proxyName || "").slice(0, 160), t.feeds = Object.fromEntries(Object.keys(go).map((s) => [s, !!t.feeds[s]])), t;
}
function Fl(e, t, s) {
  return !!(e.blocks[vs(t)] || s && e.blocks[s]);
}
const Pl = ["src", "alt"], Qs = {
  __name: "Cover",
  props: { src: String, alt: { default: "" } },
  setup(e) {
    const t = e, s = Ln("loadCover"), i = /* @__PURE__ */ Q(null), n = /* @__PURE__ */ Q("");
    let o, r = !1, l = 0, u = !1, m = !1;
    async function h() {
      const M = ++l;
      n.value = "", m = !1;
      const z = xo(t.src);
      if (!(!z || !u))
        if (z.includes("doubanio.com")) {
          m = !0;
          const D = await s(z);
          !r && M === l && (n.value = D);
        } else n.value = z;
    }
    async function y() {
      if (n.value = "", m) return;
      m = !0;
      const M = l, z = await s(t.src);
      !r && M === l && (n.value = z);
    }
    return dr(() => t.src, h), Bn(() => {
      o = new IntersectionObserver((M) => {
        M.some((z) => z.isIntersecting) && (u = !0, o.disconnect(), h());
      }, { rootMargin: "240px" }), o.observe(i.value);
    }), Kn(() => {
      r = !0, o == null || o.disconnect();
    }), (M, z) => (A(), I("span", {
      class: "cover-image",
      ref_key: "root",
      ref: i
    }, [
      n.value ? (A(), I("img", {
        key: 0,
        src: n.value,
        alt: e.alt,
        referrerpolicy: "no-referrer",
        onError: y
      }, null, 40, Pl)) : X("", !0)
    ], 512));
  }
};
function jl(e) {
  const t = /* @__PURE__ */ new Map(), s = [];
  let i = 0;
  async function n() {
    var l, u, m;
    if (i >= 2 || !s.length) return;
    const { url: o, resolve: r } = s.shift();
    i++;
    try {
      if ((l = e.signal) != null && l.aborted) throw Error("closed");
      const h = await e.http.request({ url: o, headers: { Referer: o.includes("doubanio.com") ? "https://movie.douban.com/" : "https://bgm.tv/", "User-Agent": "Mozilla/5.0" }, response_type: "base64", timeout_seconds: 15, max_bytes: 1024 * 1024, cache_seconds: 86400, session: "public-covers" }), y = (u = Object.entries(h.headers || {}).find(([z]) => z.toLowerCase() === "content-type")) == null ? void 0 : u[1], M = String(Array.isArray(y) ? y[0] : y || "").split(";")[0];
      if (h.status !== 200 || !/^image\/(jpeg|png|webp|gif)$/.test(M) || !h.body_base64 || (m = e.signal) != null && m.aborted) throw Error("invalid image");
      r(`data:${M};base64,${h.body_base64}`);
    } catch {
      r("");
    } finally {
      i--, await n();
    }
  }
  return (o) => {
    var l;
    if (o = xo(o), !o || (l = e.signal) != null && l.aborted) return Promise.resolve("");
    if (t.has(o)) return t.get(o);
    const r = new Promise((u) => {
      s.push({ url: o, resolve: u });
    });
    return t.set(o, r), t.size > 60 && t.delete(t.keys().next().value), n(), r;
  };
}
const bo = (e, t) => `/api/extensions/v3/${encodeURIComponent(e.id || e.plugin.id)}/storage/${encodeURIComponent(t)}`;
async function Ci(e, t, s = null) {
  const i = await e.api.get(bo(e, t));
  if (!i || typeof i.revision != "number") throw Te("插件存储响应无效");
  return { value: i.value ?? structuredClone(s), revision: i.revision };
}
async function Vl(e, t, s, i = null) {
  for (let n = 0; n < 8; n++) {
    const o = await Ci(e, t, i), r = s(o.value);
    try {
      return await e.api.put(bo(e, t), { value: o.value, expected_revision: o.revision }), r;
    } catch (l) {
      if (Nl(l) !== 409) throw l;
    }
  }
  throw Te("保存遇到并发冲突，请刷新后重试");
}
const Ll = (e) => Ci(e, "state", mo());
function Dl(e) {
  const t = /* @__PURE__ */ Q(mo()), s = /* @__PURE__ */ Q(bs()), i = /* @__PURE__ */ Q(""), n = /* @__PURE__ */ Q("discover"), o = /* @__PURE__ */ Q("all"), r = /* @__PURE__ */ Q(0), l = /* @__PURE__ */ Q(""), u = /* @__PURE__ */ Q("douban"), m = /* @__PURE__ */ Q(null), h = /* @__PURE__ */ Q("default"), y = /* @__PURE__ */ Q(null), M = /* @__PURE__ */ Q(""), z = /* @__PURE__ */ Q(""), D = /* @__PURE__ */ Q(""), V = /* @__PURE__ */ Q([]), ne = /* @__PURE__ */ Q([]), W = /* @__PURE__ */ Q(null), U = /* @__PURE__ */ Q(null), j = /* @__PURE__ */ Q([]), N = /* @__PURE__ */ Q(null), G = /* @__PURE__ */ Q([]), Ae = /* @__PURE__ */ Q(1), de = /* @__PURE__ */ Q(""), he = /* @__PURE__ */ Q(!1), Ue = /* @__PURE__ */ Q(""), ze = /* @__PURE__ */ Q(null), ye = /* @__PURE__ */ Q("active");
  let we = !1, Oe, bt;
  const Lt = We(() => $l(t.value)), vt = We(() => JSON.stringify(s.value) !== i.value), Pe = We(() => Object.values(t.value.records).sort((v, $) => $.createdAt - v.createdAt)), st = We(() => Pe.value.filter((v) => v.status === "blocked")), Et = We(() => Object.values(t.value.review).map((v) => v.work)), At = We(() => ye.value === "review" ? Et.value : Pe.value.filter((v) => ye.value === "all" || (ye.value === "blocked" ? v.status === "blocked" : ye.value === "complete" ? v.status === "complete" : !["complete", "blocked"].includes(v.status)))), je = We(() => [...new Map(Object.entries(t.value.catalog).filter(([v]) => o.value === "all" || o.value === v).flatMap(([, v]) => v.items).map((v) => [vs(v), v])).values()]), Ce = We(() => {
    let v = (m.value || je.value).filter(($) => (!r.value || $.weekday === r.value) && (!l.value || m.value || [$.title, $.originalTitle].join(" ").toLowerCase().includes(l.value.toLowerCase())));
    return h.value === "score" && (v = [...v].sort(($, J) => J.score - $.score)), h.value === "date" && (v = [...v].sort(($, J) => String(J.airDate || J.year || "").localeCompare(String($.airDate || $.year || "")))), v;
  }), Ot = We(() => Math.max(0, ...Object.values(t.value.catalog).map((v) => v.at || 0))), It = We(() => Object.entries(t.value.catalog).filter(([v, $]) => $.error && (o.value === "all" || o.value === v)).map(([v, $]) => `${go[v]}：${$.error}`)), Dt = () => {
    var v, $;
    return (($ = (v = globalThis.crypto) == null ? void 0 : v.randomUUID) == null ? void 0 : $.call(v)) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }, Ie = (v) => v ? new Date(v).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "尚未同步", Re = { prepared: "待提交", submitting: "正在提交", unknown: "结果待核对", active: "追更中", complete: "已入库", blocked: "已停订", attention: "需人工核对", deleting: "正在停订", delete_unknown: "删除待核对" }, yt = { pending: "等待资源", searching: "搜索资源", transferring: "转存中", partial: "部分入库", caught_up: "已追平", landed: "已入库", failed: "等待处理", expired: "已结束" };
  function me(v) {
    D.value = v, clearTimeout(Oe), Oe = setTimeout(() => D.value = "", 4200);
  }
  async function Rt() {
    const v = await Ll(e);
    we || (t.value = v.value);
  }
  async function a() {
    const v = await e.api.get("/api/plugin-host/emby/instances");
    if (!Array.isArray(v.items)) throw Te("Emby 实例列表无效");
    V.value = v.items;
  }
  async function f() {
    ne.value = await e.tasks.list(20);
  }
  async function x(v) {
    return new Promise(($, J) => {
      var Si, Ti;
      const ae = () => {
        var Bt;
        clearTimeout(Ut), (Bt = e.signal) == null || Bt.removeEventListener("abort", ae), J(Te("页面已关闭"));
      }, Ut = setTimeout(() => {
        var Bt;
        (Bt = e.signal) == null || Bt.removeEventListener("abort", ae), $();
      }, v);
      (Si = e.signal) == null || Si.addEventListener("abort", ae, { once: !0 }), (Ti = e.signal) != null && Ti.aborted && ae();
    });
  }
  async function k(v, $, J) {
    let ae = await e.tasks.run(v, J || `${v}:${$.action || "refresh"}:${Dt()}`, $);
    for (; !["succeeded", "failed", "cancelled", "attention_required"].includes(ae.status); ) {
      if (we) throw Te("页面已关闭");
      await x(650), ae = await e.tasks.get(ae.id);
    }
    if (ae.status !== "succeeded") throw Te(ae.status === "attention_required" ? "任务需要核对，请在运行记录中恢复核对" : ae.error || ae.message || "任务未完成");
    return ae.result;
  }
  async function b(v, $) {
    if (!M.value) {
      M.value = v, z.value = "";
      try {
        return await $();
      } catch (J) {
        we || (z.value = on(J));
      } finally {
        if (!we) {
          M.value = "";
          try {
            await Rt();
          } catch (J) {
            z.value || (z.value = on(J));
          }
        }
      }
    }
  }
  const _ = () => b("刷新公开目录", async () => {
    m.value = null, await k("browse", { action: "refresh", ...o.value === "all" ? {} : { feed: o.value } }), me("目录已刷新");
  }), T = () => b("核对宿主订阅", async () => {
    await k("engine", { action: "sync" }), me("已核对宿主订阅，停订标记已保存");
  }), C = () => b("搜索作品", async () => {
    if (!l.value.trim()) {
      m.value = null;
      return;
    }
    m.value = (await k("browse", { action: "search", source: u.value, query: l.value.trim() })).items;
  }), S = () => b("保存规则", async () => {
    const v = rn(s.value), $ = V.value.find((J) => J.id === v.proxyId && J.api_key_configured);
    if (v.proxyId && !$) throw Te("所选 Emby 实例不可用，请刷新实例列表");
    v.proxyName = ($ == null ? void 0 : $.name) || "", await Vl(e, "config", (J) => Object.assign(J, v), bs()), s.value = v, i.value = JSON.stringify(v), me("规则已保存；已有订阅继续使用原来的固定实例");
  });
  function w(v) {
    o.value = v, m.value = null, l.value = "", r.value = 0;
  }
  function R(v) {
    n.value = v, _s(() => {
      var $;
      return ($ = y.value) == null ? void 0 : $.scrollIntoView({ block: "start", behavior: "auto" });
    }), v === "activity" && b("读取运行记录", f), v === "rules" && b("读取 Emby 实例", a);
  }
  async function E() {
    await _s(), W.value.open || W.value.showModal();
  }
  const F = (v, $ = !1) => b("匹配媒体资料", async () => {
    U.value = v, j.value = [], N.value = null, G.value = [], he.value = $, Ue.value = "", de.value = v.title, ze.value = null, await E();
    const J = await k("browse", { action: "match", work: v });
    U.value = J.work, Ue.value = J.notice || "", j.value = J.candidates;
  }), p = () => b("重新匹配", async () => {
    const v = await k("browse", { action: "match", work: U.value, query: de.value });
    j.value = v.candidates, N.value = null, G.value = [], Ue.value = v.notice || "";
  }), K = (v) => b("读取季信息", async () => {
    var J;
    N.value = null, G.value = [];
    const $ = await k("browse", { action: "tmdb", mediaType: v.media_type, tmdbId: v.id });
    N.value = v, G.value = $.seasons || [], Ae.value = ((J = G.value.find((ae) => ae.season_number > 0)) == null ? void 0 : J.season_number) ?? 0;
  });
  function d() {
    var v;
    M.value || ((v = W.value) == null || v.close(), U.value = null, ze.value = null, N.value = null);
  }
  const P = () => b(he.value ? "手动恢复订阅" : "创建订阅", async () => {
    if (vt.value) throw Te("规则有未保存的修改，请先保存");
    if (!s.value.proxyId) throw Te("请先到「追新规则」选择固定 Emby 实例");
    const v = N.value;
    if (!v) throw Te("请选择 TMDB 作品");
    const $ = { tmdbId: v.id, mediaType: v.media_type, season: v.media_type === "movie" ? 0 : Number(Ae.value) }, J = t.value.records[Il({ tmdb_id: v.id, media_type: v.media_type, season: $.season })], ae = `create:${vs(U.value)}:${v.media_type}:${v.id}:${$.season}:${s.value.proxyId}:g${((J == null ? void 0 : J.generation) || 0) + 1}`, Ut = await k("engine", { action: "create", work: U.value, choice: $, restore: he.value, confirmed: !0 }, ae);
    me(Ut.skipped || (Ut.complete ? "已在固定媒体库中" : Ut.existing ? "已关联现有订阅" : "订阅已创建")), W.value.close(), U.value = null;
  });
  async function q(v, $ = !1) {
    ze.value = { ...v, confirmAbsent: $ }, U.value = null, await E();
  }
  const le = () => b("停止订阅", async () => {
    const v = ze.value;
    await k("engine", v.confirmAbsent ? { action: "confirm-absent", key: v.key, confirmedAbsent: !0 } : { action: "stop", key: v.key }, `${v.confirmAbsent ? "confirm-absent" : "stop"}:${v.key}:g${v.generation}`), me("已停订，不会自动重新添加"), W.value.close(), ze.value = null;
  }), xe = (v) => b("恢复核对", async () => {
    await e.tasks.retry(v.id), await f(), me("已请求宿主恢复核对");
  });
  function fe(v) {
    return Pe.value.find(($) => $.sourceKeys.includes(vs(v)));
  }
  function Be(v) {
    const $ = fe(v);
    return $ ? Re[$.status] : Fl(t.value, v) ? "已停订" : "";
  }
  const Ht = (v) => {
    v.target.hidden = !0;
  };
  return Bn(() => b("加载追光", async () => {
    s.value = rn((await Ci(e, "config", bs())).value), i.value = JSON.stringify(s.value), await Rt(), await a(), await f(), Object.keys(t.value.catalog).length || await k("browse", { action: "refresh" }), bt = setInterval(() => {
      !M.value && !we && Rt().catch(() => {
      });
    }, 15e3);
  })), Kn(() => {
    var v;
    we = !0, clearTimeout(Oe), clearInterval(bt), (v = W.value) == null || v.close();
  }), { ctx: e, pageRoot: y, db: t, c: s, tab: n, feed: o, weekday: r, query: l, searchSource: u, remote: m, sort: h, busy: M, error: z, toast: D, emby: V, runs: ne, dialog: W, detail: U, matches: j, selection: N, seasons: G, season: Ae, matchQuery: de, restore: he, notice: Ue, confirmStop: ze, libraryFilter: ye, count: Lt, dirty: vt, records: Pe, blocked: st, reviews: Et, library: At, items: Ce, lastFetch: Ot, sourceErrors: It, date: Ie, statusNames: Re, hostNames: yt, act: b, options: a, load: _, sync: T, find: C, save: S, switchFeed: w, navigate: R, openWork: F, rematch: p, choose: K, close: d, create: P, askStop: q, stop: le, retry: xe, itemRecord: fe, badge: Be, brokenImage: Ht };
}
const Hl = { class: "zg-shell" }, Ul = { class: "zg-rail glass" }, Bl = { "aria-label": "主导航" }, Kl = ["aria-current", "onClick"], Wl = { class: "zg-header" }, ql = {
  key: 0,
  class: "preview-note"
}, Gl = {
  key: 1,
  class: "alert error",
  role: "alert"
}, Yl = {
  key: 2,
  class: "working",
  role: "status"
}, Jl = { class: "hero" }, Zl = {
  class: "hero-art",
  "aria-hidden": "true"
}, Xl = { class: "art-glass" }, Ql = { class: "art-chip glass" }, ea = { class: "hero-summary glass" }, ta = { class: "summary-top" }, sa = { class: "live-label" }, ia = { class: "summary-count" }, na = { class: "capacity" }, oa = { class: "summary-bottom" }, ra = { class: "discovery" }, la = { class: "section-heading" }, aa = ["disabled"], ca = { class: "discovery-toolbar" }, pa = {
  class: "source-tabs glass",
  "aria-label": "片单来源"
}, ua = ["aria-pressed", "onClick"], da = ["disabled"], fa = { class: "list-meta" }, ga = {
  key: 0,
  class: "days"
}, ha = ["aria-pressed", "onClick"], ma = { key: 1 }, xa = { class: "sort-control" }, ba = {
  class: "alert warning",
  role: "status"
}, va = {
  key: 0,
  class: "poster-grid"
}, ya = ["onClick", "disabled", "aria-label"], wa = { class: "poster-placeholder" }, _a = { class: "poster-top" }, ka = {
  key: 0,
  class: "rating"
}, za = {
  key: 1,
  class: "poster-state"
}, Ca = { class: "poster-action" }, Sa = { class: "card-caption" }, Ta = {
  key: 1,
  class: "empty"
}, Ma = ["disabled"], Ea = { class: "stats-row" }, Aa = { class: "glass stat" }, Oa = { class: "glass stat" }, Ia = { class: "glass stat" }, Ra = { class: "section-heading" }, $a = { class: "source-tabs glass" }, Na = ["aria-pressed", "onClick"], Fa = ["disabled"], Pa = {
  key: 0,
  class: "subscription-list"
}, ja = { class: "mini-poster" }, Va = { class: "sub-info" }, La = { key: 0 }, Da = { class: "sub-source" }, Ha = { key: 1 }, Ua = {
  key: 2,
  class: "coverage"
}, Ba = { key: 0 }, Ka = {
  key: 3,
  class: "text-error"
}, Wa = { class: "sub-actions" }, qa = ["disabled", "onClick"], Ga = ["disabled", "onClick"], Ya = ["disabled"], Ja = ["disabled", "onClick"], Za = ["disabled", "onClick"], Xa = {
  key: 1,
  class: "empty"
}, Qa = { class: "settings-main" }, ec = { class: "settings-card glass" }, tc = { class: "settings-title" }, sc = ["disabled"], ic = { class: "field" }, nc = ["value", "disabled"], oc = { class: "inline-note" }, rc = { class: "settings-card glass" }, lc = { class: "settings-title" }, ac = { class: "switch" }, cc = { class: "feed-choices" }, pc = ["onUpdate:modelValue"], uc = { class: "form-grid" }, dc = { class: "field" }, fc = { class: "field" }, gc = { class: "field" }, hc = { class: "field" }, mc = { class: "field" }, xc = { class: "field" }, bc = { class: "field" }, vc = { class: "save-row" }, yc = ["disabled"], wc = { class: "settings-aside" }, _c = { class: "guard-card glass" }, kc = { class: "aside-note" }, zc = { class: "page-title" }, Cc = { class: "activity-layout" }, Sc = { class: "settings-card glass" }, Tc = {
  key: 0,
  class: "empty small"
}, Mc = { class: "settings-card glass" }, Ec = {
  key: 0,
  class: "empty small"
}, Ac = { class: "task-row" }, Oc = { key: 0 }, Ic = ["disabled", "onClick"], Rc = {
  key: 0,
  class: "toast glass",
  role: "status"
}, $c = ["disabled"], Nc = {
  key: 0,
  class: "dialog-body stop-dialog"
}, Fc = { id: "dialog-title" }, Pc = { class: "dialog-actions" }, jc = ["disabled"], Vc = ["disabled"], Lc = { class: "detail-top" }, Dc = { class: "detail-poster" }, Hc = { class: "eyebrow" }, Uc = { id: "dialog-title" }, Bc = {
  key: 0,
  class: "original-title"
}, Kc = { class: "detail-rating" }, Wc = ["href"], qc = { class: "dialog-body" }, Gc = {
  key: 0,
  class: "synopsis"
}, Yc = {
  key: 1,
  class: "alert warning"
}, Jc = {
  key: 2,
  class: "alert error",
  role: "alert"
}, Zc = {
  key: 3,
  class: "dialog-working",
  role: "status"
}, Xc = ["disabled"], Qc = { class: "match-list" }, ep = ["aria-pressed", "disabled", "onClick"], tp = {
  key: 0,
  class: "empty small"
}, sp = {
  key: 4,
  class: "field"
}, ip = ["value"], np = { class: "target-note" }, op = {
  key: 5,
  class: "alert warning"
}, rp = { class: "dialog-actions" }, lp = ["disabled"], ap = ["disabled"], cp = {
  __name: "App",
  props: { ctx: Object },
  setup(e) {
    const t = e;
    cr("loadCover", jl(t.ctx));
    const { ctx: s, pageRoot: i, db: n, c: o, tab: r, feed: l, weekday: u, query: m, searchSource: h, remote: y, sort: M, busy: z, error: D, toast: V, emby: ne, runs: W, dialog: U, detail: j, matches: N, selection: G, seasons: Ae, season: de, matchQuery: he, restore: Ue, notice: ze, confirmStop: ye, libraryFilter: we, count: Oe, dirty: bt, blocked: Lt, reviews: vt, library: Pe, items: st, lastFetch: Et, sourceErrors: At, date: je, statusNames: Ce, hostNames: Ot, act: It, options: Dt, load: Ie, sync: Re, find: yt, save: me, switchFeed: Rt, navigate: a, openWork: f, rematch: x, choose: k, close: b, create: _, askStop: T, stop: C, retry: S, badge: w } = Dl(t.ctx), R = [["discover", "发现", "compass"], ["library", "我的订阅", "bookmark"], ["rules", "追新规则", "sliders"], ["activity", "运行记录", "activity"]], E = ["全部", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    return (F, p) => {
      var K;
      return A(), I("div", Hl, [
        c("aside", Ul, [
          c("a", {
            class: "zg-mark",
            href: "#",
            onClick: p[0] || (p[0] = Gt((d) => g(a)("discover"), ["prevent"])),
            "aria-label": "追光首页"
          }, [
            B(Y, {
              name: "play",
              size: 23
            })
          ]),
          c("nav", Bl, [
            (A(), I(ee, null, Se(R, ([d, P, q]) => c("button", {
              key: d,
              class: ke({ active: g(r) === d }),
              "aria-current": g(r) === d ? "page" : void 0,
              onClick: (le) => g(a)(d)
            }, [
              B(Y, {
                name: q,
                size: 22
              }, null, 8, ["name"]),
              c("span", null, O(P), 1)
            ], 10, Kl)), 64))
          ]),
          p[34] || (p[34] = c("div", { class: "rail-bottom" }, [
            c("span", { class: "status-dot" }),
            c("span", null, "DIAN115"),
            c("small", null, "PLUGIN / 01")
          ], -1))
        ]),
        c("main", {
          class: "zg-main",
          ref_key: "pageRoot",
          ref: i
        }, [
          c("header", Wl, [
            p[35] || (p[35] = c("div", { class: "brand" }, [
              c("strong", null, [
                L("追光"),
                c("span", null, "WATCHLIGHT")
              ]),
              c("span", { class: "brand-divider" }),
              c("span", { class: "header-caption" }, "每一份期待，都值得被追踪。")
            ], -1)),
            c("button", {
              class: "instance-pill glass",
              onClick: p[1] || (p[1] = (d) => g(a)("rules"))
            }, [
              B(Y, {
                name: "server",
                size: 16
              }),
              c("span", null, O(g(o).proxyName || "选择 Emby 实例"), 1),
              c("span", {
                class: ke(["status-dot", { offline: !g(o).proxyId }])
              }, null, 2)
            ])
          ]),
          g(s).preview ? (A(), I("div", ql, "交互预览 · 示例媒体与模拟宿主，操作不会创建真实订阅")) : X("", !0),
          g(D) ? (A(), I("div", Gl, [
            c("span", null, O(g(D)), 1),
            c("button", {
              class: "icon-button",
              "aria-label": "关闭错误提示",
              onClick: p[2] || (p[2] = (d) => D.value = "")
            }, [
              B(Y, {
                name: "close",
                size: 16
              })
            ])
          ])) : X("", !0),
          g(z) ? (A(), I("div", Yl, [
            p[36] || (p[36] = c("span", { class: "spinner" }, null, -1)),
            L(O(g(z)) + "…", 1)
          ])) : X("", !0),
          g(r) === "discover" ? (A(), I(ee, { key: 3 }, [
            c("section", Jl, [
              p[45] || (p[45] = c("div", { class: "hero-copy" }, [
                c("div", { class: "eyebrow" }, [
                  c("span"),
                  L("YOUR NEXT OBSESSION")
                ]),
                c("h1", null, [
                  L("把期待，"),
                  c("br"),
                  L("留给"),
                  c("span", null, "下一集。")
                ]),
                c("p", null, [
                  L("豆瓣的好故事，Bangumi 的新世界。"),
                  c("br"),
                  L("在这里相遇，在你的媒体库里继续。")
                ]),
                c("div", { class: "hero-foot" }, [
                  c("span", { class: "tiny-line" }),
                  L("发现 · 订阅 · 静候更新")
                ])
              ], -1)),
              c("div", Zl, [
                p[40] || (p[40] = c("div", { class: "art-orbit orbit-a" }, null, -1)),
                p[41] || (p[41] = c("div", { class: "art-orbit orbit-b" }, null, -1)),
                p[42] || (p[42] = c("div", { class: "art-orbit orbit-c" }, null, -1)),
                c("div", Xl, [
                  p[37] || (p[37] = c("span", null, [
                    L("THE NEXT"),
                    c("br"),
                    L("GOOD STORY.")
                  ], -1)),
                  B(Y, {
                    name: "play",
                    size: 55
                  }),
                  p[38] || (p[38] = c("small", null, "DOUBAN × BANGUMI", -1))
                ]),
                c("div", Ql, [
                  B(Y, {
                    name: "spark",
                    size: 16
                  }),
                  p[39] || (p[39] = L("好故事，正在发生", -1))
                ])
              ]),
              c("div", ea, [
                c("div", ta, [
                  B(Y, {
                    name: "bookmark",
                    size: 18
                  }),
                  p[43] || (p[43] = c("span", null, "你的追光清单", -1)),
                  c("span", sa, O(g(o).auto ? "自动追新" : "手动模式"), 1)
                ]),
                c("div", ia, [
                  L(O(g(Oe)), 1),
                  p[44] || (p[44] = c("span", null, "/ 120", -1))
                ]),
                c("div", na, [
                  c("span", {
                    style: Rs({ width: Math.min(g(Oe) / 120 * 100, 100) + "%" })
                  }, null, 4)
                ]),
                c("div", oa, [
                  c("span", null, "还可添加 " + O(Math.max(0, 120 - g(Oe))) + " 条", 1),
                  c("button", {
                    onClick: p[3] || (p[3] = (d) => g(a)("library")),
                    "aria-label": "查看我的订阅"
                  }, [
                    B(Y, {
                      name: "arrow",
                      size: 18
                    })
                  ])
                ])
              ])
            ]),
            c("section", ra, [
              c("div", la, [
                p[47] || (p[47] = c("div", null, [
                  c("div", { class: "eyebrow muted" }, "CURATED FOR YOUR SCREEN"),
                  c("h2", null, "发现值得期待的")
                ], -1)),
                c("button", {
                  class: "button quiet",
                  disabled: !!g(z),
                  onClick: p[4] || (p[4] = (...d) => g(Ie) && g(Ie)(...d))
                }, [
                  B(Y, {
                    name: "refresh",
                    size: 16
                  }),
                  p[46] || (p[46] = L("刷新片单", -1))
                ], 8, aa)
              ]),
              c("div", ca, [
                c("div", pa, [
                  (A(), I(ee, null, Se([["all", "为你发现"], ["douban-tv", "豆瓣剧集"], ["douban-movie", "豆瓣电影"], ["douban-soon", "豆瓣即将上映"], ["bangumi", "Bangumi 新番"]], ([d, P]) => c("button", {
                    key: d,
                    "aria-pressed": g(l) === d,
                    class: ke({ selected: g(l) === d }),
                    onClick: (q) => g(Rt)(d)
                  }, [
                    d !== "all" ? (A(), I("span", {
                      key: 0,
                      class: ke(["source-dot", d === "bangumi" ? "pink" : "green"])
                    }, null, 2)) : X("", !0),
                    L(O(P), 1)
                  ], 10, ua)), 64))
                ]),
                c("form", {
                  class: "search-box",
                  onSubmit: p[7] || (p[7] = Gt((...d) => g(yt) && g(yt)(...d), ["prevent"]))
                }, [
                  B(Y, {
                    name: "search",
                    size: 17
                  }),
                  be(c("input", {
                    "onUpdate:modelValue": p[5] || (p[5] = (d) => /* @__PURE__ */ ce(m) ? m.value = d : null),
                    "aria-label": "搜索片名",
                    placeholder: "寻找你的下一部…"
                  }, null, 512), [
                    [dt, g(m)]
                  ]),
                  be(c("select", {
                    "onUpdate:modelValue": p[6] || (p[6] = (d) => /* @__PURE__ */ ce(h) ? h.value = d : null),
                    "aria-label": "搜索来源"
                  }, [...p[48] || (p[48] = [
                    c("option", { value: "douban" }, "豆瓣", -1),
                    c("option", { value: "bangumi" }, "Bangumi", -1)
                  ])], 512), [
                    [qt, g(h)]
                  ]),
                  c("button", {
                    type: "submit",
                    "aria-label": "搜索来源",
                    disabled: !!g(z)
                  }, [
                    B(Y, {
                      name: "arrow",
                      size: 17
                    })
                  ], 8, da)
                ], 32)
              ]),
              c("div", fa, [
                g(l) === "bangumi" ? (A(), I("div", ga, [
                  (A(), I(ee, null, Se(E, (d, P) => c("button", {
                    class: ke({ selected: g(u) === P }),
                    "aria-pressed": g(u) === P,
                    onClick: (q) => u.value = P
                  }, O(d), 11, ha)), 64))
                ])) : (A(), I("span", ma, [
                  L(O(g(y) ? "搜索结果" : "最近片单"), 1),
                  c("b", null, O(g(st).length), 1),
                  p[49] || (p[49] = c("span", { class: "meta-separator" }, "/", -1)),
                  L(O(g(y) ? "来源搜索" : `更新于 ${g(je)(g(Et))}`), 1)
                ])),
                c("div", xa, [
                  g(y) ? (A(), I("button", {
                    key: 0,
                    onClick: p[8] || (p[8] = (d) => {
                      y.value = null, m.value = "";
                    })
                  }, "返回片单")) : X("", !0),
                  be(c("select", {
                    "onUpdate:modelValue": p[9] || (p[9] = (d) => /* @__PURE__ */ ce(M) ? M.value = d : null),
                    "aria-label": "片单排序"
                  }, [...p[50] || (p[50] = [
                    c("option", { value: "default" }, "推荐顺序", -1),
                    c("option", { value: "score" }, "评分优先", -1),
                    c("option", { value: "date" }, "最新播出", -1)
                  ])], 512), [
                    [qt, g(M)]
                  ])
                ])
              ]),
              (A(!0), I(ee, null, Se(g(At), (d) => (A(), I("div", ba, O(d) + "；当前保留上次片单。", 1))), 256)),
              g(st).length ? (A(), I("div", va, [
                (A(!0), I(ee, null, Se(g(st), (d, P) => (A(), I("article", {
                  key: d.source + d.id,
                  class: "media-card"
                }, [
                  c("button", {
                    class: "poster",
                    onClick: (q) => g(f)(d),
                    disabled: !!g(z),
                    "aria-label": `查看并订阅 ${d.title}`
                  }, [
                    c("span", wa, [
                      B(Y, {
                        name: "film",
                        size: 32
                      }),
                      c("span", null, O(d.title), 1)
                    ]),
                    d.cover ? (A(), Ft(Qs, {
                      key: 0,
                      src: d.cover,
                      alt: d.title + "海报"
                    }, null, 8, ["src", "alt"])) : X("", !0),
                    c("span", _a, [
                      c("span", {
                        class: ke(["source-tag", d.source])
                      }, O(d.source === "douban" ? "豆瓣" : "Bangumi"), 3),
                      d.score ? (A(), I("span", ka, [
                        B(Y, {
                          name: "star",
                          size: 12
                        }),
                        L(O(Number(d.score).toFixed(1)), 1)
                      ])) : X("", !0)
                    ]),
                    g(w)(d) ? (A(), I("span", za, [
                      B(Y, {
                        name: "check",
                        size: 12
                      }),
                      L(O(g(w)(d)), 1)
                    ])) : X("", !0),
                    c("span", Ca, [
                      B(Y, {
                        name: g(w)(d) ? "arrow" : "plus",
                        size: 19
                      }, null, 8, ["name"])
                    ])
                  ], 8, ya),
                  c("div", Sa, [
                    c("h3", null, O(d.title), 1),
                    c("p", null, [
                      L(O(d.year || "待确认年份"), 1),
                      p[51] || (p[51] = c("span", null, "·", -1)),
                      L(O(d.source === "bangumi" ? d.weekday ? E[d.weekday] + "放送" : "动画" : d.mediaType === "movie" ? "电影" : d.progress || "剧集"), 1)
                    ])
                  ])
                ]))), 128))
              ])) : (A(), I("div", Ta, [
                B(Y, {
                  name: "compass",
                  size: 40
                }),
                c("h3", null, O(g(z) ? "正在寻找好故事" : "还没有匹配的作品"), 1),
                p[52] || (p[52] = c("p", null, "调整筛选条件，或刷新公开片单。", -1)),
                c("button", {
                  class: "button",
                  disabled: !!g(z),
                  onClick: p[10] || (p[10] = (...d) => g(Ie) && g(Ie)(...d))
                }, "刷新片单", 8, Ma)
              ])),
              p[53] || (p[53] = c("div", { class: "catalog-footer" }, [
                c("span", null, "好故事不必急着看，先把期待收藏好。"),
                c("span", null, "公开目录快照 · 资源搜索由宿主完成")
              ], -1))
            ])
          ], 64)) : g(r) === "library" ? (A(), I(ee, { key: 4 }, [
            p[60] || (p[60] = c("div", { class: "page-title" }, [
              c("div", { class: "eyebrow" }, "YOUR WATCHLIST"),
              c("h1", null, "每一部，都有下文。"),
              c("p", null, "固定媒体库，持续追踪。宿主删除后，我们会记住你的选择。")
            ], -1)),
            c("div", Ea, [
              c("div", Aa, [
                p[55] || (p[55] = c("span", null, "占用订阅", -1)),
                c("strong", null, [
                  L(O(g(Oe)), 1),
                  p[54] || (p[54] = c("small", null, " / 120", -1))
                ])
              ]),
              c("div", Oa, [
                p[56] || (p[56] = c("span", null, "等待匹配", -1)),
                c("strong", null, O(g(vt).length), 1)
              ]),
              c("div", Ia, [
                p[57] || (p[57] = c("span", null, "已停订保护", -1)),
                c("strong", null, O(g(Lt).length), 1)
              ])
            ]),
            c("div", Ra, [
              c("div", $a, [
                (A(), I(ee, null, Se([["active", "追更中"], ["review", "待匹配"], ["complete", "已入库"], ["blocked", "已停订"], ["all", "全部"]], ([d, P]) => c("button", {
                  class: ke({ selected: g(we) === d }),
                  "aria-pressed": g(we) === d,
                  onClick: (q) => we.value = d
                }, O(P), 11, Na)), 64))
              ]),
              c("button", {
                class: "button",
                disabled: !!g(z),
                onClick: p[11] || (p[11] = (...d) => g(Re) && g(Re)(...d))
              }, [
                B(Y, {
                  name: "refresh",
                  size: 16
                }),
                p[58] || (p[58] = L("核对宿主", -1))
              ], 8, Fa)
            ]),
            g(Pe).length ? (A(), I("div", Pa, [
              (A(!0), I(ee, null, Se(g(Pe), (d) => (A(), I("article", {
                key: d.key || d.source + d.id,
                class: "subscription-row glass"
              }, [
                c("div", ja, [
                  (d.work || d).cover ? (A(), Ft(Qs, {
                    key: 0,
                    src: (d.work || d).cover
                  }, null, 8, ["src"])) : (A(), Ft(Y, {
                    key: 1,
                    name: "film"
                  }))
                ]),
                c("div", Va, [
                  c("h3", null, O((d.work || d).title), 1),
                  d.body ? (A(), I("p", La, [
                    L(O(d.body.media_type === "tv" ? `第 ${d.body.season} 季` : "电影") + " · " + O(d.proxyName || `Emby #${d.proxyId}`) + " ", 1),
                    c("span", Da, O(d.work.source === "douban" ? "豆瓣" : "Bangumi"), 1)
                  ])) : (A(), I("p", Ha, "季数或媒体匹配需要你确认")),
                  d.covered ? (A(), I("p", Ua, [
                    L("已拥有 " + O(d.covered) + " 集 ", 1),
                    d.needed ? (A(), I("span", Ba, "· 仍需 " + O(d.needed), 1)) : X("", !0)
                  ])) : X("", !0),
                  d.error ? (A(), I("p", Ka, O(d.error), 1)) : X("", !0)
                ]),
                c("span", {
                  class: ke(["state-pill", d.status])
                }, O(d.status === "active" ? g(Ot)[d.hostState] || "追更中" : g(Ce)[d.status] || "等待匹配"), 3),
                c("div", Wa, [
                  d.body ? d.status === "blocked" ? (A(), I("button", {
                    key: 1,
                    class: "button",
                    disabled: !!g(z),
                    onClick: (P) => g(f)(d.work, !0)
                  }, "手动恢复", 8, Ga)) : ["unknown", "submitting", "attention", "deleting", "delete_unknown"].includes(d.status) ? (A(), I("button", {
                    key: 2,
                    class: "button",
                    disabled: !!g(z),
                    onClick: p[12] || (p[12] = (...P) => g(Re) && g(Re)(...P))
                  }, "核对", 8, Ya)) : (A(), I("button", {
                    key: 3,
                    class: "button quiet",
                    disabled: !!g(z),
                    onClick: (P) => g(T)(d)
                  }, "停止订阅", 8, Ja)) : (A(), I("button", {
                    key: 0,
                    class: "button",
                    disabled: !!g(z),
                    onClick: (P) => g(f)(d)
                  }, "手动匹配", 8, qa)),
                  d.status === "unknown" && !d.hostId ? (A(), I("button", {
                    key: 4,
                    class: "button quiet",
                    disabled: !!g(z),
                    onClick: (P) => g(T)(d, !0)
                  }, "确认未创建", 8, Za)) : X("", !0)
                ])
              ]))), 128))
            ])) : (A(), I("div", Xa, [
              B(Y, {
                name: "bookmark",
                size: 42
              }),
              c("h3", null, O(g(we) === "blocked" ? "还没有停订记录" : "清单里还有空位"), 1),
              c("p", null, O(g(we) === "blocked" ? "宿主删除的订阅会在这里保留，只有手动恢复才重新添加。" : "去发现页，选一部你期待的故事。"), 1),
              c("button", {
                class: "button",
                onClick: p[13] || (p[13] = (d) => g(a)("discover"))
              }, [
                p[59] || (p[59] = L("去发现", -1)),
                B(Y, {
                  name: "arrow",
                  size: 16
                })
              ])
            ]))
          ], 64)) : g(r) === "rules" ? (A(), I(ee, { key: 5 }, [
            p[85] || (p[85] = c("div", { class: "page-title" }, [
              c("div", { class: "eyebrow" }, "MAKE IT YOURS"),
              c("h1", null, "让好故事，自己来。"),
              c("p", null, "选定一个媒体库，告诉我们你喜欢什么。")
            ], -1)),
            c("form", {
              class: "settings-layout",
              onSubmit: p[24] || (p[24] = Gt((...d) => g(me) && g(me)(...d), ["prevent"]))
            }, [
              c("div", Qa, [
                c("section", ec, [
                  c("div", tc, [
                    p[61] || (p[61] = c("span", { class: "number" }, "01", -1)),
                    p[62] || (p[62] = c("div", null, [
                      c("h2", null, "固定 Emby 实例"),
                      c("p", null, "每条订阅只认定一个媒体库。")
                    ], -1)),
                    c("button", {
                      type: "button",
                      class: "icon-button",
                      "aria-label": "刷新 Emby 实例",
                      disabled: !!g(z),
                      onClick: p[14] || (p[14] = (d) => g(It)("刷新实例", g(Dt)))
                    }, [
                      B(Y, {
                        name: "refresh",
                        size: 18
                      })
                    ], 8, sc)
                  ]),
                  c("label", ic, [
                    p[64] || (p[64] = L("目标实例", -1)),
                    be(c("select", {
                      "onUpdate:modelValue": p[15] || (p[15] = (d) => g(o).proxyId = d)
                    }, [
                      p[63] || (p[63] = c("option", { value: null }, "请选择固定实例", -1)),
                      (A(!0), I(ee, null, Se(g(ne), (d) => (A(), I("option", {
                        value: d.id,
                        disabled: !d.api_key_configured || d.id === 0
                      }, O(d.name) + O(d.id === 0 ? "（旧版默认实例，不支持固定绑定）" : d.api_key_configured ? "" : "（未配置）"), 9, nc))), 256))
                    ], 512), [
                      [qt, g(o).proxyId]
                    ])
                  ]),
                  c("div", oc, [
                    B(Y, {
                      name: "shield",
                      size: 18
                    }),
                    p[65] || (p[65] = c("span", null, "实例不可用时暂停处理，不切换到其他媒体库。更改此设置只影响新订阅。", -1))
                  ])
                ]),
                c("section", rc, [
                  c("div", lc, [
                    p[67] || (p[67] = c("span", { class: "number" }, "02", -1)),
                    p[68] || (p[68] = c("div", null, [
                      c("h2", null, "自动追新"),
                      c("p", null, "严格匹配片名、年份与季数后，才自动添加。")
                    ], -1)),
                    c("label", ac, [
                      be(c("input", {
                        "onUpdate:modelValue": p[16] || (p[16] = (d) => g(o).auto = d),
                        type: "checkbox",
                        "aria-label": "启用自动追新"
                      }, null, 512), [
                        [en, g(o).auto]
                      ]),
                      p[66] || (p[66] = c("span", null, null, -1))
                    ])
                  ]),
                  c("div", cc, [
                    (A(), I(ee, null, Se([["douban-tv", "豆瓣剧集"], ["douban-movie", "豆瓣电影"], ["douban-soon", "豆瓣即将上映"], ["bangumi", "Bangumi 新番"]], ([d, P]) => c("label", {
                      class: ke({ checked: g(o).feeds[d] })
                    }, [
                      be(c("input", {
                        "onUpdate:modelValue": (q) => g(o).feeds[d] = q,
                        type: "checkbox"
                      }, null, 8, pc), [
                        [en, g(o).feeds[d]]
                      ]),
                      L(O(P), 1)
                    ], 2)), 64))
                  ]),
                  c("div", uc, [
                    c("label", dc, [
                      p[69] || (p[69] = L("最低评分", -1)),
                      be(c("input", {
                        "onUpdate:modelValue": p[17] || (p[17] = (d) => g(o).minScore = d),
                        type: "number",
                        min: "0",
                        max: "10",
                        step: "0.1"
                      }, null, 512), [
                        [
                          dt,
                          g(o).minScore,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      p[70] || (p[70] = c("small", null, "设为 0 可包含尚未评分作品", -1))
                    ]),
                    c("label", fc, [
                      p[71] || (p[71] = L("最早首播年份", -1)),
                      be(c("input", {
                        "onUpdate:modelValue": p[18] || (p[18] = (d) => g(o).yearFrom = d),
                        type: "number",
                        min: "1900",
                        max: "2100"
                      }, null, 512), [
                        [
                          dt,
                          g(o).yearFrom,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ]),
                    c("label", gc, [
                      p[72] || (p[72] = L("最少评分人数", -1)),
                      be(c("input", {
                        "onUpdate:modelValue": p[19] || (p[19] = (d) => g(o).minVotes = d),
                        type: "number",
                        min: "0",
                        max: "1000000"
                      }, null, 512), [
                        [
                          dt,
                          g(o).minVotes,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      p[73] || (p[73] = c("small", null, "设为 0 不限制", -1))
                    ]),
                    c("label", hc, [
                      p[74] || (p[74] = L("检查间隔（分钟）", -1)),
                      be(c("input", {
                        "onUpdate:modelValue": p[20] || (p[20] = (d) => g(o).intervalMinutes = d),
                        type: "number",
                        min: "15",
                        max: "1440",
                        step: "5"
                      }, null, 512), [
                        [
                          dt,
                          g(o).intervalMinutes,
                          void 0,
                          { number: !0 }
                        ]
                      ])
                    ]),
                    c("label", hc, [
                      L("想看人数阈值"),
                      be(c("input", {
                        "onUpdate:modelValue": (d) => g(o).minWish = d,
                        type: "number",
                        min: "0",
                        max: "1000000",
                        step: "500"
                      }, null, 512), [
                        [
                          dt,
                          g(o).minWish,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      c("small", null, "低于此想看人数则跳过（默认 5000）", -1)
                    ]),
                    c("label", hc, [
                      L("上映窗口（天）"),
                      be(c("input", {
                        "onUpdate:modelValue": (d) => g(o).soonWindowDays = d,
                        type: "number",
                        min: "1",
                        max: "365",
                        step: "1"
                      }, null, 512), [
                        [
                          dt,
                          g(o).soonWindowDays,
                          void 0,
                          { number: !0 }
                        ]
                      ]),
                      c("small", null, "仅订阅 N 天内上映的影片（默认 30）", -1)
                    ])
                  ]),
                  c("label", mc, [
                    p[75] || (p[75] = L("包含关键词", -1)),
                    be(c("input", {
                      "onUpdate:modelValue": p[21] || (p[21] = (d) => g(o).include = d),
                      placeholder: "例如：科幻，治愈，悬疑"
                    }, null, 512), [
                      [dt, g(o).include]
                    ]),
                    p[76] || (p[76] = c("small", null, "逗号分隔，匹配任一片名或标签；留空不限", -1))
                  ]),
                  c("label", xc, [
                    p[77] || (p[77] = L("排除关键词", -1)),
                    be(c("input", {
                      "onUpdate:modelValue": p[22] || (p[22] = (d) => g(o).exclude = d),
                      placeholder: "例如：真人秀，总集篇"
                    }, null, 512), [
                      [dt, g(o).exclude]
                    ]),
                    p[78] || (p[78] = c("small", null, "匹配任一关键词时跳过", -1))
                  ]),
                  c("label", bc, [
                    p[80] || (p[80] = L("豆瓣片单读取页数", -1)),
                    be(c("select", {
                      "onUpdate:modelValue": p[23] || (p[23] = (d) => g(o).pageCount = d)
                    }, [...p[79] || (p[79] = [
                      c("option", { value: 1 }, "1 页 / 每类最多 50 部", -1),
                      c("option", { value: 2 }, "2 页 / 每类最多 100 部", -1),
                      c("option", { value: 3 }, "3 页 / 每类最多 150 部", -1),
                      c("option", { value: 5 }, "5 页 / 每类最多 250 部", -1)
                    ])], 512), [
                      [
                        qt,
                        g(o).pageCount,
                        void 0,
                        { number: !0 }
                      ]
                    ])
                  ])
                ]),
                c("div", vc, [
                  c("span", null, O(g(bt) ? "有未保存的修改" : "设置已保存"), 1),
                  c("button", {
                    class: "button primary",
                    type: "submit",
                    disabled: !!g(z)
                  }, [
                    B(Y, {
                      name: "check",
                      size: 17
                    }),
                    p[81] || (p[81] = L("保存追新规则", -1))
                  ], 8, yc)
                ])
              ]),
              c("aside", wc, [
                c("div", _c, [
                  B(Y, {
                    name: "shield",
                    size: 28
                  }),
                  p[82] || (p[82] = c("h3", null, "你的选择，始终优先。", -1)),
                  p[83] || (p[83] = c("ul", null, [
                    c("li", null, [
                      c("strong", null, "120 条硬上限"),
                      c("span", null, "提交中和待核对记录同样占用名额，防止重复添加。")
                    ]),
                    c("li", null, [
                      c("strong", null, "删除，就是停止"),
                      c("span", null, "宿主确认删除后持续保留停订标记，跨来源也不会自动重建。")
                    ]),
                    c("li", null, [
                      c("strong", null, "不确定，先等你"),
                      c("span", null, "多季作品、匹配歧义进入待匹配，提交结果未知先核对。")
                    ])
                  ], -1))
                ]),
                c("div", kc, [
                  B(Y, {
                    name: "clock",
                    size: 18
                  }),
                  p[84] || (p[84] = c("p", null, "定时任务每 5 分钟检查一次是否到期。来源为公开目录快照，豆瓣验证页或接口异常时保留上次数据并暂停该来源自动处理。", -1))
                ])
              ])
            ], 32)
          ], 64)) : (A(), I(ee, { key: 6 }, [
            c("div", zc, [
              p[86] || (p[86] = c("div", { class: "eyebrow" }, "BEHIND THE SCENES", -1)),
              p[87] || (p[87] = c("h1", null, "每一步，都有记录。", -1)),
              c("p", null, "上次核对 " + O(g(je)(g(n).lastSync)) + " · 上次自动追新 " + O(g(je)(g(n).lastAuto)), 1)
            ]),
            c("div", Cc, [
              c("section", Sc, [
                p[88] || (p[88] = c("h2", null, "最近动态", -1)),
                g(n).logs.length ? X("", !0) : (A(), I("div", Tc, "还没有运行记录")),
                (A(!0), I(ee, null, Se(g(n).logs, (d, P) => (A(), I("div", {
                  key: P,
                  class: "log-row"
                }, [
                  c("span", {
                    class: ke(["log-dot", d.level])
                  }, null, 2),
                  c("div", null, [
                    c("p", null, O(d.message), 1),
                    c("time", null, O(g(je)(d.at)), 1)
                  ])
                ]))), 128))
              ]),
              c("section", Mc, [
                p[89] || (p[89] = c("h2", null, "宿主任务", -1)),
                p[90] || (p[90] = c("p", { class: "muted-text" }, "中断任务先核对实际结果，再恢复处理。", -1)),
                g(W).length ? X("", !0) : (A(), I("div", Ec, "暂无任务")),
                (A(!0), I(ee, null, Se(g(W), (d) => (A(), I("article", Ac, [
                  c("div", null, [
                    c("strong", null, O(d.job_id === "engine" ? "订阅与核对" : "发现与匹配"), 1),
                    c("span", null, O({ succeeded: "已完成", running: "运行中", queued: "等待中", failed: "失败", cancelled: "已取消", attention_required: "需要核对" }[d.status] || d.status), 1),
                    d.error ? (A(), I("p", Oc, O(d.error), 1)) : X("", !0)
                  ]),
                  ["attention_required", "failed", "cancelled"].includes(d.status) ? (A(), I("button", {
                    key: 0,
                    class: "button",
                    disabled: !!g(z),
                    onClick: (P) => g(S)(d)
                  }, "恢复核对", 8, Ic)) : X("", !0)
                ]))), 256))
              ])
            ])
          ], 64)),
          p[91] || (p[91] = c("footer", { class: "main-footer" }, [
            c("strong", null, [
              L("追光"),
              c("span", null, " / "),
              L("WATCHLIGHT")
            ]),
            c("span", null, "给好故事，留一个位置。"),
            c("span", null, "v1.0.0")
          ], -1))
        ], 512),
        g(V) ? (A(), I("div", Rc, [
          B(Y, {
            name: "check",
            size: 18
          }),
          L(O(g(V)), 1)
        ])) : X("", !0),
        c("dialog", {
          ref_key: "dialog",
          ref: U,
          class: "zg-dialog glass",
          "aria-labelledby": "dialog-title",
          onCancel: p[33] || (p[33] = Gt((...d) => g(b) && g(b)(...d), ["prevent"]))
        }, [
          c("button", {
            class: "dialog-close icon-button",
            "aria-label": "关闭弹窗",
            disabled: !!g(z),
            onClick: p[25] || (p[25] = (...d) => g(b) && g(b)(...d))
          }, [
            B(Y, { name: "close" })
          ], 8, $c),
          g(ye) ? (A(), I("div", Nc, [
            p[92] || (p[92] = c("div", { class: "eyebrow" }, "YOUR CHOICE COMES FIRST", -1)),
            c("h2", Fc, O(g(ye).confirmAbsent ? "确认宿主未创建" : "停止订阅") + "「" + O(g(ye).work.title) + "」？", 1),
            c("p", null, O(g(ye).confirmAbsent ? "请先在宿主检查并确认这条订阅从未创建。确认后将释放占用名额并保留停订标记，不会再次自动提交。" : "将删除这条宿主订阅并记住停订选择，不会删除已入库的媒体。以后只有你手动恢复，才会再次添加。"), 1),
            c("div", Pc, [
              c("button", {
                class: "button",
                disabled: !!g(z),
                onClick: p[26] || (p[26] = (...d) => g(b) && g(b)(...d))
              }, "继续追更", 8, jc),
              c("button", {
                class: "button danger",
                disabled: !!g(z),
                onClick: p[27] || (p[27] = (...d) => g(C) && g(C)(...d))
              }, O(g(ye).confirmAbsent ? "确认未创建并停订" : "停止订阅"), 9, Vc)
            ])
          ])) : g(j) ? (A(), I(ee, { key: 1 }, [
            c("div", Lc, [
              c("div", Dc, [
                g(j).cover ? (A(), Ft(Qs, {
                  key: 0,
                  src: g(j).cover
                }, null, 8, ["src"])) : X("", !0)
              ]),
              c("div", null, [
                c("div", Hc, O(g(j).source === "douban" ? "DOUBAN" : "BANGUMI") + " · " + O(g(j).year || "年份待确认"), 1),
                c("h2", Uc, O(g(j).title), 1),
                g(j).originalTitle && g(j).originalTitle !== g(j).title ? (A(), I("p", Bc, O(g(j).originalTitle), 1)) : X("", !0),
                c("div", Kc, [
                  B(Y, {
                    name: "star",
                    size: 15
                  }),
                  L(O(g(j).score || "暂无评分"), 1),
                  c("span", null, O(g(j).votes ? g(j).votes + " 人评分" : ""), 1)
                ]),
                c("a", {
                  href: g(j).url,
                  target: "_blank",
                  rel: "noopener noreferrer"
                }, [
                  p[93] || (p[93] = L("在来源查看", -1)),
                  B(Y, {
                    name: "external",
                    size: 13
                  })
                ], 8, Wc)
              ])
            ]),
            c("div", qc, [
              g(j).summary ? (A(), I("p", Gc, O(g(j).summary), 1)) : X("", !0),
              g(ze) ? (A(), I("div", Yc, O(g(ze)), 1)) : X("", !0),
              g(D) ? (A(), I("div", Jc, O(g(D)), 1)) : X("", !0),
              g(z) ? (A(), I("div", Zc, [
                p[94] || (p[94] = c("span", { class: "spinner" }, null, -1)),
                L(O(g(z)) + "…", 1)
              ])) : X("", !0),
              p[98] || (p[98] = c("h3", null, "确认要追的作品", -1)),
              p[99] || (p[99] = c("p", { class: "muted-text" }, "选择正确的 TMDB 条目与季数，交给固定 Emby 实例完成订阅。", -1)),
              c("form", {
                class: "match-search",
                onSubmit: p[29] || (p[29] = Gt((...d) => g(x) && g(x)(...d), ["prevent"]))
              }, [
                be(c("input", {
                  "onUpdate:modelValue": p[28] || (p[28] = (d) => /* @__PURE__ */ ce(he) ? he.value = d : null),
                  "aria-label": "TMDB 搜索词"
                }, null, 512), [
                  [dt, g(he)]
                ]),
                c("button", {
                  class: "button",
                  disabled: !!g(z)
                }, "重新匹配", 8, Xc)
              ], 32),
              c("div", Qc, [
                (A(!0), I(ee, null, Se(g(N), (d) => {
                  var P, q, le, xe, fe, Be;
                  return A(), I("button", {
                    class: ke(["match-option", { selected: ((P = g(G)) == null ? void 0 : P.id) === d.id && ((q = g(G)) == null ? void 0 : q.media_type) === d.media_type }]),
                    "aria-pressed": ((le = g(G)) == null ? void 0 : le.id) === d.id && ((xe = g(G)) == null ? void 0 : xe.media_type) === d.media_type,
                    disabled: !!g(z),
                    onClick: (Ht) => g(k)(d)
                  }, [
                    p[95] || (p[95] = c("span", { class: "radio-dot" }, null, -1)),
                    c("span", null, [
                      c("strong", null, O(d.title || d.name), 1),
                      c("small", null, O(d.year || "未知年份") + " · " + O(d.media_type === "tv" ? "剧集" : "电影") + " · TMDB " + O(d.id), 1)
                    ]),
                    ((fe = g(G)) == null ? void 0 : fe.id) === d.id && ((Be = g(G)) == null ? void 0 : Be.media_type) === d.media_type ? (A(), Ft(Y, {
                      key: 0,
                      name: "check",
                      size: 17
                    })) : X("", !0)
                  ], 10, ep);
                }), 256)),
                !g(N).length && !g(z) ? (A(), I("p", tp, "没有匹配结果，试试原名或其他译名。")) : X("", !0)
              ]),
              ((K = g(G)) == null ? void 0 : K.media_type) === "tv" ? (A(), I("label", sp, [
                p[96] || (p[96] = L("选择季数", -1)),
                be(c("select", {
                  "onUpdate:modelValue": p[30] || (p[30] = (d) => /* @__PURE__ */ ce(de) ? de.value = d : null)
                }, [
                  (A(!0), I(ee, null, Se(g(Ae), (d) => (A(), I("option", {
                    value: d.season_number
                  }, O(d.name || `第 ${d.season_number} 季`) + " · " + O(d.episode_count || "未知") + " 集 · " + O(d.air_date || "日期待定"), 9, ip))), 256))
                ], 512), [
                  [
                    qt,
                    g(de),
                    void 0,
                    { number: !0 }
                  ]
                ])
              ])) : X("", !0),
              c("div", np, [
                B(Y, {
                  name: "server",
                  size: 18
                }),
                c("span", null, [
                  p[97] || (p[97] = L("固定实例", -1)),
                  c("strong", null, O(g(o).proxyName || "尚未选择"), 1)
                ]),
                c("span", null, O(g(Oe)) + " / 120", 1)
              ]),
              g(w)(g(j)) === "已停订" && !g(Ue) ? (A(), I("div", op, "此作品已停订。请到「我的订阅 → 已停订」手动恢复。")) : X("", !0),
              c("div", rp, [
                c("button", {
                  class: "button",
                  disabled: !!g(z),
                  onClick: p[31] || (p[31] = (...d) => g(b) && g(b)(...d))
                }, "稍后再说", 8, lp),
                c("button", {
                  class: "button primary",
                  disabled: !!g(z) || !g(G) || !g(o).proxyId || g(Oe) >= 120 || g(w)(g(j)) === "已停订" && !g(Ue),
                  onClick: p[32] || (p[32] = (...d) => g(_) && g(_)(...d))
                }, [
                  B(Y, {
                    name: "plus",
                    size: 17
                  }),
                  L(O(g(Ue) ? "确认手动恢复" : "确认并订阅"), 1)
                ], 8, ap)
              ])
            ])
          ], 64)) : X("", !0)
        ], 544)
      ]);
    };
  }
}, pp = '.zg-app{--bg:#f5f7f5;--surface:#fff;--text:#203b39;--muted:#5c706d;--border:#dbe5e0;--accent:#0d7569;--accent-soft:#e0eee8;--glass:rgba(255,255,255,.68);--glass-edge:rgba(255,255,255,.95);--shadow:0 12px 40px -22px #385c4b38;--error:#a83239;--warm:#85591f;color:var(--text);background:var(--bg);font-family:-apple-system,BlinkMacSystemFont,SF Pro Display,PingFang SC,Microsoft YaHei,sans-serif;font-size:14px;line-height:1.55;isolation:isolate;min-height:100%;color-scheme:light;-webkit-font-smoothing:antialiased}.zg-app[data-theme=dark]{--bg:#121d20;--surface:#1c2c2e;--text:#e6efea;--muted:#a4bab5;--border:#3b504e;--accent:#a0e0cb;--accent-soft:#2b4943;--glass:rgba(34,52,54,.8);--glass-edge:rgba(190,227,217,.2);--shadow:0 12px 40px -22px #0009;--error:#ffadb0;--warm:#e4bd86;color-scheme:dark}.zg-app *{box-sizing:border-box}.zg-app button,.zg-app input,.zg-app select{font:inherit}.zg-app button,.zg-app a,.zg-app select{touch-action:manipulation}.zg-app button{cursor:pointer;color:inherit}.zg-app button:disabled{cursor:not-allowed;opacity:.48}.zg-app button,.zg-app input,.zg-app select{transition:background .18s ease,border-color .18s ease,box-shadow .18s ease,opacity .18s ease}.zg-app button{border:0;background:none}.zg-app a{color:var(--accent);text-decoration:none}.zg-app :focus-visible{outline:3px solid var(--accent);outline-offset:3px}.zg-app img{display:block;max-width:100%}.zg-app svg{flex-shrink:0;vertical-align:middle}.zg-app h1,.zg-app h2,.zg-app h3,.zg-app p{margin:0}.zg-app h1{font-weight:620;letter-spacing:-1.6px}.zg-app h2{font-size:23px;font-weight:620;letter-spacing:-.7px}.zg-app h3{font-size:15px;font-weight:600}.zg-app .glass{background:var(--glass);border:1px solid var(--glass-edge);box-shadow:var(--shadow),inset 0 1px 0 var(--glass-edge);backdrop-filter:blur(24px) saturate(135%);-webkit-backdrop-filter:blur(24px) saturate(135%)}.zg-shell{max-width:1920px;margin:auto;display:grid;grid-template-columns:92px minmax(0,1fr);background:radial-gradient(ellipse at 15% 0%,#dae8dc70,transparent 40%),radial-gradient(ellipse at 100% 30%,#e4e9db60,transparent 50%);min-height:100vh}.zg-app[data-theme=dark] .zg-shell{background:radial-gradient(ellipse at 15% 0%,#24574730,transparent 40%)}.zg-rail{border-radius:0 28px 28px 0;position:sticky;top:0;height:100vh;max-height:1000px;display:flex;flex-direction:column;align-items:center;padding:31px 8px;z-index:5;border-left:0!important}.zg-mark{display:grid;place-items:center;width:44px;height:44px;border-radius:15px;background:linear-gradient(150deg,#216b5d,#0b423d);color:#fff!important;box-shadow:inset 0 1px #ffffff60,0 4px 10px #25524720}.zg-rail nav{display:flex;flex-direction:column;width:100%;gap:15px;margin-top:49px}.zg-rail nav button{width:100%;min-height:66px;border-radius:17px;display:flex;gap:6px;flex-direction:column;justify-content:center;align-items:center;color:var(--muted);font-size:11px;white-space:nowrap}.zg-rail nav button:hover{background:var(--accent-soft)}.zg-rail nav button.active{background:var(--accent-soft);color:var(--accent);box-shadow:inset 0 1px 1px var(--glass-edge)}.rail-bottom{display:flex;flex-direction:column;align-items:center;margin-top:auto;gap:7px;font-size:9px;letter-spacing:1px;color:var(--muted)}.rail-bottom small{font-size:8px;letter-spacing:1px;opacity:.75}.status-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#4caa7e;box-shadow:0 0 0 4px #4caa7e12}.status-dot.offline{background:#a98245;box-shadow:none}.zg-main{padding:0 42px;min-width:0}.zg-header{min-height:100px;display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:20px}.brand strong{display:flex;align-items:baseline;gap:10px;font-size:22px;font-weight:650;letter-spacing:1px;white-space:nowrap}.brand strong span{font-size:9px;font-weight:550;letter-spacing:2px}.brand-divider{width:1px;height:18px;background:var(--border)}.header-caption{font-size:12px;color:var(--muted)}.instance-pill{border-radius:99px;min-height:40px;display:flex;align-items:center;justify-content:center;gap:10px;padding:0 16px;font-size:12px;white-space:nowrap}.instance-pill span:nth-child(2){max-width:160px;overflow:hidden;text-overflow:ellipsis}.preview-note{font-size:11px;color:var(--muted);padding:4px 0 10px}.hero{position:relative;min-height:326px;border-radius:28px;background:radial-gradient(ellipse at 68% 16%,#c6e1d7 0,transparent 50%),linear-gradient(115deg,#e9efdf,#dceee6 57%,#e8eae2);display:grid;grid-template-columns:1.05fr 1fr 248px;align-items:center;overflow:hidden;padding:34px 34px 34px 38px;gap:12px}.hero:after{content:"";pointer-events:none;position:absolute;top:0;right:0;bottom:0;left:0;border:1px solid #ffffff8a;border-radius:inherit;box-shadow:inset 0 2px 2px #fff4}.hero-copy{z-index:1}.eyebrow{font-size:9px;letter-spacing:2px;font-weight:650;display:flex;align-items:center;gap:8px;color:var(--accent)}.eyebrow>span{width:5px;height:5px;border-radius:50%;background:currentColor}.hero h1{font-size:42px;line-height:1.4;margin:17px 0 10px;color:#263f38}.hero h1 span{color:#297761}.hero p{font-size:12px;line-height:1.9;color:#5a7166}.hero-foot{font-size:9px;letter-spacing:1.2px;color:#617a6b;margin-top:20px;display:flex;align-items:center;gap:10px}.tiny-line{width:24px;height:1px;background:#859c8a}.hero-art{align-self:stretch;position:relative;min-width:130px;display:grid;place-items:center}.art-orbit{position:absolute;width:240px;height:240px;border-radius:50%;border:1px solid #fff9;box-shadow:inset 0 0 30px #ffffff40,0 0 14px #83b5a61a;transform:rotate(-22deg)}.orbit-a{width:260px;height:190px}.orbit-b{transform:rotate(35deg);width:220px;height:280px}.orbit-c{width:185px;height:185px;background:radial-gradient(circle at 40% 30%,#fff7,#78b7a128);border-width:9px;filter:blur(.5px)}.art-glass{position:relative;width:145px;height:200px;transform:rotate(-11deg);border-radius:20px;padding:23px;background:linear-gradient(145deg,#ffffffe6,#ffffff25);border:1px solid #fffc;box-shadow:0 22px 35px -18px #577d6770,inset 0 2px 1px #fff,inset 0 -1px 1px #fff;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;color:#4f7a67}.art-glass>span{font-size:11px;line-height:1.4;letter-spacing:1.8px;font-weight:550}.art-glass>svg{align-self:center;stroke-width:.7}.art-glass small{font-size:6px;letter-spacing:1.7px}.art-chip{position:absolute;bottom:20px;left:20px;padding:10px 14px;border-radius:99px;display:flex;gap:7px;align-items:center;transform:rotate(4deg);font-size:10px;color:#426756;white-space:nowrap}.hero-summary{z-index:1;border-radius:20px;padding:23px 22px;align-self:end;margin-bottom:6px}.summary-top{display:flex;align-items:center;gap:7px;font-size:11px}.summary-top svg{color:var(--accent)}.live-label{margin-left:auto;font-size:9px;color:var(--accent);white-space:nowrap}.summary-count{font-size:44px;font-weight:550;letter-spacing:-2px;margin-top:15px;line-height:1.4}.summary-count>span{font-size:15px;color:var(--muted);font-weight:400;letter-spacing:0;margin-left:9px}.capacity{height:4px;border-radius:9px;background:#3f766f14;overflow:hidden;margin-top:10px}.capacity>span{display:block;height:100%;border-radius:9px;background:var(--accent);min-width:2px}.summary-bottom{display:flex;align-items:center;justify-content:space-between;font-size:10px;color:var(--muted);margin-top:10px}.summary-bottom button{width:32px;height:32px;display:grid;place-items:center;border-radius:50%}.summary-bottom button:hover{background:var(--accent-soft)}.discovery{margin-top:36px}.section-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}.section-heading h2{margin-top:6px}.eyebrow.muted{font-size:8px;letter-spacing:1.8px;color:var(--muted)}.button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:10px 16px;border:1px solid var(--border)!important;border-radius:12px;background:var(--glass)!important;font-size:12px!important;white-space:nowrap}.button:hover:not(:disabled){background:var(--accent-soft)!important;border-color:var(--accent)!important}.button.primary{background:var(--accent)!important;color:#fff;border-color:transparent!important}.zg-app[data-theme=dark] .button.primary{color:#173930}.button.quiet{background:transparent!important;box-shadow:none;border-color:transparent!important;color:var(--muted)}.button.danger{color:var(--error);border-color:var(--error)!important}.discovery-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px}.source-tabs{display:flex;align-items:center;padding:5px;border-radius:16px;gap:3px}.source-tabs button{border-radius:11px;min-height:38px;padding:9px 16px;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:12px;white-space:nowrap;color:var(--muted)}.source-tabs button.selected{background:var(--text);color:var(--bg);box-shadow:0 3px 5px #152c2110}.source-tabs button:hover:not(.selected){background:var(--accent-soft)}.source-dot{width:5px;height:5px;border-radius:50%}.source-dot.green{background:#41a47d}.source-dot.pink{background:#de8197}.search-box{border:1px solid var(--border);border-radius:13px;background:var(--glass);display:flex;align-items:center;gap:8px;min-height:45px;padding:0 10px;max-width:300px;min-width:0;flex:1}.search-box>svg{color:var(--muted)}.search-box input{border:0;background:none;width:100%;min-width:30px;color:var(--text);outline:none;font-size:11px;padding:10px 0}.search-box:focus-within{outline:2px solid var(--accent);outline-offset:2px}.search-box select{background:transparent;border:0;color:var(--muted);font-size:10px;max-width:69px;min-height:32px}.search-box button{min-width:30px;min-height:36px;display:grid;place-items:center}.list-meta{display:flex;align-items:center;justify-content:space-between;gap:15px;min-height:64px;color:var(--muted);font-size:10px}.list-meta b{color:var(--text);font-weight:500;margin:0 8px}.meta-separator{color:var(--border);margin-right:9px}.sort-control{display:flex;gap:8px}.sort-control select{background:none;border:none;color:var(--muted);font-size:11px;min-height:40px;padding:4px}.sort-control button{font-size:11px;color:var(--accent);min-height:40px}.days{display:flex;gap:5px;flex-wrap:wrap}.days button{font-size:11px;min-height:34px;min-width:38px;border-radius:9px;padding:7px 10px;color:var(--muted)}.days button.selected{background:var(--accent-soft);color:var(--accent)}.poster-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:27px 21px}.media-card{min-width:0}.poster{border-radius:13px!important;overflow:hidden;position:relative;width:100%;aspect-ratio:2/3;display:block;padding:0;background:var(--accent-soft)!important;box-shadow:0 5px 14px -8px #344d4260}.poster>img{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;object-fit:cover;transition:transform .4s ease}.poster:hover>img{transform:scale(1.035)}.poster:after{content:"";position:absolute;top:0;right:0;bottom:0;left:0;border-radius:inherit;border:1px solid #ffffff36;box-shadow:inset 0 -45px 35px -24px #0008;pointer-events:none}.poster-placeholder{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:15px;padding:20px;color:var(--muted);font-size:14px;text-align:center;background:linear-gradient(135deg,var(--accent-soft),var(--surface))}.poster-top{position:absolute;top:9px;left:9px;right:9px;display:flex;gap:5px;justify-content:space-between;z-index:1}.source-tag{font-size:8px;border-radius:5px;padding:4px 6px;background:#f2fff3e8;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#226348;box-shadow:0 0 0 1px #ffffff36 inset}.source-tag.bangumi{background:#fff0f4e8;color:#8d3f59}.rating{display:flex;align-items:center;gap:4px;padding:3px 6px;font-size:10px;color:#fff1c2;background:#1c2821bb;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-radius:5px}.rating svg{fill:currentColor;stroke-width:0}.poster-state{position:absolute;bottom:11px;left:10px;display:flex;align-items:center;gap:5px;z-index:2;border-radius:6px;background:#153d2ee8;color:#f4fff8;font-size:9px;padding:5px 7px}.poster-action{position:absolute;bottom:10px;right:10px;border:1px solid #ffffff80;background:#ffffffc9;-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-radius:50%;width:31px;height:31px;display:grid;place-items:center;color:#1b5244;z-index:2;box-shadow:0 3px 10px #0002}.poster:hover .poster-action{background:#fff}.card-caption{padding-top:11px}.card-caption h3{font-size:13px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.6}.card-caption p{font-size:10px;color:var(--muted);display:flex;gap:7px;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}.catalog-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:29px 0 14px;color:var(--muted);font-size:10px}.main-footer{border-top:1px solid var(--border);padding:23px 0 27px;display:flex;gap:16px;align-items:center;margin-top:28px;color:var(--muted);font-size:9px}.main-footer strong{font-size:9px;letter-spacing:1.2px;font-weight:500}.main-footer strong span{margin:0 7px;color:var(--border)}.main-footer>span:last-child{margin-left:auto}.page-title{padding:28px 0 32px}.page-title h1{font-size:36px;line-height:1.5;margin:10px 0 8px}.page-title p{color:var(--muted);font-size:13px}.stats-row{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:30px}.stat{border-radius:21px;padding:20px 24px;display:flex;flex-direction:column;gap:10px}.stat>span{font-size:12px;color:var(--muted)}.stat strong{font-size:34px;font-weight:550;letter-spacing:-1px}.stat small{font-size:14px;color:var(--muted);font-weight:400;letter-spacing:0}.subscription-list{display:flex;flex-direction:column;gap:12px}.subscription-row{border-radius:17px;padding:16px;display:flex;align-items:center;gap:18px}.mini-poster{width:52px;height:76px;overflow:hidden;border-radius:7px;background:var(--accent-soft);display:grid;place-items:center;flex-shrink:0}.mini-poster img{width:100%;height:100%;object-fit:cover}.sub-info{flex:1;min-width:0}.sub-info h3{font-size:15px;margin-bottom:5px}.sub-info p{font-size:11px;color:var(--muted);margin-top:3px}.sub-source{background:var(--accent-soft);color:var(--accent);padding:2px 6px;margin-left:4px;border-radius:4px;font-size:9px}.state-pill{font-size:10px;color:var(--accent);padding:5px 10px;border:1px solid var(--border);border-radius:9px;white-space:nowrap}.state-pill.blocked{color:var(--muted)}.state-pill.unknown,.state-pill.attention,.state-pill.delete_unknown{color:var(--warm)}.text-error{color:var(--error)!important}.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:280px;gap:16px;padding:40px 18px;color:var(--muted)}.empty h3{color:var(--text);font-size:18px}.empty p{font-size:13px;max-width:460px}.empty.small{min-height:100px;padding:24px;font-size:12px}.settings-layout{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:27px;align-items:start}.settings-main{display:flex;flex-direction:column;gap:22px}.settings-card{padding:27px;border-radius:22px;min-width:0}.settings-title{display:flex;align-items:center;gap:15px;margin-bottom:24px}.settings-title h2{font-size:18px;letter-spacing:0}.settings-title p{font-size:11px;color:var(--muted);margin-top:5px}.settings-title>.icon-button,.settings-title>.switch{margin-left:auto}.number{font-size:12px;color:var(--accent);display:grid;place-items:center;border:1px solid var(--border);width:36px;height:36px;border-radius:11px;flex-shrink:0}.field{display:flex;flex-direction:column;gap:8px;font-size:12px;margin-bottom:19px;font-weight:500}.field input,.field select,.match-search input{min-width:0;width:100%;min-height:44px;padding:11px 12px;border:1px solid var(--border);border-radius:10px;background:var(--surface);color:var(--text);font-size:13px;font-weight:400}.field small{font-size:10px;color:var(--muted);font-weight:400}.inline-note{display:flex;align-items:flex-start;gap:10px;padding:12px 14px;border-radius:12px;background:var(--accent-soft);color:var(--accent);font-size:11px}.inline-note svg{margin-top:2px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 20px}.feed-choices{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:26px}.feed-choices label{display:flex;align-items:center;gap:8px;padding:11px 14px;border:1px solid var(--border);border-radius:11px;font-size:12px;cursor:pointer}.feed-choices label.checked{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}.feed-choices input{accent-color:var(--accent);margin:0;width:14px;height:14px}.switch{display:block;position:relative;width:44px;height:44px;cursor:pointer;flex-shrink:0}.switch input{position:absolute;width:100%;height:100%;opacity:0;cursor:pointer;z-index:1;margin:0}.switch>span{position:absolute;top:10px;width:44px;height:25px;background:var(--border);border-radius:99px;transition:background .2s ease}.switch>span:after{content:"";position:absolute;width:19px;height:19px;left:3px;top:3px;border-radius:50%;background:var(--surface);box-shadow:0 1px 3px #0002;transition:transform .2s ease}.switch input:checked+span{background:var(--accent)}.switch input:checked+span:after{transform:translate(19px)}.switch input:focus-visible+span{outline:3px solid var(--accent);outline-offset:4px}.save-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:0 4px}.save-row>span{font-size:11px;color:var(--muted)}.guard-card{padding:26px;border-radius:22px;color:var(--accent);background:linear-gradient(145deg,var(--accent-soft),var(--glass))!important}.guard-card h3{font-size:18px;margin-top:17px;line-height:1.6}.guard-card ul{list-style:none;padding:0;margin:20px 0 0;display:flex;flex-direction:column;gap:21px}.guard-card li{display:flex;flex-direction:column;gap:6px}.guard-card li strong{font-size:12px;font-weight:600}.guard-card li span{font-size:11px;color:var(--muted);line-height:1.85}.aside-note{display:flex;gap:10px;padding:25px 12px;color:var(--muted);font-size:11px;line-height:1.9}.aside-note>svg{margin-top:2px}.activity-layout{display:grid;grid-template-columns:1.15fr 1fr;gap:22px}.activity-layout h2{font-size:18px;margin-bottom:20px}.log-row{display:flex;align-items:flex-start;gap:12px;padding:17px 0;border-top:1px solid var(--border)}.log-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:7px}.log-dot.warning{background:var(--warm)}.log-row p{font-size:12px}.log-row time{font-size:10px;color:var(--muted);display:block;margin-top:5px}.task-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 0;border-bottom:1px solid var(--border)}.task-row strong{font-size:12px;font-weight:500;margin-right:10px}.task-row span{font-size:10px;color:var(--muted)}.task-row p{font-size:11px;color:var(--error);margin-top:5px;overflow-wrap:anywhere}.muted-text{font-size:12px;color:var(--muted);line-height:1.8}.alert{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 15px;border:1px solid var(--border);border-radius:12px;font-size:12px;margin-bottom:16px;overflow-wrap:anywhere}.alert.error{color:var(--error);background:color-mix(in srgb,var(--error) 6%,var(--surface))}.alert.warning{color:var(--warm);background:color-mix(in srgb,var(--warm) 6%,var(--surface))}.working{position:fixed;bottom:22px;left:50%;transform:translate(-50%);z-index:15;background:var(--text);color:var(--bg);padding:13px 21px;border-radius:99px;display:flex;align-items:center;gap:10px;font-size:12px;box-shadow:0 6px 24px #0002}.spinner{display:inline-block;width:14px;height:14px;border:1.5px solid currentColor;border-right-color:transparent;border-radius:50%;animation:zg-spin .7s linear infinite}.toast{position:fixed;bottom:24px;left:50%;transform:translate(-50%);z-index:16;padding:14px 23px;border-radius:99px;display:flex;align-items:center;gap:10px;color:var(--accent);font-size:12px;max-width:calc(100vw - 32px)}.icon-button{min-width:36px;min-height:36px;display:inline-grid;place-items:center;border-radius:10px}.icon-button:hover{background:var(--accent-soft)}.zg-dialog{color:var(--text);padding:0;width:min(680px,calc(100vw - 32px));max-height:85vh;border-radius:25px;overflow:auto;overscroll-behavior:contain;background:color-mix(in srgb,var(--surface) 95%,transparent)!important}.zg-dialog::backdrop{background:#0b221b66;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px)}.dialog-close{position:absolute;right:16px;top:16px;z-index:2;background:var(--glass)!important}.detail-top{display:flex;gap:24px;align-items:center;padding:31px 50px 28px 30px;background:linear-gradient(120deg,var(--accent-soft),transparent)}.detail-poster{width:98px;height:146px;flex-shrink:0;background:var(--accent-soft);border-radius:10px;overflow:hidden;box-shadow:0 7px 18px #0002}.detail-poster img{width:100%;height:100%;object-fit:cover}.detail-top h2{font-size:25px;line-height:1.45;margin:9px 0 4px}.detail-top .original-title{font-size:11px;color:var(--muted)}.detail-rating{display:flex;align-items:center;gap:6px;margin:11px 0;color:var(--warm);font-weight:600;font-size:14px}.detail-rating>span{font-size:10px;color:var(--muted);font-weight:400;margin-left:6px}.detail-top a{display:inline-flex;align-items:center;gap:6px;font-size:11px;min-height:34px}.dialog-body{padding:26px 30px}.dialog-body h3{margin-bottom:6px}.synopsis{font-size:12px;color:var(--muted);line-height:1.9;margin-bottom:23px!important;max-height:110px;overflow:auto;white-space:pre-line}.match-search{display:flex;gap:10px;margin:17px 0}.match-search input{flex:1}.match-list{display:flex;flex-direction:column;gap:8px;max-height:245px;overflow:auto;padding:3px;margin:0 -3px 20px}.match-option{display:flex;align-items:center;gap:12px;padding:14px 12px;text-align:left;border:1px solid var(--border)!important;border-radius:12px;background:var(--surface)!important}.match-option.selected{border-color:var(--accent)!important;background:var(--accent-soft)!important}.match-option>span:nth-child(2){flex:1}.match-option strong{font-size:12px;font-weight:550;display:block}.match-option small{display:block;font-size:10px;color:var(--muted);margin-top:4px}.radio-dot{width:15px;height:15px;border:1px solid var(--muted);border-radius:50%;flex-shrink:0}.selected>.radio-dot{border:4px solid var(--accent);background:var(--surface)}.target-note{display:flex;align-items:center;gap:10px;border-radius:12px;background:var(--accent-soft);padding:14px 16px;font-size:11px;color:var(--accent);margin-top:15px}.target-note strong{display:block;font-size:13px;font-weight:550}.target-note>span:last-child{margin-left:auto}.dialog-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:24px}.dialog-working{font-size:12px;color:var(--accent);display:flex;align-items:center;gap:10px;margin-bottom:18px}.stop-dialog{padding:42px 30px}.stop-dialog h2{margin:14px 0;font-size:24px}.stop-dialog p{font-size:13px;color:var(--muted);line-height:1.9}.zg-app[data-theme=dark] .hero{background:radial-gradient(ellipse at 68% 16%,#2b5143,transparent 50%),linear-gradient(115deg,#233c34,#203e37 57%,#263b36)}.zg-app[data-theme=dark] .hero h1{color:#e2ece3}.zg-app[data-theme=dark] .hero h1 span{color:#aae1c7}.zg-app[data-theme=dark] .hero p,.zg-app[data-theme=dark] .hero-foot{color:#b1c8bb}.zg-app[data-theme=dark] .art-glass{background:linear-gradient(145deg,#a0d6bd88,#ffffff08);color:#e4f5df;border-color:#ffffff40}.zg-app[data-theme=dark] .art-orbit{border-color:#ffffff28}.zg-app[data-theme=dark] .art-chip{color:var(--text)}.zg-app .cover-image{display:block;width:100%;height:100%;position:relative;overflow:hidden}.zg-app .cover-image img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}.zg-app .poster>.cover-image{position:absolute;top:0;right:0;bottom:0;left:0}.zg-app .poster:hover .cover-image img{transform:scale(1.035)}.zg-app img[hidden]{display:none}.zg-app .mini-poster,.zg-app .detail-poster{position:relative}.zg-app .sub-actions{display:flex;flex-wrap:wrap;gap:6px}.zg-app .button.primary:hover:not(:disabled){background:color-mix(in srgb,var(--accent) 85%,#000)!important;color:#fff}.zg-app[data-theme=dark] .button.primary:hover:not(:disabled){background:color-mix(in srgb,var(--accent) 85%,#fff)!important;color:#173930}@keyframes zg-spin{to{transform:rotate(360deg)}}@media(min-width:1600px){.zg-main{padding:0 60px}.hero{min-height:360px;grid-template-columns:1fr 1fr 300px;padding:40px 50px}.hero h1{font-size:48px}.poster-grid{grid-template-columns:repeat(7,minmax(0,1fr))}}@media(max-width:1220px){.zg-main{padding:0 27px}.hero{grid-template-columns:1fr .7fr 220px;padding:28px}.hero h1{font-size:36px}.hero-art{min-width:80px}.art-glass{width:118px;height:175px}.art-orbit{transform:scale(.8)}.orbit-b{transform:scale(.8) rotate(35deg)}.art-chip{left:-10px;font-size:9px;padding:8px 10px}.hero-summary{padding:20px 18px}.source-tabs button{padding:9px 11px;font-size:11px}.search-box{max-width:260px}.poster-grid{grid-template-columns:repeat(5,minmax(0,1fr));gap:24px 17px}.header-caption{display:none}.settings-layout{grid-template-columns:minmax(0,1fr) 250px;gap:20px}.settings-card,.guard-card{padding:22px}}@media(max-width:1000px){.zg-shell{grid-template-columns:76px minmax(0,1fr)}.zg-rail{padding:27px 7px}.zg-rail nav button{font-size:10px}.zg-main{padding:0 24px}.hero{grid-template-columns:1fr 230px;min-height:315px}.hero-art{display:none}.hero-summary{align-self:center}.hero h1{font-size:38px}.discovery-toolbar{flex-wrap:wrap}.search-box{max-width:none;flex:1;min-width:190px}.source-tabs{flex-wrap:wrap}.poster-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:23px 16px}.settings-layout{grid-template-columns:minmax(0,1fr)}.settings-aside{display:none}.activity-layout{grid-template-columns:minmax(0,1fr)}.catalog-footer{font-size:9px}.subscription-row{gap:13px}.sub-actions .button{padding:8px 10px}.state-pill{font-size:9px}.zg-header{min-height:90px}}@media(max-width:700px){.zg-shell{display:block;min-height:100vh;padding-bottom:76px}.zg-rail{position:fixed;top:auto;left:12px;right:12px;bottom:max(10px,env(safe-area-inset-bottom));width:auto;height:64px;max-height:none;border-radius:23px;padding:3px 7px;border:1px solid var(--glass-edge)!important;box-shadow:0 5px 28px #17392a28;z-index:20}.zg-mark,.rail-bottom{display:none}.zg-rail nav{flex-direction:row;justify-content:space-around;gap:0;margin:0;height:100%}.zg-rail nav button{min-height:52px;width:25%;border-radius:17px;font-size:9px;gap:3px;padding:5px}.zg-rail nav button svg{width:20px;height:20px}.zg-rail nav button.active{background:var(--accent-soft)}.zg-main{padding:0 19px}.zg-header{min-height:78px;gap:10px}.brand strong{font-size:21px;display:block;line-height:1.2}.brand strong span{display:block;font-size:6px;letter-spacing:2.1px;margin-top:5px}.brand-divider{display:none}.instance-pill{padding:0 11px;gap:7px;min-height:37px;font-size:10px;max-width:175px}.instance-pill span:nth-child(2){max-width:115px}.hero{padding:25px;grid-template-columns:1fr;gap:24px;border-radius:23px;min-height:0}.hero h1{font-size:34px;margin-top:12px;line-height:1.4}.hero-copy p{font-size:11px}.hero-foot{display:none}.hero-summary{position:absolute;right:22px;bottom:27px;width:142px;padding:14px;margin:0;border-radius:16px}.summary-top{font-size:9px;gap:5px}.summary-top svg{width:13px;height:13px}.live-label{display:none}.summary-count{font-size:32px;margin-top:7px}.summary-count span{font-size:11px;margin-left:6px}.summary-bottom{font-size:8px;margin-top:6px;gap:2px}.summary-bottom button{width:21px;height:25px}.capacity{margin-top:6px;height:3px}.hero p{max-width:170px}.hero-copy{padding-bottom:102px}.hero-summary{bottom:23px;left:24px;width:calc(100% - 48px);padding:13px 17px;display:grid;grid-template-columns:1fr auto;gap:0 12px;align-items:center}.summary-top{font-size:10px}.summary-count{grid-row:1/3;grid-column:2;font-size:31px;margin:0;line-height:1.1}.summary-count span{font-size:12px}.capacity{grid-column:1;grid-row:2;margin-top:8px}.summary-bottom{grid-column:1/3;grid-row:3;font-size:9px;margin-top:3px;height:22px}.hero-art{display:grid;position:absolute;right:14px;top:28px;width:110px;height:155px;opacity:.7}.art-glass{width:81px;height:125px;padding:12px;border-radius:13px}.art-glass>span{font-size:7px}.art-glass small{font-size:4px;letter-spacing:.9px}.art-glass svg{width:35px;height:35px}.art-orbit{width:130px;height:130px}.orbit-b{width:110px;height:155px}.orbit-c{width:98px;height:98px;border-width:5px}.art-chip{display:none}.discovery{margin-top:27px}.section-heading{margin-bottom:16px;gap:10px}.section-heading h2{font-size:21px}.section-heading .eyebrow{font-size:7px;letter-spacing:1.2px}.button{min-height:42px;padding:9px 12px;font-size:11px!important;border-radius:11px}.discovery-toolbar{gap:11px;display:block}.source-tabs{width:100%;justify-content:space-between;border-radius:14px;padding:4px;gap:0;flex-wrap:nowrap;overflow:auto}.source-tabs button{padding:9px 8px;font-size:10px;min-height:37px;gap:5px;border-radius:10px;flex:1}.source-tabs .source-dot{width:4px;height:4px}.search-box{margin-top:13px;width:100%;min-height:44px}.search-box input{font-size:12px}.search-box select{font-size:11px}.search-box button{min-width:40px;min-height:42px}.list-meta{min-height:58px;font-size:9px;flex-wrap:wrap;gap:2px}.days{gap:0}.days button{min-width:36px;padding:5px 8px;min-height:44px;font-size:10px}.poster-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:21px 12px}.poster{border-radius:9px!important}.poster-top{top:6px;left:6px;right:6px;gap:2px}.source-tag{font-size:7px;padding:3px 4px}.rating{font-size:8px;padding:2px 4px;gap:2px}.rating svg{width:9px;height:9px}.poster-action{width:25px;height:25px;right:7px;bottom:7px}.poster-action svg{width:17px;height:17px}.poster-state{font-size:7px;padding:4px;bottom:8px;left:5px;gap:3px}.poster-state svg{width:9px;height:9px}.card-caption{padding-top:9px}.card-caption h3{font-size:11px}.card-caption p{font-size:9px;gap:4px}.catalog-footer{flex-direction:column;gap:8px;padding-top:24px;font-size:9px}.catalog-footer>span:last-child{font-size:8px}.main-footer{font-size:8px;gap:10px;padding:20px 0;margin-top:17px}.main-footer strong{font-size:8px;letter-spacing:.6px}.main-footer strong span{margin:0 3px}.main-footer>span:nth-child(2){display:none}.preview-note{font-size:9px;padding-top:0}.page-title{padding:20px 0 26px}.page-title h1{font-size:29px;letter-spacing:-1px}.page-title p{font-size:12px;line-height:1.8}.stats-row{gap:10px;margin-bottom:22px}.stat{padding:16px 13px;border-radius:17px;gap:9px}.stat>span{font-size:10px}.stat strong{font-size:27px}.stat small{font-size:11px}.subscription-row{flex-wrap:wrap;padding:13px;gap:10px}.mini-poster{width:45px;height:67px}.sub-info h3{font-size:13px}.sub-info p{font-size:10px}.sub-info{flex-basis:calc(100% - 65px)}.state-pill{margin-left:55px}.sub-actions{margin-left:auto}.sub-actions .button{min-height:36px}.settings-card{padding:20px 18px;border-radius:20px}.settings-title{gap:10px}.settings-title h2{font-size:17px}.settings-title p{font-size:10px}.number{width:31px;height:31px;font-size:11px}.form-grid{gap:0 14px}.field{font-size:11px}.field input,.field select{font-size:13px;min-height:45px}.field small{font-size:10px}.feed-choices{gap:7px}.feed-choices label{padding:10px 9px;font-size:10px;gap:6px}.feed-choices input{width:13px;height:13px}.save-row{gap:14px}.inline-note{font-size:10px;line-height:1.8}.working,.toast{bottom:90px;font-size:11px;max-width:calc(100vw - 36px);padding:12px 17px;min-width:150px;justify-content:center}.zg-dialog{width:calc(100vw - 24px);max-height:calc(100dvh - 40px);border-radius:21px}.detail-top{padding:25px 39px 22px 22px;gap:17px}.detail-poster{width:70px;height:105px}.detail-top h2{font-size:19px;letter-spacing:-.3px}.detail-top .eyebrow{font-size:8px;letter-spacing:1px}.detail-top a{font-size:10px}.detail-rating{font-size:12px;margin:8px 0}.dialog-body{padding:23px 21px}.synopsis{font-size:11px}.match-search .button{padding:9px}.dialog-close{right:8px;top:8px}.alert{font-size:11px}.dialog-actions{gap:8px}.dialog-actions .button{min-height:44px}.zg-dialog .target-note{font-size:10px}.task-row{gap:8px}.task-row strong{display:block;margin-bottom:5px}.zg-app .icon-button{min-width:44px;min-height:44px}}@media(max-width:380px){.zg-main{padding:0 15px}.hero{padding:23px}.hero h1{font-size:31px}.hero-art{right:3px;opacity:.5}.source-tabs button{font-size:9px;padding:8px 6px}.poster-grid{gap:18px 10px}.poster-top{left:4px;right:4px}.source-tag{font-size:6px}.poster-state{max-width:62px;overflow:hidden;white-space:nowrap}.section-heading .button{font-size:10px!important;padding:8px}.brand strong{font-size:20px}}@media(prefers-reduced-motion:reduce){.zg-app *,.zg-app *:before,.zg-app *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.zg-app .poster:hover>img{transform:none}}@media(prefers-reduced-transparency:reduce){.zg-app .glass,.zg-app .zg-dialog,.zg-app .source-tag,.zg-app .poster-action{backdrop-filter:none;-webkit-backdrop-filter:none;background:var(--surface)!important}.zg-app .zg-dialog::backdrop{-webkit-backdrop-filter:none;backdrop-filter:none;background:#0b221bcc}}@media(forced-colors:active){.zg-app .glass,.zg-app .poster,.zg-app .button{border:1px solid CanvasText!important}.zg-app .source-tabs button.selected{outline:2px solid Highlight}.zg-app .hero-art{display:none}}';
function up(e, t) {
  var h, y, M, z;
  const s = document.createElement("div");
  s.className = "zg-app";
  const i = document.createElement("style");
  i.textContent = pp;
  const n = document.createElement("div");
  s.append(i, n), e.append(s);
  const o = new AbortController(), r = Tl(cp, { ctx: { ...t, signal: o.signal } });
  s.dataset.theme = ((h = t.theme) == null ? void 0 : h.mode) || "light";
  const l = (y = t.theme) == null ? void 0 : y.subscribe((D) => s.dataset.theme = typeof D == "string" ? D : D.mode);
  r.mount(n);
  let u = !1;
  const m = () => {
    var D;
    u || (u = !0, o.abort(), l == null || l(), r.unmount(), s.remove(), (D = t.signal) == null || D.removeEventListener("abort", m));
  };
  return (M = t.signal) == null || M.addEventListener("abort", m, { once: !0 }), (z = t.signal) != null && z.aborted && m(), m;
}
export {
  up as mount
};
