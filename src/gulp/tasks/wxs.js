import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';

import { wxsSuffixes } from '../../common/config';
import { globExt } from '../utils';
import { options } from '../options';
import { getBabelPlugins } from '../../common/transformWxs';

export function transformWxs() {
	return globExt("wxs")
		.pipe(babel({
			plugins: getBabelPlugins(options.platform),
			configFile: false,
			retainLines: true
		}))
		// gulp-babel会改变后缀名，这里改回来
		.pipe(rename(function (file) {
			file.extname = wxsSuffixes[options.platform];
		}))
		.pipe(gulp.dest(options.dist))
}