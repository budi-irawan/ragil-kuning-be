const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');
const pembayaran = require('./pembayaran_model')

const sub_pembayaran = koneksi.define('sub_pembayaran', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    no_nota: {
        type: DataTypes.STRING
    },
    tanggal_bayar: {
        type: DataTypes.DATE
    },
    jumlah_bayar: {
        type: DataTypes.FLOAT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

sub_pembayaran.belongsTo(pembayaran, { foreignKey: 'pembayaran_id' })
pembayaran.hasMany(sub_pembayaran, { foreignKey: 'pembayaran_id' })

// sub_pembayaran.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = sub_pembayaran