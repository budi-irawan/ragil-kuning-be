const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const moment = require("moment")
const sub_pembayaran = require("../model/sub_pembayaran_model");

class Controller {
  static async create(req, res) {
    let { tanggal_bayar, jumlah_bayar, pembayaran_id } = req.body;

    try {
      let jml_data = await sub_pembayaran.findAll()
      let no_nota = `INV${moment().format('YYYYMMDD')}${jml_data.length + 1}`
      let data_sub_pembayaran = await sub_pembayaran.create({ id: uuid_v4(), tanggal_bayar, jumlah_bayar, pembayaran_id })
      res.status(200).json({ status: 200, message: "sukses", data: data_sub_pembayaran });
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static update(req, res) {
    const { id, tanggal_bayar, jumlah_bayar, pembayaran_id } = req.body;

    sub_pembayaran
      .update(
        { tanggal_bayar, jumlah_bayar, pembayaran_id },
        { where: { id: id }, returning: true }
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
    sub_pembayaran
      .destroy({ where: { id: id } })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  // static async list(req, res) {
  //   try {
  //     let data = await koneksi.query(`select p.id as "pelanggan_id", p.nama_pelanggan ,sum(p2.selisih) as "jumlah_pemakaian" ,sum(p2.total_tarif) as "jumlah_tagihan" ,sum(p3.jumlah_bayar) as "jumlah_terbayar" ,sum(p3.sisa_bayar) as "sisa_bayar"  
  //     from pelanggan p 
  //     join pemakaian p2 on p2.pelanggan_id = p.id 
  //     left join sub_pembayaran p3 on p3.pembayaran_id = p2.id 
  //     where p."deletedAt" isnull 
  //     group by p.id`, { type: QueryTypes.SELECT })

  //     res.status(200).json({ status: 200, message: "sukses", data })
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ message: "gagal", data: err })
  //   }
  // }

  // static async listsub_pembayaranByPelangganId(req, res) {
  //   const { pelanggan_id } = req.body
  //   try {
  //     let data = await koneksi.query(`select p.id as "pembayaran_id", p.bulan ,p.selisih ,p.total_tarif ,p2.jumlah_bayar ,p2.sisa_bayar ,p2.tipe_bayar ,p2.status_sub_pembayaran 
  //     from pemakaian p 
  //     left join sub_pembayaran p2 on p2.pembayaran_id = p.id 
  //     where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}' 
  //     order by p."createdAt" asc `, { type: QueryTypes.SELECT })

  //     res.status(200).json({ status: 200, message: "sukses", data })
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ message: "gagal", data: err })
  //   }
  // }

  // static async listsub_pembayaranBulanLalu(req, res) {
  //   const { pelanggan_id } = req.body
  //   try {
  //     let data = await koneksi.query(`select p.id as "sub_pembayaran_id", * 
  //     from sub_pembayaran p 
  //     where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}' order by p."createdAt" desc limit 1`, { type: QueryTypes.SELECT })
  //     res.status(200).json({ status: 200, message: "sukses", data })
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).json({ message: "gagal", data: err })
  //   }
  // }

  // static detailsById(req, res) {
  //   const { id } = req.params;
  //   sub_pembayaran.findAll({ where: { id } }).then((data) => {
  //     res.status(200).json({ message: "sukses", data });
  //   }).catch((err) => {
  //     console.log(err);
  //     res.status(500).json({ message: "gagal", data: err });
  //   });
  // }
}

module.exports = Controller;
