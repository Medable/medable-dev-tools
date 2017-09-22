'use strict';

const fs  = require('fs-plus'),
      pkg = require('./package.json');

let config = (module.exports = {
    local: {},
    package: pkg,
    setConfig: () => {
        config.srcDir = atom.project.getPaths()[0];
        if (fs.existsSync(config.srcDir + '/.medable')) {
            config = Object.assign(config, JSON.parse(fs.readFileSync(config.srcDir + '/.medable')));
            return config.enabled = true;
        } else {
            return config.enabled = false;
        }
    }
});