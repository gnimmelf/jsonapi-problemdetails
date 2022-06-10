import 'dotenv/config';
import { build } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import * as utils from './utils.build.mjs';
import * as print from './utils.print.mjs';
import { projectPlugin } from './plugin.project.mjs'

const sassPluginCache = new Map();

// Constants
const DIST_DIR = './build';
const PUBLIC_DIR = './public';
const PUBLIC_PATH = '/';

// Env constants
const WATCH = (process.env.ENV || '').toLowerCase().startsWith('dev');
const MAX_ERRORS = isNaN(process.env.MAX_ERRORS)
  ? 2
  : parseInt(process.env.MAX_ERRORS);
const MAX_WARNINGS = isNaN(process.env.MAX_WARNINGS)
  ? 0
  : parseInt(process.env.MAX_WARNINGS);
const SHOW_SASS_LOGS = !!parseInt(process.env.SHOW_SASS_LOGS);
const VERBOSE_LINTING = !!parseInt(process.env.VERBOSE_LINTING);

/**
 * The keys in REPLACE_STRINGS will be replaced build-time by the literal values, eg:
 * `const REPLACE_STRINGS = {'process.env.FOO': "'foo'"}`
 * `console.log(process.env.FOO)` => `console.log('foo')`
 * - Note the single snippets in the value "'foo'". Convention to acheive this is to JSON.stringfy the string-value
 */
const REPLACE_STRINGS = [
  'PATH_BASENAME',
  'KEEPALIVE_POLL_INTERVAL_SEC',
  'LOGOUT_IDLE_DURATION_SEC',
  'LOGOUT_IDLE_COUNTDOWN_SEC',
].reduce(
  (acc, envVariableName) => ({
    ...acc,
    [`process.env.${envVariableName}`]: JSON.stringify(
      process.env[envVariableName] || '',
    ),
  }),
  {},
);

print.settings({
  WATCH,
  MAX_ERRORS,
  MAX_WARNINGS,
  SHOW_SASS_LOGS,
  VERBOSE_LINTING,
  REPLACE_STRINGS,
});

const reloadServer = WATCH ? utils.createReloadServer({ port: 7071 }) : false;

/**
 * `onRebuild` is run consequtively after `onBuild` when in watch-mode
 * @param { Object } errorsAndWarnings Null or object
 * @param { Array  } errorsAndWarnings.erros List of esbuild-generated errors
 * @param { Array  } errorsAndWarnings.warnings List of esbuild-generated warnings
 */
const onRebuild = async (errorsAndWarnings) => {
  print.changeDetected({ errorsAndWarnings });
  if (errorsAndWarnings) {
    await print.errorsAndWarnings({
      errorsAndWarnings,
      MAX_ERRORS,
      MAX_WARNINGS,
    });
  } else {
    utils.copyIndexFile({ DIST_DIR, PUBLIC_DIR });
    reloadServer?.refreshClients();
  }
  print.finishedBuilding();
  print.waitingForChange();
};

/**
 * `onBuild` is run once on every build, including first time in watch-mode
 * @param { Object } errorsAndWarnings Null or object
 * @param { Array  } errorsAndWarnings.erros List of esbuild-generated errors
 * @param { Array  } errorsAndWarnings.warnings List of esbuild-generated warnings
 */
const onBuild = async ({ errors = [], warnings = [] } = {}) => {
  const hasErrors = !!errors.length;
  print.esbuildDone();
  if (!hasErrors) {
    utils.copyIndexFile({ DIST_DIR, PUBLIC_DIR, WATCH });
  }
  print.finishedBuilding();
  WATCH && !hasErrors && print.waitingForChange();
};

/**
 * `onCatch` is run only on errors (and warnings?) on first `onBuild`
 * @param errorsAndWarnings
 * @param { Object } errorsAndWarnings Null or object
 * @param { Array  } errorsAndWarnings.erros List of esbuild-generated errors
 * @param { Array  } errorsAndWarnings.warnings List of esbuild-generated warnings
 */
const onCatch = async (errorsAndWarnings) => {
  if (errorsAndWarnings.errors && errorsAndWarnings.warnings) {
    // If both these ^^ props are present, we know it's not an unhandled exception
    print.esbuildDone();
    await print.errorsAndWarnings({
      errorsAndWarnings,
      MAX_ERRORS,
      MAX_WARNINGS,
    });
    print.finishedBuilding();
  } else {
    // Treat as instance of an unexpected error
    console.error(errorsAndWarnings);
  }
  // NOTE! If errors found during initial build, watch mode will never trigger
  WATCH && print.watchCanceledByInitialErrors();
  process.exit(1);
};

/**
 * CONFIGURATION
 *
 * NOTE! Moving/renaming output files in esbuild is not yet available
 * See: https://github.com/evanw/esbuild/issues/553
 * Once this is in place we can write a plugin to differentiate the output
 * files better and get rid of post moving/copying.
 */
const baseConfig = {
  logLevel: 'silent',
  bundle: true,
  metafile: true,
  format: 'iife',
  publicPath: PUBLIC_PATH,
  assetNames: 'assets/[name]-[hash]',
  banner: {
    js: WATCH ? reloadServer.longPollCodeString : '/* Prod */',
  },
  outdir: DIST_DIR,
  minify: !WATCH,
  sourcemap: WATCH,
  sourceRoot: '/',
  watch: !WATCH ? false : { onRebuild },
  define: REPLACE_STRINGS,
};

const bundleConfig = {
  entryPoints: ['entry-client-esbuild.mjs'],
  nodePaths: [process.cwd()],
  loader: {
    '.png': 'file',
    '.jpg': 'file',
    '.gif': 'file',
    '.svg': 'file',
    '.eot': 'file',
    '.woff2': 'file',
    '.woff': 'file',
    '.ttf': 'file',
  },
  plugins: [
    sassPlugin({
      cache: sassPluginCache,

      ...(!SHOW_SASS_LOGS && {
        logger: {
          warn(message, opts) {
            /* totally silent! */
          },
          debug(message, opts) {
            /* totally silent! */
          },
        },
      }),
    }),
    projectPlugin({ VERBOSE_LINTING }),
  ],
};

/**
 * START
 */
const config = { ...baseConfig, ...bundleConfig };

print.initiateBuild();

utils.removeOldBuildFiles({ DIST_DIR });

print.esbuildStart();

build(config).then(onBuild).catch(onCatch);
