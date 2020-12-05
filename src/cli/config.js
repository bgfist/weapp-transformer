import { options } from "./options";

export const supportedPlatforms = ["alipay", "baidu", "bytedance"];

export const genWxsDir = "__mc_transform__/wxs";

export const genNpmDir = "__mc_transform__/npm";

export const genSdkDir = "__mc_transform__/sdk";

export const isAlipay = () => options.platform === 'alipay';

export const jsApiPrefixes = {
    alipay: 'my',
    baidu: 'swan',
    bytedance: 'tt'
}

export const wxssSuffixes = {
    alipay: '.acss',
    baidu: '.css',
    bytedance: '.ttss'
}

export const wxmlSuffixes = {
    alipay: '.axml',
    baidu: '.swan',
    bytedance: '.ttml'
}

export const wxmlDirectivePrefixes = {
    baidu: 's-',
    alipay: 'a:',
    bytedance: 'tt:'
}

export const wxsSuffixes = {
    alipay: '.sjs',
    baidu: '.sjs',
    bytedance: '.sjs'
}

export const wxsTags = {
    alipay: 'import-sjs',
    baidu: 'import-sjs',
    bytedance: 'sjs'
}