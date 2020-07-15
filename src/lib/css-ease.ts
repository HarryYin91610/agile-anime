import BezierEasing from 'bezier-easing'

/* 获取css timing-function */
export function getCssEaseFunction (ease: string) {
  if (ease.includes('cubic-bezier')) {
    const params = ease.replace(/cubic-bezier\(/g, '').replace(/\)/g, '').split(',')
    if (params.length !== 4) {
      console.error('cubic-bezier参数个数不对！')
      return
    }
    return BezierEasing(Number(params[0]), Number(params[1]), Number(params[2]), Number(params[3]))
  }
  switch (ease) {
    case 'ease-in-out':
      return BezierEasing(0.94, 0.00, 0.34, 1.00)
    case 'ease-in':
      return BezierEasing(0.64, 0.02, 0.64, 0.40)
    case 'ease-out':
      return BezierEasing(0.10, 0.24, 0.25, 0.98)
  }
  return (p: number) => p
}
