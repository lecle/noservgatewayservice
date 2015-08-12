var assert = require('assert');

var req = {
    data : {
        params : {
            _module : 'entities',
            offset : 1,
            sort : '{"t1" : 1, "t2" : -1}'
        },
        method : 'PATCH'
    }
};

var reqAccount = {
    data : {
        params : {
            _module : 'accounts'
        }
    }
};

var resDataAfterInsert = {
    code : 201,
    data : {
        objectId : 'test',
        createdAt : '2015-07-21T08:45:17.149Z'
    }
};

var resDataAfterFind = {
    code : 200,
    data : {
        results : [
            {
                objectId : 'test',
                createdAt : '2015-07-21T08:45:17.149Z'
            }
        ]
    }
};

var err = new Error();
err.responseCode = 409;


describe('versionAdapter', function() {
    describe('#hookBeforeRequest()', function() {
        it('should hook for normal without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('1').hookBeforeRequest(req, {});

            assert.equal('entities', req.data.params._module);
            assert.equal(1, req.data.params.offset);
            assert.equal('{"t1" : 1, "t2" : -1}', req.data.params.sort);
            assert.equal('PATCH', req.data.method);

            require('../lib/versionAdapters').getVersionAdapter('1').hookBeforeRequest(reqAccount, {});

            assert.equal('accounts', reqAccount.data.params._module);

            done();
        });

        it('should hook for v1 without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('v1').hookBeforeRequest(req, {});

            assert.equal('classes', req.data.params._module);
            assert.equal(1, req.data.params.skip);
            assert.equal('t1,-t2', req.data.params.order);
            assert.equal('PUT', req.data.method);

            require('../lib/versionAdapters').getVersionAdapter('v1').hookBeforeRequest(reqAccount, {});

            assert.equal('users', reqAccount.data.params._module);

            done();
        });
    });

    describe('#hookAfterRequest()', function() {
        it('should hook for normal without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('1').hookAfterRequest(req, {}, resDataAfterInsert);

            assert.equal(201, resDataAfterInsert.code);
            assert.equal('test', resDataAfterInsert.data.objectId);

            require('../lib/versionAdapters').getVersionAdapter('1').hookAfterRequest(req, {}, resDataAfterFind);

            assert.equal('test', resDataAfterFind.data.results[0].objectId);

            done();
        });

        it('should hook for v1 without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('v1').hookAfterRequest(req, {}, resDataAfterInsert);

            assert.equal(200, resDataAfterInsert.code);
            assert.equal('test', resDataAfterInsert.data.id);

            require('../lib/versionAdapters').getVersionAdapter('v1').hookAfterRequest(req, {}, resDataAfterFind);

            assert.equal('test', resDataAfterFind.data.results[0].id);

            done();
        });
    });

    describe('#hookAfterError()', function() {
        it('should hook for normal without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('1').hookAfterError(req, {}, err);

            assert.equal(409, err.responseCode);

            done();
        });

        it('should hook for v1 without error', function(done) {

            require('../lib/versionAdapters').getVersionAdapter('v1').hookAfterError(req, {}, err);

            assert.equal(400, err.responseCode);

            done();
        });
    });
});
