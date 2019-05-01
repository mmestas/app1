var gulp = require('gulp') // import the gulp module itself
const sass = require("gulp-sass")
const watchSass = require("gulp-watch-sass")
// var reveasy = require('node_modules/gulp-rev-easy/index');
//Use for compiling Sass.... first cd to css/custom
// sass --watch CompanyNme.scss CompanyNme.css
//from the cmd line: gulp sass:watch
var reveasy = require('gulp-rev-easy');

gulp.task('reveasy', function (argument) {
	gulp.src('index.html')
      .pipe(reveasy({
        base : 'C:\\Users\\MyName\\Documents\\GitHub\\CoName\\ui',
        revMode:'dom',
        hashLength:4,
        revType:'hash',
        suffix:'v',
        fileTypes:['css', 'js'],
      }))
		.pipe(gulp.dest("./"))
});

gulp.task('sass', function(){
	console.log('sass');
  return gulp.src('./css/custom/CompanyNme.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('./css/custom'))
});

gulp.task("sass:watch", () => watchSass([
  "./css/custom/**/*.{scss,css}"
])
  .pipe(sass())
  .pipe(gulp.dest("./css/custom")));


	// ,
	// "!./css/libraries/**/*"
