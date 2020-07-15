import { Anime, IAgileAnimeOptions, IAnimeOptions, TUpdating, TCallback, DirtType } from './src/typings/index'

export default class AgileAnime {
  private target: HTMLElement // 动画操作的dom节点
  public loop?: boolean // 是否循环
  private count: number // 当前播放次数
  public direction?: DirtType // 动画播放的方向：normal 正向，reverse 反向，alternate 奇数次正向 && 偶数次反向

  private animeQueue: Anime[] // 动画序列
  public playing: boolean // 播放状态
  private curAsq: number // 当前播放的动画序号：从1开始的整数，0 没有播放动画
  private begin?: TCallback // 动画开始回调
  private update?: TUpdating // 动画每帧回调
  private complete?: TCallback // 动画完成回调

  constructor(options: IAgileAnimeOptions) // 构造函数

  animator(options: IAnimeOptions): AgileAnime // 创建一个动画节点

  play(): Promise<void> // 播放动画

  pause(): void // 暂停动画

  stop(): void // 停止动画
}