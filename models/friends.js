const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Request'
        }
    ]
},
{
    timestamps: true
}
);

var Friends = mongoose.model('Friend', friendSchema);

module.exports = Friends;