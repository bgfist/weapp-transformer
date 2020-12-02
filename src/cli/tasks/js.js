import gulp from 'gulp';
import babel from 'gulp-babel';
import path from "path";
import { globExt } from '../utils';
import babelTransformWxApi from '../../babel-plugin/transform-wx-api';
import { options } from '../options';
import { genSdkDir, isAlipay, jsApiPrefixes } from '../config';
import through2 from 'through2';

function insertPolyfill() {
    return through2.obj(function (file, enc, cb) {
        if (!isAlipay()) {
            cb(null, file);
            return;
        }

        if (file.path === path.resolve(options.src, "app.js")) {
            const polyfillRelative = `./${genSdkDir}/polyfill.${options.platform}.js`;
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
                    // babelTransformWxComponent,
                    // babelTransformNpmPath
                ],
                configFile: false,
                retainLines: true
            })
        )
        .pipe(insertPolyfill())
        .pipe(gulp.dest(options.dist));
}

export function copySdk() {
    const sdkPath = path.resolve(__dirname, "../../", options.platform);
    const sdkDestPath = path.join(options.dist, genSdkDir);

    return gulp.src("**/*", { base: sdkPath, cwd: sdkPath }).pipe(
        gulp.dest(sdkDestPath)
    );
}