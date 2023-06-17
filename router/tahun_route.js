const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/tahun_controller")

router.post('/create', Controller.create);
router.post('/update', Controller.update);
router.post('/delete', Controller.delete);
router.post('/aktifkanTahun', Controller.aktifkanTahun);
router.post('/nonAktifkanTahun', Controller.nonAktifkanTahun);
router.get('/list', Controller.list);
router.get('/detailsById/:id', Controller.detailsById);

module.exports = router