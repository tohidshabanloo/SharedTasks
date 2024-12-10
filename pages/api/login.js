// pages/api/login.js
import jwt from 'jsonwebtoken';

const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
];

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Find the user with the given username
        const user = users.find((user) => user.username === username);

        // If user not found or password is incorrect, send error
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است' });
        }

        // If authentication is successful, generate JWT
        const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });

        // Send the token back to the client
        return res.status(200).json({ token });
    } else {
        // If method is not POST, return 405 Method Not Allowed
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}
