/* ___ @HarryYin __ */
import { unitList } from '../setting'

interface IArrayItem {
  index: number
  value: number
}

/* 获取属性值单位，格式：1px */
export const getUnit = (val: number | string): string => {
  if (typeof val === 'number') { return '' }
  const unit = val.replace(/-?\d+\.?\d*(\D*)/, '$1')
  if (unitList.indexOf(unit) > -1) {
    return unit
  } else {
    console.error('不支持该数值单位：', unit)
  }
  return ''
}

/* 自动补充单位 */
export const getDefaultUnit = (key: string): string => {
  switch (key) {
    case 'translateX':
    case 'translateY':
    case 'translateZ':
    case 'borderRadius':
      return 'px'
    case 'rotate':
    case 'rotateX':
    case 'rotateY':
    case 'rotateZ':
      return 'deg'
    default:
      return ''
  }
}

/* 获取属性值数字，格式：1px */
export const getPureNumber = (val: number | string): number => {
  if (typeof val === 'number') { return val }
  return Number(val.replace(/(-?\d+\.?\d*)\D*/, '$1'))
}

/* 获取样式key，格式：translateX(1px) => translateX */
export const getKeyFromStyle = (style: string): string => {
  return style.replace(/(\D+)\(-?\d+\.?\d*\D*\)/, '$1')
}

/* 获取样式value，格式：translateX(1px) => 1px */
export const getValueFromStyle = (style: string): string => {
  return style.replace(/\D+\((-?\d+\.?\d*\D*)\)/, '$1')
}

/* 获取key值映射的属性列表：scale会拆分为scaleX和scaleY，避免效果叠加 */
export const getKeyList = (key: string): string[] => {
  const list: string[] = []
  switch (key) {
    case 'scale':
      list.push('scaleX')
      list.push('scaleY')
      break
    default:
      list.push(key)
      break
  }
  return list
}

/* 获取数组中最大值下标, -1 未找到 */
export const getMaxFromArray = (list: number[]): IArrayItem => {
  let temp = 0
  let maxIndex = -1
  list.forEach((val, i) => {
    if (val >= temp) {
      temp = val
      maxIndex = i
    }
  })
  return {
    index: maxIndex,
    value: temp
  }
}

/* 获取dom属性现有transform值 */
export const getTransformOriginValue = (dom: HTMLElement, key: string): number | string => {
  const str = dom.style.transform
  let res = key.indexOf('scale') > -1 ? 1 : 0 // 默认值
  let unit = '' // 单位
  if (str) {
    str.split(' ').some((style, index) => {
      if (style.includes(key)) {
        const reg = new RegExp(`${key}\\((-?\\d+\\.?\\d*)(\\D*)\\)`, 'g')
        res = Number(style.replace(reg, '$1'))
        unit = style.replace(reg, '$2')
        return true
      }
      return false
    })
  }
  return key.indexOf('scale') > -1 ? res : res + unit
}
