'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Result, Spin } from 'antd';
import { LoginOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/features/auth/AuthContext';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tookTooLong, setTookTooLong] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // If session verification takes longer than 7s (e.g. slow/flaky mobile connection),
  // transition from infinite spinner to an actionable recovery UI.
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => {
      setTookTooLong(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    if (tookTooLong) {
      return (
        <div className="lf-boundary p-6 flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full text-center space-y-4 p-6 rounded-xl border border-[var(--lf-border)] bg-[var(--lf-surface)] shadow-md">
            <Result
              status="warning"
              title="Connection Taking Longer Than Usual"
              subTitle="Verifying administrative session is taking extra time on this network connection."
              extra={[
                <Button
                  key="retry"
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => window.location.reload()}
                >
                  Retry Connection
                </Button>,
                <Button
                  key="login"
                  icon={<LoginOutlined />}
                  onClick={() => router.replace('/login')}
                >
                  Go to Login
                </Button>,
              ]}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="lf-boundary">
        <Spin size="large" description="Verifying administrative session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

