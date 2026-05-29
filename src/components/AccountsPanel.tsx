import { useState } from "react";
import { Claim, UserMaster, UserRole } from "../types";
import { CreditCard, CheckCircle2, Calendar, FileCheck2, ExternalLink, Sparkles } from "lucide-react";

interface AccountsPanelProps {
  claims: Claim[];
  currentUser: UserMaster;
  onUpdatePayment: (submissionNo: string, paymentStatus: "Paid" | "Pending", paymentDate: string, remarks: string) => void;
}

export default function AccountsPanel({ claims, currentUser, onUpdatePayment }: AccountsPanelProps) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks, setRemarks] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filter to show only fully HR approved claims for reconciliation
  const realizableClaims = claims.filter(
    (c) => c.supervisorApprovalStatus === "Approved" && c.hrApprovalStatus === "Approved"
  );

  const handleProcessPayment = (submissionNo: string) => {
    if (!remarks.trim()) {
      alert("Please specify a payment reference, EFT transaction ID, or general Accounts remarks.");
      return;
    }

    onUpdatePayment(submissionNo, "Paid", paymentDate, remarks);
    setSelectedClaimId(null);
    setRemarks("");
    setFeedback(`Payment successfully settled for claim ${submissionNo}! Dispatch notification sent.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6" id="accounts_panel_root">
      {feedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold">{feedback}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-700" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm font-sans uppercase tracking-wider">
                Accounts Settlement pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Displaying HR-certified vouchers. Review attachments and execute banking reference releases.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-[10px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-normal">Claim ID</th>
                <th className="py-2.5 px-4">Employee</th>
                <th className="py-2.5 px-4">Line Managers Audit Certs</th>
                <th className="py-2.5 px-4 text-right">Settlement Total</th>
                <th className="py-2.5 px-4 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Payment Ledger Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {realizableClaims.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No fully approved claims are currently in the Accounts ledger for settlement.
                  </td>
                </tr>
              ) : (
                realizableClaims.map((c) => {
                  const isProcessing = selectedClaimId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                      <td className="py-3.5 px-4">
                        <div>
                          <strong className="text-slate-800">{c.employeeName}</strong>
                          <div className="text-[10px] text-slate-400">{c.department} • {c.date}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-[10px]">
                          <span className="block text-slate-500">
                            <strong>Sup Approved:</strong> {c.supervisorName} ({c.supervisorRemarks || "None"})
                          </span>
                          <span className="block text-slate-500">
                            <strong>HR Certified:</strong> {c.hrName} ({c.hrRemarks || "None"})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        INR {c.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          c.accountsPaymentStatus === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                        }`}>
                          {c.accountsPaymentStatus === "Paid" ? "Cleared (Paid)" : "Awaiting EFT"}
                        </span>
                        {c.paymentDate && (
                          <div className="text-[9px] text-slate-400 mt-0.5 font-mono">{c.paymentDate}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.accountsPaymentStatus === "Paid" ? (
                          <div className="text-center text-[10px] font-mono text-slate-400">
                            Txn Ref: <span className="font-semibold text-slate-600">{c.accountsRemarks}</span>
                          </div>
                        ) : isProcessing ? (
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-205 space-y-2 mt-1">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Value Date</label>
                                <input
                                  type="date"
                                  value={paymentDate}
                                  onChange={(e) => setPaymentDate(e.target.value)}
                                  className="border border-slate-200 text-xs rounded p-1 w-full bg-white font-mono"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Reference No / EFT ID</label>
                                <input
                                  type="text"
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  placeholder="Txn ID, Check No."
                                  className="border border-slate-200 text-xs rounded p-1 w-full bg-white"
                                />
                              </div>
                            </div>
                            <div className="flex gap-1.5 justify-end">
                              <button
                                onClick={() => setSelectedClaimId(null)}
                                className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 hover:bg-slate-100 rounded transition"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleProcessPayment(c.id)}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded transition hover:bg-emerald-700 cursor-pointer"
                              >
                                Release Payment
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <button
                              onClick={() => setSelectedClaimId(c.id)}
                              className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg border border-teal-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              <FileCheck2 className="h-3 w-3" />
                              Settle Claim EFT
                            </button>
                          </div>
                        )}
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
  );
}
