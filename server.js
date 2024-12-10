const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const fs = require("fs");
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Get all tasks
let tasks = JSON.parse(fs.readFileSync("tasks.json"));

app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// Add a task
app.post("/tasks", (req, res) => {
    const { title, status } = req.body;

    const newTask = {
        id: tasks.length + 1,
        title,
        status,
    };

    tasks.push(newTask);
    fs.writeFileSync("tasks.json", JSON.stringify(tasks));
    res.json({ message: "Task added successfully" });
});


// Edit a task
app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    tasks = tasks.map((task) =>
        task.id === parseInt(id) ? { ...task, title } : task
    );

    fs.writeFileSync("tasks.json", JSON.stringify(tasks));
    res.json({ message: "Task updated successfully" });
});


// Delete a task
app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    tasks = tasks.filter((task) => task.id !== parseInt(id));
    res.json({ message: "Task deleted successfully" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
