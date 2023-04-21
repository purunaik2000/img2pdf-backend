module.exports.sendResponse = (statusCode, status, msg, data = null)=> {
    return {
        statusCode: statusCode,
        body: JSON.stringify({
            status: status,
            message: msg,
            data: data
        })
    }
}