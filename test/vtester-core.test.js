'use strict';

require('should');
var Vtester = require('../index');

describe('vtester-core', function() {
    it('build', function() {
        let vtester = new Vtester();
        vtester.build("/Users/laborc/code/gitos/gitosx16/k12/k12-fsc-android-vtester");
    });
});
