import fs from 'fs';
import path from 'path';
import { parseOptions, options } from "./options";
import { build, watch } from './tasks';
import { splitNodeModules } from "./tasks/npm";

/**
 * 检查目录结构是否为小程序项目
 */
export function checkSourceFolder() {
    for (const ext of ['js', 'json', 'wxss']) {
        const filepath = path.resolve(options.src, `app.${ext}`);

        if (!fs.existsSync(filepath)) {
            throw new Error("要转换的目录不是微信小程序项目");
        }
    }
}

parseOptions();
checkSourceFolder();
splitNodeModules();

if (options.enableWatch) {
    watch(options);
} else {
    build((err) => {
        if (err) {
            process.exit(1);
        }
    });
}