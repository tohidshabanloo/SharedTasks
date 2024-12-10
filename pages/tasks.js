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
            <div
                ref={drag}
                style={{
                    opacity: isDragging ? 0.5 : 1,
                    padding: '10px',
                    marginBottom: '10px',
                    backgroundColor: '#f4f4f4',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    cursor: 'move',
                    direction: 'rtl', // Right-to-left for Farsi
                }}
            >
                {task.name} {/* Directly using Farsi task name */}
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
                    padding: '20px',
                    margin: '0 10px',
                    backgroundColor: isOver ? '#e0e0e0' : '#fafafa',
                    minHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    direction: 'rtl', // Right-to-left for Farsi
                }}
            >
                <h3 style={{ textAlign: 'center', color: '#333', fontSize: '1.2rem' }}>
                    {children} {/* Using Farsi header text */}
                </h3>
            </div>
        );
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '20px',
                    backgroundColor: '#f7f7f7',
                    minHeight: '100vh',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    direction: 'rtl', // Right-to-left for Farsi
                }}
            >
                <DropZone column="all" onDrop={moveTask}>
                    {/* Farsi header for All Tasks */}
                    تمام کارها
                    {tasks.all.map((task) => (
                        <DraggableTask key={task.id} task={task} column="all" />
                    ))}
                </DropZone>

                <DropZone column="inProgress" onDrop={moveTask}>
                    {/* Farsi header for In Progress */}
                    در حال انجام
                    {tasks.inProgress.map((task) => (
                        <DraggableTask key={task.id} task={task} column="inProgress" />
                    ))}
                </DropZone>

                <DropZone column="done" onDrop={moveTask}>
                    {/* Farsi header for Done */}
                    انجام شده
                    {tasks.done.map((task) => (
                        <DraggableTask key={task.id} task={task} column="done" />
                    ))}
                </DropZone>
            </div>
        </DndProvider>
    );
}
