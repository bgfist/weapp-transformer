# 木仓微信小程序代码转换工具

## 微信小程序代码转到其他平台的思路

市面上的多端统一开发框架如`taro`、`uni-app`都是利用已有的`dsl`框架，去生成各端对应的代码。

`mc_transformer`:
只做源码级别的转换，不引入任何框架。
因为大多数人最熟悉的还是微信小程序，所以按照微信小程序的原生开发流程开发，既容易一键转换至其他小程序平台，
也容易上手，坑少。

[思路说明](./guide.md)

### 开始使用

```sh
npm install -D mc_transformer
```

将 src 目录(微信小程序的源码，含app.json) 转成支付宝小程序：
```sh
mc_transformer src -p alipay
```
生成的代码在 `dist/alipay` 目录下

指定生成目录：
```sh
# 生成至 build/alipay
mc_transformer src -o build -p alipay
```

转成百度小程序：
```sh
mc_transformer src -p baidu
```

转成字节跳动小程序：
```sh
mc_transformer src -p bytedance
```

## 微信小程序转其他平台小程序注意事项

> 注意，绝大多数不兼容是因为代码书写不规范，建议整理源码而不是让工具来处理

### 常见问题

1. 图片路径不要加不必要的空格，不然开发者工具会识别不了，如网络资源路径前面不要有空格 `" https://..."` -> `"https://..."`
2. 小程序插件暂不支持
3. 自定义tabBar暂不支持
4. 鉴权
5. `<view wx:key="">` 会转成 `<view wx:key>`, 这样会报错，所以一定要提供属性值

### 支付宝小程序常见问题

平台差异较大，主要是Component构造器写法不同，及事件机制不同。

1. 组件必须采用component2编译
2. `data-` 属性必须全部转成小写形式，因为微信会自动转，但支付宝不会。如：`data-urlMap` -> `data-urlmap` （mc_transformer也会帮你转）
3. 注意一些异步api的调用，涉及到`page`的加载时机和执行时机。
4. 组件里引用图片资源如果是相对路径，会有bug，建议用绝对路径。
5. props和data里不要有相同的字段名，支付宝不支持
6. 支付宝的组件样式未全局隔离，需要手动隔离

### 百度小程序常见问题

1. `s-for` 与 `s-if` 不能写在同一个标签上
2. 自定义组件属性名应避免以 `prop-` 开头，在处理过程中会将该前缀删除

### 头条小程序常见问题

1. beta版本不支持sjs语法，用稳定版（文档有误）
2. 自定义组件只支持属性的监听observer，不支持observers
3. npm模块构建有问题（mc_transformer会帮你构建）
