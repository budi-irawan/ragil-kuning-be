const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const pelanggan = require('./pelanggan_model')
const bulan = require('./bulan_model')

const pemakaian = koneksi.define('pemakaian', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_input: {
        type: DataTypes.DATE
    },
    nama_bulan: {
        type: DataTypes.STRING
    },
    nomor_bulan: {
        type: DataTypes.INTEGER
    },
    meter_awal: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    meter_akhir: {
        type: DataTypes.INTEGER
    },
    selisih: {
        type: DataTypes.INTEGER
    },
    nominal_tarif: {
        type: DataTypes.FLOAT
    },
    biaya_perawatan: {
        type: DataTypes.FLOAT
    },
    nominal_denda: {
        type: DataTypes.FLOAT
    },
    total_tarif: {
        type: DataTypes.FLOAT
    },
    sisa_pembayaran: {
        type: DataTypes.FLOAT
    },
    status_pemakaian: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

pemakaian.belongsTo(pelanggan, { foreignKey: 'pelanggan_id' })
pelanggan.hasMany(pemakaian, { foreignKey: 'pelanggan_id' })

pemakaian.belongsTo(bulan, { foreignKey: 'bulan_id' })
bulan.hasMany(pemakaian, { foreignKey: 'bulan_id' })

// pemakaian.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = pemakaian