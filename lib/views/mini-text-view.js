'use strict';

const View = require('space-pen').View,
      TextEditorView = require('atom-space-pen-views').TextEditorView;

module.exports = class MiniTextView extends View {

    static content() {
        return this.div({class: 'mini-text-view'}, () => {
            this.subview('editor', new TextEditorView({mini: true}));
            return this.div({class: 'editor-disabled', outlet: 'editorOverlay'});
        });
    }

    initialize(placeholderText) {
        this.editor.model.setPlaceholderText(placeholderText);
        this.enabled = true;
        return this.editor.on('focus', () => {
            if (!this.enabled) {
                return this.editor.blur();
            }
        });
    }

    destroy() {}

    getModel() {
        return this.editor.getModel();
    }

    getEditor() {
        return this.editor;
    }

    focus() {
        return this.editor.element.focus();
    }

    setEnabled(isEnabled) {
        this.enabled = isEnabled;
        if (isEnabled) {
            return this.editorOverlay.hide();
        } else {
            this.editorOverlay.show();
            return this.editor.blur();
        }
    }
};
