const mongoose = require('mongoose');
const { Schema } = mongoose;

const SaveSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    notes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'notes',
    },

}, { timestamps: true });

const SaveNotes = mongoose.model('s_notes', SaveSchema);
module.exports = SaveNotes;