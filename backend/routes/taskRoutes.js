// backend/routes/taskRoutes.js
const express = require('express');
const Task = require('../models/task');
const User = require('../models/user');

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
    const tasks = await Task.find().populate('assignedUsers');
    res.json(tasks);
});

// Create a new task
router.post('/', async (req, res) => {
    const { title, description, status, assignedUsers } = req.body;
    const task = new Task({ title, description, status, assignedUsers });
    await task.save();
    res.json(task);
});

// Update a task
router.put('/:id', async (req, res) => {
    const { title, description, status, assignedUsers } = req.body;
    const task = await Task.findByIdAndUpdate(req.params.id, { title, description, status, assignedUsers }, { new: true });
    res.json(task);
});

// Delete a task
router.delete('/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
});

module.exports = router;
