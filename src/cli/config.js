/**
 * 配置项
 */

import { options } from "./options";

/** 支持的平台 */
export const supportedPlatforms = ["alipay", "baidu", "bytedance"];

/** 内联wxs的生成目录 */
export const genWxsDir = "__mc_transform__/wxs";

/** npm包的生成目录 */
export const genNpmDir = "__mc_transform__/npm";

/** sdk的生成目录 */
export const genSdkDir = "__mc_transform__/sdk";

export const isAlipay = () => options.platform === 'alipay';

/** js全局对象名 */
export const jsApiPrefixes = {
    alipay: 'my',
    baidu: 'swan',
    bytedance: 'tt'
}

/** 样式文件后缀名 */
export const wxssSuffixes = {
    alipay: '.acss',
    baidu: '.css',
    bytedance: '.ttss'
}

/** 模版文件后缀名 */
export const wxmlSuffixes = {
    alipay: '.axml',
    baidu: '.swan',
    bytedance: '.ttml'
}

/** 模版文件指令前缀 */
export const wxmlDirectivePrefixes = {
    baidu: 's-',
    alipay: 'a:',
    bytedance: 'tt:'
}

/** wxs脚本后缀名 */
export const wxsSuffixes = {
    alipay: '.sjs',
    baidu: '.sjs',
    bytedance: '.sjs'
}

/** wxs标签名 */
export const wxsTags = {
    alipay: 'import-sjs',
    baidu: 'import-sjs',
    bytedance: 'sjs'
}