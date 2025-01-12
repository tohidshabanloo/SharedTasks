// components/AddTaskModal.js
import { useState } from "react";
import axios from "axios";

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
    const [taskName, setTaskName] = useState("");
    const [assignedTo, setAssignedTo] = useState("");

    const handleAddTask = async () => {
        if (!taskName || !assignedTo) {
            alert("Please fill in all fields.");
            return;
        }

        const newTask = {
            name: taskName,
            assignedTo: assignedTo,
            status: "Pending"
        };

        try {
            const response = await axios.post("http://localhost:3001/api/tasks", newTask);
            onTaskAdded(response.data.task);
            onClose();
            setTaskName("");
            setAssignedTo("");
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task.");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-xl font-bold mb-4">Add New Task</h2>

                <input
                    type="text"
                    placeholder="Task Name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full border p-2 mb-3 rounded"
                />

                <input
                    type="text"
                    placeholder="Assign to"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full border p-2 mb-3 rounded"
                />

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddTask}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Add Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTaskModal;
