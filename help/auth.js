const jwt = require('jsonwebtoken');

module.exports.authentication = async (data)=>{
    try {
        if(!data) return false;
        let token = data.substring(7);
        let decoded = jwt.verify(token, 'secret-signature');
        return decoded;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}