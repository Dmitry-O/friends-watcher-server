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
            ref: 'User'
        }
    ]
},
{
    timestamps: true
}
);

var Friends = mongoose.model('Friend', friendSchema);

module.exports = Friends;