const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const bulan = require("../model/bulan_model");

class Controller {
  static create(req, res) {
    const { nama_bulan, tahun_id } = req.body;
    bulan.create({ id: uuid_v4(), nama_bulan, tahun_id }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static update(req, res) {
    const { bulan_id, nama_bulan, tahun_id } = req.body;
    bulan.update({ nama_bulan, tahun_id }, { where: { id: bulan_id }, returning: true }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static delete(req, res) {
    const { id } = req.body;
    bulan.destroy({ where: { id } }).then((data) => {
      res.status(200).json({ status: 200, message: "sukses", data });
    }).catch((err) => {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    });
  }

  static async list(req, res) {
    try {
      let data = await koneksi.query(`select b.id as "bulan_id", * from bulan b join tahun t on t.id = b.tahun_id where b."deletedAt" isnull and t."deletedAt" isnull and t.status_tahun = 1`, { type: QueryTypes.SELECT })
      res.status(200).json({ message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async detailsById(req, res) {
    const { id } = req.params;
    try {
      let data = await koneksi.query(`select b.id as "bulan_id", * from bulan b join tahun t on t.id = b.tahun_id where b."deletedAt" isnull and t."deletedAt" isnull and t.status_tahun = 1 and b.id = '${id}'`, { type: QueryTypes.SELECT })
      
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async listBulanByTahunId(req, res) {
    const { tahun_id } = req.body;
    try {
      let data = await koneksi.query(`select b.id as "bulan_id", * from bulan b join tahun t on t.id = b.tahun_id where b."deletedAt" isnull and t."deletedAt" isnull and b.tahun_id = '${tahun_id}'`, { type: QueryTypes.SELECT })
      
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async listBulanByPelangganId(req, res) {
    const { pelanggan_id } = req.body;
    try {
      
      let data2 = await koneksi.query(`select p.bulan_id ,p.nama_bulan 
      from pemakaian p 
      where p."deletedAt" isnull 
      and p.pelanggan_id = '${pelanggan_id}'`, { type: QueryTypes.SELECT })

      let data1 = await koneksi.query(`select b.id as "bulan_id", b.nama_bulan 
      from bulan b join tahun t on t.id = b.tahun_id 
      where b."deletedAt" isnull and t."deletedAt" isnull and t.status_tahun = 1`, { type: QueryTypes.SELECT })
      
      // console.log(data2.length);

      let hasil = []
      if (data2.length > 0) {
        for (let i = 0; i < data1.length; i++) {
          // console.log(data1[i]);
          for (let j = 0; j < data2.length; j++) {
            if (data2[j].bulan_id != data1[i].bulan_id) {
              hasil.push(data1[i])
              break
            }
          }
        }
      } else {
        console.log('jika belum ada pemakaian');
        hasil = data1
      }
      console.log(hasil);
      // let hasil = data1.filter(function(el) {
      //   return data2.indexOf(el.bulan_id) < 0
      // })
      // console.log(hasil);
      
      res.status(200).json({ status: 200, message: "sukses", data: hasil })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }
}

module.exports = Controller;
