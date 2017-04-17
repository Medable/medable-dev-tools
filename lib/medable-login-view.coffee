{View} = require 'space-pen'

api = require './api'

MiniTextView = require './views/mini-text-view'
PasswordView = require './views/password-view'

# based on: https://github.com/spark/spark-dev/blob/master/lib/views/login-view.coffee
module.exports =
  class MedableLoginView extends View

    @content: ->
      @div =>
        @h1 'Log in to Medable'
        @subview 'usernameEditor', new MiniTextView("Username")
        @subview 'passwordEditor', new PasswordView("Password")
        @subview 'secondFactorEditor', new PasswordView("Verification code"),
        @div class: 'text-error block', outlet: 'errorLabel'
        @div class: 'block', =>
          @button id: 'loginButton', class: 'btn btn-primary', outlet: 'loginButton', 'Log in'
          @button id: 'cancelButton', class: 'btn', outlet: 'cancelButton', 'Cancel'

    initialize: ->
      @modalPanel = atom.workspace.addModalPanel(item: this, visible: false)
      @usernameModel = @usernameEditor.getModel()
      @passwordModel = @passwordEditor.getModel()
      @secondFactorModel = @secondFactorEditor.getModel()

    destroy: ->
      @detach()

    show: (callback) ->
      @enable()
      @watchevents(callback)
      @modalPanel.show()
      @secondFactorEditor.hide()
      @errorLabel.hide()
      @usernameEditor.focus()

    hide: ->
      @usernameModel.setText ''
      @passwordModel.setText ''
      @secondFactorModel.setText ''
      @modalPanel.hide()

    cancel: (callback) ->
      @hide()
      callback('Login failed');

    disable: ->
      @usernameEditor.setEnabled false
      @passwordEditor.setEnabled false
      @secondFactorEditor.setEnabled false
      @loginButton.attr 'disabled', 'disabled'

    enable: ->
      @usernameEditor.setEnabled true
      @passwordEditor.setEnabled true
      @secondFactorEditor.setEnabled true
      @loginButton.removeAttr 'disabled'

    login: (callback) ->
      @disable()
      @errorLabel.hide()

      @username = @usernameModel.getText()
      @password = @passwordModel.getText()
      @secondFactor = @secondFactorModel.getText()

      loginBody =
        email: @username
        password: @password
        location:
          verificationToken: @secondFactor
          locationName: 'IDE'
          singleUse: true
      loginUrl  = api.baseUrl()+'accounts/login'

      api.post loginUrl, loginBody, (error, response, body) =>
        if !error
          if(body.code == 'kUnverifiedLocation' || body.code == 'kNewLocation')
            @errorLabel.text('Verify location: Enter the verification code you received via SMS and log in again')
            @errorLabel.show()
            @secondFactorEditor.show()
            @enable()
          else
            atom.notifications.addSuccess('Login successful')
            callback()
            @hide()
        else
          @errorLabel.text('Login error: ' + error.message)
          @errorLabel.show()
          @enable()

    watchevents: (callback) ->
      @usernameEditor.on 'keydown', (event) =>
        if (event.keyCode == 9)
          @passwordEditor.focus()
          event.preventDefault()

      @passwordEditor.on 'keydown', (event) =>
        if (event.keyCode == 13)
          @login(callback)
        if (event.keyCode == 9)
          @secondFactorEditor.focus()
          event.preventDefault()

      @secondFactorEditor.on 'keydown', (event) =>
        if (event.keyCode == 13)
          @login(callback)

      @loginButton.on 'keydown', (event) =>
        if (event.keyCode == 13)
          @login(callback)

      @loginButton.on 'click', (event) =>
          @login(callback)

      @cancelButton.on 'click', (event) =>
          @cancel(callback)
