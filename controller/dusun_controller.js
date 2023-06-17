const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const dusun = require("../model/dusun_model");

class Controller {
  static create(req, res) {
    const { nama_dusun, desa_id, tanggal_jatuh_tempo } = req.body;
    dusun.create({ id: uuid_v4(), nama_dusun, desa_id, tanggal_jatuh_tempo }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { dusun_id, nama_dusun, desa_id, tanggal_jatuh_tempo } = req.body;
    dusun.update({ nama_dusun, desa_id, tanggal_jatuh_tempo }, { where: { id: dusun_id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body;
    dusun.destroy({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static async list(req, res) {
    try {
      let data = await koneksi.query(`select d.id as "dusun_id", * from dusun d join desa d2 on d2.id = d.desa_id where d."deletedAt" isnull and d2."deletedAt" isnull `, { type: QueryTypes.SELECT })
      res.status(200).json({ message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async detailsById(req, res) {
    const { id } = req.params;
    try {
      let data = await koneksi.query(`select d.id as "dusun_id", * from dusun d join desa d2 on d2.id = d.desa_id where d."deletedAt" isnull and d2."deletedAt" isnull and d.id = '${id}'`, { type: QueryTypes.SELECT })
      
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async listDusunByDesaId(req, res) {
    const { desa_id } = req.body;
    try {
      let data = await koneksi.query(`select d.id as "dusun_id", * from dusun d join desa d2 on d2.id = d.desa_id where d."deletedAt" isnull and d2."deletedAt" isnull and d.desa_id = '${desa_id}'`, { type: QueryTypes.SELECT })
      
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }
}

module.exports = Controller;
