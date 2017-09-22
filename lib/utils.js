'use strict';

const fs = require('fs-plus'),
      path = require('path'),
      jsonfile = require('jsonfile'),
      junk = require('junk'),
      sanitize = require('sanitize-filename'),
      pluralize = require('pluralize'),
      moment = require('moment'),
      config = require('./config'),
      _ = require('underscore');

_.mixin(require('underscore.deep'));

const utils = (module.exports = {

    basePath(path) {
        let pathArray = path.split('/');
        return pathArray[0];
    },

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    createDirStructure(pkg) {
        let elements = [];
        for (let key in pkg) {
            if (pkg.hasOwnProperty(key)) {
                if (!!pkg[key].pull) {
                    elements.push(key);
                    let dir = config.srcDir + '/' + key;
                    utils.createDir(dir);
                }
            }
        }
        return elements;
    },

    createDir(dir) {
        if (!utils.exists(dir)) {
            fs.mkdirSync(dir);
        }
    },

    createFile(path, body, options) {
        if (!options) { options = {}; }
        if (!utils.exists(path) || options.overwrite) {
            if (options.json) {
                jsonfile.writeFileSync(path, body, {spaces: 2});
            } else {
                fs.writeFileSync(path, body);
            }
        }
    },

    dirName(filePath) {
        return utils.basePath(path.dirname(filePath).replace(config.srcDir + '/', ''));
    },

    exists(path) {
        return fs.existsSync(path);
    },

    inPayload(id, payload) {
        return _.isObject(_.find(payload, obj => obj._id === id)
        );
    },

    isModified(path, stats) {
        if (!utils.exists(path)) {
            return false;
        }
        stats = stats || fs.statSync(path);
        let mtime = stats.mtime.getTime();
        let btime = stats.birthtime.getTime();
        return mtime > btime;
    },

    processElements(elements, options) {
        for (let i in elements) {
            if (elements.hasOwnProperty(i)) {
                utils.processElement(elements[i], options);
            }
        }
    },

    processElement(element, options) {
        if (element.hasOwnProperty('templates')) {
            utils.createDir(config.srcDir + '/templates/' + element.type);
            for (let i in element.templates) {
                if (element.templates.hasOwnProperty(i)) {
                    element.templates[i].object = 'template';
                    element.templates[i].templateType = element.type;
                    utils.processElement(element.templates[i], options);
                }
            }
            return;
        }
        let dir = config.srcDir + '/' + pluralize(element.object) + (element.type ? `/${pluralize(element.type)}` : element.templateType ? `/${element.templateType}` : '');
        let filename = sanitize(element.label || element.name);
        let jsonFile = dir + '/' + filename + '.json';
        let jsBody = element.script;
        let { task } = options;
        let dateString = element.updated || moment().format();
        if (task === 'Pushing') {
            atom.notifications.addInfo(task+ ' ' + element.object + ': ' + filename);
        }
        if (element.object === 'script') {
            utils.createDir(dir);
            let jsFile = dir + '/' + filename + '.js';
            delete element.script;
            if (utils.isModified(jsFile) && !options.overwrite) {
                atom.notifications.addWarning(`Skipping ${path.basename(jsFile)}. Local changes will be lost.<br/>Push changes or use pull force to overwrite locally.`);
                return;
            }
            if (utils.exists(jsFile) && options.overwrite) {
                fs.unlinkSync(jsFile);
            }
            fs.writeFileSync(jsFile, jsBody);
            utils.setDates(jsFile, dateString);
        }
        if (utils.isModified(jsonFile) && !options.overwrite) {
            atom.notifications.addWarning(`Skipping ${path.basename(jsonFile)}. Local changes will be lost.<br/>Push changes or use pull force option to overwrite locally.`);
            return;
        }
        if (utils.exists(jsonFile) && (options.overwrite || element.templateType)) {
            fs.unlinkSync(jsonFile);
        }
        options.json = true;
        utils.createFile(jsonFile, element, options);
        utils.setDates(jsonFile, dateString);
    },

    readFiles(pkg, filelist) {
        if (!filelist.length) {
            atom.notifications.addInfo('There is nothing to push');
            return;
        }
        let payload = [];
        let groupedList = _.groupBy(filelist, file => utils.dirName(file));
        for (let dir in groupedList) {
            if (groupedList.hasOwnProperty(dir)) {
                const opts = pkg[utils.basePath(dir)];
                if (opts && opts.push) {
                    groupedList[dir].forEach(function(file) {
                        let jsFile = undefined;
                        let jsonFile = undefined;
                        let obj = {};
                        let stats = fs.statSync(file);
                        if (path.extname(file) === '.js') {
                            jsFile = fs.readFileSync(file, 'utf-8');
                            jsonFile = JSON.parse(fs.readFileSync(file + 'on', 'utf-8'));
                        } else {
                            jsonFile = JSON.parse(fs.readFileSync(file, 'utf-8'));
                            let jsFileName = path.basename(file, '.json') + '.js';
                            if (utils.exists(jsFileName)) {
                                jsFile = fs.readFileSync(jsFileName, 'utf-8');
                            }
                        }
                        if (!utils.inPayload(jsonFile._id, payload)) {
                            if (jsFile) {
                                jsonFile.script = jsFile;
                            }
                            obj._id = jsonFile._id;
                            obj.path = dir;
                            obj.name = path.basename(file);
                            obj.created = stats.birthtime;
                            obj.body = _.deepPick(jsonFile, pkg[utils.dirName(file)].paths);
                            payload.push(obj);
                        }
                    });
                }
            }

        }
        return payload;
    },

    setDates(path, dateString) {
        if (!dateString) {
            callback();
        }
        let date = new Date(dateString);
        fs.utimesSync(path, date, date);
    },

    truncatedDate(datestring) {
        let trunc = new Date(datestring);
        trunc.setMilliseconds(0);
        return trunc;
    },

    walkDirs(dir, filelist) {
        let mdJunk = /^config\.local\.json$|^\.git$|^\.gitignore$/;
        junk.re = new RegExp(junk.re.source + mdJunk.source);
        let walkdir = dir || config.srcDir;
        let files = fs.readdirSync(walkdir);
        let fullPath = undefined;
        let stats = undefined;
        filelist = filelist || [];
        files.filter(junk.not).filter(file => file !== 'config.local.json').forEach(function(file) {
            fullPath = path.join(walkdir, file);
            stats = fs.statSync(fullPath);
            if (stats.isDirectory()) {
                filelist = utils.walkDirs(fullPath, filelist);
            } else if (utils.isModified(fullPath, stats)) {
                filelist.push(fullPath);
            }
        });
        return filelist;
    }
});
