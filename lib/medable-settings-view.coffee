{View} = require 'space-pen'
utils = require './utils'
config = require './config'

MiniTextView = require './views/mini-text-view'

module.exports =
  class MedableSettingsView extends View

    @content: ->
      @div class: 'control-group', =>
        @div class: 'controls', =>
          @h1 'Medable Project Settings'
          @div class: 'controls', =>
            @div class: 'editor-container medable', =>
              @subview 'envEditor', new MiniTextView("Environment")
              @div class: 'text-error block', outlet: 'errorLabel'

          @label class: 'medable control-label', =>
            @div class: 'setting-description', =>
              @raw('The Medable environment you wish to connect to (e.g. api.dev.medable.com for development or api.medable.com for production).')

          @div class: 'controls', =>
            @div class: 'editor-container medable', =>
              @subview 'orgNameEditor', new MiniTextView("Org name")

          @label class: 'medable control-label', =>
            @div class: 'setting-description', =>
              @raw('The the unique name for your org. This is the org name you provided when signing up.')

          @div class: 'controls', =>
            @div class: 'editor-container medable', =>
              @subview 'apiKeyEditor', new MiniTextView("API Key")

          @label class: 'medable control-label', =>
            @div class: 'setting-description', =>
              @raw('The api key for connecting to your org. ')
              @a outlet: 'apiLink', 'Get API Key'

          @div class: 'block', =>
            @button id: 'saveButton', class: 'btn btn-primary', outlet: 'saveButton', 'Save'
            @button id: 'cancelButton', class: 'btn', outlet: 'cancelButton', 'Cancel'

    initialize: ->
      @modalPanel = atom.workspace.addModalPanel(item: this, visible: false)
      @envModel = @envEditor.getModel()
      @orgNameModel = @orgNameEditor.getModel()
      @apiKeyModel = @apiKeyEditor.getModel()

    destroy: ->
      @detach()

    show: ->
      @enable()
      @watchevents()
      @setApiLink()
      @errorLabel.hide()
      @modalPanel.show()
      @envEditor.focus()

    hide: ->
      @envModel.setText ''
      @orgNameModel.setText ''
      @apiKeyModel.setText ''
      @modalPanel.hide()

    cancel: ->
      @hide()

    disable: ->
      @envEditor.setEnabled false
      @orgNameEditor.setEnabled false
      @apiKeyEditor.setEnabled false
      @saveButton.attr 'disabled', 'disabled'

    enable: ->
      @envModel.setText config.env or ''
      @envEditor.setEnabled true
      @orgNameModel.setText config.org or ''
      @orgNameEditor.setEnabled true
      @apiKeyModel.setText config.apiKey or ''
      @apiKeyEditor.setEnabled true
      @saveButton.removeAttr 'disabled'

    save: ->
      @disable()

      @env = @envModel.getText()
      @orgName = @orgNameModel.getText()
      @apiKey = @apiKeyModel.getText()

      configBody =
        env: @env
        org: @orgName
        apiKey: @apiKey

      utils.createFile(config.srcDir+'/.medable', configBody, {overwrite: true, json:true});
      config.setConfig();
      atom.notifications.addSuccess('Settings saved')
      @hide();

    setApiLink: ->
      if (@envModel.getText() and @orgNameModel.getText())
        @apiLink.attr 'href': 'https://'+@envModel.getText().replace('api','app')+'/'+@orgNameModel.getText()+'/settings/apps'
        @apiLink.show()
      else
        @apiLink.hide()

    validateEnv: ->
      envreg = /api\S+medable\.com/
      @envModel.invalid = !envreg.test(@envModel.getText())
      if @envModel.invalid
        @errorLabel.text('Enter a valid environment. Be sure it starts with "api"')
        @errorLabel.show()
      else
        @errorLabel.hide()

    isValid: ->
      !@envModel.invalid

    watchevents: ->
      @envEditor.on 'keydown', (event) =>
        @setApiLink()
        if (event.keyCode == 9)
          @validateEnv()
          @orgNameEditor.focus()
          event.preventDefault()

      @envEditor.on 'blur', (event) =>
        @validateEnv()

      @orgNameEditor.on 'keydown', (event) =>
        @setApiLink()
        if (event.keyCode == 9)
          @apiKeyEditor.focus()
          event.preventDefault()

      @saveButton.on 'keydown', (event) =>
        if (event.keyCode == 13)
          @save()

      @saveButton.on 'click', (event) =>
          @save()

      @cancelButton.on 'click', (event) =>
          @cancel()
