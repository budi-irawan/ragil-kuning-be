const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const pemakaian = require('./pemakaian_model')

const pembayaran = koneksi.define('pembayaran', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_nota: {
        type: DataTypes.STRING
    },
    tipe_bayar: {
        type: DataTypes.STRING
    },
    tanggal_bayar: {
        type: DataTypes.DATE
    },
    total_bayar: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    total_terbayar: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    nominal_denda: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    sisa_bayar: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status_pembayaran: {
        type: DataTypes.SMALLINT, // 0: baru dibuat || 1: lunas || 2: belum lunas
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

pembayaran.belongsTo(pemakaian, { foreignKey: 'pemakaian_id' })
pemakaian.hasMany(pembayaran, { foreignKey: 'pemakaian_id' })

// pembayaran.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = pembayaran