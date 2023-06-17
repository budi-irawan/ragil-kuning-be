const router = require("express").Router()
const authentification = require("../middleware/authentification")
const Controller = require("../controller/settlement_report_controller")

router.post('/cetakSettlementReport', Controller.cetakSettlementReport);

module.exports = router