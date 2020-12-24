import gulp from 'gulp';
import babel from 'gulp-babel';
import path from "path";
import { getRelativePath, globExt } from '../utils';
import babelTransformWxApi from '../../babel-plugin/transform-wx-api';
import babelTransformWxComponent from '../../babel-plugin/transform-wx-component';
import babelTransformWxBehavior from '../../babel-plugin/transform-wx-behavior';
import babelTransformNpmPath from '../../babel-plugin/transform-npm-path';
import { options } from '../options';
import { genSdkDir, isAlipay, jsApiPrefixes } from '../config';
import through2 from 'through2';

/**
 * 在app.js中导入sdk/polyfill.js文件
 */
function insertPolyfill() {
    return through2.obj(function (file, enc, cb) {
        if (file.path === path.resolve(options.src, "app.js")) {
            const polyfillPath = path.resolve(options.src, genSdkDir, 'polyfill.js');
            const polyfillRelative = getRelativePath(file.path, polyfillPath);
            file.contents = Buffer.from(`import "${polyfillRelative}";\n${String(file.contents)}`);
        }

        cb(null, file);
    });
}

export function transformJs() {
    return globExt("js")
        .pipe(
            babel({
                plugins: [
                    [babelTransformWxApi, { namespace: jsApiPrefixes[options.platform] }],
                    isAlipay() && babelTransformWxComponent,
                    isAlipay() && babelTransformWxBehavior,
                    babelTransformNpmPath
                ].filter(Boolean),
                configFile: false,
                retainLines: true
            })
        )
        .pipe(insertPolyfill())
        .pipe(gulp.dest(options.dist));
}

/**
 * 拷贝sdk目录
 */
export function copySdk() {
    const sdkPath = path.resolve(__dirname, "../../sdk", options.platform);
    const sdkDestPath = path.join(options.dist, genSdkDir);

    return gulp.src("**/*", { base: sdkPath, cwd: sdkPath }).pipe(
        gulp.dest(sdkDestPath)
    );
}