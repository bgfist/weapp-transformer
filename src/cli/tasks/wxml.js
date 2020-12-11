import through2 from "through2";
import cheerio from "cheerio";
import gulp from "gulp";
import path from "path";
import { transformSync } from "@babel/core";
import babelTransformCommonjs from "babel-plugin-transform-commonjs";
import { wxmlDirectivePrefixes, genWxsDir, isAlipay, wxsSuffixes, wxsTags } from "../config";
import { options } from '../options';
import { globExt, normalizeRelativePath } from "../utils";
import { wxmlSuffixes } from "../config";

let uid = 0;
function genFileName() {
    return uid++;
}

/**
 * 将内联的wxs代码抽出到外部文件
 */
function extractInlineWxs($, file) {
    const genFiles = [];

    $('wxs').each((_, n) => {
        n = cheerio(n);

        const code = n.text();
        if (!code) {
            return;
        }


        const vinyl = file.clone({ contents: false });

        vinyl.path = path.join(vinyl.base, genWxsDir, `${genFileName() + wxsSuffixes[options.platform]}`);
        // const moduleName = n.attr('module');
        // const filename = file.basename.slice(0, -5);
        // vinyl.path = path.join(vinyl.base, genWxsDir, vinyl.relative);
        // vinyl.basename = `${filename}_${moduleName}${wxsSuffixes[options.platform]}`;

        const content = transformSync(code, {
            plugins: [babelTransformCommonjs],
            configFile: false,
            retainLines: true
        }).code;

        vinyl.contents = Buffer.from(content);

        n.attr('src', path.relative(path.dirname(file.path), vinyl.path));
        n.text('');

        genFiles.push(vinyl);
    });

    return genFiles;
}

/**
 * 替换wxs标签的属性
 */
function transformWxs($) {
    $('wxs').each((_, n) => {
        n.name = wxsTags[options.platform];
        n = cheerio(n);

        let src = n.attr("src");
        if (!src) {
            return;
        }
        src = src.replace(/\.wxs$/, wxsSuffixes[options.platform]);

        if (isAlipay()) {
            const module = n.attr("module");
            n.removeAttr("module");
            n.removeAttr("src");
            n.attr("name", module);
            n.attr("from", src);
        } else {
            n.attr("src", src);
        }
    });
}

/**
 * 替换wx:指令前缀
 */
function transformDirective(elems) {
    for (let i = 0; i < elems.length; i++) {
        const n = elems[i];

        if (n.type !== 'tag') {
            continue;
        }

        const oldAttrs = n.attribs;
        const newAttrs = {};

        for (let attr in oldAttrs) {
            // 将双引号改为单引号
            const value = oldAttrs[attr].replace(/"/g, "'");
            if (attr.indexOf("wx:") === 0) {
                attr = wxmlDirectivePrefixes[options.platform] + attr.slice(3);
            }
            newAttrs[attr] = value;
        }

        n.attribs = newAttrs;

        transformDirective(n.children);
    }
}

const uppperCaseEventNames = {
    "touchmove": "TouchMove",
    "touchstart": "TouchStart",
    "touchend": "TouchEnd",
    "touchcancel": "TouchCancel",
    "longtap": "LongTap",
    "transitionend": "TransitionEnd",
    "animationiteration": "AnimationIteration",
    "animationiteration": "AnimationIteration",
    "animationstart": "AnimationStart",
    "animationend": "AnimationEnd",
    "scrolltoupper": "ScrollToUpper",
    "scrolltolower": "ScrollToLower",
    "changeend": "ChangeEnd",
    "timeupdate": "TimeUpdate",
    "fullscreenchange": "FullScreenChange",
    "useraction": "UserAction",
    "renderstart": "RenderStart",
    "markertap": "MarkerTap",
    "callouttap": "CalloutTap",
    "controltap": "ControlTap",
    "regionchange": "RegionChange",
    "paneltap": "PanelTap"
}

/**
 * 替换事件绑定
 */
function transformEventBind(elems) {
    const getEventName = (event) => {
        const upperCaseEventName = uppperCaseEventNames[event.toLowerCase()];
        if (upperCaseEventName) {
            return upperCaseEventName;
        }
        return event[0].toUpperCase() + event.slice(1);
    }

    for (let i = 0; i < elems.length; i++) {
        const n = elems[i];

        if (n.type !== 'tag') {
            continue;
        }

        const oldAttrs = n.attribs;
        const newAttrs = {};

        for (let attr in oldAttrs) {
            const value = oldAttrs[attr];
            if (attr.indexOf("bind") === 0) {
                const event = attr[4] === ':' ? attr.slice(5) : attr.slice(4);

                attr = "on" + getEventName(event);
            }
            else if (attr.indexOf("catch") === 0) {
                const event = attr[5] === ':' ? attr.slice(6) : attr.slice(5);
                attr = "catch" + getEventName(event);
            }
            newAttrs[attr] = value;
        }

        n.attribs = newAttrs;

        transformEventBind(n.children);
    }
}

/**
 * 替换data-属性
 */
function transformDataset(elems) {
    for (let i = 0; i < elems.length; i++) {
        const n = elems[i];

        if (n.type !== 'tag') {
            continue;
        }

        const oldAttrs = n.attribs;
        const newAttrs = {};

        for (let attr in oldAttrs) {
            const value = oldAttrs[attr];
            if (attr.indexOf("data-") === 0) {
                attr = attr.toLowerCase();
            }
            newAttrs[attr] = value;
        }

        n.attribs = newAttrs;

        transformDataset(n.children);
    }
}

/**
 * 替换data-属性
 */
function transformImportPath($) {
    $("import, include").each((_, n) => {
        n = cheerio(n);
        const src = n.attr("src");
        const newSrc = normalizeRelativePath(src.replace(/\.wxml$/, wxmlSuffixes[options.platform]));
        n.attr("src", newSrc);
    });
}

export function transformWxml() {
    return globExt('wxml')
        .pipe(through2.obj(function (file, enc, callback) {
            if (!file.isBuffer()) {
                callback(null, file);
                return;
            }

            const $ = cheerio.load(String(file.contents), {
                _useHtmlParser2: true,
                recognizeSelfClosing: true,
                decodeEntities: false,
                lowerCaseTags: false,
                lowerCaseAttributeNames: false
            }, false);
            const children = $.root().children();

            if (isAlipay()) {
                extractInlineWxs($, file).forEach((file) => {
                    this.push(file);
                });
                transformEventBind(children);
                transformDataset(children);
            }
            transformDirective(children);
            transformWxs($);
            transformImportPath($);

            file.contents = Buffer.from($.html({ decodeEntities: false }));
            this.push(file);

            callback();
        }))
        .pipe(gulp.dest(options.dist));
}