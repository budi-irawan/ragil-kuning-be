const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const tahun = koneksi.define('tahun', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_tahun: {
        type: DataTypes.STRING
    },
    status_tahun: {
        type: DataTypes.SMALLINT // 0: tidak aktif || 1: aktif
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// tahun.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = tahun