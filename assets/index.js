var url    = require('url');
var http   = require('http');
var fs     = require('fs');
var path   = require('path');
var extend = require('extend');


function proxyRequest (localRequest, localResponse, next) {
    
    var options = url.parse('http://' + localRequest.url);

    extend(options, {
        method : localRequest.method,
        headers : localRequest.headers
    });

    var newHttp = http.request(options, function (remoteResponse) {
        if (remoteResponse.statusCode === 200) {
            localResponse.writeHead(200, {
                'Content-Type': remoteResponse.headers['content-type']
            });
            remoteResponse.pipe(localResponse);
        } else {
            localResponse.writeHead(remoteResponse.statusCode);
            localResponse.end();
        }
    });


    if (/POST|PUT/i.test(localRequest.method)) {
        localRequest.pipe(newHttp);
    } else {
        newHttp.end();
    }
    newHttp.on('error', function (err) {
        // localResponse.end(err.stack);
        next();
    }).setTimeout(10000,function(err){
        // localResponse.end();
        next();
    });
};

function Proxy (options) {
    var config = extend({}, {
        rule: '',
        server: '' 
    }, options);

    return function (localRequest, localResponse, next) {

        if (typeof config.root === 'string') {
            config.root = [config.root]
        } else if (!Array.isArray(config.root)) {
            throw new Error('No root specified')
        }

        if (!config.rule || !config.server){
            throw new Error('Config error')
        }

        if (config.rule instanceof RegExp){
            config.rule = [config.rule];
        }

        if(!config.rule instanceof Array){
            throw new Error('Config rule error')
        }

        var pathChecks = []
        config.root.forEach(function(root, i) {
            var p = path.resolve(root)+localRequest.url;

            fs.access(p, function(err) {
                pathChecks.push(err ? false : true)
                if (config.root.length == ++i) {
                    var pathExists = pathChecks.some(function (p) {
                        return p;
                    });
                    if (pathExists) {
                        next();
                    } else {
                        var proxyFlag = false;
                        var url = localRequest.url.indexOf("?")>0? localRequest.url.substring(0, localRequest.url.indexOf("?")) : localRequest.url;
                        
                        for(var ind=0; ind<config.rule.length; ind++){
                            if(config.rule[ind].test(url)){
                                proxyFlag = true;
                                break;
                            }
                        }
                        if(proxyFlag){                            
                            localRequest.url = config.server + localRequest.url;
                            proxyRequest(localRequest, localResponse, next);                            
                        }else{
                            return next();
                        }
                    }
                }
            });
        })
    }
}

module.exports = Proxy;
