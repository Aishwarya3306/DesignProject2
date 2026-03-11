'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser, setCurrentUser } from '@/lib/store';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const user = loginUser(email, password);
        setCurrentUser(user);
        router.replace('/dashboard');
      } else {
        const user = registerUser(email, password, username || email.split('@')[0]);
        setCurrentUser(user);
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Zen background */}
      <div className="zen-bg">
        <div className="zen-orb" style={{ width: 400, height: 400, background: 'var(--zen-sage-light)', top: '-5%', right: '-5%', opacity: 0.3, animationDuration: '15s' }} />
        <div className="zen-orb" style={{ width: 300, height: 300, background: 'var(--zen-sand)', bottom: '-10%', left: '-5%', opacity: 0.25, animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 440, padding: 40, zIndex: 1, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--zen-sage), #5a8060)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: 24 }}>🌿</span>
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: 'var(--zen-dark)', marginBottom: 8 }}>
            ArogyaAI
          </h1>
          <p style={{ color: 'var(--zen-muted)', fontSize: 15 }}>
            {isLogin ? 'Welcome back to your sanctuary.' : 'Begin your healing journey.'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 14, marginBottom: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--zen-dark)', marginBottom: 6 }}>Name</label>
              <input 
                className="zen-input" 
                placeholder="Your name" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--zen-dark)', marginBottom: 6 }}>Email</label>
            <input 
              className="zen-input" 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--zen-dark)', marginBottom: 6 }}>Password</label>
            <input 
              className="zen-input" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 8, padding: '12px 0', fontSize: 15 }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--zen-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--zen-sage)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
