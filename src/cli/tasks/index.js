import gulp from 'gulp';
import { copySdk, transformJs } from './js';
import { transformJson } from './json';
import { bundleNpm } from './npm';
import { copyOthers } from './others';
import { transformWxml } from './wxml';
import { transformWxs } from './wxs';
import { transformWxss } from './wxss';

/**
 * gulp构建入口
 */
export function build(cb) {
    return gulp.parallel(
        copySdk,
        bundleNpm,
        transformWxml,
        transformJs,
        transformWxs,
        transformWxss,
        transformJson,
        copyOthers
    )(cb);
}

export function watch(options) {
    const { src } = options;

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
}

export function clean() {

}