const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/auth');
const { fetchAllNotes, AddNotes, updateTheNotes, DeleteTheNode } = require('../controllers/notesController');
const { body } = require('express-validator');
const authentication = require('../middleware/auth1');


//login required
router.get('/getnotes', authentication, fetchAllNotes);


//login required
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

//login required
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

//login required
router.delete('/deleteNote/:id', authentication, DeleteTheNode);


module.exports = router;