"use client";

import React, { useEffect, useState } from "react";
import {
  App,
  Button,
  Card,
  Space,
  Typography,
} from "antd";
import {
  HistoryOutlined,
  MailOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import type {
  CityAutomationStartInput,
  MasterTemplateItem,
} from "@/types/api";
import {
  useAvailableCities,
  useCancelCityAutomation,
  useCityAutomationReport,
  useCityStats,
  useMasterTemplate,
  useResumeCityAutomation,
  useStartCityAutomation,
} from "@/features/automations/hooks/useCityAutomations";
import {
  useDisconnectGmail,
  useGmailAuthUrl,
  useGmailStatus,
  useSendGmailTestEmails,
} from "@/features/automations/hooks/useGmailIntegration";
import { GmailConnectionBanner } from "@/features/automations/components/GmailConnectionBanner";
import { TestEmailSection } from "@/features/automations/components/TestEmailSection";
import { CityAudienceCard } from "@/features/automations/components/CityAudienceCard";
import { MasterTemplateCard } from "@/features/automations/components/MasterTemplateCard";
import { TemplateEditorModal } from "@/features/automations/components/TemplateEditorModal";
import { AutomationConfirmModal } from "@/features/automations/components/AutomationConfirmModal";
import { AutomationProgressView } from "@/features/automations/components/AutomationProgressView";
import { AutomationHistoryDrawer } from "@/features/automations/components/AutomationHistoryDrawer";
import { clearStored, readStored, writeStored } from "@/hooks/usePersistentState";
import PageContainer from "@/components/ui/PageContainer";

const { Paragraph } = Typography;

export default function EmailAutomationPage() {
  const { message } = App.useApp();

  // 1. Gmail API Integration Status & Actions
  const { data: gmailStatus, isLoading: isLoadingGmail, refetch: refetchGmailStatus } = useGmailStatus();
  const getAuthUrlMutation = useGmailAuthUrl();
  const disconnectGmailMutation = useDisconnectGmail();
  const sendTestEmailsMutation = useSendGmailTestEmails();

  // Check URL query parameters for OAuth redirect feedback
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get("gmail_connected");
    const email = urlParams.get("email");
    const error = urlParams.get("gmail_error");

    if (connected === "true") {
      message.success(`Gmail account (${email || "authorized"}) successfully connected!`);
      void refetchGmailStatus();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (error) {
      message.error(`Gmail connection failed: ${error}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [message, refetchGmailStatus]);

  const handleConnectGmail = async () => {
    try {
      const res = await getAuthUrlMutation.mutateAsync();
      if (res.auth_url) {
        window.location.href = res.auth_url;
      }
    } catch {
      // Handled by hook error toast
    }
  };

  const handleDisconnectGmail = async () => {
    await disconnectGmailMutation.mutateAsync();
  };

  // 2. City selection & stats
  const { data: citiesData, isLoading: isLoadingCities } = useAvailableCities();
  const cities = citiesData?.items || [];

  const [selectedCityState, setSelectedCityState] = useState<string | undefined>();
  const selectedCity = selectedCityState || (cities.length > 0 ? cities[0].city : undefined);

  const { data: stats, isLoading: isLoadingStats } = useCityStats(selectedCity);

  // 3. Universal Master Template query & local state
  const {
    data: masterTemplateData,
    isLoading: isLoadingMasterTemplate,
    refetch: refetchMasterTemplate,
  } = useMasterTemplate(selectedCity);

  const [customMasterTemplate, setCustomMasterTemplate] = useState<MasterTemplateItem | null>(null);

  // Sync default template from server if not locally edited
  const masterTemplate: MasterTemplateItem | null =
    customMasterTemplate || masterTemplateData?.data || null;

  // Clear local custom edits when city changes
  const handleCityChange = (city: string) => {
    setSelectedCityState(city);
    setCustomMasterTemplate(null);
  };

  const startAutomationMutation = useStartCityAutomation();
  const cancelAutomationMutation = useCancelCityAutomation();
  const resumeAutomationMutation = useResumeCityAutomation();

  // Template Editor Modal
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Confirm Launch Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // History Drawer
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Active Report View (if user launched or clicked a previous run)
  const [activeReportId, setActiveReportIdState] = useState<number | null>(() => {
    const saved = readStored("leadfinder_active_automation_id");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return null;
  });

  const setActiveReportId = (id: number | null) => {
    setActiveReportIdState(id);
    if (id) {
      writeStored("leadfinder_active_automation_id", id.toString());
    } else {
      clearStored(["leadfinder_active_automation_id"]);
    }
  };

  const {
    data: reportData,
    isLoading: isLoadingReport,
    refetch: refetchReport,
  } = useCityAutomationReport(activeReportId, {
    refetchInterval: (query: { state: { data?: { data?: { status?: string } } } }) => {
      if (typeof document !== "undefined" && document.hidden) return false;
      const st = query.state.data?.data?.status;
      return st === "running" || st === "processing" ? 2500 : false;
    },
  });

  const handleResetTemplate = async () => {
    setCustomMasterTemplate(null);
    await refetchMasterTemplate();
    message.success("Reset cold email template to default master copy");
  };

  const handleSaveEditedTemplate = (updated: MasterTemplateItem) => {
    setCustomMasterTemplate(updated);
    message.success("Master cold email template updated!");
  };

  const handleStartAutomation = async () => {
    if (!selectedCity || !masterTemplate) return;

    const payload: CityAutomationStartInput = {
      city: selectedCity,
      name: `Email Automation — ${selectedCity}`,
      template: {
        subject: masterTemplate.subject,
        body: masterTemplate.body,
        name: masterTemplate.name || `Universal Master Cold Email — ${selectedCity}`,
      },
    };

    try {
      const res = await startAutomationMutation.mutateAsync(payload);
      setConfirmModalOpen(false);
      if (res.data?.id) {
        setActiveReportId(res.data.id);
      }
    } catch {
      // Error handled by hook toast
    }
  };

  const handleCancelRun = async (campaignId: number) => {
    await cancelAutomationMutation.mutateAsync(campaignId);
    void refetchReport();
  };

  const handleResumeRun = async (campaignId: number) => {
    await resumeAutomationMutation.mutateAsync(campaignId);
    void refetchReport();
  };

  const eligibleCount = stats?.email_eligible_leads ?? 0;
  const hasTemplate = Boolean(masterTemplate && masterTemplate.subject && masterTemplate.body);

  // If viewing an active run report
  if (activeReportId && reportData?.data) {
    return (
      <PageContainer>
        <AutomationProgressView
          report={reportData.data}
          isLoading={isLoadingReport}
          onRefresh={() => void refetchReport()}
          onCancelRun={handleCancelRun}
          onResumeRun={handleResumeRun}
          isCancelling={cancelAutomationMutation.isPending}
          isResuming={resumeAutomationMutation.isPending}
          onStartNew={() => setActiveReportId(null)}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Banner */}
      <div className="lf-page-intro">
        <div className="lf-page-intro-copy">
          <h1 className="lf-page-title flex items-center gap-2.5">
            <MailOutlined className="text-[var(--lf-brand)]" />
            <span>Email Automation</span>
          </h1>
          <Paragraph type="secondary" className="lf-page-subtitle !mb-0">
            Launch cold outreach campaigns for leads across target cities with Gmail API delivery and one universal high-converting master email.
          </Paragraph>
        </div>

        <div className="lf-page-toolbar">
          <Button icon={<HistoryOutlined />} onClick={() => setHistoryDrawerOpen(true)}>
            Previous Automations
          </Button>
        </div>
      </div>

      {/* Gmail API Connection & Quota Status */}
      <GmailConnectionBanner
        status={gmailStatus}
        isLoading={isLoadingGmail}
        onConnect={handleConnectGmail}
        isConnecting={getAuthUrlMutation.isPending}
        onDisconnect={handleDisconnectGmail}
        isDisconnecting={disconnectGmailMutation.isPending}
      />

      {/* Workflow Step 1: City & Audience */}
      <CityAudienceCard
        cities={cities}
        isLoadingCities={isLoadingCities}
        selectedCity={selectedCity}
        onSelectCity={handleCityChange}
        stats={stats}
        isLoadingStats={isLoadingStats}
      />

      {/* Workflow Step 2: Universal Master Cold Email */}
      {selectedCity && (
        <MasterTemplateCard
          city={selectedCity}
          template={masterTemplate}
          onEdit={() => setIsEditingTemplate(true)}
          onReset={handleResetTemplate}
          isResetting={isLoadingMasterTemplate}
        />
      )}

      {/* Test Email Sending Section */}
      <TestEmailSection
        gmailStatus={gmailStatus}
        isLoadingStatus={isLoadingGmail}
        onConnectGmail={handleConnectGmail}
        isConnectingGmail={getAuthUrlMutation.isPending}
        onSendTestEmails={(payload) => sendTestEmailsMutation.mutateAsync(payload)}
        isSending={sendTestEmailsMutation.isPending}
      />

      {/* Workflow Step 3: Start Automation Action Bar */}
      {selectedCity && (
        <Card className="lf-workspace-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-[var(--lf-text)]">
                <RocketOutlined className="text-[var(--lf-brand)]" />
                <span>Ready to Launch Automation for {selectedCity}?</span>
              </div>
              <p className="!mb-0 mt-0.5 text-xs text-[var(--lf-text-muted)]">
                {hasTemplate
                  ? `${eligibleCount} email-eligible lead${eligibleCount === 1 ? "" : "s"} across Grades A, B, C, and D will receive this universal master cold email.`
                  : "Loading cold email template..."}
              </p>
            </div>

            <Space>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                disabled={!hasTemplate || eligibleCount === 0 || !gmailStatus?.is_connected}
                onClick={() => setConfirmModalOpen(true)}
                className="h-11 px-8 font-semibold"
              >
                Start Automation
              </Button>
            </Space>
          </div>
        </Card>
      )}

      {/* Modals & Drawers */}
      {isEditingTemplate && selectedCity && (
        <TemplateEditorModal
          open={isEditingTemplate}
          cityName={selectedCity}
          template={masterTemplate}
          onCancel={() => setIsEditingTemplate(false)}
          onSave={handleSaveEditedTemplate}
        />
      )}

      {confirmModalOpen && selectedCity && masterTemplate && (
        <AutomationConfirmModal
          open={confirmModalOpen}
          city={selectedCity}
          stats={stats}
          template={masterTemplate}
          onCancel={() => setConfirmModalOpen(false)}
          onConfirm={handleStartAutomation}
          isStarting={startAutomationMutation.isPending}
        />
      )}

      <AutomationHistoryDrawer
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        onSelectRun={(id) => setActiveReportId(id)}
      />
    </PageContainer>
  );
}

