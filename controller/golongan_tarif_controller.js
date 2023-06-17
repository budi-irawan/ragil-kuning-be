const { v4: uuid_v4 } = require("uuid");
const golongan_tarif = require("../model/golongan_tarif_model");

class Controller {
  static create(req, res) {
    const { nama_golongan_tarif, nominal_tarif, biaya_perawatan, nominal_denda } = req.body;
    golongan_tarif.create({ id: uuid_v4(), nama_golongan_tarif, nominal_tarif, biaya_perawatan, nominal_denda }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { id, nama_golongan_tarif, nominal_tarif, biaya_perawatan, nominal_denda } = req.body;
    golongan_tarif.update({ nama_golongan_tarif, nominal_tarif, biaya_perawatan, nominal_denda }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body;
    golongan_tarif.destroy({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static list(req, res) {
    golongan_tarif.findAll().then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static detailsById(req, res) {
    const { id } = req.params;
    golongan_tarif.findAll({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }
}

module.exports = Controller;
