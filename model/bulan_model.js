const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const tahun = require('../model/tahun_model')

const bulan = koneksi.define('bulan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_bulan: {
        type: DataTypes.STRING
    },
    nomor_bulan: {
        type: DataTypes.INTEGER
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

bulan.belongsTo(tahun, { foreignKey: 'tahun_id' })
tahun.hasMany(bulan, { foreignKey: 'tahun_id' })

// bulan.sync({ alter: true }).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = bulan