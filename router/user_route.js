const router = require("express").Router()
const authentification = require("../middleware/authentification")
const { upload } = require('../helper/upload');
const Controller = require("../controller/user_controller")

router.post('/register',  Controller.register);
router.post('/login', Controller.login)
router.get('/profil', authentification, Controller.profil)
router.get('/list', authentification, Controller.list)
router.post('/delete', Controller.delete)

module.exports = router