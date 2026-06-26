import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { visitorAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ResidentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await visitorAPI.getAllVisitors();
      setVisitors(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setLoading(true);
    try {
      await visitorAPI.updateStatus(id, status);
      setMessage(`✅ Visitor ${status.toLowerCase()} successfully!`);
      fetchVisitors();
    } catch (err) {
      setMessage('❌ Failed to update status!');
    }
    setLoading(false);
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

  const pendingVisitors = visitors.filter(v => v.status === 'PENDING');
  const historyVisitors = visitors.filter(v => v.status !== 'PENDING');

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
            <p style={styles.userRole}>🏠 Resident</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'requests', icon: '🔔', label: `Pending Requests (${pendingVisitors.length})` },
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
            {activeTab === 'requests' && '🔔 Pending Visitor Requests'}
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

        {/* Pending Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {pendingVisitors.length === 0 ? (
              <div style={styles.emptyCard}>
                <div style={styles.emptyIcon}>✅</div>
                <h3 style={styles.emptyTitle}>No Pending Requests!</h3>
                <p style={styles.emptyText}>
                  All visitor requests have been handled.
                </p>
              </div>
            ) : (
              pendingVisitors.map(v => (
                <div key={v.id} style={styles.requestCard}>
                  <div style={styles.requestTop}>
                    {/* Visitor Info */}
                    <div style={styles.visitorInfo}>
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
                        <h3 style={styles.visitorName}>{v.name}</h3>
                        <p style={styles.visitorDetail}>📞 {v.phone}</p>
                        {v.organization && (
                          <p style={styles.visitorDetail}>🏢 {v.organization}</p>
                        )}
                        {v.purpose && (
                          <p style={styles.visitorDetail}>📝 {v.purpose}</p>
                        )}
                        <p style={styles.visitorDetail}>
                          👥 {v.numberOfVisitors} visitor(s)
                        </p>
                        <p style={styles.visitorDetail}>
                          🕐 {new Date(v.entryTime).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* AI Risk Badge */}
                    {v.riskLevel && (
                      <div style={{
                        ...styles.riskBadge,
                        background: getRiskColor(v.riskLevel).bg,
                        border: `2px solid ${getRiskColor(v.riskLevel).border}`,
                        color: getRiskColor(v.riskLevel).text
                      }}>
                        <div style={styles.riskScore}>
                          {v.riskScore}
                          <span style={styles.riskScoreLabel}>/100</span>
                        </div>
                        <div style={styles.riskLevel}>
                          {v.riskLevel === 'LOW' && '🟢 LOW RISK'}
                          {v.riskLevel === 'MEDIUM' && '🟡 MEDIUM RISK'}
                          {v.riskLevel === 'HIGH' && '🔴 HIGH RISK'}
                        </div>
                        {v.riskReasons && (
                          <div style={styles.riskReasons}>
                            {v.riskReasons.split(',').map((r, i) => (
                              <div key={i} style={styles.riskReason}>
                                • {r.trim()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleUpdateStatus(v.id, 'ALLOWED')}
                      disabled={loading}
                      style={styles.allowBtn}
                    >
                      ✅ Allow Entry
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(v.id, 'DENIED')}
                      disabled={loading}
                      style={styles.denyBtn}
                    >
                      🚫 Deny Entry
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(v.id, 'LEFT_AT_GATE')}
                      disabled={loading}
                      style={styles.gateBtn}
                    >
                      🚪 Leave at Gate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={styles.historyCard}>
            <h3 style={styles.cardTitle}>
              📋 Visitor History ({historyVisitors.length})
            </h3>
            {historyVisitors.length === 0 ? (
              <p style={styles.emptyText}>No visitor history yet!</p>
            ) : (
              historyVisitors.map(v => (
                <div key={v.id} style={styles.historyItem}>
                  <div style={styles.historyLeft}>
                    {v.photoUrl ? (
                      <img
                        src={v.photoUrl}
                        alt={v.name}
                        style={styles.historyPhoto}
                      />
                    ) : (
                      <div style={styles.historyAvatar}>
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p style={styles.historyName}>{v.name}</p>
                      <p style={styles.historyDetail}>📞 {v.phone}</p>
                      {v.organization && (
                        <p style={styles.historyDetail}>🏢 {v.organization}</p>
                      )}
                      <p style={styles.historyDetail}>
                        🕐 {new Date(v.entryTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div style={styles.historyRight}>
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
                      color: v.status === 'ALLOWED' ? '#2D6A4F' :
                             v.status === 'DENIED' ? '#E63946' : '#F4A261'
                    }}>
                      {v.status === 'ALLOWED' && '✅ Allowed'}
                      {v.status === 'DENIED' && '🚫 Denied'}
                      {v.status === 'LEFT_AT_GATE' && '🚪 Left at Gate'}
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
    background: 'linear-gradient(180deg, #4a1a6b 0%, #7b2d9f 100%)',
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
  emptyCard: {
    background: '#fff',
    padding: '60px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  emptyIcon: { fontSize: '60px', marginBottom: '15px' },
  emptyTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  emptyText: {
    color: '#6C757D',
    textAlign: 'center',
    padding: '10px'
  },
  requestCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px'
  },
  requestTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '20px'
  },
  visitorInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start'
  },
  visitorPhoto: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #DEE2E6'
  },
  visitorAvatar: {
    width: '70px',
    height: '70px',
    background: '#4a1a6b',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '28px',
    flexShrink: 0
  },
  visitorName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1B1B1E',
    margin: '0 0 5px'
  },
  visitorDetail: {
    color: '#6C757D',
    fontSize: '13px',
    margin: '3px 0'
  },
  riskBadge: {
    padding: '15px 20px',
    borderRadius: '12px',
    minWidth: '180px',
    textAlign: 'center'
  },
  riskScore: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: 1
  },
  riskScoreLabel: {
    fontSize: '14px',
    fontWeight: '400'
  },
  riskLevel: {
    fontWeight: '700',
    fontSize: '14px',
    margin: '8px 0'
  },
  riskReasons: {
    textAlign: 'left',
    marginTop: '10px'
  },
  riskReason: {
    fontSize: '12px',
    marginBottom: '3px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    borderTop: '1px solid #DEE2E6',
    paddingTop: '20px'
  },
  allowBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  denyBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #C62828, #E63946)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  gateBtn: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #E65100, #F4A261)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  historyCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    background: '#F8F9FA'
  },
  historyLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  historyPhoto: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  historyAvatar: {
    width: '50px',
    height: '50px',
    background: '#4a1a6b',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '20px'
  },
  historyName: {
    fontWeight: '600',
    color: '#1B1B1E',
    margin: 0
  },
  historyDetail: {
    color: '#6C757D',
    fontSize: '12px',
    margin: '2px 0'
  },
  historyRight: {
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
    fontSize: '13px',
    fontWeight: '700'
  }
};

export default ResidentDashboard;