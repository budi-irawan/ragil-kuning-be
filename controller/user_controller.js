const { v4: uuid_v4 } = require("uuid")
const { koneksi } = require('../config/connection')
const { QueryTypes } = require('sequelize');
const bcrypt = require('../helper/bcrypt')
const jwt = require('../helper/jwt')
const user = require("../model/user_model")

async function createUser() {
    try {
        let hash_password = bcrypt.hashPassword("OWNER")
        await user.findOrCreate({ where: { username: "OWNER" }, defaults: { id: "OWNER", nama_user: "OWNER", username: "OWNER", password: hash_password, role: "OWNER" } })
    } catch (error) {
        console.log(error);
    }
}

createUser()

class Controller {
    static register(req, res) {
        const { nama_user, username, password, role } = req.body

        user.findAll({ where: { username } }).then((data1) => {
            if (data1.length) {
                res.status(201).json({ status: 204, message: "username sudah terdaftar" })
            } else {
                let pwd = bcrypt.hashPassword(password)
                user.create({ id: uuid_v4(), nama_user, username, password: pwd, role }).then((data2) => {
                    res.status(200).json({ status: 200, message: "sukses", data: data2 })
                }).catch((err) => {
                    console.log(err);
                    res.status(500).json({ status: 500, message: "gagal", data: err })
                })
            }
        })
    }

    static login(req, res) {
        const { username, password } = req.body
        user.findAll({ where: { username } }).then((data1) => {
            if (data1.length) {
                let hasil = bcrypt.compare(password, data1[0].dataValues.password)
                if (hasil) {
                    let data_token = { id: data1[0].id, username: data1[0].username }

                    res.status(200).json({ status: 200, message: "sukses", token: jwt.generateToken(data_token), username: data1[0].username })
                } else {
                    res.status(201).json({ status: 204, message: "password salah" })
                }
            } else {
                res.status(201).json({ status: 204, message: "username tidak terdaftar" })
            }
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err })
        })
    }

    static profil(req, res) {
        user.findAll({ where: { id: req.dataUsers.id } }).then((data) => {
            res.status(200).json({ status: 200, message: "sukses", data })
        }).catch((err) => {
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err })
        })
    }

    static async list(req, res) {
        try {
            let data = await koneksi.query(`select * from "user" u where u."deletedAt" isnull and u."role" <> 'OWNER'`, { type: QueryTypes.SELECT })
            res.status(200).json({ message: "sukses", data })
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "gagal", data: err })
        }
    }

    static async detailsById(req, res) {
        const { id } = req.params
        try {
            let data = await koneksi.query(`select u.id as "user_id", * from "user" u where u."deletedAt" isnull and u.id = '${id}'`, { type: QueryTypes.SELECT })
            res.status(200).json({ message: "sukses", data })
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "gagal", data: err })
        }
    }

    static update(req, res) {
        const { id, nama_user, username, role } = req.body;
        user.update({ nama_user, username, role }, { where: { id }, returning: true }).then((data) => {
            res.status(200).json({ message: "sukses", data });
        }).catch((err) => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ message: "gagal", data: err });
        });
    }

    static delete(req, res) {
        const { id } = req.body;
        user.destroy({ where: { id } }).then((data) => {
            res.status(200).json({ status: 200, message: "sukses" });
        }).catch((err) => {
            console.log(req.body);
            console.log(err);
            res.status(500).json({ status: 500, message: "gagal", data: err });
        });
    }
}

module.exports = Controller