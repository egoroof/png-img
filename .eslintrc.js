module.exports = {
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    globals: {
        assert: false,
        sinon: false
    },
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 2015
    },
    rules: {
        indent: [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        'no-console': 0
    }
};
