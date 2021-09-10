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

export * from '../core/config';