import { useState } from "react";
import axios from 'axios'

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:3001/auth/register', {email, password} )
            setMessage('User successfully registered')
        } catch (error) {
            setMessage('login failed')
        }
    }

    return (
        <div>
            <h2>Iniciar sesion</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
            {message && <p>{message}</p>}
        </div>

    )
}

export default Register