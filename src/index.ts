/* ___ @HarryYin __ */

import './lib/polyfill'
import Anime from './children/anime'
import { IAgileAnimeOptions, IAnimeOptions, DirtType, TCallback, TUpdating } from './typings/index'

export default class AgileAnime {
  private targets: HTMLElement[] = []// 动画操作的dom节点列表
  public loop?: boolean | number = false // 是否循环
  private count: number = 0 // 当前播放次数
  public direction?: DirtType = 'normal' // 动画播放的方向：normal 正向，reverse 反向，alternate 奇数次正向 && 偶数次反向

  private animeQueue: Anime[] = [] // 动画序列
  public playing: boolean = false // 播放状态
  private curAsq: number = 0 // 当前播放的动画序号：从1开始的整数，0 没有播放动画
  private begin?: TCallback // 动画开始回调
  private update?: TUpdating // 动画每帧回调
  private complete?: TCallback // 动画完成回调

  constructor (
    {target, loop, direction, begin, update, complete}: IAgileAnimeOptions) {

    if (Array.isArray(target)) {
      target.forEach((ele: HTMLElement | string) => {
        this.initTarget(ele)
      })
    } else {
      this.initTarget(target)
    }

    this.loop = loop || false
    this.direction = direction || 'normal'
    this.begin = begin
    this.update = update
    this.complete = complete
  }

  /* 初始化dom数组 */
  private initTarget (target: HTMLElement | string) {
    if (typeof target === 'string' && document.querySelector(target)) {
      this.targets.push(document.querySelector(target) as HTMLElement)
    } else if (typeof target === 'object' && target.nodeType === 1) {
      this.targets.push(target)
    } else {
      console.error('target不合法！~')
      return
    }
  }

  /* 创造一个动画节点 */
  public animator ({duration, properties, ease, delay}: IAnimeOptions): AgileAnime {
    const sq: number = this.animeQueue.length + 1
    const anime: Anime = new Anime(
    sq, this.targets, duration, properties,
    ease, delay, this.update)
    this.animeQueue.push(anime)
    return this
  }

  /* 播放动画 */
  public async play () {
    try {
      if (!this.targets || this.targets.length === 0) {
        console.error('target不能为空!!!')
        return
      }
      // 暂停状态不计数
      if (this.curAsq <= 0) {
        this.count++
        // 动画开始时回调
        this.begin && this.begin(this.count)
      }
      this.playing = true
      // 初始化curAsq（当前播放的动画序号）
      if (this.curAsq <= 0) {
        this.curAsq = (this.direction === 'alternate' && this.count % 2 === 0) ||
        this.direction === 'reverse' ? this.animeQueue.length - 1 : 0
      }
      // 播放完整动画
      switch (this.direction) {
        case 'reverse':
          await this.playReverse()
          break
        case 'alternate':
          if (this.count % 2 === 0) {
            await this.playReverse()
          } else {
            await this.playNormal()
          }
          break
        case 'normal':
        default:
          await this.playNormal()
      }
      // 完整动画播放结束
      this.curAsq = 0
      // 动画完成时回调
      this.complete && this.complete(this.count)
      if ((typeof this.loop === 'boolean' && this.loop)
      || (typeof this.loop === 'number' && this.loop > this.count)) {
        this.resetNode()
        this.play()
      } else {
        this.playing = false
      }
    } catch (e) {
      console.error(e)
    }
  }

  /* 正序播放动画 */
  private async playNormal () {
    for (const i in this.animeQueue) {
      if (this.animeQueue[i]) {
        const anime = this.animeQueue[i]
        anime.total = this.animeQueue.length
        // 暂停后搜索继续播放的动画序号
        if (anime.sequence === this.curAsq) {
          anime.paused = false
        }
        if (anime.sequence >= this.curAsq) {
          this.curAsq = anime.sequence
          await anime.play()
        }
      }
    }
  }

  /* 倒序播放动画 */
  private async playReverse () {
    for (let i = this.animeQueue.length - 1; i >= 0; i--) {
      const anime = this.animeQueue[i]
      anime.total = this.animeQueue.length
      // 暂停后搜索继续播放的动画序号
      if (anime && anime.sequence === this.curAsq) {
        anime.paused = false
      }
      if (anime && anime.sequence <= this.curAsq) {
        this.curAsq = anime.sequence
        await anime.play()
      }
    }
  }

  /* 暂停动画 */
  public pause () {
    this.playing = false
    this.animeQueue.some((anime) => {
      if (anime.sequence === this.curAsq) {
        anime.pause()
        return true
      }
      return false
    })
  }

  /* 停止动画 */
  public stop () {
    this.animeQueue.forEach((anime) => {
      if (anime.sequence === this.curAsq) {
        anime.stop()
        this.curAsq = 0
        this.playing = false
        this.count = 0
        this.resetNode()
      }
      anime.paused = false
      anime.pausedStart = 0
    })
  }

  /* 重置targets样式 */
  private resetNode () {
    this.targets.forEach((dom, index) => {
      dom.style.transform = ''
    })
  }
}
