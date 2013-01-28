module.exports = config = {

	"name" : "Shift-check",
	"name_lower": "shift-check",

	"port" : 3100,
	"ssl_port" : 3101,

	"mongo_host" : "localhost",
	"mongo_port" : 27017,
	"mongo_db" : "schedule",

	"ssl_key" : "./config/ssl/key.pem",
	"ssl_cert" : "./config/ssl/cert.pem",

	"debug": true
}
