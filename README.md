# 动画库介绍

**AgileAnime.js** 是一款轻量级且功能强大的Javascript动画库插件，开发人员可以通过此插件控制dom对象动态改变CSS3属性，制作出各种富有创意、高性能、可交互的动画效果。

## 安装方法
```
npm install -S agile-anime
```

## 基本用法
### 1. 引入AgileAnime
```
import AgileAnime from 'agile-anime'
```
### 2. 初始化
```
const dom = document.querySelector('#app #ball1')
const anime1 = new AgileAnime({
  target: dom
})
```
### 3. 链式创建动画帧
```
anime1
.animator({
  duration: 500,
  properties: {
    translateX: 0,
    translateY: 0
  }
})
.animator({
  duration: 500,
  properties: {
    translateX: 160,
    translateY: 0
  }
})
.animator({
  duration: 500,
  properties: {
    translateX: 160,
    translateY: 160
  }
})
.animator({
  duration: 500,
  properties: {
    translateX: 0,
    translateY: 160
  }
})
.animator({
  duration: 500,
  properties: {
    translateX: 0,
    translateY: 0
  }
})
```
### 4. 播放动画
```
anime1.play()
```

## 高级用法[教程](https://agileui.harryyin.cn/#/anime)
包括参数配置、支持多种动画属性、如何控制动画流程、动画执行回调、添加缓动特效等。

## 兼容性
兼容Chrome、Firefox、Safari、IE10+。
