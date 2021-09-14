import path from 'path';
import loaderUtils from 'loader-utils';
import { packageName } from '../common/config';

/**
 * 在入口文件处插入polyfill
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform } = loaderUtils.getOptions(this);
  let sdkPath = path.join(packageName, 'lib/sdk', platform, 'polyfill.js');
  sdkPath = loaderUtils.stringifyRequest(this, sdkPath);

  return `require(${sdkPath});
    ${source}
    `;
};

export default loader;