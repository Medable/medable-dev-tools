fs = require('fs-plus')
pkg = require('./package.json')
script = require('./script.json')
utils = require('./utils')
srcDir = atom.project.getPaths()[0]
config = module.exports =
  local: {}
  package: pkg
  script: script
  setLocalConfig: (isUpdate) ->
    if Object.keys(config.local).length > 0 and !isUpdate
      return
    if fs.existsSync(srcDir + '/config.local.json')
      config.local = Object.assign({}, JSON.parse(fs.readFileSync(srcDir + '/config.local.json')))
    return
  setConfig: (isUpdate) ->
    config.setLocalConfig(isUpdate)
    config.setEnv(atom.config.get('medable-ide.env'))
    config.setOrg atom.config.get('medable-ide.org')
    config.setApiKey atom.config.get('medable-ide.apiKey')
    return
  setEnv: (value) ->
    config.env = config.local.env or value
    return
  setOrg: (value) ->
    config.org = config.local.org or value
    return
  setApiKey: (value) ->
    config.apiKey = config.local.apiKey or value
    return
