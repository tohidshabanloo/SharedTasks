import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:3001/login", {
                username,
                password,
            });
            setError(""); // Clear any previous errors
            alert("Login successful!"); // Optional confirmation
            localStorage.setItem("username", username); // Save username in localStorage
            router.push("/"); // Redirect to index page
        } catch (err) {
            console.error("Login error:", err.response?.data);
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
