const { Sequelize } = require('sequelize');

const koneksi = new Sequelize('water', 'postgres', 'root', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  pool: {
    max: 1000,
    min: 0,
    idle: 200000,
    acquire: 1000000,
  },
  timezone: '+07:00'
});

module.exports = { koneksi }