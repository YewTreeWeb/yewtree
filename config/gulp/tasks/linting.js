import { task, src, dest } from 'gulp';

import shell from 'shelljs';
import plugins from "gulp-load-plugins";

const $ = plugins({
  pattern: ['gulp-*', '*', '-', '@*/gulp{-,.}*'],
  replaceString: /\bgulp[\-.]/
});

// new function added to check if ESLint has run the fix.
function isFixed(file) {
	return file.eslint !== null && file.eslint.fixed;
}

// JS lint
task('eslint', () => {
  const file = fs.createWriteStream('reports/lint/eslint-report.xml');

  return src('src/assets/js', '!node_modules/**')
  .pipe($.eslint({
    fix: true,
  }))
  .pipe($.eslint.results(results => {
    // Called once for all ESLint results.
    console.log(`Total Results: ${results.length}`);
    console.log(`Total Warnings: ${results.warningCount}`);
    console.log(`Total Errors: ${results.errorCount}`);
  }))
  .pipe($.eslint.format())
  .pipe($.eslint.format('checkstyle', file))
  // if running fix - replace existing file with fixed one
  .pipe($.when(isFixed, gulp.dest('src/assets/js')));
});

// Style lint
task ('stylelint', () => {
	return src('src/assets/scss')
		.pipe($.plumber())
		.pipe($.stylelint({
      fix: true,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'json', save: 'report.json'},
      ],
      debug: true
		}))
		.pipe(dest('src/assets/scss'));
});

// 'gulp doctor' -- literally just runs jekyll doctor
task('jekyll:doctor', (done) => {
    shell.exec('jekyll doctor');
    done();
  });