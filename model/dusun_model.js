const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const desa = require('../model/desa_model')

const dusun = koneksi.define('dusun', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_dusun: {
        type: DataTypes.STRING
    },
    tanggal_jatuh_tempo: {
        type: DataTypes.INTEGER
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

dusun.belongsTo(desa, { foreignKey: 'desa_id' })
desa.hasMany(dusun, { foreignKey: 'desa_id' })

// dusun.sync({ alter: true }).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = dusun