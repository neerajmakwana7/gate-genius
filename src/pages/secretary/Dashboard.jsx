import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { societyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const SecretaryDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [residents, setResidents] = useState([]);
  const [watchmen, setWatchmen] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Forms
  const [residentForm, setResidentForm] = useState({
    name: '', email: '', phone: '', password: ''
  });
  const [watchmanForm, setWatchmanForm] = useState({
    name: '', email: '', phone: '', password: ''
  });
  const [flatForm, setFlatForm] = useState({
    flatNumber: '', floor: ''
  });

  useEffect(() => {
    fetchData();
}, [user]);

  const fetchData = async () => {
    try {
      const [res, watch, flat] = await Promise.all([
        societyAPI.getAllResidents(user.societyId),
        societyAPI.getAllWatchmen(user.societyId),
        societyAPI.getAllFlats(user.societyId)
      ]);
      setResidents(res.data);
      setWatchmen(watch.data);
      setFlats(flat.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddResident = async () => {
    setLoading(true);
    try {
      await societyAPI.addResident({
        ...residentForm,
        societyId: user.societyId
      });
      setMessage('✅ Resident added successfully!');
      setResidentForm({ name: '', email: '', phone: '', password: '' });
      fetchData();
    } catch (err) {
      setMessage('❌ Failed to add resident!');
    }
    setLoading(false);
  };

  const handleAddWatchman = async () => {
    setLoading(true);
    try {
      await societyAPI.addWatchman({
        ...watchmanForm,
        societyId: user.societyId
      });
      setMessage('✅ Watchman added successfully!');
      setWatchmanForm({ name: '', email: '', phone: '', password: '' });
      fetchData();
    } catch (err) {
      setMessage('❌ Failed to add watchman!');
    }
    setLoading(false);
  };

  const handleAddFlat = async () => {
    setLoading(true);
    try {
      await societyAPI.addFlat({
        ...flatForm,
        societyId: user.societyId
      });
      setMessage('✅ Flat added successfully!');
      setFlatForm({ flatNumber: '', floor: '' });
      fetchData();
    } catch (err) {
      setMessage('❌ Failed to add flat!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            <p style={styles.userRole}>Secretary</p>
          </div>
        </div>

        <nav style={styles.nav}>
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'residents', icon: '👥', label: 'Residents' },
            { id: 'watchmen', icon: '👮', label: 'Watchmen' },
            { id: 'flats', icon: '🏠', label: 'Flats' },
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
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>
            {activeTab === 'dashboard' && '📊 Dashboard'}
            {activeTab === 'residents' && '👥 Manage Residents'}
            {activeTab === 'watchmen' && '👮 Manage Watchmen'}
            {activeTab === 'flats' && '🏠 Manage Flats'}
          </h1>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            ...styles.messageBox,
            background: message.includes('✅') ? '#D8F3DC' : '#FFEBEE',
            color: message.includes('✅') ? '#2D6A4F' : '#C62828',
          }}>
            {message}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👥</div>
                <div style={styles.statNumber}>{residents.length}</div>
                <div style={styles.statLabel}>Total Residents</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>👮</div>
                <div style={styles.statNumber}>{watchmen.length}</div>
                <div style={styles.statLabel}>Total Watchmen</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🏠</div>
                <div style={styles.statNumber}>{flats.length}</div>
                <div style={styles.statLabel}>Total Flats</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statIcon}>🛡️</div>
                <div style={styles.statNumber}>AI</div>
                <div style={styles.statLabel}>Risk Analyzer Active</div>
              </div>
            </div>

            <div style={styles.welcomeCard}>
              <h2 style={styles.welcomeTitle}>
                Welcome back, {user?.name}! 👋
              </h2>
              <p style={styles.welcomeText}>
                Manage your society from this dashboard.
                Add residents, watchmen, and flats to get started.
              </p>
            </div>
          </div>
        )}

        {/* Residents Tab */}
        {activeTab === 'residents' && (
          <div style={styles.tabContent}>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>➕ Add New Resident</h3>
              <div style={styles.formGrid}>
                <input
                  placeholder="Full Name"
                  value={residentForm.name}
                  onChange={e => setResidentForm({
                    ...residentForm, name: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Email"
                  value={residentForm.email}
                  onChange={e => setResidentForm({
                    ...residentForm, email: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Phone"
                  value={residentForm.phone}
                  onChange={e => setResidentForm({
                    ...residentForm, phone: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={residentForm.password}
                  onChange={e => setResidentForm({
                    ...residentForm, password: e.target.value
                  })}
                  style={styles.input}
                />
              </div>
              <button
                onClick={handleAddResident}
                disabled={loading}
                style={styles.addBtn}
              >
                {loading ? 'Adding...' : '➕ Add Resident'}
              </button>
            </div>

            <div style={styles.listCard}>
              <h3 style={styles.formTitle}>
                👥 All Residents ({residents.length})
              </h3>
              {residents.length === 0 ? (
                <p style={styles.emptyText}>No residents added yet!</p>
              ) : (
                residents.map(r => (
                  <div key={r.id} style={styles.listItem}>
                    <div style={styles.listAvatar}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.listName}>{r.name}</p>
                      <p style={styles.listEmail}>{r.email}</p>
                      <p style={styles.listPhone}>📞 {r.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Watchmen Tab */}
        {activeTab === 'watchmen' && (
          <div style={styles.tabContent}>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>➕ Add New Watchman</h3>
              <div style={styles.formGrid}>
                <input
                  placeholder="Full Name"
                  value={watchmanForm.name}
                  onChange={e => setWatchmanForm({
                    ...watchmanForm, name: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Email"
                  value={watchmanForm.email}
                  onChange={e => setWatchmanForm({
                    ...watchmanForm, email: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Phone"
                  value={watchmanForm.phone}
                  onChange={e => setWatchmanForm({
                    ...watchmanForm, phone: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={watchmanForm.password}
                  onChange={e => setWatchmanForm({
                    ...watchmanForm, password: e.target.value
                  })}
                  style={styles.input}
                />
              </div>
              <button
                onClick={handleAddWatchman}
                disabled={loading}
                style={styles.addBtn}
              >
                {loading ? 'Adding...' : '➕ Add Watchman'}
              </button>
            </div>

            <div style={styles.listCard}>
              <h3 style={styles.formTitle}>
                👮 All Watchmen ({watchmen.length})
              </h3>
              {watchmen.length === 0 ? (
                <p style={styles.emptyText}>No watchmen added yet!</p>
              ) : (
                watchmen.map(w => (
                  <div key={w.id} style={styles.listItem}>
                    <div style={{
                      ...styles.listAvatar,
                      background: '#F4A261'
                    }}>
                      {w.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={styles.listName}>{w.name}</p>
                      <p style={styles.listEmail}>{w.email}</p>
                      <p style={styles.listPhone}>📞 {w.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Flats Tab */}
        {activeTab === 'flats' && (
          <div style={styles.tabContent}>
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>➕ Add New Flat</h3>
              <div style={styles.formGrid}>
                <input
                  placeholder="Flat Number (e.g. 101)"
                  value={flatForm.flatNumber}
                  onChange={e => setFlatForm({
                    ...flatForm, flatNumber: e.target.value
                  })}
                  style={styles.input}
                />
                <input
                  placeholder="Floor Number"
                  type="number"
                  value={flatForm.floor}
                  onChange={e => setFlatForm({
                    ...flatForm, floor: e.target.value
                  })}
                  style={styles.input}
                />
              </div>
              <button
                onClick={handleAddFlat}
                disabled={loading}
                style={styles.addBtn}
              >
                {loading ? 'Adding...' : '➕ Add Flat'}
              </button>
            </div>

            <div style={styles.listCard}>
              <h3 style={styles.formTitle}>
                🏠 All Flats ({flats.length})
              </h3>
              {flats.length === 0 ? (
                <p style={styles.emptyText}>No flats added yet!</p>
              ) : (
                <div style={styles.flatsGrid}>
                  {flats.map(f => (
                    <div key={f.id} style={styles.flatCard}>
                      <div style={styles.flatIcon}>🏠</div>
                      <p style={styles.flatNumber}>Flat {f.flatNumber}</p>
                      <p style={styles.flatFloor}>Floor {f.floor}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    background: 'linear-gradient(180deg, #2D6A4F 0%, #40916C 100%)',
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
  logo: {
    fontSize: '30px'
  },
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
    textAlign: 'left',
    transition: 'all 0.2s'
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
  header: {
    marginBottom: '20px'
  },
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  },
  statCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  statIcon: {
    fontSize: '30px',
    marginBottom: '10px'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2D6A4F',
    fontFamily: "'Poppins', sans-serif"
  },
  statLabel: {
    color: '#6C757D',
    fontSize: '13px',
    marginTop: '5px'
  },
  welcomeCard: {
    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
    padding: '30px',
    borderRadius: '16px',
    color: '#fff'
  },
  welcomeTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  welcomeText: {
    opacity: 0.9,
    lineHeight: '1.6'
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '15px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '2px solid #DEE2E6',
    fontSize: '14px',
    outline: 'none',
    fontFamily: "'Inter', sans-serif"
  },
  addBtn: {
    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
    color: '#fff',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  listCard: {
    background: '#fff',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    background: '#F8F9FA'
  },
  listAvatar: {
    width: '45px',
    height: '45px',
    background: '#2D6A4F',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    flexShrink: 0
  },
  listName: {
    fontWeight: '600',
    color: '#1B1B1E',
    margin: 0
  },
  listEmail: {
    color: '#6C757D',
    fontSize: '13px',
    margin: '2px 0'
  },
  listPhone: {
    color: '#6C757D',
    fontSize: '13px',
    margin: 0
  },
  emptyText: {
    color: '#6C757D',
    textAlign: 'center',
    padding: '20px'
  },
  flatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px'
  },
  flatCard: {
    background: '#F8F9FA',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '2px solid #DEE2E6'
  },
  flatIcon: {
    fontSize: '30px',
    marginBottom: '8px'
  },
  flatNumber: {
    fontWeight: '700',
    color: '#1B1B1E',
    margin: 0
  },
  flatFloor: {
    color: '#6C757D',
    fontSize: '12px',
    margin: '4px 0 0'
  }
};

export default SecretaryDashboard;