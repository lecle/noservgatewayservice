"use strict";

exports.getVersionAdapter = function(version) {

    var versionAdapter = require('./null.js');

    if(version === 'v1')
        versionAdapter = require('./v1.js');

    return versionAdapter;
};
