const benchmark = require('benchmark');
const fs = require('fs');
const PngImg = require('../src/index');
const NativePngImg = require('png-img');

const suite = new benchmark.Suite();
const img32 = fs.readFileSync(__dirname + '/test.png');
const img24 = fs.readFileSync(__dirname + '/test_no_alpha.png');
const outPath = __dirname + '/out.png';

// add tests
suite
    .add('native, crop 32 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new NativePngImg(img32);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('native, crop 24 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new NativePngImg(img24);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('crop 32 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new PngImg(img32);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('crop 24 bit image', {
        defer: true,
        fn: function (deferred) {
            var img = new PngImg(img24);
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
