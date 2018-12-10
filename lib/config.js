'use babel'

import store from 'store'
import utils from './utils'
import fs from 'fs'
import path from 'path'

const configKey = `medable-dev-tools`,
      Undefined = Object.create({}),
      localConfig = 'config.local.json'

export class Config {

    constructor () {
        this._getter = (projectRoot, path, defaultValue) => this.get(projectRoot, path, defaultValue)
        this._getter.full = () => this.full()
        this._getter.extend = (projectRoot, config) => {
            this.extend(projectRoot, config)
        }
        this._getter.set = (projectRoot, config) => {
            this.set(projectRoot, config)
        }
    }

    get (projectRoot, configPath, defaultValue) {
        const _config = this.full(),
              projectConfig = _config[projectRoot] || {}
        if (configPath === undefined) {
            return projectConfig
        }
        let value = utils.path({obj: projectConfig, path: configPath})
        if (value === Undefined || value === undefined) {
            value = defaultValue !== undefined ? defaultValue : undefined
        }
        if (fs.existsSync(path.join(projectRoot, localConfig))) {
            utils.mergeDeep(projectConfig, JSON.parse(fs.readFileSync(path.join(projectRoot, localConfig))));
            this.set(projectRoot, projectConfig)
        }
        return value
    }

    get getter () {
        return this._getter
    }

    set (projectPath, config) {
        const _config = this.full()
        store.set(configKey, {..._config, [projectPath]: config})
    }

    extend (projectPath, config) {
        const _config = this.full(),
              projectConfig = _config[projectPath] || {}
        utils.mergeDeep(projectConfig, config)
        store.set(configKey, {..._config, [projectPath]: projectConfig})
    }

    full () {
        const _config = store.get(configKey) || {}
        return _config
    }

}
let instance = new Config()
export default instance.getter