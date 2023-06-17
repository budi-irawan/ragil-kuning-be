const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection');
const { QueryTypes } = require("sequelize");
const biaya = require("../model/biaya_model");

class Controller {
  static create(req, res) {
    const { nama_biaya, nominal_biaya, golongan_biaya } = req.body;
    biaya
      .create({ id: uuid_v4(), nama_biaya, nominal_biaya, golongan_biaya })
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
    const { id, nama_biaya, nominal_biaya, golongan_biaya, status_biaya } = req.body;
    biaya
      .update(
        { nama_biaya, nominal_biaya, golongan_biaya, status_biaya },
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
    biaya
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

  static async list(req, res) {
    try {
      let data = await koneksi.query(`select b.id as "biaya_id", * from biaya b where b."deletedAt" isnull`, QueryTypes.SELECT)

      res.status(200).json({ status: 200, message: "sukses", data: data[0] });
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static detailsById(req, res) {
    const { id } = req.params;
    biaya
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
