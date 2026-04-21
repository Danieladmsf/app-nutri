import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Preencha email e senha.');
    }

    try {
      setError('');
      setLoading(true);
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Usuário ou senha inválidos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Falha na autenticação: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: 'var(--bg-main)', padding: '20px', overflowY: 'auto' }}>
      <div className="card reveal-staggered" style={{ width: '100%', maxWidth: '360px', margin: 'auto', display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', boxShadow: '0 4px 12px rgba(27,61,47,0.2)' }}>
            <Lock size={20} color="white" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.2rem', letterSpacing: '-0.02em' }}>NutriApp</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {isRegistering ? 'Crie conta para começar' : 'Faça login para acessar'}
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 163, 115, 0.1)', color: 'var(--secondary)', padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600 }}>
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seunome@exemplo.com"
                style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mín. 6 caracteres"
                style={{ width: '100%', padding: '10px 10px 10px 36px', background: 'var(--bg-deep)', border: '1px solid var(--border-dim)', borderRadius: '6px', color: 'var(--text-main)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px', marginTop: '0.2rem', justifyContent: 'center', fontSize: '0.9rem', gap: '6px', borderRadius: '6px' }}
          >
            {loading ? 'Aguarde...' : isRegistering ? 'Criar Conta' : 'Entrar'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-dim)' }}></div>
          <span style={{ padding: '0 8px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>OU</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-dim)' }}></div>
        </div>

        <button 
          onClick={async () => {
            try {
              setError('');
              setLoading(true);
              await loginWithGoogle();
            } catch (err) {
              setError('Falha ao autenticar.');
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? 'Já tenho uma conta.' : 'Criar uma conta.'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
