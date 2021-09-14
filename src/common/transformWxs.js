import babelTransformCommonjs from "babel-plugin-transform-commonjs";

import { isAlipay } from "./utils";

export function getBabelPlugins(platform) {
  return [isAlipay(platform) && babelTransformCommonjs].filter(Boolean);
}