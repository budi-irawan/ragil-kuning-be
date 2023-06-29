const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const pelanggan = require("../model/pelanggan_model");
const pemakaian = require("../model/pemakaian_model");
const pembayaran = require("../model/pembayaran_model");

class Controller {
  static create(req, res) {
    const { alamat, nama_pelanggan, nomor_telepon, desa_id, dusun_id, golongan_tarif_id } = req.body;

    pelanggan
      .create({ id: uuid_v4(), nama_pelanggan, alamat, nomor_telepon, desa_id, dusun_id, golongan_tarif_id })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(req.body);
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static uploadGambar(req, res) {
    console.log(req.file);
    res.json({ file: req.file });
  }

  static update(req, res) {
    const { pelanggan_id, nama_pelanggan, alamat, nomor_telepon, desa_id, dusun_id, golongan_tarif_id } = req.body;
    
    pelanggan
      .update(
        { nama_pelanggan, alamat, nomor_telepon, desa_id, dusun_id, golongan_tarif_id },
        { where: { id: pelanggan_id }, returning: true }
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
    pelanggan
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

  static async list(req, res) {
    try {
      let data = await koneksi.query(`select p.id as pelanggan_id, * from pelanggan p 
      left join desa d on d.id = p.desa_id 
      left join dusun d2 on d2.id = p.dusun_id 
      left join golongan_tarif gt on gt.id = p.golongan_tarif_id 
      where p."deletedAt" isnull and d."deletedAt" isnull and d2."deletedAt" isnull and gt."deletedAt" isnull `, { type: QueryTypes.SELECT })
      
      res.status(200).json({ message: "sukses", data, user: req.dataUsers })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async detailsById(req, res) {
    const { id } = req.params;
    try {
      let data = await koneksi.query(`select p.id as pelanggan_id, * from pelanggan p 
      left join desa d on d.id = p.desa_id 
      left join dusun d2 on d2.id = p.dusun_id 
      left join golongan_tarif gt on gt.id = p.golongan_tarif_id 
      where p."deletedAt" isnull and d."deletedAt" isnull and d2."deletedAt" isnull and gt."deletedAt" isnull and p.id = '${id}'`, { type: QueryTypes.SELECT })
      
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async importPelanggan(req, res) {
    try {
      const excelToJson = require('convert-excel-to-json');
 
      const result = excelToJson({
          sourceFile: './uploads/PELANGGAN.xlsx'
      });

      let dataPelanggan = result.Sheet1
      let hasil = []
      for (let h = 0; h < dataPelanggan.length; h++) {
        let objPelanggan = {
          id : uuid_v4(),
          nama_pelanggan : dataPelanggan[h].A,
          desa_id : dataPelanggan[h].B ,
          dusun_id : dataPelanggan[h].C,
          golongan_tarif_id : dataPelanggan[h].D
        }
        hasil.push(objPelanggan)
      }
      await pelanggan.bulkCreate(hasil)
      res.status(200).json({ status: 200, message: "sukses" })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async importPemakaian(req, res) {
    try {
      const excelToJson = require('convert-excel-to-json');
 
      const result = excelToJson({
          sourceFile: './uploads/KRAGILAN-JUNI.xlsx'
      });
      let dataPemakaian = result.Sheet1
      let hasil = []
      let pelanggan = await koneksi.query(`select p.id as "pelanggan_id", * from pelanggan p 
      where p."deletedAt" isnull 
      and p.dusun_id = 'e0b7a481-a865-46e2-944f-28a784f107b4'`, { type: QueryTypes.SELECT })
      console.log(pelanggan.length);
      console.log(dataPemakaian.length);

      for (let h = 0; h < pelanggan.length; h++) {
        for (let i = 0; i < dataPemakaian.length; i++) {
          if (dataPemakaian[i].A === pelanggan[h].nama_pelanggan) {
            let objPemakaian = {
              id: uuid_v4(),
              tanggal_input: '2023-06-17',
              meter_awal: dataPemakaian[i].B,
              meter_akhir: dataPemakaian[i].C,
              selisih: dataPemakaian[i].D,
              nominal_tarif: 2000,
              biaya_perawatan: 16000,
              total_tarif: dataPemakaian[i].D * 2000 + 16000,
              bulan_id: '4911f521-786d-4cb7-95a9-3a93a7ebc59d',
              nama_bulan: 'Juni',
              nomor_bulan: 5,
              pelanggan_id: pelanggan[h].pelanggan_id,
              status_pemakaian: 0,
              nominal_denda: 0,
              sisa_pembayaran: 0
            }
            
            if (dataPemakaian[i].H == 'LUNAS') {
              objPemakaian.sisa_pembayaran = 0
              objPemakaian.nominal_denda = 0
            } else {
              objPemakaian.sisa_pembayaran = dataPemakaian[i].D * 2000 + 16000
              objPemakaian.nominal_denda = 10000
            }

            hasil.push(objPemakaian)
          } 
        }
      }

      // console.log(hasil[0]);
      // console.log(hasil.length);
      await pemakaian.bulkCreate(hasil)
      res.status(200).json({ status: 200, message: "sukses" })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async importPembayaran(req, res) {
    try {
      const excelToJson = require('convert-excel-to-json');
 
      const result = excelToJson({
          sourceFile: './uploads/KRAGILAN-JUNI.xlsx'
      });
      let dataPemakaian = result.Sheet1
      let hasil = []
      let pelanggan = await koneksi.query(`select p.id as "pemakaian_id", * 
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      where p.bulan_id = '4911f521-786d-4cb7-95a9-3a93a7ebc59d'`, { type: QueryTypes.SELECT })
      console.log(pelanggan.length);
      console.log(dataPemakaian.length);

      for (let h = 0; h < pelanggan.length; h++) {
        for (let i = 0; i < dataPemakaian.length; i++) {
          if (dataPemakaian[i].A === pelanggan[h].nama_pelanggan) {
            if (dataPemakaian[i].H == 'LUNAS') {
              let objPembayaran = {
                id: uuid_v4(),
                tanggal_bayar: dataPemakaian[i].F,
                total_terbayar: 0,
                pemakaian_id: pelanggan[h].pemakaian_id,
                nominal_denda: 0,
              }
              objPembayaran.total_terbayar = pelanggan[h].total_tarif
              objPembayaran.nominal_denda = pelanggan[h].nominal_denda
              hasil.push(objPembayaran)
            } 
          } 
        }
      }

      // console.log(hasil);
      console.log(hasil.length);
      await pembayaran.bulkCreate(hasil)
      res.status(200).json({ status: 200, message: "sukses" })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }

  static async importPembayaranTagihan(req, res) {
    try {
      const excelToJson = require('convert-excel-to-json');
 
      const result = excelToJson({
          sourceFile: './uploads/BABADAN-MARET-TAGIHAN.xlsx'
      });
      let dataPemakaian = result.Sheet1
      let pelanggan = await koneksi.query(`select p.id as "pemakaian_id", * 
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      where p.bulan_id = '364c1469-51c9-4e46-9477-379a70d563b3'`, { type: QueryTypes.SELECT })
      console.log(pelanggan.length);
      console.log(dataPemakaian.length);
      
      let hasil = []
      for (let h = 0; h < pelanggan.length; h++) {
        for (let i = 0; i < dataPemakaian.length; i++) {
          if (dataPemakaian[i].A === pelanggan[h].nama_pelanggan) {
            if (dataPemakaian[i].H == 'LUNAS') {
              console.log(dataPemakaian[i].A);
              let objPembayaran = {
                id: uuid_v4(),
                tanggal_bayar: dataPemakaian[i].F,
                total_terbayar: 0,
                pemakaian_id: pelanggan[h].pemakaian_id,
                nominal_denda: 0,
              }
              objPembayaran.total_terbayar = pelanggan[h].total_tarif
              objPembayaran.nominal_denda = pelanggan[h].nominal_denda
              hasil.push(objPembayaran)
            } 
          } 
        }
      }

      // console.log(hasil);
      console.log(hasil.length);
      await pembayaran.bulkCreate(hasil)
      res.status(200).json({ status: 200, message: "sukses" })
    } catch (err) {
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err })
    }
  }
}

module.exports = Controller;
