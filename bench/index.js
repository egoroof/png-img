const benchmark = require('benchmark');
const fs = require('fs');
const PngImg = require('../src/index');
const NativePngImg = require('png-img');

const suite = new benchmark.Suite();
const imgBuff = fs.readFileSync(__dirname + '/test.png');
const pikachuBuff = fs.readFileSync(__dirname + '/pikachu.png');
const outPath = __dirname + '/out.png';

let img;
let pikachuImg;

function resetImg() {
    img = new PngImg(imgBuff);
}

function resetNativeImg() {
    img = new NativePngImg(imgBuff);
}

function saveTest(deferred) {
    img.save(outPath, (err) => {
        if (err) {
            console.error(err);
        }
        deferred.resolve();
    });
}

function cropTest() {
    try {
        img.crop(100, 100, 640, 512);
    } catch (e) {
        // fn is called more times than onCycle, so it throws
    }
}

suite
    .add('insert', {
        fn: () => img.insert(pikachuImg, 100, 100),
        onStart: () => {
            resetImg();
            pikachuImg = new PngImg(pikachuBuff);
        },
    })
    .add('[native] insert', {
        fn: () => img.insert(pikachuImg, 100, 100),
        onStart: () => {
            resetNativeImg();
            pikachuImg = new NativePngImg(pikachuBuff);
        },
    })
    .add('constructor', {
        fn: () => new PngImg(imgBuff),
    })
    .add('[native] constructor', {
        fn: () => new NativePngImg(imgBuff),
    })
    .add('save', {
        defer: true,
        fn: saveTest,
        onStart: resetImg,
    })
    .add('[native] save', {
        defer: true,
        fn: saveTest,
        onStart: resetNativeImg,
    })
    .add('rotateRight', {
        fn: () => img.rotateRight(),
        onStart: resetImg,
    })
    .add('[native] rotateRight', {
        fn: () => img.rotateRight(),
        onStart: resetNativeImg,
    })
    .add('setSize', {
        fn: () => img.setSize(1500, 1000),
        onStart: resetImg,
    })
    .add('[native] setSize', {
        fn: () => img.setSize(1500, 1000),
        onStart: resetNativeImg,
    })
    .add('crop', {
        fn: cropTest,
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] crop', {
        fn: cropTest,
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .run({ 'async': true });
