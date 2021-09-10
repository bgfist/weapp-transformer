

swan.loadFontFace = function () {
  throw new Error('平台暂无此api， 请自行适配')
}

swan.nextTick = function (cb) {
  setTimeout(cb)
}

// 加这一行是百度只识别有导出的模块
module.exports = {}