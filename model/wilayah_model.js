const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const wilayah = koneksi.define('wilayah', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_wilayah: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// wilayah.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = wilayah