/* ___ @HarryYin __ */

/* t: current time（当前时间）；
 * b: beginning value（初始值）；
 * c: change in value（变化量）；
 * d: duration（持续时间）。；
 * a: 振幅；
 * p: 周期；
*/
const Elastic = {
  easeIn (t: number, b: number, c: number, d: number, a?: number, p?: number): number {
    let s
    if (t === 0) { return b }
    t /= d
    if (t === 1) { return b + c }
    if (!p) { p = d * 0.3 }
    if (!a || a < Math.abs(c)) {
      s = p / 4
      a = c
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
  },
  easeOut (t: number, b: number, c: number, d: number, a?: number, p?: number): number {
    let s
    if (t === 0) { return b }
    t /= d
    if (t === 1) { return b + c }
    if (!p) { p = d * 0.3 }
    if (!a || a < Math.abs(c)) {
      a = c
      s = p / 4
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b)
  },
  easeInOut (t: number, b: number, c: number, d: number, a?: number, p?: number): number {
    let s
    if (t === 0) { return b }
    t /= d / 2
    if (t === 2) { return b + c }
    if (!p) { p = d * (0.3 * 1.5) }
    if (!a || a < Math.abs(c)) {
      a = c
      s = p / 4
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a)
    }
    if (t < 1) { return -0.5 * (a * Math.pow(2, 10 * (t -= 1 )) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b }
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p ) * 0.5 + c + b
  }
}

const Bounce = {
  easeIn  (t: number, b: number, c: number, d: number): number {
    return c - Bounce.easeOut(d - t, 0, c, d) + b
  },
  easeOut  (t: number, b: number, c: number, d: number): number {
    t /= d
    if ((t) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b
    }
  },
  easeInOut  (t: number, b: number, c: number, d: number): number {
    if (t < d / 2) {
      return Bounce.easeIn(t * 2, 0, c, d) * 0.5 + b
    } else {
      return Bounce.easeOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b
    }
  }
}

const Back = {
  easeIn (t: number, b: number, c: number, d: number, s?: number): number {
    if (!s) { s = 1.70158 }
    return c * (t /= d) * t * ((s + 1) * t - s) + b
  },
  easeOut (t: number, b: number, c: number, d: number, s?: number): number {
    if (!s) { s = 1.70158 }
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
  },
  easeInOut (t: number, b: number, c: number, d: number, s?: number): number {
    if (!s) { s = 1.70158 }
    t /= d / 2
    if (t < 1) { return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b }
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
  }
}

export default {
  elasticEaseIn: Elastic.easeIn,
  elasticEaseOut: Elastic.easeOut,
  elasticEaseInOut: Elastic.easeInOut,
  bounceEaseIn: Bounce.easeIn,
  bounceEaseOut: Bounce.easeOut,
  bounceEaseInOut: Bounce.easeInOut,
  backEaseIn: Back.easeIn,
  backEaseOut: Back.easeOut,
  backEaseInOut: Back.easeInOut
}
