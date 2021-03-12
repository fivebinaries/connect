const { CACHE } = require('../__txcache__');

const TrezorReporter = (rootConfig, logger) => {
    const log = logger.create('reporter.trezor');

    return {
        onRunStart: () => {
            log.warn('onRunStart');
            global.TX_CACHE2 = 'FOO';
        },

        onBrowserStart: () => {
            log.warn('onBrowserStart');
        },

        onBrowserComplete: () => {
            log.warn('onBrowserComplete');
        },

        onSpecStarted: () => {
            log.warn('onSpecStarted');
        },

        onSpecComplete: () => {
            log.warn('onSpecComplete');
        },

        onRunComplete: () => {
            log.warn('onRunComplete');
        },

        onExit: done => {
            log.warn('Stop python server');
            if (global.pythonProcess) {
                global.pythonProcess = null;
            } else {
                log.warn('Kill python server: Server not found');
            }
            done();
        },
    };
};

TrezorReporter.$inject = ['config', 'logger'];

// node.js "fs" package is not available in karma (browser) env.
// stringify CACHE object and inject it into a browser global.TestUtils context
const cachedTxPreprocessor = (_logger, _basePath) => (content, file, done) => {
    done(`const CACHE=${JSON.stringify(CACHE)}; TestUtils.TX_CACHE = hash => CACHE[hash];`);
};
cachedTxPreprocessor.$inject = ['logger', 'config.basePath'];

module.exports = {
    'preprocessor:cachedTx': ['factory', cachedTxPreprocessor],
    'reporter:trezor': ['type', TrezorReporter],
};
