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
    pikachuImg = new PngImg(pikachuBuff);
}

function resetNativeImg() {
    img = new NativePngImg(imgBuff);
    pikachuImg = new NativePngImg(pikachuBuff);
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
    .add('constructor', {
        fn: () => new PngImg(imgBuff),
    })
    .add('[native] constructor', {
        fn: () => new NativePngImg(imgBuff),
    })
    .add('size', {
        fn: () => img.size(),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] size', {
        fn: () => img.size(),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('get', {
        fn: () => img.get(500, 500),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] get', {
        fn: () => img.get(500, 500),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('set', {
        fn: () => img.set(500, 500, '#ffffff'),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] set', {
        fn: () => img.set(500, 500, '#ffffff'),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('fill', {
        fn: () => img.fill(500, 500, 300, 300, '#ffffff'),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] fill', {
        fn: () => img.fill(500, 500, 300, 300, '#ffffff'),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
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
    .add('setSize', {
        fn: () => img.setSize(1500, 1000),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] setSize', {
        fn: () => img.setSize(1500, 1000),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('insert', {
        fn: () => img.insert(pikachuImg, 100, 100),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] insert', {
        fn: () => img.insert(pikachuImg, 100, 100),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('rotateRight', {
        fn: () => img.rotateRight(),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] rotateRight', {
        fn: () => img.rotateRight(),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('rotateLeft', {
        fn: () => img.rotateLeft(),
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] rotateLeft', {
        fn: () => img.rotateLeft(),
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .add('save', {
        defer: true,
        fn: saveTest,
        onStart: resetImg,
        onCycle: resetImg,
    })
    .add('[native] save', {
        defer: true,
        fn: saveTest,
        onStart: resetNativeImg,
        onCycle: resetNativeImg,
    })
    .on('cycle', (event) => {
        console.log(String(event.target));
    })
    .run({ 'async': true });
