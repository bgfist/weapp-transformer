## 微信小程序代码转到其他平台的思路

市面上的多端统一开发框架如`taro`、`uni-app`都是利用已有的`dsl`框架，去生成各端对应的代码。

`mc_transformer`:
只做源码级别的转换，不引入任何框架。
因为大多数人最熟悉的还是微信小程序，所以按照微信小程序的原生开发流程开发，既容易一键转换至其他小程序平台，
也容易上手，坑少。

目前的方案是将 `wx.` 后缀的api转换成其他平台对应的方法(正则替换)，文件名后缀也做一下处理。
要做到精准无误的替换当然还是用`ast`解析比较好。

ast. wxs
npm模块自己打包
文件带平台相关的后缀, 文件级
sjs内联转外部模块

### 开始使用

```sh
npm install -D mc_transformer
```

将 src 目录(微信小程序的源码，含project.json) 转成支付宝小程序(默认)：
```sh
mc_transformer src
```
生成的代码在 `dist/alipay` 目录下

指定生成目录：
```sh
# 生成至 build/alipay
mc_transformer src -o build
```

监听文件变化实时编译：
```sh
mc_transformer src --watch
```

转成百度小程序：
```sh
mc_transformer src --platform baidu
```

转成字节跳动小程序：
```sh
mc_transformer src --platform bytedance
```

### 目录结构

`bin/mc_transformer.js`: cli的入口，用gulp处理微信小程序各种后缀的文件，转换至对应平台

`bin/ast_transform.js`: 后期打算用ast来做转换，目前未用到

`alipay`: 给支付宝用的运行时的逻辑，为了统一成微信的写法


## 微信小程序转其他平台小程序注意事项

> 注意，绝大多数不兼容是因为代码书写不规范，建议整理源码而不是让工具来处理

### 通用

1. 图片路径不要加不必要的空格，不然开发者工具会识别不了，如网络资源路径前面不要有空格 `" https://..."` -> `"https://..."`
2. npm自定义组件的问题、小程序插件的问题
3. 鉴权

### 支付宝

平台差异较大，主要是Component构造器写法不同，及事件机制不同。

1. `data-` 属性必须全部转成小写形式，因为微信会自动转，但支付宝不会。如：`data-urlMap` -> `data-urlmap`
2. 注意一些异步api的调用，涉及到`page.js`的加载时机和执行时机。

### 百度

1. `s-for` 与 `s-if` 不能写在同一个标签上
2. 自定义组件属性名应避免以 `prop-` 开头，在处理过程中会将该前缀删除

### 头条

1. beta版本不支持sjs语法，用稳定版（文档有误）
2. 自定义组件只支持属性的监听observer，不支持observers
3. npm模块构建有问题

## TODU

1. wxml标签转换有问题，wx:else，属性的引号问题
2. 支付宝sjs模块语法报错