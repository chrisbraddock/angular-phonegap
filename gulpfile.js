var args = require('yargs').argv,
    gulp = require('gulp');

// Bumpo the package.json versions, build the app, and zip up a file for PG build
gulp.task('phonegap', function (cb) {
    var runSequence = require('run-sequence');
    runSequence(/*'bump-version',*/
                'zip-dist',
                cb);
});

// Zip ./dist -> ./dist.zip
gulp.task('zip-dist', function (cb) {
    var fs = require('fs'),
        archiver = require('archiver'),
        output = fs.createWriteStream('./dist.zip'),
        archive = archiver('zip');

    output.on('close', cb);
    archive.on('error', function (err) { throw err; });

    archive.pipe(output);

    archive.bulk([{
        expand: true,
        cwd: './dist/',
        src: ['**', '.*']
    }]);

    archive.finalize();
});

// Up the version in config.xml
gulp.task('bump-version', function (cb) {
    var fs = require('fs-extra'),
        util = require('gulp-util'),
        xmldom = require('xmldom'),
        bump = require('gulp-bump'),
        config,
        oldVersion,
        version,
        toks,
        val,
        doc;

    config = fs.readFileSync('config.xml', { encoding: 'utf-8' });
    doc = new xmldom.DOMParser().parseFromString(config, 'text/xml');

    if (args.buildVersion != null) {
        version = args.buildVersion;
        util.log('  Using specified buildVersion ' + version);
    } else {
        oldVersion = version = doc.documentElement.getAttribute('version');
        toks = version.split('.');
        val = parseInt(toks.pop(), 10) + 1;
        toks.push(val);
        version = toks.join('.');
        util.log('  Bumped version from ' + oldVersion + ' to ' + version);
    }

    doc.documentElement.setAttribute('version', version);
    fs.writeFileSync('config.xml', new xmldom.XMLSerializer().serializeToString(doc));
});
