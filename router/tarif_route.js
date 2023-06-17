const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/tarif_controller")

router.post('/create', Controller.create);
router.post('/update', Controller.update);
router.post('/aktifkanTarif', Controller.aktifkanTarif);
router.post('/nonAktifkanTarif', Controller.nonAktifkanTarif);
router.post('/delete', Controller.delete);
router.get('/list', Controller.list);
router.get('/listTarifAktif', Controller.listTarifAktif);
router.get('/detailsById/:id', Controller.detailsById);

module.exports = router