module.exports = function queryParser(params) {

    var query = {};
    query.where = {};

    if(params['where']) {

        query.where = (typeof(params['where']) === 'object') ? params['where'] : JSON.parse(params['where']);
        delete params['where'];

        if(query.where['$select']) {

            query['$select'] = query.where['$select'];
            delete query.where['$select'];
        }
        if(query.where['$dontSelect']) {

            query['$dontSelect'] = query.where['$dontSelect'];
            delete query.where['$dontSelect'];
        }

        function parseReservedKey(query) {

            for(var key in query) {

                if(typeof(query[key]) === 'object') {

                    if(query[key]['$ISODate']) {

                        query[key] = new Date(query[key]['$ISODate']);
                    } else {

                        parseReservedKey(query[key]);
                    }
                }
            }
        }

        parseReservedKey(query.where);
    }

    if(params['order']) {

        var orders = params['order'].split(',');

        if(orders.length > 0)
            query.order = {};

        for(var i= 0, cnt= orders.length; i<cnt; i++) {

            if(orders[i].charAt(0) == '-') {

                query.order[orders[i].substring(1)] = -1;
            } else {

                query.order[orders[i]] = 1;
            }
        }

        delete params['order'];
    }

    if(params['limit']) {

        query.limit = params['limit'] >> 0;
        delete params['limit'];
    }

    if(params['skip']) {

        query.skip = params['skip'] >> 0;
        delete params['skip'];
    }

    if(params['include']) {

        query.include = params['include'];
        delete params['include'];
    }

    if(params['count']) {

        query.count = params['count'] >> 0;
        delete params['count'];
    }

    return query;
};