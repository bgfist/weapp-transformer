const path = require('path');
const gulp = require('gulp');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

const cwd = process.cwd();
const src = path.resolve(cwd, process.env["src"] || '.');
// alipay baidu bytedance
const platform = process.env["platform"] || "alipay";
const dist = path.join(cwd, 'dist', platform);

const jsApiPrefixes = {
    alipay: 'my',
    baidu: 'swan',
    bytedance: 'tt'
}

const wxssSuffixes = {
    alipay: '.acss',
    baidu: '.css',
    bytedance: '.ttss'
}

const wxmlSuffixes = {
    alipay: '.axml',
    baidu: '.swan',
    bytedance: '.ttml'
}

const wxmlDirectivePrefixes = {
    alipay: 'a',
    baidu: 's',
    bytedance: 'tt'
}

const wxsSuffixes = {
    alipay: '.sjs',
    baidu: '.sjs',
    bytedance: '.sjs'
}

const wxsTags = {
    alipay: 'import-sjs',
    baidu: 'import-sjs',
    bytedance: 'sjs'
}

const configKeyMapper = {
    'navigationBarTitleText': 'defaultTitle',
    'navigationBarBackgroundColor': 'titleBarColor',
}

function js() {
    return gulp.src(`${src}/**/*.js`)
        .pipe(gulp.dest(dist))
        .pipe(replace(/\bwx\./g, jsApiPrefixes[platform] + '.'))
        .pipe(replace(/(\s\S*)Component/, `import {MCComponent} from "mc_transformer";$1MCComponent`))
        .pipe(gulp.dest(dist));
}

function wxss() {
    return gulp.src(`${src}/**/*.wxss`)
        .pipe(rename(function (path) {
            path.extname = wxssSuffixes[platform];
        }))
        .pipe(gulp.dest(dist));
}

function wxml() {
    let stream = gulp.src(`${src}/**/*.wxml`)
        .pipe(rename(function (path) {
            path.extname = wxmlSuffixes[platform];
        }))
        // 替换wxs模块导入方式
        .pipe(replace(/<wxs([^>]*?)(\/>|>\s*?<\/wxs\s*>)/g, function (match, p1, p2, offset, string) {
            const tag = wxsTags[platform];
            let attrs = p1.replace('.wxs', '.sjs');

            if (platform === 'alipay') {
                attrs = attrs.replace(/module(\s*?)=/, 'name$1=').replace(/src(\s*?)=/, 'from$1=')
            }

            return `<${tag}${p2.replace('wxs', tag)}`;
        }))
        // 替换 wx:if等指令
        .pipe(replace(/wx:(if|elif|else|for|key)/, wxmlDirectivePrefixes[platform] + ':$1'))

    // 替换事件绑定
    if (platform === 'alipay') {
        // fix: 支付宝不支持capture阶段
        stream = stream.pipe(replace(/(bind|catch):?(\w)+/g, function (match, p1, p2) {
            if (p1 === 'bind') {
                p1 = 'on'
            }
            p2 = p2[0].toUpperCase() + p2.slice(1);
            return p1 + p2;
        }))
    }

    return stream.pipe(gulp.dest(dist));
}

function wxs() {
    return gulp.src(`${src}/**/*.wxs`)
        .pipe(rename(function (path) {
            path.extname = wxsSuffixes[platform];
        }))
        .pipe(gulp.dest(dist));
}

function npm() {

}

function json() {
    let stream = gulp.src(`${src}/**/*.json`)

    if (platform === 'alipay') {
        for (const k in configKeyMapper) {
            stream = stream.pipe(replace(k, configKeyMapper[k]))
        }
    }

    return stream.pipe(gulp.dest(dist));
}

export default gulp.parallel(js, wxs, wxml, wxss, json);