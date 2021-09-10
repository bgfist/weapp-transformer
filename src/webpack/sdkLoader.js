import { packageName } from '../core/config';

/**
 * 在入口文件处插入polyfill
 */
const loaderUtils = require('loader-utils');
const path = require('path');

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform } = loaderUtils.getOptions(this);
  let sdkPath = path.join(packageName, 'sdk', platform, 'polyfill.js');
  sdkPath = loaderUtils.stringifyRequest(this, sdkPath);

  return `require(${sdkPath});
    ${source}
    `;
};

export default loader;