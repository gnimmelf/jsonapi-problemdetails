import { ESLint, Linter } from 'eslint';
import * as print from './utils.print.mjs';
import { replaceDirname } from './utils.replaceDirname.mjs';

/**
 * README! Linting Rules
 * `eslint:recommended` comes with package 'eslint', and is set to extend the default rules from `.eslint.rc`
 *   1. Overriding existing `.eslint.rc` rules
 *   2. Adding rules that aren't defined already
 *  -This accumulated set of rules is then ignored, except for the rules added to the `ENFORCED_RULES` array.
 *
 * `ENFORCED_RULES` False|<array>
 * False:
 * Array: Array of the *only* ruleIds that should lint as errors
 */
const ENFORCED_RULE_IDS = [
  'no-undef',
  'import/no-unresolved',
  'no-console',
  'no-unsafe-finally',
];

const ALL_RULE_IDS = Array.from(new Linter().getRules().keys());

const setRulesSeverity = (rulesList, severity) =>
  rulesList.reduce((acc, ruleId) => ({ ...acc, [ruleId]: severity }), {});

const IGNORED_RULES = setRulesSeverity(ALL_RULE_IDS, 'off');
const ENFORCED_RULES = setRulesSeverity(ENFORCED_RULE_IDS, 'error');
const IMPORT_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
  '.mjs',
  '.d.ts',
];

const eslint = new ESLint({
  /**
   * Stripped down config from
   * https://github.com/toshi-toma/eslint-config-airbnb-typescript-prettier/blob/master/index.js
   */
  useEslintrc: false,
  overrideConfig: {
    parser: '@typescript-eslint/parser',
    env: {
      browser: true,
      es6: true,
    },
    extends: ['airbnb'],
    globals: {
      window: true,
      document: true,
    },
    rules: {
      ...IGNORED_RULES,
      ...ENFORCED_RULES,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: IMPORT_EXTENSIONS,
        },
      },
      'import/extensions': IMPORT_EXTENSIONS,
    },
  },
});

const projectPlugin = ({ VERBOSE_LINTING }) => ({
  name: 'plugin.project',
  setup(build) {
    let tsStart;
    let fileList;
    let ignoredRulesLog;

    VERBOSE_LINTING &&
      print.lintingRules({
        ...IGNORED_RULES,
        ...ENFORCED_RULES,
      });

    build.onStart(() => {
      tsStart = new Date();
      fileList = [];
      print.startedLinting();
      ignoredRulesLog = {};
    });

    build.onLoad({ filter: /\.(jsx?|tsx?)$/ }, async (args) => {
      fileList.push(args.path);
      const result = (await eslint.lintFiles([args.path])).pop();

      const { errors, warnings } = result.messages.reduce(
        (acc, message) => {
          const errorOrWarning = {
            text: message.message,
            location: {
              file: result.filePath,
              namespace: build.namespace,
              line: message.line,
              column: message.column,
            },
            detail: message,
          };

          const isEnforced = ENFORCED_RULE_IDS.includes(message.ruleId);

          if (isEnforced && message.severity === 1) {
            acc.warnings.push(errorOrWarning);
          } else if (isEnforced && message.severity === 2) {
            acc.errors.push(errorOrWarning);
          } else {
            ignoredRulesLog[message.ruleId || message.message] =
              message.severity;
          }
          return acc;
        },
        { errors: [], warnings: [] },
      );

      /**
       * `replaceDirname`: used in calls to
       * `createDebugger(key)` to pass `__filename` as `key`.
       *
       * Should ideally be it's own plugin, but `esbuild-plugin-pipe` is
       * needed to pass content-alterations to next plugin, so we just
       * call it as a function while we evaluate the need for this.
       */
      const { contents, loader } =
        errors.length == 0 ? replaceDirname(args) || {} : {};

      return {
        errors,
        warnings,
        contents,
        loader,
      };
    });

    build.onEnd(async ({ errors, warnings, metafile }) => {
      VERBOSE_LINTING && print.ignoredRulesLog(ignoredRulesLog);
      print.finishedLinting({
        filesCount: fileList.length,
        durationMs: new Date(new Date() - tsStart),
      });
    });
  },
});

export { projectPlugin };
