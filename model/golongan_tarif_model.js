const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const golongan_tarif = koneksi.define('golongan_tarif', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_golongan_tarif: {
        type: DataTypes.STRING
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
},
    {
        paranoid: true,
        freezeTableName: true
    });

// golongan_tarif.sync({ alter: true }).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = golongan_tarif