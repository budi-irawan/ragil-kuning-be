const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/pemakaian_controller")

router.post('/create', Controller.create);
router.post('/update', Controller.update);
router.post('/delete', Controller.delete);
router.post('/listPemakaianByPelangganId', Controller.listPemakaianByPelangganId);
router.post('/listPemakaianBulanLalu', Controller.listPemakaianBulanLalu);
router.post('/listBulanPemakaianBelumLunas', Controller.listBulanPemakaianBelumLunas);
router.get('/list', Controller.list);
router.get('/detailsById/:id', Controller.detailsById);
router.get('/cetakFormulirPencatatan', Controller.cetakFormulirPencatatan);

module.exports = router