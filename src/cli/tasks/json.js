import path from "path";
import gulp from 'gulp';
import { options } from "../options"
import { globExt, replaceNodeModulesPath } from '../utils';
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
    const usingComponents = json.usingComponents;
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
                usingComponents[name] = path.relative(path.dirname(file.path), newCompPath);
            }
        }
    }
}

export function transformJson() {
    return globExt("json")
        .pipe(through2.obj(function (file, enc, cb) {
            if (!file.isBuffer()) {
                cb(null, file);
                return;
            }

            const json = JSON.parse(String(file.contents));

            if (isAlipay()) {
                // 处理app.json
                if (file.path === path.resolve(options.src, 'app.json')) {
                    transformAppTabBar(json);
                    transformWindowSetting(json.window);
                } else {
                    transformWindowSetting(json);
                }
            }

            transformUsingComponents(json, file);

            file.contents = Buffer.from(JSON.stringify(json, null, 4));
            cb(null, file);
        }))
        .pipe(gulp.dest(options.dist));
}