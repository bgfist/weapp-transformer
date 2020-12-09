import path from "path";
import gulp from 'gulp';
import { options } from "../options"
import { getAppJsonPath, getRelativePath, globExt, replaceNodeModulesPath } from '../utils';
import through2 from 'through2';
import { isAlipay } from "../config";
import { componentModules } from "./npm";

function replaceJsonKey(json, oldKey, newKey, replacer) {
    if (oldKey in json) {
        const value = json[oldKey];
        delete json[oldKey];
        json[newKey] = replacer ? replacer(value) : value;
    }
}

function transformAppTabBar(json) {
    if (json.tabBar) {
        if (json.tabBar.custom) {
            // throw new Error("暂不支持自定义tabBar");
            console.warn("暂不支持自定义tabBar");
            return;
        }
        replaceJsonKey(json.tabBar, 'color', 'textColor');
        replaceJsonKey(json.tabBar, 'list', 'items');
        json.tabBar.items.forEach(item => {
            replaceJsonKey(item, 'text', 'name');
            replaceJsonKey(item, 'iconPath', 'icon');
            replaceJsonKey(item, 'selectedIconPath', 'activeIcon');
        });
    }

    if (json.plugins) {
        // throw new Error("暂不支持自定义tabBar");
        console.warn("暂不支持小程序插件");
    }
}

function transformWindowSetting(json) {
    if (!isAlipay()) {
        return;
    }

    replaceJsonKey(json, 'navigationBarTitleText', 'defaultTitle');
    replaceJsonKey(json, 'navigationBarBackgroundColor', 'titleBarColor');
    replaceJsonKey(json, 'disableScroll', 'allowsBounceVertical', disableScroll => disableScroll ? 'NO' : 'YES');

    if (json.navigationStyle === 'custom') {
        delete json.navigationStyle;
        json.titlePenetrate = "YES";
        json.transparentTitle = "always";
    }
}

function transformUsingComponents(json, file) {
    let usingComponents = json.usingComponents;
    for (const name in usingComponents) {
        const compPath = usingComponents[name];

        if (compPath.indexOf("plugin://") === 0) {
            // throw new Error("暂不支持小程序插件");
            console.warn("暂不支持小程序插件");
            continue;
        }

        for (const module in componentModules) {
            if (compPath.indexOf(module) === 0) {
                const innerPath = compPath.substring(module.length + 1);
                const newCompPath = replaceNodeModulesPath(path.resolve(componentModules[module], innerPath));
                usingComponents[name] = getRelativePath(file.path, newCompPath);
            }
        }
    }

    // node_modules里的不继承全局组件
    if (file.isNpm) {
        return;
    }

    for (const name in globalComponents) {
        if (!usingComponents) {
            usingComponents = json.usingComponents = {}
        }
        if (!(name in usingComponents)) {
            let compPath = globalComponents[name];

            if (!path.isAbsolute(compPath)) {
                compPath = getRelativePath(file.path, path.resolve(getAppJsonPath(), '..', compPath));
            }

            usingComponents[name] = compPath;
        }
    }
}

let globalComponents = null
/**
 * 将app.json里注册的全局组件加到页面里去
 */
function inheritGlobalComponents(json) {
    globalComponents = json.usingComponents
}

export function transformJson() {
    return globExt("json")
        .pipe(through2.obj(function (file, enc, cb) {
            if (!file.isBuffer()) {
                cb(null, file);
                return;
            }

            const json = JSON.parse(String(file.contents));

            const isAppJson = file.path === getAppJsonPath();

            transformUsingComponents(json, file);

            if (isAlipay()) {
                if (isAppJson) {
                    inheritGlobalComponents(json, file);
                    transformAppTabBar(json);
                    transformWindowSetting(json.window);
                } else {
                    transformWindowSetting(json);
                }
            }

            file.contents = Buffer.from(JSON.stringify(json, null, 4));
            cb(null, file);
        }))
        .pipe(gulp.dest(options.dist));
}