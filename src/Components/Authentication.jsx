import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import './Aunthentication.css';

const CyberTipAuth = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' });
  };

  // Sign In Function
  const handleSignIn = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Successfully signed in! Redirecting...' 
      });
      
      console.log('User signed in:', data.user);
      
      // Redirect to app
      setTimeout(() => {
        navigate('/app');
      }, 1500);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to sign in. Please check your credentials.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Function
  const handleSignUp = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Account created! Please check your email to verify your account.' 
      });

      console.log('User signed up:', data.user);
      
      // Clear form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to create account. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignIn) {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  // Password Reset Function
  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage({ 
        type: 'error', 
        text: 'Please enter your email address first' 
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(
        formData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox.' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to send reset email' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated background */}
      <div className="cyber-background">
        <div className="grid-overlay"></div>
        <div className="circuit-lines"></div>
      </div>

      {/* Main content */}
      <div className="auth-content">
        {/* Logo and branding */}
        <div className="brand-header">
          <div className="logo-container">
            <Shield className="logo-icon" size={40} />
            <h1 className="brand-name">Cyber Tip App</h1>
          </div>
          <p className="brand-tagline">
            {isSignIn ? 'Welcome back to secure learning' : 'Start your cybersecurity journey'}
          </p>
        </div>

        {/* Auth card */}
        <div className="auth-card">
          <div className="card-header">
            <h2 className="form-title">
              {isSignIn ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="form-subtitle">
              {isSignIn 
                ? 'Access your daily security insights' 
                : 'Join thousands learning cybersecurity'}
            </p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`message-alert ${message.type}`}>
              <AlertCircle size={18} />
              <span>{message.text}</span>
            </div>
          )}

          {/* WRAPPED IN FORM ELEMENT */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Full Name (Sign Up only) */}
            {!isSignIn && (
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required={!isSignIn}
                    aria-label="Full Name"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  aria-label="Email Address"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  aria-label="Password"
                  disabled={loading}
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {!isSignIn && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isSignIn}
                    aria-label="Confirm Password"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password (Sign In only) */}
            {isSignIn && (
              <div className="form-options">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button - Changed to type="submit" */}
            <button 
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              <span>
                {loading 
                  ? (isSignIn ? 'Signing In...' : 'Creating Account...') 
                  : (isSignIn ? 'Sign In' : 'Create Account')
                }
              </span>
              <div className="button-glow"></div>
            </button>

            {/* Privacy Notice */}
            {!isSignIn && (
              <p className="privacy-notice">
                By creating an account, you agree to our transparent data practices. 
                We only collect essential information and never share your data.
              </p>
            )}
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="form-footer">
            <p className="toggle-text">
              {isSignIn ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="toggle-button"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
                  setMessage({ type: '', text: '' });
                }}
                disabled={loading}
              >
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Security Badge */}
          <div className="security-badge">
            <Lock size={16} />
            <span>256-bit encrypted connection</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <Shield size={20} />
            <span>Privacy First</span>
          </div>
          <div className="trust-item">
            <Lock size={20} />
            <span>Secure by Design</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberTipAuth;