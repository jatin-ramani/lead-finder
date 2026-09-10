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

const { Title, Paragraph } = Typography;

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
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("leadfinder_active_automation_id");
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
    return null;
  });

  const setActiveReportId = (id: number | null) => {
    setActiveReportIdState(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem("leadfinder_active_automation_id", id.toString());
      } else {
        localStorage.removeItem("leadfinder_active_automation_id");
      }
    }
  };

  const {
    data: reportData,
    isLoading: isLoadingReport,
    refetch: refetchReport,
  } = useCityAutomationReport(activeReportId, {
    refetchInterval: (query: { state: { data?: { data?: { status?: string } } } }) => {
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Title level={2} className="!mb-1 flex items-center gap-2.5">
            <MailOutlined className="text-blue-600" />
            <span>Email Automation</span>
          </Title>
          <Paragraph type="secondary" className="!mb-0 text-sm">
            Launch cold outreach campaigns for leads across target cities with Gmail API delivery and one universal high-converting master email.
          </Paragraph>
        </div>

        <Button
          icon={<HistoryOutlined />}
          onClick={() => setHistoryDrawerOpen(true)}
          className="shadow-sm"
        >
          Previous Automations
        </Button>
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
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <RocketOutlined className="text-blue-600" />
                <span>Ready to Launch Automation for {selectedCity}?</span>
              </div>
              <p className="text-xs text-gray-500 !mb-0 mt-0.5">
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
                className="bg-emerald-600 hover:bg-emerald-700 border-none shadow-md font-semibold px-8 h-11"
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
    </div>
  );
}

