var gateway = require('../lib/gateway');

describe('gateway', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            var dummyContainer = {addListener:function(){}};

            gateway.init(dummyContainer, function(err) {

                gateway.close(done);
            });
        });
    });

    describe('#request()', function() {
        it('should initialize without error', function(done) {

            var req = {
                data : {
                    params : {where : '{"test" : "data"}', method : 'GET', _module : 'TEST'},
                    body : {test : 'data'},
                    headers : {'x-noserv-application-id' : 'supertoken'}
                }
            };

            var res = function(done) {

                return {
                    send : function() {done();},
                    error : function(err) {done(err);}
                };
            };

            var dummyContainer = {
                addListener : function(){},
                getService : function(name) {

                    return {
                        then : function(callback){ callback({send : function(command, data, callback) {

                            callback(null, {data : {test : 'OK'}, send : function(){}});
                        }});

                            return {fail : function(){}};
                        }
                    };
                }
            };

            gateway.init(dummyContainer, function(err) {

                gateway.request(req, res(function(){}));
                gateway.close(done);
            });
        });
    });
});