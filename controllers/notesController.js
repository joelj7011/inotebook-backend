const catchAsyncErrors = require('../Utils/catchAsyncErrors');
const Notes = require('../models/Notes');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const SaveNotes = require('../models/SaveNotes');
const ApiResponse = require('../Utils/ApiResponse');
const { default: mongoose } = require('mongoose');




exports.fetchAllNotes = async (req, res) => {

    try {
        const userId = req.user.id
        console.log(userId);
        const notes = await Notes.find({ user: userId });
        if (!notes) {
            return res.status(404).send("no notes");
        }

        return res.send({ notes: notes.length === 0 ? "no notes" : notes });

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
        });


        return res.json(new ApiResponse(200, { note: notes }, "note added successfully"));

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

        let notes = await Notes.findById(req.params.id);
        if (!notes) {
            return res.status(404).json({ message: "Not Found" });
        }

        const deletNote = await Notes.findByIdAndDelete(notes.id);
        if (!deletNote) {
            return res.status(401).json({ error: "note id not found" });
        }


        return res.status(200).send({
            success: true,
            notes: notes,
        });
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
};

exports.SaveNotes = async (req, res) => {
    try {
        const noteId = req.params.id;
        const UserData = await User.findById(req.user.id);
        if (!UserData) {
            console.log("test1->failed");
            return res.status(500).json({ error: "note not found" });
        } else {
            console.log("test1->success", UserData);
        }

        const NoteData = await Notes.findById(noteId);
        if (!NoteData) {
            console.log("test2->failed");
            return res.status(500).json({ error: "note not found" });
        } else {
            console.log("test2->success");

        }

        const existingEntry = await SaveNotes.findOne({ notes: NoteData.id });
        if (existingEntry) {
            return res.status(200).json({
                success: false,
                message: 'you have already saved this note',
            });
        }
        const Saved_Notes = await SaveNotes.create({
            user: req.user.id,
            notes: noteId
        });

        if (!Saved_Notes) {
            console.log("test3->failed");
            return res.status(500).json({ error: "could not save the notes" });
        } else {
            console.log("test3->success", Saved_Notes);
            return res.json(new ApiResponse(200, { note: Saved_Notes }, "note saved successfully"));

        }
    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}

exports.fet_user_spec_notes = async (req, res) => {

    try {

        console.log("|")
        const fetchData = await SaveNotes.find({ user: req.user.id }).populate('notes');
        if (fetchData) {
            console.log("test1->passed");
        } else {
            console.log("test1->failed");
            return res.status(500).json({ error: "data was not fetched" });
        }

        const extractNote = fetchData.map((fetchData) => { return fetchData.notes });
        if (extractNote) {
            console.log("test2->passed");
        } else {
            console.log("test2->failed");
            return res.status(500).json({ error: "notes could not be extracted" });
        }


        const noteData = await Notes.find({ _id: { $in: extractNote } });
        if (noteData) {
            console.log("test3->passed");
            return res.json(new ApiResponse(200, { note: noteData }, "note fetched successfully"));
        } else {
            console.log("test3->failed");
        }

    } catch (error) {
        catchAsyncErrors(error, req, res);
    }
}


exports.deleteSavNote = async (req, res) => {

    let savNotes = await SaveNotes.find({ notes: req.params.id });
    if (!savNotes) {
        console.log("test1->failed");
        return res.status(404).json({ message: "note not found" });
    } else {
        console.log("test1->passed");
    }

    const extractid = savNotes.map((savNotes) => {
        return savNotes?.id?.toString();
    });

    const delNote = await SaveNotes.findByIdAndDelete(extractid);
    if (!delNote) {
        console.log("test2->failed");
        return res.status(500).json({ message: "note could not be deleted" });
    } else {
        console.log("test2->success");
        return res.json(new ApiResponse(200, { note: savNotes }, "note deleted successfully"))
    }
}

