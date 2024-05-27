const express = require('express');
const router = express.Router();
const { fetchAllNotes, AddNotes, updateTheNotes, DeleteTheNode, SaveNotes, fet_user_spec_notes, deleteSavNote } = require('../controllers/notesController');
const { body } = require('express-validator');
const authentication = require('../middleware/auth1');



router.get('/getnotes', authentication, fetchAllNotes);
router.post('/addnotes', [
    body('title').custom((value) => {
        if (!value || value.trim().length < 3) {
            throw new Error('title length is too small');
        }
        return true;
    }).withMessage('title length is too small'),

    body('description').custom((value) => {

        if (!value || value.trim().length < 1) {
            throw new Error('title length is too small');
        }
        return true;

    }).withMessage("description is too small"),

], authentication, AddNotes)
router.delete('/deleteNote/:id', authentication, DeleteTheNode);
router.post('/savenotes/:id', authentication, SaveNotes);
router.get('/markednotes', authentication, fet_user_spec_notes);
router.put('/updateNote/:id', [
    body('title').custom((value) => {
        if (!value || value.trim().length < 3) {
            throw new Error('title length is too small');
        }
        return true;
    }).withMessage('title length is too small'),

    body('description').custom((value) => {

        if (!value || value.trim().length < 1) {
            throw new Error('title length is too small');
        }
        return true;

    }).withMessage("description is too small"),
], authentication, updateTheNotes);
router.get('/deletesavnote/:id', authentication, deleteSavNote);
module.exports = router;