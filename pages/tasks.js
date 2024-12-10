import { useEffect, useState } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            const res = await axios.get('http://localhost:5000/api/tasks');
            setTasks(res.data);
        };
        fetchTasks();
    }, []);

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const updatedTasks = [...tasks];
        const [removed] = updatedTasks.splice(result.source.index, 1);
        removed.status = result.destination.droppableId;
        updatedTasks.splice(result.destination.index, 0, removed);

        setTasks(updatedTasks);
        await axios.put('http://localhost:5000/api/tasks', updatedTasks);
    };

    const columns = {
        all: tasks.filter((task) => task.status === 'all'),
        'in-progress': tasks.filter((task) => task.status === 'in-progress'),
        done: tasks.filter((task) => task.status === 'done'),
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {Object.keys(columns).map((columnId) => (
                    <Droppable key={columnId} droppableId={columnId}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                style={{ margin: '0 10px', width: '30%', minHeight: '200px', border: '1px solid black' }}
                            >
                                <h2>{columnId.replace('-', ' ')}</h2>
                                {columns[columnId].map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{
                                                    padding: '10px',
                                                    margin: '10px 0',
                                                    border: '1px solid gray',
                                                    backgroundColor: 'white',
                                                    ...provided.draggableProps.style,
                                                }}
                                            >
                                                {task.content}
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
    );
}
