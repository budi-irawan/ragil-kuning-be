const { QueryTypes } = require("sequelize");
const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection');
const tahun = require("../model/tahun_model");
const bulan = require("../model/bulan_model");

class Controller {
  static create(req, res) {
    const { nama_tahun, status_tahun } = req.body;
    let list_bulan = [
      { nama_bulan: "Januari", nomor_bulan: 0 },
      { nama_bulan: "Februari", nomor_bulan: 1 },
      { nama_bulan: "Maret", nomor_bulan: 2 },
      { nama_bulan: "April", nomor_bulan: 3 },
      { nama_bulan: "Mei", nomor_bulan: 4 },
      { nama_bulan: "Juni", nomor_bulan: 5 },
      { nama_bulan: "Juli", nomor_bulan: 6 },
      { nama_bulan: "Agustus", nomor_bulan: 7 },
      { nama_bulan: "September", nomor_bulan: 8 },
      { nama_bulan: "Oktober", nomor_bulan: 9 },
      { nama_bulan: "November", nomor_bulan: 10 },
      { nama_bulan: "Desember", nomor_bulan: 11 }
    ]
    tahun.create({ id: uuid_v4(), nama_tahun, status_tahun: 0 }).then((data) => {
      for (let i = 0; i < list_bulan.length; i++) {
        list_bulan[i].id = uuid_v4()
        list_bulan[i].tahun_id = data.id
      }
      bulan.bulkCreate(list_bulan).then((data2) => {
        res.status(200).json({ status: 200, message: "sukses", data });
      })
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { id, nama_tahun, status_tahun } = req.body;
    tahun.update({ nama_tahun, status_tahun }, { where: { id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body;
    tahun.destroy({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static list(req, res) {
    tahun.findAll().then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static detailsById(req, res) {
    const { id } = req.params;
    tahun.findAll({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static async aktifkanTahun(req, res) {
    const { id } = req.body;

    try {
      let cek_tahun = await koneksi.query(`select * from tahun t where t."deletedAt" isnull and t.status_tahun = 1`, QueryTypes.SELECT)

      if (cek_tahun[0].length > 0) {
        res.status(201).json({ status: 204, message: "sudah ada tahun yang aktif" });
      } else {
        await tahun.update({ status_tahun: 1 }, { where: { id } })
        res.status(200).json({ status: 200, message: "sukses" });
      }
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }

  static async nonAktifkanTahun(req, res) {
    const { id } = req.body;
    try {
      await tahun.update({ status_tahun: 0 }, { where: { id } })
      res.status(200).json({ status: 200, message: "sukses" });
    } catch (error) {
      console.log(req.body);
      console.log(error);
      res.status(500).json({ status: 500, message: "gagal", data: error });
    }
  }
}

module.exports = Controller;
