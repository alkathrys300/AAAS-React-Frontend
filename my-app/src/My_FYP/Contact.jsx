import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
    const navigate = useNavigate();
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSending(false);
            setSuccess(true);
            setFormData({ ...formData, subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        }, 1500);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const styles = {
        container: { minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Inter', sans-serif" },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.2)' },
        logo: { display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' },
        nav: { display: 'flex', gap: '10px', alignItems: 'center' },
        navLink: { color: 'white', fontWeight: '500', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', transition: 'all 0.3s' },
        navLinkActive: { background: 'rgba(255,255,255,0.25)', fontWeight: '600' },
        userMenu: { display: 'flex', alignItems: 'center', gap: '12px', color: 'white', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/userpage')}> AAAS</div>
                <nav style={styles.nav}>
                    <div style={styles.navLink} onClick={() => navigate('/userpage')}> Home</div>
                    <div style={styles.navLink} onClick={() => navigate('/classes')}> Classes</div>
                    <div style={styles.navLink} onClick={() => navigate('/analytics')}> Analytics</div>
                    <div style={{ ...styles.navLink, ...styles.navLinkActive }}> Contact</div>
                </nav>
                <div style={styles.userMenu} onClick={handleLogout}>
                    <span></span><span>{user?.name}</span><span style={{ fontSize: '0.8rem' }}>Logout</span>
                </div>
            </header>
            <main style={{ padding: '80px 40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', marginBottom: '20px' }}>Get in Touch</h1>
                    <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>Have a question or need assistance? We are here to help you succeed!</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '50px' }}>
                    {[
                        { icon: '', title: 'Email Us', text: 'support@aaas.edu.my', sub: 'Response within 24 hours' },
                        { icon: '', title: 'Call Us', text: '+60 12-345 6789', sub: 'Mon-Fri, 8AM-5PM' },
                        { icon: '', title: 'Visit Us', text: 'Faculty of Computing', sub: 'Universiti Malaysia Pahang, 26600 Pekan' }
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', boxShadow: '0 10px 30px rgba(102,126,234,0.4)', fontSize: '2.5rem' }}>{item.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '15px' }}>{item.title}</h3>
                            <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: '600', marginBottom: '8px' }}>{item.text}</p>
                            <p style={{ fontSize: '0.95rem', color: '#9ca3af' }}>{item.sub}</p>
                        </div>
                    ))}
                </div>
                <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '50px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxWidth: '800px', margin: '0 auto' }}>
                    {success ? (
                        <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', fontSize: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(16,185,129,0.4)' }}></div>
                            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>Message Sent Successfully!</h3>
                            <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '30px' }}>Thank you for reaching out. We will get back to you as soon as possible.</p>
                            <button style={{ padding: '15px 35px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }} onClick={() => setSuccess(false)}>Send Another Message</button>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '2.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '10px' }}>Send us a Message</h2>
                                <p style={{ fontSize: '1.05rem', color: '#6b7280' }}>Fill out the form below and our team will respond promptly</p>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px', textTransform: 'uppercase' }}>Name</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '15px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#667eea'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} placeholder="Your full name" required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px', textTransform: 'uppercase' }}>Email</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '15px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#667eea'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} placeholder="you@example.com" required />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px', textTransform: 'uppercase' }}>Subject</label>
                                    <input type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={{ width: '100%', padding: '15px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#667eea'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} placeholder="How can we help?" required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '10px', textTransform: 'uppercase' }}>Message</label>
                                    <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} style={{ width: '100%', padding: '15px 20px', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '1rem', minHeight: '150px', resize: 'vertical', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#667eea'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} placeholder="Please provide details..." required />
                                </div>
                                <button type="submit" disabled={sending} style={{ padding: '18px 40px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 30px rgba(102,126,234,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', width: '100%' }} onMouseEnter={e => !sending && (e.target.style.transform = 'scale(1.02)')} onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                                    {sending ? (<><span></span><span>Sending...</span></>) : (<><span>Send Message</span><span></span></>)}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
