export function formatColor (value: string | undefined): string {
  if (!value) { return '' }
  let res: string = ''
  switch (true) {
    case /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value):
      res = hexToRgba(value)
      break
    case /^rgb/.test(value):
      res = rgbToRgba(value)
      break
    case /^hsl/.test(value):
      res = hslToRgba(value)
      break
  }
  if (!res) {
    console.error('颜色格式不正确：' + value)
    return ''
  }
  return res
}

/* 从rgba(255, 255, 255, 1)获取RGBA分量数组 */
export function getColorValues (value: string): number[] {
  const resList: number[] = []
  const seperateList: string[] | null = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d+\.?\d*)\)$/i.exec(value)

  if (seperateList && seperateList.length >= 5) {
    for (let i = 1; i < 5; i++) {
      if (seperateList[i]) {
        resList.push(Number(seperateList[i]))
      } else {
        resList.push(0)
      }
    }
  }
  return resList
}

export function hexToRgba (value: string): string {
  const rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const hex = value.replace(rgx, (m, r, g, b) => r + r + g + g + b + b )
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (rgb) {
    const r = parseInt(rgb[1], 16)
    const g = parseInt(rgb[2], 16)
    const b = parseInt(rgb[3], 16)
    return `rgba(${r},${g},${b},1)`
  }
  return ''
}

export function rgbToRgba (value: string): string {
  if (value.includes('rgba')) { return value }

  return `rgba(${value.replace(/rgb\((\d+,\s*\d+,\s*\d+)\)/, '$1')}, 1)`
}

export function hslToRgba (value: string): string {
  const hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(value) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(value)
  if (!hsl) { return '' }

  const h: number = parseInt(hsl[1], 10) / 360
  const s: number = parseInt(hsl[2], 10) / 100
  const l: number = parseInt(hsl[3], 10) / 100
  const a: number = Number(hsl[4]) || 1

  function hue2rgb (p: number, q: number, t: number) {
    if (t < 0) { t += 1 }
    if (t > 1) { t -= 1 }
    if (t < 1 / 6) { return p + (q - p) * 6 * t }
    if (t < 1 / 2) { return q }
    if (t < 2 / 3) { return p + (q - p) * (2 / 3 - t) * 6 }
    return p
  }

  let r: number
  let g: number
  let b: number
  if (s === 0) {
    r = g = b = l
  } else {
    const q: number = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p: number = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return `rgba(${Math.floor(r * 255)},${Math.floor(g * 255)},${Math.floor(b * 255)},${a.toFixed(1)})`
}
