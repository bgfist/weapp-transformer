import gulp from 'gulp';
import { options } from "../options"
import { globExt } from '../utils';

export function transformWxss() {
    return globExt("wxss")
        .pipe(gulp.dest(options.dist))
}