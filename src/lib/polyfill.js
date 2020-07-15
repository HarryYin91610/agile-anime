/* ___ @HarryYin __ */

/* 优雅降级
 * 使用 Date.now 获取时间戳性能比使用 new Date().getTime 更高效 */
if (!Date.now) {
  Date.now = function () {
    return new Date().getTime();
  };
}

/* Array.isArray降级处理 */
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object, Array]';
  }
}

(function () {
  "use strict";

  var vendors = ["webkit", "moz"];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vp + "CancelAnimationFrame"] ||
      window[vp + "CancelRequestAnimationFrame"];
  }
  // 上面方法都不支持的情况，以及IOS6的设备
  // 使用 setTimeout 模拟实现
  if (
    /iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
    !window.requestAnimationFrame ||
    !window.cancelAnimationFrame
  ) {
    var lastTime = 0;
    // 和通过时间戳实现节流功能的函数相似
    window.requestAnimationFrame = function(callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      // 实际上第1帧是不准确的，首次nextTime - now = 0
      return setTimeout(function() {
        callback((lastTime = nextTime));
      }, nextTime - now);
    };
    window.cancelAnimationFrame = clearTimeout;
  }
})();
