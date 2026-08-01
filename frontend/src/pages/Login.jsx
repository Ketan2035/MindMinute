import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isAuthenticated, isLoading, error } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-white">
      {/* Left Side: Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-12 bg-indigo-50 overflow-hidden">
        
        {/* Subtle dot pattern background */}
        <div 
          className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#a5b4fc 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
        ></div>

        {/* Animated Background Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

        {/* Floating Image */}
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative z-10 w-full h-full flex items-center justify-center"
        >
          <img 
            src="/sticker-hero.png" 
            alt="MindMinute Platform" 
            className="w-full h-full object-contain drop-shadow-2xl scale-105"
          />
        </motion.div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-12 xl:px-16 relative overflow-hidden bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">

        {/* Decorative background blobs for mobile (hidden on lg since we have the image) */}
        <div className="lg:hidden absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="lg:hidden absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex flex-col items-start mb-10">

            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-900 transition-all placeholder:text-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-900 transition-all placeholder:text-gray-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center mt-6"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center">
            <div className="w-full h-px bg-gray-200"></div>
            <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
            <div className="w-full h-px bg-gray-200"></div>
          </div>

          <div className="mt-6 w-full flex justify-center">
            <GoogleLogin
              onSuccess={credentialResponse => {
                googleLogin(credentialResponse.credential);
              }}
              onError={() => {
                console.error('Login Failed');
              }}
              useOneTap
              shape="pill"
              theme="outline"
              size="large"
              text="continue_with"
              width="350"
            />
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-bold">
              Create an account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
