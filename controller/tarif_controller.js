const { QueryTypes } = require("sequelize");
const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection');
const tarif = require("../model/tarif_model");

class Controller {
  static create(req, res) {
    const { tarif_per_meter, nominal_tarif, status_tarif } = req.body;
    tarif
      .create({ id: uuid_v4(), tarif_per_meter, nominal_tarif, status_tarif })
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
    const { id, tarif_per_meter, nominal_tarif, status_tarif } = req.body;
    tarif
      .update(
        { tarif_per_meter, nominal_tarif, status_tarif },
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

  static async aktifkanTarif(req, res) {
    const { id } = req.body;

    try {
      let cek_tarif = await koneksi.query(`select * from tarif t where t."deletedAt" isnull and t.status_tarif = 1`, QueryTypes.SELECT)

      if (cek_tarif[0].length > 0) {
        res.status(201).json({ status: 204, message: "sudah ada tarif yang aktif" });
      } else {
        await tarif.update({ status_tarif: 1 }, { where: { id: id } })
        res.status(200).json({ status: 200, message: "sukses" });
      }
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async nonAktifkanTarif(req, res) {
    const { id } = req.body;
    try {
      await tarif.update({ status_tarif: 0 }, { where: { id: id } })
      res.status(200).json({ status: 200, message: "sukses" });
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static delete(req, res) {
    const { id } = req.body;
    tarif
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
    tarif
      .findAll({ order: ["updatedAt"], })
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
    tarif
      .findAll({ where: { id } })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static async listTarifAktif(req, res) {
    try {
      let data = await koneksi.query(`select * from tarif t where t."deletedAt" isnull and t.status_tarif = 1`, QueryTypes.SELECT)

      res.status(200).json({ status: 200, message: "sukses", data });
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
}

module.exports = Controller;
