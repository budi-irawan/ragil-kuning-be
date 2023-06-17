const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const desa = koneksi.define('desa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_desa: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// desa.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = desa