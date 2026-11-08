import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Store,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: { name: string; email: string; role: string }) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, theme, setTheme }) => {
  const [authMode, setAuthMode] = useState<'password' | 'pin'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (authMode === 'password') {
        const inputUser = email.trim().toLowerCase();
        const isValidUser = inputUser === 'dwstorel' || inputUser === 'ashanfreelancer@gmail.com';
        const isValidPass = password === 'GqhWds84RYSdsj&*sd4#';

        if (isValidUser && isValidPass) {
          onLogin({
            name: 'DWstore Admin',
            email: 'ashanfreelancer@gmail.com',
            role: 'Super Administrator'
          });
        } else {
          setError('Invalid username or password. Please verify your credentials.');
        }
      } else {
        if (pin === '122392') {
          onLogin({
            name: 'DWstore Admin',
            email: 'ashanfreelancer@gmail.com',
            role: 'Super Administrator'
          });
        } else {
          setError('Invalid 6-digit Security PIN code.');
        }
      }
    }, 300);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3 position-relative"
      style={{
        background: theme === 'dark' ? '#0b0f19' : '#f4f6fb',
        color: theme === 'dark' ? '#f3f4f6' : '#111827',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background glowing ambiance */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.18) 0%, rgba(0,0,0,0) 70%)',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          filter: 'blur(40px)'
        }}
      />

      {/* Top right theme toggle */}
      <div className="position-absolute" style={{ top: '24px', right: '24px' }}>
        <button
          type="button"
          className="btn-soft d-flex align-items-center gap-2 p-2 rounded-3"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
          style={{
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            color: 'inherit'
          }}
        >
          {theme === 'dark' ? <Sun size={17} className="text-warning" /> : <Moon size={17} className="text-secondary" />}
          <span style={{ fontSize: '13px', fontWeight: 500 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div
        className="w-100"
        style={{
          maxWidth: '440px',
          zIndex: 1
        }}
      >
        <div
          className="card-x shadow-lg p-4 p-md-5 rounded-4"
          style={{
            background: theme === 'dark' ? '#131926' : '#ffffff',
            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Header & Logo */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center p-3 rounded-4 mb-3 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                color: '#fff',
                width: '64px',
                height: '64px'
              }}
            >
              <Store size={32} />
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
              <h3 className="m-0 fw-bold" style={{ letterSpacing: '-0.5px' }}>DWstore</h3>
              <span
                className="badge rounded-pill"
                style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  color: '#6366f1',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px'
                }}
              >
                SAAS v2.4
              </span>
            </div>
            <p className="text-muted m-0" style={{ fontSize: '13px' }}>
              Executive Admin Portal & Dispatch Terminal
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            className="d-flex p-1 rounded-3 mb-4"
            style={{
              background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'
            }}
          >
            <button
              type="button"
              className={`flex-fill btn border-0 py-2 rounded-2 ${authMode === 'password' ? 'fw-bold' : 'text-muted'}`}
              style={{
                background: authMode === 'password' ? (theme === 'dark' ? '#1f293d' : '#ffffff') : 'transparent',
                color: authMode === 'password' ? 'inherit' : 'inherit',
                boxShadow: authMode === 'password' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                setAuthMode('password');
                setError(null);
              }}
            >
              Username & Password
            </button>
            <button
              type="button"
              className={`flex-fill btn border-0 py-2 rounded-2 ${authMode === 'pin' ? 'fw-bold' : 'text-muted'}`}
              style={{
                background: authMode === 'pin' ? (theme === 'dark' ? '#1f293d' : '#ffffff') : 'transparent',
                color: authMode === 'pin' ? 'inherit' : 'inherit',
                boxShadow: authMode === 'pin' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                setAuthMode('pin');
                setError(null);
              }}
            >
              Quick PIN Code
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div
              className="d-flex align-items-center gap-2 p-3 rounded-3 mb-3"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '13px'
              }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {authMode === 'password' ? (
              <>
                {/* Username / Email Field */}
                <div className="mb-3">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                    ADMIN USERNAME OR EMAIL
                  </label>
                  <div className="position-relative">
                    <Mail
                      size={17}
                      className="position-absolute text-muted"
                      style={{ top: '50%', transform: 'translateY(-50%)', left: '12px' }}
                    />
                    <input
                      type="text"
                      className="w-100 rounded-3"
                      style={{
                        padding: '11px 12px 11px 38px',
                        background: theme === 'dark' ? '#0f1420' : '#f9fafb',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        color: 'inherit',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="Enter username or email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="text-muted" style={{ fontSize: '12px', fontWeight: 600 }}>
                      SECURITY PASSWORD
                    </label>
                  </div>
                  <div className="position-relative">
                    <Lock
                      size={17}
                      className="position-absolute text-muted"
                      style={{ top: '50%', transform: 'translateY(-50%)', left: '12px' }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-100 rounded-3"
                      style={{
                        padding: '11px 40px 11px 38px',
                        background: theme === 'dark' ? '#0f1420' : '#f9fafb',
                        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        color: 'inherit',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn position-absolute border-0 p-0 text-muted"
                      style={{ top: '50%', transform: 'translateY(-50%)', right: '12px', background: 'transparent' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Quick PIN Field */
              <div className="mb-4">
                <label className="d-block mb-1 text-muted text-center" style={{ fontSize: '12px', fontWeight: 600 }}>
                  ENTER 6-DIGIT SECURITY PIN
                </label>
                <div className="position-relative mb-2">
                  <KeyRound
                    size={18}
                    className="position-absolute text-muted"
                    style={{ top: '50%', transform: 'translateY(-50%)', left: '14px' }}
                  />
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    className="w-100 rounded-3 text-center fw-bold"
                    style={{
                      padding: '12px 14px',
                      letterSpacing: '12px',
                      fontSize: '22px',
                      background: theme === 'dark' ? '#0f1420' : '#f9fafb',
                      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.18)',
                      color: 'inherit',
                      outline: 'none'
                    }}
                    placeholder="••••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            )}

            {/* Remember Me & Hub info */}
            <div className="d-flex align-items-center justify-content-between mb-4">
              <label className="d-flex align-items-center gap-2 cursor-pointer m-0" style={{ fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#4f46e5', width: '16px', height: '16px' }}
                />
                <span className="text-muted">Keep session active</span>
              </label>
              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '11px' }}>
                <ShieldCheck size={13} className="text-success" /> 256-bit SSL
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-100 btn text-white py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                border: 'none',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <span>Authenticating terminal...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-3 text-muted" style={{ fontSize: '12px' }}>
          DWstore.lk E-Commerce Ecosystem &bull; Official Administration Portal
        </div>
      </div>
    </div>
  );
};
