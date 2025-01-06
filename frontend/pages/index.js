import { useState } from 'react';
import axios from 'axios';
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const Home = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Task 1', status: 'todo' },
    { id: 2, title: 'Task 2', status: 'inProgress' },
    { id: 3, title: 'Task 3', status: 'done' },
  ]);

  const moveTask = (draggedId, targetStatus) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        if (task.id === draggedId) {
          return { ...task, status: targetStatus };
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const Task = ({ task }) => {
    const [, drag] = useDrag({
      type: 'task',
      item: { id: task.id },
    });

    return (
      <div ref={drag} className="task p-4 mb-3 bg-blue-500 text-white rounded-md shadow-md cursor-move hover:bg-blue-400">
        {task.title}
      </div>
    );
  };

  const Column = ({ status, children }) => {
    const [, drop] = useDrop({
      accept: 'task',
      drop: (item) => moveTask(item.id, status),
    });

    return (
      <div ref={drop} className="column flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md w-1/3">
        <h2 className="text-xl font-semibold text-gray-700 capitalize">{status}</h2>
        <div className="tasks w-full mt-4">{children}</div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board flex justify-between p-8 space-x-4">
        <Column status="todo">
          {tasks.filter((task) => task.status === 'todo').map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </Column>
        <Column status="inProgress">
          {tasks.filter((task) => task.status === 'inProgress').map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </Column>
        <Column status="done">
          {tasks.filter((task) => task.status === 'done').map((task) => (
            <Task key={task.id} task={task} />
          ))}
        </Column>
      </div>
    </DndProvider>
  );
};

export default Home;
