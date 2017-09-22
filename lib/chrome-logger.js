'use strict';

const HEADER_NAME = 'x-chromelogger-data';

const color1 = '#888';
const color2 = '#0563ad';

const ALLOWED_TYPES = {
    'group': 1,
    'groupEnd': 1,
    'groupCollapsed': 1,
    'warn': 1,
    'error': 1,
    'info': 1,
    'table': 1,
    'log': 1
};

function _showLineNumbers()
{
    return true;
}


function _logData(data, callback)
{
    let column_map = {};
    let column_name;

    for (let key in data.columns) {
        column_name = data.columns[key];
        column_map[column_name] = key;
    }

    let rows = data.rows,
        i = 0,
        length = rows.length;

    for (i = 0; i < length; i++) {
        let row = rows[i],
            backtrace = row[column_map.backtrace],
            label = row[column_map.label],
            log = row[column_map.log],
            type = row[column_map.type] || 'log';

        if (_showLineNumbers() && backtrace !== null) {
            console.log('%c' + backtrace, 'color: ' + color1 + '; font-weight: bold;');
        }

        // new version without label
        let new_version = false;
        if (data.columns.indexOf('label') === -1) {
            new_version = true;
        }

        // if this is the old version do some converting
        if (!new_version) {
            let show_label = label && typeof label === "string";

            log = [log];

            if (show_label) {
                log.unshift(label);
            }
        }

        let logs = [];
        let current_log;
        let last_log;
        let new_string;

        // loop through logs to add in any class name labels that should be here
        for (let j = 0; j < log.length; j++) {
            current_log = log[j];
            last_log = logs[logs.length - 1];

            if (current_log && typeof current_log === 'object' && current_log['___class_name']) {
                new_string = '%c' + current_log['___class_name'];

                if (typeof last_log === 'string') {

                    // if the last log was a string we need to append to it
                    // in order for the coloring to work correctly
                    logs[logs.length - 1] = last_log + ' ' + new_string;
                }
                else {

                    // otherwise just push the new string to the end of the list
                    logs.push(new_string);
                }

                logs.push('color: ' + color2 + '; font-weight: bold;');
                delete log[j]['___class_name'];
            }

            logs.push(current_log);
        }

        if (!(type in ALLOWED_TYPES)) {
            type = 'log';
        }

        console[type].apply(console, logs);
    }

    if (typeof callback === 'function') {
        callback();
    }
}

function _decode(header) {
    return JSON.parse(atob(header));
}

module.exports = function chromeLogger(response) {

    let header = response && response.headers[HEADER_NAME];
    if (header) {
        _logData(_decode(header));
    }

};