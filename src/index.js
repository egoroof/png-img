const utils = require('./utils');
const upng = require('@egoroof/upng');
const fs = require('fs');

module.exports = class PngImg {
    ///
    constructor(rawImg) {
        this.img = upng.decode(rawImg);
        // https://www.w3.org/TR/PNG/#6Colour-values
        this.img.hasAlpha = this.img.ctype === 4 || this.img.ctype === 6;
        // todo
        // this.img.rgba = upng.toRGBA8(this.img)[0];
    }

    ///
    size() {
        return {
            width: this.img.width,
            height: this.img.height
        };
    }

    /**
     * Get pixel
     * @param  {Number} x x coordinate (left to right)
     * @param  {Number} y y coordinate (top to bottom)
     * @return {Object}  {r, g, b, a}
     */
    get(x, y) {
        const img = this.img;
        if (x > img.width - 1 || y > img.height - 1) {
            throw new Error('x and y should be less than image size');
        }
        const channelCount = img.hasAlpha ? 4 : 3;
        const pos = (y * img.width + x) * channelCount;
        return {
            r: img.data[pos],
            g: img.data[pos + 1],
            b: img.data[pos + 2],
            a: img.hasAlpha ? img.data[pos + 3] : 255
        };
    }

    /**
     * Set pixel color
     * @param {Number} x x coordinate (left to right)
     * @param {Number} y y coordinate (top to bottom)
     * @param {Object|String} color as rgb object or as a '#XXXXXX' string
     */
    set(x, y, color) {
        return this.fill(x, y, 1, 1, color);
    }

    /**
     * Fill region with some color
     * @param {Number} offsetX offset from left side of the image
     * @param {Number} offsetY offset from top side of the image
     * @param {Number} width
     * @param {Number} height
     * @param {Object|String} color as rgb object or as a '#XXXXXX' string
     */
    fill(offsetX, offsetY, width, height, color) {
        const img = this.img;
        if (typeof offsetX !== 'number') {
            offsetX = 0;
        }
        if (typeof offsetY !== 'number') {
            offsetY = 0;
        }
        if (offsetX < 0 || offsetY < 0 || width <= 0 || height <= 0) {
            throw new Error('Offsets and dimensions should not be negative');
        }
        if (width + offsetX > img.width || height + offsetY > img.height) {
            throw new Error('Fill area should be inside image');
        }
        if (typeof color === 'string') {
            var objColor = utils.stringToRGBA(color);
            if (!objColor) {
                throw new Error('Bad color ' + color);
            }

            return this.fill(offsetX, offsetY, width, height, objColor);
        }

        color = {
            r: color.r || 0,
            g: color.g || 0,
            b: color.b || 0,
            a: color.a === undefined ? 255 : color.a
        };
        const channelCount = img.hasAlpha ? 4 : 3;

        for (let i = offsetY; i < height + offsetY; i++) {
            for (let j = offsetX; j < width + offsetX; j++) {
                const pos = (i * img.width + j) * channelCount;
                img.data[pos] = color.r;
                img.data[pos + 1] = color.g;
                img.data[pos + 2] = color.b;
                if (img.hasAlpha) {
                    img.data[pos + 3] = color.a;
                }
            }
        }

        return this;
    }

    ///
    crop(offsetX, offsetY, width, height) {
        if (offsetX < 0 || offsetY < 0 || width < 0 || height < 0) {
            throw new Error('Offsets and dimensions should be positive');
        }
        if (offsetX > width || offsetY > height) {
            throw new Error('Offsets should be less than dimensions');
        }
        if (width > this.img.width || height > this.img.height) {
            throw new Error('Dimensions should be less than image size');
        }
        const channelCount = this.img.hasAlpha ? 4 : 3;
        const cropped = Buffer.alloc(width * height * channelCount);
        const src = Buffer.from(this.img.data.buffer);
        let croppedPos = 0;

        for (let i = offsetY; i < height + offsetY; i++) {
            for (let j = offsetX; j < width + offsetX; j++) {
                const pos = (i * this.img.width + j) * channelCount;
                cropped.writeUIntLE(src.readUIntLE(pos, channelCount), croppedPos, channelCount);
                croppedPos += channelCount;
            }
        }

        this.img.data = new Uint8Array(cropped.buffer);
        this.img.width = width;
        this.img.height = height;

        return this;
    }


    /**
     * Set new image size. Doesn't strech image, just add more pixels
     * @param {Number} width
     * @param {Number} height
     */
    setSize(width, height) {
        const size = this.size();
        if (width <= size.width && height <= size.height) {
            return this.crop(0, 0, width, height);
        }

        const channelCount = this.img.hasAlpha ? 4 : 3;
        const extended = new Uint8Array(width * height * channelCount);
        let pos = 0;

        for (let i = 0; i < this.img.height; i++) {
            for (let j = 0; j < this.img.width; j++) {
                for (let channel = 0; channel < channelCount; channel++) {
                    const extendedPos = (i * width + j) * channelCount + channel;
                    extended[extendedPos] = this.img.data[pos++];
                }
            }
        }
        this.img.data = extended;
        this.img.width = width;
        this.img.height = height;

        return this;
    }

    /**
     * Inserts image
     * @param {PngImg} img image to insert
     * @param {Number} offsetX
     * @param {Number} offsetY
     */
    insert(img, offsetX, offsetY) {
        if (!(img instanceof PngImg)) {
            throw new Error('Not a PngImg object');
        }
        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        const imgSize = img.size();
        const mySize = this.size();

        if (offsetX + imgSize.width > mySize.width || offsetY + imgSize.height > mySize.height) {
            throw new Error('Out of the bounds');
        }

        const channelCount = this.img.hasAlpha ? 4 : 3;
        let pos = 0;

        for (let i = offsetY; i < imgSize.height + offsetY; i++) {
            for (let j = offsetX; j < imgSize.width + offsetX; j++) {
                const myPos = (i * mySize.width + j) * channelCount;

                this.img.data[myPos] = img.img.data[pos++];
                this.img.data[myPos + 1] = img.img.data[pos++];
                this.img.data[myPos + 2] = img.img.data[pos++];
                if (this.img.hasAlpha) {
                    if (img.img.hasAlpha) {
                        this.img.data[myPos + 3] = img.img.data[pos++];
                    } else {
                        this.img.data[myPos + 3] = 255;
                    }
                }
            }
        }

        return this;
    }

    /**
     * Rotates image 90 degrees clockwise
     */
    rotateRight() {
        return this;
    }

    /**
     * Rotates image 90 degrees counterclockwise
     */
    rotateLeft() {
        return this;
    }

    /**
     * Save image to file
     * @param  {String}   file     path to file
     * @param  {SaveCallback} callback
     */
    save(file, callback) {
        const img = this.img;
        const alpha = img.hasAlpha ? 1 : 0;
        const colorChannels = 3;
        const filter = 0;
        const buffer = Buffer.from(upng.encodeLL(
            [img.data.buffer], img.width, img.height, colorChannels, alpha, img.depth, filter
        ));
        fs.writeFile(file, buffer, callback);
    }

    /**
     * @typedef {Function} SaveCallback
     * @param {String} error error message in case of fail
     */
};
