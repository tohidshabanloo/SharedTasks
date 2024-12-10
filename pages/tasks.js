import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone"; // Import react-dropzone
import "./App.css";

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [newTaskTitle, setNewTaskTitle] = useState("");

    // Fetch tasks from the server
    const fetchTasks = () => {
        fetch("http://localhost:5000/tasks")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch tasks");
                return res.json();
            })
            .then((data) => setTasks(data))
            .catch((err) => console.error("Error fetching tasks:", err));
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleEdit = (id, title) => {
        setEditTaskId(id);
        setEditTaskTitle(title);
    };

    const handleAddTask = () => {
        fetch("http://localhost:5000/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: newTaskTitle,
                status: "all", // Default status
            }),
        })
            .then((res) => res.json())
            .then(() => {
                setNewTaskTitle("");
                fetchTasks(); // Re-fetch tasks to update state
            })
            .catch((err) => console.error("Error adding task:", err));
    };

    const saveEditTask = (id) => {
        fetch(`http://localhost:5000/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: editTaskTitle }),
        })
            .then((res) => res.json())
            .then(() => {
                setEditTaskId(null);
                fetchTasks(); // Re-fetch tasks to update state
            })
            .catch((err) => console.error("Error editing task:", err));
    };

    const onDrop = (acceptedFiles, status) => {
        // Handle dropping task (you can use the acceptedFiles to update the task status or do any other action)
        const updatedTasks = [...tasks];
        const draggedTaskIndex = updatedTasks.findIndex(
            (task) => task.status === status
        );

        // Example: Update task status when dropped
        if (draggedTaskIndex >= 0) {
            updatedTasks[draggedTaskIndex].status = status;
            setTasks(updatedTasks);

            // Update task on the server
            fetch(
                `http://localhost:5000/tasks/${updatedTasks[draggedTaskIndex].id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...updatedTasks[draggedTaskIndex],
                    }),
                }
            ).catch((err) => console.error("Error updating task on drag:", err));
        }
    };

    const handleDelete = (id) => {
        fetch(`http://localhost:5000/tasks/${id}`, {
            method: "DELETE",
        })
            .then(() => {
                fetchTasks(); // Re-fetch tasks to update state
            })
            .catch((err) => console.error("Error deleting task:", err));
    };

    // Prepare dropzone handlers for each column
    const dropzoneHandlers = {
        all: useDropzone({ onDrop: (acceptedFiles) => onDrop(acceptedFiles, "all") }),
        "in-progress": useDropzone({ onDrop: (acceptedFiles) => onDrop(acceptedFiles, "in-progress") }),
        done: useDropzone({ onDrop: (acceptedFiles) => onDrop(acceptedFiles, "done") }),
    };

    return (
        <div className="board">
            {/* Column for "All" Tasks */}
            <div
                key="all"
                className="column"
                style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}
            >
                <h3>ALL</h3>

                {/* Dropzone for all tasks */}
                <div {...dropzoneHandlers.all.getRootProps()}>
                    {/* Render tasks */}
                    {tasks
                        .filter((task) => task.status === "all")
                        .map((task) => (
                            <div key={task.id} className="task">
                                {editTaskId === task.id ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editTaskTitle}
                                            onChange={(e) => setEditTaskTitle(e.target.value)}
                                        />
                                        <button onClick={() => saveEditTask(task.id)}>Save</button>
                                    </>
                                ) : (
                                    <>
                                        <p>{task.title}</p>
                                        <button onClick={() => handleEdit(task.id, task.title)}>Edit</button>
                                    </>
                                )}
                                <button onClick={() => handleDelete(task.id)}>Delete</button>
                            </div>
                        ))}
                </div>

                {/* Add Task Input */}
                <div className="add-task">
                    <input
                        type="text"
                        placeholder="New Task Title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                    <button onClick={handleAddTask}>Add Task</button>
                </div>
            </div>

            {/* Other columns (In Progress, Done) */}
            {["in-progress", "done"].map((status) => (
                <div
                    key={status}
                    className="column"
                    style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}
                >
                    <h3>{status.toUpperCase()}</h3>

                    {/* Dropzone */}
                    <div {...dropzoneHandlers[status].getRootProps()}>
                        {/* Render tasks */}
                        {tasks
                            .filter((task) => task.status === status)
                            .map((task) => (
                                <div key={task.id} className="task">
                                    {editTaskId === task.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editTaskTitle}
                                                onChange={(e) => setEditTaskTitle(e.target.value)}
                                            />
                                            <button onClick={() => saveEditTask(task.id)}>Save</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>{task.title}</p>
                                            <button onClick={() => handleEdit(task.id, task.title)}>Edit</button>
                                        </>
                                    )}
                                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default App;
