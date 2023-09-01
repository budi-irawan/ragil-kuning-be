const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/pembayaran_controller")

router.post('/createPembayaranPerBulan', Controller.createPembayaranPerBulan);
router.post('/createPembayaranGabungan', Controller.createPembayaranGabungan);
router.post('/update', Controller.update);
router.post('/delete', Controller.delete);
router.post('/listTagihanByPelangganId', Controller.listTagihanByPelangganId);
router.post('/sisaTagihanByPelangganId', Controller.sisaTagihanByPelangganId);
router.post('/listTagihanBelumLunasByPelangganId', Controller.listTagihanBelumLunasByPelangganId);
router.post('/listPembayaranByPemakaianId', Controller.listPembayaranByPemakaianId);
router.post('/cetakStruk', Controller.cetakStruk);
router.get('/list', Controller.list);
router.post('/listTagihanByNamaPelanggan', Controller.listTagihanByNamaPelanggan);
router.get('/laporanPembayaranPerHari', Controller.laporanPembayaranPerHari);
router.post('/laporanPembayaranPerTanggal', Controller.laporanPembayaranPerTanggal);
router.post('/detailSettlementPerTanggal', Controller.detailSettlementPerTanggal);
router.post('/cetakLaporanPembayaranPerTanggal', Controller.cetakLaporanPembayaranPerTanggal);
router.get('/detailsById/:id', Controller.detailsById);
router.get('/cetakSuratPeringatan/:pelanggan_id', Controller.cetakSuratPeringatan);
router.post('/laporanPembayaranPerBulan', Controller.laporanPembayaranPerBulan);
router.post('/laporanHarian', Controller.laporanHarian);
router.post('/laporanDetail', Controller.laporanDetail);
router.get('/laporanPembayaranPerBulanExcel', Controller.laporanPembayaranPerBulanExcel);

module.exports = router