import { useState } from "react";
import { Claim, UserMaster, UserRole } from "../types";
import { Search, Calendar, FileType, FileText, CheckCircle2, Clock, XCircle, ChevronRight, Eye, RefreshCw, Sparkles } from "lucide-react";

interface ClaimsListProps {
  claims: Claim[];
  currentUser: UserMaster;
}

export default function ClaimsList({ claims, currentUser }: ClaimsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const filtered = claims.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      c.particulars.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Pending" && (c.supervisorApprovalStatus === "Pending" || c.hrApprovalStatus === "Pending")) ||
      (statusFilter === "Approved" && c.hrApprovalStatus === "Approved" && c.accountsPaymentStatus !== "Paid") ||
      (statusFilter === "Paid" && c.accountsPaymentStatus === "Paid") ||
      (statusFilter === "Rejected" && (c.supervisorApprovalStatus === "Rejected" || c.hrApprovalStatus === "Rejected"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="claims_tracker_parent">
      {/* List content: spans 2 cols if a claim is selected to show side-by-side details, else spans 3 cols */}
      <div className={`${selectedClaim ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
        {/* Controls bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Claim ID, purpose..."
              className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs w-full bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
            <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
              {["All", "Pending", "Approved", "Paid", "Rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`text-[10px] font-bold px-2.5 py-1.5 rounded-md transition ${
                    statusFilter === s
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-slate-550 hover:text-slate-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Claims Table Layout */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4 font-normal">Date</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-center">Lifecycle Status</th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No matching registered travel claims found for current visibility scope.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          selectedClaim?.id === c.id ? "bg-teal-50/40" : ""
                        }`}
                        onClick={() => setSelectedClaim(c)}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {c.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-semibold text-slate-800">{c.employeeName}</div>
                            <div className="text-[10px] text-slate-400">{c.designation}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {c.date}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                          INR {c.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            c.recordStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : c.recordStatus === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Pending"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {c.recordStatus === "Paid" ? (
                              <>
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                <span>Paid & Settled</span>
                              </>
                            ) : c.recordStatus === "Rejected" ? (
                              <>
                                <XCircle className="h-2.5 w-2.5" />
                                <span>Claim Rejected</span>
                              </>
                            ) : c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Pending" ? (
                              <>
                                <Clock className="h-2.5 w-2.5 animate-pulse" />
                                <span>Pending HR</span>
                              </>
                            ) : (
                              <>
                                <Clock className="h-2.5 w-2.5" />
                                <span>Pending Sup</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <ChevronRight className="h-4 w-4 text-slate-400 inline" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side-slide selected claim receipt drawer */}
      {selectedClaim && (
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-6 h-fit" id="claim_drawer">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Expense Invoice voucher</span>
              <h3 className="text-sm font-bold text-slate-800 font-mono mt-0.5">{selectedClaim.id}</h3>
            </div>
            <button
              onClick={() => setSelectedClaim(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-50 hover:bg-slate-100 rounded-md transition"
            >
              Reset
            </button>
          </div>

          {/* Odometer Metrics / Travel Details */}
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Filing Person details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-slate-400 text-[10px]">Name</span>
                  <strong className="text-slate-700">{selectedClaim.employeeName}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Emp Code</span>
                  <strong className="text-slate-700 font-mono">{selectedClaim.employeeCode}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Department</span>
                  <strong className="text-slate-700">{selectedClaim.department}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Date of trip</span>
                  <strong className="text-slate-700">{selectedClaim.date}</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trip particulars</h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-sans">
                {selectedClaim.particulars}
              </p>
            </div>

            {/* Calculations review */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-150 p-3 rounded-xl text-center">
              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold">Start (KM)</span>
                <span className="text-xs font-mono font-bold text-slate-700">{selectedClaim.openingReading}</span>
              </div>
              <div>
                <span className="block text-slate-400 text-[9px] uppercase font-bold">End (KM)</span>
                <span className="text-xs font-mono font-bold text-slate-700">{selectedClaim.closingReading}</span>
              </div>
              <div>
                <span className="block text-teal-600 text-[9px] uppercase font-bold">Total KMs</span>
                <span className="text-xs font-mono font-bold text-teal-700">{selectedClaim.readingDifference} KM</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 font-bold text-slate-500 uppercase text-[9px]">
                Expense Breakdowns
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Travel Allowance (T.A.):</span>
                  <span className="font-semibold text-slate-700">INR {selectedClaim.ta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Daily Allowance (D.A.):</span>
                  <span className="font-semibold text-slate-700">INR {selectedClaim.da.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hotel Accommodation:</span>
                  <span className="font-semibold text-slate-700">INR {selectedClaim.hotel.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Expenses:</span>
                  <span className="font-semibold text-slate-700">INR {selectedClaim.mobileExp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Other Miscellaneous:</span>
                  <span className="font-semibold text-slate-700">INR {selectedClaim.otherExp.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-bold text-teal-700 text-sm">
                  <span>Grand Total Claim:</span>
                  <span>INR {selectedClaim.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Pipeline Stage Updates */}
            <div className="space-y-2 text-xs">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approval Ledger logs</h4>

              <div className="space-y-2 border-l-2 border-slate-105 pl-4 ml-2">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="w-1.5 h-1.5 bg-teal-600 rounded-full"></span>
                    Supervisor Status: {selectedClaim.supervisorApprovalStatus}
                  </div>
                  {selectedClaim.supervisorRemarks && (
                    <p className="text-slate-400 text-[10px] mt-0.5">"{selectedClaim.supervisorRemarks}"</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                    HR Status: {selectedClaim.hrApprovalStatus}
                  </div>
                  {selectedClaim.hrRemarks && (
                    <p className="text-slate-400 text-[10px] mt-0.5">"{selectedClaim.hrRemarks}"</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                    Payment Status: {selectedClaim.accountsPaymentStatus}
                  </div>
                  {selectedClaim.accountsRemarks && (
                    <p className="text-slate-400 text-[10px] mt-0.5">"{selectedClaim.accountsRemarks}"</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 flex justify-between gap-2 text-xs">
              <a
                href={selectedClaim.billUploadFileLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-center font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                View Bill Receipt
              </a>
              <button
                onClick={() => {
                  alert(`PDF simulated compile completed for Voucher ID ${selectedClaim.id}.\nLink attached and synced to Google Sheet database.`);
                }}
                className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-center font-bold tracking-wide transition flex items-center justify-center gap-1.5 border border-teal-200"
              >
                <FileType className="h-3.5 w-3.5" />
                Draft Voucher PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
