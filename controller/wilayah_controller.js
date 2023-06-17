const { v4: uuid_v4 } = require("uuid");
const wilayah = require("../model/wilayah_model");

class Controller {
  static create(req, res) {
    const { nama_wilayah } = req.body;
    wilayah
      .create({ id: uuid_v4(), nama_wilayah })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static update(req, res) {
    const { id, nama_wilayah } = req.body;
    wilayah
      .update(
        { nama_wilayah },
        { where: { id }, returning: true }
      )
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static delete(req, res) {
    const { id } = req.body;
    wilayah
      .destroy({ where: { id } })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static list(req, res) {
    wilayah
      .findAll()
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static detailsById(req, res) {
    const { id } = req.params;
    wilayah
      .findAll({ where: { id } })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }
}

module.exports = Controller;
