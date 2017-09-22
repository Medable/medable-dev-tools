'use strict';

const $ = require('space-pen').$,
      MiniTextView = require('./mini-text-view');

module.exports = class PasswordView extends MiniTextView {

    constructor(placeholderText) {
        super(placeholderText);

        // from: https://discuss.atom.io/t/password-fields-when-using-editorview-subview/11061/7
        let passwordElement = $(this.getEditor().element.rootElement);
        passwordElement.find('div.lines').addClass('password-lines');
        this.getModel().onDidChange(() => {
            let string = this.getModel().getText().split('').map(() => '*').join('');
            passwordElement.find('#password-style').remove();
            return passwordElement.append(`<style id="password-style">.password-lines .line span.text:before {content:"${string}";}</style>`);
        });
    }

};
