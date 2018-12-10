module.exports = {
  menu: {
    project: {
      settings: [{
        label: 'Medable',
        submenu: [
            {label: 'Settings...', command: 'medable-dev-tools:showSettings'}
        ]
      }],
      full: [{
        label: 'Medable',
        submenu: [
            {label: 'Update from Org', command: 'medable-dev-tools:get'},
            {label: 'Save to Org', command: 'medable-dev-tools:get'},
            {"type":"separator"}
        ]
      }]
    },
    script: {
      run: [
        {
          "label": "Medable",
          "submenu": [
            {"label": "Run Script", "command": "medable-dev-tools:runScript"}
          ]
        }
      ]
    },
    selector: {
      editor: 'atom-text-editor',
      file: {
        js: '.tree-view .file .name[data-name$=\\.js]'
      },
      project: '.tree-view .full-menu .project-root > .header'
    }
  }
}