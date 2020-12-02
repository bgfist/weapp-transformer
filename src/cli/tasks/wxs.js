import gulp from 'gulp';
import babel from 'gulp-babel';
import { globExt } from '../utils';
import babelTransformCommonjs from "babel-plugin-transform-commonjs";
import { options } from '../options';

export function transformWxs() {
    return globExt("wxs")
        .pipe(babel({
            plugins: [
                babelTransformCommonjs
            ],
            configFile: false,
            retainLines: true
        }))
        .pipe(gulp.dest(options.dist))
}