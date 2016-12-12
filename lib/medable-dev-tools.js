'use babel';

const   api           = require('./api'),
        utils         = require('./utils'),
        config        = require('./config'),
        async         = require('async'),
        _             = require('underscore'),
        MedableLoginView = require('./medable-login-view'),
        MedableSettingsView = require('./medable-settings-view');

var     elements      = [],
        localObjects  = [],
        remoteObjects = [],
        force         = false,
        mode;

import { CompositeDisposable } from 'atom'

export default {

  subscriptions: null,

  activate() {
    init();

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:enable': () => this.enable()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:addProject': () => this.addProject()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:pull': () => this.pull()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:forcePull': () => this.forcePull()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:push': () => this.push()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:showSettings': () => this.showSettings()
    }))
  },

  enable() {
    init(true);
  },
  deactivate() {
    this.subscriptions.dispose()
  },
  pull() {
    force = false;
    mode = 'pull';
    _pull()
  },
  forcePull() {
    mode = 'pull';
    force = true;
    _pull()
  },
  push() {
    mode = 'push';
    _push()
  },
  showSettings() {
    _showSettings();
  },
  addProject(){
    _addProject();
  }
};

function init(enable){
  config.setConfig();
  if(enable && atom.project.getPaths().length==0) {
    atom.confirm({
      message: "Add Project Folder...",
      detailedMessage: "To use the Medable developer tools, you need to first open a project folder.",
      buttons: {
        Ok: _addProject,
        Cancel: cancel
      }
    });
  } else if(enable) {
    updateMenu('full');
    _showSettings();
  } else if(config.enabled) {
    updateMenu('full');
  }
}

function cancel() {
  //do something
}

function deactivate() {
  //do something
}

function _showSettings() {
  var settingsView = new MedableSettingsView();
  settingsView.show();
}

function _addProject() {
  atom.pickFolder(function(selectedPaths){
    selectedPaths = selectedPaths || [];
    selectedPaths.forEach(function(selectedPath){
      atom.project.addPath(selectedPath);
    });
    config.srcDir = atom.project.getPaths()[0];
    config.setConfig();
    updateMenu('full');
    _showSettings();
  });
}

function updateMenu(mode){
  mode = mode || 'noproj';
  let noProject = {"label":"Medable","submenu":[{"label":"Add Project...","command":"medable-dev-tools:addProject"}]},
      noConfig = {"label":"Medable","submenu":[{"label":"Add Project...","command":"medable-dev-tools:addProject"}]},
      fullMenu = {"label":"Medable","submenu":[{"label":"Pull All","command":"medable-dev-tools:pull"},{"label":"Pull All (Force)","command":"medable-dev-tools:forcePull"},{"label":"Push Scripts","command":"medable-dev-tools:push"},{"type":"separator"},{"label":"Settings...","command":"medable-dev-tools:showSettings"}]},
      menu = {};
      i = _.findIndex(atom.menu.template, function(item) { return item.label == "Medable" });

  switch(mode) {
    case 'noconfig':
        menu = noConfig;
        break;
    case 'full':
        menu = fullMenu
        break;
    default:
        menu = noProject;
  }

  if (i==-1) {
    atom.menu.template.push(menu);
  } else {
    atom.menu.template[i].submenu = menu;
  }

  atom.menu.update();
}

function _pull(){
  if(atom.project.getPaths().length>1) {
    atom.confirm({
      message: "Note",
      detailedMessage: "The Medable development tool doesn't currently support multiple project folders. Your org info will get synced with the first folder in your project only."
    });
  }
  async.series([
      login,
      checkScripts,
      doPull
  ], function(err) {
      if( err ) {
          atom.notifications.addError(JSON.stringify(err));
      } else {
          atom.notifications.addSuccess('Pull complete');
      }
  });
}

function _push(){
  atom.notifications.addInfo('Pushing scripts');
  async.series([
      login,
      checkScripts,
      doPull,
      doPush
  ], function(err) {
      if( err ) {
          atom.notifications.addError(JSON.stringify(err));
      } else {
          atom.notifications.addSuccess('Push complete');
      }
  });
}

function doPull(callback) {
    if(mode=='pull') {
      var notif = (force) ? 'Force-pulling all objects (will overwrite)' : 'Pulling all objects';
      atom.notifications.addInfo(notif);
    }
    elements = utils.createDirStructure(config.package);
    async.each(elements, function(element, innerCallback) {
        getElements(element, mode, innerCallback)
    }, function(err) {
        callback(err);
    });
}

function doPush(callback) {
  localObjects = utils.readFiles(config.package, utils.walkDirs());
  async.each(localObjects, function(file, innerCallback) {
      pushObject(file, remoteObjects, innerCallback)
  }, function(err) {
      callback(err);
  });
}

function pushObject(file, remoteObjects, callback) {
  var url = api.baseUrl(),
      remoteObj = _.find(remoteObjects, function(obj) { return obj._id == file._id }),
      remoteUpdated = utils.truncatedDate(remoteObj.updated);

  url += file.path + '/' + file._id;
  if(_.isObject(remoteObj)&&(remoteUpdated.getTime() > file.created.getTime())) {
    atom.notifications.addWarning('"'+file.name+'" has been modified on server.<br/>Do a "pull force" to overwrite locally with the remote changes');
    return;
  }
  api.put(url, file.body, function (err, response, body) {
    if(err) {
      callback(err)
    } else
      utils.processElement(body, {overwrite:true, task: utils.capitalizeFirst(mode)+'ing'});
      callback();
    }
  });
}

function getElements(element, mode, callback) {
  var path = config.package[element].path || '',
      url = api.baseUrl() + path + element,
      options = {task: utils.capitalizeFirst(mode)+'ing'};
  if(mode=='push') url+='?paths=updated';
  if(mode=='pull' && force) {
    options.overwrite = true;
  }
  api.get(url, function (err, response, body) {
    if(err) {
      callback(err)
    } else {
      if(mode=='pull') {
        utils.processElements(body.data, options);
      } else if(mode=='push') {
        remoteObjects = remoteObjects.concat(body.data);
      }
      callback();
    }
  }, this);
}

function login(callback) {
  var statusUrl  = api.baseUrl()+'accounts/status';
  api.get(statusUrl, function(err, response, body) {
    if(err || !body.data.loggedin) {
      var logiView = new MedableLoginView();
      logiView.show(callback);
    } else {
      callback();
    }
  });
}

function checkScripts(callback) {
  var scriptUrl  = api.baseUrl()+'scripts?where={"configuration.path":"'+config.script.configuration.path+'"}';
  api.get(scriptUrl, function(err, response, body) {
    if(err) {
      callback(err);
    } else if (body.data.length==0) {
      atom.notifications.addInfo('Checking dependencies...');
      createScripts(callback);
    } else {
      callback();
    }
  });
}

  function createScripts(callback) {
    atom.notifications.addInfo('Updating dependencies...')
    var scriptUrl  = api.baseUrl()+'scripts';
    api.post(scriptUrl, config.script, function(err, response, body) {
      if(err) {
        callback(err);
      } else {
        atom.notifications.addSuccess('Dependencies updated')
        callback();
      }
    });
  }
