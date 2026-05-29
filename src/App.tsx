import { useState, useEffect } from "react";
import { UserMaster, UserRole, Claim, FormField, AccessRule, EmailTemplate, NotificationRule, MailLogEntry, AuditLogEntry, SystemSettings } from "./types";
import {
  initialUsers,
  initialFormFields,
  initialAccessRules,
  initialEmailTemplates,
  initialNotificationRules,
  initialSystemSettings,
  initialClaims
} from "./mockData";
import Dashboard from "./components/Dashboard";
import TADAForm from "./components/TADAForm";
import ClaimsList from "./components/ClaimsList";
import ApprovalPanel from "./components/ApprovalPanel";
import AccountsPanel from "./components/AccountsPanel";
import AdminSettings from "./components/AdminSettings";
import ExportCenter from "./components/ExportCenter";
import {
  Home,
  FileSpreadsheet,
  FilePlus,
  ShieldCheck,
  CreditCard,
  Settings,
  CodeXml,
  Database,
  User,
  CheckCircle,
  Menu,
  ChevronDown
} from "lucide-react";

export default function App() {
  // 1. Core Simulated Sheet State Databases
  const [users, setUsers] = useState<UserMaster[]>(() => {
    const cached = localStorage.getItem("arvicon_users");
    return cached ? JSON.parse(cached) : initialUsers;
  });

  const [formFields, setFormFields] = useState<FormField[]>(() => {
    const cached = localStorage.getItem("arvicon_form_fields");
    return cached ? JSON.parse(cached) : initialFormFields;
  });

  const [accessRules, setAccessRules] = useState<AccessRule[]>(() => {
    const cached = localStorage.getItem("arvicon_access_rules");
    return cached ? JSON.parse(cached) : initialAccessRules;
  });

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(() => {
    const cached = localStorage.getItem("arvicon_email_templates");
    return cached ? JSON.parse(cached) : initialEmailTemplates;
  });

  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>(() => {
    const cached = localStorage.getItem("arvicon_notification_rules");
    return cached ? JSON.parse(cached) : initialNotificationRules;
  });

  const [claims, setClaims] = useState<Claim[]>(() => {
    const cached = localStorage.getItem("arvicon_claims");
    return cached ? JSON.parse(cached) : initialClaims;
  });

  const [mailLog, setMailLog] = useState<MailLogEntry[]>(() => {
    const cached = localStorage.getItem("arvicon_mail_log");
    return cached ? JSON.parse(cached) : [];
  });

  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => {
    const cached = localStorage.getItem("arvicon_audit_log");
    return cached ? JSON.parse(cached) : [];
  });

  const [systemSettings] = useState<SystemSettings>(initialSystemSettings);

  // 2. Active User Simulator Sessions
  const [activeUserIndex, setActiveUserIndex] = useState(5); // Default is Super Admin Devansh Mehta to configure initially
  const currentUser = users[activeUserIndex];

  // 3. Main Navigation Routing state
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [showLiveDb, setShowLiveDb] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Synchronize dynamic databases with client local storage
  useEffect(() => {
    localStorage.setItem("arvicon_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("arvicon_form_fields", JSON.stringify(formFields));
  }, [formFields]);

  useEffect(() => {
    localStorage.setItem("arvicon_access_rules", JSON.stringify(accessRules));
  }, [accessRules]);

  useEffect(() => {
    localStorage.setItem("arvicon_email_templates", JSON.stringify(emailTemplates));
  }, [emailTemplates]);

  useEffect(() => {
    localStorage.setItem("arvicon_notification_rules", JSON.stringify(notificationRules));
  }, [notificationRules]);

  useEffect(() => {
    localStorage.setItem("arvicon_claims", JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem("arvicon_mail_log", JSON.stringify(mailLog));
  }, [mailLog]);

  useEffect(() => {
    localStorage.setItem("arvicon_audit_log", JSON.stringify(auditLog));
  }, [auditLog]);

  // Utility resets
  const handleResetDatabase = () => {
    setUsers(initialUsers);
    setFormFields(initialFormFields);
    setAccessRules(initialAccessRules);
    setEmailTemplates(initialEmailTemplates);
    setNotificationRules(initialNotificationRules);
    setClaims(initialClaims);
    setMailLog([]);
    setAuditLog([
      {
        timestamp: new Date().toISOString(),
        user: "admin@arvicon.com",
        action: "Database Cleaned",
        sheetName: "All Sheets",
        rowNumber: "N/A",
        fieldName: "Reset System",
        oldValue: "Stale Records",
        newValue: "Seed Template Active",
        submissionNumber: "SYSTEM",
        remarks: "Hard database factory reset performed by admin settings."
      }
    ]);
    setActiveTab("dashboard");
    alert("Simulation sheets successfully restored to installation defaults.");
  };

  // 4. State Handlers simulating backend integrations
  const handleCreateClaim = (newClaim: Partial<Claim>) => {
    const claimIdNum = claims.length + 1;
    const formattedId = `TADA-2026-${String(claimIdNum).padStart(5, "0")}`;
    const timestamp = new Date().toISOString();

    const fullyFormedClaim: Claim = {
      ...newClaim as Claim,
      id: formattedId,
      timestamp,
      supervisorApprovalStatus: "Pending",
      supervisorApprovalDate: "",
      supervisorRemarks: "",
      hrApprovalStatus: "Pending",
      hrApprovalDate: "",
      hrRemarks: "",
      accountsPaymentStatus: "Pending",
      paymentDate: "",
      accountsRemarks: "",
      recordStatus: "Pending",
      createdBy: currentUser.email,
      updatedBy: currentUser.email,
      lastUpdatedTimestamp: timestamp
    };

    const newClaimsList = [fullyFormedClaim, ...claims];
    setClaims(newClaimsList);

    // Dynamic Audits trace
    logSimulationAudit("New Submission", "TA_DA Data", newClaimsList.length + 1, "Submission Number", "", formattedId, formattedId, "Registered employee claim successfully.");

    // Email Triggers Simulator
    dispatchSimulatorEmail("On New Submission", fullyFormedClaim);

    setActiveTab("list");
  };

  const handleSupervisorApproval = (submissionNo: string, status: "Approved" | "Rejected", remarks: string) => {
    const timestamp = new Date().toISOString();
    const prevList = [...claims];
    const targetIdx = prevList.findIndex((c) => c.id === submissionNo);
    
    if (targetIdx !== -1) {
      const oldVal = prevList[targetIdx].supervisorApprovalStatus;
      prevList[targetIdx] = {
        ...prevList[targetIdx],
        supervisorApprovalStatus: status,
        supervisorRemarks: remarks,
        supervisorApprovalDate: timestamp,
        updatedBy: currentUser.email,
        lastUpdatedTimestamp: timestamp,
        recordStatus: status === "Approved" ? "Pending" : "Rejected" // Pending HR if approved, rejected in pipeline
      };
      setClaims(prevList);

      logSimulationAudit("Supervisor Review", "TA_DA Data", targetIdx + 2, "Supervisor Approval Status", oldVal, status, submissionNo, remarks);

      // Trigger Email Notification simulating GAS trigger
      const eventName = status === "Approved" ? "On Supervisor Approval" : "On Supervisor Rejection";
      dispatchSimulatorEmail(eventName, prevList[targetIdx]);
    }
  };

  const handleHRApproval = (submissionNo: string, status: "Approved" | "Rejected", remarks: string) => {
    const timestamp = new Date().toISOString();
    const prevList = [...claims];
    const targetIdx = prevList.findIndex((c) => c.id === submissionNo);

    if (targetIdx !== -1) {
      const oldVal = prevList[targetIdx].hrApprovalStatus;
      prevList[targetIdx] = {
        ...prevList[targetIdx],
        hrApprovalStatus: status,
        hrRemarks: remarks,
        hrApprovalDate: timestamp,
        updatedBy: currentUser.email,
        lastUpdatedTimestamp: timestamp,
        recordStatus: status === "Approved" ? "Pending" : "Rejected" // Pending accounts/paid if approved, rejected if HR rejects
      };
      setClaims(prevList);

      logSimulationAudit("HR Review", "TA_DA Data", targetIdx + 2, "HR Approval Status", oldVal, status, submissionNo, remarks);

      const eventName = status === "Approved" ? "On HR Approval" : "On HR Rejection";
      dispatchSimulatorEmail(eventName, prevList[targetIdx]);
    }
  };

  const handleAccountsPayment = (submissionNo: string, paymentStatus: "Paid" | "Pending", paymentDate: string, remarks: string) => {
    const timestamp = new Date().toISOString();
    const prevList = [...claims];
    const targetIdx = prevList.findIndex((c) => c.id === submissionNo);

    if (targetIdx !== -1) {
      const oldVal = prevList[targetIdx].accountsPaymentStatus;
      prevList[targetIdx] = {
        ...prevList[targetIdx],
        accountsPaymentStatus: paymentStatus,
        paymentDate,
        accountsRemarks: remarks,
        updatedBy: currentUser.email,
        lastUpdatedTimestamp: timestamp,
        recordStatus: paymentStatus === "Paid" ? "Paid" : "Approved"
      };
      setClaims(prevList);

      logSimulationAudit("Payment Settled", "TA_DA Data", targetIdx + 2, "Accounts Payment Status", oldVal, paymentStatus, submissionNo, remarks);

      const eventName = paymentStatus === "Paid" ? "On Payment Paid" : "On Payment Pending";
      dispatchSimulatorEmail(eventName, prevList[targetIdx]);
    }
  };

  // 5. Utility Audit logs and Email routing generators
  const logSimulationAudit = (action: string, sheetName: string, rowNo: number, fieldName: string, oldValue: string, newValue: string, submissionNo: string, remarks: string) => {
    const logItem: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      user: currentUser.email,
      action,
      sheetName,
      rowNumber: String(rowNo),
      fieldName,
      oldValue,
      newValue,
      submissionNumber: submissionNo,
      remarks
    };
    setAuditLog((prev) => [logItem, ...prev]);
  };

  const dispatchSimulatorEmail = (triggerEvent: string, claimData: Claim) => {
    // Check SMTP trigger active
    const rule = notificationRules.find((n) => n.triggerEvent === triggerEvent);
    if (!rule || !rule.enabled) return;

    // Fetch message templates
    const template = emailTemplates.find((t) => t.triggerEvent === triggerEvent);
    if (!template) return;

    // Pick target mailbox
    let recipientAddress = "";
    if (rule.sendToEmployee) recipientAddress = claimData.employeeEmail;
    else if (rule.sendToSupervisor) recipientAddress = claimData.supervisorEmail;
    else if (rule.sendToHR) recipientAddress = claimData.hrEmail;
    else recipientAddress = "management.alerts@arvicon.com";

    // Format HTML preview blocks
    const placeholders: Record<string, string> = {
      "{{Submission Number}}": claimData.id,
      "{{Employee Name}}": claimData.employeeName,
      "{{Employee Code}}": claimData.employeeCode,
      "{{Date}}": claimData.date,
      "{{Grand Total}}": String(claimData.grandTotal),
      "{{Supervisor Name}}": claimData.supervisorName,
      "{{Bill Upload File Link}}": claimData.billUploadFileLink
    };

    let subject = template.subject;
    Object.keys(placeholders).forEach((k) => {
      subject = subject.replace(new RegExp(k, "g"), placeholders[k]);
    });

    const mailItem: MailLogEntry = {
      timestamp: new Date().toISOString(),
      mailType: template.mailType,
      triggerEvent,
      submissionNumber: claimData.id,
      recipient: recipientAddress,
      cc: rule.ccList || "None",
      bcc: rule.bccList || "None",
      subject,
      status: "Success",
      errorMessage: "",
      sentBy: "smtp.gmail.com (GAS Secure Daemon)",
      relatedEmployee: claimData.employeeEmail
    };

    setMailLog((prev) => [mailItem, ...prev]);
  };

  // 6. User rights dynamic filters
  const getSimulatedClaimsSubset = () => {
    // Supervisors see team claims, Sales/Employees see own, HR/Admin see everything
    const roleAccessRule = accessRules.find((rule) => rule.role === currentUser.role && rule.menuName === "Claims List");
    const scope = roleAccessRule?.dataVisibilityType || "Own Data Only";

    if (scope === "All Data" || currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.MIS_ADMIN) {
      return claims;
    } else if (scope === "Team Data Only") {
      return claims.filter((c) => c.supervisorEmail.toLowerCase() === currentUser.email.toLowerCase());
    } else if (scope === "Own Data Only") {
      return claims.filter((c) => c.employeeEmail.toLowerCase() === currentUser.email.toLowerCase());
    }
    return [];
  };

  const isTabVisible = (tabId: string) => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    
    // Map tabs to menus specified in access control rules
    let menuName = "";
    if (tabId === "dashboard") menuName = "Dashboard";
    else if (tabId === "form") menuName = "TA/DA Form";
    else if (tabId === "list") menuName = "Claims List";
    else if (tabId === "approvals") menuName = "Approval Panel";
    else if (tabId === "accounts") menuName = "Accounts Panel";
    else if (tabId === "settings") menuName = "Admin Settings";
    else if (tabId === "export") return true; // Always visible developer workspace

    const rule = accessRules.find((r) => r.role === currentUser.role && r.menuName === menuName);
    return rule ? rule.canView : false;
  };

  const visibleClaimsSubset = getSimulatedClaimsSubset();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-600 selection:text-white antialiased">
      {/* Floating Control Widget allowing role switches */}
      <div className="bg-slate-900 text-slate-100 px-6 py-2.5 shadow-md border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 relative z-50">
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4 text-teal-400 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">TA/DA Ecosystem Simulation Context</span>
            <div className="font-bold text-white tracking-wide text-xs">Arvicon ERP Management Studio Dev Version</div>
          </div>
        </div>

        {/* User Swapper control */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Role session:</span>
          <div className="relative group">
            <select
              value={activeUserIndex}
              onChange={(e) => {
                setActiveUserIndex(parseInt(e.target.value));
                setMobileMenuOpen(false);
              }}
              className="appearance-none pr-8 pl-3 py-1 bg-slate-800 hover:bg-slate-705 border border-slate-700 text-teal-300 rounded font-bold text-[11px] outline-none focus:border-teal-400 cursor-pointer"
            >
              {users.map((u, index) => (
                <option key={u.email} value={index}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Primary Workspace container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-850 flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-850 flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold tracking-tight shadow">
                AI
              </div>
              <div>
                <h1 className="text-sm font-bold text-white font-sans tracking-wide">Arvicon Int.</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider">TA/DA Portal Hub</p>
              </div>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden text-slate-300 p-1 bg-slate-800 rounded hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <nav className={`flex-1 py-4 px-3 space-y-1 md:block ${mobileMenuOpen ? "block" : "hidden"}`}>
            {isTabVisible("dashboard") && (
              <button
                onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "dashboard" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Home className="h-4.5 w-4.5 shrink-0" />
                <span>Dashboard overview</span>
              </button>
            )}

            {isTabVisible("form") && (
              <button
                onClick={() => { setActiveTab("form"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "form" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <FilePlus className="h-4.5 w-4.5 shrink-0" />
                <span>Submit TA/DA Expense</span>
              </button>
            )}

            {isTabVisible("list") && (
              <button
                onClick={() => { setActiveTab("list"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "list" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="h-4.5 w-4.5 shrink-0" />
                <span>Track My Claims</span>
              </button>
            )}

            {isTabVisible("approvals") && (
              <button
                onClick={() => { setActiveTab("approvals"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "approvals" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
                <span>Managers approvals Desk</span>
              </button>
            )}

            {isTabVisible("accounts") && (
              <button
                onClick={() => { setActiveTab("accounts"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "accounts" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <CreditCard className="h-4.5 w-4.5 shrink-0" />
                <span>Accounts Settlement</span>
              </button>
            )}

            {isTabVisible("settings") && (
              <button
                onClick={() => { setActiveTab("settings"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "settings" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Settings className="h-4.5 w-4.5 shrink-0" />
                <span>Spreadsheets Configurator</span>
              </button>
            )}

            <div className="pt-4 border-t border-slate-850">
              <button
                onClick={() => { setActiveTab("export"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition ${
                  activeTab === "export" ? "bg-teal-700 text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <CodeXml className="h-4.5 w-4.5 shrink-0 text-teal-400" />
                <span>Ready Google Script Code</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-850 space-y-2 mt-auto text-xs">
            <button
              onClick={() => setShowLiveDb(!showLiveDb)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-teal-400" />
              <span>{showLiveDb ? "Hide Simulated Sheets" : "Live Worksheet logs"}</span>
            </button>
          </div>
        </aside>

        {/* Primary Main Workspace Panels area */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {activeTab === "dashboard" && isTabVisible("dashboard") && (
            <Dashboard 
              claims={visibleClaimsSubset} 
              currentUser={currentUser} 
              onNavigateToTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === "form" && isTabVisible("form") && (
            <TADAForm
              users={users}
              currentUser={currentUser}
              formFields={formFields}
              onSubmitClaim={handleCreateClaim}
            />
          )}

          {activeTab === "list" && isTabVisible("list") && (
            <ClaimsList claims={visibleClaimsSubset} currentUser={currentUser} />
          )}

          {activeTab === "approvals" && isTabVisible("approvals") && (
            <ApprovalPanel
              claims={claims}
              currentUser={currentUser}
              onSupervisorAction={handleSupervisorApproval}
              onHRAction={handleHRApproval}
            />
          )}

          {activeTab === "accounts" && isTabVisible("accounts") && (
            <AccountsPanel
              claims={claims}
              currentUser={currentUser}
              onUpdatePayment={handleAccountsPayment}
            />
          )}

          {activeTab === "settings" && isTabVisible("settings") && (
            <AdminSettings
              users={users}
              formFields={formFields}
              accessRules={accessRules}
              emailTemplates={emailTemplates}
              notificationRules={notificationRules}
              mailLog={mailLog}
              auditLog={auditLog}
              systemSettings={systemSettings}
              onUpdateUsers={setUsers}
              onUpdateFormFields={setFormFields}
              onUpdateAccessRules={setAccessRules}
              onUpdateNotificationRules={setNotificationRules}
              onUpdateEmailTemplates={setEmailTemplates}
              onResetDatabase={handleResetDatabase}
            />
          )}

          {activeTab === "export" && (
            <ExportCenter />
          )}

          {/* Integrated Spreadsheet Live Database Visualizer */}
          {showLiveDb && (
            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden text-xs text-slate-300">
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></span>
                  <strong className="text-white">Active Simulated Worksheet View: TA_DA Data</strong>
                </div>
                <div className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded font-mono uppercase font-bold">
                  LOCAL_DB_STORE: Active
                </div>
              </div>

              <div className="overflow-x-auto max-h-[350px]">
                <table className="w-full text-left font-mono text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[9px] uppercase tracking-wide font-bold text-slate-500">
                      <th className="py-2 px-3">Submission ID</th>
                      <th className="py-2 px-3">Employee Name</th>
                      <th className="py-2 px-3 text-right">Grand Total</th>
                      <th className="py-2 px-3">Particulars</th>
                      <th className="py-2 px-3">Odometer</th>
                      <th className="py-2 px-3 text-center">Sup Status</th>
                      <th className="py-2 px-3 text-center">HR Status</th>
                      <th className="py-2 px-3 text-center">Payment Status</th>
                      <th className="py-2 px-3">Dispatched PO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-850/50">
                        <td className="py-2 px-3 font-semibold text-white">{claim.id}</td>
                        <td className="py-2 px-3 text-slate-300">{claim.employeeName}</td>
                        <td className="py-2 px-3 text-right font-bold text-teal-400">INR {claim.grandTotal}</td>
                        <td className="py-2 px-3 text-slate-400 truncate max-w-xxs" title={claim.particulars}>"{claim.particulars}"</td>
                        <td className="py-2 px-3 text-slate-400">{claim.openingReading} - {claim.closingReading} ({claim.readingDifference} KM)</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${claim.supervisorApprovalStatus === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-900" : "bg-amber-950 text-amber-300 border border-amber-900"}`}>
                            {claim.supervisorApprovalStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${claim.hrApprovalStatus === "Approved" ? "bg-emerald-950 text-emerald-300 border border-emerald-900" : "bg-amber-950 text-amber-300 border border-amber-900"}`}>
                            {claim.hrApprovalStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${claim.accountsPaymentStatus === "Paid" ? "bg-indigo-950 text-indigo-300 border border-indigo-900" : "bg-slate-800 text-slate-400"}`}>
                            {claim.accountsPaymentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500">{claim.dispatchedPoNo || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
