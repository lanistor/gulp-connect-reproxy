var url    = require('url');
var http   = require('http');
var fs     = require('fs');
var path   = require('path');
var extend = require('extend');


function proxyRequest (localRequest, localResponse, next) {
    var options = url.parse('http://' + localRequest.url);

    http.request(options, function (remoteRequest) {
        if (remoteRequest.statusCode === 200) {
            localResponse.writeHead(200, {
                'Content-Type': remoteRequest.headers['content-type']
            });
            remoteRequest.pipe(localResponse);
        } else {
            localResponse.writeHead(remoteRequest.statusCode);
            localResponse.end();
        }
    }).on('error', function(e) {
        next();
    }).end();
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
                        console.log("11111")
                        var proxyFlag = false;
                        for(var ind=0; ind<config.rule.length; ind++){
                            if(config.rule[ind].test(localRequest.url)){
                                proxyFlag = true;
                                break;
                            }
                        }
                        console.log("22222:"+proxyFlag)
                        if(proxyFlag){                            
                            localRequest.url = config.server + localRequest.url;
                            console.log("333333:" + localRequest.url)
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
