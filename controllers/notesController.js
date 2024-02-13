const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const Notes = require('../models/Notes');
const { validationResult } = require('express-validator');




exports.fetchAllNotes = async (req, res) => {

    try {
        //looking in to the database if notes exists or not 
        const notes = await Notes.find({ user: req.user.id });

        //returning nodes
        res.send(notes);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }

}


exports.AddNotes = async (req, res) => {

    try {
        // Destructuring
        const { title, description, tag } = req.body;

        // Validation error handling
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        //previous method
        // const notes = Notes({
        //     title,
        //     description,
        //     tag,
        //     user: req.user.id,
        // })

        //note create method always looks for duplicacy no need to use coonditional statements

        // Creating and saving the new note
        const note = await Notes({
            title,
            description,
            tag,
            user: req.user.id,
        })

        //looking for duplicate entery
        const existingentery = await Notes.findOne({ title, description, user: req.user.id });

        //checking for duplicate entery
        if (existingentery) {
            console.log('book with the same name and description already exists,Try defferent name and description')
            return res.status(400).json({
                success: false,
                message: 'book with the same name and description already exists,Try defferent name and description',
            })
        }

        // previous method
        // const saveddata = await note.save();

        //creating variable and storing the data in it 
        await note.save();

        //previous method
        // res.json(saveddata)

        //returning the data
        res.json(note);

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}



exports.updateTheNotes = async (req, res) => {

    try {
        //validation error handling
        //destructure
        //updating the notes
        //checking for duplicacy
        //find the user by id
        //condition to check if there are any notes
        //checking if its the user or not 
        //finding the id and updating it 

        //1
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        //2
        const { title, description, tag } = req.body;

        //3
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };


        //4
        const existingentery = await Notes.findOne({ title, description, user: req.user.id });

        if (existingentery) {
            console.log('book with the same name and description already exists,Try defferent name and description')
            return res.status(400).json({
                success: false,
                message: 'book with the same name and description already exists,Try defferent name and description',
            })
        }
        //5
        let notes = await Notes.findById(req.params.id);

        //6
        if (!notes) {
            return res.status(404).send("not found");
        }
        //7
        if (notes.user.toString() !== req.user.id) {
            return res.status(404).send("not found");
        }

        //8
        notes = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json({ notes });

        console.log("note updated");

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
        if (notes.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

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


