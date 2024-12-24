import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({});
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '' });
  const [newColumn, setNewColumn] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: taskData, error: taskError } = await supabase
        .from('shared_tasks')
        .select('*')
        .order('id');

      if (taskError) throw taskError;

      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('*')
        .order('id');

      if (columnError) throw columnError;

      setTasks(taskData || []);
      setColumns(
        columnData.reduce((acc, column) => {
          acc[column.id] = column.title;
          return acc;
        }, {})
      );
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const taskToMove = tasks[source.index];
    const updatedTasks = tasks.map((task) =>
      task.id === taskToMove.id ? { ...task, status: destination.droppableId } : task
    );

    setTasks(updatedTasks);

    try {
      const { error } = await supabase
        .from('shared_tasks')
        .update({ status: destination.droppableId })
        .eq('id', taskToMove.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating task:', err.message);
      fetchData();
    }
  };

  const addTask = async () => {
    if (newTask.title.trim()) {
      const taskWithDefaultStatus = {
        ...newTask,
        status: Object.keys(columns)[0] || 'todo',
      };

      try {
        const { data, error } = await supabase
          .from('shared_tasks')
          .insert([taskWithDefaultStatus])
          .select();

        if (error) throw error;

        setTasks((prevTasks) => [...prevTasks, ...data]);
        setNewTask({ title: '', assigned_to: '' });
      } catch (error) {
        console.error('Error adding task:', error.message);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase.from('shared_tasks').delete().eq('id', taskId);

      if (error) throw error;

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error.message);
    }
  };

  const updateColumn = async (columnId, newTitle) => {
    try {
      const { error } = await supabase.from('columns').update({ title: newTitle }).eq('id', columnId);

      if (error) throw error;

      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: newTitle,
      }));
    } catch (error) {
      console.error('Error updating column title:', error.message);
    }
  };

  const addColumn = async () => {
    if (newColumn.trim()) {
      try {
        const { data, error } = await supabase
          .from('columns')
          .insert([{ title: newColumn }])
          .select();

        if (error) throw error;

        const newColumnData = data[0];
        setColumns((prevColumns) => ({
          ...prevColumns,
          [newColumnData.id]: newColumnData.title,
        }));
        setNewColumn('');
      } catch (error) {
        console.error('Error adding column:', error.message);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Shared Task Board</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <input
          type="text"
          placeholder="Assigned to"
          value={newTask.assigned_to}
          onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
          style={{ marginRight: '10px' }}
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="New column title"
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={addColumn}>Add Column</button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {Object.entries(columns).map(([columnId, columnTitle]) => (
            <div key={columnId} style={{ flex: 1 }}>
              <input
                type="text"
                value={columnTitle}
                onChange={(e) => updateColumn(columnId, e.target.value)}
                style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}
              />
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? '#e1e1e1' : '#f0f0f0',
                      padding: '10px',
                      borderRadius: '4px',
                      minHeight: '500px',
                    }}
                  >
                    {tasks
                      .filter((task) => task.status === columnId)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging ? '#f8f8f8' : 'white',
                                padding: '16px',
                                margin: '0 0 8px 0',
                                borderRadius: '4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                              }}
                            >
                              <h3>{task.title}</h3>
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
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
