/**
 * Copyright (c) 2015-2016, fangstar.com
 * 
 * All rights reserved.
 */

/**
 * @file gulp plugin for header license.
 * 
 * @author <a href="mailto:liliyuan@fangstar.net">Liyuan Li</a>
 * @version 0.1.4.1, Jan 19, 2016
 */

'use strict';

var extend = require('object-assign');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

/**
 * gulp-license plugin.
 * @param {string} license The license template string.
 * @param {object} [config] The JSON object used to populate the license template.
 * @param {float} [rate=0.8] Matching rate.
 * @returns {oject} Gulp extension in the pipline.
 */
module.exports = function (license, config, rate) {

    /**
     * According to rate, get matching.
     * 
     * @param {object} file nodeJS file object.
     * @param {string} license The license template string.
     * @param {float} rate Matching rate.
     * @param {string} srcNLReg new line char code.
     * @returns {boolean} dose match.
     */
    function isMatch(file, license, rate, srcNLReg) {
        var srcLines = file.contents.toString('utf8').split(/\r?\n/),
                templateLines = license.split(/\r?\n/),
                type = path.extname(file.path),
                matchRates = 0,
                removed = false;

        // after '<?php' has new line, remove it 
        switch (type) {
            case '.php':
                if (srcLines[1].replace(/\s/, '') === '') {
                    srcLines.splice(1, 1);
                    removed = true;
                }
                break;
            default:
                break;
        }

        // count match line
        var minLength = templateLines.length > srcLines.length ? srcLines.length : templateLines.length;
        for (var i = 0; i < minLength; i++) {
            if (templateLines[templateLines.length - 1] === '' && i === templateLines.length - 1) {
                matchRates += 1;
            } else {
                switch (type) {
                    case '.php':
                        matchRates += getMatchRate(srcLines[i + 1], templateLines[i]);
                        break;
                    default:
                        matchRates += getMatchRate(srcLines[i], templateLines[i]);
                        break;
                }
            }
        }

        // has similar license, remove the license.
        var matchPer = matchRates / templateLines.length;

        if (matchPer >= rate && matchPer < 1) {
            // remove
            switch (type) {
                case '.php':
                    if (srcLines[templateLines.length].replace(/\s/, '') === '' && !removed) {
                        // after license, should be have a blank line. if has not, we don't need remove blank line. && after '<?php' has not new line
                        srcLines.splice(1, templateLines.length);
                    } else {
                        srcLines.splice(1, templateLines.length - 1);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg));
                    break;
                default:
                    // after license, should be have a blank line. if have not, we don't need remove blank line.
                    if (srcLines[templateLines.length - 1].replace(/\s/, '') === '') {
                        srcLines.splice(0, templateLines.length);
                    } else {
                        srcLines.splice(0, templateLines.length - 1);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg));
                    break;
            }
            return false;
        } else if (matchPer === 1) {
            return true;
        }
    }

    /**
     * Compare each character for ever line, and get ever line match rate. 
     * 
     * @param {type} src text for template.
     * @param {type} str text for file.
     * @returns {float} match rate.
     */
    function getMatchRate(src, str) {
        if (typeof (src) === 'undefined' || typeof (str) === 'undefined') {
            return 0;
        }

        var maxLength = src.length > str.length ? src.length : str.length,
                matchCnt = 0;
        if (maxLength === 0) {
            return 1;
        }

        for (var i = 0; i < maxLength; i++) {
            if (str.charAt(i) === src.charAt(i)) {
                matchCnt++;
            }
        }

        if (matchCnt === 0) {
            return 0;
        }

        return matchCnt / maxLength;
    }

    /**
     * Test first newline character and get newline character.
     * 
     * @param {type} str file content.
     * @returns {String} newline character.
     */
    function getSeparator(str) {
        // 13 \r 10 \n
        for (var i = str.length; i > -1; i--) {
            if (str.charCodeAt(i) === 10) {
                if (str.charCodeAt(i - 1) === 13) {
                    return '\r\n';
                }
                if (str.charCodeAt(i + 1) === 13) {
                    return '\n\r';
                }
                return '\n';
            }

            if (str.charCodeAt(i) === 13) {
                if (str.charCodeAt(i - 1) === 10) {
                    return '\n\r';
                }
                if (str.charCodeAt(i + 1) === 10) {
                    return '\r\n';
                }
                return '\r';
            }
        }
    }

    return through.obj(function (file, enc, cb) {
        license = license || '';
        rate = rate || 0.8;
        // rate must be [0-1].
        if (rate > 1 || rate <= 0) {
            rate = 0.8;
        }

        // merage template & config data
        var template = config === false ? license : gutil.template(license, extend({
            file: ''
        }, config));
        var srcNLReg = getSeparator(file.contents.toString('utf8'));

        // new line char code must match file new line char code.
        // when template use windows new line char code, but file use unix new line char code, it will show '^m' in template.
        template = template.split(/\r?\n/).join(srcNLReg);

        if (!isMatch(file, template, rate, srcNLReg)) {
            // add Template
            var type = path.extname(file.path);
            switch (type) {
                case '.php':
                    var srcLines = file.contents.toString('utf8').split(/\r?\n/);
                    if (srcLines[1] === '') {
                        // if after '<?php' has blank line, need to remove this line.
                        srcLines.splice(1, 1, template);
                    } else {
                        srcLines.splice(1, 0, template);
                    }
                    file.contents = new Buffer(srcLines.join(srcNLReg), 'utf8');
                    break;
                default:
                    file.contents = new Buffer(template + srcNLReg + file.contents, 'utf8');
                    break;
            }
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);

        // tell the stream engine that we are done with this file
        cb();
    });
};