const express = require( 'express' );
const multer = require( 'multer' );
const path = require( 'path' );

const fileFilter = function (req, file, cb) {
	const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
	if (!allowedTypes.includes(file.mimetype)) {
		const error = new Error("Wrong image type")
		error.code = "LIMIT_FILE_TYPES"
		return cb(error, false)
	}
	cb(null, true)
}

const storage = multer.diskStorage( {
	destination: ( req, file, cb ) => {
		cb( null, './uploads/' );
	},
	fileFilter,
	filename: ( req, file, cb ) => {
		cb( null, Date.now() + file.originalname );
	},
} );
const upload = multer( {
	storage: storage
} );

module.exports = {
	upload,
	storage
};