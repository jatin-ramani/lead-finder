'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Form, Input, Spin } from 'antd';
import { LockOutlined, SafetyCertificateOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/features/auth/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, authError, isSubmitting } = useAuth();
  const [secret, setSecret] = useState('');

  useEffect(() => { if (isAuthenticated) router.push('/'); }, [isAuthenticated, router]);

  if (isLoading) {
    return <div className="lf-boundary"><Spin size="large" description="Verifying administrative session…" /></div>;
  }

  const handleSubmit = async () => {
    if (!secret.trim()) return;
    try { await login(secret.trim()); } catch { /* AuthContext owns the safe error. */ }
  };

  return (
    <main className="lf-login">
      <section className="lf-login-brand" aria-label="Lead Finder">
        <span className="lf-logo-mark"><SearchOutlined aria-hidden /></span>
        <h2>Turn local business data into focused sales opportunities.</h2>
        <p>Research, qualify, process, and export businesses from one reliable operations workspace.</p>
      </section>
      <section className="lf-login-main">
        <div className="lf-login-card">
          <span className="lf-login-mark"><SafetyCertificateOutlined aria-hidden /></span>
          <h1>Lead Finder Admin</h1>
          <p>Sign in to your secure operations workspace.</p>
          {authError && <Alert type="error" title="Could not sign in" description={authError} showIcon className="mb-6" />}
          <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Form.Item label="Admin secret key" name="secret" rules={[{ required: true, message: 'Enter your admin secret key' }]}>
              <Input.Password prefix={<LockOutlined aria-hidden />} placeholder="Enter secret key..." value={secret} onChange={(e) => setSecret(e.target.value)} autoFocus autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={isSubmitting} disabled={isSubmitting || !secret.trim()} block>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Form>
          <p className="lf-login-footer">Secure administrative access</p>
        </div>
      </section>
    </main>
  );
}
