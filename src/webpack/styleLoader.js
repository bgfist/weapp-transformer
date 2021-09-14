import { getPostcssPlugins } from '../common/transformWxss';

/**
 * 将文件后缀改为微信的
 */
const loaderUtils = require('loader-utils');
const postcss = require('postcss');

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform } = loaderUtils.getOptions(this);
  return postcss(getPostcssPlugins(platform))
    .process(source)
    .then(result => result.css)
};

export default loader;