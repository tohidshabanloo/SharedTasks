import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '../lib/supabaseClient';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigned_to: '' });

  // Fetch tasks from Supabase (updated to use 'shared_tasks' table)
  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase.from('shared_tasks').select('*');
      if (error) {
        console.error(error.message);
      } else if (data && Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Unexpected data format:', data);
      }
    };
    fetchTasks();
  }, []);

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const updatedTasks = reorder(
        tasks.filter((task) => task.status === source.droppableId),
        source.index,
        destination.index
      );
      const remainingTasks = tasks.filter((task) => task.status !== source.droppableId);
      setTasks([...remainingTasks, ...updatedTasks]);
    } else {
      const task = tasks[source.index];
      task.status = destination.droppableId;

      // Update the task status in Supabase (use 'shared_tasks' table)
      const { error } = await supabase
        .from('shared_tasks')
        .update({ status: task.status })
        .eq('id', task.id);

      if (error) {
        console.error(error.message);
      }

      const updatedTasks = tasks.map((t) =>
        t.id === task.id ? { ...t, status: task.status } : t
      );
      setTasks(updatedTasks);
    }
  };

  const addTask = async () => {
    if (newTask.title.trim()) {
      const taskWithDefaultStatus = {
        ...newTask,
        status: 'todo', // Default status
      };

      // Insert task into Supabase
      const { data, error } = await supabase
        .from('shared_tasks')
        .insert([taskWithDefaultStatus]);

      if (error) {
        console.error('Error adding task:', error.message);
      } else {
        console.log('Task added:', data); // Debugging line

        // If data is an array, set it in the state
        if (Array.isArray(data)) {
          setTasks((prevTasks) => [...prevTasks, ...data]);
        } else {
          // If data is an object, handle it accordingly
          console.error('Unexpected response format:', data);
        }

        // Reset the newTask form
        setNewTask({ title: '', description: '', assigned_to: '' });
      }
    } else {
      console.log('Title is required');
    }
  };




  const deleteTask = async (taskId) => {
    const { error } = await supabase
      .from('shared_tasks')
      .delete()
      .eq('id', taskId);
    if (error) {
      console.error(error.message);
    } else {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const columns = {
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Kanban Board</h1>

      {/* Task Input */}
      <div>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Assigned to"
          value={newTask.assigned_to}
          onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {Object.keys(columns).map((columnKey) => (
            <Droppable droppableId={columnKey} key={columnKey}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    width: '30%',
                    minHeight: '400px',
                    padding: '10px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                  }}
                >
                  <h2>{columns[columnKey]}</h2>
                  {tasks
                    .filter((task) => task.status === columnKey)
                    .map((task, index) => (
                      <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              padding: '10px',
                              margin: '5px 0',
                              backgroundColor: '#fff',
                              borderRadius: '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                            }}
                          >
                            <p><strong>{task.title}</strong></p>
                            <p>Assigned to: {task.assigned_to}</p>
                            <button onClick={() => deleteTask(task.id)}>Delete</button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
