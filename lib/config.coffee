fs = require('fs-plus')
pkg = require('./package.json')
script = require('./script.json')
utils = require('./utils')
config = module.exports =
  local: {}
  package: pkg
  script: script
  setConfig: ->
    config.srcDir = atom.project.getPaths()[0]
    if fs.existsSync(config.srcDir + '/.medable')
      config = Object.assign(config, JSON.parse(fs.readFileSync(config.srcDir + '/.medable')))
      config.enabled = true;
    else
      config.enabled = false;
