const router = require("express").Router()
const { v4: uuid_v4 } = require("uuid")
const user = require("../model/user_model")

router.post('/register', (req, res) => {
    const { username, email, password } = req.body
    console.log(req.body);
    user.findAll({where: {username}}).then((data1) => {
        if (data1.length) {
            res.status(200).redirect('/user/register', { msg: "Username sudah terdaftar" })
        } else {
            user.create({ id: uuid_v4(), username, email, password }).then((data) => {
                res.status(200).redirect('/user/register', { msg: "Registrasi berhasil" })
            }).catch((err) => {
                console.log(err);
                res.json({ message: err.message })
            })
        }
    })
});

module.exports = router