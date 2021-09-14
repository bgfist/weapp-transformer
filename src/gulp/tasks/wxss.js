import gulp from 'gulp';
import postcss from 'gulp-postcss';

import { options } from "../options"
import { globExt } from '../utils';
import { getPostcssPlugins } from '../../common/transformWxss';

export function transformWxss() {
	return globExt("wxss")
		.pipe(postcss(getPostcssPlugins(options.platform)))
		.pipe(gulp.dest(options.dist))
}