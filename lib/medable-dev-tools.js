'use babel';

const   api           = require('./api'),
        utils         = require('./utils'),
        config        = require('./config'),
        async         = require('async'),
        _             = require('underscore');

var     MedableLoginView = require('./medable-login-view'),
        elements      = [],
        localObjects  = [],
        remoteObjects = [],
        force         = false,
        mode;

import { CompositeDisposable } from 'atom'

export default {

  subscriptions: null,

  activate() {
    config.setConfig();
    console.log(config.env);
    utils.watchLocalConfig();

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:pull': () => this.pull()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:forcePull': () => this.forcePull()
    }))

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'medable-dev-tools:push': () => this.push()
    }))

    this.subscriptions.add(
      atom.config.observe('medable-dev-tools.env', value => {
        config.setEnv(value);
      })
    );

    this.subscriptions.add(
      atom.config.observe('medable-dev-tools.org', value => {
        config.setOrg(value);
      })
    );

    this.subscriptions.add(
      atom.config.observe('medable-dev-tools.apiKey', value => {
        config.setApiKey(value);
      })
    );

    MedableLoginView = new MedableLoginView();

  },

  deactivate() {
    this.subscriptions.dispose()
  },

  pull() {
    atom.notifications.addInfo('Pulling all objects');
    force = false;
    mode = 'pull';
    pull()
  },
  forcePull() {
    atom.notifications.addInfo('Force-pulling all objects (will overwrite)');
    mode = 'pull';
    force = true;
    pull()
  },
  push() {
    atom.notifications.addInfo('Pushing scripts');
    mode = 'push';
    push()
  }
};

function pull(){
  async.series([
      login,
      checkScripts,
      doPull
  ], function(err) {
      if( err ) {
          atom.notifications.addError(err);
      } else {
          atom.notifications.addSuccess('Pull complete');
      }
  });
}

function push(){
  async.series([
      login,
      checkScripts,
      doPull,
      doPush
  ], function(err) {
      if( err ) {
          atom.notifications.addError(err);
      } else {
          atom.notifications.addSuccess('Push complete');
      }
  });
}

function doPull(callback) {
    elements = utils.createDirStructure(config.package);
    async.each(elements, function(element, innerCallback) {
        getElements(element, mode, innerCallback)
    }, function(err) {
        if( err ) {
            callback(err)
        } else {
            callback();
        }
    });
}

function doPush(callback) {
  localObjects = utils.readFiles(config.package, utils.walkDirs());
  async.each(localObjects, function(file, innerCallback) {
      pushObject(file, remoteObjects, innerCallback)
  }, function(err) {
      if( err ) {
          callback(err)
      } else {
          callback();
      }
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
    utils.processElement(body, {overwrite:true, task: utils.capitalizeFirst(mode)+'ing'});
    callback();
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
    if(mode=='pull') {
      utils.processElements(body.data, options);
    } else if(mode=='push') {
      remoteObjects = remoteObjects.concat(body.data);
    }
    callback();
  }, this);
}

function login(callback) {
  var statusUrl  = api.baseUrl()+'accounts/status';
  api.get(statusUrl, function(err, response, body) {
    if(err || !body.data.loggedin) {
      MedableLoginView.show(callback);
    } else {
      callback();
    }
  });
}

function checkScripts(callback) {
  console.log('checking scripts');
  var scriptUrl  = api.baseUrl()+'scripts';
  api.get(scriptUrl, {where: {'configuration.path':"ide/:element"}}, function(err, response, body) {
    if(err || !body.data.length) {
      console.log('screating scripts');
      createScripts(callback);
    } else {
      callback();
    }
  });

  function createScripts(callback) {
    var scriptUrl  = api.baseUrl()+'scripts';
    api.post(scriptUrl, config.script, function(err, response, body) {
      if(err) {
        callback(err);
      } else {
        console.log('gtg!');
        callback();
      }
    });
}
