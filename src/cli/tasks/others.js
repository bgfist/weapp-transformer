import gulp from 'gulp';
import { options } from "../options";
import { globOthers } from "../utils";

export function copyOthers() {
    return globOthers()
        .pipe(gulp.dest(options.dist))
}