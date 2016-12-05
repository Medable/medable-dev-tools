var fs          = require('fs-plus'),
    path        = require('path'),
    jsonfile    = require('jsonfile'),
    junk        = require('junk'),
    sanitize    = require("sanitize-filename"),
    pluralize   = require('pluralize'),
    moment      = require('moment'),
    _           = require('underscore');
    _.mixin(require('underscore.deep')),
    config      = require('./config.js');

var srcDir = atom.project.getPaths()[0];

var utils = module.exports = {

    basePath: function(path) {
      var pathArray = path.split( '/' );
      return pathArray[0];
    },

    capitalizeFirst: function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    createDirStructure: function(package) {
        var elements = [];

        for(var key in package) {
          if (package.hasOwnProperty(key)) {
            if(!!package[key].pull) {
              elements.push(key);
              var dir = srcDir+'/'+key;
              utils.createDir(dir);
            }
          }
        }

        return elements;
    },

    createDir: function(dir) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    },

    dirName: function(filePath) {
      return utils.basePath(path.dirname(filePath).replace(srcDir+'/',''));
    },

    inPayload: function(id, payload) {
      return _.isObject(_.find(payload, function(obj) { return obj._id == id }));
    },

    isModified: function(path, stats) {
      if(!fs.existsSync(path)) return false;

      var stats   = stats || fs.statSync(path);
          mtime   = stats.mtime.getTime(),
          btime   = stats.birthtime.getTime();

      return  mtime > btime;
    },

    processElements: function(elements, options) {
        for(var i in elements){
          utils.processElement(elements[i], options);
        }
    },

    processElement: function(element, options) {
        if(element.hasOwnProperty('templates')) {
            utils.createDir(srcDir+'/templates/'+element.type);
            for(var i in element.templates){
              element.templates[i].object = 'template';
              element.templates[i].templateType = element.type;
              utils.processElement(element.templates[i], options);
            }
            return;
        }

        var dir         = srcDir+'/'+pluralize(element.object)+((element.type)?'/'+pluralize(element.type):(element.templateType)?'/'+element.templateType:''),
            filename    = sanitize(element.label || element.name),
            jsonFile    = dir + '/'+filename+'.json',
            jsBody      = element.script,
            task        = options.task;

        var dateString = element.updated || moment().format();

        //atom.notifications.addInfo(task+ ' ' + element.object + ': ' + filename);
        if(element.object == 'script') {
            utils.createDir(dir);
            var jsFile  = dir + '/'+filename+'.js';
            delete element.script;
            if(utils.isModified(jsFile)&&!options.overwrite) {
              atom.notificaitons.addWarning('Skipping '+path.basename(jsFile)+'. Local changes will be lost.<br/>Push changes or use pull force to overwrite locally.');
              return;
            }
            if(fs.existsSync(jsFile)&&!!options.overwrite) {
                fs.unlinkSync(jsFile);
            }
            fs.writeFileSync(jsFile, jsBody);
            utils.setDates(jsFile, dateString);
        }
        if(utils.isModified(jsonFile)&&!options.overwrite) {
          atom.notificaitons.addWarning('Skipping '+path.basename(jsonFile)+'. Local changes will be lost.<br/>Push changes or use pull force option to overwrite locally.');
          return;
        }
        if(fs.existsSync(jsonFile)&&(!!options.overwrite||!!element.templateType)) {
            fs.unlinkSync(jsonFile);
        }
        jsonfile.writeFileSync(jsonFile, element, {spaces: 2});
        utils.setDates(jsonFile, dateString);
    },

    readFiles: function(package, filelist) {
      if(!filelist.length) {
        atom.notifications.addInfo('There is nothing to push');
        return;
      }
      var payload       = [],
          groupedList = _.groupBy(filelist,function(file) { return utils.dirName(file); });

      for(var dir in groupedList) {
        if(!!package[utils.basePath(dir)].push) {
          groupedList[dir].forEach(function(file) {
              var jsFile, jsonFile,
                  obj = {},
                  stats = fs.statSync(file);
              if(path.extname(file)=='.js') {
                jsFile    = fs.readFileSync(file, "utf-8");
                jsonFile  = JSON.parse(fs.readFileSync(file+'on', "utf-8"));
              } else {
                jsonFile  = JSON.parse(fs.readFileSync(file, "utf-8"));
                var jsFileName = path.basename(file,'.json')+'.js';
                if(fs.existsSync(jsFileName)) {
                  jsFile  = fs.readFileSync(jsFileName, "utf-8");
                }
              }
              if(!utils.inPayload(jsonFile._id, payload)) {
                if(jsFile) {
                  jsonFile.script = jsFile;
                }
                obj._id = jsonFile._id;
                obj.path = dir;
                obj.name = path.basename(file);
                obj.created = stats.birthtime;
                obj.body = _.deepPick(jsonFile,package[utils.dirName(file)].paths);
                payload.push(obj);
              }
          });
        }
      }
      return payload;
    },

    setDates: function(path, dateString) {
        if(!dateString) {
          callback();
        }
        var date = new Date(dateString);
        fs.utimesSync(path, date, date);
    },

    truncatedDate: function(datestring) {
      var trunc = new Date(datestring);
      trunc.setMilliseconds(0);

      return trunc;
    },

    walkDirs: function(dir, filelist) {
      var mdJunk = /^config\.local\.json$|^\.git$|^\.gitignore$/;
      junk.re = new RegExp(junk.re.source + mdJunk.source);
      var walkdir = dir || srcDir,
          files = fs.readdirSync(walkdir),
          fullPath, stats;

      filelist = filelist || [];
      files.filter(junk.not).filter(function(file){return file!='config.local.json'}).forEach(function(file) {
        fullPath = path.join(walkdir, file);
        stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          filelist = utils.walkDirs(fullPath, filelist);
        }
        else if(utils.isModified(fullPath, stats)) {
          filelist.push(fullPath);
        }
      });
      return filelist;
    },

    watchLocalConfig: function() {
      var localConfig = srcDir+'/config.local.json';
      if(fs.existsSync(localConfig)){
        console.log('Detected local config');
        fs.watchFile(localConfig, function(curr,prev) {
            console.log('Local config updated');
            config.setConfig(true);
        });
      }
    }
};
