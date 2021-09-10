import cheerio from "cheerio";
import { transformSync } from "@babel/core";
import babelTransformCommonjs from "babel-plugin-transform-commonjs";
import { wxmlDirectivePrefixes, isAlipay, wxsSuffixes, wxsTags, wxmlSuffixes } from "./config";
import { normalizeRelativePath } from "./utils";

/** @typedef {{path: string; code: string}} Dep */

let uid = 0;
function genFileName() {
  return uid++;
}

/**
 * 将内联的wxs代码抽出到外部文件
 */
function extractInlineWxs($, getDepPath) {
  /** @type {Dep[]} */
  const deps = [];

  $('wxs').each((_, n) => {
    n = cheerio(n);

    const code = n.text();
    if (!code) {
      return;
    }

    const depName = genFileName();
    const depPath = getDepPath(depName);
    // 改为es6的导入导出
    const content = transformSync(code, {
      plugins: [babelTransformCommonjs],
      configFile: false,
      retainLines: true
    }).code;

    n.attr('src', depPath);
    n.text('');

    deps.push({
      path: depPath,
      code: content
    });
  });

  return deps;
}

/**
 * 替换wxs标签的属性
 */
function transformWxs($, platform) {
  $('wxs').each((_, n) => {
    n.name = wxsTags[platform];
    n = cheerio(n);

    let src = n.attr("src");
    if (!src) {
      return;
    }
    src = src.replace(/\.wxs$/, wxsSuffixes[platform]);

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
function transformDirective(elems, platform) {
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
        attr = wxmlDirectivePrefixes[platform] + attr.slice(3);
      }
      newAttrs[attr] = value;
    }

    n.attribs = newAttrs;

    transformDirective(n.children, platform);
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
 * 替换import、include标签的导入路径
 */
function transformImportPath($, platform) {
  $("import, include").each((_, n) => {
    n = cheerio(n);
    const src = n.attr("src");
    const newSrc = normalizeRelativePath(src.replace(/\.wxml$/, wxmlSuffixes[platform]));
    n.attr("src", newSrc);
  });
}

/**
 * 
 * @param {string} source 
 * @param {(depName: string) => string} getDepPath 
 */
export default function transformTemplate(source, platform, getDepPath) {
  const $ = cheerio.load(source, {
    _useHtmlParser2: true,
    recognizeSelfClosing: true,
    decodeEntities: false,
    lowerCaseTags: false,
    lowerCaseAttributeNames: false
  }, false);
  const children = $.root().children();

  /** @type {Dep[]} */
  let extraDeps = [];

  if (isAlipay(platform)) {
    extraDeps = extractInlineWxs($, getDepPath);
    transformEventBind(children);
    transformDataset(children);
  }
  transformDirective(children, platform);
  transformWxs($, platform);
  transformImportPath($, platform);

  return {
    code: $.html({ decodeEntities: false, selfClosingTags: true }),
    extraDeps
  }
}