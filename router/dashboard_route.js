const router = require("express").Router()
const Controller = require("../controller/dashboard_controller")

router.get('/', (req, res) => {
    res.render("index", {
        title: "Dashboard"
    })
});

module.exports = router