import { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function KanbanBoard() {
  const [data, setData] = useState({
    tasks: [],
    columns: {
      "To Do": [],
      "In Progress": [],
      "Done": []
    }
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/tasks")
      .then((response) => {
        console.log("Tasks fetched:", response.data);
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  const moveTask = (taskId, fromColumn, toColumn) => {
    if (fromColumn === toColumn) return;
  
    const updatedFrom = data.columns[fromColumn].filter((id) => id !== taskId);
    const updatedTo = [...data.columns[toColumn], taskId];
  
    // Update UI immediately
    setData({
      ...data,
      columns: {
        ...data.columns,
        [fromColumn]: updatedFrom,
        [toColumn]: updatedTo,
      },
    });
  
    // Send the movement update to the backend
    axios
      .post("http://localhost:3001/api/tasks/move", {
        taskId,
        fromColumn,
        toColumn,
      })
      .then(() => {
        console.log("Task moved successfully");
      })
      .catch((error) => {
        console.error("Error moving task:", error);
      });
  };
  

  const handleTaskAdded = (newTask) => {
    setData((prevData) => ({
      ...prevData,
      tasks: [...prevData.tasks, newTask],
      columns: {
        ...prevData.columns,
        "To Do": [...prevData.columns["To Do"], newTask.id],
      },
    }));
  };

  const getTaskById = (id) => data.tasks.find((task) => task.id === id);

  if (loading) return <p>Loading...</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", gap: "1rem" }}>
        {Object.keys(data.columns).map((column) => (
          <Column key={column} name={column} tasks={data.columns[column]} moveTask={moveTask} getTaskById={getTaskById} />
        ))}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem", backgroundColor: "green", color: "white", border: "none", borderRadius: "4px" }}
      >
        + Add Task
      </button>
      {isModalOpen && (
        <AddTaskModal onClose={() => setIsModalOpen(false)} onTaskAdded={handleTaskAdded} />
      )}
    </DndProvider>
  );
}

function Column({ name, tasks, moveTask, getTaskById }) {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => moveTask(item.id, item.column, name),
  });

  return (
    <div ref={drop} style={{ border: "1px solid black", padding: "1rem", width: "200px" }}>
      <h3>{name}</h3>
      {tasks.map((taskId) => (
        <Task key={taskId} id={taskId} column={name} getTaskById={getTaskById} />
      ))}
    </div>
  );
}

function Task({ id, column, getTaskById }) {
  const [, drag] = useDrag({
    type: "TASK",
    item: { id, column },
  });

  const task = getTaskById(id);

  return (
    <div
      ref={drag}
      style={{ padding: "0.5rem", border: "1px solid gray", marginBottom: "0.5rem" }}
    >
      <strong>{task?.name}</strong>
      <p style={{ fontSize: "0.85rem", color: "gray" }}>Assigned to: {task?.assignedTo}</p>
    </div>
  );
}

function AddTaskModal({ onClose, onTaskAdded }) {
  const [taskName, setTaskName] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleAddTask = async () => {
    if (!taskName || !assignedTo) {
      alert("Please fill in all fields.");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      name: taskName,
      assignedTo: assignedTo,
      status: "To Do",
    };

    try {
      await axios.post("http://localhost:3001/api/tasks", newTask);
      onTaskAdded(newTask);
      onClose();
      setTaskName("");
      setAssignedTo("");
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task.");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px" }}>
        <h2>Add New Task</h2>
        <input
          type="text"
          placeholder="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <input
          type="text"
          placeholder="Assign to"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          style={{ display: "block", marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
        />
        <button onClick={handleAddTask} style={{ padding: "0.5rem 1rem", backgroundColor: "blue", color: "white", border: "none", borderRadius: "4px", marginRight: "0.5rem" }}>Add Task</button>
        <button onClick={onClose} style={{ padding: "0.5rem 1rem", backgroundColor: "gray", color: "white", border: "none", borderRadius: "4px" }}>Cancel</button>
      </div>
    </div>
  );
}
