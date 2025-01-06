// frontend/pages/task/[id].js
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EditTask = () => {
    const [task, setTask] = useState(null);
    const [assignedUsers, setAssignedUsers] = useState([]);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) return;
        axios.get(`http://localhost:5000/api/tasks/${id}`)
            .then((res) => setTask(res.data));
    }, [id]);

    const handleSave = async () => {
        await axios.put(`http://localhost:5000/api/tasks/${task._id}`, task);
        router.push('/');
    };

    return task ? (
        <div>
            <h1>Edit Task</h1>
            <input value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} />
            <textarea value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} />
            <button onClick={handleSave}>Save</button>
        </div>
    ) : (
        <p>Loading...</p>
    );
};

export default EditTask;
