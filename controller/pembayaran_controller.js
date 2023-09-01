const moment = require("moment");
moment.locale("id");
const ExcelJS = require("exceljs");
const { v4: uuid_v4 } = require("uuid");
const { koneksi } = require('../config/connection')
const { QueryTypes, where } = require('sequelize');
const pembayaran = require("../model/pembayaran_model");
const pemakaian = require("../model/pemakaian_model");
const sub_pembayaran = require("../model/sub_pembayaran_model");

const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(number);
}

class Controller {
  static async createPembayaranPerBulan(req, res) {
    let { tanggal_bayar, tipe_bayar, jumlah_bayar, nominal_denda, pemakaian_id } = req.body;

    try {
      let cek_pemakaian = await koneksi.query(`select p.id as "pemakaian_id", * from pemakaian p where p."deletedAt" isnull and p.id = '${pemakaian_id}'`, { type: QueryTypes.SELECT })
      console.log(cek_pemakaian);
      let sisa = Number(cek_pemakaian[0].sisa_pembayaran) - Number(jumlah_bayar)
      let cek_sub = await sub_pembayaran.findAll()
      let tgl_now = moment().format("YYYYMMDDHHmmss")
      let no_nota = `INV${tgl_now}${cek_sub.length + 1}`
      if (tipe_bayar == "KREDIT") {
        res.status(200).json({ status: 200, message: "sukses" });
      } else {
        // let data_pembayaran = await pembayaran.create({ id: uuid_v4(), tipe_bayar, total_bayar: cek_pemakaian[0].sisa_pembayaran, sisa_bayar: sisa, pemakaian_id })
        // await pemakaian.update({ sisa_pembayaran: 0 }, { where: { id: pemakaian_id } })
        // res.status(200).json({ status: 200, message: "sukses", data: data_sub });
      }
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static async createPembayaranGabungan(req, res) {
    let { tanggal_bayar, tanggal_jatuh_tempo, jumlah_bayar, nominal_denda, pelanggan_id, user_id } = req.body;

    try {
      let tanggal = moment().format('D')
      let nomor_bulan_ini = moment().month()

      let data = await koneksi.query(`select p.id as "pemakaian_id", p.nama_bulan, p.nominal_tarif,sum(p.selisih * p.nominal_tarif) as "biaya_air" ,p.biaya_perawatan, p.nomor_bulan ,p.selisih ,p.total_tarif , p.sisa_pembayaran, p.nominal_denda as "nominal_denda_pemakaian" , sum(p2.total_terbayar) as "total_terbayar" ,sum(p2.nominal_denda ) as "nominal_denda" 
      from pemakaian p 
      left join pembayaran p2 on p2.pemakaian_id = p.id 
      where p."deletedAt" isnull and p.sisa_pembayaran <> 0 and p.pelanggan_id = '${pelanggan_id}' 
      group by p.id 
      order by p."createdAt" `, { type: QueryTypes.SELECT })

      for (let i = 0; i < data.length; i++) {
        if (nomor_bulan_ini > data[i].nomor_bulan || (Number(tanggal) > tanggal_jatuh_tempo && data[i].sisa_pembayaran != 0 && nomor_bulan_ini === data[i].nomor_bulan)) {
          data[i].nominal_denda = Number(nominal_denda)
          // console.log(data[i]);
        }
      }

      let cek_pemb = await pembayaran.findAll()
      let tgl_now = moment().format("YYYYMMDDHHmmss")

      let jb = Number(jumlah_bayar)
      let bulk_pembayaran = []
      let bulk_pemakaian = []

      for (let j = 0; j < data.length; j++) {
        // console.log(data[j]);
        let tunggakan_dan_denda = data[j].sisa_pembayaran + data[j].nominal_denda_pemakaian

        let obj_pembayaran = {
          id: uuid_v4(),
          tanggal_bayar: tanggal_bayar,
          no_nota: `INV${tgl_now}${cek_pemb.length + j}`,
          nama_bulan: data[j].nama_bulan,
          nominal_tarif: data[j].nominal_tarif,
          biaya_air: data[j].biaya_air,
          biaya_perawatan: data[j].biaya_perawatan,
          selisih: data[j].selisih,
          total_terbayar: 0,
          nominal_denda: 0,
          total_pembayaran: 0,
          sisa_tagihan: 0,
          pemakaian_id: data[j].pemakaian_id,
          user_id: user_id
        }

        let objPemakaian = {
          id: data[j].pemakaian_id,
          sisa_pembayaran: 0,
          nominal_denda: 0
        }

        // console.log(data[j]);
        

        if (data[j].nominal_denda != null) {
          if (tunggakan_dan_denda <= jb) {
            // console.log(data[j]);
            //   console.log(tunggakan_dan_denda);
              jb -= tunggakan_dan_denda
              // console.log("MASUK SINI",jb);
            
            obj_pembayaran.total_terbayar = data[j].sisa_pembayaran
            obj_pembayaran.nominal_denda = data[j].nominal_denda_pemakaian
            obj_pembayaran.total_pembayaran = tunggakan_dan_denda
            obj_pembayaran.sisa_tagihan = 0 
  
            objPemakaian.sisa_pembayaran = 0 
            objPemakaian.nominal_denda = 0
  
            bulk_pembayaran.push(obj_pembayaran)
            bulk_pemakaian.push(objPemakaian)
          } else {
            if (jb <= data[j].nominal_denda) {
              obj_pembayaran.total_terbayar = jb
              obj_pembayaran.nominal_denda = 0
              obj_pembayaran.total_pembayaran = jb
              obj_pembayaran.sisa_tagihan = data[j].sisa_pembayaran - jb
  
              objPemakaian.sisa_pembayaran = data[j].sisa_pembayaran - jb
              objPemakaian.nominal_denda = data[j].nominal_denda_pemakaian 
  
              bulk_pembayaran.push(obj_pembayaran)
              bulk_pemakaian.push(objPemakaian)
            } else {
              // console.log(data[j]);
              // console.log(tunggakan_dan_denda);
              // console.log("MASUK SINI",jb);
              obj_pembayaran.total_terbayar = jb - data[j].nominal_denda_pemakaian
              obj_pembayaran.nominal_denda = data[j].nominal_denda_pemakaian 
              obj_pembayaran.total_pembayaran = jb 
              obj_pembayaran.sisa_tagihan = tunggakan_dan_denda - jb
  
              objPemakaian.sisa_pembayaran = tunggakan_dan_denda - jb
              objPemakaian.nominal_denda = 0
  
              jb = 0
              
              bulk_pembayaran.push(obj_pembayaran)
              bulk_pemakaian.push(objPemakaian)
            }
          }
        } else {
          console.log("BELUM KENA DENDA", data[j]);
          console.log(jb);
          let tunggakan = data[j].sisa_pembayaran
          if (tunggakan <= jb) {
            jb -= tunggakan 

            obj_pembayaran.total_terbayar = tunggakan
            obj_pembayaran.nominal_denda = 0
            obj_pembayaran.total_pembayaran = tunggakan
            obj_pembayaran.sisa_tagihan = 0 

            objPemakaian.sisa_pembayaran = 0 
            objPemakaian.nominal_denda = 0

            bulk_pembayaran.push(obj_pembayaran)
            bulk_pemakaian.push(objPemakaian)
          }
        }
      }
      // console.log(req.body);
      // console.log(bulk_pembayaran);
      // console.log(bulk_pemakaian);
      await pembayaran.bulkCreate(bulk_pembayaran)
      await pemakaian.bulkCreate(bulk_pemakaian, { updateOnDuplicate: ["id", "sisa_pembayaran", "nominal_denda"] })

      res.status(200).json({ status: 200, message: "sukses", data: bulk_pembayaran });
    } catch (err) {
      console.log(req.body);
      console.log(err);
      res.status(500).json({ status: 500, message: "gagal", data: err });
    }
  }

  static update(req, res) {
    const { id, tanggal_bayar, tipe_bayar, jumlah_bayar, sisa_bayar, pemakaian_id } = req.body;

    pembayaran
      .update(
        { tanggal_bayar, tipe_bayar, jumlah_bayar, sisa_bayar, pemakaian_id },
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
    pembayaran
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
      let data1 = await koneksi.query(`select p.pelanggan_id, p2.nama_pelanggan, p2.desa_id ,p2.dusun_id , d.nama_desa ,d2.nama_dusun , 
      (select sum(p3.selisih) as "jumlah_pemakaian"   
      from pemakaian p3 
      join pelanggan p2 on p2.id = p3.pelanggan_id 
      where p3."deletedAt" isnull and p2."deletedAt" isnull and p3.sisa_pembayaran <> 0 
      and p3.pelanggan_id = p.pelanggan_id), 
      (select sum(p4.total_tarif) as "jumlah_tagihan"   
      from pemakaian p4 
      join pelanggan p2 on p2.id = p4.pelanggan_id 
      where p4."deletedAt" isnull and p2."deletedAt" isnull and p4.sisa_pembayaran <> 0 
      and p4.pelanggan_id = p.pelanggan_id), 
      (select sum(p5.sisa_pembayaran) as "sisa_pembayaran"   
      from pemakaian p5 
      join pelanggan p2 on p2.id = p5.pelanggan_id 
      where p5."deletedAt" isnull and p2."deletedAt" isnull and p5.sisa_pembayaran <> 0 
      and p5.pelanggan_id = p.pelanggan_id), 
      (select sum(p6.total_tarif - p6.sisa_pembayaran) as "jumlah_terbayar"   
      from pemakaian p6 
      join pelanggan p2 on p2.id = p6.pelanggan_id 
      where p6."deletedAt" isnull and p2."deletedAt" isnull and p6.sisa_pembayaran <> 0 
      and p6.pelanggan_id = p.pelanggan_id) 
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      join desa d on d.id = p2.desa_id 
      join dusun d2 on d2.id = p2.dusun_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull 
      group by p.pelanggan_id , p2.nama_pelanggan,p2.desa_id ,p2.dusun_id , d.nama_desa, d2.nama_dusun 
      order by p2.nama_pelanggan`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data: data1 })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listTagihanByNamaPelanggan(req, res) {
    const { nama_pelanggan } = req.body
    try {
      let data1 = await koneksi.query(`select p.pelanggan_id, p2.nama_pelanggan, p2.desa_id ,p2.dusun_id , d.nama_desa ,d2.nama_dusun , 
      (select sum(p3.selisih) as "jumlah_pemakaian"   
      from pemakaian p3 
      join pelanggan p2 on p2.id = p3.pelanggan_id 
      where p3."deletedAt" isnull and p2."deletedAt" isnull and p3.sisa_pembayaran <> 0 
      and p3.pelanggan_id = p.pelanggan_id), 
      (select sum(p4.total_tarif) as "jumlah_tagihan"   
      from pemakaian p4 
      join pelanggan p2 on p2.id = p4.pelanggan_id 
      where p4."deletedAt" isnull and p2."deletedAt" isnull and p4.sisa_pembayaran <> 0 
      and p4.pelanggan_id = p.pelanggan_id), 
      (select sum(p5.sisa_pembayaran) as "sisa_pembayaran"   
      from pemakaian p5 
      join pelanggan p2 on p2.id = p5.pelanggan_id 
      where p5."deletedAt" isnull and p2."deletedAt" isnull and p5.sisa_pembayaran <> 0 
      and p5.pelanggan_id = p.pelanggan_id), 
      (select sum(p6.total_tarif - p6.sisa_pembayaran) as "jumlah_terbayar"   
      from pemakaian p6 
      join pelanggan p2 on p2.id = p6.pelanggan_id 
      where p6."deletedAt" isnull and p2."deletedAt" isnull and p6.sisa_pembayaran <> 0 
      and p6.pelanggan_id = p.pelanggan_id) 
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      join desa d on d.id = p2.desa_id 
      join dusun d2 on d2.id = p2.dusun_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull and p2."nama_pelanggan" ilike '%${nama_pelanggan}%'
      group by p.pelanggan_id , p2.nama_pelanggan,p2.desa_id ,p2.dusun_id , d.nama_desa, d2.nama_dusun 
      order by p2.nama_pelanggan`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data: data1 })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listTagihanByPelangganId(req, res) {
    const { pelanggan_id, tanggal_jatuh_tempo, nominal_denda } = req.body
    try {
      let tanggal = moment().format('D')
      let nomor_bulan_ini = moment().month()

      let data = await koneksi.query(`select p.id as "pemakaian_id", p.nama_bulan, p.nomor_bulan ,p.selisih ,p.total_tarif ,p.sisa_pembayaran, p.nominal_denda as "nominal_denda_pemakaian" ,
      sum(p.sisa_pembayaran + p.nominal_denda) as "tagihan_per_bulan",  sum(p2.total_terbayar) as "total_terbayar" ,sum(p2.nominal_denda) as "nominal_denda"  
      from pemakaian p 
      left join pembayaran p2 on p2.pemakaian_id = p.id 
      where p."deletedAt" isnull and p.sisa_pembayaran <> 0 and p.pelanggan_id = '${pelanggan_id}' 
      group by p.id 
      order by p."createdAt" `, { type: QueryTypes.SELECT })

      // for (let i = 0; i < data.length; i++) {
      //   if (nomor_bulan_ini > data[i].nomor_bulan || (Number(tanggal) > tanggal_jatuh_tempo && data[i].sisa_pembayaran == data[i].total_tarif && nomor_bulan_ini === data[i].nomor_bulan)) {
      //     data[i].nominal_denda = Number(nominal_denda)
      //   }
      // }

      let hasil = []
      let header_data = {
        total_tagihan_tanpa_denda: 0,
        total_denda: 0,
        total_tagihan_dengan_denda: 0,
        total_total_terbayar: 0,
        data_tagihan: []
      }
      for (let i = 0; i < data.length; i++) {
        header_data.total_tagihan_tanpa_denda += Number(data[i].total_tarif)
        header_data.total_total_terbayar += Number(data[i].total_terbayar)
        let obj_data_tagihan = {
          pemakaian_id: data[i].pemakaian_id,
          nama_bulan: data[i].nama_bulan,
          selisih: data[i].selisih,
          total_tarif: data[i].total_tarif,
          sisa_pembayaran: data[i].sisa_pembayaran,
          jumlah_denda_per_bulan: 0,
          total_terbayar: data[i].total_terbayar,
          sisa_pembayaran_dan_denda: 0
        }
        
        if (data[i].sisa_pembayaran != 0 && Number(tanggal) > Number(tanggal_jatuh_tempo) || data[i].sisa_pembayaran != 0 && nomor_bulan_ini > data[i].nomor_bulan) {
          obj_data_tagihan.jumlah_denda_per_bulan = data[i].nominal_denda_pemakaian
          obj_data_tagihan.sisa_pembayaran_dan_denda = data[i].sisa_pembayaran + data[i].nominal_denda_pemakaian
        } else {
          obj_data_tagihan.jumlah_denda_per_bulan = 0
          obj_data_tagihan.sisa_pembayaran_dan_denda = data[i].sisa_pembayaran 
        }
        header_data.total_denda += obj_data_tagihan.jumlah_denda_per_bulan
        header_data.total_tagihan_dengan_denda += obj_data_tagihan.sisa_pembayaran_dan_denda
        header_data.data_tagihan.push(obj_data_tagihan)
      }
      hasil.push(header_data)
      // console.log(header_data);

      res.status(200).json({ status: 200, message: "sukses", data: hasil })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async sisaTagihanByPelangganId(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select sum(p.total_tarif) as "total_tagihan" ,sum(p.nominal_denda) as "total_denda",  sum(p.sisa_pembayaran) as "sisa_tagihan"
      from pemakaian p 
      join bulan b on b.id = p.bulan_id 
      join tahun t on t.id = b.tahun_id 
      where p."deletedAt" isnull and t.status_tahun = 1 and p.pelanggan_id = '${pelanggan_id}' `, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listTagihanBelumLunasByPelangganId(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pemakaian_id", p.nama_bulan ,p.selisih ,p.total_tarif ,p.sisa_pembayaran, p2.total_terbayar ,p2.total_bayar ,p2.status_pembayaran 
      from pemakaian p 
      left join pembayaran p2 on p2.pemakaian_id = p.id 
      where p."deletedAt" isnull and p.sisa_pembayaran <> 0 and p.pelanggan_id = '${pelanggan_id}' 
      order by p."createdAt" asc`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listPembayaranByPemakaianId(req, res) {
    const { pemakaian_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pembayaran_id", p.*, p2.* 
      from pembayaran p 
      join pemakaian p2 on p2.id = p.pemakaian_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull and p2.sisa_pembayaran <> 0 and p.pemakaian_id = '${pemakaian_id}'`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async listpembayaranBulanLalu(req, res) {
    const { pelanggan_id } = req.body
    try {
      let data = await koneksi.query(`select p.id as "pembayaran_id", * 
      from pembayaran p 
      where p."deletedAt" isnull and p.pelanggan_id = '${pelanggan_id}' order by p."createdAt" desc limit 1`, { type: QueryTypes.SELECT })
      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanPembayaranPerHari(req, res) {
    try {
      let data = await koneksi.query(`select date(p.tanggal_bayar) as "tanggal_bayar" ,sum(p.total_terbayar) as "total_terbayar", sum(p.nominal_denda) as "total_denda_terbayar", sum(p.total_terbayar+p.nominal_denda) as "total"
      from pembayaran p where p."deletedAt" isnull 
      group by date(p.tanggal_bayar) order by date(p.tanggal_bayar) desc`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async detailSettlementPerTanggal(req, res) {
    let { tanggal } = req.body
    try {
      let data = await koneksi.query(`select p2.pelanggan_id , p3.nama_pelanggan ,d.nama_desa ,d2.nama_dusun, sum(p.total_terbayar) as "total_terbayar",sum(p.nominal_denda) as "total_denda_terbayar",sum(p.total_terbayar+p.nominal_denda) as "total"
      from pembayaran p 
      join pemakaian p2 on p2.id = p.pemakaian_id 
      join pelanggan p3 on p3.id = p2.pelanggan_id 
      join desa d on d.id = p3.desa_id 
      join dusun d2 on d2.id = p3.dusun_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull and p3."deletedAt" isnull and date(p.tanggal_bayar) = '${tanggal}' 
      group by p2.pelanggan_id , p3.nama_pelanggan, d.nama_desa , d2.nama_dusun`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanPembayaranPerTanggal(req, res) {
    let { tanggal } = req.body
    try {
      let data = await koneksi.query(`select date(p.tanggal_bayar) as "tanggal_bayar" ,sum(p.total_terbayar) as "total_terbayar", sum(p.nominal_denda) as "total_denda_terbayar", sum(p.total_terbayar+p.nominal_denda) as "total"
      from pembayaran p where p."deletedAt" isnull and date(p.tanggal_bayar) = '${tanggal}' 
      group by date(p.tanggal_bayar)`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async cetakLaporanPembayaranPerTanggal(req, res) {
    let { tanggal } = req.body
    try {
      let data = await koneksi.query(`select date(p.tanggal_bayar) as "tanggal_bayar" , sum(p.total_terbayar) as "total_terbayar",sum(p.nominal_denda) as "total_denda_terbayar" ,sum(p.total_terbayar+p.nominal_denda) as "total", d.nama_dusun 
      from pembayaran p 
      join pemakaian p2 on p2.id = p.pemakaian_id 
      join pelanggan p3 on p3.id = p2.pelanggan_id 
      join dusun d on d.id = p3.dusun_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull and p3."deletedAt" isnull 
      and date(p.tanggal_bayar) = '${tanggal}'
      group by date(p.tanggal_bayar), d.nama_dusun `, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static detailsById(req, res) {
    const { id } = req.params;
    pembayaran.findAll({ where: { id } }).then((data) => {
      res.status(200).json({ message: "sukses", data });
    }).catch((err) => {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err });
    });
  }

  static async cetakStruk(req, res) {
    const { struk_baru } = req.body
    console.log(req.body);
    try {
      // device.open(function(error){
      //   printer
      //   .font('a')
      //   .align('ct')
      //   .style('bu')
      //   .size(0.5, 0.5)
      //   .text('TES PRINTER')
      //   .text(struk_baru)
      //   .cut()
      //   .close()
      // });
      res.status(200).json({ status: 200, message: "sukses", data: struk_baru })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async cetakSuratPeringatan(req, res) {
    const { pelanggan_id } = req.params
    try {
      function terbilang(angka) {
        var bilne = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        if (angka < 12) {
          return bilne[angka];
        } else if (angka < 20) {
          return terbilang(angka - 10) + " Belas";
        } else if (angka < 100) {
          return terbilang(Math.floor(parseInt(angka) / 10)) + " Puluh " + terbilang(parseInt(angka) % 10);
        } else if (angka < 200) {
          return "Seratus " + terbilang(parseInt(angka) - 100);
        } else if (angka < 1000) {
          return terbilang(Math.floor(parseInt(angka) / 100)) + " Ratus " + terbilang(parseInt(angka) % 100);
        } else if (angka < 2000) {
          return "Seribu " + terbilang(parseInt(angka) - 1000);
        } else if (angka < 1000000) {
          return terbilang(Math.floor(parseInt(angka) / 1000)) + " Ribu " + terbilang(parseInt(angka) % 1000);
        } else if (angka < 1000000000) {
          return terbilang(Math.floor(parseInt(angka) / 1000000)) + " Juta " + terbilang(parseInt(angka) % 1000000);
        } else if (angka < 1000000000000) {
          return terbilang(Math.floor(parseInt(angka) / 1000000000)) + " Milyar " + terbilang(parseInt(angka) % 1000000000);
        } else if (angka < 1000000000000000) {
          return terbilang(Math.floor(parseInt(angka) / 1000000000000)) + " Trilyun " + terbilang(parseInt(angka) % 1000000000000);
        }
      }
      let data1 = await koneksi.query(`select p.id as "pelanggan_id", * 
      from pelanggan p 
      join desa d on d.id = p.desa_id 
      join dusun d2 on d2.id = p.dusun_id 
      join golongan_tarif gt on gt.id = p.golongan_tarif_id 
      where p."deletedAt" isnull and p.id = '${pelanggan_id}'`, { type: QueryTypes.SELECT })

      let data2 = await koneksi.query(`select p.id as "pemakaian_id", p.nama_bulan , t.nama_tahun, p.sisa_pembayaran as "jumlah_tunggakan", p.nominal_denda 
      from pemakaian p 
      join bulan b on b.id = p.bulan_id 
      join tahun t on t.id = b.tahun_id 
      left join pembayaran p2 on p2.pemakaian_id = p.id 
      where p."deletedAt" isnull and p.sisa_pembayaran <> 0 and p.pelanggan_id = '${pelanggan_id}' 
      group by p.id ,t.nama_tahun ,p2.nominal_denda 
      order by p."createdAt"`, { type: QueryTypes.SELECT })

      let data3 = await koneksi.query(`select sum(p.sisa_pembayaran) as "total_tunggakan" 
      from pemakaian p 
      join bulan b on b.id = p.bulan_id 
      join tahun t on t.id = b.tahun_id 
      where p."deletedAt" isnull and p.sisa_pembayaran <> 0 and p.pelanggan_id = '${pelanggan_id}' `, { type: QueryTypes.SELECT })

      let total_denda = 0
      let total_tunggakan_denda = 0
      for (let i = 0; i < data2.length; i++) {
        let tunggakan_dan_denda = Number(data2[i].jumlah_tunggakan) + Number(data1[0].nominal_denda)
        data2[i].jumlah_tunggakan = rupiah(data2[i].jumlah_tunggakan)
        data2[i].nominal_denda = rupiah(data2[i].nominal_denda)
        data2[i].jumlah = rupiah(tunggakan_dan_denda)
        total_denda += data1[0].nominal_denda
        total_tunggakan_denda += tunggakan_dan_denda
      }

      data1[0].data_pemakaian = data2
      data1[0].tanggal_surat = moment().format("LL")
      data1[0].total_tunggakan = rupiah(data3[0].total_tunggakan)
      data1[0].total_denda = rupiah(total_denda)
      data1[0].total_tunggakan_denda = rupiah(total_tunggakan_denda)
      data1[0].terbilang_tanpa_denda = terbilang(data3[0].total_tunggakan)
      data1[0].terbilang_dengan_denda = terbilang(total_tunggakan_denda)

      res.status(200).render("surat_peringatan", { status: 200, message: "sukses", data: data1[0] })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanPembayaranPerBulan(req, res) {
    let { bulan_id, desa_id } = req.body
    try {
      let data = await koneksi.query(`select distinct p.pelanggan_id ,p2.nama_pelanggan ,d.nama_desa ,d2.nama_dusun ,p.nama_bulan ,t.nama_tahun , p.meter_awal ,p.meter_akhir ,p.selisih ,p.total_tarif ,
      p3.total_terbayar ,p.nominal_denda ,date(p3.tanggal_bayar) as "tanggal_bayar"
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      join desa d on d.id = p2.desa_id 
      join dusun d2 on d2.id = p2.dusun_id 
      join bulan b on b.id = p.bulan_id 
      join tahun t on t.id = b.tahun_id 
      left join pembayaran p3 on p3.pemakaian_id = p.id 
      where p."deletedAt" isnull and p2."deletedAt" isnull 
      and p.bulan_id = '${bulan_id}' 
      and p2.desa_id = '${desa_id}' 
      order by p2.nama_pelanggan `, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanPembayaranPerBulanExcel(req, res) {
    let { bulan_id, desa_id } = req.query
    try {
      let data = await koneksi.query(`select distinct p.pelanggan_id ,p2.nama_pelanggan ,d.nama_desa ,d2.nama_dusun ,p.nama_bulan ,t.nama_tahun , p.meter_awal ,p.meter_akhir ,p.selisih ,p.total_tarif ,
      p3.total_terbayar ,p.nominal_denda ,date(p3.tanggal_bayar) as "tanggal_bayar"
      from pemakaian p 
      join pelanggan p2 on p2.id = p.pelanggan_id 
      join desa d on d.id = p2.desa_id 
      join dusun d2 on d2.id = p2.dusun_id 
      join bulan b on b.id = p.bulan_id 
      join tahun t on t.id = b.tahun_id 
      left join pembayaran p3 on p3.pemakaian_id = p.id 
      where p."deletedAt" isnull and p2."deletedAt" isnull 
      and p.bulan_id = '${bulan_id}' 
      and p2.desa_id = '${desa_id}' 
      order by p2.nama_pelanggan `, { type: QueryTypes.SELECT })

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("LAPORAN-PEMBAYARAN");

      let judul = 1;
      sheet.mergeCells("A"+judul+":"+"J"+judul)
      sheet.getCell("J"+judul).value = ("DAFTAR PELANGGAN AIR BERSIH 'RAGIL KUNING'")
      sheet.getCell("J"+judul).font = { bold: true };
      sheet.getCell("J"+judul).alignment = { horizontal: 'center' }

      judul += 1
      sheet.mergeCells("A"+judul+":"+"J"+judul)
      sheet.getCell("J"+judul).value = (`BULAN ${data[0].nama_bulan.toUpperCase()} TAHUN ${data[0].nama_tahun}`)
      sheet.getCell("J"+judul).font = { bold: true };
      sheet.getCell("J"+judul).alignment = { horizontal: 'center' }

      judul += 2 
      sheet.mergeCells("A"+judul+":"+"J"+judul)
      sheet.getCell("J"+judul).value = (`DUSUN ${data[0].nama_dusun} ,DESA ${data[0].nama_desa} KEC. TENGARAN KAB. SEMARANG`)
      sheet.getCell("J"+judul).font = { bold: true };
      sheet.getCell("J"+judul).alignment = { horizontal: 'center' }

      judul += 2
      sheet.mergeCells("A"+judul+":"+"A"+(judul+1))
      sheet.mergeCells("B"+judul+":"+"B"+(judul+1))
      sheet.mergeCells("C"+judul+":"+"I"+judul)
      sheet.mergeCells("J"+judul+":"+"J"+(judul+1))

      let no = sheet.getColumn('A')
      no.width = 5
      let nama = sheet.getColumn('B')
      nama.width = 20
      let rp = sheet.getColumn('F')
      rp.width = 15
      let tanggal_bayar = sheet.getColumn('G')
      tanggal_bayar.width = 20
      let byr = sheet.getColumn('H')
      byr.width = 15

      sheet.getCell("A"+judul).value = "NO"
      sheet.getCell("B"+judul).value = "NAMA PELANGGAN"
      sheet.getCell("C"+judul).value = data[0].nama_bulan.toUpperCase()
      sheet.getCell("C"+(judul+1)).value = "AWAL"
      sheet.getCell("D"+(judul+1)).value = "AKHIR"
      sheet.getCell("E"+(judul+1)).value = "M3"
      sheet.getCell("F"+(judul+1)).value = "RP"
      sheet.getCell("G"+(judul+1)).value = "TANGGAL BAYAR"
      sheet.getCell("H"+(judul+1)).value = "BAYAR"
      sheet.getCell("I"+(judul+1)).value = "STATUS"
      sheet.getCell("J"+judul).value = "DENDA"

      sheet.getCell("A"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("B"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("C"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("C"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("D"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("E"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("G"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("H"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("I"+(judul+1)).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("J"+judul).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }

      sheet.getCell("A"+judul).font = { bold: true }
      sheet.getCell("B"+judul).font = { bold: true }
      sheet.getCell("C"+judul).font = { bold: true }
      sheet.getCell("C"+(judul+1)).font = { bold: true }
      sheet.getCell("D"+(judul+1)).font = { bold: true }
      sheet.getCell("E"+(judul+1)).font = { bold: true }
      sheet.getCell("F"+(judul+1)).font = { bold: true }
      sheet.getCell("G"+(judul+1)).font = { bold: true }
      sheet.getCell("H"+(judul+1)).font = { bold: true }
      sheet.getCell("I"+(judul+1)).font = { bold: true }
      sheet.getCell("J"+judul).font = { bold: true }

      sheet.getCell("A"+judul).alignment = { horizontal: 'center', vertical: 'middle' }
      sheet.getCell("B"+judul).alignment = { horizontal: 'center', vertical: 'middle' }
      sheet.getCell("C"+judul).alignment = { horizontal: 'center' }
      sheet.getCell("C"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("D"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("E"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("F"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("G"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("H"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("I"+(judul+1)).alignment = { horizontal: 'center' }
      sheet.getCell("J"+judul).alignment = { horizontal: 'center', vertical: 'middle' }

      let jumlahPelanggan = data.length 
      let jumlahPelangganLunas = 0
      let jumlahPelangganBelumLunas = 0

      judul += 1
      for (let i = 0; i < data.length; i++) {
        data.judul = judul
        judul += 1
        sheet.getCell("A"+judul).value = i + 1
        sheet.getCell("B"+judul).value = data[i].nama_pelanggan
        sheet.getCell("C"+judul).value = data[i].meter_awal
        sheet.getCell("D"+judul).value = data[i].meter_akhir
        sheet.getCell("E"+judul).value = data[i].selisih
        sheet.getCell("F"+judul).value = data[i].total_tarif
        sheet.getCell("F" + judul).numFmt = '#,##0';
        sheet.getCell("G"+judul).value = data[i].tanggal_bayar == null ? data[i].tanggal_bayar = '-' : moment(data[i].tanggal_bayar).format('LL')
        sheet.getCell("H"+judul).value = data[i].total_terbayar
        sheet.getCell("H" + judul).numFmt = '#,##0';
        if (data[i].total_tarif == data[i].total_terbayar) {
          data[i].status = 'LUNAS'
          jumlahPelangganLunas += 1
          sheet.getCell("I"+judul).value = "LUNAS"
        } else {
          data[i].status = '-'
          jumlahPelangganBelumLunas += 1
          sheet.getCell("I"+judul).value = "-"
        }
        sheet.getCell("J"+judul).value = data[i].nominal_denda
        sheet.getCell("J" + judul).numFmt = '#,##0';

        sheet.getCell("G"+judul).alignment = { horizontal: 'center' }

        sheet.getCell("A"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("B"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("C"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("D"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("E"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("F"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("G"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("H"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("I"+judul).border = { top: { style: "thin" }, left: { style: "thin" } }
        sheet.getCell("J"+judul).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
      }

      judul += 1
      sheet.mergeCells("A"+judul+":"+"E"+judul)
      sheet.getCell("A"+judul).value = "SUB.TOTAL"
      sheet.getCell("F"+judul).value = { formula: `SUM(F8:F${judul-1})` }
      sheet.getCell("H"+judul).value = { formula: `SUM(H8:H${judul-1})` }
      sheet.getCell("J"+judul).value = { formula: `SUM(J8:J${judul-1})` }
      sheet.getCell("F" + judul).numFmt = '#,##0';
      sheet.getCell("H" + judul).numFmt = '#,##0';
      sheet.getCell("J" + judul).numFmt = '#,##0';

      sheet.getCell("A"+judul).alignment = { horizontal: 'center' }

      sheet.getCell("A"+judul).font = { bold: true }
      sheet.getCell("F"+judul).font = { bold: true }
      sheet.getCell("H"+judul).font = { bold: true }
      sheet.getCell("J"+judul).font = { bold: true }

      sheet.getCell("A" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("F" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("G" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("H" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("I" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("J" + judul).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }

      let keterangan = 2 
      keterangan += judul
      sheet.mergeCells("A"+ keterangan+":"+"B"+keterangan)
      sheet.getCell("A"+ keterangan).value = "Keterangan :"
      sheet.getCell("A"+ keterangan).font = { bold: true }
      
      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Jumlah Tagihan Bulan ${data[0].nama_bulan}`
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = { formula: `SUM(F8:F${keterangan-4})` }
      sheet.getCell("F" + keterangan).numFmt = '"Rp "#,##0';

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }

      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Jumlah Uang Masuk Bulan ${data[0].nama_bulan}`
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = { formula: `SUM(H8:H${keterangan-5})` }
      sheet.getCell("F" + keterangan).numFmt = '"Rp "#,##0';

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }

      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Jumlah Uang Belum Masuk Bulan ${data[0].nama_bulan}`
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = { formula: `(SUM(F8:F${keterangan-6})) - (SUM(H8:H${keterangan-6}))` }
      sheet.getCell("F" + keterangan).numFmt = '"Rp "#,##0';

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
      
      keterangan += 1 
      sheet.mergeCells("A" + keterangan+":"+"E"+ keterangan)
      sheet.getCell("A" + keterangan).value = `Jumlah Denda Masuk Bulan ${data[0].nama_bulan}`
      sheet.mergeCells("F" + keterangan+":"+"G"+ keterangan)
      sheet.getCell("F" + keterangan).value = { formula: `SUM(J8:J${keterangan-7})` }
      sheet.getCell("F" + keterangan).numFmt = '"Rp "#,##0';

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
      
      let prosentasePelangganLunas = jumlahPelangganLunas / jumlahPelanggan * 100
      let prosentasePelangganBelumLunas = jumlahPelangganBelumLunas / jumlahPelanggan * 100

      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Jumlah Pelanggan Lunas`
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = jumlahPelangganLunas + ' Orang / ' + prosentasePelangganLunas.toFixed(2) + ' %'

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }

      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Jumlah Pelanggan Belum Lunas`
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = jumlahPelangganBelumLunas + ' Orang / ' + prosentasePelangganBelumLunas.toFixed(2) + ' %'

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
      
      keterangan += 1 
      sheet.mergeCells("A"+ keterangan+":"+"E" + keterangan)
      sheet.getCell("A"+ keterangan).value = `Total Pelanggan `
      sheet.mergeCells("F"+ keterangan+":"+"G"+ keterangan)
      sheet.getCell("F"+ keterangan).value = jumlahPelanggan + ' Orang / 100 %'

      sheet.getCell("A" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" } }
      sheet.getCell("F" + keterangan).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }

      let fileName = `LAPORAN-PEMBAYARAN-${data[0].nama_dusun}-${data[0].nama_bulan.toUpperCase()}-${data[0].nama_tahun}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", "attachment; filename=" + fileName);
      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanHarian(req, res) {
    let { tanggal_pembayaran } = req.body
    try {
      let data = await koneksi.query(`select p.user_id , u.username ,u.nama_user ,u."role" , sum(p.total_terbayar) as "jumlah_pembayaran", sum(p.nominal_denda) as "jumlah_denda"   
      from pembayaran p 
      join "user" u on u.id = p.user_id 
      where p."deletedAt" isnull and u."deletedAt" isnull and date(p.tanggal_bayar) = '${tanggal_pembayaran}'
      group by p.user_id ,u.username ,u.nama_user ,u."role"`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }

  static async laporanDetail(req, res) {
    let { tanggal_pembayaran } = req.body
    try {
      let data = await koneksi.query(`select p2.pelanggan_id , p3.nama_pelanggan ,d.nama_desa ,d2.nama_dusun, sum(p.total_terbayar) as "total_terbayar",sum(p.nominal_denda) as "total_denda_terbayar",sum(p.total_terbayar+p.nominal_denda) as "total"
      from pembayaran p 
      join pemakaian p2 on p2.id = p.pemakaian_id 
      join pelanggan p3 on p3.id = p2.pelanggan_id 
      join desa d on d.id = p3.desa_id 
      join dusun d2 on d2.id = p3.dusun_id 
      where p."deletedAt" isnull and p2."deletedAt" isnull and p3."deletedAt" isnull and date(p.tanggal_bayar) = '${tanggal_pembayaran}' 
      group by p2.pelanggan_id , p3.nama_pelanggan, d.nama_desa , d2.nama_dusun`, { type: QueryTypes.SELECT })

      res.status(200).json({ status: 200, message: "sukses", data })
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "gagal", data: err })
    }
  }
}

module.exports = Controller;
