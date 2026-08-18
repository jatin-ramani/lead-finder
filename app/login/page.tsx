'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Alert, Spin } from 'antd';
import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuth } from '@/features/auth/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, authError, isSubmitting } = useAuth();
  const [secret, setSecret] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <Spin size="large" tip="Verifying administrative session..." />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!secret.trim()) return;
    try {
      await login(secret.trim());
    } catch {
      // Handled via AuthContext state
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
            <SafetyCertificateOutlined className="text-3xl" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Lead Finder Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your secret key to access the application</p>
        </div>

        {authError && (
          <Alert
            type="error"
            message={authError}
            showIcon
            className="mb-6 border-red-500/30 bg-red-950/40 text-red-200"
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item
            label={<span className="text-xs font-medium uppercase tracking-wider text-slate-300">Admin Secret Key</span>}
            name="secret"
            rules={[{ required: true, message: 'Please enter your admin secret key' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-slate-500" />}
              placeholder="Enter secret key..."
              size="large"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="border-slate-700 bg-slate-950 text-white placeholder-slate-500 hover:border-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </Form.Item>

          <Form.Item className="mt-6 mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              block
              className="h-11 bg-indigo-600 font-medium hover:bg-indigo-500 focus:bg-indigo-700"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Lead Finder &copy; 2026 &bull; Secure Administrative Access
      </div>
    </div>
  );
}
