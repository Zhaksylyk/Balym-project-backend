const {Schema, model, Types} = require('mongoose')

const schema = new Schema({
  FirstName: {type: String, required: true},
  LastName: {type: String, required: true},
  BirthDay: {type: Date, default: Date.now},
  Course: {type: String, required: true},
  IpAddress: {type: String, required: true},
  
})

module.exports = model('Link', schema)