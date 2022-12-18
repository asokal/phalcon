var gulp         = require('gulp'),
	sass         = require('gulp-sass')(require('sass')),
	browserSync  = require('browser-sync'),
	concat       = require('gulp-concat'),
	uglify       = require('gulp-uglify'),
	cssnano      = require('gulp-cssnano'),
	rename       = require('gulp-rename'),
	del          = require('del'),
	image        = require('gulp-image'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	fileinclude  = require('gulp-file-include');

// таск для компиляции scss в css
gulp.task('sass', function() {
	return gulp.src('scss/style.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
	.pipe(gulp.dest('css'))
	.pipe(browserSync.reload({stream: true}))
});


// таск для сжатия и объединения js файлов
gulp.task('scripts', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'node_modules/jquery/dist/jquery.min.js',
		'js/vendors/hljs.js',
		'js/vendors/slick.js',
		'js/main.js',
		])
		.pipe(concat('main.min.js')) // Собираем их в кучу в новом файле libs.min.js
		//.pipe(uglify()) // Сжимаем JS файл
		.pipe(gulp.dest('js')); // Выгружаем в папку app/js
});

// fileinclude - простейший шабланизатор
gulp.task('fileinclude', function()
{
	gulp.src('src/*.html') // откуда брать файлы
	.pipe(fileinclude({
		prefix: '@@',
		basepath: '@file'
	}))
	.pipe(gulp.dest("./")); // сюда кладется скомпилированные html файлы
});

// таск для обновления страницы
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: './'
		},
		notify: false,
	})
});

// таск следит за изменениями файлов и вызывает другие таски
gulp.task('watch', function() {
	gulp.watch('scss/**/*.scss', gulp.parallel('sass'));
	gulp.watch(['src/*.html','src/**/*.html'], gulp.parallel('fileinclude'));
	gulp.watch(['js/vendors/*.js', 'js/main.js', 'js/modules/*.js'], gulp.parallel('scripts'));
	gulp.watch('src/*.html', gulp.parallel(function() { browserSync.reload(); }));
	gulp.watch('**/*.html', gulp.parallel(function() { browserSync.reload(); }));
	gulp.watch('js/*.js', gulp.parallel(function() { browserSync.reload(); }));
});

// таск сжимает картинки без потери качества
gulp.task('img', function() {
	return gulp.src('images/**/*') // откуда брать картинки
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	})))
	.pipe(gulp.dest('dist/img')) // куда класть сжатые картинки
});

// основной таск, который запускает вспомогательные
gulp.task('default', gulp.parallel('browser-sync','watch', 'sass', 'fileinclude', 'scripts', function() {console.log('dev start');}));