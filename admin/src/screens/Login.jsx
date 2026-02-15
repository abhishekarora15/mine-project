import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-surface p-8 rounded-2xl shadow-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <LogIn className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Restaurant Admin</h1>
                    <p className="text-gray-400 mt-2">Sign in to manage your kitchen</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg flex items-center gap-2 mb-6">
                        <AlertCircle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full bg-gray-800 border-gray-700 border text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full bg-gray-800 border-gray-700 border text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-primary transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                    Not a partner? <a href="#" className="text-primary hover:underline">Apply now</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
