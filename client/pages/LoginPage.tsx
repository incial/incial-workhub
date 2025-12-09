
import React, { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, CheckCircle, Shield, User, Eye, EyeOff, Crown, Briefcase } from 'lucide-react';

type DemoRole = 'super' | 'admin' | 'employee' | 'client';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('super@incial.com');
  const [password, setPassword] = useState('super');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authApi.login(email, password);
      login(response.token, response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (role: DemoRole) => {
      switch(role) {
          case 'super':
              setEmail('super@incial.com');
              setPassword('super');
              break;
          case 'admin':
              setEmail('admin@incial.com');
              setPassword('admin');
              break;
          case 'employee':
              setEmail('employee@incial.com');
              setPassword('employee');
              break;
          case 'client':
              setEmail('client@incial.com');
              setPassword('client');
              break;
      }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-slate-600/20 blur-[120px]" />
             <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gray-600/20 blur-[120px]" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-[#0F172A] to-transparent z-10" />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3 text-2xl font-bold tracking-tight">
            <img src="/logo.png" alt="Incial" className="h-10 w-10 rounded-xl bg-white shadow-lg object-contain p-1" />
            Incial
        </div>

        {/* Testimonial / Value Prop */}
        <div className="relative z-10 space-y-8 max-w-lg mb-12">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Manage your business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-white">precision</span>.
            </h2>
            <div className="space-y-5">
                {['Real-time pipeline tracking', 'Advanced task management', 'Seamless team collaboration'].map((item) => (
                    <div key={item} className="flex items-center gap-4 text-slate-300">
                        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                             <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-medium">{item}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-slate-500 font-medium">
            © 2025 Incial Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative bg-white">
         <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center lg:text-left">
                <img src="/logo.png" alt="Incial" className="lg:hidden h-12 w-12 rounded-xl bg-white shadow-lg object-contain p-1 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                <p className="text-gray-500 mt-2 text-lg">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all font-medium"
                                placeholder="name@incial.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                         <div className="flex items-center justify-between mb-2">
                             <label className="block text-sm font-semibold text-gray-700">Password</label>
                             <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline">Forgot password?</a>
                         </div>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-brand-600 transition-colors" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99]"
                >
                    {isLoading ? (
                         <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign in
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Demo Roles</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => fillCredentials('super')}
                    className="p-2.5 border border-gray-200 rounded-xl text-left hover:border-brand-500 hover:bg-brand-50/50 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-brand-600" />
                        <span className="text-sm font-bold text-gray-900">Super Admin</span>
                    </div>
                    <div className="text-[10px] text-gray-400 group-hover:text-brand-600">Full Access</div>
                </button>

                <button 
                    onClick={() => fillCredentials('admin')}
                    className="p-2.5 border border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-bold text-gray-900">Admin</span>
                    </div>
                    <div className="text-[10px] text-gray-400 group-hover:text-blue-600">No Analytics</div>
                </button>

                <button 
                    onClick={() => fillCredentials('employee')}
                    className="p-2.5 border border-gray-200 rounded-xl text-left hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-bold text-gray-900">Employee</span>
                    </div>
                    <div className="text-[10px] text-gray-400 group-hover:text-indigo-600">Operational Only</div>
                </button>

                <button 
                    onClick={() => fillCredentials('client')}
                    className="p-2.5 border border-gray-200 rounded-xl text-left hover:border-green-500 hover:bg-green-50/50 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-bold text-gray-900">Client</span>
                    </div>
                    <div className="text-[10px] text-gray-400 group-hover:text-green-600">Restricted View</div>
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};
