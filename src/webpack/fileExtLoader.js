/**
 * 将文件后缀改为微信的
 */
const loaderUtils = require('loader-utils');
const { replaceExt } = require('./utils');

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = {};

loader.pitch = function () {
	const { ext } = loaderUtils.getOptions(this);
	this.resourcePath = replaceExt(this.resourcePath, ext);
};

export default loader;