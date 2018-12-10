'use babel'

import config from './config'
import utils from './utils'
import withQuery from 'with-query'
import 'whatwg-fetch'
import chromeLogger from './chrome-logger'

let csrfToken = null

export default class API {

    constructor (projectPath) {
        this.projectPath = projectPath
    }

    get (path, options = {}) {
        const { query = {} } = options
        return this.call(this.getURL(path, query), this.getOptions(options))
    }

    getOne (path, options = {}) {
        const { query = {} } = options
        if (path) {
            query.limit = 1
            options.single = true
        }
        return this.call(this.getURL(path, query), this.getOptions(options))
    }

    post (path, body = {}, options = {}) {
        return this.call(this.getURL(path), this.getOptions({method: 'POST', body, ...options}))
    }

    put (path, body = {}, options = {}) {
        return this.call(this.getURL(path), this.getOptions({method: 'PUT', body, ...options}))
    }

    patch (path, body = [], options = {}) {
        return this.call(this.getURL(path), this.getOptions({method: 'PATCH', body, ...options}))
    }

    delete (path) {
        return this.call(this.getURL(path), this.getOptions({method: 'DELETE'}))
    }

    /**
     *
     * @param url
     * @param options
     * @returns {Promise<any>}
     */
    call = async (url, options) => {

        options = options || {}

        let response = await fetch(url, options),
            result = await response.json(),
            fault = response.ok ? null : result

        if (fault) {
          throw fault
        }

        chromeLogger(response)

        if (response.headers.get('medable-csrf-token')) { csrfToken = response.headers.get('medable-csrf-token') }

        switch (result.object) {
            case 'result':
                result = result.data
                break
            case 'list':
                result = (options.single) ? result.data[0] : result
                break
            default:
                // do nada
        }

        return result
    }

    /************************
     * Helper Methods
     ************************/

    set projectPath (projectPath) {
        this._projectPath = projectPath
    }

    get baseURL () {
        return `https://${config(this._projectPath, 'env')}/${config(this._projectPath, 'org')}/v2/`
    }

    getHeaders = (headers) => {
        let _headers = new Headers({
            'Content-Type': 'application/json',
            'Medable-Client-Key': config(this._projectPath, 'apiKey'),
            Accept: 'application/json',
            ...headers
        })
        if (config(this._projectPath, 'accessToken')) {
            _headers.append('Authorization', `Bearer ${config(this._projectPath, 'accessToken')}`)
        }
        if (csrfToken) {
            _headers.append('medable-csrf-token', csrfToken)
            // hack: don't set null in case there's an unauthenticated request in-between
        }
        return _headers
    }

    getOptions = ({method = 'GET', headers = {}, body, ...rest}) => {
        let options = {
            credentials: 'include',
            headers: this.getHeaders(headers),
            method,
            ...rest,
        }

        return (body) ? {...options, body: utils.stringify(body)} : options
    }

    getURL = (path, query = {}) => {

        let url = (path) ? this.baseURL + path : this.baseURL
            for (let arg in query) {
            if (query.hasOwnProperty(arg) && !Array.isArray(query[arg])) {
                query[arg] = utils.stringify(query[arg])
            }
        }
        return withQuery(url, query)
    }

    isValidToken = async () => {
        try {
            const result = await this.get('accounts/status')
            return !!result.loggedin
        } catch (err) {
            atom.notifications.addError(err.message && err.message || err.reason)
            return false
        }
    }

    getToken = async () => {
        const script = `return org.objects.accounts.createAuthToken(
                            '${config(this._projectPath, 'apiKey')}',
                            script.principal.email,
                            {
                                scope: ['*'],
                                permanent: true
                            }
                        )`

        return await this.runScript(script)
    }

    runScript = async (script) => {
        let url = `sys/script_runner/`,
            body = {
                language: 'javascript',
                specification: 'es6',
                script
            },
            result = await this.post(url, body)
    
        return result
    }

}
