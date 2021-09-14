import loaderUtils from "loader-utils";
import { transform } from "@babel/core";
import { getBabelPlugins } from "../common/transformWxs";

/**
 * 在入口文件处插入polyfill
 * @type {import('webpack').loader.Loader}
 */
const loader = function (source) {
  const { platform } = loaderUtils.getOptions(this);
  const callback = this.async();

  transform(
    source,
    {
      filename: this.resourcePath,
      plugins: getBabelPlugins(platform),
    },
    (err, result) => {
      callback(err, result && result.code);
    }
  );
};

export default loader;
