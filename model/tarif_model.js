const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const tarif = koneksi.define('tarif', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tarif_per_meter: {
        type: DataTypes.STRING
    },
    nominal_tarif: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    status_tarif: {
        type: DataTypes.SMALLINT, // 0: non aktif || 1: aktif
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// tarif.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = tarif