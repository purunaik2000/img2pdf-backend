const { sendResponse } = require('../help/response');
const db = require('../mysql/query');
const multipart = require('lambda-multipart-parser');
const { uploadFile } = require('../aws/upload');
const { authentication } = require('../help/auth');

module.exports.upload = async (event) => {
    try {
        const decoded = await authentication(event.headers.Authorization);
        if (!decoded) return sendResponse(400, false, 'Login first');
        let data = await multipart.parse(event);
        for (let image of data.files) if (!image.contentType.includes('image')) return sendResponse(400, false, 'Please upload images only');
        const images = await db.do('insert into image (name, user_id) values ?', [[[Date.now(), decoded.userId]]]);
        const values = [];
        for (let img of data.files) {
            let url = await uploadFile(img).catch(err => console.log(err));
            console.log(url);
            values.push([img.filename, images.insertId, url]);
        }
        await db.do('insert into image_url (name, image_id, image_url) values ?', [values]);
        return sendResponse(201, true, 'Uploaded', { images: values });
    } catch (error) {
        return sendResponse(500, false, error.message);
    }
}

module.exports.getImages = async function (event) {
    try {
        const decoded = await authentication(event.headers.Authorization);
        if (!decoded) return sendResponse(400, false, 'Login first');
        let images = await db.do('select * from image where user_id=?', [decoded.userId]);
        if (!images.length) return sendResponse(200, true, 'No images found');
        const ids = images.map(e => e.image_id);
        let urls = await db.do(`select * from image_url where image_id in (${ids.join()})`);
        for (let e of urls) {
            let index = images.findIndex(obj => obj.image_id == e.image_id);
            if (images[index].urls) images[index].urls.push(e);
            else images[index].urls = [e];
        }
        images = images.reverse();
        return sendResponse(200, true, 'success', images);
    } catch (error) {
        return sendResponse(500, false, error.message);
    }
}

module.exports.renameCollection = async function (event) {
    try {
        const decoded = await authentication(event.headers.Authorization);
        if (!decoded) return sendResponse(400, false, 'Login first');
        let body = await JSON.parse(event.body);
        let { image_id, newName } = body;
        await db.do('update image set name=? where image_id=?', [newName, image_id]);
        return sendResponse(200, true, 'updated');
    } catch (error) {
        return sendResponse(500, false, error.message);
    }
}