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
    .add('increase size by 400 for all dimensions', {
        defer: true,
        fn: function (deferred) {
            const img = new PngImg(img32);
            const size = img.size();
            img.setSize(size.width + 400, size.height + 400);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('[native] increase size by 400 for all dimensions', {
        defer: true,
        fn: function (deferred) {
            const img = new NativePngImg(img32);
            const size = img.size();
            img.setSize(size.width + 400, size.height + 400);
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
            const img = new PngImg(img32);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('[native] crop 32 bit image', {
        defer: true,
        fn: function (deferred) {
            const img = new NativePngImg(img32);
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
            const img = new PngImg(img24);
            img.crop(100, 100, 640, 512);
            img.save(outPath, function (err) {
                if (err) {
                    console.error(err);
                }
                deferred.resolve();
            });
        }
    })
    .add('[native] crop 24 bit image', {
        defer: true,
        fn: function (deferred) {
            const img = new NativePngImg(img24);
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
    })
    .run({ 'async': true });
