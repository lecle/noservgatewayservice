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

    // 통계데이터
    exports.container.getService('ANALYTICS').then(function(service) {

        service.send('add', req.data, function() {

        });
    }).fail(function(err) {


    });

    // 모듈
    if(req.data.params._module) {

        var module = req.data.params._module.toUpperCase();

        if(module === 'LOGIN' || module === 'REQUESTPASSWORDRESET')
            module = 'USERS';

        exports.container.getService(module).then(function(service) {

            service.send('request', req.data, function(err, response) {

                if(err)
                    return res.error(err);

                res.send(response.data);
            });
        }).fail(function(err) {

            res.error(err);
            return;
        });
    } else {

        res.error(new Error('ResourceNotFound'));
    }
}

function adjustRequestData(req) {

    req.data.query = parseQuery(req.data.params);
    req.data.data = req.data.body;

}