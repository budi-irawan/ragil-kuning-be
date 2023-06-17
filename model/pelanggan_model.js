const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const desa = require('../model/desa_model')
const dusun = require('../model/dusun_model')
const golongan_tarif = require('../model/golongan_tarif_model')

const pelanggan = koneksi.define('pelanggan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_pelanggan: {
        type: DataTypes.STRING
    },
    nomor_telepon: {
        type: DataTypes.STRING
    },
    alamat: {
        type: DataTypes.STRING
    },
    status_pelanggan: {
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

pelanggan.belongsTo(golongan_tarif, { foreignKey: 'golongan_tarif_id' })
golongan_tarif.hasMany(pelanggan, { foreignKey: 'golongan_tarif_id' })

pelanggan.belongsTo(desa, { foreignKey: 'desa_id' })
desa.hasMany(pelanggan, { foreignKey: 'desa_id' })

pelanggan.belongsTo(dusun, { foreignKey: 'dusun_id' })
dusun.hasMany(pelanggan, { foreignKey: 'dusun_id' })

// pelanggan.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = pelanggan