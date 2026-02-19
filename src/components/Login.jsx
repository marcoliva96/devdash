import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import '../index.css';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                onLogin(data.token);
            } else {
                setError(data.error || 'Credenciales inválidas');
            }
        } catch (err) {
            setError('Error de conexión. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <Sparkles size={32} />
                    </div>
                    <h1>DevDash</h1>
                    <p>Portfolio Manager</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuario"
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'} <Lock size={16} style={{ marginLeft: 8 }} />
                    </button>
                </form>
            </div>

            <style>{`
        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: var(--bg-body);
        }
        .login-card {
          background: var(--bg-card);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid var(--border-subtle);
          width: 100%;
          max-width: 400px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.1);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
        }
        .login-header h1 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--text-primary);
        }
        .login-header p {
          color: var(--text-secondary);
          margin: 0.5rem 0 0;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid var(--border-subtle);
          background: var(--bg-body);
          color: var(--text-primary);
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          border-color: var(--primary);
          outline: none;
        }
        .btn--full {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
          padding: 0.75rem;
        }
        .error-message {
          color: #ff4757;
          background: rgba(255, 71, 87, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>
        </div>
    );
}
