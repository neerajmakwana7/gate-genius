import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { visitorAPI, societyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const WatchmanDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('register');
  const [flats, setFlats] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [riskResult, setRiskResult] = useState(null);

  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    organization: '',
    purpose: '',
    numberOfVisitors: 1,
    flatId: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

 useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flatRes, visitorRes] = await Promise.all([
        societyAPI.getAllFlats(user.societyId),
        visitorAPI.getAllVisitors()
      ]);
      setFlats(flatRes.data);
      setVisitors(visitorRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterVisitor = async () => {
    if (!visitorForm.name || !visitorForm.phone || !visitorForm.flatId) {
      setMessage('❌ Name, Phone and Flat are required!');
      return;
    }

    setLoading(true);
    setRiskResult(null);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('visitor', JSON.stringify({
        ...visitorForm,
        watchmanId: user.userId
      }));
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await visitorAPI.registerVisitor(formData);
      setRiskResult(res.data);
      setMessage('✅ Visitor registered successfully!');
      setVisitorForm({
        name: '', phone: '', organization: '',
        purpose: '', numberOfVisitors: 1, flatId: ''
      });
      setPhoto(null);
      setPhotoPreview(null);
      fetchData();
    } catch (err) {
      setMessage('❌ Failed to register visitor!');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await visitorAPI.updateStatus(id, status);
      setMessage(`✅ Status updated to ${status}!`);
      fetchData();
    } catch (err) {
      setMessage('❌ Failed to update status!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRiskColor = (level) => {
    if (level === 'LOW') return { bg: '#D8F3DC', text: '#2D6A4F', border: '#52B788' };
    if (level === 'MEDIUM') return { bg: '#FFF3E0', text: '#E65100', border: '#F4A261' };
    return { bg: '#FFEBEE', text: '#C62828', border: '#E63946' };
  };

  const getStatusColor = (status) => {
    if (status === 'ALLOWED') return '#2D6A4F';
    if (status === 'DENIED') return '#E63946';
    if (status === 'LEFT_AT_GATE') return '#F4A261';
    return '#6C757D';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>🛡️</div>
          <h2 style={styles.logoText}>GateGenius</h2>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{user?.name}</p>
            <p style={styles.userRole}>👮 Watchman</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'register', icon: '➕', label: 'Register Visitor' },
            { id: 'history', icon: '📋', label: 'Visitor History' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                ...styles.navItem,
                background: activeTab === item.id
                  ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderLeft: activeTab === item.id
                  ? '4px solid #fff' : '4px solid transparent'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'register' && '➕ Register Visitor'}
            {activeTab === 'history' && '📋 Visitor History'}
          </h1>
        </div>

        {message && (
          <div style={{
            ...styles.messageBox,
            background: message.includes('✅') ? '#D8F3DC' : '#FFEBEE',
            color: message.includes('✅') ? '#2D6A4F' : '#C62828',
          }}>
            {message}
          </div>
        )}

        {/* Register Visitor Tab */}
        {activeTab === 'register' && (
          <div style={styles.registerGrid}>
            {/* Form */}
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>Visitor Details</h3>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Visitor Name *</label>
                <input
                  placeholder="Enter visitor name"
                  value={visitorForm.name}
                  onChange={e => setVisitorForm({
                    ...visitorForm, name: e.target.value
                  })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number *</label>
                <input
                  placeholder="Enter phone number"
                  value={visitorForm.phone}
                  onChange={e => setVisitorForm({
                    ...visitorForm, phone: e.target.value
                  })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Organization</label>
                <input
                  placeholder="e.g. Zomato, Amazon, etc."
                  value={visitorForm.organization}
                  onChange={e => setVisitorForm({
                    ...visitorForm, organization: e.target.value
                  })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Purpose</label>
                <input
                  placeholder="e.g. Delivery, Meeting, etc."
                  value={visitorForm.purpose}
                  onChange={e => setVisitorForm({
                    ...visitorForm, purpose: e.target.value
                  })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Flat *</label>
                <select
                  value={visitorForm.flatId}
                  onChange={e => setVisitorForm({
                    ...visitorForm, flatId: e.target.value
                  })}
                  style={styles.input}
                >
                  <option value="">Select Flat</option>
                  {flats.map(f => (
                    <option key={f.id} value={f.id}>
                      Flat {f.flatNumber} - Floor {f.floor}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Number of Visitors</label>
                <input
                  type="number"
                  min="1"
                  value={visitorForm.numberOfVisitors}
                  onChange={e => setVisitorForm({
                    ...visitorForm, numberOfVisitors: e.target.value
                  })}
                  style={styles.input}
                />
              </div>

              {/* Photo Upload */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Visitor Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={styles.fileInput}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={styles.photoPreview}
                  />
                )}
              </div>

              <button
                onClick={handleRegisterVisitor}
                disabled={loading}
                style={{
                  ...styles.registerBtn,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? '⏳ Analyzing Risk...' : '🔍 Register & Analyze Risk'}
              </button>
            </div>

            {/* AI Risk Result */}
            <div>
              {riskResult && (
                <div style={{
                  ...styles.riskCard,
                  borderColor: getRiskColor(riskResult.riskLevel).border,
                  background: getRiskColor(riskResult.riskLevel).bg
                }}>
                  <h3 style={styles.riskTitle}>🤖 AI Risk Analysis</h3>

                  {/* Risk Score Circle */}
                  <div style={styles.riskScoreContainer}>
                    <div style={{
                      ...styles.riskScoreCircle,
                      background: getRiskColor(riskResult.riskLevel).border,
                    }}>
                      <span style={styles.riskScoreNum}>
                        {riskResult.riskScore}
                      </span>
                      <span style={styles.riskScoreLabel}>/ 100</span>
                    </div>
                    <div style={{
                      ...styles.riskBadge,
                      background: getRiskColor(riskResult.riskLevel).border,
                      color: '#fff'
                    }}>
                      {riskResult.riskLevel === 'LOW' && '🟢'}
                      {riskResult.riskLevel === 'MEDIUM' && '🟡'}
                      {riskResult.riskLevel === 'HIGH' && '🔴'}
                      {' '}{riskResult.riskLevel} RISK
                    </div>
                  </div>

                  {/* Reasons */}
                  <div style={styles.reasonsBox}>
                    <h4 style={styles.reasonsTitle}>⚠️ Reasons:</h4>
                    {riskResult.riskReasons && riskResult.riskReasons
                      .split(',').map((reason, i) => (
                        <div key={i} style={styles.reasonItem}>
                          • {reason.trim()}
                        </div>
                      ))
                    }
                  </div>

                  {/* Recommendation */}
                  <div style={styles.recommendationBox}>
                    <h4 style={styles.recommendationTitle}>
                      💡 Recommendation:
                    </h4>
                    <p style={{
                      ...styles.recommendationText,
                      color: getRiskColor(riskResult.riskLevel).text
                    }}>
                      {riskResult.riskLevel === 'LOW' && '✅ Allow Entry'}
                      {riskResult.riskLevel === 'MEDIUM' && '⚠️ Verify Identity'}
                      {riskResult.riskLevel === 'HIGH' && '🚫 Deny Entry'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleUpdateStatus(riskResult.id, 'ALLOWED')}
                      style={styles.allowBtn}
                    >
                      ✅ Allow
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(riskResult.id, 'DENIED')}
                      style={styles.denyBtn}
                    >
                      🚫 Deny
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(riskResult.id, 'LEFT_AT_GATE')}
                      style={styles.gateBtn}
                    >
                      🚪 Leave at Gate
                    </button>
                  </div>
                </div>
              )}

              {/* Info Card when no result */}
              {!riskResult && (
                <div style={styles.infoCard}>
                  <div style={styles.infoIcon}>🤖</div>
                  <h3 style={styles.infoTitle}>AI Risk Analyzer</h3>
                  <p style={styles.infoText}>
                    Fill visitor details and click
                    "Register & Analyze Risk" to get
                    an AI-powered risk assessment.
                  </p>
                  <div style={styles.infoFeatures}>
                    <div style={styles.infoFeature}>
                      🟢 LOW — Allow Entry
                    </div>
                    <div style={styles.infoFeature}>
                      🟡 MEDIUM — Verify Identity
                    </div>
                    <div style={styles.infoFeature}>
                      🔴 HIGH — Deny Entry
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={styles.historyCard}>
            <h3 style={styles.formTitle}>
              📋 All Visitors ({visitors.length})
            </h3>
            {visitors.length === 0 ? (
              <p style={styles.emptyText}>No visitors registered yet!</p>
            ) : (
              visitors.map(v => (
                <div key={v.id} style={styles.visitorItem}>
                  <div style={styles.visitorLeft}>
                    {v.photoUrl ? (
                      <img
                        src={v.photoUrl}
                        alt={v.name}
                        style={styles.visitorPhoto}
                      />
                    ) : (
                      <div style={styles.visitorAvatar}>
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p style={styles.visitorName}>{v.name}</p>
                      <p style={styles.visitorInfo}>📞 {v.phone}</p>
                      {v.organization && (
                        <p style={styles.visitorInfo}>🏢 {v.organization}</p>
                      )}
                      <p style={styles.visitorInfo}>
                        🕐 {new Date(v.entryTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div style={styles.visitorRight}>
                    {v.riskLevel && (
                      <span style={{
                        ...styles.riskTag,
                        background: getRiskColor(v.riskLevel).bg,
                        color: getRiskColor(v.riskLevel).text,
                        border: `1px solid ${getRiskColor(v.riskLevel).border}`
                      }}>
                        {v.riskLevel === 'LOW' && '🟢'}
                        {v.riskLevel === 'MEDIUM' && '🟡'}
                        {v.riskLevel === 'HIGH' && '🔴'}
                        {' '}{v.riskLevel}
                      </span>
                    )}
                    <span style={{
                      ...styles.statusTag,
                      color: getStatusColor(v.status)
                    }}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
    background: '#F8F9FA'
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1a4a6b 0%, #2d6a9f 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.2)'
  },
  logo: { fontSize: '30px' },
  logoText: {
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '30px',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px',
    borderRadius: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    background: '#F4A261',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px'
  },
  userName: {
    color: '#fff',
    fontWeight: '600',
    margin: 0,
    fontSize: '14px'
  },
  userRole: {
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
    fontSize: '12px'
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left'
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: 'auto',
flexShrink: 0,
position: 'sticky',
bottom: '20px',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    padding: '30px'
  },
  header: { marginBottom: '20px' },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1B1B1E',
    fontFamily: "'Poppins', sans-serif"
  },
  messageBox: {
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '20px',
    fontWeight: '500'
  },
  registerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  formCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  formTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  inputGroup: { marginBottom: '15px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1B1B1E',
    marginBottom: '6px'
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '2px solid #DEE2E6',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif"
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '10px',
    border: '2px dashed #DEE2E6',
    fontSize: '13px',
    cursor: 'pointer'
  },
  photoPreview: {
    width: '100px',
    height: '100px',
    borderRadius: '10px',
    objectFit: 'cover',
    marginTop: '10px',
    border: '2px solid #DEE2E6'
  },
  registerBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #1a4a6b, #2d6a9f)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '5px'
  },
  riskCard: {
    padding: '25px',
    borderRadius: '16px',
    border: '2px solid',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  riskTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  riskScoreContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  riskScoreCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  riskScoreNum: {
    fontSize: '1.8rem',
    fontWeight: '700',
    lineHeight: 1
  },
  riskScoreLabel: {
    fontSize: '11px',
    opacity: 0.9
  },
  riskBadge: {
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '1rem',
    fontWeight: '700'
  },
  reasonsBox: {
    background: 'rgba(255,255,255,0.7)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px'
  },
  reasonsTitle: {
    fontWeight: '700',
    marginBottom: '8px',
    color: '#1B1B1E'
  },
  reasonItem: {
    color: '#444',
    fontSize: '14px',
    marginBottom: '5px'
  },
  recommendationBox: {
    background: 'rgba(255,255,255,0.7)',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px'
  },
  recommendationTitle: {
    fontWeight: '700',
    marginBottom: '8px',
    color: '#1B1B1E'
  },
  recommendationText: {
    fontWeight: '700',
    fontSize: '1rem'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px'
  },
  allowBtn: {
    flex: 1,
    padding: '10px',
    background: '#2D6A4F',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  denyBtn: {
    flex: 1,
    padding: '10px',
    background: '#E63946',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  gateBtn: {
    flex: 1,
    padding: '10px',
    background: '#F4A261',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  infoCard: {
    background: '#fff',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  infoIcon: { fontSize: '50px', marginBottom: '15px' },
  infoTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  infoText: {
    color: '#6C757D',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  infoFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  infoFeature: {
    padding: '10px',
    background: '#F8F9FA',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#444'
  },
  historyCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  visitorItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    background: '#F8F9FA'
  },
  visitorLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  visitorPhoto: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  visitorAvatar: {
    width: '50px',
    height: '50px',
    background: '#1a4a6b',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '20px'
  },
  visitorName: {
    fontWeight: '600',
    color: '#1B1B1E',
    margin: 0
  },
  visitorInfo: {
    color: '#6C757D',
    fontSize: '12px',
    margin: '2px 0'
  },
  visitorRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  riskTag: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusTag: {
    fontSize: '12px',
    fontWeight: '700'
  },
  emptyText: {
    color: '#6C757D',
    textAlign: 'center',
    padding: '20px'
  }
};

export default WatchmanDashboard;