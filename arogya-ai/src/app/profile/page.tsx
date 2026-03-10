'use client';
import { getCurrentUser, logoutUser } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace('/auth'); return; }
    setUser(u);
  }, [router]);

  const handleSignOut = () => { logoutUser(); router.replace('/auth'); };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="zen-bg">
        <div className="zen-orb" style={{ width: 500, height: 500, background: 'var(--zen-sage-light)', top: '-15%', right: '-10%', opacity: 0.2, animationDuration: '18s' }} />
      </div>

      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(212,201,176,0.4)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--zen-sage), #5a8060)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 18 }}>🌿</span>
              </div>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--zen-dark)' }}>ArogyaAI</span>
            </Link>
          </div>
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <LanguageSwitcher />
            <Link href="/dashboard" style={{ padding: '7px 16px', borderRadius: 10, background: 'transparent', color: 'var(--zen-brown)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', border: '1.5px solid transparent' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--zen-warm)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>← Dashboard</Link>
            <button onClick={handleSignOut} className="btn-ghost" style={{ padding: '7px 16px', fontSize: 14 }}>{t('sign_out')}</button>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 600, margin: '64px auto', width: '100%', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--zen-dark)', marginBottom: 24, textAlign: 'center' }}>Account {t('profile')}</h1>
        
        <div className="glass-card fade-in" style={{ padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--zen-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</h4>
            <div style={{ fontSize: 18, color: 'var(--zen-dark)', fontWeight: 500 }}>{user.username}</div>
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--zen-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</h4>
            <div style={{ fontSize: 16, color: 'var(--zen-dark)' }}>{user.email}</div>
          </div>

          <div style={{ borderTop: '1px solid rgba(212,201,176,0.5)', paddingTop: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--zen-rose)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Danger Zone</h4>
            <p style={{ fontSize: 14, color: 'var(--zen-muted)', marginBottom: 16 }}>Permanently erase your account, health records, journals, and all family profiles.</p>
            <button onClick={() => setShowDeleteConfirm(true)} style={{ background: 'var(--zen-rose)', color: 'white', border: 'none', borderRadius: 14, padding: '10px 20px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500, transition: 'opacity 0.2s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}>
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,51,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
            <div className="glass-card fade-in" style={{ padding: 32, maxWidth: 380, width: '100%', margin: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: 'var(--zen-dark)' }}>Delete Account?</h3>
              <p style={{ color: 'var(--zen-muted)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>Are you sure? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button style={{ flex: 1, background: 'var(--zen-rose)', color: 'white', border: 'none', borderRadius: 14, padding: '12px 0', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500 }}
                  onClick={() => { const { deleteAccount } = require('@/lib/store'); deleteAccount(user.id, user.email); router.replace('/auth'); }}>
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
