'use babel'

import API from './api'
import { CompositeDisposable } from 'atom'
import MedableSettingsView from './views/medable-settings-view'
import ResizablePanel from './views/resizable-panel'
import { TextEditorView } from 'atom-space-pen-views'
import utils from './utils'

module.exports = {

    subscriptions: null,

    activate () {
        init()

        // atom.workspace.observeActivePaneItem((item) => {
        //   if (item instanceof TextEditor) {
        //     const dockItem = {
        //             element: (new MedableSettingsView()).element,
        //             getTitle: () => 'My Awesome Item',
        //             getURI: () => 'atom://medable-dev-tools/medable-settings-view',
        //             getDefaultLocation: () => 'right'
        //           }
        //     atom.workspace.open(dockItem)
        //   }
        // })
        
        this.subscriptions = new CompositeDisposable()

        this.resultView = new TextEditorView()
        this.resultView.getModel().setGrammar(atom.grammars.grammarForScopeName('source.json'))

        this.resultPanel = new ResizablePanel({
            item: this.resultView.element,
            position: 'right',
            visible: false
        })
        this.resultPanel.width(300)

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'medable-dev-tools:showSettings': (event) => this.showSettings(event)
        }))

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'medable-dev-tools:runScript': (event) => this.runScript()
        }))

    },

    deactivate () {
        this.subscriptions.dispose()
        this.resultPanel.destroy()
    },

    showSettings (event) {
        _showSettings(event.target)
    },

    runScript () {
        if (item) {
            const buffer = item.getBuffer()
            if (buffer) {

                let result = _runScript(String(buffer.getText()).trim())
                this.resultPanel.show()
                this.resultPanel.panel.show()
                this.resultView.setText('Running...')
                this.resultView.setText(JSON.stringify(result))
            }
        }

    }
}

function init(){
    utils.updateMenu()
}

function _showSettings(target) {
    const { path } = target.dataset,
          settingsView = new MedableSettingsView(path)
    settingsView.show()
}

function _runScript (script) {
    const api = new API()
    return api.runScript(script)
}
