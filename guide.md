## 转换工具说明

该转换工具的使用场景是将微信小程序的源码转换成其他几个小程序平台的代码。

### 思路：

各端的代码目录结构基本一致，最大的区别就是文件后缀名，标签的指令前缀，全局api对象名不同。
然后是对npm包的支持，考虑到npm包还可以包含自定以组件，而各端支持不一致，故对npm包进行统一的打包和拷贝。

### 实现：

1. 任务处理用的`gulp`

2. 主要是对 `js` `wxs` `wxml` `wxss` `json` 四类文件进行处理，利用各类文件的 `ast` 解析器进行精准转换。
`ast` 处理器都是将源码处理成树状结构(即`ast`)，然后提供一个遍历方法，可以读取并修改节点，然后有一个类似`generator`/`serializer`的东西可以将转换后的`ast`输出成代码。

3. npm打包用的`rollup`, 先读取项目下的package.json文件，从dependencies里读取到要处理的npm模块，然后读取每一个npm模块的package.json文件，根据其是否包含`miniprogram`字段判断其是不是自定义组件的npm包。对于自定义组件npm包，只需拷贝至构建目录，对于普通的npm包，则找到其入口文件，用rollup打包成一个bundle文件。

4. 路径处理：npm包的路径都变了，相对路径也需要规范成以 `./` 开头

5. 支付宝不支持内联sjs脚本，需将内联的脚本抽到一个文件中

6. 对平台相关的后缀做处理，如同时存在 `app.wxss`、`app.alipay.wxss`, 则转换至支付宝平台时，`app.alipay.wxss` 将生效

7. 支付宝的sjs模块只支持es6写法的导入导出，需要babel处理

### `ast`处理器：
* js : `babel`
* wxs: `babel`
* wxml: `cheerio` (内含 `html-parser2`)
* wxss: `postcss`
* json: javascript自带`JSON`

### 目录结构

```
- bin           该npm包的命令行入口       

- dist          examples目录转换成各个平台后的代码

- examples      示例微信小程序项目，供转换测试用

- lib           编译后的代码

- src           源码

    - babel-plugin  一些babel转换的插件

    - cli           命令行工具的具体实现

        - tasks         gulp任务

        - options.js    处理命令行参数

    - sdk           各个平台需要的运行时适配代码

```