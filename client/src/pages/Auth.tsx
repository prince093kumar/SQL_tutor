import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../utils/api';
import { Database } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const validateForm = () => {
    if (!isLogin) {
      const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
      if (!usernameRegex.test(formData.username)) {
        setError('Username must be a combination of letters and numbers.');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        login(data.data.user, data.data.token);
        navigate('/');
      } else {
        const { data } = await api.post('/auth/register', formData);
        login(data.data.user, data.data.token);
        navigate('/');
      }
    } catch (err: any) {
      if (!err.response) {
        setError('Network Error: Unable to reach the server. Please check your connection or restart the backend.');
      } else {
        setError(err.response?.data?.error || (isLogin ? 'Authentication failed' : 'Registration failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-vscode-bg flex items-center justify-center font-sans text-vscode-text">
      <div className="w-full max-w-md p-8 bg-vscode-sidebar rounded-lg shadow-2xl border border-vscode-border">
        <div className="flex flex-col items-center mb-8">
          <Database size={48} className="text-vscode-accent mb-4" />
          <h1 className="text-2xl font-bold">SQLLab</h1>
          <p className="text-sm opacity-60 mt-2">Interactive SQL Learning Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold mb-1 opacity-70">USERNAME</label>
              <input
                type="text"
                required
                className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-sm focus:border-vscode-accent focus:outline-none transition-colors"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold mb-1 opacity-70">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-sm focus:border-vscode-accent focus:outline-none transition-colors"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-70">PASSWORD</label>
            <input
              type="password"
              required
              className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded p-2 text-sm focus:border-vscode-accent focus:outline-none transition-colors"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vscode-accent hover:bg-vscode-accent/80 text-white font-semibold py-2 rounded mt-6 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm opacity-70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            className="text-vscode-accent hover:underline"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
