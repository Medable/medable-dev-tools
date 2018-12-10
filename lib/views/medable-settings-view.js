'use babel'

import { View } from 'space-pen'
import config from '../config'
import MiniTextView from './mini-text-view'
import MedableLoginView from './medable-login-view'

module.exports = class MedableSettingsView extends View {

    constructor (path) {
        super()
        this.path = path
    }

    static content() {
        return this.div({class: 'control-group'}, () => {
            return this.div({class: 'controls'}, () => {
                this.h1('Medable Project Settings')
                this.div({class: 'controls'}, () => {
                    return this.div({class: 'editor-container medable'}, () => {
                        this.subview('envEditor', new MiniTextView("Environment"))
                        return this.div({class: 'text-error block', outlet: 'errorLabel'})
                    })
                })

                this.label({class: 'medable control-label'}, () => {
                    return this.div({class: 'setting-description'}, () => {
                        return this.raw('The Medable environment you wish to connect to (e.g. api.dev.medable.com for development or api.medable.com for production).')
                    })
                })

                this.div({class: 'controls'}, () => {
                    return this.div({class: 'editor-container medable'}, () => {
                        return this.subview('orgNameEditor', new MiniTextView("Org name"))
                    })
                })

                this.label({class: 'medable control-label'}, () => {
                    return this.div({class: 'setting-description'}, () => {
                        return this.raw('The the unique name for your org. This is the org name you provided when signing up.')
                    })
                })

                this.div({class: 'controls'}, () => {
                    return this.div({class: 'editor-container medable'}, () => {
                        return this.subview('apiKeyEditor', new MiniTextView("API Key"))
                    })
                })

                this.label({class: 'medable control-label'}, () => {
                    return this.div({class: 'setting-description'}, () => {
                        this.raw('The api key for connecting to your org.')
                        return this.a({outlet: 'apiLink'}, 'Get API Key')
                    })
                })

                return this.div({class: 'block'}, () => {
                    this.button({id: 'saveButton', class: 'btn btn-primary', outlet: 'saveButton'}, 'Save')
                    return this.button({id: 'cancelButton', class: 'btn', outlet: 'cancelButton'}, 'Cancel')
                })
            })
        })
    }

    initialize() {
        this.modalPanel = atom.workspace.addModalPanel({item: this, visible: false})
        this.envModel = this.envEditor.getModel()
        this.orgNameModel = this.orgNameEditor.getModel()
        this.apiKeyModel = this.apiKeyEditor.getModel()
        return true
    }

    destroy() {
        return this.detach()
    }

    show() {
        this.enable()
        this.watchevents()
        this.setApiLink()
        this.errorLabel.hide()
        this.modalPanel.show()
        return this.envEditor.focus()
    }

    hide() {
        this.envModel.setText('')
        this.orgNameModel.setText('')
        this.apiKeyModel.setText('')
        return this.modalPanel.hide()
    }

    cancel() {
        return this.hide()
    }

    disable() {
        this.envEditor.setEnabled(false)
        this.orgNameEditor.setEnabled(false)
        this.apiKeyEditor.setEnabled(false)
        return this.saveButton.attr('disabled', 'disabled')
    }

    enable() {
        this.envModel.setText(config(this.path, 'env', ''))
        this.envEditor.setEnabled(true)
        this.orgNameModel.setText(config(this.path, 'org', ''))
        this.orgNameEditor.setEnabled(true)
        this.apiKeyModel.setText(config(this.path, 'apiKey', ''))
        this.apiKeyEditor.setEnabled(true)
        return this.saveButton.removeAttr('disabled')
    }

    save() {
        this.disable()

        this.env = this.envModel.getText()
        this.orgName = this.orgNameModel.getText()
        this.apiKey = this.apiKeyModel.getText()

        const existingConfig = config(this.path) || {},
              loginView = new MedableLoginView(this.path),
              newConfig = {
                env: this.env,
                org: this.orgName,
                apiKey: this.apiKey
            }

        let hasToken = !!existingConfig.accessToken
        delete existingConfig.accessToken

        if (JSON.stringify(existingConfig) !== JSON.stringify(newConfig)) {
            config.set(this.path, {
                env: this.env,
                org: this.orgName,
                apiKey: this.apiKey
            })
            hasToken = false
        }
        loginView.show(hasToken)
        this.hide()
    }

    setApiLink() {
        if (this.envModel.getText() && this.orgNameModel.getText()) {
            this.apiLink.attr({'href': `https://${this.envModel.getText().replace('api','app')}/${this.orgNameModel.getText()}/settings/apps`})
            return this.apiLink.show()
        } else {
            return this.apiLink.hide()
        }
    }

    validateEnv() {
        let envreg = /api\S+medable\.com/
        this.envModel.invalid = !envreg.test(this.envModel.getText())
        if (this.envModel.invalid) {
            this.errorLabel.text('Enter a valid environment. Be sure it starts with "api"')
            return this.errorLabel.show()
        } else {
            return this.errorLabel.hide()
        }
    }

    isValid() {
        return !this.envModel.invalid
    }

    watchevents() {
        this.envEditor.on('keydown', event => {
            this.setApiLink()
            if (event.keyCode === 9) {
                this.validateEnv()
                this.orgNameEditor.focus()
                return event.preventDefault()
            }
        })

        this.envEditor.on('blur', () => {
            return this.validateEnv()
        })

        this.orgNameEditor.on('keydown', event => {
            this.setApiLink()
            if (event.keyCode === 9) {
                this.apiKeyEditor.focus()
                return event.preventDefault()
            }
        })

        this.saveButton.on('keydown', event => {
            if (event.keyCode === 13) {
                return this.save()
            }
        })

        this.saveButton.on('click', () => {
            return this.save()
        })

        return this.cancelButton.on('click', () => {
            return this.cancel()
        })
    }
}
  