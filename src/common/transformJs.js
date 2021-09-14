import { jsApiPrefixes } from "./config";
import { isAlipay } from "./utils";
import babelTransformWxApi from "../babel/transformWxApi";
import babelTransformWxComponent from "../babel/transformWxComponent";
import babelTransformWxBehavior from "../babel/transformWxBehavior";
import babelTransformNpmPath from "../babel/transformNpmPath";

export function getBabelPlugins(platform, { transformNpmPath, transformWxFunc } = {}) {
  const plugins = [[babelTransformWxApi, { namespace: jsApiPrefixes[platform] }]];

  if (isAlipay(platform) && transformWxFunc) {
    plugins.push([
      babelTransformWxComponent,
      transformWxFunc,
    ]);
    plugins.push(babelTransformWxBehavior);
  }

  if (transformNpmPath) {
    plugins.push([babelTransformNpmPath, transformNpmPath]);
  }

  return plugins;
}
