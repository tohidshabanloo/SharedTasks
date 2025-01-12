const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const readTasks = () => {
    const data = fs.readFileSync("tasks.json");
    return JSON.parse(data);
};

const writeTasks = (data) => {
    fs.writeFileSync("tasks.json", JSON.stringify(data, null, 2));
};

app.get("/api/tasks", (req, res) => {
    const data = readTasks();
    res.json(data);
});

app.post("/api/tasks", (req, res) => {
    const newTask = req.body;
    const data = readTasks();

    data.tasks.push(newTask);
    if (!data.columns["To Do"]) {
        data.columns["To Do"] = [];
    }
    data.columns["To Do"].push(newTask.id);

    writeTasks(data);
    res.status(201).json({ message: "Task added successfully", task: newTask });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
