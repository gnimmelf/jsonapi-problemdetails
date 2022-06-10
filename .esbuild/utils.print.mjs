import { formatMessages } from 'esbuild'

export const COLORS = {
    SUCCESS: '\x1b[32m%s\x1b[0m',
    INFO: '\x1b[34m%s\x1b[0m',
    WARNING: '\x1b[43m',
    ERROR: '\x1b[41m',
};

export const settings = (settings) => {
    console.info(COLORS.SUCCESS, 'Settings')
    console.dir(settings)
}

export const lintingRules = (rules) => {
    console.info(COLORS.SUCCESS, 'Linting rules:')
    console.dir(rules)
}

export const initiateBuild = () => {
    console.info(COLORS.SUCCESS, 'Initiating frontend build')
}

export const esbuildStart = () => {
    console.info(COLORS.INFO, 'Building frontend')
    console.info(COLORS.INFO, '__Log from esbuild start__')
}

export const esbuildDone = async () => {
    console.info(COLORS.INFO, '__Log from esbuild finished__')
}

export const finishedBuilding = () => {
    console.info(
        COLORS.SUCCESS,
        `[${new Date().toLocaleTimeString()}] Finished frontend build`
    )
}

export const removeOldBuildFiles = () => {
    console.info(COLORS.INFO, 'Removing old build files...')
}

export const startedLinting = () => {
    console.log(COLORS.SUCCESS, 'Started linting...')
}

export const finishedLinting = ({ filesCount, durationMs }) => {
    console.log(COLORS.SUCCESS, `Finished linting ${filesCount} files in ${durationMs / 1000} seconds (plugin.eslint.mjs)`)
}

export const waitingForChange = () => {
    console.info('Waiting for changes...')
}

export const watchCanceledByInitialErrors = () => {
    console.info('Watch canceled due to initial errors. (Too tricky to implement, blame esbuild!)')
}

export const copyIndexFile = ({ PUBLIC_DIR, DIST_DIR }) => {
    console.info(COLORS.INFO, `Copying index file from ${PUBLIC_DIR} to ${DIST_DIR}`)
}

export const changeDetected = ({ errorsAndWarnings } = {}) => {
    const hasErrors = errorsAndWarnings && errorsAndWarnings.errors.length
    console.info(`Change detected${hasErrors ? '...' : ', finalizing...'}`)
}

export const ignoredRulesLog = (ignoredRulesLog) => {
    const ignoredRulesList = Object.entries(ignoredRulesLog)
    ignoredRulesList.forEach(([id, severity]) => {
        console.log(COLORS.INFO, 'Ignored:', id, { severity })
    })
    console.log(COLORS.SUCCESS, `Ignored ${ignoredRulesList.length} linting rules`)
}

export const errorsAndWarnings = async ({ errorsAndWarnings, MAX_ERRORS, MAX_WARNINGS }) => {

    const warningsList = errorsAndWarnings.warnings.slice(0, MAX_WARNINGS)
    if (warningsList.length) {
        console.info(COLORS.INFO, '__Linting warnings__')
        // warningsList.forEach((warn) => console.log(warn))
        process.stdout.write((await formatMessages(warningsList, { kind: 'warning' })).join(''))
    }

    const errorList = errorsAndWarnings.errors.slice(0, MAX_ERRORS)
    if (errorList.length) {
        console.info(COLORS.INFO, '__Linting errors__')
        // errorList.forEach((err) => console.log(err))
        process.stdout.write((await formatMessages(errorList, { kind: 'error' })).join(''))
    }

    console.info(COLORS.INFO, `__${warningsList.length}/${errorsAndWarnings.warnings.length} warnings logged__`)
    console.info(COLORS.INFO, `__${errorList.length}/${errorsAndWarnings.errors.length} errors logged__`)
}

export const reloadServerReady = ({ port }) => {
    console.info(COLORS.INFO, `Live reload server listening at port ${port}`);
}

export const reloadServeOnConnect = ({ clientCount }) => {
    console.log(`Reloadserver recieved client #${clientCount} connection`)
}