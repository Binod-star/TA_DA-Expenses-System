import { useState } from "react";
import { gasFiles } from "../gasCodebase";
import { FileCode, FileText, Check, Copy, HelpCircle, Server, Database, Key } from "lucide-react";

export default function ExportCenter() {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="space-y-6" id="export_center_parent">
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-teal-500/10 text-teal-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/20">
              Developer Studio
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-sans mt-2 tracking-tight">
              Google Apps Script Export & Setup Center
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Get the entire production-grade, modular, and configurable `.gs` and `.html` script codebase. Paste these directly into your Google Sheet Script Editor to activate your live automated TA/DA cloud ecosystem.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="#setup_guide"
              className="px-4 py-2 bg-slate-800 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-700 transition"
            >
              Setup Guide
            </a>
          </div>
        </div>
      </div>

      {/* Code Repository Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar file chooser */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 space-y-2 h-[600px] overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 pb-2">
            Workspace Scripts (.gs)
          </div>
          {gasFiles
            .filter((f) => f.type === "gs")
            .map((file, idx) => {
              const fileGlobalIdx = gasFiles.findIndex((f) => f.name === file.name);
              return (
                <button
                  key={file.name}
                  onClick={() => setActiveFileIndex(fileGlobalIdx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition font-medium ${
                    activeFileIndex === fileGlobalIdx
                      ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{file.name}.gs</span>
                  </div>
                </button>
              );
            })}

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 pt-4 pb-2">
            HTML Frontends (.html)
          </div>
          {gasFiles
            .filter((f) => f.type === "html")
            .map((file, idx) => {
              const fileGlobalIdx = gasFiles.findIndex((f) => f.name === file.name);
              return (
                <button
                  key={file.name}
                  onClick={() => setActiveFileIndex(fileGlobalIdx)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition font-medium ${
                    activeFileIndex === fileGlobalIdx
                      ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{file.name}.html</span>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Selected File Code Viewer */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="bg-slate-55 border-b border-slate-200 px-5 py-4 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-mono text-sm font-semibold text-slate-800">
                {gasFiles[activeFileIndex].name}.{gasFiles[activeFileIndex].type}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {gasFiles[activeFileIndex].description}
              </p>
            </div>
            <button
              onClick={() => handleCopy(gasFiles[activeFileIndex].code, gasFiles[activeFileIndex].name)}
              className="flex items-center gap-2 px-3 .5 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              {copiedFile === gasFiles[activeFileIndex].name ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code */}
          <div className="flex-1 overflow-auto bg-slate-950 p-5 font-mono text-xs text-slate-300 leading-relaxed selection:bg-teal-550 selection:text-white">
            <pre className="whitespace-pre">{gasFiles[activeFileIndex].code}</pre>
          </div>
        </div>
      </div>

      {/* Complete Step-by-Step Instructions Panel */}
      <div id="setup_guide" className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Server className="h-5 w-5 text-teal-600" />
            End-to-End deployment & authorization manual
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            Follow this rigorous 10-step process to deploy your Arvicon International TA/DA Automation Suite inside your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
              <Database className="h-4 w-4 text-teal-600" />
              Spreadsheet & File setup
            </h4>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-3 pl-1">
              <li>
                <strong>Create standard Google Sheet</strong>: Name it <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-700">TA_DA_Database_Arvicon</code>.
              </li>
              <li>
                <strong>Initialize Apps Script</strong>: Open <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">Extensions</code> → <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-850">Apps Script</code>.
              </li>
              <li>
                <strong>Create script files</strong>: For each file listed in the panel above (e.g., Code, Config, Setup, etc.), click <code className="bg-slate-100 px-1 py-0.5 rounded">+</code>, create a <strong>Script File</strong> and replace its content with the copied code.
              </li>
              <li>
                <strong>Create index.html</strong>: Click <code className="bg-slate-100 px-1 py-0.5 rounded">+</code>, create an <strong>HTML file</strong> named <code className="bg-slate-100 px-1 py-0.5 rounded">index</code> (which embeds TADAForm) and save it.
              </li>
              <li>
                <strong>Execute Bootstrap Function</strong>: In the toolbar, select <code className="bg-slate-100 px-1 py-0.5 rounded">setupSystem</code> and click <strong>Run</strong>.
              </li>
            </ol>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
              <Key className="h-4 w-4 text-teal-600" />
              Authorization & Web app publish
            </h4>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-3 pl-1 col-span-1">
              <li>
                <strong>Grant OAuth permissions</strong>: On the first run, Google will prompt you with an permissions screen. Click <code className="bg-slate-100 px-1 py-0.5 rounded">Advanced</code> → <code className="bg-slate-100 px-1 py-0.5 rounded">Go to TA-DA Web App (unsafe)</code> to authorize reading sheets, sending emails, and creating Drive files on your behalf.
              </li>
              <li>
                <strong>Deploy as Web App</strong>: Click <code className="bg-slate-100 px-1 py-0.5 rounded font-semibold text-teal-700">Deploy</code> at top right → <code className="bg-slate-150 px-1 py-0.5 rounded text-slate-850">New Deployment</code>. Choose gear icon and select <code className="bg-slate-100 px-1 py-0.5 rounded">Web App</code>.
              </li>
              <li>
                <strong>Configure Access Scope</strong>: 
                <br />
                - <code className="text-xs bg-slate-100 px-1 rounded">Execute As:</code> <strong>Me (your administrator email)</strong>
                <br />
                - <code className="text-xs bg-slate-100 px-1 rounded">Who has access:</code> <strong>Anyone within organization (or Anyone)</strong>.
              </li>
              <li>
                <strong>Initialize Triggers</strong>: Running the <code className="bg-slate-100 px-1 py-0.5 rounded">setupTriggers</code> function automatically connects the 15-day email reminders and submission dispatch events.
              </li>
              <li>
                <strong>Configure Master sheets</strong>: Navigate back to the Google Sheet and populate your employee profiles in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-teal-700">User Master</code>, setting up supervisors, states, roles, and status fields to make it alive!
              </li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting Manual */}
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <HelpCircle className="h-5 w-5" />
            Troubleshooting Common Apps Script Errors
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-amber-900 leading-relaxed">
            <div>
              <strong className="block text-amber-950 mb-1">1. "Required sheet is missing" error:</strong>
              This indicates you bypassed running the initialization setup. Select the <code className="font-semibold">setupSystem()</code> function inside Apps Script workspace and hit Run to immediately provision all required sheets.
            </div>
            <div>
              <strong className="block text-amber-950 mb-1">2. "Exceeded maximum execution time":</strong>
              Normally caused by heavy historical audits or too many blank rows inside sheets. Clear out trailing blank rows or adjust the reminder range inside Config.gs.
            </div>
            <div>
              <strong className="block text-amber-950 mb-1">3. Silent email failures:</strong>
              Check the <code className="font-semibold">Mail Log</code> sheet. If status lists "Failed" with an error, inspect that you haven't surpassed the standard Google free daily limit (100 emails/day for free Gmail accounts, 1500 limit for Workspace accounts).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
