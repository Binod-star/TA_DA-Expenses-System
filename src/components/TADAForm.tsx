import React, { useState, useEffect } from "react";
import { UserMaster, Claim, FormField, UserRole } from "../types";
import { Loader2, CheckCircle2, AlertTriangle, FileUp, Hash } from "lucide-react";

interface TADAFormProps {
  users: UserMaster[];
  currentUser: UserMaster;
  formFields: FormField[];
  onSubmitClaim: (claimData: Partial<Claim>) => void;
}

export default function TADAForm({ users, currentUser, formFields, onSubmitClaim }: TADAFormProps) {
  // Find only active employee profiles
  const employees = users.filter((u) => u.active);

  // Maintain form input value states
  const [selectedEmail, setSelectedEmail] = useState("");
  const [date, setDate] = useState("");
  const [poNo, setPoNo] = useState("");
  const [particulars, setParticulars] = useState("");
  const [openingReading, setOpeningReading] = useState(0);
  const [closingReading, setClosingReading] = useState(0);
  const [ta, setTa] = useState(0);
  const [da, setDa] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [mobileExp, setMobileExp] = useState(0);
  const [otherExp, setOtherExp] = useState(0);
  const [dispatchedPoNo, setDispatchedPoNo] = useState("");
  
  // File upload simulation
  const [fileAttached, setFileAttached] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [driveFileUrl, setDriveFileUrl] = useState("");

  // Submission alerts feedback
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Synchronize when the simulator role changes
  useEffect(() => {
    if (currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.SALESPERSON) {
      setSelectedEmail(currentUser.email);
    } else {
      setSelectedEmail("");
    }
  }, [currentUser]);

  // Read active target profile details for autofill mapping
  const activeProfile = users.find((u) => u.email === selectedEmail);

  // Computations
  const readingDifference = Math.max(0, closingReading - openingReading);
  const grandTotal = ta + da + hotel + mobileExp + otherExp;

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileAttached(file);
      simulateDriveUpload(file.name);
    }
  };

  const simulateDriveUpload = (filename: string) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDriveFileUrl(`https://drive.google.com/file/d/1_ArviconBills_${Date.now()}_${encodeURIComponent(filename)}/view`);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedEmail) {
      setFormError("Please select a valid employee profile to file this expense report.");
      return;
    }

    if (closingReading < openingReading) {
      setFormError("Closing odometer reading cannot be smaller than pre-travel opening reading.");
      return;
    }

    if (grandTotal <= 0) {
      setFormError("Total claim value must exceed INR 0.");
      return;
    }

    if (!driveFileUrl) {
      setFormError("Please upload a supporting file or physical receipt voucher to complete claim submission.");
      return;
    }

    setSubmitting(true);

    // Simulate Apps Script delay duration
    setTimeout(() => {
      const generatedClaim: Partial<Claim> = {
        employeeName: activeProfile?.name || "",
        employeeCode: activeProfile?.code || "",
        employeeEmail: selectedEmail,
        designation: activeProfile?.designation || "",
        state: activeProfile?.state || "",
        department: activeProfile?.department || "",
        date,
        poNo,
        particulars,
        openingReading,
        closingReading,
        readingDifference,
        ta,
        da,
        hotel,
        mobileExp,
        otherExp,
        grandTotal,
        dispatchedPoNo,
        billUploadFileLink: driveFileUrl,
        supervisorName: activeProfile?.supervisorName || "",
        supervisorEmail: activeProfile?.supervisorEmail || "",
        hrName: activeProfile?.hrName || "",
        hrEmail: activeProfile?.hrEmail || ""
      };

      onSubmitClaim(generatedClaim);
      setSubmitting(false);
      setFormSuccess(`Successfully registered claim to simulated 'TA_DA Data' sheet! Submission number generated automatically.`);
      
      // Reset inputs
      if (currentUser.role !== UserRole.EMPLOYEE && currentUser.role !== UserRole.SALESPERSON) {
        setSelectedEmail("");
      }
      setDate("");
      setPoNo("");
      setParticulars("");
      setOpeningReading(0);
      setClosingReading(0);
      setTa(0);
      setDa(0);
      setHotel(0);
      setMobileExp(0);
      setOtherExp(0);
      setDispatchedPoNo("");
      setFileAttached(null);
      setUploadProgress(-1);
      setDriveFileUrl("");
    }, 1200);
  };

  const isFieldEnabledInSettings = (fieldId: string) => {
    const f = formFields.find((field) => field.id === fieldId);
    return f ? f.visibleToEmployee : true;
  };

  const isFieldRequiredInSettings = (fieldId: string) => {
    const f = formFields.find((field) => field.id === fieldId);
    return f ? f.required : false;
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="tada_form_container">
      {/* Header bar */}
      <div className="bg-teal-700 p-6 text-white text-center">
        <h2 className="text-xl font-bold font-sans tracking-tight">Arvicon International</h2>
        <p className="text-teal-100 text-xs mt-1 uppercase tracking-wider font-semibold">
          Travel & Daily Allowances Reimbursement Port
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {/* Status Alerts */}
        {formSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="text-xs font-semibold">{formSuccess}</p>
              <button
                type="button"
                onClick={() => setFormSuccess(null)}
                className="text-emerald-700 hover:underline text-[10px] mt-1 font-bold"
              >
                File another expenses claim
              </button>
            </div>
          </div>
        )}

        {formError && (
          <div className="bg-rose-50 border border-rose-205 text-rose-800 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <p className="text-xs font-medium">{formError}</p>
          </div>
        )}

        {/* SECTION 1: Empl Identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Section 1: Employee Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1.5">
                Select Filing Employee <span className="text-rose-500">*</span>
              </label>
              {currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.SALESPERSON ? (
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-bold text-slate-700">
                  {currentUser.name} ({currentUser.email})
                </div>
              ) : (
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  className="border border-slate-200 text-xs rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 transition"
                  required
                >
                  <option value="">-- Choose Profile --</option>
                  {employees.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Mapped Auto-fills */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 mb-1.5">Emp Code</label>
              <input
                type="text"
                value={activeProfile?.code || ""}
                disabled
                className="border border-slate-100 text-xs bg-slate-50 border-l-4 border-l-teal-600 text-slate-500 rounded-lg p-2.5 font-semibold"
                placeholder="Auto-filled from user profile"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 mb-1.5">Designation</label>
              <input
                type="text"
                value={activeProfile?.designation || ""}
                disabled
                className="border border-slate-100 text-xs bg-slate-50 border-l-4 border-l-teal-600 text-slate-500 rounded-lg p-2.5 font-semibold"
                placeholder="Auto-filled from user profile"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-400 mb-1.5">State / Headquarters</label>
              <input
                type="text"
                value={activeProfile?.state || ""}
                disabled
                className="border border-slate-100 text-xs bg-slate-50 border-l-4 border-l-teal-600 text-slate-500 rounded-lg p-2.5 font-semibold"
                placeholder="Auto-filled from user profile"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Claim Metrics */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1">
            Section 2: Travel Details & Mileage Records
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isFieldEnabledInSettings("date") && (
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 mb-1.5">
                  Date of Travel {isFieldRequiredInSettings("date") && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required={isFieldRequiredInSettings("date")}
                  className="border border-slate-200 text-xs rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 transition"
                />
              </div>
            )}

            {isFieldEnabledInSettings("poNo") && (
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 mb-1.5">
                  PO Number {isFieldRequiredInSettings("poNo") && <span className="text-rose-500">*</span>}
                </label>
                <div className="relative">
                  <Hash className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={poNo}
                    onChange={(e) => setPoNo(e.target.value)}
                    required={isFieldRequiredInSettings("poNo")}
                    className="border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 w-full bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 transition"
                    placeholder="PO Reference number"
                  />
                </div>
              </div>
            )}

            {isFieldEnabledInSettings("particulars") && (
              <div className="flex flex-col md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1.5">
                  Particulars / Travel Purpose {isFieldRequiredInSettings("particulars") && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  value={particulars}
                  onChange={(e) => setParticulars(e.target.value)}
                  required={isFieldRequiredInSettings("particulars")}
                  rows={2}
                  className="border border-slate-200 text-xs rounded-lg p-2.5 bg-slate-50 text-slate-700 focus:outline-none focus:border-teal-600 transition resize-none"
                  placeholder="Detail out clients matches, outlets details, align dispatches states, etc."
                />
              </div>
            )}
          </div>

          {/* Odometer metrics */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {isFieldEnabledInSettings("openingReading") && (
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                  <span>Opening Reading (KM)</span>
                  {isFieldRequiredInSettings("openingReading") && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  value={openingReading || ""}
                  onChange={(e) => setOpeningReading(Math.max(0, parseInt(e.target.value) || 0))}
                  required={isFieldRequiredInSettings("openingReading")}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-white text-slate-700"
                  placeholder="Odometer start"
                />
              </div>
            )}

            {isFieldEnabledInSettings("closingReading") && (
              <div className="flex flex-col">
                <label className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                  <span>Closing Reading (KM)</span>
                  {isFieldRequiredInSettings("closingReading") && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="number"
                  value={closingReading || ""}
                  onChange={(e) => setClosingReading(Math.max(0, parseInt(e.target.value) || 0))}
                  required={isFieldRequiredInSettings("closingReading")}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-white text-slate-700"
                  placeholder="Odometer closing"
                />
              </div>
            )}

            {isFieldEnabledInSettings("readingDifference") && (
              <div className="flex flex-col justify-end">
                <label className="text-[11px] font-semibold text-slate-400 mb-1">Total Distance (Calculated)</label>
                <div className={`text-xs font-bold rounded-lg p-2 border text-center ${
                  closingReading < openingReading 
                    ? "bg-rose-50 border-rose-200 text-rose-700" 
                    : "bg-teal-50 border-teal-200 text-teal-700"
                }`}>
                  {readingDifference} KM
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Cost breakdown */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            Section 3: Cost Accounting
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {isFieldEnabledInSettings("ta") && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1">T.A.</label>
                <input
                  type="number"
                  value={ta || ""}
                  onChange={(e) => setTa(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Travel Cost"
                />
              </div>
            )}

            {isFieldEnabledInSettings("da") && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1">D.A.</label>
                <input
                  type="number"
                  value={da || ""}
                  onChange={(e) => setDa(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Daily All."
                />
              </div>
            )}

            {isFieldEnabledInSettings("hotel") && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1">Hotel Stay</label>
                <input
                  type="number"
                  value={hotel || ""}
                  onChange={(e) => setHotel(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Hotel stay"
                />
              </div>
            )}

            {isFieldEnabledInSettings("mobileExp") && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1">Mobile Exp.</label>
                <input
                  type="number"
                  value={mobileExp || ""}
                  onChange={(e) => setMobileExp(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Telecom"
                />
              </div>
            )}

            {isFieldEnabledInSettings("otherExp") && (
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 mb-1">Other Exp.</label>
                <input
                  type="number"
                  value={otherExp || ""}
                  onChange={(e) => setOtherExp(Math.max(0, parseInt(e.target.value) || 0))}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Misc cost"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {isFieldEnabledInSettings("grandTotal") && (
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1">Grand Total Sum</label>
                <div className="px-3 py-2 bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold rounded-lg leading-relaxed">
                  INR {grandTotal.toLocaleString()}
                </div>
              </div>
            )}

            {isFieldEnabledInSettings("dispatchedPoNo") && (
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 mb-1">
                  Dispatched PO No. {isFieldRequiredInSettings("dispatchedPoNo") && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="text"
                  value={dispatchedPoNo}
                  onChange={(e) => setDispatchedPoNo(e.target.value)}
                  className="border border-slate-200 text-xs rounded-lg p-2 bg-slate-50 text-slate-700"
                  placeholder="Optional dispatch PO"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Bill Up */}
        {isFieldEnabledInSettings("billUpload") && (
          <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Section 4: Attachments Verification
            </h3>

            <div className="border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-6 transition text-center relative cursor-pointer bg-slate-50">
              <input
                type="file"
                id="file_input"
                onChange={handleFileChange}
                required={isFieldRequiredInSettings("billUpload")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <FileUp className="h-8 w-8 text-teal-600 mx-auto" strokeWidth={1.5} />
                <div className="text-xs font-semibold text-slate-700">
                  {fileAttached ? (
                    <span className="text-teal-700 font-bold">Selected: {fileAttached.name}</span>
                  ) : (
                    <span>Drag and drop bill file here, or click to browse</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">PDF, PNG, JPEG formats supported. Mapped drive simulation active.</p>
              </div>
            </div>

            {uploadProgress >= 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>Uploading claim voucher to Google Drive...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-teal-600 h-1.5 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                {uploadProgress === 100 && (
                  <p className="text-[10px] text-emerald-600 font-medium">
                    ✓ File stored securely inside Drive folder ID. Simulated link attached to claim record.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Submitting buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering on Sheet...</span>
              </>
            ) : (
              <span>Submit Claim Reimbursement</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
