import { supportedPlatforms } from "./config";
import path from "path";
import packageJson from "../../package.json"

export const options = {};

/**
 * 解析命令行参数，将配置项存到全局
 */
export function parseOptions() {
  const args = process.argv.slice(2);
  const usage = [
    ''
    , '  Usage: mc_transformer [options] src'
    , ''
    , '     src: source directory to transform'
    , ''
    , '  Options:'
    , ''
    , '    -p, --platform <..>     (required)Transform to specified platform'
    , '                            Supported platforms are alipay,baidu,bytedance'
    , ''
    , '    -w, --watch             Watch files for changes and re-transform'
    , '    -o, --out <dir>         Output to <dir> when transforming files'
    , '    -v, --version           Display the version of Stylus'
    , '    -h, --help              Display help information'
    , ''
  ].join('\n');

  let src, dist, platform, enableWatch;
  let arg;
  while (args.length) {
    arg = args.shift();
    switch (arg) {
      case '-h':
      case '--help':
        console.error(usage);
        return;
      case '-v':
      case '--version':
        console.log(packageJson.version);
        return;
      case '-o':
      case '--out':
        dist = args.shift();
        if (!dist) throw new Error('--out <dir> required');
        break;
      case '-p':
      case '--platform':
        platform = args.shift();
        if (!platform) throw new Error('--platform <..> required');
        if (supportedPlatforms.indexOf(platform) < 0) throw new Error('Unsupported platform: ' + platform);
        break;
      case '-w':
      case '--watch':
        enableWatch = true;
        break;
      default:
        if (arg[0] === '-') {
          throw new Error('Unsupported arg: ' + arg);
        }
        src = arg;
        break;
    }
  }

  if (!platform) {
    throw new Error("platform required");
  }

  src = path.resolve(src || '.');
  const distBase = dist || 'dist';
  dist = path.resolve(distBase, platform);

  Object.assign(options, {
    src,
    dist,
    distBase,
    platform,
    enableWatch
  });

  return true;
}