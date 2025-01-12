// components/EditTaskModal.js
import React, { useState } from "react";
import axios from "axios";

const EditTaskModal = ({ isOpen, onClose, task, onTaskUpdated }) => {
  const [taskName, setTaskName] = useState(task.name);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);

  const handleUpdateTask = async () => {
    const updatedTask = {
      ...task,
      name: taskName,
      assignedTo: Array.isArray(assignedTo) ? assignedTo : [assignedTo],
    };

    try {
      await axios.put(`http://localhost:3001/api/tasks/${task.id}`, updatedTask);
      onTaskUpdated(updatedTask);
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Edit Task</h2>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Task Name"
      />
      <input
        type="text"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        placeholder="Assigned To"
      />
      <button onClick={handleUpdateTask}>Update Task</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default EditTaskModal;
