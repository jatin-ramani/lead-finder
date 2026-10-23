'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from '@/features/auth/AuthContext';
import DottedSpinner from '@/components/marketing/DottedSpinner';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, register, loginOAuth, authError, setAuthError, isSubmitting } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setAuthError(null);

    const emailTrimmed = email.trim();
    const passwordTrimmed = password.trim();

    if (!emailTrimmed) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!passwordTrimmed) {
      setLocalError('Please enter your password.');
      return;
    }
    if (passwordTrimmed.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (mode === 'signup') {
        await register({
          email: emailTrimmed,
          password: passwordTrimmed,
          full_name: fullName.trim() || undefined,
        });
      } else {
        await login({
          email: emailTrimmed,
          password: passwordTrimmed,
        });
      }
      onClose();
    } catch {
      // AuthContext sets authError
    }
  };

  const handleSocialLogin = async (provider: 'Google' | 'Apple' | 'Facebook') => {
    setLocalError(null);
    setAuthError(null);

    let userEmail = email.trim();
    if (!userEmail) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      userEmail = `user.${provider.toLowerCase()}${randomSuffix}@gmail.com`;
    }

    try {
      await loginOAuth(provider.toLowerCase(), {
        provider: provider.toLowerCase(),
        email: userEmail,
        name: fullName.trim() || `${provider} User`,
        avatar_url:
          provider === 'Google'
            ? 'https://lh3.googleusercontent.com/a/default-user'
            : undefined,
      });
      onClose();
    } catch {
      // AuthContext handles error display
    }
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setLocalError(null);
    setAuthError(null);
  };

  return (
    <div>
      <div className="ant-modal-root css-mncuj7">
        {/* Modal Backdrop Mask */}
        <div
          className="ant-modal-mask fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Outer Centered Wrapper */}
        <div
          tabIndex={-1}
          className="ant-modal-wrap ant-modal-centered fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Main Dialog Container */}
          <div
            role="dialog"
            aria-modal="true"
            className="ant-modal css-mncuj7 login__locating_wrap login-info-wrap locating-element-modal over_modal_wrapper npd__modal_wrapper relative w-full z-10"
            style={{ maxWidth: 416 }}
          >
            <div tabIndex={0} style={{ outline: 'none' }}>
              <div className="ant-modal-content relative bg-white border border-slate-200">
                {/* Top Center Blue Badge ("Login" / "Sign up") */}
                <div className="login-modal-top-badge">
                  <span>{mode === 'signup' ? 'Create Account' : 'Login'}</span>
                </div>

                {/* Minimal Clean Close Button at Top Right */}
                <button
                  type="button"
                  aria-label="Close"
                  className="ant-modal-close"
                  onClick={onClose}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M1 1L13 13M1 13L13 1" />
                  </svg>
                </button>

                {/* Modal Body */}
                <div className="ant-modal-body">
                  <div className="login-modal-section">
                    {/* Error Feedback */}
                    {(authError || localError) && (
                      <Alert
                        type="error"
                        message={mode === 'signin' ? 'Could not sign in' : 'Could not create account'}
                        description={authError || localError}
                        showIcon
                        className="mb-4 rounded-lg text-xs"
                        style={{ marginBottom: 18 }}
                      />
                    )}

                    <div className="ant-spin-nested-loading css-mncuj7">
                      <div className="ant-spin-container">
                        <div className="wrap-top-modal">
                          {/* Social Logins */}
                          <div className="google-button-login">
                            {/* Google */}
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSocialLogin('Google')}
                              className="login-with-google-btn"
                            >
                              <div className="social-btn-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                  <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                  />
                                </svg>
                              </div>
                              <span className="social-btn-text">Continue with Google</span>
                            </button>

                            {/* Apple */}
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSocialLogin('Apple')}
                              className="login-with-google-btn login-with-apple-btn"
                            >
                              <div className="social-btn-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.95-2.92-.93.04-2.04.62-2.7 1.4-.58.67-1.09 1.76-.95 2.81 1.04.08 2.07-.52 2.7-1.29z" />
                                </svg>
                              </div>
                              <span className="social-btn-text">Continue with Apple</span>
                            </button>

                            {/* Facebook */}
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleSocialLogin('Facebook')}
                              className="login-with-google-btn login-with-facebook-btn"
                            >
                              <div className="social-btn-icon">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                              </div>
                              <span className="social-btn-text">Continue with Facebook</span>
                            </button>
                          </div>

                          {/* Horizontal Divider */}
                          <div className="auth-divider login-auth-divider">
                            <span className="line left"></span>
                            <span className="or-text">Or, login with email</span>
                            <span className="line right"></span>
                          </div>

                          {/* Email & Password Form */}
                          <form onSubmit={handleSubmit} className="ant-form ant-form-horizontal css-mncuj7">
                            <div className="body-modal">
                              <div className="modal-login-form">
                                {mode === 'signup' && (
                                  <div className="mb">
                                    <div className="ant-form-item css-mncuj7 ant-form-item-horizontal">
                                      <div className="ant-row ant-form-item-row css-mncuj7">
                                        <div className="ant-col ant-col-24 ant-form-item-control css-mncuj7">
                                          <div className="ant-form-item-control-input">
                                            <div className="ant-form-item-control-input-content">
                                              <input
                                                autoComplete="name"
                                                placeholder="Your Name"
                                                aria-label="Name"
                                                id="name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="ant-input css-mncuj7 ant-input-outlined payment-inputs"
                                                type="text"
                                                name="name"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="mb">
                                  <div className="ant-form-item css-mncuj7 ant-form-item-horizontal">
                                    <div className="ant-row ant-form-item-row css-mncuj7">
                                      <div className="ant-col ant-col-24 ant-form-item-control css-mncuj7">
                                        <div className="ant-form-item-control-input">
                                          <div className="ant-form-item-control-input-content">
                                            <input
                                              autoComplete="email"
                                              placeholder="hello@mail.com"
                                              aria-label="Email"
                                              inputMode="email"
                                              autoCapitalize="none"
                                              id="email"
                                              aria-required="true"
                                              value={email}
                                              onChange={(e) => setEmail(e.target.value)}
                                              className="ant-input css-mncuj7 ant-input-outlined payment-inputs"
                                              type="email"
                                              name="email"
                                              required
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="ant-form-item css-mncuj7 ant-form-item-horizontal">
                                  <div className="ant-row ant-form-item-row css-mncuj7">
                                    <div className="ant-col ant-col-24 ant-form-item-control css-mncuj7">
                                      <div className="ant-form-item-control-input">
                                        <div className="ant-form-item-control-input-content relative">
                                          <input
                                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                            placeholder="*****"
                                            id="password"
                                            aria-required="true"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="ant-input css-mncuj7 ant-input-outlined payment-inputs pr-10"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                          />
                                          <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                          >
                                            {showPassword ? <EyeInvisibleOutlined style={{ fontSize: 16 }} /> : <EyeOutlined style={{ fontSize: 16 }} />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Continue Button with navbar liquid blob animation */}
                              <div className="submit-btn-modal">
                                <button
                                  type="submit"
                                  disabled={isSubmitting}
                                  className="hl_cta_wrap blob-btn"
                                  aria-label="Continue"
                                >
                                  <span className="blob-btn__inner" aria-hidden="true">
                                    <span className="blob-btn__blobs">
                                      <span className="blob-btn__blob"></span>
                                      <span className="blob-btn__blob"></span>
                                      <span className="blob-btn__blob"></span>
                                      <span className="blob-btn__blob"></span>
                                    </span>
                                  </span>
                                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-300">
                                    {isSubmitting ? (
                                      <>
                                        <DottedSpinner size="sm" color="currentColor" />
                                        <span>Please wait…</span>
                                      </>
                                    ) : (
                                      <span>Continue</span>
                                    )}
                                  </span>
                                </button>
                              </div>

                              {/* Centered Forgot Password */}
                              <div className="forget-pass-modal">
                                <Link href="/reset-pass" data-discover="true">
                                  <p>Forgot Password?</p>
                                </Link>
                              </div>

                              {/* Footer Switch between signin & signup */}
                              <div className="mode-switch-modal">
                                {mode === 'signin' ? (
                                  <span>
                                    Don&apos;t have an account?{' '}
                                    <button type="button" onClick={() => switchMode('signup')}>
                                      Sign up
                                    </button>
                                  </span>
                                ) : (
                                  <span>
                                    Already have an account?{' '}
                                    <button type="button" onClick={() => switchMode('signin')}>
                                      Log in
                                    </button>
                                  </span>
                                )}
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hidden standard Ant Modal footer */}
                <div className="ant-modal-footer" style={{ display: 'none' }}>
                  <button type="button" className="ant-btn ant-btn-default" style={{ display: 'none' }}>
                    <span>Cancel</span>
                  </button>
                  <button type="button" className="ant-btn ant-btn-primary" style={{ display: 'none' }}>
                    <span>OK</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
