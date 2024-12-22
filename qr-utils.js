const QRCodeReader = require('qrcode-reader');
const Jimp = require('jimp');

// Decode QR code from an image buffer 
// param {Buffer}
// return {Promise<string | null>}

async function decodeQR(imgBuffer) {
    try {

        const image = await Jimp.default.read(imgBuffer);
        const qr = new QRCodeReader();

        // decode qr 
        return new Promise((resolve, reject) => {
            qr.callback = (err, result) => {
                if (err || !result) resolve(null);
                else resolve(result.result);
            }
            qr.decode(image.bitmap);
        })

    } catch (err) {
        console.log(err);
        return null;
    }
}

module.exports = { decodeQR }

