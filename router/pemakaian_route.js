const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/pemakaian_controller")

router.post('/create', Controller.create);
router.post('/createBulk', Controller.createBulk);
router.post('/update', Controller.update);
router.post('/delete', Controller.delete);
router.post('/listPemakaianByPelangganId', Controller.listPemakaianByPelangganId);
router.post('/listPemakaianBulanLalu', Controller.listPemakaianBulanLalu);
router.post('/listBulanPemakaianBelumLunas', Controller.listBulanPemakaianBelumLunas);
router.post('/getBulanByTanggalInput', Controller.getBulanByTanggalInput);
router.post('/getPemakaianBulanLalu', Controller.getPemakaianBulanLalu);
router.get('/list', Controller.list);
router.get('/detailsById/:id', Controller.detailsById);
router.get('/cetakFormulirPencatatan', Controller.cetakFormulirPencatatan);

module.exports = router