// See: https://github.com/evanw/esbuild/issues/859#issuecomment-829154955
import { readFileSync } from 'fs'
import {
  extname,
  dirname,
  relative
} from 'path'

const cwd = process.cwd()
const nodeModules = new RegExp(/^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/);
const loaderFilter = ['mjs', 'cjs', 'ts', 'tsx', 'js']

/**
 * Makes `__filename` and `__dirname` available thoughtout the codebase.
 */
const replaceDirname = (esbuildOnLoadArgs) => {
  const filePath = relative(cwd, esbuildOnLoadArgs.path)

  if (!nodeModules.test(filePath)) {
    let loader = extname(filePath).substring(1);
    const hasLoader = loaderFilter.includes(loader)

    if (hasLoader) {
      let contents = readFileSync(filePath, 'utf8');
      const dirPath = dirname(filePath);

      contents = contents
        .replace('__dirname', JSON.stringify(dirPath))
        .replace('__filename', JSON.stringify(filePath))

      return {
        contents,
        loader: loader === 'mjs' ? 'js' : loader,
      };
    }
  }
}

export { replaceDirname }