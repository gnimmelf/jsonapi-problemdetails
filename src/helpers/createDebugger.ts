import debug from 'debug';

/**
 * Setup:
 * ```
 * const debug = createDebugger(__filename)
 * const debug2= createDebugger(`${__filename}:whatever`)
 * [...]
 * debug('functionName', { data })
 * ```
 *
 * Usage:
 * 1. Open dev-console in browser
 * 2. Include `verbose` output level in addition to errors, warings etc.
 * 3. Set `localStorage.debug="*"`
 * 4. Refresh
 *
 * `localStorage.debug` filters console-output by `key` param, so `localStorage.debug="*"` includes output from all debuggers in codebase
 * `localStorage.debug accepts multiple wildcards, eg "*AutoLogout*", and filters accoringly
 * @param key string
 * @returns debug instace
 */
export const createDebugger = (key) => {
  return debug(key);
};
