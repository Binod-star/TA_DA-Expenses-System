import React, { useState } from "react";
import { UserMaster, FormField, AccessRule, EmailTemplate, NotificationRule, MailLogEntry, AuditLogEntry, SystemSettings, UserRole } from "../types";
import { Users, FormInput, Lock, Mail, FileCode2, Terminal, ClipboardCheck, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Eye, RefreshCw, Layers } from "lucide-react";

interface AdminSettingsProps {
  users: UserMaster[];
  formFields: FormField[];
  accessRules: AccessRule[];
  emailTemplates: EmailTemplate[];
  notificationRules: NotificationRule[];
  mailLog: MailLogEntry[];
  auditLog: AuditLogEntry[];
  systemSettings: SystemSettings;
  onUpdateUsers: (newUsers: UserMaster[]) => void;
  onUpdateFormFields: (newFields: FormField[]) => void;
  onUpdateAccessRules: (newRules: AccessRule[]) => void;
  onUpdateNotificationRules: (newRules: NotificationRule[]) => void;
  onUpdateEmailTemplates: (newTemplates: EmailTemplate[]) => void;
  onResetDatabase: () => void;
}

export default function AdminSettings({
  users,
  formFields,
  accessRules,
  emailTemplates,
  notificationRules,
  mailLog,
  auditLog,
  systemSettings,
  onUpdateUsers,
  onUpdateFormFields,
  onUpdateAccessRules,
  onUpdateNotificationRules,
  onUpdateEmailTemplates,
  onResetDatabase
}: AdminSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "form" | "access" | "mail" | "templates" | "mailLog" | "auditLog">("users");

  // User Mgmt state
  const [newUser, setNewUser] = useState<Partial<UserMaster>>({
    email: "", name: "", code: "", designation: "", state: "", department: "",
    supervisorName: "", supervisorEmail: "", hrName: "", hrEmail: "", role: UserRole.EMPLOYEE, active: true
  });
  const [userSuccess, setUserSuccess] = useState<string | null>(null);

  // Email Template preview mapping
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.name || !newUser.code) {
      alert("Please specify Email, Employee Name, and Code details.");
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === newUser.email?.toLowerCase())) {
      alert("A registered employee with this Email address already exists inside User Master.");
      return;
    }

    const updated = [...users, newUser as UserMaster];
    onUpdateUsers(updated);
    setNewUser({
      email: "", name: "", code: "", designation: "", state: "", department: "",
      supervisorName: "", supervisorEmail: "", hrName: "", hrEmail: "", role: UserRole.EMPLOYEE, active: true
    });
    setUserSuccess(`Successfully registered ${newUser.name} inside simulated User Master!`);
    setTimeout(() => setUserSuccess(null), 3000);
  };

  const handleToggleUserActive = (email: string) => {
    const updated = users.map((u) => {
      if (u.email === email) return { ...u, active: !u.active };
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleToggleFieldRequired = (fieldId: string) => {
    const updated = formFields.map((f) => {
      if (f.id === fieldId) return { ...f, required: !f.required };
      return f;
    });
    onUpdateFormFields(updated);
  };

  const handleToggleFieldVisible = (fieldId: string, role: "visibleToEmployee" | "visibleToSupervisor" | "visibleToHR" | "visibleToAccounts") => {
    const updated = formFields.map((f) => {
      if (f.id === fieldId) return { ...f, [role]: !f[role] };
      return f;
    });
    onUpdateFormFields(updated);
  };

  const handleUpdateAccessRuleVisibility = (roleName: string, menuName: string, visibility: any) => {
    const updated = accessRules.map((r) => {
      if (r.role === roleName && r.menuName === menuName) {
        return { ...r, dataVisibilityType: visibility };
      }
      return r;
    });
    onUpdateAccessRules(updated);
  };

  const handleToggleNotificationTarget = (mailType: string, prop: keyof NotificationRule) => {
    const updated = notificationRules.map((r) => {
      if (r.mailType === mailType) {
        return { ...r, [prop]: !r[prop] };
      }
      return r;
    });
    onUpdateNotificationRules(updated);
  };

  const handleTemplateChange = (index: number, field: keyof EmailTemplate, val: string) => {
    const updated = [...emailTemplates];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateEmailTemplates(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-5 min-h-[500px]" id="admin_settings_parent_grid">
      {/* Subtab Navigation Left Sidebar */}
      <div className="lg:col-span-1 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
          Settings Panels
        </div>
        
        <button
          onClick={() => setActiveSubTab("users")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition ${
            activeSubTab === "users" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Master</span>
        </button>

        <button
          onClick={() => setActiveSubTab("form")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition ${
            activeSubTab === "form" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FormInput className="h-4 w-4" />
          <span>Form Builder</span>
        </button>

        <button
          onClick={() => setActiveSubTab("access")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition ${
            activeSubTab === "access" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Access Control</span>
        </button>

        <button
          onClick={() => setActiveSubTab("mail")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition ${
            activeSubTab === "mail" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Mail Settings</span>
        </button>

        <button
          onClick={() => setActiveSubTab("templates")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition ${
            activeSubTab === "templates" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode2 className="h-4 w-4" />
          <span>Email Templates</span>
        </button>

        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-6 pb-2">
          Simulation Logs
        </div>

        <button
          onClick={() => setActiveSubTab("mailLog")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] font-mono transition ${
            activeSubTab === "mailLog" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>Mail_Log.csv ({mailLog.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("auditLog")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-[11px] font-mono transition ${
            activeSubTab === "auditLog" ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Audit_Log.csv ({auditLog.length})</span>
        </button>

        <div className="pt-8 px-2">
          <button
            onClick={() => {
              if (window.confirm("Restore simulated spreadsheet tables to default installation seed state? This resets logs.")) {
                onResetDatabase();
              }
            }}
            className="w-full py-1.5 text-[10px] bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-bold transition cursor-pointer"
          >
            Reset DB Seed
          </button>
        </div>
      </div>

      {/* Detail Area Content */}
      <div className="lg:col-span-4 p-6 overflow-auto max-h-[650px]">
        
        {/* TAB 1: User Master directory */}
        {activeSubTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-105 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Sheet : User_Master
                </h3>
                <p className="text-xs text-slate-500">
                  Dynamic profiles lookup index used for autofilling and workflow routing.
                </p>
              </div>
            </div>

            {userSuccess && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-2.5 rounded-lg text-xs font-semibold">
                {userSuccess}
              </div>
            )}

            {/* Register New User forms */}
            <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-xl border border-slate-201 space-y-4 text-xs">
              <div className="text-xs font-bold text-slate-650 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-teal-700" />
                Add New Employee Profile Row
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  type="email"
                  placeholder="Employee Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Emp Code (EMP-...)"
                  value={newUser.code}
                  onChange={(e) => setNewUser({ ...newUser, code: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newUser.state}
                  onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                />
                <input
                  type="text"
                  placeholder="Supervisor Name"
                  value={newUser.supervisorName}
                  onChange={(e) => setNewUser({ ...newUser, supervisorName: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                />
                <input
                  type="email"
                  placeholder="Supervisor Email"
                  value={newUser.supervisorEmail}
                  onChange={(e) => setNewUser({ ...newUser, supervisorEmail: e.target.value })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="border border-slate-200 text-xs rounded p-2 bg-white"
                >
                  {Object.values(UserRole).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded font-bold cursor-pointer transition"
                >
                  Append User Row
                </button>
              </div>
            </form>

            {/* List directory tabular */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Designation</th>
                    <th className="py-2.5 px-3">Supervisor</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 uppercase text-[10.5px]">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-mono text-slate-500 lowercase">{u.email}</td>
                      <td className="py-2 px-3 font-bold text-slate-850">{u.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{u.code}</td>
                      <td className="py-2 px-3 text-slate-500 lowercase first-letter:uppercase">{u.designation}</td>
                      <td className="py-2 px-3 text-slate-500 lowercase first-letter:uppercase">{u.supervisorName}</td>
                      <td className="py-2 px-3 text-slate-650 font-semibold">{u.role}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleUserActive(u.email)}
                          className={`px-2 py-0.5 rounded font-bold text-[9px] cursor-pointer ${
                            u.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-150"
                          }`}
                        >
                          {u.active ? "TRUE" : "FALSE"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Form Builder settings */}
        {activeSubTab === "form" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Dynamic Form Builder Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure fields, adjust validation mandates, and selectively block views across employee, supervisor, HR, and accounts forms.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-3">Field Label</th>
                    <th className="py-3 px-3">Source / Type</th>
                    <th className="py-3 px-3 text-center">Mandatory</th>
                    <th className="py-3 px-3 text-center">Vis to Employee</th>
                    <th className="py-3 px-3 text-center">Vis to Sup</th>
                    <th className="py-3 px-3 text-center">Vis to HR</th>
                    <th className="py-3 px-3 text-center">Vis to Acc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {formFields.map((f) => {
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-800">{f.label}</strong>
                          <div className="text-[9px] text-slate-400 font-mono italic">{f.section} / {f.id}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold font-mono">
                            {f.type}
                          </span>
                          {f.formula && (
                            <div className="text-[9px] text-teal-650 font-mono mt-0.5">fx: {f.formula}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFieldRequired(f.id)}
                            className={`px-2 py-0.5 rounded font-bold text-[9px] cursor-pointer ${
                              f.required ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-slate-50 text-slate-500"
                            }`}
                          >
                            {f.required ? "REQUIRED" : "OPTIONAL"}
                          </button>
                        </td>
                        {/* Visibility toggles */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={f.visibleToEmployee}
                            onChange={() => handleToggleFieldVisible(f.id, "visibleToEmployee")}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={f.visibleToSupervisor}
                            onChange={() => handleToggleFieldVisible(f.id, "visibleToSupervisor")}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={f.visibleToHR}
                            onChange={() => handleToggleFieldVisible(f.id, "visibleToHR")}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={f.visibleToAccounts}
                            onChange={() => handleToggleFieldVisible(f.id, "visibleToAccounts")}
                            className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Access Control table */}
        {activeSubTab === "access" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Role Permissions Mapping (Spreadsheet Access rules)
              </h3>
              <p className="text-xs text-slate-400">
                Manage screen permissions, crud action states, and data encapsulation levels of employees, supervisors, and HR accounts.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Target Panel</th>
                    <th className="py-3 px-3 text-center">View</th>
                    <th className="py-3 px-3 text-center">Add</th>
                    <th className="py-3 px-3 text-center">Edit</th>
                    <th className="py-3 px-3 text-center">Approval Control</th>
                    <th className="py-3 px-3">Row Data encapsulation Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessRules.map((r, idx) => {
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-2.5 px-3">
                          <strong className="text-slate-800">{r.role}</strong>
                        </td>
                        <td className="py-2.5 px-3 text-slate-650">{r.menuName}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.canView ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                            {r.canView ? "TRUE" : "FALSE"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.canAdd ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                            {r.canAdd ? "TRUE" : "FALSE"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.canEdit ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                            {r.canEdit ? "TRUE" : "FALSE"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${r.canApprove ? "bg-emerald-50 text-emerald-700 font-bold" : "bg-slate-100 text-slate-400"}`}>
                            {r.canApprove ? "APPROVER" : "NONE"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={r.dataVisibilityType}
                            onChange={(e) => handleUpdateAccessRuleVisibility(r.role, r.menuName, e.target.value)}
                            className="text-[11px] font-bold border border-slate-200 rounded p-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 cursor-pointer"
                          >
                            <option value="Own Data Only">Own Data Only</option>
                            <option value="Team Data Only">Team Data Only</option>
                            <option value="Department Data Only">Department Data Only</option>
                            <option value="State Data Only">State Data Only</option>
                            <option value="All Data">All Data</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SMTP routing settings */}
        {activeSubTab === "mail" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Configurable Instant Email notifications Routing
              </h3>
              <p className="text-xs text-slate-400">
                Set triggering paths and targeted CC/BCC logs for system operations, bypassing sheet scripts adjustments.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden leading-relaxed text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-3 px-3">Mail Type & Trigger Event</th>
                    <th className="py-3 px-3 text-center">Enabled</th>
                    <th className="py-3 px-3 text-center">Send To Emp</th>
                    <th className="py-3 px-3 text-center">Send To Sup</th>
                    <th className="py-3 px-3 text-center">Send To HR</th>
                    <th className="py-3 px-3">Custom CC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {notificationRules.map((nr) => (
                    <tr key={nr.mailType} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-3">
                        <strong className="text-slate-850 block">{nr.mailType}</strong>
                        <span className="text-[9px] text-teal-700 font-bold bg-teal-50 px-1 rounded-full uppercase">
                           Trigger: {nr.triggerEvent}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={nr.enabled}
                          onChange={() => handleToggleNotificationTarget(nr.mailType, "enabled")}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={nr.sendToEmployee}
                          onChange={() => handleToggleNotificationTarget(nr.mailType, "sendToEmployee")}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={nr.sendToSupervisor}
                          onChange={() => handleToggleNotificationTarget(nr.mailType, "sendToSupervisor")}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={nr.sendToHR}
                          onChange={() => handleToggleNotificationTarget(nr.mailType, "sendToHR")}
                          className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={nr.ccList}
                          onChange={(e) => {
                            const updated = notificationRules.map((rule) => {
                              if (rule.mailType === nr.mailType) return { ...rule, ccList: e.target.value };
                              return rule;
                            });
                            onUpdateNotificationRules(updated);
                          }}
                          placeholder="management.cc@arvicon.com"
                          className="border border-slate-200 rounded p-1 bg-slate-50 text-[10.5px] w-full lowercase font-mono"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Email templates builder */}
        {activeSubTab === "templates" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-105 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Email Templates Builder
                </h3>
                <p className="text-xs text-slate-400">
                  Directly customize HTML contents, subject headlines, and footers with placeholder bindings.
                </p>
              </div>

              <select
                value={selectedTemplateIndex}
                onChange={(e) => setSelectedTemplateIndex(parseInt(e.target.value))}
                className="text-xs font-bold border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700"
              >
                {emailTemplates.map((t, index) => (
                  <option key={t.mailType} value={index}>{t.mailType}</option>
                ))}
              </select>
            </div>

            {/* Template Editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-xs font-sans">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1">Subject Headline</label>
                  <input
                    type="text"
                    value={emailTemplates[selectedTemplateIndex].subject}
                    onChange={(e) => handleTemplateChange(selectedTemplateIndex, "subject", e.target.value)}
                    className="border border-slate-205 rounded p-2.5 font-semibold text-slate-800"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1">Main HTML Body</label>
                  <textarea
                    rows={8}
                    value={emailTemplates[selectedTemplateIndex].body}
                    onChange={(e) => handleTemplateChange(selectedTemplateIndex, "body", e.target.value)}
                    className="border border-slate-205 rounded p-2.5 font-mono text-xs text-slate-700 leading-relaxed bg-slate-50"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1">Footer / Caution string</label>
                  <input
                    type="text"
                    value={emailTemplates[selectedTemplateIndex].footer}
                    onChange={(e) => handleTemplateChange(selectedTemplateIndex, "footer", e.target.value)}
                    className="border border-slate-205 rounded p-2.5 font-sans"
                  />
                </div>
              </div>

              {/* Template Render previews */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    Live Simulator Preview
                  </span>
                  
                  <div className="mt-4 bg-white p-4 rounded-lg border border-slate-150 min-h-[300px] text-xs space-y-3 font-sans shadow-inner">
                    <p className="text-slate-400 font-mono pb-2 border-b border-b-slate-100 text-[10px]">
                      <strong>Subject:</strong> {emailTemplates[selectedTemplateIndex].subject
                        .replace("{{Submission Number}}", "TADA-2026-00004")
                        .replace("{{Employee Name}}", "Rahul Sharma")}
                    </p>
                    
                    {/* Rendered simulated elements preview */}
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: emailTemplates[selectedTemplateIndex].body
                          .replace("{{Employee Name}}", "Rahul Sharma")
                          .replace("{{Supervisor Name}}", "Vikram Singh")
                          .replace("{{Submission Number}}", "TADA-2026-00004")
                          .replace("{{Date}}", "2026-05-29")
                          .replace("{{Grand Total}}", "2450")
                      }} 
                      className="text-slate-700 space-y-2 mt-4 leading-relaxed"
                    />
                    
                    <div 
                      dangerouslySetInnerHTML={{ __html: emailTemplates[selectedTemplateIndex].signature }}
                      className="text-slate-600 font-semibold"
                    />

                    <div 
                      dangerouslySetInnerHTML={{ __html: emailTemplates[selectedTemplateIndex].footer }}
                      className="text-[10px] text-slate-400 pt-3 border-t border-t-slate-100 italic"
                    />
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-400 leading-relaxed flex items-start gap-1 p-2.5 bg-slate-100 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>Variables like <code className="bg-white px-1 font-mono rounded text-teal-800">{"{{Employee Name}}"}</code> or <code className="bg-white px-1 font-mono rounded text-indigo-800">{"{{Submission Number}}"}</code> are automatically mapped by MailService.gs on execution.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Mail logs tracker */}
        {activeSubTab === "mailLog" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Sheet : Mail_Log
              </h3>
              <p className="text-xs text-slate-550">
                Audit ledger of every simulated SMTP outbound email with validation results or failure reasonings.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-[10.5px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp / Date</th>
                    <th className="py-2.5 px-3">Event Trigger</th>
                    <th className="py-2.5 px-3">Mail Title</th>
                    <th className="py-2.5 px-3">Recipient Address</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                  {mailLog.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-405 font-sans">
                        Mail Log database is currently empty. Fire submissions to register alerts.
                      </td>
                    </tr>
                  ) : (
                    mailLog.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-2 px-3 text-slate-450">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2 px-3 text-slate-650 font-sans">{log.triggerEvent}</td>
                        <td className="py-2 px-3 text-slate-700 font-sans font-semibold truncate max-w-xs">{log.subject}</td>
                        <td className="py-2 px-3 text-slate-500 lowercase">{log.recipient}</td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${log.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: System audits */}
        {activeSubTab === "auditLog" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Sheet : Audit_Log
              </h3>
              <p className="text-xs text-slate-555">
                Comprehensive security trail logging field alterations, old-new states, execution operators, and dates.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-[10.5px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 text-[9px] uppercase tracking-wider">
                    <th className="py-2.5 px-3">Audit Date</th>
                    <th className="py-2.5 px-3">User Email</th>
                    <th className="py-2.5 px-3">Operation Action</th>
                    <th className="py-2.5 px-3">Target Field</th>
                    <th className="py-2.5 px-3">Voucher Ref</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[10px]">
                  {auditLog.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-405 font-sans">
                        Audit database contains no recorded modification trails.
                      </td>
                    </tr>
                  ) : (
                    auditLog.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-2 px-3 text-slate-450">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2 px-3 text-slate-500 lowercase">{log.user}</td>
                        <td className="py-2 px-3"><span className="bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded text-[9px] font-sans font-bold">{log.action}</span></td>
                        <td className="py-2 px-3 text-slate-650">{log.fieldName}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{log.submissionNumber}</td>
                        <td className="py-2 px-3 text-slate-400 font-sans max-w-xxs truncate">"{log.remarks}"</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
