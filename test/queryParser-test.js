var parseQuery = require('../lib/parsers/queryParser');
var assert = require('assert');

describe('queryParser', function() {
    describe('#parseQuery()', function() {
        it('should parse without error', function(done) {

            var sampleData = {

                where : '{"$or" : [{"arr" : {"$nin" : ["b"] } }, {"updatedAt" : {"$ISODate" : "2016-01-23T02:46:54.429Z" } }] }',
                limit : 2,
                order : '-num',
                skip : 2,
                count : 1
            };

            var parsedData = parseQuery(sampleData);

            assert(parsedData.where);
            assert(parsedData.limit);
            assert(parsedData.order);
            assert(parsedData.skip);
            assert(parsedData.count);

            done();
        });
    });

});
