"use strict";

exports.hookBeforeRequest = function(req, res) {

    if(req.data.params._module) {

        var module = req.data.params._module.toUpperCase();

        if(module === 'ENTITIES') {

            req.data.params._module = 'classes';
        } else if(module === 'ACCOUNTS') {

            req.data.params._module = 'users';
        }

        if(req.data.params.offset) {

            req.data.params.skip = req.data.params.offset;
        }

        if(req.data.params.sort) {

            var sorts = JSON.parse(req.data.params.sort);
            var sortString = '';

            for(var key in sorts) {

                if(sortString.length > 0)
                    sortString += ',';

                sortString += ((sorts[key] === 1) ? '' : '-') + key;
            }

            req.data.params.order = sortString;
        }
    }
};

exports.hookAfterRequest = function(req, res, resData) {

    var data = resData.data;

    if(data.results && data.results.length) {

        for(var i= 0, cnt=data.results.length; i<cnt; i++) {

            if(data.results[i].objectId) {

                data.results[i].id = data.results[i].objectId;
                delete data.results[i].objectId;
            }

            delete data.results[i]._id;
            delete data.results[i]._appid;
            delete data.results[i]._userid;
            delete data.results[i]._className;
        }
    } else if(data.objectId) {

        if(data.objectId) {

            data.id = data.objectId;
            delete data.objectId;
            delete data._id;
            delete data._appid;
            delete data._userid;
            delete data._className;
        }
    }

    if(resData.code === 201)
        resData.code = 200;
};

exports.hookAfterError = function(req, res, err) {

    if(err.responseCode && err.responseCode >= 400 && err.responseCode < 500) {

        if(err.responseCode != 401 && err.responseCode != 403 && err.responseCode != 404)
            err.responseCode = 400;
    }
};
