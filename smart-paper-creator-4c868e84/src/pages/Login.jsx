import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      toast.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl ai-gradient-bg flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">PaperGen AI</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-Powered Question Paper Generator</p>
        </div>

        <div className="card-elevated p-8">
          <h2 className="text-lg font-heading font-semibold text-foreground mb-6">
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl ai-gradient-bg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
