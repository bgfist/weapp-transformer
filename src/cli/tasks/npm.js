import fs from 'fs';
import path from 'path';
import * as rollup from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { options } from '../options';
import { genNpmDir } from '../config';

export const npmModules = {};
export const componentModules = {};

export function splitNodeModules() {
    const packageJsonPath = path.resolve(options.src, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        return {
            npmModules,
            componentModules
        };
    }

    const packageJson = require(packageJsonPath);
    const nodeModules = packageJson.dependencies || {};

    for (const nodeModule in nodeModules) {
        const packageJsonPath = path.resolve(options.src, 'node_modules', nodeModule, 'package.json')
        const packageJson = require(packageJsonPath);

        if (packageJson.miniprogram) {
            const componentIndexPath = path.resolve(packageJsonPath, '..', packageJson.miniprogram);
            componentModules[nodeModule] = componentIndexPath;
        } else {
            const npmIndexPath = path.resolve(packageJsonPath, '..', packageJson.main || "index");
            npmModules[nodeModule] = npmIndexPath;
        }
    }
}

export function bundleNpm() {
    function appendIndex(input) {
        const ret = {};
        for (const entry in input) {
            ret[entry + '/index'] = input[entry];
        }
        return ret;
    }

    return rollup.rollup({
        input: appendIndex(npmModules),
        plugins: [commonjs()],
    }).then(bundle => {
        bundle.write({
            output: {
                dir: path.resolve(options.dist, genNpmDir),
                format: 'cjs'
            }
        })
    });
}