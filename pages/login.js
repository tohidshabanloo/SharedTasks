// pages/login.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // If token exists, redirect to the tasks page
            router.push('/tasks');
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', { username, password });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token); // Store JWT token
                router.push('/tasks'); // Redirect to tasks page after login
            } else {
                setError('نام کاربری یا رمز عبور اشتباه است');
            }
        } catch (error) {
            setError('خطا در برقراری ارتباط');
        }
    };

    return (
        <div style={{ textAlign: 'right', direction: 'rtl' }}>
            <h2>ورود به حساب کاربری</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>نام کاربری</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>رمز عبور</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">ورود</button>
            </form>
        </div>
    );
}
