import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login({ email, password });
      login(res.data);

      // Role ke hisaab se redirect karo
      if (res.data.role === 'SECRETARY') {
        navigate('/secretary/dashboard');
      } else if (res.data.role === 'WATCHMAN') {
        navigate('/watchman/dashboard');
      } else if (res.data.role === 'RESIDENT') {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Left Side - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContainer}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>🛡️</span>
          </div>
          <h1 style={styles.brandName}>GateGenius</h1>
          <p style={styles.brandTagline}>
            Smart Society Visitor Management
          </p>
          <div style={styles.features}>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>AI-Powered Risk Analysis</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Real-time Visitor Alerts</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Secure Digital Records</span>
            </div>
            <div style={styles.featureItem}>
              <span>✅</span>
              <span>Multi-Role Access Control</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Welcome Back!</h2>
          <p style={styles.formSubtitle}>Sign in to your account</p>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              ...styles.loginBtn,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>

          <div style={styles.roles}>
            <p style={styles.rolesTitle}>Login as:</p>
            <div style={styles.rolesBadges}>
              <span style={styles.badge}>👨‍💼 Secretary</span>
              <span style={styles.badge}>👮 Watchman</span>
              <span style={styles.badge}>🏠 Resident</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', sans-serif",
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 50%, #52B788 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  brandContainer: {
    color: '#fff',
    textAlign: 'center',
  },
  logoCircle: {
    width: '100px',
    height: '100px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    backdropFilter: 'blur(10px)',
  },
  logoIcon: {
    fontSize: '50px',
  },
  brandName: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '10px',
    fontFamily: "'Poppins', sans-serif",
  },
  brandTagline: {
    fontSize: '1.1rem',
    opacity: 0.9,
    marginBottom: '40px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    textAlign: 'left',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1rem',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px 20px',
    borderRadius: '10px',
    backdropFilter: 'blur(5px)',
  },
  rightPanel: {
    flex: 1,
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    background: '#fff',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1B1B1E',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
  },
  formSubtitle: {
    color: '#6C757D',
    marginBottom: '30px',
  },
  errorBox: {
    background: '#FFEBEE',
    color: '#C62828',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #FFCDD2',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1B1B1E',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #DEE2E6',
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
    fontFamily: "'Inter', sans-serif",
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    fontFamily: "'Poppins', sans-serif",
  },
  roles: {
    marginTop: '30px',
    textAlign: 'center',
  },
  rolesTitle: {
    color: '#6C757D',
    fontSize: '13px',
    marginBottom: '10px',
  },
  rolesBadges: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  badge: {
    background: '#D8F3DC',
    color: '#2D6A4F',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
  }
};

export default Login;