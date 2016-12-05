var fs        = require('fs-plus'),
    package   = require('./package.json'),
    utils     = require('./utils.js');

var srcDir = atom.project.getPaths()[0];

var config = module.exports = {
  local: {},
  package: package,
  setLocalConfig: function(isUpdate) {
    if(Object.keys(config.local).length>0 && !isUpdate) return;
    if(fs.existsSync(srcDir+'/config.local.json')){
      config.local = Object.assign({},JSON.parse(fs.readFileSync(srcDir+'/config.local.json')));
    }
  },
  setConfig: function(isUpdate) {
    config.setLocalConfig(isUpdate),
    config.setEnv(atom.config.get('medable-ide.env'));
    config.setOrg(atom.config.get('medable-ide.org'));
    config.setApiKey(atom.config.get('medable-ide.apiKey'));
  },
  setEnv: function(value) {
    config.env = config.local.env || value;
  },
  setOrg: function(value) {
    config.org = config.local.org || value;
  },
  setApiKey: function(value) {
    config.apiKey = config.local.apiKey || value;
  }
}
