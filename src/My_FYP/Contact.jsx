import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000';

export default function Contact() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [lecturers, setLecturers] = useState([]);
    const [loadingLecturers, setLoadingLecturers] = useState(true);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');

        if (!userData || !token) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Fetch lecturers if student
        if (parsedUser.role === 'student') {
            fetchLecturers(token);
        } else {
            setLoadingLecturers(false);
        }
    }, [navigate]);

    const fetchLecturers = async (token) => {
        try {
            // Get enrolled classes to find lecturers
            const response = await fetch(`${API_BASE}/classes/enrolled`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const classes = data.classes || [];

                // Extract unique lecturers
                const uniqueLecturers = [];
                const lecturerEmails = new Set();

                classes.forEach(cls => {
                    if (cls.lecturer_name && !lecturerEmails.has(cls.lecturer_name)) {
                        lecturerEmails.add(cls.lecturer_name);
                        uniqueLecturers.push({
                            name: cls.lecturer_name,
                            class: cls.class_name
                        });
                    }
                });

                setLecturers(uniqueLecturers);
            }
        } catch (error) {
            console.error('Error fetching lecturers:', error);
        } finally {
            setLoadingLecturers(false);
        }
    };

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
                    <h1 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'white', marginBottom: '20px' }}>📞 Get in Touch</h1>
                    <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>Have a question or need assistance? We are here to help you succeed!</p>
                </div>

                {/* Faculty Contact Information */}
                <div style={{ marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '30px' }}>🏛️ Faculty of Computing</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📞</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>GENERAL LINE</h3>
                            <p style={{ fontSize: '1.3rem', color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}>09 - 431 5011</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🎓</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>ACADEMIC LINE</h3>
                            <p style={{ fontSize: '1.3rem', color: '#3b82f6', fontWeight: '600', marginBottom: '5px' }}>09 - 431 5071</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📧</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>EMAIL ADDRESS</h3>
                            <a href="mailto:fk@umpsa.edu.my" style={{ fontSize: '1.1rem', color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>fk@umpsa.edu.my</a>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🕒</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>OFFICE HOUR</h3>
                            <p style={{ fontSize: '1rem', color: '#4b5563', fontWeight: '600', marginBottom: '5px' }}>Monday - Friday</p>
                            <p style={{ fontSize: '1.1rem', color: '#3b82f6', fontWeight: '600' }}>8:00 AM - 17:00 PM</p>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s', gridColumn: 'span 2' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📍</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>OFFICE ADDRESS</h3>
                            <p style={{ fontSize: '1rem', color: '#4b5563', lineHeight: '1.6' }}>
                                Faculty of Computing,<br />
                                Universiti Malaysia Pahang Al-Sultan Abdullah,<br />
                                26600 Pekan, Pahang
                            </p>
                            <a href="https://fk.umpsa.edu.my/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px', padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600' }}>
                                🌐 Visit Website
                            </a>
                        </div>
                    </div>
                </div>

                {/* My Lecturers Section - Only for Students */}
                {user?.role === 'student' && (
                    <div style={{ marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '30px' }}>👨‍🏫 My Lecturers</h2>
                        {loadingLecturers ? (
                            <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
                                <p>Loading lecturer information...</p>
                            </div>
                        ) : lecturers.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                                {lecturers.map((lecturer, index) => (
                                    <div key={index} style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem' }}>👨‍🏫</div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', textAlign: 'center' }}>{lecturer.name}</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#6b7280', textAlign: 'center', marginBottom: '15px' }}>{lecturer.class}</p>
                                        <div style={{ textAlign: 'center' }}>
                                            <a href={`mailto:${lecturer.name.toLowerCase().replace(' ', '.')}@umpsa.edu.my`} style={{ display: 'inline-block', padding: '8px 16px', background: '#e0f2fe', color: '#0369a1', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                                                📧 Email Lecturer
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '20px', padding: '40px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                                <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>You are not enrolled in any classes yet. Enroll in a class to see your lecturers.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Contact Form */}
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
