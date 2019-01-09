const utils = require('./utils');
const upng = require('@egoroof/upng');
const fs = require('fs');

module.exports = class PngImg {
    ///
    constructor(rawImg) {
        this.img = upng.decode(rawImg);
        // https://www.w3.org/TR/PNG/#6Colour-values
        this.img.hasAlpha = this.img.ctype === 4 || this.img.ctype === 6;
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
        const size = this.size();
        if (offsetX < 0 || offsetY < 0 || width < 0 || height < 0) {
            throw new Error('Offsets and dimensions should be positive');
        }
        if (offsetX > width || offsetY > height) {
            throw new Error('Offsets should be less than dimensions');
        }
        if (width > size.width || height > size.height) {
            throw new Error('Dimensions should be less than image size');
        }
        const channelCount = this.img.hasAlpha ? 4 : 3;
        const cropped = Buffer.allocUnsafe(width * height * channelCount);

        for (let row = 0; row < height; row++) {
            const targetStart = row * width * channelCount;
            const sourceStart = ((row + offsetY) * size.width + offsetX) * channelCount;
            const sourceEnd = ((row + offsetY + 1) * size.width + offsetX) * channelCount + 1;
            this.img.data.copy(cropped, targetStart, sourceStart, sourceEnd);
        }

        this.img.data = cropped;
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
        const extended = Buffer.alloc(width * height * channelCount);
        let pos = 0;

        // copy source image
        for (let i = 0; i < this.img.height; i++) {
            for (let j = 0; j < this.img.width; j++) {
                const extendedPos = (i * width + j) * channelCount;
                extended.writeUIntLE(this.img.data.readUIntLE(pos, channelCount), extendedPos, channelCount);
                pos += channelCount;
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

        if ((this.img.hasAlpha && img.img.hasAlpha) ||
            (!this.img.hasAlpha && !img.img.hasAlpha)) {
            const channelCount = this.img.hasAlpha ? 4 : 3;
            for (let row = 0; row < imgSize.height; row++) {
                const targetStart = ((row + offsetY) * mySize.width + offsetX) * channelCount;
                const sourceStart = row * imgSize.width * channelCount;
                const sourceEnd = (row + 1) * imgSize.width * channelCount + 1;
                img.img.data.copy(this.img.data, targetStart, sourceStart, sourceEnd);
            }
        } else if (this.img.hasAlpha) {
            // extend source pixels with alpha
            // todo test it perf
            let sourceStart = 0;
            for (let row = offsetY; row < imgSize.height + offsetY; row++) {
                for (
                    let targetStart = (row * mySize.width + offsetX) * 4;
                    targetStart < (row * mySize.width + imgSize.width + offsetX) * 4;
                    targetStart += 4
                ) {
                    this.img.data.writeUIntLE(img.img.data.readUIntLE(sourceStart, 3), targetStart, 3);
                    this.img.data.writeUInt8(255, targetStart + 3);
                    sourceStart += 3;
                }
            }
        }

        return this;
    }

    /**
     * Rotates image 90 degrees clockwise
     */
    rotateRight() {
        const size = this.size();
        const channelCount = this.img.hasAlpha ? 4 : 3;
        const rotated = Buffer.allocUnsafe(size.width * size.height * channelCount);
        let pos = 0;

        // transform every pixel:
        // rowNew = col
        // colNew = rowCount - 1 - row
        // rotated[rowNew, colNew] = data[row, col]
        for (let row = 0; row < size.height; row++) {
            const colNew = size.height - 1 - row;
            for (let col = 0; col < size.width; col++) {
                const posNew = (col * size.height + colNew) * channelCount;
                rotated.writeUIntLE(this.img.data.readUIntLE(pos, channelCount), posNew, channelCount);
                pos += channelCount;
            }
        }

        this.img.data = rotated;
        this.img.width = size.height;
        this.img.height = size.width;

        return this;
    }

    /**
     * Rotates image 90 degrees counterclockwise
     */
    rotateLeft() {
        const size = this.size();
        const channelCount = this.img.hasAlpha ? 4 : 3;
        const rotated = Buffer.allocUnsafe(size.width * size.height * channelCount);
        let pos = 0;

        // transform every pixel:
        // rowNew = colCount - 1 - col
        // colNew = row
        // rotated[rowNew, colNew] = data[row, col]
        for (let row = 0; row < size.height; row++) {
            for (let col = 0; col < size.width; col++) {
                const rowNew = size.width - 1 - col;
                const posNew = (rowNew * size.height + row) * channelCount;
                rotated.writeUIntLE(this.img.data.readUIntLE(pos, channelCount), posNew, channelCount);
                pos += channelCount;
            }
        }

        this.img.data = rotated;
        this.img.width = size.height;
        this.img.height = size.width;

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
