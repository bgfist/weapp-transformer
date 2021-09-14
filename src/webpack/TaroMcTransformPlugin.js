import path from "path";
import fs from "fs";
import { supportedPlatforms, wxmlSuffixes, wxssSuffixes, wxsSuffixes } from "../../lib/common/config";
import { getExt, replaceExt } from "./utils";

const PLUGIN_NAME = "TaroMcTransformPlugin";

function modifyFileLoaderOptions(loaders, ext) {
  const fileLoaderIndex = loaders.findIndex((loader) => loader.loader.indexOf("file-loader") !== -1);
  if (fileLoaderIndex !== -1) {
    const fileLoader = loaders[fileLoaderIndex];
    loaders[fileLoaderIndex] = {
      ...fileLoader,
      options: {
        ...fileLoader.options,
        name: `[path][name]${ext}`,
      },
    };
    return fileLoader.options.context
  }
}

export class TaroMcTransformPlugin {
  /**
   *
   * @param {object} options
   * @param {'alipay'|'baidu'|'bytedance'} options.platform
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const { platform } = this.options;

    if (!supportedPlatforms.includes(platform)) {
      throw new Error('mc_transformer不支持平台: ' + platform);
    }

    const wxmlSuffix = wxmlSuffixes[platform];
    const wxssSuffix = wxssSuffixes[platform];
    const wxsSuffix = wxsSuffixes[platform];

    const miniPlugin = compiler.options.plugins.find((plugin) => {
      return typeof plugin.isNativePageORComponent === "function" && typeof plugin.addEntry === "function";
    });
    const isInTaro = Boolean(miniPlugin);

    // 覆盖Taro小程序转换插件的一些逻辑
    if (isInTaro) {
      /** 是否为小程序原生页面或组件 */
      miniPlugin.isNativePageORComponent = function (templatePath) {
        const extname = path.extname(templatePath);
        templatePath = templatePath.replace(extname, ".wxml");
        return fs.existsSync(templatePath);
      };

      const orignalAddEntries = miniPlugin.addEntries;

      /** 添加入口文件 */
      miniPlugin.addEntries = function () {
        orignalAddEntries.call(this);
        Array.from(this.pages).filter(item => item.isNative)
          .concat(Array.from(this.components).filter(item => item.isNative))
          .forEach(item => {
            if (item.stylePath && !fs.existsSync(item.stylePath)) {
              item.stylePath = replaceExt(item.stylePath, ".wxss");
              if (fs.existsSync(item.stylePath)) {
                this.addEntry(item.stylePath, this.getStylePath(item.name), 'NORMAL');
              }
            }
            if (item.templatePath && !fs.existsSync(item.templatePath)) {
              item.templatePath = replaceExt(item.templatePath, ".wxml");
              if (fs.existsSync(item.templatePath)) {
                this.addEntry(item.templatePath, this.getTemplatePath(item.name), 'NORMAL');
              }
            }
          });
      }
    }

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, { normalModuleFactory }) => {
      compilation.hooks.normalModuleLoader.tap(PLUGIN_NAME, (loaderContext, module) => {
        if (isInTaro) {
          if (module.miniType === "ENTRY" && module.name === "app") {
            const sdkLoaderName = path.resolve(__dirname, "sdkLoader");
            module.loaders.unshift({
              loader: sdkLoaderName,
              options: {
                platform,
              },
            });
            return;
          }

          if (module.miniType !== "NORMAL") {
            return;
          }
        }

        const scriptLoaderName = path.resolve(__dirname, "scriptLoader");
        const templateLoaderName = path.resolve(__dirname, "templateLoader");
        const styleLoaderName = path.resolve(__dirname, "styleLoader");
        const wxsLoaderName = path.resolve(__dirname, "wxsLoader");

        const moduleName = module.request || "";
        const ext = getExt(moduleName);

        if (ext === ".js") {
          module.loaders.push({
            loader: scriptLoaderName,
            options: {
              platform,
            },
          });
        } else if (ext === ".wxss") {
          modifyFileLoaderOptions(module.loaders, wxssSuffix);
          module.loaders.push({
            loader: styleLoaderName,
            options: {
              platform,
            },
          });
        } else if (ext === ".wxml") {
          const context = modifyFileLoaderOptions(module.loaders, wxmlSuffix);
          module.loaders.push({
            loader: templateLoaderName,
            options: {
              platform,
              context
            },
          });
        } else if (ext === ".wxs") {
          modifyFileLoaderOptions(module.loaders, wxsSuffix);
          module.loaders.push({
            loader: wxsLoaderName,
            options: {
              platform
            },
          });
        }
      });

      if (isInTaro) {
        return;
      }

      /**
       * 删除静态资源入口
       */
      compilation.hooks.afterOptimizeAssets.tap(PLUGIN_NAME, (assets) => {
        Object.keys(assets).forEach((assetPath) => {
          const styleExt = wxssSuffix;
          const templExt = wxmlSuffix;
          if (new RegExp(`(\\${styleExt}|\\${templExt}|\\${wxsSuffix})\\.js(\\.map){0,1}$`).test(assetPath)) {
            delete assets[assetPath];
          } else if (new RegExp(`${styleExt}${styleExt}$`).test(assetPath)) {
            const assetObj = assets[assetPath];
            const newAssetPath = assetPath.replace(styleExt, "");
            assets[newAssetPath] = assetObj;
            delete assets[assetPath];
          }
        });
      });
    });
  }
}
