import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'TASK';

export default function Tasks() {
    const [tasks, setTasks] = useState({ all: [], inProgress: [], done: [] });
    const [newTaskInput, setNewTaskInput] = useState(''); // Local state for new task input
    const [taskToEdit, setTaskToEdit] = useState(null);  // Store task being edited
    const [modalOpen, setModalOpen] = useState(false);  // Modal state for editing
    const [isAddModal, setIsAddModal] = useState(false);  // State to distinguish Add vs Edit modal
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

    const addTask = (column) => {
        if (newTaskInput.trim()) {
            const newTaskObj = {
                id: new Date().toISOString(), // Unique ID
                name: newTaskInput.trim(),
            };

            const updatedTasks = { ...tasks };
            updatedTasks[column].push(newTaskObj);
            setTasks(updatedTasks);
            setNewTaskInput('');  // Clear the input after adding the task
            setModalOpen(false);  // Close modal after task is added
        }
    };

    const editTask = (task, column) => {
        setTaskToEdit({ ...task, column });  // Set task to edit with the column information
        setModalOpen(true);  // Open the modal
        setIsAddModal(false); // Set the modal as an edit modal
    };

    const saveEditedTask = () => {
        if (taskToEdit && taskToEdit.name.trim()) {
            const updatedTasks = { ...tasks };

            // Update task in the correct column
            updatedTasks[taskToEdit.column] = updatedTasks[taskToEdit.column].map((task) =>
                task.id === taskToEdit.id ? { ...task, name: taskToEdit.name } : task
            );

            setTasks(updatedTasks);  // Set the updated tasks
            setModalOpen(false);  // Close the modal
            setTaskToEdit(null);  // Reset taskToEdit
        } else {
            console.error('Invalid task or task name.');
        }
    };

    const deleteTask = (task, column) => {
        const updatedTasks = { ...tasks };
        updatedTasks[column] = updatedTasks[column].filter((t) => t.id !== task.id);
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
                {task.name}
                <div>
                    <button onClick={() => editTask(task, column)} style={{ margin: '5px' }}>
                        ویرایش
                    </button>
                    <button onClick={() => deleteTask(task, column)} style={{ margin: '5px' }}>
                        حذف
                    </button>
                </div>
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
                <button
                    onClick={() => {
                        setIsAddModal(true);  // Open the add task modal
                        setModalOpen(true);  // Open the modal
                    }}
                    style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        marginBottom: '10px',
                    }}
                >
                    اضافه کردن کار
                </button>
                {tasks[column].map((task) => (
                    <DraggableTask key={task.id} task={task} column={column} />
                ))}
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
                </DropZone>

                <DropZone column="inProgress" onDrop={moveTask}>
                    {/* Farsi header for In Progress */}
                    در حال انجام
                </DropZone>

                <DropZone column="done" onDrop={moveTask}>
                    {/* Farsi header for Done */}
                    انجام شده
                </DropZone>
            </div>

            {/* Modal for adding/editing task */}
            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            width: '400px',
                            textAlign: 'center',
                        }}
                    >
                        <h3>{isAddModal ? 'اضافه کردن کار' : 'ویرایش کار'}</h3>
                        <input
                            type="text"
                            value={isAddModal ? newTaskInput : taskToEdit?.name}
                            onChange={(e) => {
                                if (isAddModal) {
                                    setNewTaskInput(e.target.value);  // For Add Task modal
                                } else {
                                    setTaskToEdit({ ...taskToEdit, name: e.target.value });  // For Edit Task modal
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                marginBottom: '20px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                            }}
                        />
                        <button
                            onClick={() => {
                                if (isAddModal) {
                                    addTask('all');  // Add to 'all' column
                                } else {
                                    saveEditedTask();  // Save the edited task
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                            }}
                        >
                            {isAddModal ? 'اضافه کردن' : 'ذخیره'}
                        </button>
                        <button
                            onClick={() => setModalOpen(false)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                marginLeft: '10px',
                            }}
                        >
                            بستن
                        </button>
                    </div>
                </div>
            )}
        </DndProvider>
    );
}
