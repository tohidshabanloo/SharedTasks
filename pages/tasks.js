import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'TASK';

export default function Tasks() {
    const [tasks, setTasks] = useState({ all: [], inProgress: [], done: [] });
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/tasks');
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };
        fetchTasks();
    }, []);

    const moveTask = (task, sourceColumn, targetColumn) => {
        const updatedTasks = { ...tasks };
        updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter(
            (t) => t.id !== task.id
        );
        updatedTasks[targetColumn].push(task);
        setTasks(updatedTasks);
    };

    const DraggableTask = ({ task, column }) => {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: ItemType,
            item: { task, sourceColumn: column },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }));

        return (
            <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
                {task.name}
            </div>
        );
    };

    const DropZone = ({ children, column, onDrop }) => {
        const [{ isOver }, drop] = useDrop({
            accept: ItemType,
            drop: (item) => {
                onDrop(item.task, item.sourceColumn, column);
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        });

        return (
            <div
                ref={drop}
                style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: isOver ? '#e0e0e0' : 'transparent',
                    minHeight: '300px',
                }}
            >
                <h3>{children}</h3>
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div style={{ display: 'flex' }}>
                <DropZone column="all" onDrop={moveTask}>
                    All Tasks
                    {tasks.all.map((task) => (
                        <DraggableTask key={task.id} task={task} column="all" />
                    ))}
                </DropZone>

                <DropZone column="inProgress" onDrop={moveTask}>
                    In Progress
                    {tasks.inProgress.map((task) => (
                        <DraggableTask key={task.id} task={task} column="inProgress" />
                    ))}
                </DropZone>

                <DropZone column="done" onDrop={moveTask}>
                    Done
                    {tasks.done.map((task) => (
                        <DraggableTask key={task.id} task={task} column="done" />
                    ))}
                </DropZone>
            </div>
        </DndProvider>
    );
}
