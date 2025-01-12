import { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function KanbanBoard() {
  const [data, setData] = useState({ tasks: [], columns: { "To Do": [], "In Progress": [], "Done": [] } });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    axios.get("http://localhost:3001/api/tasks")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    if (fromColumn === toColumn) return;

    const updatedFrom = data.columns[fromColumn].filter((id) => id !== taskId);
    const updatedTo = [...data.columns[toColumn], taskId];

    setData({
      ...data,
      columns: { ...data.columns, [fromColumn]: updatedFrom, [toColumn]: updatedTo },
    });

    axios.post("http://localhost:3001/api/tasks/move", { taskId, fromColumn, toColumn });
  };

  const handleTaskAdded = (newTask) => {
    setData((prevData) => ({
      ...prevData,
      tasks: [...prevData.tasks, newTask],
      columns: { ...prevData.columns, "To Do": [...prevData.columns["To Do"], newTask.id] },
    }));
  };

  const handleTaskUpdated = (updatedTask) => {
    setData((prevData) => ({
      ...prevData,
      tasks: prevData.tasks.map((task) => task.id === updatedTask.id ? updatedTask : task),
    }));
  };

  const handleDeleteTask = (taskId) => {
    axios.delete(`http://localhost:3001/api/tasks/${taskId}`)
      .then(() => fetchTasks())
      .catch((error) => console.error("Error deleting task:", error));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", gap: "1rem" }}>
        {Object.keys(data.columns).map((column) => (
          <Column
            key={column}
            name={column}
            tasks={data.columns[column].map((id) => data.tasks.find((task) => task.id === id))}
            moveTask={moveTask}
            onEditTask={(task) => {
              setSelectedTask(task);
              setIsEditModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>
      <button onClick={() => setIsModalOpen(true)} style={{ marginTop: "1rem" }}>+ Add Task</button>

      {isModalOpen && <AddTaskModal onClose={() => setIsModalOpen(false)} onTaskAdded={handleTaskAdded} />}
      {isEditModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setIsEditModalOpen(false)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </DndProvider>
  );
}

function Column({ name, tasks, moveTask, onEditTask, onDeleteTask }) {
  const [, drop] = useDrop({ accept: "TASK", drop: (item) => moveTask(item.id, item.column, name) });

  return (
    <div ref={drop} style={{ border: "1px solid black", padding: "1rem", width: "200px" }}>
      <h3>{name}</h3>
      {tasks.map((task) => (
        <Task key={task.id} task={task} column={name} onEditTask={onEditTask} onDeleteTask={onDeleteTask} />
      ))}
    </div>
  );
}

function Task({ task, column, onEditTask, onDeleteTask }) {
  const [, drag] = useDrag({ type: "TASK", item: { id: task.id, column } });

  return (
    <div ref={drag} style={{ padding: "0.5rem", border: "1px solid gray", marginBottom: "0.5rem" }}>
      <p><strong>{task.name}</strong></p>
      <p>Assigned to: {task.assignedTo}</p>
      <button onClick={() => onEditTask(task)}>Edit</button>
      <button onClick={() => onDeleteTask(task.id)}>Delete</button>
    </div>
  );
}

function EditTaskModal({ task, onClose, onTaskUpdated }) {
  const [taskName, setTaskName] = useState(task.name);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo);

  const handleUpdateTask = () => {
    const updatedTask = { ...task, name: taskName, assignedTo };

    axios.put(`http://localhost:3001/api/tasks/${task.id}`, updatedTask)
      .then(() => {
        onTaskUpdated(updatedTask);
        onClose();
      })
      .catch((error) => console.error("Error updating task:", error));
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "white", padding: "2rem" }}>
        <h2>Edit Task</h2>
        <input value={taskName} onChange={(e) => setTaskName(e.target.value)} />
        <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
        <button onClick={handleUpdateTask}>Update</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
