const db = require('./connection');

module.exports.do = (data, values) => {
    return new Promise((resolve, reject) => {
        db.query(data, values, (err, res) => {
            if (err) reject(err.message);
            else resolve(JSON.parse(JSON.stringify(res)));
        })
    })
}