# gulp-connect-reproxy
A simple proxy middleware for gulp-connect, it can start reverse proxy server with gulp-connect, and it supports Regular Expression.

# Install
```
npm install gulp-connect-reproxy --save
```

# Usage
```javascript

var gulp = require("gulp");
var connect = require("gulp-connect");
var Reproxy = require("gulp-connect-reproxy");

gulp.task('connect', function () {
    connect.server({
        root: "build",
        port: 9000,
        livereload: true,

        middleware: function (connect, options) {

            options.rule = [/\.do/, /\.jsp/, /\.htm/];
//or        options.rule = /\.do/;

            options.server = "127.0.0.1:8081";

            var proxy = new Reproxy(options);

            return [proxy];
        }
    });
});
```


# Notes
```
@ options.rule
    The rule to proxy, it is an array or a string of Regular Expression
@ options.server
    a server host name to proxy, contains the host and port
```

# Example

If we config it like this
```
    @options : {
        rule : /.do/,
        server : "127.0.0.1:8081"
    }
```
when we request "http://127.0.0.1:9000/user/edit.do",<br/>
    the proxy server will work and the URL will be redirected to "http://127.0.0.1:8001/user/edit.do";<br/>
but when we requrest "http://127.0.0.1:9000/user/user.js",<br/>
    it will not work.


# User
Name : Bin Zhang<br/>
From : Beijing China
