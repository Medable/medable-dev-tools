'use babel'

import API from '../api'
import config from '../config'
import MiniTextView from './mini-text-view'
import PasswordView from './password-view'
import utils from '../utils'
import { View }  from 'space-pen'

// based on: https://github.com/spark/spark-dev/blob/master/lib/views/login-view.coffee
module.exports = class MedableLoginView extends View {

    constructor (path) {
        super()
        this.path = path
    }

    static content() {
        return this.div(() => {
            this.h1('Log in to Medable')
            this.subview('usernameEditor', new MiniTextView("Username"))
            this.subview('passwordEditor', new PasswordView("Password"))
            this.subview('secondFactorEditor', new PasswordView("Verification code"),
                this.div({class: 'text-error block', outlet: 'errorLabel'}))
            return this.div({class: 'block'}, () => {
                this.button({id: 'loginButton', class: 'btn btn-primary', outlet: 'loginButton'}, 'Log in')
                return this.button({id: 'cancelButton', class: 'btn', outlet: 'cancelButton'}, 'Cancel')
            })
        })
    }

    initialize() {
        this.modalPanel = atom.workspace.addModalPanel({item: this, visible: false})
        this.usernameModel = this.usernameEditor.getModel()
        this.passwordModel = this.passwordEditor.getModel()
        return this.secondFactorModel = this.secondFactorEditor.getModel()
    }

    destroy() {
        return this.detach()
    }

    async show (hasToken) {
        if (hasToken) {
            const api = new API(this.path),
                  isValidToken = await api.isValidToken()
            if (isValidToken) { 
                return
            } else {
                const projectConfig = config(this.path)
                delete projectConfig.accessToken
                config.set(this.path, projectConfig)
            }
        }
        this.enable()
        this.watchevents()
        this.modalPanel.show()
        this.secondFactorEditor.hide()
        this.errorLabel.hide()
        return this.usernameEditor.focus()
    }

    hide () {
        this.usernameModel.setText('')
        this.passwordModel.setText('')
        this.secondFactorModel.setText('')
        this.modalPanel.hide()
    }

    cancel () {
        this.hide()
    }

    disable () {
        this.usernameEditor.setEnabled(false)
        this.passwordEditor.setEnabled(false)
        this.secondFactorEditor.setEnabled(false)
        return this.loginButton.attr('disabled', 'disabled')
    }

    enable () {
        this.usernameEditor.setEnabled(true)
        this.passwordEditor.setEnabled(true)
        this.secondFactorEditor.setEnabled(true)
        return this.loginButton.removeAttr('disabled')
    }

    async login () {
        this.disable()
        this.errorLabel.hide()

        this.username = this.usernameModel.getText()
        this.password = this.passwordModel.getText()
        this.secondFactor = this.secondFactorModel.getText()

        let loginBody = {
            email: this.username,
            password: this.password,
            location: {
                verificationToken: this.secondFactor,
                locationName: 'IDE',
                singleUse: true
            }
        }

        try {
            const api = new API(this.path)
            await api.post('accounts/login', loginBody)
            let token = await api.getToken()
            config.extend(this.path, {accessToken: token})
            atom.notifications.addSuccess('Login successful')
            utils.updateMenu()
            this.hide()
        } catch (err) {
            if((err.code === 'kUnverifiedLocation') || (err.code === 'kNewLocation')) {
                this.errorLabel.text('Verify location: Enter the verification code you received via SMS and log in again');
                this.errorLabel.show();
                this.secondFactorEditor.show();
                return this.enable();
            } else {
                atom.notifications.addError(err.message && err.message || err.reason)
            }
        }
    }

    watchevents() {
        this.usernameEditor.on('keydown', event => {
            if (event.keyCode === 9) {
                this.passwordEditor.focus()
                return event.preventDefault()
            }
        })

        this.passwordEditor.on('keydown', event => {
            if (event.keyCode === 13) {
                this.login()
            }
            if (event.keyCode === 9) {
                this.secondFactorEditor.focus()
                return event.preventDefault()
            }
        })

        this.secondFactorEditor.on('keydown', event => {
            if (event.keyCode === 13) {
                return this.login()
            }
        })

        this.loginButton.on('keydown', event => {
            if (event.keyCode === 13) {
                return this.login()
            }
        })

        this.loginButton.on('click', event => {
            return this.login()
        })

        return this.cancelButton.on('click', event => {
            return this.cancel()
        })
    }
}