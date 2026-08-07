"use client";

import {
  ApiOutlined,
  BulbOutlined,
  DeleteOutlined,
  MoonOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Segmented, Tag, Typography } from "antd";

import { COLLAPSE_STORAGE_KEY } from "@/components/AppShell";
import { clearStored } from "@/hooks/usePersistentState";
import { API_BASE_URL } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { SCAN_BASELINE_KEY } from "@/providers/BusinessProvider";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { useBusinesses } from "@/providers/BusinessProvider";
import { useThemeMode } from "@/providers/ThemeProvider";

const { Text } = Typography;

const LOCAL_KEYS = [
  THEME_STORAGE_KEY,
  COLLAPSE_STORAGE_KEY,
  SCAN_BASELINE_KEY,
];

export default function SettingsPage() {
  const { message } = App.useApp();
  const { mode, setMode } = useThemeMode();
  const { lastUpdated, refresh, refreshing, error, stats } = useBusinesses();

  const clearPreferences = () => {
    if (clearStored(LOCAL_KEYS)) {
      message.success("Local preferences cleared. Reload to see defaults.");
    } else {
      message.error("Could not access local storage.");
    }
  };

  return (
    <>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card variant="outlined" className="lf-panel" styles={{ body: { padding: 20 } }}>
          <h2 className="lf-panel-title">
            <BulbOutlined className="me-2 lf-accent-text" />
            Appearance
          </h2>
          <p className="lf-panel-description">
            Dark is the designed default. The sidebar stays dark either way; the
            content area follows your choice.
          </p>

          <Segmented
            className="mt-4"
            value={mode}
            onChange={(value) => setMode(value as "light" | "dark")}
            options={[
              { label: "Light", value: "light", icon: <BulbOutlined /> },
              { label: "Dark", value: "dark", icon: <MoonOutlined /> },
            ]}
          />
        </Card>

        <Card variant="outlined" className="lf-panel" styles={{ body: { padding: 20 } }}>
          <h2 className="lf-panel-title">
            <ApiOutlined className="me-2 lf-accent-text" />
            API connection
          </h2>
          <p className="lf-panel-description">
            Set <code>NEXT_PUBLIC_API_BASE_URL</code> in <code>.env.local</code>{" "}
            to point at a different backend. Endpoints themselves are unchanged.
          </p>

          <dl className="lf-settings-list mt-4">
            <div>
              <dt>Base URL</dt>
              <dd className="font-mono">{API_BASE_URL}</dd>
            </div>
            <div>
              <dt>Businesses endpoint</dt>
              <dd className="font-mono">GET /businesses</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                {error ? (
                  <Tag color="error" className="lf-tag">
                    Unreachable
                  </Tag>
                ) : (
                  <Tag color="success" className="lf-tag">
                    Connected
                  </Tag>
                )}
              </dd>
            </div>
            <div>
              <dt>Records loaded</dt>
              <dd>{stats.total}</dd>
            </div>
            <div>
              <dt>Last refresh</dt>
              <dd>{formatTime(lastUpdated)}</dd>
            </div>
          </dl>

          <Button
            className="mt-4"
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={() => void refresh()}
          >
            Test connection
          </Button>
        </Card>

        <Card variant="outlined" className="lf-panel" styles={{ body: { padding: 20 } }}>
          <h2 className="lf-panel-title">
            <DeleteOutlined className="me-2 lf-accent-text" />
            Local data
          </h2>
          <p className="lf-panel-description">
            Theme, sidebar state and the &ldquo;Found Today&rdquo; baseline are
            stored in this browser only. Nothing is sent anywhere.
          </p>

          <Button danger className="mt-4" icon={<DeleteOutlined />} onClick={clearPreferences}>
            Clear local preferences
          </Button>

          <Text type="secondary" className="mt-3 block text-xs">
            This does not touch any business record on the backend.
          </Text>
        </Card>
      </div>
    </>
  );
}
