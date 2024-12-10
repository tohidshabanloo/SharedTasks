const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Simulate users and tasks in-memory
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
];

let tasks = [
    { id: '1', content: 'Task 1', status: 'all' },
    { id: '2', content: 'Task 2', status: 'in-progress' },
    { id: '3', content: 'Task 3', status: 'done' },
];

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Fetch tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// Update tasks
app.put('/api/tasks', (req, res) => {
    tasks = req.body;
    res.status(200).json({ success: true });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
