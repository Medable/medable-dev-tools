fs = require('fs-plus')
path = require('path')
jsonfile = require('jsonfile')
junk = require('junk')
sanitize = require('sanitize-filename')
pluralize = require('pluralize')
moment = require('moment')
config = require('./config')
_ = require('underscore')
_.mixin require('underscore.deep')
utils = module.exports =

  basePath: (path) ->
    pathArray = path.split('/')
    pathArray[0]

  capitalizeFirst: (string) ->
    string.charAt(0).toUpperCase() + string.slice(1)

  createDirStructure: (pkg) ->
    elements = []
    for key of pkg
      if pkg.hasOwnProperty(key)
        if ! !pkg[key].pull
          elements.push key
          dir = config.srcDir + '/' + key
          utils.createDir dir
    elements

  createDir: (dir) ->
    if !utils.exists(dir)
      fs.mkdirSync dir
    return

  createFile: (path, body, options={}) ->
    if !utils.exists(path) or options.overwrite
      if options.json
        jsonfile.writeFileSync path, body, spaces: 2
      else
        fs.writeFileSync path, body
    return

  dirName: (filePath) ->
    utils.basePath path.dirname(filePath).replace(config.srcDir + '/', '')

  exists: (path) ->
    fs.existsSync(path);

  inPayload: (id, payload) ->
    _.isObject _.find(payload, (obj) ->
      obj._id == id
    )

  isModified: (path, stats) ->
    if !utils.exists(path)
      return false
    stats = stats or fs.statSync(path)
    mtime = stats.mtime.getTime()
    btime = stats.birthtime.getTime()
    mtime > btime

  processElements: (elements, options) ->
    for i of elements
      utils.processElement elements[i], options
    return

  processElement: (element, options) ->
    if element.hasOwnProperty('templates')
      utils.createDir config.srcDir + '/templates/' + element.type
      for i of element.templates
        element.templates[i].object = 'template'
        element.templates[i].templateType = element.type
        utils.processElement element.templates[i], options
      return
    dir = config.srcDir + '/' + pluralize(element.object) + (if element.type then '/' + pluralize(element.type) else if element.templateType then '/' + element.templateType else '')
    filename = sanitize(element.label or element.name)
    jsonFile = dir + '/' + filename + '.json'
    jsBody = element.script
    task = options.task
    dateString = element.updated or moment().format()
    if task == 'Pushing'
      atom.notifications.addInfo(task+ ' ' + element.object + ': ' + filename);
    if element.object == 'script'
      utils.createDir dir
      jsFile = dir + '/' + filename + '.js'
      delete element.script
      if utils.isModified(jsFile) and !options.overwrite
        atom.notifications.addWarning 'Skipping ' + path.basename(jsFile) + '. Local changes will be lost.<br/>Push changes or use pull force to overwrite locally.'
        return
      if utils.exists(jsFile) and ! !options.overwrite
        fs.unlinkSync jsFile
      fs.writeFileSync jsFile, jsBody
      utils.setDates jsFile, dateString
    if utils.isModified(jsonFile) and !options.overwrite
      atom.notifications.addWarning 'Skipping ' + path.basename(jsonFile) + '. Local changes will be lost.<br/>Push changes or use pull force option to overwrite locally.'
      return
    if utils.exists(jsonFile) and (options.overwrite or element.templateType)
      fs.unlinkSync jsonFile
    options.json = true;
    utils.createFile jsonFile, element, options
    utils.setDates jsonFile, dateString
    return

  readFiles: (pkg, filelist) ->
    if !filelist.length
      atom.notifications.addInfo 'There is nothing to push'
      return
    payload = []
    groupedList = _.groupBy(filelist, (file) ->
      utils.dirName file
    )
    for dir of groupedList
      if ! !pkg[utils.basePath(dir)].push
        groupedList[dir].forEach (file) ->
          jsFile = undefined
          jsonFile = undefined
          obj = {}
          stats = fs.statSync(file)
          if path.extname(file) == '.js'
            jsFile = fs.readFileSync(file, 'utf-8')
            jsonFile = JSON.parse(fs.readFileSync(file + 'on', 'utf-8'))
          else
            jsonFile = JSON.parse(fs.readFileSync(file, 'utf-8'))
            jsFileName = path.basename(file, '.json') + '.js'
            if utils.exists(jsFileName)
              jsFile = fs.readFileSync(jsFileName, 'utf-8')
          if !utils.inPayload(jsonFile._id, payload)
            if jsFile
              jsonFile.script = jsFile
            obj._id = jsonFile._id
            obj.path = dir
            obj.name = path.basename(file)
            obj.created = stats.birthtime
            obj.body = _.deepPick(jsonFile, pkg[utils.dirName(file)].paths)
            payload.push obj
          return
    payload

  setDates: (path, dateString) ->
    if !dateString
      callback()
    date = new Date(dateString)
    fs.utimesSync path, date, date
    return

  truncatedDate: (datestring) ->
    trunc = new Date(datestring)
    trunc.setMilliseconds 0
    trunc

  walkDirs: (dir, filelist) ->
    mdJunk = /^config\.local\.json$|^\.git$|^\.gitignore$/
    junk.re = new RegExp(junk.re.source + mdJunk.source)
    walkdir = dir or config.srcDir
    files = fs.readdirSync(walkdir)
    fullPath = undefined
    stats = undefined
    filelist = filelist or []
    files.filter(junk.not).filter((file) ->
      file != 'config.local.json'
    ).forEach (file) ->
      fullPath = path.join(walkdir, file)
      stats = fs.statSync(fullPath)
      if stats.isDirectory()
        filelist = utils.walkDirs(fullPath, filelist)
      else if utils.isModified(fullPath, stats)
        filelist.push fullPath
      return
    filelist
