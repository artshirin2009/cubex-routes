const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const messageSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String
    },
    /**Time to live for the comment 120 sec*/
    createDate: { type: Date, default: Date.now, expires:'20m'} 

});

module.exports = mongoose.model('Message', messageSchema);
