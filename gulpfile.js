var gulp = require("gulp");
var license = require('gulp-header-license');
 
gulp.task('license', function () {
    var year = (new Date()).getFullYear();
    gulp.src('./assets/**/*')
            // .pipe(license('Copyright (c) ${year}, B3log.org', {year: year}))
            .pipe(gulp.dest('./public/'));
});

gulp.task("default", ["license"]);