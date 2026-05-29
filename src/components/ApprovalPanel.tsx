import { useState } from "react";
import { Claim, UserMaster, UserRole } from "../types";
import { ClipboardList, CheckCircle2, XCircle, ShieldAlert, Sparkles, MessageCircle, AlertCircle } from "lucide-react";

interface ApprovalPanelProps {
  claims: Claim[];
  currentUser: UserMaster;
  onSupervisorAction: (submissionNo: string, status: "Approved" | "Rejected", remarks: string) => void;
  onHRAction: (submissionNo: string, status: "Approved" | "Rejected", remarks: string) => void;
}

export default function ApprovalPanel({ claims, currentUser, onSupervisorAction, onHRAction }: ApprovalPanelProps) {
  const [remarks, setRemarks] = useState("");
  const [bulkSelect, setBulkSelect] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Determine which items should be shown based on role access
  const pendingSupervisorClaims = claims.filter(
    (c) => c.supervisorApprovalStatus === "Pending" && (currentUser.role === UserRole.SUPER_ADMIN || c.supervisorEmail === currentUser.email)
  );

  const pendingHRClaims = claims.filter(
    (c) =>
      c.supervisorApprovalStatus === "Approved" &&
      c.hrApprovalStatus === "Pending" &&
      (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.HR)
  );

  const handleIndividualAction = (
    submissionNo: string,
    roleType: "Supervisor" | "HR",
    action: "Approved" | "Rejected"
  ) => {
    if (!remarks.trim()) {
      alert("Please specify review remarks before authorizing or rejecting this claim.");
      return;
    }

    if (roleType === "Supervisor") {
      onSupervisorAction(submissionNo, action, remarks);
    } else {
      onHRAction(submissionNo, action, remarks);
    }

    setRemarks("");
    setSuccessInfo(`Claim ${submissionNo} successfully registered as ${action}! Notification email triggered.`);
    setTimeout(() => setSuccessInfo(null), 3500);
  };

  const handleBulkApprove = (roleType: "Supervisor" | "HR") => {
    if (bulkSelect.length === 0) {
      alert("Please select at least one check block to perform bulk approvals.");
      return;
    }

    const defaultRemarks = remarks || "Bulk approved via Administrative action desk.";
    
    bulkSelect.forEach((skNo) => {
      if (roleType === "Supervisor") {
        onSupervisorAction(skNo, "Approved", defaultRemarks);
      } else {
        onHRAction(skNo, "Approved", defaultRemarks);
      }
    });

    setBulkSelect([]);
    setRemarks("");
    setSuccessInfo(`Bulk approved ${bulkSelect.length} claim(s) successfully!`);
    setTimeout(() => setSuccessInfo(null), 3500);
  };

  const handleToggleSelect = (id: string) => {
    if (bulkSelect.includes(id)) {
      setBulkSelect(bulkSelect.filter((i) => i !== id));
    } else {
      setBulkSelect([...bulkSelect, id]);
    }
  };

  return (
    <div className="space-y-6" id="approval_panel_root">
      {successInfo && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-2 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold">{successInfo}</p>
        </div>
      )}

      {/* Supervisor section */}
      {(currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.SUPERVISOR) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm font-sans uppercase tracking-wider">
                  Supervisor’s Evaluation Gate
                </h3>
                <p className="text-xs text-slate-500">
                  {pendingSupervisorClaims.length} employee claims awaiting your review.
                </p>
              </div>
            </div>

            {/* General Action block */}
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Remarks for review..."
                className="border border-slate-250 text-xs rounded-lg p-2 bg-white text-slate-700 w-full sm:w-52"
              />
              <button
                onClick={() => handleBulkApprove("Supervisor")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                Bulk Approve
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-[10px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-center w-12">Select</th>
                  <th className="py-2.5 px-4">Claim ID</th>
                  <th className="py-2.5 px-4 font-normal">Filing Person</th>
                  <th className="py-2.5 px-4">Odometer Log</th>
                  <th className="py-2.5 px-4 text-right">Grand Total</th>
                  <th className="py-2.5 px-4 text-center">Actions Menu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingSupervisorClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No pending travel claims awaiting supervisor signatures in this workspace.
                    </td>
                  </tr>
                ) : (
                  pendingSupervisorClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={bulkSelect.includes(c.id)}
                          onChange={() => handleToggleSelect(c.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <strong className="text-slate-800">{c.employeeName}</strong>
                          <div className="text-[10px] text-slate-400">{c.date} • {c.state}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {c.openingReading} - {c.closingReading} ({c.readingDifference} KM)
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        INR {c.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleIndividualAction(c.id, "Supervisor", "Approved")}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition border border-emerald-250 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleIndividualAction(c.id, "Supervisor", "Rejected")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition border border-rose-250 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HR Pipeline validation section */}
      {(currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.HR) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden pt-2">
          <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm font-sans uppercase tracking-wider">
                  HR DESK Clearance Desk
                </h3>
                <p className="text-xs text-slate-500">
                  {pendingHRClaims.length} supervisor-approved claims pending HR clearance.
                </p>
              </div>
            </div>

            {/* General Action block */}
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="HR audit remarks..."
                className="border border-slate-250 text-xs rounded-lg p-2 bg-white text-slate-700 w-full sm:w-52"
              />
              <button
                onClick={() => handleBulkApprove("HR")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                Bulk Approve
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 text-[10px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                  <th className="py-2.5 px-4 text-center w-12">Select</th>
                  <th className="py-2.5 px-4">Claim ID</th>
                  <th className="py-2.5 px-4 font-normal">Filing Person</th>
                  <th className="py-2.5 px-4">Supervisor Approval Logs</th>
                  <th className="py-2.5 px-4 text-right">Grand Total</th>
                  <th className="py-2.5 px-4 text-center">HR Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingHRClaims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No supervisor-approved claims awaiting HR audit.
                    </td>
                  </tr>
                ) : (
                  pendingHRClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={bulkSelect.includes(c.id)}
                          onChange={() => handleToggleSelect(c.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <strong className="text-slate-800">{c.employeeName}</strong>
                          <div className="text-[10px] text-slate-400">{c.date} • {c.department}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[10px] text-slate-500 italic bg-amber-50 p-2 rounded-lg border border-amber-100">
                          <strong>{c.supervisorName}:</strong> "{c.supervisorRemarks}"
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        INR {c.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleIndividualAction(c.id, "HR", "Approved")}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition border border-emerald-250 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleIndividualAction(c.id, "HR", "Rejected")}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition border border-rose-250 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
