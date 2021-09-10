import { jsApiPrefixes } from "./config";
import { isAlipay } from "./utils";
import babelTransformWxApi from '../babel/transformWxApi';
import babelTransformWxComponent from '../babel/transformWxComponent';
import babelTransformWxBehavior from '../babel/transformWxBehavior';

export default function getBabelConfig(platform) {
  return {
    plugins: [
      [babelTransformWxApi, { namespace: jsApiPrefixes[platform] }],
      isAlipay(platform) && [babelTransformWxComponent, {
        sdkDir: '@utils/mc_transformer/sdk'
      }],
      isAlipay(platform) && babelTransformWxBehavior
    ].filter(Boolean)
  }
}