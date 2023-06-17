const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const pemakaian = require("../model/pemakaian_model");

class Controller {
  static async create(req, res) {
    let { tanggal_input, nama_bulan, nomor_bulan, meter_awal, meter_akhir, selisih, nominal_tarif, biaya_perawatan, total_tarif, pelanggan_id, bulan_id, nominal_denda } = req.body;

    try {
      let cek_pemakaian = await koneksi.query(`select p.id as "pemakaian_id", * 
      from pemakaian p 
      where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}' order by p."createdAt" desc limit 1`, { type: QueryTypes.SELECT })
      if (cek_pemakaian.length == 0) {
        meter_awal = 0
      } else {
        meter_awal = cek_pemakaian[0].meter_akhir
      }
      let data_pemakaian = await pemakaian.create({ id: uuid_v4(), tanggal_input, nama_bulan, nomor_bulan, meter_awal, meter_akhir, selisih, nominal_tarif, biaya_perawatan, total_tarif, sisa_pembayaran: total_tarif, pelanggan_id, bulan_id, nominal_denda })
      res.status(200).json({ status: 200, message: "sukses", data: data_pemakaian });
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static uploadGambar(req, res) {
    console.log(req.file);
    res.json({ file: req.file });
  }

  static update(req, res) {
    const { id, nama_pemakaian, alamat, nomor_telepon, wilayah_id } = req.body;

    pemakaian
      .update(
        { nama_pemakaian, alamat, nomor_telepon, wilayah_id },
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
    pemakaian
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
      let data1 = await koneksi.query(`select distinct p.id as "pelanggan_id", p.nama_pelanggan ,d.id as "desa_id", d.nama_desa ,d2.id as "dusun_id", d2.nama_dusun , sum(p2.selisih) as "total_pemakaian", count(p2.*) as "jumlah_bulan_pemakaian",
      ( select count(*) as "jumlah_bulan_dibayar" from pemakaian p3 where p3.sisa_pembayaran = 0 and p3.pelanggan_id = p.id group by p.id ,p.nama_pelanggan  )
            from pelanggan p 
            left join desa d on d.id = p.desa_id 
            left join dusun d2 on d2.id = p.dusun_id  
            left join pemakaian p2 on p2.pelanggan_id = p.id 
            where p."deletedAt" isnull 
            group by p.id ,p.nama_pelanggan ,d.id, d2.id ,d.nama_desa ,d2.nama_dusun 
            order by p.nama_pelanggan asc `, { type: QueryTypes.SELECT })
      // let data2 = await koneksi.query(`select p.pelanggan_id ,count(*) as "jumlah_bulan_dibayar" 
      // from pemakaian p 
      // where p."deletedAt" isnull 
      // and p.sisa_pembayaran <> 0 or (p.sisa_pembayaran < p.total_tarif and p.sisa_pembayaran > 0 )
      // group by p.pelanggan_id `, { type: QueryTypes.SELECT })

      let hasil = []
      for (let i = 0; i < data1.length; i++) {
        // let jbp = Number(data1[i].jumlah_bulan_pemakaian)
        // let jbd = Number(data1[i].jumlah_bulan_dibayar)
        let jbt = Number(data1[i].jumlah_bulan_pemakaian) - Number(data1[i].jumlah_bulan_dibayar)
        data1[i].jumlah_bulan_tunggakan = jbt

        // for (let j = 0; j < data2.length; j++) {
        //   if (data1[i].pelanggan_id == data2[j].pelanggan_id) {
        //     data1[i].jumlah_bulan_pemakaian = jbp
        //     data1[i].jumlah_bulan_dibayar = jbd
        //   }
        // }
      }
      // console.log(hasil);
      res.status(200).json({ status: 200, message: "sukses", data: data1 })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listPemakaianByPelangganId(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pemakaian_id", * 
      from pemakaian p 
      where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}'
      order by p."createdAt" asc`, { type: QueryTypes.SELECT })
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listPemakaianBulanLalu(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pemakaian_id", * 
      from pemakaian p 
      where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}' order by p."createdAt" desc limit 1`, { type: QueryTypes.SELECT })
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listBulanPemakaianBelumLunas(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pemakaian_id", p.bulan, p.total_tarif from pemakaian p where p."deletedAt" isnull and p."sisa_pembayaran" <> 0 and p.pelanggan_id = '${pelanggan_id}'`, { type: QueryTypes.SELECT })
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static detailsById(req, res) {
    const { id } = req.params;
    pemakaian
      .findAll({ where: { id } })
      .then((data) => {
        res.status(200).json({ message: "sukses", data });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "gagal", data: err });
      });
  }

  static async cetakFormulirPencatatan(req, res) {
    const { bulan_id, desa_id } = req.query
    try {
      let isi2 = ''
      if (desa_id) {
        isi2 += `  and p.desa_id = '${desa_id}'`
      }
      let dataWilayah = await koneksi.query(`select d.id as "dusun_id", d.nama_dusun ,d2.nama_desa 
      from dusun d join desa d2 on d2.id = d.desa_id where d."deletedAt" isnull and d2."deletedAt" isnull and d.desa_id = '${desa_id}' `, { type: QueryTypes.SELECT })
      let data = await koneksi.query(`select b.id as "bulan_id", * 
      from bulan b 
      join tahun t on t.id = b.tahun_id 
      where b."deletedAt" isnull and t."deletedAt" isnull and t.status_tahun = 1 and b.id = '${bulan_id}'`, { type: QueryTypes.SELECT })
      let dataPelanggan = await koneksi.query(`select p.id as "pelanggan_id", p.nama_pelanggan ,d.nama_dusun , d2.nama_desa ,
      ( select p2.meter_akhir from pemakaian p2 where p."deletedAt" isnull and p2.pelanggan_id = p.id order by p2."createdAt" desc limit 1 )
      from pelanggan p 
      left join dusun d on d.id = p.dusun_id 
      left join desa d2 on d2.id = p.desa_id 
      where p."deletedAt" isnull ${isi2}`, { type: QueryTypes.SELECT })
      data[0].wilayah = dataWilayah
      data[0].pelanggan = dataPelanggan

      res.status(200).render("formulir_pencatatan", { status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }
}

module.exports = Controller;
