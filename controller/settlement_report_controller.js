const moment = require("moment");
moment.locale("id");
const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes, where } = require('sequelize');
const cron = require('node-cron');
const settlement_report = require("../model/settlement_report_model");

async function insertSettlementReport() {
  try {
    let tanggal = moment().format('YYYY-MM-DD')
    let data = await koneksi.query(`select date(p.tanggal_bayar) as "tanggal_bayar" ,
    sum(p.total_terbayar) as "total_terbayar", 
    sum(p.nominal_denda) as "total_denda_terbayar", 
    sum(p.total_terbayar+p.nominal_denda) as "total"
    from pembayaran p where p."deletedAt" isnull and date(p.tanggal_bayar) = '${tanggal}' 
    group by date(p.tanggal_bayar)`, { type: QueryTypes.SELECT })
    // console.log(data);
    cron.schedule('59 23 * * *', async function () {
      await settlement_report.create({ id: uuid_v4(), tanggal_transaksi: data[0].tanggal_bayar, jumlah_pembayaran: data[0].total_terbayar, jumlah_denda: data[0].total_denda_terbayar, total: data[0].total })
      console.log('Berhasil insert laporan settlement');
    });
  } catch (error) {
    console.log(error);
  }
}
insertSettlementReport()

class Controller {
  static async cetakSettlementReport(req, res) {
    try {
      let cek_pemakaian = await koneksi.query(`select p.id as "pemakaian_id", * from pemakaian p where p."deletedAt" isnull and p.id = '${pemakaian_id}'`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses" });
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }
}

module.exports = Controller;
