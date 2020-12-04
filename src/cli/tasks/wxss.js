import gulp from 'gulp';
import postcss from 'gulp-postcss';
import { options } from "../options"
import { globExt } from '../utils';

function transformImportPath() {

}

export function transformWxss() {
    return globExt("wxss")
        .pipe(postcss([transformImportPath]))
        .pipe(gulp.dest(options.dist))
}