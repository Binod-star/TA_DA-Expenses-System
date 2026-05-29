import { Claim, UserMaster, UserRole } from "../types";
import { DollarSign, ShieldAlert, Award, FileText, TrendingUp, RefreshCcw, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useState } from "react";

interface DashboardProps {
  claims: Claim[];
  currentUser: UserMaster;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ claims, currentUser, onNavigateToTab }: DashboardProps) {
  const [deptFilter, setDeptFilter] = useState("All");
  const [stateFilter, setStateFilter] = useState("All");

  // Filter claims based on user role view rights (already filtered in parent, but let's make dashboard filters work)
  const availableDepts = Array.from(new Set(claims.map((c) => c.department)));
  const availableStates = Array.from(new Set(claims.map((c) => c.state)));

  const filteredClaims = claims.filter((c) => {
    return (
      (deptFilter === "All" || c.department === deptFilter) &&
      (stateFilter === "All" || c.state === stateFilter)
    );
  });

  // Calculate statistics
  const totalClaims = filteredClaims.length;
  const supervisorPending = filteredClaims.filter((c) => c.supervisorApprovalStatus === "Pending");
  const hrPending = filteredClaims.filter((c) => c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Pending");
  const approvedClaims = filteredClaims.filter((c) => c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Approved");
  const rejectedClaims = filteredClaims.filter((c) => c.supervisorApprovalStatus === "Rejected" || c.hrApprovalStatus === "Rejected");
  
  const totalAmount = filteredClaims.reduce((sum, c) => sum + (c.grandTotal || 0), 0);
  const paidAmount = filteredClaims
    .filter((c) => c.accountsPaymentStatus === "Paid")
    .reduce((sum, c) => sum + (c.grandTotal || 0), 0);
  const unpaidAmount = filteredClaims
    .filter((c) => c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Approved" && c.accountsPaymentStatus === "Pending")
    .reduce((sum, c) => sum + (c.grandTotal || 0), 0);

  // Group by category/cost-center for small analysis
  const taTotal = filteredClaims.reduce((sum, c) => sum + (c.ta || 0), 0);
  const daTotal = filteredClaims.reduce((sum, c) => sum + (c.da || 0), 0);
  const hotelTotal = filteredClaims.reduce((sum, c) => sum + (c.hotel || 0), 0);
  const mobileTotal = filteredClaims.reduce((sum, c) => sum + (c.mobileExp || 0), 0);
  const otherTotal = filteredClaims.reduce((sum, c) => sum + (c.otherExp || 0), 0);

  return (
    <div className="space-y-6" id="dashboard_parent">
      {/* Filters bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-500">
            Active Workspace context: <span className="text-teal-700 font-bold">{currentUser.name}</span> ({currentUser.role})
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.SALESPERSON 
              ? "Displaying personal claim summary stats"
              : currentUser.role === UserRole.SUPERVISOR 
              ? "Displaying team-level reimbursement counters"
              : "Displaying organization-wide cumulative ledger"}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto self-end">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 hover:border-slate-300 transition"
          >
            <option value="All">All Departments</option>
            {availableDepts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-700 hover:border-slate-300 transition"
          >
            <option value="All">All States</option>
            {availableStates.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Numerical Bento Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total outlay */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Claims Value</span>
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800">INR {totalAmount.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Across {totalClaims} submissions</p>
          </div>
        </div>

        {/* Card 2: Supervisor Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Supervisor Pending</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800">{supervisorPending.length} Claims</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              INR {supervisorPending.reduce((s, c) => s + c.grandTotal, 0).toLocaleString()} value
            </p>
          </div>
        </div>

        {/* Card 3: Approved & Settled */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Approved Amount</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800">INR {paidAmount.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{approvedClaims.length} certified & paid records</p>
          </div>
        </div>

        {/* Card 4: Accounts Pending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Approved but Unpaid</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-slate-800">INR {unpaidAmount.toLocaleString()}</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Waiting in accounts clearance queue</p>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Cost distribution chart & status summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              Category Expense Breakdown
            </h3>
            {/* Visual breakdown progress bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Travel Allowance (T.A.)</span>
                  <span>INR {taTotal.toLocaleString()} ({totalAmount ? Math.round((taTotal / totalAmount) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: `${totalAmount ? (taTotal / totalAmount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Daily Allowance (D.A.)</span>
                  <span>INR {daTotal.toLocaleString()} ({totalAmount ? Math.round((daTotal / totalAmount) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${totalAmount ? (daTotal / totalAmount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Hotel Stay Accommodations</span>
                  <span>INR {hotelTotal.toLocaleString()} ({totalAmount ? Math.round((hotelTotal / totalAmount) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${totalAmount ? (hotelTotal / totalAmount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Mobile & Connectivity</span>
                  <span>INR {mobileTotal.toLocaleString()} ({totalAmount ? Math.round((mobileTotal / totalAmount) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${totalAmount ? (mobileTotal / totalAmount) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Other Miscellaneous Costs</span>
                  <span>INR {otherTotal.toLocaleString()} ({totalAmount ? Math.round((otherTotal / totalAmount) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${totalAmount ? (otherTotal / totalAmount) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Tasks / Metrics Quick links */}
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Claim Pipeline Stages
            </h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-emerald-100 text-emerald-700 p-1 rounded">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-700">1. Claim Lodging</h5>
                  <p className="text-[11px] text-slate-400">Instantly links files to Google Drive folder structure.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-amber-100 text-amber-700 p-1 rounded">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    2. Supervisor Review
                    <span className="bg-amber-100 text-amber-800 text-[9px] px-1 rounded-full font-bold">
                      {supervisorPending.length}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-400">Unresolved logs group supervisor-wise for digests.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-indigo-100 text-indigo-700 p-1 rounded">
                  <RefreshCcw className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    3. HR Verification
                    <span className="bg-indigo-100 text-indigo-800 text-[9px] px-1 rounded-full font-bold">
                      {hrPending.length}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-400">Verifies limits and exports accounts tables.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold uppercase text-slate-400">Quick Actions Desk</h4>
            <div className="grid grid-cols-2 gap-2">
              {(currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.SALESPERSON || currentUser.role === UserRole.SUPER_ADMIN) && (
                <button
                  onClick={() => onNavigateToTab("form")}
                  className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg text-center transition"
                >
                  Create Claim
                </button>
              )}
              {(currentUser.role === UserRole.SUPERVISOR || currentUser.role === UserRole.HR || currentUser.role === UserRole.SUPER_ADMIN) && (
                <button
                  onClick={() => onNavigateToTab("approvals")}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg text-center transition"
                >
                  Review Panel ({supervisorPending.length + hrPending.length})
                </button>
              )}
              {(currentUser.role === UserRole.ACCOUNTS || currentUser.role === UserRole.SUPER_ADMIN) && (
                <button
                  onClick={() => onNavigateToTab("accounts")}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg text-center transition"
                >
                  Disburse Pays
                </button>
              )}
              <button
                onClick={() => onNavigateToTab("list")}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg text-center transition"
              >
                Track Claims
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
