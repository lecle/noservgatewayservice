"use strict";

var parseQuery = require('./parsers/queryParser');

exports.container = null;

exports.init = function(container, callback) {

    exports.container = container;

    container.addListener('request', onRequest);

    callback(null);
};

exports.close = function(callback) {

    callback(null);
};

exports.request = onRequest;

function onRequest(req, res) {

    adjustRequestData(req);

    require('./versionAdapters').getVersionAdapter(req.data.params._version).hookBeforeRequest(req, res);

    // module
    if(req.data.params._module) {

        var module = req.data.params._module.toUpperCase();

        if(module === 'LOGIN' || module === 'REQUESTPASSWORDRESET')
            module = 'USERS';

        if(module === 'CLASSES') {

            if(req.data.params._query1 && req.data.params._query1.charAt(0) === '_' && req.data.params._query1.charAt(1) <= 'Z') {

                module = req.data.params._query1.substring(1).toUpperCase();
                req.data.params._query1 = req.data.params._query2;
                delete req.data.params._query2;
            }
        }

        exports.container.getService(module).then(function(service) {

            service.send('request', req.data, function(err, response) {

                if(err)
                    return resError(err);

                resSend(response.statusCode, response.data);
            });
        }).fail(function(err) {

            resError(err);
            return;
        });
    } else {

        res.error(new Error('ResourceNotFound'));
    }

    function resSend(code, data) {

        var resData = {
            code : code,
            data : data
        };

        require('./versionAdapters').getVersionAdapter(req.data.params._version).hookAfterRequest(req, res, resData);
        res.send(resData.code, resData.data);
        analyse(resData.code, null, resData.data);
    }

    function resError(err) {

        require('./versionAdapters').getVersionAdapter(req.data.params._version).hookAfterError(req, res, err);
        res.error(err);
        analyse(err.responseCode ? err.responseCode : 500, err);
    }

    function analyse(code, err, resData) {

        // analytics data

        var errorMessage = err ? err.message : '';
        var appId = req.data.headers['x-noserv-application-id'];

        if(!appId)
            appId = 'analytics';

        var size = 0;

        if(resData) {

            size = Buffer.byteLength(JSON.stringify(resData));
        }

        var data = {
            data : {
                url : req.data.url,
                method : req.data.method,
                code : code,
                errorMessage : errorMessage,
                headers : req.data.headers,
                params : req.data.params,
                responseSize : size
            },
            session : {
                appid : appId
            }
        };

        exports.container.getService('ANALYTICS').then(function(service) {

            service.send('add', data, function() {

            });
        }).fail(function(err) {


        });
    }
}

function adjustRequestData(req) {

    req.data.query = parseQuery(req.data.params);
    req.data.data = req.data.body;

    if(req.data.params.group)
        req.data.group = (typeof(req.data.params.group) === 'object') ? req.data.params.group : JSON.parse(req.data.params.group);

    if(req.data.params.aggregate)
        req.data.aggregate = (typeof(req.data.params.aggregate) === 'object') ? req.data.params.aggregate : JSON.parse(req.data.params.aggregate);
}
