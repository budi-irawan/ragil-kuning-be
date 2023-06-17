const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const settlement_report = koneksi.define('settlement_report', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tanggal_transaksi: {
        type: DataTypes.DATE
    },
    jumlah_pembayaran: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    jumlah_denda: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    total: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// settlement_report.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = settlement_report