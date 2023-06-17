const { v4: uuid_v4 } = require("uuid");
const desa = require("../model/desa_model");

class Controller {
  static create(req, res) {
    const { nama_desa } = req.body;
    desa.create({ id: uuid_v4(), nama_desa }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { id, nama_desa } = req.body;
    desa.update({ nama_desa }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body;
    desa.destroy({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static list(req, res) {
    desa.findAll().then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static detailsById(req, res) {
    const { id } = req.params;
    desa.findAll({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }
}

module.exports = Controller;
