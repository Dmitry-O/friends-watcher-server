var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var coordsSchema = new Schema({
    latitude: {
        type: String,
        default: ''
    },
    longitude: {
        type: String,
        default: ''
    }
});

var User = new Schema({
    fullname: {
        type: String,
        default: ''
    },
    telnum: {
        type: String,
        default: ''
    },
    coords: coordsSchema,
    timestamp: {
        type: Date,
        required: false
    },
    visible: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
}
);

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);