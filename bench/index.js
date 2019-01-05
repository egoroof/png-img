var Index = require('benchmark');
var fs = require('fs');
var pngjs = require('../src/index');
// var NativePngImg = require('./native');

var suite = new Index.Suite();
var img32 = fs.readFileSync(__dirname + '/test.png');
var img24 = fs.readFileSync(__dirname + '/test_no_alpha.png');
var outPath = __dirname + '/out.png';

// add tests
suite
    // .add('native, 32 bit image', {
    //     defer: true,
    //     fn: function (deferred) {
    //         var img = new NativePngImg(img32);
    //         img.crop(100, 100, 640, 512);
    //         img.save(outPath, function (err) {
    //             if (err) {
    //                 console.error(err);
    //             }
    //             deferred.resolve();
    //         });
    //     }
    // })
    // .add('native, 24 bit image', {
    //     defer: true,
    //     fn: function (deferred) {
    //         var img = new NativePngImg(img24);
    //         img.crop(100, 100, 640, 512);
    //         img.save(outPath, function (err) {
    //             if (err) {
    //                 console.error(err);
    //             }
    //             deferred.resolve();
    //         });
    //     }
    // })
    .add('js, 32 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new pngjs(img32);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('js, 24 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new pngjs(img24);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .on('cycle', function (event) {
        console.log(String(event.target));
        fs.unlinkSync(outPath);
    })
    .run({ 'async': true });
