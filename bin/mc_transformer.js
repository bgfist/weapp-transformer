#!/usr/bin/env node

var path = require('path');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var gulpIf = require('gulp-if');
var version = require('../package.json').version;

/** ----------------- 处理命令行参数 ------------------- */

var supportedPlatforms = ["alipay", "baidu", "bytedance"];
var src, dist, platform, enableWatch;
var args = process.argv.slice(2);

var usage = [
    ''
    , '  Usage: mc_transformer [options] src'
    , ''
    , '     src: source directory to transform'
    , ''
    , '  Options:'
    , ''
    , '    -p, --platform <..>     Transform to specified platform'
    , '                            Supported platforms are alipay,baidu,bytedance'
    , '                            Default platform is alipay'
    , ''
    , '    -w, --watch             Watch files for changes and re-transform'
    , '    -o, --out <dir>         Output to <dir> when transforming files'
    , '    -v, --version           Display the version of Stylus'
    , '    -h, --help              Display help information'
    , ''
].join('\n');

var arg;
while (args.length) {
    arg = args.shift();
    switch (arg) {
        case '-h':
        case '--help':
            console.error(usage);
            return;
        case '-v':
        case '--version':
            console.log(version);
            return;
        case '-o':
        case '--out':
            dist = args.shift();
            if (!dist) throw new Error('--out <dir> required');
            break;
        case '-p':
        case '--platform':
            platform = args.shift();
            if (!platform) throw new Error('--platform <..> required');
            if (supportedPlatforms.indexOf(platform) < 0) throw new Error('Unsupported platform: ' + platform);
            break;
        case '-w':
        case '--watch':
            enableWatch = true;
            break;
        default:
            if (arg[0] === '-') {
                throw new Error('Unsupported arg: ' + arg);
            }
            src = arg;
            break;
    }
}

src = src || '.';
platform = platform || 'alipay';
dist = path.join(dist || 'dist', platform);



/** ----------------- 平台各自的配置 ------------------- */

var isAliPay = platform === 'alipay';

var jsApiPrefixes = {
    alipay: 'my',
    baidu: 'swan',
    bytedance: 'tt'
}

var wxssSuffixes = {
    alipay: '.acss',
    baidu: '.css',
    bytedance: '.ttss'
}

var wxmlSuffixes = {
    alipay: '.axml',
    baidu: '.swan',
    bytedance: '.ttml'
}

var wxmlDirectivePrefixes = {
    alipay: 'a:',
    baidu: 's-',
    bytedance: 'tt:'
}

var wxsSuffixes = {
    alipay: '.sjs',
    baidu: '.sjs',
    bytedance: '.sjs'
}

var wxsTags = {
    alipay: 'import-sjs',
    baidu: 'import-sjs',
    bytedance: 'sjs'
}


/** ------------------------- gulp任务 ------------------------- */

/**
 * 处理js文件
 */
function js() {
    return gulp.src(path.join(src, 'app.js'))
        // 统一"wx."系列api，注入polyfill
        .pipe(gulpIf(isAliPay, replace(/^/, 'import "mc_transformer/alipay/polyfill.alipay";\n')))
        .pipe(gulp.src([path.join(src, '**/*.js'), '!' + path.join(src, 'app.js')]))
        // 替换api前缀，此处不严谨，因为 wx. 可能出现在字符串中，如 "baidu-wx.min.js"
        .pipe(replace(/(?<!-)\bwx(?=\.)/g, jsApiPrefixes[platform]))
        // 统一全局方法
        .pipe(gulpIf(isAliPay, replace(/^([\s\S]*)\bComponent/, 'import {MCComponent} from "mc_transformer/alipay/component.alipay";\n$1MCComponent')))
        .pipe(gulp.dest(dist));
}

/**
 * 处理wxss文件
 */
function wxss() {
    return gulp.src(path.join(src, '**/*.wxss'))
        .pipe(rename(function (path) {
            path.extname = wxssSuffixes[platform];
        }))
        .pipe(gulp.dest(dist));
}

/**
 * 处理wxml文件
 */
function wxml() {
    return gulp.src(path.join(src, '**/*.wxml'))
        // 替换wxs模块导入方式
        .pipe(replace(/<wxs([^>]*?)(\/>|>\s*?<\/wxs\s*>)/g, function (match, p1, p2, offset, string) {
            var tag = wxsTags[platform];
            var attrs = p1.replace('.wxs', '.sjs');
            if (isAliPay) {
                attrs = attrs.replace(/module(?=\s*?=)/, 'name').replace(/src(?=\s*?=)/, 'from');
            }
            var ret = '<' + tag + attrs + p2.replace('wxs', tag);

            console.log("[import-sjs]", ret);
            return ret;
        }))
        // 替换 wx:if等指令
        .pipe(replace(/wx:(?=if|elif|else|for|key)/g, wxmlDirectivePrefixes[platform]))
        // 替换事件绑定
        .pipe(gulpIf(isAliPay, replace(/(bind|catch):?(\w+)(?=\s*=)/g, function (match, p1, p2) {
            if (p1 === 'bind') {
                p1 = 'on'
            }
            p2 = p2[0].toUpperCase() + p2.slice(1);
            return p1 + p2;
        })))
        // `data-` 属性全部转成小写形式
        .pipe(gulpIf(isAliPay, replace(/(?<=data-)(\w+)(?=\s*=)/g, function (match, p1) {
            return p1.toLowerCase();
        })))
        .pipe(rename(function (path) {
            path.extname = wxmlSuffixes[platform];
        }))
        .pipe(gulp.dest(dist));
}

/**
 * 处理wxs文件
 */
function wxs() {
    return gulp.src(path.join(src, '**/*.wxs'))
        // 替换模块导入导出语法
        .pipe(gulpIf(isAliPay, replace(/module\.exports(\s*?)=/, 'export default$1')))
        .pipe(rename(function (path) {
            path.extname = wxsSuffixes[platform];
        }))
        .pipe(gulp.dest(dist));
}

/**
 * 处理json文件
 */
function json() {
    var stream = gulp.src(path.join(src, '**/*.json'));

    if (isAliPay) {
        stream = stream
            // key变了
            .pipe(replace('navigationBarTitleText', 'defaultTitle'))
            .pipe(replace('navigationBarBackgroundColor', 'titleBarColor'))
            // key-value变了
            .pipe(replace(/("disableScroll")(\s*:\s*)(true|false)/, function (match, p1, p2, p3) {
                return '"allowsBounceVertical"' + p2 + (p3 === 'true' ? '"NO"' : '"YES"');
            }))
            .pipe(replace(/^(\s*)"navigationStyle"(\s*:\s*)"custom"/m, '$1"titlePenetrate"$2"YES",\n$1"transparentTitle"$2"always"'))
            // tabBar
            .pipe(replace(/(?<="tabBar")([\s\S]+?)(?=\])/, function (match, p1) {
                return p1
                    .replace(/"color"(?=\s*:)/, '"textColor"')
                    .replace(/"list"(?=\s*:)/, '"items"')
                    .replace(/"text"(?=\s*:)/g, '"name"')
                    .replace(/"iconPath"(?=\s*:)/g, '"icon"')
                    .replace(/"selectedIconPath"(?=\s*:)/g, '"activeIcon"')
            }));
    }

    // npm自定义组件
    // TODO: 目前只有支付宝、百度支持
    var packageJson = require(path.resolve(process.cwd(), src, 'package.json'));
    var npmModules = packageJson.dependencies;
    stream = stream.pipe(replace(/(?<="usingComponents")([\s\S]+?)(?=\})/, function (match, p1) {
        return p1.replace(/(?<=:\s*?")([^\.\/].*?)(?=")/g, function (match, p1) {
            if (p1.indexOf('plugin://') === 0) {
                return p1;
            }
            for (const npmModule in npmModules) {
                if (p1.indexOf(npmModule) === 0) {
                    var npmModulePackageJson = require(path.resolve(process.cwd(), src, 'node_modules', npmModule, 'package.json'));
                    var innerPath = p1.substring(npmModule.length + 1);
                    var newP1 = path.join(npmModule, npmModulePackageJson.miniprogram, innerPath);

                    console.log("[npm-component]", p1, '->', newP1);

                    return newP1;
                }
            }
            console.error("[npm-component]", "missing", p1);
        });
    }));

    return stream.pipe(gulp.dest(dist));
}

/**
 * 处理其他后缀的文件
 */
function others() {
    return gulp.src([
        path.join(src, '**'),
        '!' + path.join(src, '**/*.js'),
        '!' + path.join(src, '**/*.wxss'),
        '!' + path.join(src, '**/*.wxml'),
        '!' + path.join(src, '**/*.wxs'),
        '!' + path.join(src, '**/*.json')
    ]).pipe(gulp.dest(dist));
}


/** --------------------------------------------------------------------------- */

if (enableWatch) {
    gulp.watch(path.join(src, '**/*.js'), { ignoreInitial: false }, js);
    gulp.watch(path.join(src, '**/*.wxss'), { ignoreInitial: false }, wxss);
    gulp.watch(path.join(src, '**/*.wxml'), { ignoreInitial: false }, wxml);
    gulp.watch(path.join(src, '**/*.wxs'), { ignoreInitial: false }, wxs);
    gulp.watch(path.join(src, '**/*.json'), { ignoreInitial: false }, json);
    gulp.watch([
        path.join(src, '**'),
        '!' + path.join(src, '**/*.js'),
        '!' + path.join(src, '**/*.wxss'),
        '!' + path.join(src, '**/*.wxml'),
        '!' + path.join(src, '**/*.wxs'),
        '!' + path.join(src, '**/*.json')
    ], { ignoreInitial: false }, others);
} else {
    gulp.parallel(
        js,
        wxss,
        wxml,
        wxs,
        json,
        others
    )(function (err) {
        if (err) {
            process.exit(1);
        }
    });
}