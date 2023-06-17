const router = require("express").Router()

router.use("/user", require("./user_route"))
router.use("/auth", require("./auth_route"))
router.use("/pelanggan", require("./pelanggan_route"))
router.use("/wilayah", require("./wilayah_route"))
router.use("/biaya", require("./biaya_route"))
router.use("/tarif", require("./tarif_route"))
router.use("/pemakaian", require("./pemakaian_route"))
router.use("/pembayaran", require("./pembayaran_route"))
router.use("/sub_pembayaran", require("./sub_pembayaran_route"))
router.use("/settlement_report", require("./settlement_report_route"))
router.use("/desa", require("./desa_route"))
router.use("/dusun", require("./dusun_route"))
router.use("/tahun", require("./tahun_route"))
router.use("/bulan", require("./bulan_route"))
router.use("/golongan_tarif", require("./golongan_tarif_route"))

module.exports = router