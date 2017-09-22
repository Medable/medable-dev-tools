'use strict';

const View = require('space-pen').View,
      api = require('./api'),
      MiniTextView = require('./views/mini-text-view'),
      PasswordView = require('./views/password-view');

// based on: https://github.com/spark/spark-dev/blob/master/lib/views/login-view.coffee
module.exports = class MedableLoginView extends View {

    static content() {
        return this.div(() => {
            this.h1('Log in to Medable');
            this.subview('usernameEditor', new MiniTextView("Username"));
            this.subview('passwordEditor', new PasswordView("Password"));
            this.subview('secondFactorEditor', new PasswordView("Verification code"),
                this.div({class: 'text-error block', outlet: 'errorLabel'}));
            return this.div({class: 'block'}, () => {
                this.button({id: 'loginButton', class: 'btn btn-primary', outlet: 'loginButton'}, 'Log in');
                return this.button({id: 'cancelButton', class: 'btn', outlet: 'cancelButton'}, 'Cancel');
            });
        });
    }

    initialize() {
        this.modalPanel = atom.workspace.addModalPanel({item: this, visible: false});
        this.usernameModel = this.usernameEditor.getModel();
        this.passwordModel = this.passwordEditor.getModel();
        return this.secondFactorModel = this.secondFactorEditor.getModel();
    }

    destroy() {
        return this.detach();
    }

    show(callback) {
        this.enable();
        this.watchevents(callback);
        this.modalPanel.show();
        this.secondFactorEditor.hide();
        this.errorLabel.hide();
        return this.usernameEditor.focus();
    }

    hide() {
        this.usernameModel.setText('');
        this.passwordModel.setText('');
        this.secondFactorModel.setText('');
        return this.modalPanel.hide();
    }

    cancel(callback) {
        this.hide();
        return callback('Login failed');
    }

    disable() {
        this.usernameEditor.setEnabled(false);
        this.passwordEditor.setEnabled(false);
        this.secondFactorEditor.setEnabled(false);
        return this.loginButton.attr('disabled', 'disabled');
    }

    enable() {
        this.usernameEditor.setEnabled(true);
        this.passwordEditor.setEnabled(true);
        this.secondFactorEditor.setEnabled(true);
        return this.loginButton.removeAttr('disabled');
    }

    login(callback) {
        this.disable();
        this.errorLabel.hide();

        this.username = this.usernameModel.getText();
        this.password = this.passwordModel.getText();
        this.secondFactor = this.secondFactorModel.getText();

        let loginBody = {
            email: this.username,
            password: this.password,
            location: {
                verificationToken: this.secondFactor,
                locationName: 'IDE',
                singleUse: true
            }
        };
        let loginUrl  = api.baseUrl()+'accounts/login';

        return api.post(loginUrl, loginBody, (error, response, body) => {
            if (!error) {
                if((body.code === 'kUnverifiedLocation') || (body.code === 'kNewLocation')) {
                    this.errorLabel.text('Verify location: Enter the verification code you received via SMS and log in again');
                    this.errorLabel.show();
                    this.secondFactorEditor.show();
                    return this.enable();
                } else {
                    atom.notifications.addSuccess('Login successful');
                    callback();
                    return this.hide();
                }
            } else {
                this.errorLabel.text(`Login error: ${error.message}`);
                this.errorLabel.show();
                return this.enable();
            }
        });
    }

    watchevents(callback) {
        this.usernameEditor.on('keydown', event => {
            if (event.keyCode === 9) {
                this.passwordEditor.focus();
                return event.preventDefault();
            }
        });

        this.passwordEditor.on('keydown', event => {
            if (event.keyCode === 13) {
                this.login(callback);
            }
            if (event.keyCode === 9) {
                this.secondFactorEditor.focus();
                return event.preventDefault();
            }
        });

        this.secondFactorEditor.on('keydown', event => {
            if (event.keyCode === 13) {
                return this.login(callback);
            }
        });

        this.loginButton.on('keydown', event => {
            if (event.keyCode === 13) {
                return this.login(callback);
            }
        });

        this.loginButton.on('click', event => {
            return this.login(callback);
        });

        return this.cancelButton.on('click', event => {
            return this.cancel(callback);
        });
    }
};