const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ isPinned: -1, createdAt: -1 });
    res.json(notes);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = new Note({ title, content });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
