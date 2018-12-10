'use babel'

import config from './config'
import consts from './consts'
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import junk from 'junk'
import sanitize from 'sanitize-filename'
import pluralize from 'pluralize'
import moment from 'moment'
import _ from 'underscore'

_.mixin(require('underscore.deep'))
let Undefined
const nativeToString = Object.prototype.toString,
      utils = module.exports = {

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

    deepEquals(actual, expected, opts) {
        if (!opts) opts = {}
        if (opts.strict === null || opts.strict === Undefined) opts.strict = true
        // 7.1. All identical values are equivalent, as determined by ===.
        if (actual === expected) {
          return true
    
        } else if (actual instanceof Date && expected instanceof Date) {
          return actual.getTime() === expected.getTime()
    
        } else if (actual instanceof RegExp && expected instanceof RegExp) {
          return String(actual) === String(expected)
    
          // 7.3. Other pairs that do not both pass typeof value == 'object',
          // equivalence is determined by ==.
        } else if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
          // noinspection EqualityComparisonWithCoercionJS
          // eslint-disable-next-line eqeqeq
          return opts.strict ? actual === expected : actual == expected
    
          // 7.4. For all other Object pairs, including Array objects, equivalence is
          // determined by having the same number of owned properties (as verified
          // with Object.prototype.hasOwnProperty.call), the same set of keys
          // (although not necessarily the same order), equivalent values for every
          // corresponding key, and an identical 'prototype' property. Note: this
          // accounts for both named and indexed properties on Arrays.
        } else {
          return utils.objEquiv(actual, expected, opts)
        }
    },

    dirName(filePath) {
        return utils.basePath(path.dirname(filePath).replace(config.srcDir + '/', ''));
    },

    exists(path) {
        return fs.existsSync(path);
    },

    inPayload(id, payload) {return utils.isObject(payload.find(obj => obj._id === id))},

    isArguments(object) {return toString.call(object) === '[object Arguments]'},

    isBuffer(x) {
        if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false
        if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
          return false
        }
        return !(x.length > 0 && typeof x[0] !== 'number')
      
    },
    
    isEmptyObject(obj) {return Object.keys(obj).length === 0 && utils.isObject(obj)},

    isFunction(obj) {return nativeToString.call(obj) === '[object Function]'},

    isModified(path, stats) {
        if (!utils.exists(path)) {
            return false;
        }
        stats = stats || fs.statSync(path);
        let mtime = stats.mtime.getTime();
        let btime = stats.birthtime.getTime();
        return mtime > btime;
    },

    isObject(obj) {return obj.constructor === Object && !(obj instanceof Date) && !Array.isArray(obj)},

    isString(obj) {return nativeToString.call(obj) === '[object String]'},

    isUndefinedOrNull(value) {return value === null || value === Undefined},

    mergeDeep(target, ...sources) {
        if (!sources.length) return target
        const source = sources.shift()

        if (utils.isObject(target) && utils.isObject(source)) {
            for (const key in source) {
            if (utils.isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} })
                utils.mergeDeep(target[key], source[key])
            } else {
                Object.assign(target, { [key]: source[key] })
            }
            }
        }

        return utils.mergeDeep(target, ...sources)
    },

    objEquiv(a, b, opts) {

        if (utils.isUndefinedOrNull(a) || utils.isUndefinedOrNull(b)) { return false }
        // an identical 'prototype' property.
        if (a.prototype !== b.prototype) return false
        // ~~~I've managed to break Object.keys through screwy arguments passing.
        //   Converting to array solves the problem.
        if (utils.isArguments(a)) {
          if (!utils.isArguments(b)) {
            return false
          }
          a = pSlice.call(a)
          b = pSlice.call(b)
          return utils.deepEquals(a, b, opts)
        }
        if (utils.isBuffer(a)) {
          if (!utils.isBuffer(b)) {
            return false
          }
          if (a.length !== b.length) return false
          for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false
          }
          return true
        }
        let ka, kb
        try {
          ka = objectKeys(a)
          kb = objectKeys(b)
        } catch (e) { // happens when one is a string literal and the other isn't
          return false
        }
        // having the same number of owned properties (keys incorporates
        // hasOwnProperty)
        if (ka.length !== kb.length) { return false }
        // the same set of keys (although not necessarily the same order),
        ka.sort()
        kb.sort()
        // ~~~cheap key test
        for (let i = ka.length - 1; i >= 0; i--) {
          // noinspection EqualityComparisonWithCoercionJS
          // eslint-disable-next-line eqeqeq
          if (ka[i] != kb[i]) { return false }
        }
        // equivalent values for every corresponding key, and
        // ~~~possibly expensive deep test
        for (let i = ka.length - 1; i >= 0; i--) {
          let key = ka[i]
          if (!utils.deepEquals(a[key], b[key], opts)) return false
        }
        return typeof a === typeof b
    },

    path({obj, path, value, forceWrite}) {
        var i, p = path.split('.'), write = value !== undefined || forceWrite
        if (write) {
          if (obj == null) obj = {}
          for (i = 0; i < p.length - 1; i++) {
            if (obj[p[i]] == null) obj[p[i]] = {}
            obj = obj[p[i]]
          }
          obj[p[p.length - 1]] = value
        } else {
          for (i = 0; i < p.length; i++) {
            if (obj != null) obj = obj[p[i]]
          }
        }
        return obj
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

    stringify(v) {
        return utils.isString(v) ? v : JSON.stringify(v)
    },

    truncatedDate(datestring) {
        let trunc = new Date(datestring);
        trunc.setMilliseconds(0);
        return trunc;
    },

    updateMenu() {

        atom.contextMenu.add({[consts.menu.selector.project]: consts.menu.project.settings})
    
        const projects = Object.keys(config.full())
    
        projects.forEach(p => {
            if (config(p, 'accessToken')) {
                const projectPath = `[data-path="${p}"]`
                atom.contextMenu.add({[projectPath]: consts.menu.project.full})
            }
        })
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
}
