const jwt = require( 'jsonwebtoken' )

function generateToken( payload ) {
	return jwt.sign( payload, 'pam' )
}

function verifyToken( token ) {
	return jwt.verify( token, 'pam' )
}

module.exports = {
	generateToken,
	verifyToken
}