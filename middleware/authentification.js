const { verifyToken } = require("../helper/jwt")
const user = require("../model/user_model")

async function authentification(req, res, next) {
    try {
        // console.log(req.headers.token);
        if (!req.headers.token) {
            res.status(201).json({ status: 204, message: "anda belum login" });
        } else {
            var decode = verifyToken(req.headers.token);
            // console.log(decode);
            user.findAll({ where: { id: decode.id } }).then(data => {
                if (data.length > 0) {
                    req.dataUsers = decode
                    next()
                } else {
                    res.status(201).json({ status: 204, message: "anda belum login" });
                }
            })
        }
        
    } catch (err) {
        console.log(err, 'error middleware');
        res.status(500).json({ status: 500, message: err });
    }
}

module.exports = authentification
