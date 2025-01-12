const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Dummy user data for login validation
const users = [
  { username: "admin", password: "admin123" },
  { username: "user", password: "user123" }
];

// Read tasks from file
const readTasks = () => {
  const data = fs.readFileSync("tasks.json");
  return JSON.parse(data);
};

// Write tasks to file
const writeTasks = (data) => {
  fs.writeFileSync("tasks.json", JSON.stringify(data, null, 2));
};

// GET tasks
app.get("/api/tasks", (req, res) => {
  const data = readTasks();
  res.json(data);
});

// POST new task
app.post("/api/tasks", (req, res) => {
  const newTask = req.body;
  const data = readTasks();

  data.tasks.push(newTask);
  data.columns["To Do"].push(newTask.id);

  writeTasks(data);
  res.status(201).json({ message: "Task added successfully", task: newTask });
});

// POST endpoint to update task movement between columns
app.post("/api/tasks/move", (req, res) => {
    const { taskId, fromColumn, toColumn } = req.body;
    const data = readTasks();
  
    // Remove task from the original column
    data.columns[fromColumn] = data.columns[fromColumn].filter((id) => id !== taskId);
  
    // Add task to the new column
    data.columns[toColumn].push(taskId);
  
    // Save the updated data
    writeTasks(data);
  
    res.status(200).json({ message: "Task moved successfully" });
  });

  // Edit Task
app.put("/api/tasks/:id", (req, res) => {
    const taskId = req.params.id;
    const { name, assignedTo, status } = req.body;
    const data = readTasks();
  
    const taskIndex = data.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }
  
    // Update task details
    data.tasks[taskIndex] = { ...data.tasks[taskIndex], name, assignedTo, status };
    writeTasks(data);
  
    res.status(200).json({ message: "Task updated successfully" });
  });
  
  // Delete Task
  app.delete("/api/tasks/:id", (req, res) => {
    const taskId = req.params.id;
    const data = readTasks();
  
    // Remove task from tasks array
    data.tasks = data.tasks.filter((task) => task.id !== taskId);
  
    // Remove task ID from columns
    Object.keys(data.columns).forEach((column) => {
      data.columns[column] = data.columns[column].filter((id) => id !== taskId);
    });
  
    writeTasks(data);
    res.status(200).json({ message: "Task deleted successfully" });
  });
  

// 🔒 LOGIN endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
