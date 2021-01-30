const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
},
{
    timestamps: true
}
);

var Requests = mongoose.model('Request', requestSchema);

module.exports = Requests;