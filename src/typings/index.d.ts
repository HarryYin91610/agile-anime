type DirtType = 'normal' | 'reverse' | 'alternate'
type TargetType = HTMLElement | HTMLElement[] | string | string[]
type TCallback = (count: number) => void
type TUpdating = ({sq, percent}: IUpdateOptions) => void
type NumberGenerator = (el: HTMLElement, i: number) => number
type TweenFunction = (t: number, b: number, c: number, d: number, s?: number, a?: number, p?: number) => number

interface IColorCache {
  start?: number[]
  end?: number[]
}

interface IAgileAnimeOptions {
  target: TargetType
  loop?: boolean | number
  direction?: DirtType
  begin?: TCallback
  update?: TUpdating
  complete?: TCallback
}

interface IAnimeOptions {
  duration: number | NumberGenerator
  properties: IAnimeNode
  ease?: string
  delay?: number | NumberGenerator
}

interface IAnimeNode {
  translateX?: number | string
  translateY?: number | string
  translateZ?: number | string
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number | string
  rotateX?: number | string
  rotateY?: number | string
  rotateZ?: number | string
  opacity?: number
  color?: string
  backgroundColor?: string
  [propName: string]: any
}

interface IUpdateOptions {
  sq: number
  percent: number
}

interface ITween {
  [propName: string]: TweenFunction
}

export class Anime {
  public sequence: number // 动画序号
  public total: number // 动画总阶段数
  private targets: HTMLElement[] // 动画操作的dom节点
  private duration: number[] // 每个元素动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number[] // 每个元素动画延时开始(毫秒)
  private ease: string // 动画时间函数
  public paused: boolean // 暂停动画
  public pausedStart: number // 暂停起始时间点
  private aId: number // requestAnimationFrame标示符
  private update?: TUpdating // 动画每帧回调
  private curPercent: number // 动画执行进度（百分比）

  // 初始化样式节点
  private startNode: IAnimeNode[]
  // transform变换（记录dom实时样式值）
  private translateX: number[] | string[]
  private translateY: number[] | string[]
  private translateZ: number[] | string[]
  private scaleX: number[]
  private scaleY: number[]
  private rotate: number[] | string[]
  private rotateX: number[] | string[]
  private rotateY: number[] | string[]
  private rotateZ: number[] | string[]
  // 其他可变化属性
  private opacity: number[]
  private borderRadius: number[] | string[]
  private color: string[]
  private backgroundColor: string[]
  // 颜色值缓存：0 初始颜色数组[R, G, B, A]，1 目的颜色数组[R, G, B, A]
  private colorCache: IColorCache[]
  private backgroundColorCache: IColorCache[]

  constructor(sequence: number,
    targets: HTMLElement[],
    duration: number | NumberGenerator, properties: IAnimeNode,
    ease?: string, delay?: number | NumberGenerator,
    update?: TUpdating)

  initStartNode(): void
  play(): Promise<Anime>|null
  pause(): void
  stop(): void

  [propName: string]: any
}

export { 
  IAgileAnimeOptions,
  IAnimeOptions,
  DirtType,
  TargetType,
  NumberGenerator,
  IAnimeNode,
  TCallback,
  TUpdating,
  ITween,
  TweenFunction,
  IColorCache
}
