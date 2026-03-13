'use client';
import { getCurrentUser, logoutUser, getProfiles, addProfile, deleteProfile, getRecords, deleteRecord, Profile } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { updateProfileLanguage } from '@/lib/store';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const QUOTES = [
  "Your body is doing extraordinary things for you — right now. 🌿",
  "Every breath is a small miracle. You are stronger than you know. ☀️",
  "Health is a journey of self-love, not a destination to reach. 🌸",
  "Be gentle with yourself. Healing takes time and that is beautiful. 🍃",
  "You are worthy of care, rest, and nourishment. Always. 💚",
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', relation: '', dob: '' });
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [records, setRecords] = useState<ReturnType<typeof getRecords>>([]);
  const [selectedRecord, setSelectedRecord] = useState<ReturnType<typeof getRecords>[0] | null>(null);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.replace('/auth'); return; }
    setUser(u);
    const ps = getProfiles(u.id);
    // Auto-create self profile if none
    if (ps.length === 0) {
      const self = addProfile(u.id, u.username, t('self'), '');
      setProfiles([self]);
      setActiveProfile(self);
      setRecords(getRecords(self.id));
    } else {
      setProfiles(ps);
      setActiveProfile(ps[0]);
      setRecords(getRecords(ps[0].id));
      if (ps[0].preferredLanguage) {
        setLanguage(ps[0].preferredLanguage as any);
      }
    }
  }, [router]);

  const switchProfile = (p: Profile) => {
    setActiveProfile(p);
    setRecords(getRecords(p.id));
    if (p.preferredLanguage) {
      setLanguage(p.preferredLanguage as any);
    }
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const p = addProfile(user.id, newProfile.name, newProfile.relation, newProfile.dob);
    const updated = [...profiles, p];
    setProfiles(updated);
    setActiveProfile(p);
    setRecords([]);
    setShowAddProfile(false);
    setNewProfile({ name: '', relation: '', dob: '' });

    // Set new profile's default language to the current app default
    updateProfileLanguage(user.id, p.id, language);
  };

  const handleDeleteProfile = (id: string) => {
    if (!user || profiles.length === 1) return;
    deleteProfile(user.id, id);
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    setActiveProfile(updated[0]);
    setRecords(getRecords(updated[0].id));
    if (updated[0].preferredLanguage) {
      setLanguage(updated[0].preferredLanguage as any);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (!activeProfile) return;
    deleteRecord(activeProfile.id, id);
    setRecords(getRecords(activeProfile.id));
    if (selectedRecord?.id === id) setSelectedRecord(null);
  };

  const handleSignOut = () => { logoutUser(); router.replace('/auth'); };

  // Persist language changes to the active profile automatically
  useEffect(() => {
    if (user && activeProfile) {
      updateProfileLanguage(user.id, activeProfile.id, language);

      // Update local state without trigering unnecessary re-renders
      setProfiles(prev => prev.map(p =>
        p.id === activeProfile.id ? { ...p, preferredLanguage: language } : p
      ));
    }
  }, [language, activeProfile?.id, user?.id]);

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Zen bg */}
      <div className="zen-bg">
        <div className="zen-orb" style={{ width: 500, height: 500, background: 'var(--zen-sage-light)', top: '-15%', right: '-10%', opacity: 0.2, animationDuration: '18s' }} />
        <div className="zen-orb" style={{ width: 350, height: 350, background: 'var(--zen-sand)', bottom: '-5%', left: '-8%', opacity: 0.25, animationDuration: '14s', animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(245,240,232,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(212,201,176,0.4)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--zen-sage), #5a8060)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>🌿</span>
            </div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: 'var(--zen-dark)' }}>ArogyaAI</span>
          </div>
          <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <LanguageSwitcher />
            <Link href={`/sanctuary${activeProfile ? `?profileId=${activeProfile.id}` : ''}`} style={{ padding: '7px 16px', borderRadius: 10, background: 'transparent', color: 'var(--zen-brown)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', border: '1.5px solid transparent' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--zen-warm)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>🧘 {t('sanctuary')}</Link>
            <Link href="/profile" style={{ padding: '7px 16px', borderRadius: 10, background: 'transparent', color: 'var(--zen-brown)', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s', border: '1.5px solid transparent' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--zen-warm)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>👤 {t('profile')}</Link>
            <button onClick={handleSignOut} className="btn-ghost" style={{ padding: '7px 16px', fontSize: 14 }}>{t('sign_out')}</button>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        {/* Greeting */}
        <div className="fade-in" style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--zen-dark)', marginBottom: 4 }}>
            {(() => {
              const hour = new Date().getHours();
              if (hour >= 5 && hour < 12) return `${t('good_morning')}, ${user.username} ☀️`;
              if (hour >= 12 && hour < 17) return `${t('good_afternoon')}, ${user.username} 🌿`;
              if (hour >= 17 && hour < 22) return `${t('good_evening')}, ${user.username} 🌙`;
              return `${t('hello')}, ${user.username}`;
            })()}
          </h1>
          <p style={{ color: 'var(--zen-muted)', fontSize: 15 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quote card */}
        <div className="glass-card fade-in-delay" style={{ padding: '20px 24px', marginBottom: 28, borderLeft: '4px solid var(--zen-sage)' }}>
          <p style={{ fontSize: 15, color: 'var(--zen-dark)', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>{quote}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* Profiles sidebar */}
          <div className="fade-in">
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--zen-dark)' }}>{t('family_profiles')}</h3>
                <button onClick={() => setShowAddProfile(true)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--zen-sage)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              {profiles.map(p => (
                <div key={p.id} onClick={() => switchProfile(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', marginBottom: 6, background: activeProfile?.id === p.id ? 'var(--zen-sage-light)' : 'transparent', transition: 'all 0.2s', border: activeProfile?.id === p.id ? '1.5px solid var(--zen-sage)' : '1.5px solid transparent' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${p.name.charCodeAt(0) * 5 % 360}, 40%, 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--zen-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--zen-muted)' }}>{p.relation}</div>
                  </div>
                  {profiles.length > 1 && (
                    <button onClick={ev => { ev.stopPropagation(); handleDeleteProfile(p.id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--zen-muted)', cursor: 'pointer', fontSize: 16, padding: 2 }}>×</button>
                  )}
                </div>
              ))}
              {showAddProfile && (
                <form onSubmit={handleAddProfile} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input className="zen-input" placeholder="Name" required value={newProfile.name} onChange={e => setNewProfile(p => ({ ...p, name: e.target.value }))} style={{ fontSize: 13, padding: '9px 12px' }} />
                  <input className="zen-input" placeholder="Relation (e.g. Mother)" value={newProfile.relation} onChange={e => setNewProfile(p => ({ ...p, relation: e.target.value }))} style={{ fontSize: 13, padding: '9px 12px' }} />
                  <input className="zen-input" type="date" required value={newProfile.dob} onChange={e => setNewProfile(p => ({ ...p, dob: e.target.value }))} style={{ fontSize: 13, padding: '9px 12px' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>Add</button>
                    <button type="button" className="btn-ghost" onClick={() => setShowAddProfile(false)} style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>

            {/* Account section removed per requirements */}
          </div>

          {/* Main content */}
          <div className="fade-in-delay">
            {/* Upload button */}
            <Link href={activeProfile ? `/upload?profileId=${activeProfile.id}` : '#'}
              style={{ display: 'block', marginBottom: 24, textDecoration: 'none' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--zen-sage) 0%, #4a7050 100%)', borderRadius: 20, padding: '28px 32px', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 8px 32px rgba(124,154,126,0.3)', display: 'flex', alignItems: 'center', gap: 20 }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(124,154,126,0.4)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(124,154,126,0.3)'; }}>
                <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.25)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>📄</div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 4 }}>{t('upload_record')}</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('upload_desc')} {activeProfile?.name || 'you'}</p>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>→</div>
              </div>
            </Link>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[{ id: 'records', icon: '📋', label: t('records'), value: records.length, onClick: () => setShowGallery(true) },
              { id: 'sanctuary', icon: '🧘', label: t('sanctuary'), value: t('open_sanctuary'), link: `/sanctuary${activeProfile ? `?profileId=${activeProfile.id}` : ''}` },
              { id: 'vault', icon: '📔', label: 'Journal', value: t('vault'), link: `/sanctuary${activeProfile ? `?profileId=${activeProfile.id}` : ''}#journal` }].map(s => {
                const CardContent = (
                  <div className="glass-card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', height: '100%' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'none')}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--zen-dark)', marginBottom: 2 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--zen-muted)', fontWeight: 500 }}>{s.label}</div>
                  </div>
                );
                return s.link ? (
                  <Link key={s.id} href={s.link} style={{ textDecoration: 'none' }}>{CardContent}</Link>
                ) : (
                  <div key={s.id} onClick={s.onClick} style={{ textDecoration: 'none' }}>{CardContent}</div>
                );
              })}
            </div>

            {/* Records list */}
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--zen-dark)', marginBottom: 16 }}>
                {t('recent_records')} — {activeProfile?.name}
              </h3>
              {records.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--zen-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                  <p style={{ fontSize: 15 }}>No records yet. Upload your first document!</p>
                </div>
              ) : [...records].reverse().map(r => (
                <div key={r.id}
                  onClick={() => r.fileData && setSelectedRecord(r)}
                  style={{ padding: '16px', borderRadius: 14, background: 'var(--zen-warm)', marginBottom: 12, border: '1px solid var(--zen-sand)', cursor: r.fileData ? 'pointer' : 'default', transition: 'transform 0.2s', ... (r.fileData ? { ':hover': { transform: 'translateY(-2px)' } } : {}) }}
                  onMouseOver={e => { if (r.fileData) (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--zen-dark)', fontSize: 14 }}>{r.hospitalName || 'Health Visit'}</span>
                      {r.doctorName && <span style={{ fontSize: 12, color: 'var(--zen-muted)', marginLeft: 8 }}>Dr. {r.doctorName}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, color: 'var(--zen-muted)' }}>{new Date(r.dateOfVisit).toLocaleDateString('en-IN')}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(r.id); }} style={{ background: 'rgba(196,145,122,0.1)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--zen-rose)', fontSize: 12, transition: 'all 0.2s' }}
                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(196,145,122,0.2)')}
                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(196,145,122,0.1)')}>🗑️</button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--zen-dark)', lineHeight: 1.6 }}>{r.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Delete Account Modal Removed */}
      </main>

      {/* Document Viewer Modal with OCR Details */}
      {selectedRecord && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: 24 }}>
          <div style={{ background: 'var(--zen-warm)', borderRadius: 20, width: '100%', maxWidth: 1000, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--zen-sand)' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--zen-dark)' }}>{selectedRecord.hospitalName || 'Health Document'}</h3>
                <p style={{ fontSize: 13, color: 'var(--zen-muted)' }}>{new Date(selectedRecord.dateOfVisit).toLocaleDateString('en-IN')} {selectedRecord.doctorName ? `· Dr. ${selectedRecord.doctorName}` : ''}</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} style={{ background: 'none', border: 'none', fontSize: 28, color: 'var(--zen-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
              {/* Left Column: OCR Summary */}
              <div style={{ width: '40%', minWidth: 320, borderRight: '1px solid var(--zen-sand)', overflowY: 'auto', padding: 20, background: 'rgba(253,252,249,0.5)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--zen-sage)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Extracted Details</h4>
                {selectedRecord.summary.split('\n').map((line, idx) => {
                  const parts = line.split(':');
                  if (parts.length < 2) return null;
                  const key = parts[0].trim();
                  const val = parts.slice(1).join(':').trim();
                  if (!val || val === '—') return null;

                  // Map to user-friendly titles and icons
                  const map: Record<string, { icon: string, title: string, accent: string }> = {
                    patientInfo: { icon: '🧑‍⚕️', title: 'Patient Info', accent: '#7c9a7e' },
                    doctor: { icon: '👨‍⚕️', title: 'Doctor / Clinic', accent: '#8b7355' },
                    chiefComplaint: { icon: '🤕', title: 'Chief Complaint', accent: '#c4917a' },
                    diagnosis: { icon: '🩺', title: 'Diagnosis', accent: '#7c9a7e' },
                    investigations: { icon: '🔬', title: 'Investigations', accent: '#9e9185' },
                    advice: { icon: '💊', title: 'Advice / Rx', accent: '#7c9a7e' },
                  };
                  const meta = map[key] || { icon: '📄', title: key, accent: '#aaa' };

                  return (
                    <div key={idx} style={{ marginBottom: 16, background: 'white', borderRadius: 12, border: '1px solid var(--zen-sand)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                      <div style={{ height: 3, background: `linear-gradient(90deg, ${meta.accent}, ${meta.accent}88)` }} />
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 16 }}>{meta.icon}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: meta.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{meta.title}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--zen-dark)', lineHeight: 1.6 }}>{val}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Original Image/PDF View */}
              <div style={{ flex: 1, background: '#eaf0ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflow: 'auto' }}>
                {selectedRecord.fileData ? (
                  selectedRecord.fileData.startsWith('data:application/pdf') ? (
                    <iframe src={selectedRecord.fileData} style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }} />
                  ) : (
                    <img src={selectedRecord.fileData} alt="Document" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  )
                ) : (
                  <div style={{ color: 'var(--zen-muted)', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
                    <p>Document image not available for this record.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Records Gallery Modal */}
      {showGallery && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,240,232,0.95)', backdropFilter: 'blur(8px)', padding: 32 }}>
          <div style={{ width: '100%', maxWidth: 1100, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--zen-dark)' }}>All Records</h2>
                <p style={{ fontSize: 15, color: 'var(--zen-muted)' }}>{activeProfile?.name}'s document history</p>
              </div>
              <button onClick={() => setShowGallery(false)} style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid var(--zen-sand)', fontSize: 24, color: 'var(--zen-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
              {records.filter(r => r.fileData).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--zen-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                  <p style={{ fontSize: 16 }}>No documents available in the gallery yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {[...records].filter(r => r.fileData).reverse().map(r => (
                    <div key={r.id} onClick={() => setSelectedRecord(r)} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--zen-sand)', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}
                      onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                      onMouseOut={e => (e.currentTarget.style.transform = 'none')}>
                      <div style={{ height: 200, background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--zen-sand)' }}>
                        {r.fileData?.startsWith('data:application/pdf') ? (
                          <div style={{ fontSize: 48 }}>📄</div>
                        ) : (
                          <img src={r.fileData} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ minWidth: 0, paddingRight: 8 }}>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--zen-dark)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.hospitalName || 'Health Visit'}</h4>
                          <p style={{ fontSize: 13, color: 'var(--zen-muted)' }}>{new Date(r.dateOfVisit).toLocaleDateString('en-IN')}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRecord(r.id); }} style={{ background: 'rgba(196,145,122,0.1)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--zen-rose)', fontSize: 13, transition: 'all 0.2s', flexShrink: 0 }}
                          onMouseOver={e => (e.currentTarget.style.background = 'rgba(196,145,122,0.2)')}
                          onMouseOut={e => (e.currentTarget.style.background = 'rgba(196,145,122,0.1)')}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
