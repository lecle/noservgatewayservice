var gateway = require('../lib/gateway');

describe('gateway', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            // manager service load
            var dummyContainer = {addListener:function(){}};

            gateway.init(dummyContainer, function(err) {

                gateway.close(done);
            });
        });
    });

});