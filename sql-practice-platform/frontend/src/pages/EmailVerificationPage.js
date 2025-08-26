import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authUrl } from '../config/environment';

function EmailVerificationPage() {
    const [otp, setOTP] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [canResend, setCanResend] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const inputRefs = useRef([]);

    // Get user data from registration flow
    const { userId, email, fullName } = location.state || {};

    useEffect(() => {
        // Redirect if no user data
        if (!userId || !email) {
            navigate('/register', { replace: true });
            return;
        }

        // Focus first input
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [userId, email, navigate]);

    useEffect(() => {
        // Countdown timer for resend button
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => {
                setResendCooldown(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleOTPChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOTP = [...otp];
        newOTP[index] = value;
        setOTP(newOTP);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        
        // Handle paste
        if (e.key === 'Enter') {
            handleVerifyOTP();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOTP = [...otp];
        
        for (let i = 0; i < 6; i++) {
            newOTP[i] = pastedData[i] || '';
        }
        
        setOTP(newOTP);
        
        // Focus the last filled input or first empty one
        const lastFilledIndex = Math.min(pastedData.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(authUrl('verify-email'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    otp: otpString
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Email verified successfully! Redirecting...');
                
                // Store the token and user data
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }

                // Redirect to the intended page or dashboard
                setTimeout(() => {
                    navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
                }, 1500);
            } else {
                setError(data.error || 'Verification failed');
                // Clear OTP on error
                setOTP(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);
        setError('');

        try {
            const response = await fetch(authUrl('resend-verification'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    email
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('New verification code sent to your email!');
                setCanResend(false);
                setResendCooldown(60); // 60 seconds cooldown
                // Clear current OTP
                setOTP(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to resend verification code');
            }
        } catch (error) {
            console.error('Resend error:', error);
            setError('Failed to resend verification code');
        } finally {
            setResendLoading(false);
        }
    };

    if (!userId || !email) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link to="/" className="text-3xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        SQL Practice Platform
                    </Link>
                    <div className="mt-6 text-6xl">📧</div>
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Verify Your Email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        We've sent a 6-digit verification code to
                    </p>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                        {email}
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP(); }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-4">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center space-x-2">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 dark:text-white transition-colors"
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 border border-red-200 dark:border-red-800">
                                <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4 border border-green-200 dark:border-green-800">
                                <div className="text-sm text-green-600 dark:text-green-400 text-center">{success}</div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-gray-800"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                        Verifying...
                                    </div>
                                ) : (
                                    'Verify Email'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={!canResend || resendLoading}
                                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendLoading ? 'Sending...' : 
                                     resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                                     'Resend Code'}
                                </button>
                            </p>
                        </div>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                            <div>🔒 Your verification code expires in 15 minutes</div>
                            <div>💡 Check your spam folder if you don't see the email</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmailVerificationPage;