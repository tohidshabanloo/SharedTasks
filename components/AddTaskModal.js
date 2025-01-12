import { useState, useEffect } from "react";
import axios from "axios";

const AddTaskModal = ({ isOpen, onClose, onTaskAdded }) => {
    const [taskName, setTaskName] = useState("");
    const [assignedTo, setAssignedTo] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/api/users")
            .then((response) => setUsers(response.data))
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    const handleAddTask = async () => {
        if (!taskName || assignedTo.length === 0) {
          alert("Please fill in all fields.");
          return;
        }
      
        const newTask = {
          name: taskName,
          assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
          status: "Pending"
        };
      
        try {
          const response = await axios.post("http://localhost:3001/api/tasks", newTask);
          onTaskAdded(response.data.task);
          onClose();
          setTaskName("");
          setAssignedTo([]);
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

                <label className="block mb-2">Assign to:</label>
                <select
                    multiple
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full border p-2 mb-3 rounded"
                >
                    {users.map((user) => (
                        <option key={user.username} value={user.username}>
                            {user.displayName}
                        </option>
                    ))}
                </select>

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
