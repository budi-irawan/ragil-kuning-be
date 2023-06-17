const router = require("express").Router()
const authentification = require("../middleware/authentification")
const { upload } = require('../helper/upload');
const Controller = require("../controller/pelanggan_controller")

router.post('/create', upload.single('file'), Controller.create);
router.post('/uploadGambar', upload.single('file'), Controller.uploadGambar);
router.post('/update', Controller.update);
router.post('/delete', Controller.delete);
router.get('/list', Controller.list);
router.get('/detailsById/:id', Controller.detailsById);

router.get('/importPelanggan', Controller.importPelanggan);
router.get('/importPemakaian', Controller.importPemakaian);
router.get('/importPembayaran', Controller.importPembayaran);
router.get('/importPembayaranTagihan', Controller.importPembayaranTagihan);

module.exports = router