const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const Notes = require('../models/Notes');
const { validationResult } = require('express-validator');




exports.fetchAllNotes = async (req, res) => {

    try {
        const notes = await Notes.find({ user: req.user.id });
        if (!notes) {
            res.status(404).send("no notes");
        }
    
        res.send({ notes: notes.length === 0 ? "no notes" : notes });


    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}


exports.AddNotes = async (req, res) => {

    try {

        const { title, description, tag } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const existingentery = await Notes.findOne({ title, description, user: req.user.id });

        if (existingentery) {
            return res.status(400).json({
                success: false,
                message: 'book with the same name and description already exists,Try defferent name and description',
            })
        }

        const notes = await Notes.create({
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag,
            user: req.user.id,
        })
        console.log("notes->",notes._id);

        console.log("user->", req.user);

        console.log("notes->", notes);

        res.json(notes);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.updateTheNotes = async (req, res) => {
    try {
        const user = req.user.id;
        console.log("user->", user);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body;

        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        const existingEntry = await Notes.findOne({ title, description, user: req.user.id });
        if (existingEntry) {
            return res.status(400).json({
                success: false,
                message: 'A note with the same title and description already exists.',
            });
        }

        let notes = await Notes.findById(req.params.id);
        console.log("params->", { id: req.params.id });

        if (!notes) {
            return res.status(404).send("Note not found");
        }

        notes = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json({ notes });
        console.log("Note updated");
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.DeleteTheNode = async (req, res) => {
    try {

        // Find the note by ID
        let notes = await Notes.findById(req.params.id);

        // Check if the note exists
        if (!notes) {
            return res.status(404).send("Not Found");
        }

        // Allow deletion only if the user owns the note


        // Find the note by ID and delete it
        notes = await Notes.findByIdAndDelete(req.params.id);

        // Check if the note is deleted successfully

        return res.status(200).send({
            success: true,
            notes: notes,
        });
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
};


