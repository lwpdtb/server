var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var kittySchema =mongoose.Schema({
    name: String,
    psw:String
})

module.exports = mongoose.model('Kittens',kittySchema);