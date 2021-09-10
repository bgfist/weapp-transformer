export { name as packageName } from '../../package.json';

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