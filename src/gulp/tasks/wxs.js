import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import { globExt } from '../utils';
import babelTransformCommonjs from "babel-plugin-transform-commonjs";
import { options } from '../options';
import { isAlipay, wxsSuffixes } from '../config';

export function transformWxs() {
	return globExt("wxs")
		.pipe(babel({
			plugins: [
				isAlipay() && babelTransformCommonjs
			].filter(Boolean),
			configFile: false,
			retainLines: true
		}))
		// gulp-babel会改变后缀名，这里改回来
		.pipe(rename(function (file) {
			file.extname = wxsSuffixes[options.platform];
		}))
		.pipe(gulp.dest(options.dist))
}