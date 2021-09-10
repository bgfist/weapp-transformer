import { wxssSuffixes, wxmlSuffixes } from '../core/config';

const PLUGIN_NAME = 'TaroMcTransformPlugin';

export default class TaroMcTransformPlugin {
  /**
   * 
   * @param {object} options
   * @param {'weapp'|'alipay'|'baidu'|'bytedance'} options.platform
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @param {import('webpack').Compiler} compiler 
   */
  apply(compiler) {
    const miniPlugin = compiler.options.plugin.miniPlugin;
    const isInTaro = Boolean(miniPlugin);

    // 覆盖Taro小程序转换插件的一些逻辑
    if (isInTaro) {
      /** 是否为小程序原生页面或组件 */
      miniPlugin.isNativePageORComponent = function (templatePath) {
        const extname = path.extname(templatePath);
        templatePath = templatePath.replace(extname, '.wxml');
        return fs.existsSync(templatePath);
      };
    }

    const { platform } = this.options;
    const wxmlSuffix = wxmlSuffixes[platform];
    const wxssSuffix = wxssSuffixes[platform];
    const jsSuffix = '.js';

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, { normalModuleFactory }) => {
      compilation.hooks.normalModuleLoader.tap(PLUGIN_NAME, (loaderContext, module) => {
        if (isInTaro) {
          if (module.miniType === 'ENTRY' && module.name === 'app') {
            const sdkLoaderName = path.resolve(__dirname, 'sdkLoader');
            module.loaders.unshift({
              loader: sdkLoaderName,
              options: {
                platform
              }
            });
          }

          if (module.miniType !== 'NORMAL') {
            return;
          }
        }

        const fileExtLoaderName = path.resolve(__dirname, 'fileExtLoader');
        const scriptLoaderName = path.resolve(__dirname, 'scriptLoader');
        const templateLoaderName = path.resolve(__dirname, 'templateLoader');
        const styleLoaderName = path.resolve(__dirname, 'styleLoader');

        if (module.name.endsWith(jsSuffix)) {
          module.loaders.push({
            loader: scriptLoaderName,
            options: {
              platform
            }
          });
        } else if (module.name.endsWith(wxssSuffix)) {
          module.loaders.unshift({
            loader: fileExtLoaderName,
            options: {
              ext: '.wxss'
            }
          });
          module.loaders.push({
            loader: styleLoaderName,
            options: {
              platform
            }
          });
        } else if (module.name.endsWith(wxmlSuffix)) {
          module.loaders.unshift({
            loader: fileExtLoaderName,
            options: {
              ext: '.wxml'
            }
          });
          module.loaders.push({
            loader: templateLoaderName,
            options: {
              platform
            }
          });
        }
      });

      if (isInTaro) {
        return;
      }

      compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
        /**
         * 删除静态资源入口
         */
        compilation.hooks.afterOptimizeAssets.tap(PLUGIN_NAME, assets => {
          Object.keys(assets).forEach(assetPath => {
            const styleExt = wxssSuffix;
            const templExt = wxmlSuffix;
            if (new RegExp(`(\\${styleExt}|\\${templExt})\\.js(\\.map){0,1}$`).test(assetPath)) {
              delete assets[assetPath]
            } else if (new RegExp(`${styleExt}${styleExt}$`).test(assetPath)) {
              const assetObj = assets[assetPath]
              const newAssetPath = assetPath.replace(styleExt, '')
              assets[newAssetPath] = assetObj
              delete assets[assetPath]
            }
          })
        })
      });
    });
  }
}