/* ___ @HarryYin __ */

import { transformList, propsList } from '../setting'
import Tween from '../lib/tween'
import { IAnimeNode, TUpdating, ITween, NumberGenerator, TweenFunction, IColorCache } from '../typings'
import { getCssEaseFunction } from '../lib/css-ease'
import { formatColor, getColorValues } from '../lib/colors'
import {
  getDefaultUnit,
  getUnit,
  getPureNumber,
  getKeyFromStyle,
  getValueFromStyle,
  getKeyList,
  getMaxFromArray,
  getTransformOriginValue
} from '../lib/utils'

export default class Anime {
  public sequence: number = 0 // 动画序号
  public total: number = 0 // 动画总阶段数
  private targets: HTMLElement[] = [] // 动画操作的dom节点
  private duration: number[] = [] // 每个元素动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number[] = [] // 每个元素动画延时开始(毫秒)
  private ease: string = '' // 动画时间函数
  public paused: boolean = false // 暂停动画
  public pausedStart: number = 0 // 暂停起始时间点
  private aId: number = 0 // requestAnimationFrame标示符
  private update?: TUpdating // 动画每帧回调
  private curPercent: number = 0 // 动画执行进度（百分比）

  // 初始化样式节点
  private startNode: IAnimeNode[] = []
  // transform变换（记录dom实时样式值）
  private translateX: number[] | string[] = []
  private translateY: number[] | string[] = []
  private translateZ: number[] | string[] = []
  private scaleX: number[] = []
  private scaleY: number[] = []
  private rotate: number[] | string[] = []
  private rotateX: number[] | string[] = []
  private rotateY: number[] | string[] = []
  private rotateZ: number[] | string[] = []
  // 其他可变化属性
  private opacity: number[] = []
  private borderRadius: number[] | string[] = []
  private color: string[] = []
  private backgroundColor: string[] = []
  // 颜色值缓存：0 初始颜色数组[R, G, B, A]，1 目的颜色数组[R, G, B, A]
  private colorCache: IColorCache[] = []
  private backgroundColorCache: IColorCache[] = []

  constructor (
    sequence: number,
    targets: HTMLElement[],
    duration: number | NumberGenerator, properties: IAnimeNode,
    ease?: string, delay?: number | NumberGenerator,
    update?: TUpdating) {

    this.sequence = sequence
    this.targets = targets
    if (duration) {
      this.initTime(duration, this.duration)
    }
    this.properties = properties
    // 缓存格式化后的目的背景颜色值
    if (this.properties.backgroundColor && this.targets) {
      this.initColorCache('backgroundColor', this.backgroundColorCache)
    }
    // 缓存格式化后的目的文字颜色值
    if (this.properties.color && this.targets) {
      this.initColorCache('color', this.colorCache)
    }
    if (delay) {
      this.initTime(delay, this.delay)
    }
    this.ease = ease || 'linear'
    this.update = update
  }

  /* 初始化时间值：delay、duration */
  private initTime (time: number | NumberGenerator, list: number[]): void {
    if (typeof time === 'function') {
      this.targets.forEach((target, tindex) => {
        const num = time(target, tindex)
        list.push(num)
      })
    } else if (typeof time === 'number') {
      this.targets.forEach((target, tindex) => {
        list.push(time)
      })
    }
  }

  /* 初始化目的颜色值缓存 */
  private initColorCache (key: string, list: IColorCache[]): void {
    this.targets.forEach((target, tindex) => {
      const self: Anime = this
      const formatColors = formatColor(this.properties[key])
      list.push({
        end: getColorValues(formatColors)
      })
    })
  }

  /* 初始化dom样式属性值缓存 */
  private initStartNode (): void {
    this.startNode = []
    this.targets.forEach((target, tindex) => {
      const self: any = this
      const transformStr: string = target.style.transform || ''
      self.startNode.push({})

      // 从现有行内样式初始化transform
      if (transformStr) {
        transformStr.split(' ').forEach((style) => {
          const key: string = getKeyFromStyle(style)
          if (style && transformList.includes(key)) {
            const val: string = getValueFromStyle(style)
            const keylist = getKeyList(key)
            keylist.forEach((kitem) => {
              self[kitem].splice(tindex, 1, val)
              self.startNode[tindex][kitem] = self[kitem][tindex]
            })
          } else {
            console.error('不支持该样式修改：', key)
          }
        })
      }

      // 从现有行内样式初始化其他样式属性
      propsList.forEach((pkey) => {
        switch (pkey) {
          case 'opacity':
          case 'borderRadius':
          const val1: string | null = getComputedStyle(target)[pkey]
          if (val1 && self[pkey] && self.properties[pkey]) {
            self[pkey].splice(tindex, 1, val1)
            self.startNode[tindex][pkey] = self[pkey][tindex]
          }
          break
          case 'color':
          case 'backgroundColor':
          // 更新颜色值
          let val2: string | null = getComputedStyle(target)[pkey]
          if (val2 && self[pkey] && self.properties[pkey]) {
            val2 = formatColor(val2)
            self[`${pkey}Cache`][tindex].start = getColorValues(val2)
            self[pkey].splice(tindex, 1, val2)
            self.startNode[tindex][pkey] = self[pkey][tindex]
          }
          break
        }
      })

      // 为没有inline样式的属性设置默认值
      Object.keys(self.properties).forEach((key) => {
        const keylist = getKeyList(key)
        keylist.forEach((kitem) => {
          if ((propsList.includes(kitem) || transformList.includes(kitem))
          && self.startNode[tindex][kitem] === undefined) {
            let initV: number | string = 0
            if (kitem.toLowerCase().indexOf('color') > -1) {
              initV = 'rgba(0, 0, 0, 0)'
              self[`${kitem}Cache`][tindex].start = [0, 0, 0, 0]
            } else if (['scaleX', 'scaleY', 'opacity'].includes(kitem)) {
              initV = 1
            }
            self[kitem].splice(tindex, 1, initV)
            self.startNode[tindex][kitem] = self[kitem][tindex]
          }
        })
      })
    })
  }

  /* 播放动画 */
  public play (): Promise<Anime>|null {
    const self: Anime = this

    if (!self.targets || self.targets.length === 0) {
      console.error('target不能为空')
      return null
    }

    return new Promise((resolve, reject) => {
      let startTime: number = 0 // 动画开始时间点
      let pausedTime: number = 0 // 暂停时长
      // 缓动算法函数
      const tweenEasing = self.distinguishEase(self.ease)
      const easing = getCssEaseFunction(self.ease)

      function step (timestamp: number) {
        startTime = startTime || timestamp

        if (self.paused) {
          // 暂停动画，计算暂停时长
          pausedTime = timestamp - self.pausedStart
        } else {
          // 目前运动经过的时长
          const passed = (timestamp - pausedTime) - startTime

          let totalP = 0

          // 更新每个dom
          self.targets.forEach((target, tindex) => {
            // 缓动因子
            const subDelay = self.delay[tindex] || 0
            const subDuration = self.duration[tindex] || 0
            const subPassed = passed > subDelay ? passed - subDelay : 0
            let p: number = subPassed ? Math.min(1.0, subPassed / subDuration) : 0
            p = typeof tweenEasing === 'undefined' && easing ? easing(p) : p
            totalP += p

            // 利用缓动因子和算法更新dom
            self.updateProperties(
              tindex,
              subPassed > subDuration ? subDuration : subPassed,
              p, tweenEasing)
          })

          totalP /= self.targets.length
          self.curPercent = Math.floor(100 * (totalP + self.sequence - 1) / self.total)

          // 计算总动画时长
          let totalTime = getMaxFromArray(self.duration).value || 0
          const maxDelayIndex = getMaxFromArray(self.delay).index
          if (maxDelayIndex > -1) {
            const maxDelay = self.delay[maxDelayIndex] || 0
            totalTime = self.duration[maxDelayIndex] + maxDelay
          }

          if (totalP >= 1.0 && passed > totalTime) {
            resolve(self)
          } else {
            self.aId = requestAnimationFrame(step)
          }
        }

        // 动画更新每一帧时回调
        self.update && self.update({ sq: self.sequence, percent: self.curPercent })
      }

      self.initStartNode()
      self.aId = requestAnimationFrame(step)
    })
  }

  /* 暂停动画 */
  public pause (): void {
    this.paused = true
    this.pausedStart = Date.now()
  }

  /* 停止动画 */
  public stop (): void {
    cancelAnimationFrame(this.aId)
  }

  /* 获取tween算法函数 */
  private distinguishEase (ease: string): TweenFunction | undefined {
    return (Tween as ITween)[ease] || undefined
  }

  /* 更新属性 */
  private updateProperties (
    tindex: number, ts: number, percent: number,
    easing?: TweenFunction): void {

    for (const key of Object.keys(this.properties)) {
      const propV = this.properties[key]
      if (transformList.includes(key) && propV !== undefined) {
        // 更新transform
        this.updateTransform(tindex, ts, key, propV, percent, easing)
      } else if (propsList.includes(key) && propV !== undefined) {
        // 更新其他属性
        switch (key) {
          case 'opacity':
          case 'borderRadius':
          this.updateOtherProps(tindex, ts, key, propV, percent, easing)
          break
          case 'color':
          case 'backgroundColor':
          this.updateColors(tindex, ts, key, propV, percent, easing)
          break
        }
      } else {
        console.error('不支持该样式修改：', key)
      }
    }

    this.updateDomStyle(tindex)
  }

  /* 更新transform变化 */
  private updateTransform (
    tindex: number, ts: number, key: string, val: number |  string, percent: number,
    easing?: TweenFunction): void {

    // 获取key值映射的属性列表
    const keylist = getKeyList(key)
    keylist.forEach((kitem) => {
      this.updatePropsVal(true, tindex, ts, kitem, val, percent, easing)
    })
  }

  /* 更新opacity、border-radius等属性变化 */
  private updateOtherProps (
    tindex: number, ts: number, key: string, val: number, percent: number,
    easing?: TweenFunction): void {

    this.updatePropsVal(false, tindex, ts, key, val, percent, easing)
  }

  /* 更新backgroundColor、color属性变化 */
  private updateColors (
    tindex: number, ts: number, key: string, val: string, percent: number,
    easing?: TweenFunction): void {
    const self: any = this

    // 若变化属性不存在于startNode，则补充默认值
    const startnode = self.startNode[tindex]
    if (!startnode || !startnode[key]) {
      startnode[key] = 'rgba(0, 0, 0, 0)'
    }

    const curVal = formatColor(self[key][tindex])
    if (curVal !== undefined && curVal !== formatColor(val)) {
      // 未达到目标值时
      const colorCache: IColorCache = self[`${key}Cache`][tindex]
      const startColors = colorCache.start
      const endColors = colorCache.end
      if (endColors && startColors) {
        let colorsStr = ''
        endColors.forEach((endColor, cindex) => {
          colorsStr += cindex === 0 ? 'rgba(' : ''
          // 根据缓动因子计算属性值
          const num = easing ?
          easing(ts, startColors[cindex], endColor - startColors[cindex], self.duration[tindex]) :
          self.getCurrentValue(startColors[cindex], endColor, percent)
          // 更新属性值
          colorsStr += cindex > 2 ? num.toFixed(1) : Math.floor(num)
          colorsStr += cindex === endColors.length - 1 ? ')' : ', '
        })
        self[key][tindex] = colorsStr
      }
    } else {
      // 已达到目标值时
      self[key][tindex] = self.targets[tindex].style[key]
    }
  }

  /* 更新属性值 */
  private updatePropsVal (
    transform: boolean, tindex: number, ts: number, key: string, val: number |  string, percent: number,
    easing?: TweenFunction): void {
    const self: any = this

    // 若变化属性不存在于startNode，则补充默认值
    const startnode = self.startNode[tindex]
    if (!startnode || !startnode[key]) {
      startnode[key] = ['scale', 'opacity'].includes(key) ? 1 : 0 // 默认值
    }

    // 计算获取实时样式value
    const pureV = typeof val === 'string' ? getPureNumber(val) : val
    let unit = getUnit(val)
    if (typeof val === 'number' && !unit) {
      unit = getDefaultUnit(key)
    }

    const curVal = typeof self[key][tindex] === 'string'
    ? getPureNumber(self[key][tindex])
    : self[key][tindex]

    if (curVal !== undefined && curVal !== pureV) {
      // 未达到目标值时
      const starV = getPureNumber(self.startNode[tindex][key])
      // 根据缓动因子计算属性值
      const num = easing ?
      easing(ts, starV, pureV - starV, self.duration[tindex]) :
      self.getCurrentValue(starV, pureV, percent)
      // 更新属性值
      self[key][tindex] = num.toFixed(2) + unit
    } else {
      // 已达到目标值时
      self[key][tindex] = transform
      ? getTransformOriginValue(self.targets[tindex], key)
      : self.targets[tindex].style[key]
    }
  }

  /* 更新dom样式 */
  private updateDomStyle (tindex: number): void {
    const self: any = this
    const target = this.targets[tindex]

    if (self.startNode[tindex]) {
      const skeyList = Object.keys(self.startNode[tindex])
      let transformStr = ''
      skeyList.forEach((skey, sindex) => {
        if (transformList.includes(skey)) {
          transformStr += self.getTransformStr(tindex, skey)
          if (sindex < skeyList.length - 1) {
            transformStr += ' '
          }
        } else if (propsList.includes(skey)) {
          switch (skey) {
            case 'opacity':
            case 'borderRadius':
            case 'backgroundColor':
            case 'color':
              target.style[skey] = self[skey][tindex]
              break
          }
        }
      })

      target.style.transform = transformStr
    }
  }

  /* 获取transform样式字符串 */
  private getTransformStr (tindex: number, key: string): string {
    return `${key}(${(this as any)[key][tindex]})`
  }

  /* 根据缓动因子计算属性当前值 */
  private getCurrentValue (start: number, val: number, p: number): number {
    return val >= start ? start + (val - start) * p : start - (start - val) * p
  }
}
