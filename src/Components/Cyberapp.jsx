import React, { useState, useEffect } from 'react';
import { useAuth } from '../Contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './App.css';

function Cyberapp() {
  const [keyword, setKeyword] = useState('');
  const [tipContent, setTipContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch daily tip on mount
  useEffect(() => {
    fetchDailyTip();
  }, []);

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Normalize API response
  const normalizeTipData = (data) => {
    let steps = data.actionSteps;

    if (typeof steps === 'string') {
      steps = steps
        .split(/\r?\n|,|;/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    return {
      title: data.title || 'Untitled Tip',
      tip: data.tip || 'No tip content available.',
      explanation: data.explanation || 'No explanation provided.',
      actionSteps: Array.isArray(steps) ? steps : [],
      closing: data.closing || 'Stay safe online!',
    };
  };

  // Fetch daily tip
  const fetchDailyTip = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/daily-tip`);
      const data = await response.json();
      if (data.success) {
        setTipContent(normalizeTipData(data.data));
      } else {
        setError(data.error || 'Failed to fetch daily tip');
      }
    } catch (err) {
      console.error('Error fetching daily tip:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Generate tip by keyword
  const generateTipByKeyword = async () => {
    if (!keyword.trim()) {
      fetchDailyTip();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/tip-by-keyword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const data = await response.json();
      if (data.success) {
        setTipContent(normalizeTipData(data.data));
        setKeyword('');
      } else {
        setError(data.error || 'Failed to generate tip');
      }
    } catch (err) {
      console.error('Error generating tip:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => generateTipByKeyword();

  return (
    <div className="app-container">
      <div className="bg-gradient"></div>
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>

      {/* Logout Button - Top Right */}
      <button onClick={handleSignOut} className="logout-button">
        <LogOut size={18} />
        <span>Logout</span>
      </button>

      <div className="content-wrapper">
        <header className="app-header">
          <h1 className="app-title">🛡️ Daily Cyber Tip App</h1>
          <p className="app-subtitle">Your daily dose of cybersecurity wisdom</p>
          
          {/* Welcome Message - Under Header */}
          <div className="welcome-section">
            <p className="welcome-text">Welcome back, <span className="user-name">{getUserDisplayName()}</span></p>
          </div>
        </header>

        <div className="input-section">
          <input
            type="text"
            className="keyword-input"
            placeholder="Enter a keyword (e.g., phishing, password)..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
          />
          <button onClick={handleSubmit} className="get-tip-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Get Tip '}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button onClick={fetchDailyTip} className="retry-btn">Try Again</button>
          </div>
        )}

        {tipContent && !error && (
          <div className="tip-card">
            <h2 className="tip-title">{tipContent.title}</h2>

            <div className="tip-section">
              <h3 className="section-label"> Today's Tip</h3>
              <p className="tip-text">{tipContent.tip}</p>
            </div>

            <div className="tip-section">
              <h3 className="section-label"> Why It Matters</h3>
              <p className="explanation-text">{tipContent.explanation}</p>
            </div>

            <div className="tip-section">
              <h3 className="section-label"> Action Steps</h3>
              <ul className="action-list">
                {tipContent.actionSteps.length > 0 ? (
                  tipContent.actionSteps.map((step, index) => (
                    <li key={index} className="action-item">{step}</li>
                  ))
                ) : (
                  <li>No specific steps provided.</li>
                )}
              </ul>
            </div>

            <div className="closing-section">
              <p className="closing-text">{tipContent.closing}</p>
            </div>

            <button onClick={fetchDailyTip} className="refresh-btn">
              Get New Daily Tip
            </button>
          </div>
        )}

        {loading && !tipContent && (
          <div className="loading-card">
            <div className="loading-spinner-large"></div>
            <p>Generating your cybersecurity tip...</p>
          </div>
        )}

        <footer className="app-footer">
          <p>Powered by AI | Stay Secure 🔒</p>
        </footer>
      </div>
    </div>
  );
}

export default Cyberapp;