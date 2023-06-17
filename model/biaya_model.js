const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const biaya = koneksi.define('biaya', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_biaya: {
        type: DataTypes.STRING
    },
    nominal_biaya: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    golongan_biaya: {
        type: DataTypes.SMALLINT, // 0: default || 1: utama || 2: tambahan
        defaultValue: 0
    },
    status_biaya: {
        type: DataTypes.SMALLINT, // 0: non aktif || 1: aktif
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// biaya.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = biaya