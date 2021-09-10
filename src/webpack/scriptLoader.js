import { transform } from "@babel/core";
import getBabelConfig from "../core/transformScript";
const loaderUtils = require('loader-utils');

/**
 * @type {import('webpack').loader.Loader}
 */
const loader = function scriptLoader(source) {
  const { platform } = loaderUtils.getOptions(this);
  const callback = this.async();

  transform(source, getBabelConfig(platform), (err, result) => {
    callback(err, result && result.code);
  });
};

export default loader;