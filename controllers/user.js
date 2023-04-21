const { sendResponse } = require('../help/response');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../mysql/query');

module.exports.createUser = async (event) => {
    let body = await JSON.parse(event.body);
    let { name, email, mobile, password } = body;
    const fields = ['name', 'email', 'mobile', 'password'];
    for (let field of fields) if (!body[field]) return sendResponse(400, false, `Please provide ${field}`);
    if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/.test(email)) return sendResponse(400, false, 'Invalid email');
    if(!/^[6-9][0-9]{9}$/.test(mobile)) return sendResponse(400, false, 'Invalid mobile');
    let user = await db.do('select * from user where email=? or mobile=?', [email, mobile]);
    if (user.length) {
        if (user[0].email == email) return sendResponse(400, false, `${email} is already registered`);
        return sendResponse(400, false, `${mobile} is already registered`);
    }
    password = await bcrypt.hash(body.password, 10);
    console.log(password.length);
    const values = [[name, email, mobile, password]];
    const newUser = await db.do('insert into user (name, email, mobile, password) values ?', [values]);
    const data = { userId: newUser.insertId, name, email, mobile };
    return sendResponse(201, true, 'Your profile created successfully', data);
}

module.exports.login = async (event) => {
    const { email, password } = await JSON.parse(event.body);
    if (!email) return sendResponse(400, false, 'Please provide email');
    if (!password) return sendResponse(400, false, 'Please provide password');
    let user = await db.do(`select * from user where email='${email}'`);
    if (!user.length) return sendResponse(400, false, `${email} is not registered`);
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) return sendResponse(400, false, 'Incorrect password');
    const token = jwt.sign(
        {
            userId: user[0].user_id,
            name: user[0].name
        },
        'secret-signature'
    )
    const data = {
        userId: user[0].user_id,
        name: user[0].name,
        email: user[0].email,
        mobile: user[0].mobile,
        token: token
    }
    return sendResponse(200, true, 'Logged in successfully', data);
}