const { DataTypes } = require('sequelize');
const { koneksi } = require('../config/connection');

const user = koneksi.define('user', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_user: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

// user.sync({alter:true}).then((data) => {
//     console.log('berhasil');
//     process.exit(0)
// }).catch((err) => {
//     console.log('error');
// })

module.exports = user