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

    // 모듈
    if(req.data.params._module) {

        var module = req.data.params._module.toUpperCase();

        if(module === 'LOGIN' || module === 'REQUESTPASSWORDRESET')
            module = 'USERS';

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

        res.send(code, data);
        analyse(code, null, data);
    }

    function resError(err) {

        res.error(err);
        analyse(err.responseCode ? err.responseCode : 500, err, data);
    }

    function analyse(code, err, resData) {

        // 통계데이터

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

}

