/**
 * Copyright (c) 2015-2016, fangstar.com
 * 
 * All rights reserved.
 */

/**
 * @file gulp plugin for header license.
 * 
 * @author <a href="mailto:liliyuan@fangstar.net">Liyuan Li</a>
 * @version 0.1.0.0, Jan 18, 2016
 */

'use strict';
var assert = require("assert");
var headerLicense = require("../index");
describe('headerLicense', function () {
    describe('#isMatch()', function () {
        it('xxx', function () {
            console.log(headerLicense.isMatch)

        });
    });
    describe('#getSeparator()', function () {
        it('should return new line character', function () {

            var should = require('chai').should() //actually call the the function
                    , foo = 'bar'
                    , beverages = {tea: ['chai', 'matcha', 'oolong']};

            foo.should.be.a('string');
            foo.should.equal('bar');
            foo.should.have.length(3);
            beverages.should.have.property('tea').with.length(3);

        });
    });

    describe('#getMatchRate()', function () {
        it('should return -1 when the value is not present', function () {

            var should = require('chai').should() //actually call the the function
                    , foo = 'bar'
                    , beverages = {tea: ['chai', 'matcha', 'oolong']};

            foo.should.be.a('string');
            foo.should.equal('bar');
            foo.should.have.length(3);
            beverages.should.have.property('tea').with.length(3);

        });
    });
});