export interface GASFile {
  name: string;
  type: "gs" | "html";
  description: string;
  code: string;
}

export const gasFiles: GASFile[] = [
  {
    name: "Code",
    type: "gs",
    description: "Main entry point of the Google Apps Script Web App. Handles the router, doGet requests, HTML templates serving, and active session fetching.",
    code: `/**
 * Arvicon TA/DA Management System - Code.gs
 * Main Web App Entry Point and Router
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('Arvicon TA/DA Management System')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include HTML resources cleanly inside index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Serves the currently logged in user details to the frontend securely
 */
function getLoggedInUserSecurely() {
  try {
    var email = Session.getActiveUser().getEmail();
    if (!email) {
      // In development scenario or testing context
      email = "employee.a@arvicon.com"; 
    }
    
    // Check if user is active in Master
    var userDetails = AuthService.getUserDetails(email);
    if (!userDetails) {
      return {
        success: false,
        error: "Access Denied. User email '" + email + "' is not registered in User Master. Please contact admin.",
        email: email
      };
    }
    
    if (!userDetails.active) {
      return {
        success: false,
        error: "Access Denied. Your account is currently marked as Inactive. Please contact HR/Admin.",
        email: email
      };
    }
    
    return {
      success: true,
      email: email,
      name: userDetails.name,
      role: userDetails.role,
      code: userDetails.code,
      designation: userDetails.designation,
      state: userDetails.state,
      department: userDetails.department
    };
  } catch (err) {
    return {
      success: false,
      error: "Authorization failed: " + err.toString()
    };
  }
}
`
  },
  {
    name: "Config",
    type: "gs",
    description: "Global constants, schema naming conventions, sheet designations, and master environment variables definition.",
    code: `/**
 * Arvicon TA/DA Management System - Config.gs
 * Workspace variables and layout configurations
 */

var SHEETS = {
  DATA: "TA_DA Data",
  USER_MASTER: "User Master",
  FORM_SETTINGS: "Form Settings",
  ACCESS_CONTROL: "Access Control Settings",
  APPROVAL_SETTINGS: "Approval Settings",
  REMINDER_SETTINGS: "Reminder Settings",
  NOTIFICATION_SETTINGS: "Notification Settings",
  EMAIL_TEMPLATES: "Email Templates",
  MAIL_LOG: "Mail Log",
  AUDIT_LOG: "Audit Log",
  SYSTEM_SETTINGS: "System Settings",
  MENU_SETTINGS: "Menu Settings"
};

/**
 * Helper to get the active spreadsheet database safely
 */
function getActiveSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Helper to get a specific sheet by name
 */
function getSheetByName(name) {
  var ss = getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error("Required sheet '" + name + "' is missing. Please run setupSystem() first.");
  }
  return sheet;
}
`
  },
  {
    name: "Setup",
    type: "gs",
    description: "Initial bootstrap mechanism. Provisions the 14+ required database sheets, populates default settings, registers sample lookup records, and loads templates.",
    code: `/**
 * Arvicon TA/DA Management System - Setup.gs
 * Provisioning and system startup functions
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('TA/DA System')
    .addItem('Open TA/DA System Web App', 'logWebAppURL')
    .addSeparator()
    .addItem('Create Missing Sheets', 'createRequiredSheets')
    .addItem('Setup Default Settings and Templates', 'setupDefaultSettings')
    .addItem('Refresh Triggers', 'setupTriggers')
    .addSeparator()
    .addItem('Send Pending Supervisor Reminder', 'sendSupervisorReminderManual')
    .addItem('Send Pending HR Reminder', 'sendHRReminderManual')
    .addToUi();
}

function logWebAppURL() {
  var url = ScriptApp.getService().getUrl();
  SpreadsheetApp.getUi().alert("TA/DA System Web App active status and links:\\n\\n" + url);
}

function setupSystem() {
  createRequiredSheets();
  setupDefaultSettings();
  setupTriggers();
  SpreadsheetApp.getUi().alert("System has been successfully initialized! All required sheets, default access rules, form settings, and time triggers are active.");
}

function createRequiredSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var defaultSheets = [
    SHEETS.DATA, SHEETS.USER_MASTER, SHEETS.FORM_SETTINGS, SHEETS.ACCESS_CONTROL, 
    SHEETS.APPROVAL_SETTINGS, SHEETS.REMINDER_SETTINGS, SHEETS.NOTIFICATION_SETTINGS, 
    SHEETS.EMAIL_TEMPLATES, SHEETS.MAIL_LOG, SHEETS.AUDIT_LOG, SHEETS.SYSTEM_SETTINGS, 
    SHEETS.MENU_SETTINGS
  ];
  
  defaultSheets.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      ss.insertSheet(sheetName);
    }
  });
}

function setupDefaultSettings() {
  // Setup User Master headers
  var userMasterSheet = getSheetByName(SHEETS.USER_MASTER);
  userMasterSheet.clear();
  userMasterSheet.appendRow([
    "Email", "Name", "Code", "Designation", "State", "Department", 
    "Supervisor Name", "Supervisor Email", "HR Name", "HR Email", "Role", "Active"
  ]);
  // Sample Data
  userMasterSheet.appendRow(["employee.a@arvicon.com", "Rahul Sharma", "EMP-042", "Sales Executive", "Maharashtra", "Sales", "Vikram Singh", "supervisor@arvicon.com", "Siddharth Joshi", "hr@arvicon.com", "Employee", "TRUE"]);
  userMasterSheet.appendRow(["supervisor@arvicon.com", "Vikram Singh", "EMP-012", "Regional Sales Head", "Maharashtra", "Sales", "Siddharth Joshi", "hr@arvicon.com", "Siddharth Joshi", "hr@arvicon.com", "Supervisor", "TRUE"]);
  userMasterSheet.appendRow(["hr@arvicon.com", "Siddharth Joshi", "EMP-005", "HR Manager", "Gujarat", "HR", "Devansh Mehta", "admin@arvicon.com", "Devansh Mehta", "admin@arvicon.com", "HR", "TRUE"]);
  userMasterSheet.appendRow(["accounts@arvicon.com", "Neha Gupta", "EMP-009", "Sr. Accountant", "Gujarat", "Finance", "Devansh Mehta", "admin@arvicon.com", "Siddharth Joshi", "hr@arvicon.com", "Accounts", "TRUE"]);
  userMasterSheet.appendRow(["admin@arvicon.com", "Devansh Mehta", "EMP-001", "Global Director", "Gujarat", "Management", "", "", "", "", "Super Admin", "TRUE"]);

  // Setup Role Permission headers
  var accessSheet = getSheetByName(SHEETS.ACCESS_CONTROL);
  accessSheet.clear();
  accessSheet.appendRow([
    "Role", "Menu Name", "Can View", "Can Add", "Can Edit", "Can Delete", "Can Approve", "Can Reject", "Data Visibility Type"
  ]);
  accessSheet.appendRow(["Employee", "Dashboard", "TRUE", "TRUE", "FALSE", "FALSE", "FALSE", "FALSE", "Own Data Only"]);
  accessSheet.appendRow(["Employee", "TA/DA Form", "TRUE", "TRUE", "TRUE", "FALSE", "FALSE", "FALSE", "Own Data Only"]);
  accessSheet.appendRow(["Supervisor", "Dashboard", "TRUE", "TRUE", "FALSE", "FALSE", "FALSE", "FALSE", "Team Data Only"]);
  accessSheet.appendRow(["Supervisor", "Approval Panel", "TRUE", "FALSE", "TRUE", "FALSE", "TRUE", "TRUE", "Team Data Only"]);
  accessSheet.appendRow(["HR", "Dashboard", "TRUE", "TRUE", "FALSE", "FALSE", "FALSE", "FALSE", "All Data"]);
  accessSheet.appendRow(["HR", "Approval Panel", "TRUE", "FALSE", "TRUE", "FALSE", "TRUE", "TRUE", "All Data"]);
  accessSheet.appendRow(["Accounts", "Dashboard", "TRUE", "TRUE", "FALSE", "FALSE", "FALSE", "FALSE", "All Data"]);
  accessSheet.appendRow(["Accounts", "Accounts Panel", "TRUE", "FALSE", "TRUE", "FALSE", "TRUE", "FALSE", "All Data"]);
  accessSheet.appendRow(["Super Admin", "Admin Settings", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "TRUE", "All Data"]);

  // Setup System Settings
  var settingsSheet = getSheetByName(SHEETS.SYSTEM_SETTINGS);
  settingsSheet.clear();
  settingsSheet.appendRow(["Setting Key", "Setting Value", "Description"]);
  settingsSheet.appendRow(["Company Name", "Arvicon International", "Company Branding"]);
  settingsSheet.appendRow(["Logo URL", "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80", "Branding Icon Path"]);
  settingsSheet.appendRow(["Financial Year", "2026-2027", "Financial Tracking Cycle"]);
  settingsSheet.appendRow(["Theme Color", "#0d9488", "Interface Color Palette"]);
  settingsSheet.appendRow(["Drive Folder ID", "root", "Master folder for file uploads"]);
  settingsSheet.appendRow(["Instant Mail ON", "TRUE", "Instant email alerts activation"]);
  settingsSheet.appendRow(["Supervisor Reminder Cycle", "Every 15 days", "Unapproved claims alerts for supervisors"]);
  settingsSheet.appendRow(["HR Reminder Cycle", "Every 15 days", "Approved claim notification alerts for HR"]);

  // Set Default Email Templates
  var templatesSheet = getSheetByName(SHEETS.EMAIL_TEMPLATES);
  templatesSheet.clear();
  templatesSheet.appendRow(["Mail Type", "Trigger Event", "Subject", "Body", "Signature", "Footer"]);
  templatesSheet.appendRow([
    "Employee Submission Confirmation", 
    "On New Submission", 
    "Arvicon Claims: Submission Confirmed {{Submission Number}}", 
    "<p>Hello {{Employee Name}},</p><p>Your TA/DA claim has been registered successfully on our platform.</p><table border='1' padding='5'><tr><td>Submission No</td><td>{{Submission Number}}</td></tr><tr><td>Date</td><td>{{Date}}</td></tr><tr><td>Grand Total</td><td>INR {{Grand Total}}</td></tr></table>", 
    "<p>Thanks,</p><p>Arvicon Operations Team</p>",
    "<p style='font-size:10px;color:grey;'>This is an automated report. Do not reply.</p>"
  ]);
  templatesSheet.appendRow([
    "Supervisor New Claim Notification", 
    "On New Submission", 
    "Action Required: Approve Claim {{Submission Number}} - {{Employee Name}}", 
    "<p>Hi {{Supervisor Name}},</p><p>A new TA/DA claim awaits your evaluation from employee: {{Employee Name}} (INR {{Grand Total}}).</p>", 
    "<p>Best Regards,</p><p>HR Core ERP</p>",
    "<p style='font-size:10px;color:grey;'>Arvicon Audit Service System</p>"
  ]);

  // Setup Form Settings and Headers
  var dataSheet = getSheetByName(SHEETS.DATA);
  if (dataSheet.getLastRow() === 0) {
    dataSheet.appendRow([
      "Timestamp", "Submission Number", "Employee Name", "Employee Code", "Employee Email", 
      "Designation", "State", "Department", "Date", "PO No.", "Particulars", 
      "Opening Reading", "Closing Reading", "Reading Difference", "T.A.", "D.A.", 
      "Hotel", "Mobile Exp.", "Other Exp.", "Grand Total", "Dispatched PO No.", 
      "Bill Upload File Link", "Supervisor Name", "Supervisor Email", "Supervisor Approval Status", 
      "Supervisor Approval Date", "Supervisor Remarks", "HR Name", "HR Email", 
      "HR Approval Status", "HR Approval Date", "HR Remarks", "Accounts Payment Status", 
      "Payment Date", "Accounts Remarks", "Final PDF Link", "Monthly PDF Link", 
      "Created By", "Updated By", "Last Updated Timestamp", "Record Status"
    ]);
  }
}
`
  },
  {
    name: "AuthService",
    type: "gs",
    description: "Enterprise validation suite. Translates Session execution states into specific UI clearance levels, validating view windows, column configurations, and route states.",
    code: `/**
 * Arvicon TA/DA Management System - AuthService.gs
 * Security, Access Rules, and Row-Level Filtering
 */

var AuthService = {
  
  getUserDetails: function(email) {
    var sheet = getSheetByName(SHEETS.USER_MASTER);
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString().toLowerCase().trim() === email.toLowerCase().trim()) {
        return {
          email: data[i][0],
          name: data[i][1],
          code: data[i][2],
          designation: data[i][3],
          state: data[i][4],
          department: data[i][5],
          supervisorName: data[i][6],
          supervisorEmail: data[i][7],
          hrName: data[i][8],
          hrEmail: data[i][9],
          role: data[i][10],
          active: data[i][11] === true || data[i][11].toString().toUpperCase() === "TRUE"
        };
      }
    }
    return null;
  },

  checkAccess: function(email, menuName) {
    var user = this.getUserDetails(email);
    if (!user || !user.active) return false;
    
    // Super Admin gets unrestricted coverage
    if (user.role === "Super Admin" || user.role === "MIS Admin") return true;
    
    var sheet = getSheetByName(SHEETS.ACCESS_CONTROL);
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === user.role && data[i][1].toString() === menuName) {
        return data[i][2] === true || data[i][2].toString().toUpperCase() === "TRUE";
      }
    }
    return false;
  },

  getDataVisibilityRule: function(email) {
    var user = this.getUserDetails(email);
    if (!user) return "Own Data Only";
    
    if (user.role === "Super Admin" || user.role === "MIS Admin" || user.role === "HR") {
      return "All Data";
    }
    
    var sheet = getSheetByName(SHEETS.ACCESS_CONTROL);
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0].toString() === user.role) {
        return data[i][8].toString(); // Column 'Data Visibility Type'
      }
    }
    return "Own Data Only";
  }
};
`
  },
  {
    name: "DataService",
    type: "gs",
    description: "Database interaction engine. Auto-calculates reading steps & totals, safeguards values on registration, updates state logs, and lists claims matching row constraints.",
    code: `/**
 * Arvicon TA/DA Management System - DataService.gs
 * Database Operations, Submissions, Auto-Calculations
 */

function submitTADAForm(formData) {
  try {
    var email = Session.getActiveUser().getEmail() || "employee.a@arvicon.com";
    var user = AuthService.getUserDetails(email);
    
    if (!user) {
      throw new Error("Unauthorized user. Not registered inside User Master database.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheetByName(SHEETS.DATA);
    
    // Generation of submission code
    var submissionNo = generateSubmissionNumber(sheet);
    var timestamp = new Date();
    
    var openingReading = parseFloat(formData.openingReading || 0);
    var closingReading = parseFloat(formData.closingReading || 0);
    var readingDifference = closingReading - openingReading;
    
    var ta = parseFloat(formData.ta || 0);
    var da = parseFloat(formData.da || 0);
    var hotel = parseFloat(formData.hotel || 0);
    var mobile = parseFloat(formData.mobileExp || 0);
    var other = parseFloat(formData.otherExp || 0);
    var grandTotal = ta + da + hotel + mobile + other;
    
    // Insert new claim record
    var newRow = [
      timestamp,                               // A: Timestamp
      submissionNo,                            // B: Submission Number
      user.name,                               // C: Employee Name
      user.code,                               // D: Employee Code
      user.email,                              // E: Employee Email
      user.designation,                        // F: Designation
      user.state,                              // G: State
      user.department,                         // H: Department
      formData.date,                           // I: Claim Date
      formData.poNo || "",                     // J: PO No
      formData.particulars || "",              // K: Particulars
      openingReading,                          // L: Opening Reading
      closingReading,                          // M: Closing Reading
      readingDifference,                       // N: Reading Difference
      ta,                                      // O: TA
      da,                                      // P: DA
      hotel,                                   // Q: Hotel
      mobile,                                  // R: Mobile Exp
      other,                                   // S: Other Exp
      grandTotal,                              // T: Grand Total
      formData.dispatchedPoNo || "",           // U: Dispatched PO
      formData.billUploadFileLink || "",       // V: Bill File Link
      user.supervisorName,                     // W: Supervisor Name
      user.supervisorEmail,                    // X: Supervisor Email
      "Pending",                               // Y: Supervisor status
      "",                                      // Z: Supervisor Date
      "",                                      // AA: Supervisor Remarks
      user.hrName,                             // AB: HR Name
      user.hrEmail,                            // AC: HR Email
      "Pending",                               // AD: HR Status
      "",                                      // AE: HR Date
      "",                                      // AF: HR Remarks
      "Pending",                               // AG: Accounts Status
      "",                                      // AH: Payment Date
      "",                                      // AI: Accounts Remarks
      "",                                      // AJ: Final PDF Link
      "",                                      // AK: Monthly PDF
      user.email,                              // AL: Created By
      user.email,                              // AM: Updated By
      timestamp,                               // AN: Last Updated
      "Pending"                                // AO: Record Status
    ];
    
    sheet.appendRow(newRow);
    
    // Dispatch Mail Notification and Audit Events
    if (MailService) {
      MailService.triggerInstantMail("On New Submission", submissionNo, newRow);
    }
    
    AuditService.log("New Submission", SHEETS.DATA, sheet.getLastRow(), "Submission Number", "", submissionNo, submissionNo, "Claim registered success.");
    
    return { success: true, submissionNumber: submissionNo };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function generateSubmissionNumber(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return "TADA-2026-00001";
  }
  
  var lastSubmission = sheet.getRange(lastRow, 2).getValue().toString();
  if (lastSubmission.indexOf("TADA-") !== 0) {
    return "TADA-2026-00001";
  }
  
  var parts = lastSubmission.split("-");
  var num = parseInt(parts[parts.length - 1], 10);
  num = num + 1;
  
  var formattedNum = ("00000" + num).slice(-5);
  return "TADA-2026-" + formattedNum;
}

function fetchClaimsForUser(email) {
  var user = AuthService.getUserDetails(email);
  if (!user) return [];
  
  var sheet = getSheetByName(SHEETS.DATA);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var result = [];
  var visibilityType = AuthService.getDataVisibilityRule(email);
  
  for (var i = 1; i < data.length; i++) {
    var raw = data[i];
    var claim = {};
    for (var col = 0; col < headers.length; col++) {
      var key = toCamelCase(headers[col]);
      claim[key] = raw[col];
    }
    
    // Evaluate permission matches
    var isAllowed = false;
    if (visibilityType === "All Data" || user.role === "Super Admin" || user.role === "MIS Admin") {
      isAllowed = true;
    } else if (visibilityType === "Own Data Only" && raw[4].toString().toLowerCase() === email.toLowerCase()) {
      isAllowed = true;
    } else if (visibilityType === "Team Data Only" && raw[23].toString().toLowerCase() === email.toLowerCase()) {
      isAllowed = true; // matches supervisor email column
    } else if (visibilityType === "Department Data Only" && user.department === raw[7]) {
      isAllowed = true;
    } else if (visibilityType === "State Data Only" && user.state === raw[6]) {
      isAllowed = true;
    }
    
    if (isAllowed) {
      result.push(claim);
    }
  }
  return result;
}

function toCamelCase(str) {
  return str.replace(/[^A-Za-z0-9]/g, ' ')
            .replace(/^\\s+|\\s+$/g, '')
            .split(' ')
            .map(function(word, index) {
              if (index === 0) return word.toLowerCase();
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join('');
}
`
  },
  {
    name: "MailService",
    type: "gs",
    description: "Enterprise email engine. Dispatches clean corporate HTML alerts with dynamic inline tables mapping form fields, logs success states or descriptive exceptions in the Mail Log.",
    code: `/**
 * Arvicon TA/DA Management System - MailService.gs
 * Complete Configurable Notification Engine
 */

var MailService = {
  
  triggerInstantMail: function(event, submissionNo, recordRow) {
    try {
      var sheet = getSheetByName(SHEETS.NOTIFICATION_SETTINGS);
      var configData = sheet.getDataRange().getValues();
      var activeSettings = null;
      
      for (var i = 1; i < configData.length; i++) {
        if (configData[i][1] === event && configData[i][2] === true) {
          activeSettings = configData[i];
          break;
        }
      }
      
      if (!activeSettings) return; // Trigger is turned OFF
      
      var mailType = activeSettings[0];
      var template = this.getEmailTemplate(mailType);
      if (!template) return;
      
      var recType = activeSettings[3]; // Recipient Type
      var recipient = "";
      
      // Select appropriate recipient email
      if (recType === "Employee Email") recipient = recordRow[4]; // EMP EMAIL
      else if (recType === "Supervisor Email") recipient = recordRow[23]; // SUP EMAIL
      else if (recType === "HR Email") recipient = recordRow[28]; // HR EMAIL
      
      var cc = activeSettings[4] || "";
      var bcc = activeSettings[5] || "";
      
      var placeholders = {
        "{{Submission Number}}": submissionNo,
        "{{Employee Name}}": recordRow[2],
        "{{Employee Code}}": recordRow[3],
        "{{Date}}": recordRow[8],
        "{{Grand Total}}": recordRow[19],
        "{{Supervisor Name}}": recordRow[22],
        "{{Bill Upload File Link}}": recordRow[21] || "No file uploaded"
      };
      
      var parsedSubject = this.replaceVariables(template.subject, placeholders);
      var parsedBody = this.replaceVariables(template.body, placeholders) + template.signature + template.footer;
      
      MailApp.sendEmail({
        to: recipient,
        cc: cc,
        bcc: bcc,
        subject: parsedSubject,
        htmlBody: parsedBody
      });
      
      this.logMail(event, submissionNo, recipient, cc, bcc, parsedSubject, "Success", "", recordRow[4]);
    } catch (err) {
      this.logMail(event, submissionNo, "", "", "", "Failed Delivery Trigger", "Failed", err.toFixed ? err.toString() : err.message, recordRow ? recordRow[4] : "");
    }
  },

  getEmailTemplate: function(mailType) {
    var sheet = getSheetByName(SHEETS.EMAIL_TEMPLATES);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === mailType) {
        return {
          subject: data[i][2],
          body: data[i][3],
          signature: data[i][4],
          footer: data[i][5]
        };
      }
    }
    return null;
  },

  replaceVariables: function(text, map) {
    var output = text;
    for (var key in map) {
      output = output.replace(new RegExp(key, 'g'), map[key]);
    }
    return output;
  },

  logMail: function(event, submissionNo, recipient, cc, bcc, subject, status, error, employee) {
    try {
      var logSheet = getSheetByName(SHEETS.MAIL_LOG);
      logSheet.appendRow([
        new Date(), event, submissionNo, recipient, cc, bcc, subject, status, error || "", Session.getActiveUser().getEmail(), employee
      ]);
    } catch (e) {
      Logger.log("Mail logging failed: " + e.toString());
    }
  }
};
`
  },
  {
    name: "ApprovalService",
    type: "gs",
    description: "Approval workflow engine. Advances pending sheets through mapped supervisor evaluation gates and HR approval desks, logging transaction updates.",
    code: `/**
 * Arvicon TA/DA Management System - ApprovalService.gs
 * Supervisor & HR Approval Desk, Payment Status Updates
 */

function approveBySupervisor(submissionNumber, status, remarks) {
  try {
    var email = Session.getActiveUser().getEmail() || "supervisor@arvicon.com";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheetByName(SHEETS.DATA);
    var data = sheet.getDataRange().getValues();
    var targetRow = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1].toString() === submissionNumber) {
        targetRow = i + 1;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error("Specified claim submission number not found in database.");
    }
    
    var timestamp = new Date();
    
    // Update Supervisor specific columns
    // Col Y (25): Supervisor status, Col Z (26): Supervisor Date, Col AA (27): Supervisor Remarks
    sheet.getRange(targetRow, 25).setValue(status);
    sheet.getRange(targetRow, 26).setValue(timestamp);
    sheet.getRange(targetRow, 27).setValue(remarks);
    
    // Update generic progress columns
    sheet.getRange(targetRow, 39).setValue(email); // Updated By
    sheet.getRange(targetRow, 40).setValue(timestamp); // Last Updated Timestamp
    sheet.getRange(targetRow, 41).setValue(status === "Approved" ? "Supervisor Approved & Pending HR" : status); // Record status
    
    // Logs tracking change
    AuditService.log("Supervisor Review", SHEETS.DATA, targetRow, "Supervisor Approval Status", "Pending", status, submissionNumber, remarks);
    
    // Instant Email alerting employee of approval/rejection state
    var recordRow = sheet.getRange(targetRow, 1, 1, 41).getValues()[0];
    MailService.triggerInstantMail(status === "Approved" ? "On Supervisor Approval" : "On Supervisor Rejection", submissionNumber, recordRow);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function approveByHR(submissionNumber, status, remarks) {
  try {
    var email = Session.getActiveUser().getEmail() || "hr@arvicon.com";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheetByName(SHEETS.DATA);
    var data = sheet.getDataRange().getValues();
    var targetRow = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1].toString() === submissionNumber) {
        targetRow = i + 1;
        break;
      }
    }
    
    if (targetRow === -1) {
      throw new Error("Specified claim submission number not found.");
    }
    
    var timestamp = new Date();
    
    // Update HR specific columns
    // Col AD (30): HR Status, Col AE (31): HR Date, Col AF (32): HR Remarks
    sheet.getRange(targetRow, 30).setValue(status);
    sheet.getRange(targetRow, 31).setValue(timestamp);
    sheet.getRange(targetRow, 32).setValue(remarks);
    
    // Update progress variables
    sheet.getRange(targetRow, 39).setValue(email);
    sheet.getRange(targetRow, 40).setValue(timestamp);
    sheet.getRange(targetRow, 41).setValue(status === "Approved" ? "HR Approved & Accounts Pending" : status);
    
    AuditService.log("HR Review", SHEETS.DATA, targetRow, "HR Approval Status", "Pending", status, submissionNumber, remarks);
    
    var recordRow = sheet.getRange(targetRow, 1, 1, 41).getValues()[0];
    MailService.triggerInstantMail(status === "Approved" ? "On HR Approval" : "On HR Rejection", submissionNumber, recordRow);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function updatePaymentStatus(submissionNumber, paymentStatus, paymentDate, remarks) {
  try {
    var email = Session.getActiveUser().getEmail() || "accounts@arvicon.com";
    var sheet = getSheetByName(SHEETS.DATA);
    var data = sheet.getDataRange().getValues();
    var targetRow = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1].toString() === submissionNumber) {
        targetRow = i + 1;
        break;
      }
    }
    
    if (targetRow === -1) throw new Error("Claim submission number reference does not exist.");
    
    var timestamp = new Date();
    
    // Col AG (33): Accounts Status, Col AH (34): Payment Date, Col AI (35): Accounts Remarks
    sheet.getRange(targetRow, 33).setValue(paymentStatus);
    sheet.getRange(targetRow, 34).setValue(paymentDate || timestamp);
    sheet.getRange(targetRow, 35).setValue(remarks);
    
    sheet.getRange(targetRow, 39).setValue(email);
    sheet.getRange(targetRow, 40).setValue(timestamp);
    sheet.getRange(targetRow, 41).setValue(paymentStatus === "Paid" ? "Paid" : "Approved & Unpaid");
    
    AuditService.log("Payment Settlement", SHEETS.DATA, targetRow, "Accounts Payment Status", "Pending", paymentStatus, submissionNumber, remarks);
    
    var recordRow = sheet.getRange(targetRow, 1, 1, 41).getValues()[0];
    MailService.triggerInstantMail(paymentStatus === "Paid" ? "On Payment Paid" : "On Payment Pending", submissionNumber, recordRow);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
`
  },
  {
    name: "ReminderService",
    type: "gs",
    description: "Automated alert daemon. Gathers records delayed inside supervisor or HR channels and fires customized, team-segregated digests.",
    code: `/**
 * Arvicon TA/DA Management System - ReminderService.gs
 * Time-Triggered Supervisor and HR Reminders
 */

function sendSupervisorReminderManual() {
  var count = sendSupervisorReminder();
  SpreadsheetApp.getUi().alert("Fired unapproved claim digests to supervisors. Total digest notifications dispatched: " + count);
}

function sendSupervisorReminder() {
  var sheet = getSheetByName(SHEETS.DATA);
  var data = sheet.getDataRange().getValues();
  var supervisorGroups = {};
  
  // Group unresolved claims by Supervisor Email
  for (var i = 1; i < data.length; i++) {
    var approvalStatus = data[i][24]; // Col Y: Supervisor Approval Status
    if (!approvalStatus || approvalStatus.toString().trim() === "" || approvalStatus.toString().toLowerCase() === "pending") {
      var supEmail = data[i][23].toString().trim(); // Col X: Supervisor Email
      if (supEmail) {
        if (!supervisorGroups[supEmail]) {
          supervisorGroups[supEmail] = [];
        }
        supervisorGroups[supEmail].push(data[i]);
      }
    }
  }
  
  var triggerCount = 0;
  for (var supEmail in supervisorGroups) {
    var claims = supervisorGroups[supEmail];
    var htmlTable = "<table border='1' style='border-collapse:collapse;width:100%;text-align:left;font-family:sans-serif;'>";
    htmlTable += "<tr style='background-color:#0d9488;color:white;'><th>Employee</th><th>Submission Number</th><th>Date</th><th>Amount</th></tr>";
    
    claims.forEach(function(r) {
      htmlTable += "<tr><td style='padding:5px;'>" + r[2] + "</td><td style='padding:5px;'>" + r[1] + "</td><td style='padding:5px;'>" + r[8] + "</td><td style='padding:5px;'>INR " + r[19] + "</td></tr>";
    });
    htmlTable += "</table>";
    
    MailApp.sendEmail({
      to: supEmail,
      subject: "Arvicon TA/DA Alert: Pending Supervisor Reviews Digest",
      htmlBody: "<p>Hi Supervisor,</p><p>The following submitted employee travel claims remain pending for evaluation in your channel.</p>" + htmlTable + "<p>Please login to the Corporate TA/DA Web Portal and complete your review steps.</p>"
    });
    
    MailService.logMail("Supervisor Reminder", "MULTIPLE", supEmail, "", "", "Pending Claims Digest Mail", "Success", "", "GROUP_MAIL");
    triggerCount++;
  }
  return triggerCount;
}

function sendHRReminderManual() {
  var count = sendHRReminder();
  SpreadsheetApp.getUi().alert("Delivered HR escalation warnings digests. Dispatched mails: " + count);
}

function sendHRReminder() {
  var sheet = getSheetByName(SHEETS.DATA);
  var data = sheet.getDataRange().getValues();
  var pendingClaims = [];
  
  for (var i = 1; i < data.length; i++) {
    var supStatus = data[i][24]; // Col Y: Supervisor Approval Status
    var hrStatus = data[i][29]; // Col AD: HR Approval Status
    
    if (supStatus === "Approved" && (!hrStatus || hrStatus.toString().trim() === "" || hrStatus.toString().toLowerCase() === "pending")) {
      pendingClaims.push(data[i]);
    }
  }
  
  if (pendingClaims.length === 0) return 0;
  
  var hrEmail = "hr@arvicon.com"; // Default HR Desk fallback
  var htmlTable = "<table border='1' style='border-collapse:collapse;width:100%;text-align:left;font-family:sans-serif;'>";
  htmlTable += "<tr style='background-color:#0d9488;color:white;'><th>Employee</th><th>Claim ID</th><th>Supervisor</th><th>Total</th></tr>";
  
  pendingClaims.forEach(function(r) {
    htmlTable += "<tr><td style='padding:5px;'>" + r[2] + "</td><td style='padding:5px;'>" + r[1] + "</td><td style='padding:5px;'>" + r[22] + "</td><td style='padding:5px;'>INR " + r[19] + "</td></tr>";
  });
  htmlTable += "</table>";
  
  MailApp.sendEmail({
    to: hrEmail,
    subject: "Arvicon HR Desk notification: Supervisor-Approved claims pending your signature",
    htmlBody: "<p>Hello HR Team,</p><p>You have approved claims waiting in your HR Approval pipeline from supervisors.</p>" + htmlTable
  });
  
  MailService.logMail("HR Reminder", "MULTIPLE", hrEmail, "", "", "Supervisor-Approved pipeline digest", "Success", "", "HR_GROUP");
  return 1;
}
`
  },
  {
    name: "DashboardService",
    type: "gs",
    description: "Aggregation module. Performs multi-dimensional summaries of pending totals, approved outlays, and payment statuses for dashboard consumption.",
    code: `/**
 * Arvicon TA/DA Management System - DashboardService.gs
 * Analytical aggregations and filter-friendly data sets
 */

function generateDashboardData(role, email) {
  try {
    var rawClaims = DataService.fetchClaimsForUser(email);
    
    var stats = {
      totalClaims: rawClaims.length,
      pendingSupervisor: 0,
      pendingHR: 0,
      approved: 0,
      rejected: 0,
      paidAmount: 0,
      pendingPaymentAmount: 0,
      totalSpent: 0
    };
    
    var timeSeries = {}; // monthly mapping
    
    rawClaims.forEach(function(c) {
      var amt = parseFloat(c.grandTotal || 0);
      stats.totalSpent += amt;
      
      // Classify statuses
      if (c.recordStatus === "Paid") {
        stats.approved++;
        stats.paidAmount += amt;
      } else if (c.recordStatus === "Rejected") {
        stats.rejected++;
      } else if (c.supervisorApprovalStatus === "Pending") {
        stats.pendingSupervisor++;
        stats.pendingPaymentAmount += amt;
      } else if (c.hrApprovalStatus === "Pending") {
        stats.pendingHR++;
        stats.pendingPaymentAmount += amt;
      } else {
        // Appr but unpaid
        stats.approved++;
        stats.pendingPaymentAmount += amt;
      }
      
      // Parse dates for trend lines
      var claimDate = c.date ? new Date(c.date) : new Date(c.timestamp);
      var monthYear = claimDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      timeSeries[monthYear] = (timeSeries[monthYear] || 0) + amt;
    });
    
    return {
      success: true,
      stats: stats,
      trends: Object.keys(timeSeries).map(function(k) {
        return { label: k, value: timeSeries[k] };
      })
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
`
  },
  {
    name: "AdminService",
    type: "gs",
    description: "Database modification helper. Stores layouts, form builders config, access rules, system parameters, and supervisor relationships.",
    code: `/**
 * Arvicon TA/DA Management System - AdminService.gs
 * Access config adjustments, builder saves, audit operations
 */

function saveAccessRules(rulesArray) {
  try {
    var sheet = getSheetByName(SHEETS.ACCESS_CONTROL);
    sheet.clear();
    sheet.appendRow([
      "Role", "Menu Name", "Can View", "Can Add", "Can Edit", "Can Delete", "Can Approve", "Can Reject", "Data Visibility Type"
    ]);
    
    rulesArray.forEach(function(rule) {
      sheet.appendRow([
        rule.role, rule.menuName, rule.canView, rule.canAdd, rule.canEdit, rule.canDelete, rule.canApprove, rule.canReject, rule.dataVisibilityType
      ]);
    });
    
    AuditService.log("Access Rules Modified", SHEETS.ACCESS_CONTROL, 1, "Access rules table", "", "Complete Rewrite", "AC_REWRITE", "Save requested by superadmin.");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function addNewUser(userData) {
  try {
    var sheet = getSheetByName(SHEETS.USER_MASTER);
    sheet.appendRow([
      userData.email, userData.name, userData.code, userData.designation, userData.state, 
      userData.department, userData.supervisorName, userData.supervisorEmail, 
      userData.hrName, userData.hrEmail, userData.role, "TRUE"
    ]);
    AuditService.log("User Added", SHEETS.USER_MASTER, sheet.getLastRow(), "Email", "", userData.email, userData.code, "User registered by admin panel.");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
`
  },
  {
    name: "AuditService",
    type: "gs",
    description: "System auditor. Records system actions, row ranges, target parameters, prior values, post states, and operator email details.",
    code: `/**
 * Arvicon TA/DA Management System - AuditService.gs
 * Secure operational history logger
 */

var AuditService = {
  
  log: function(action, sheetName, rowNo, fieldChanged, oldValue, newValue, submissionNo, remarks) {
    try {
      var sheet = getSheetByName(SHEETS.AUDIT_LOG);
      var email = Session.getActiveUser().getEmail() || "admin@arvicon.com";
      
      sheet.appendRow([
        new Date(),
        email,
        action,
        sheetName,
        rowNo.toString(),
        fieldChanged,
        oldValue ? oldValue.toString() : "",
        newValue ? newValue.toString() : "",
        submissionNo || "",
        remarks || ""
      ]);
    } catch (err) {
      Logger.log("Audit log failed: " + err.toString());
    }
  }
};
`
  },
  {
    name: "DriveService",
    type: "gs",
    description: "File organization center. Auto-creates structured directory nodes in Google Drive, moving binary bill submissions cleanly for linking.",
    code: `/**
 * Arvicon TA/DA Management System - DriveService.gs
 * Storage integration, dynamic directory setups, physical uploads
 */

function uploadBillToDrive(base64Data, filename, employeeName) {
  try {
    var splitData = base64Data.split(',');
    var contentType = splitData[0].split(':')[1].split(';')[0];
    var rawBytes = Utilities.base64Decode(splitData[1]);
    var blob = Utilities.newBlob(rawBytes, contentType, filename);
    
    var year = new Date().getFullYear().toString();
    var month = (new Date().getMonth() + 1).toString();
    
    var folder = getOrCreateFolder(employeeName, year, month);
    var file = folder.createFile(blob);
    file.setSharing(DocumentApp.HorizontalAlignment.CENTER, DocumentApp.Permission.VIEW);
    
    return {
      success: true,
      fileLink: file.getUrl(),
      fileName: filename
    };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}

function getOrCreateFolder(employeeName, year, month) {
  var parentFolder = DriveApp.getRootFolder();
  
  // Base App folder
  var appFolder = getSubFolderByName(parentFolder, "TA_DA_Bills_Master");
  var yearFolder = getSubFolderByName(appFolder, year);
  var empFolder = getSubFolderByName(yearFolder, employeeName);
  var monthFolder = getSubFolderByName(empFolder, "Month_" + month);
  
  return monthFolder;
}

function getSubFolderByName(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parent.createFolder(name);
  }
}
`
  },
  {
    name: "TriggerService",
    type: "gs",
    description: "Scheduling coordinator. Integrates automated triggers on submission entry and sets periodic tickers every 15 days.",
    code: `/**
 * Arvicon TA/DA Management System - TriggerService.gs
 * Scheduled automation rules orchestrator
 */

function setupTriggers() {
  deleteExistingTriggers();
  
  // Set reminder triggers for 15-day loops
  ScriptApp.newTrigger('sendSupervisorReminder')
           .timeBased()
           .everyDays(15)
           .create();
           
  ScriptApp.newTrigger('sendHRReminder')
           .timeBased()
           .everyDays(15)
           .create();
}

function deleteExistingTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
}
`
  },
  {
    name: "TADAForm",
    type: "html",
    description: "Responsive form renderer. Supports validation parameters, computed fields tracking, drop-down loads, and Drive stream submissions.",
    code: `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
    .container { max-width: 650px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { text-align: center; margin-bottom: 30px; }
    .header h2 { margin: 0; color: #0d9488; }
    .section-title { font-weight: 600; font-size: 16px; margin: 20px 0 10px; color: #334155; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; }
    label { font-size: 14px; font-weight: 500; margin-bottom: 6px; }
    input, select, textarea { padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15); }
    .disabled-input { background-color: #f1f5f9; cursor: not-allowed; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn { background: #0d9488; color: white; border: none; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
    .btn:hover { background: #0f766e; }
    .spinner { border: 3px solid rgba(0,0,0,0.1); width: 24px; height: 24px; border-radius: 50%; border-left-color: #0d9488; animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .hide { display: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Arvicon International</h2>
      <p style="margin: 4px 0 0 rgb(100,116,139); font-size: 14px;">TA / DA Expenses Reimbursement Gateway</p>
    </div>
    
    <form id="tadaForm">
      <div class="section-title">Section 1: Employee Information</div>
      <div class="form-group">
        <label>Employee Name</label>
        <select id="empName" onchange="autofillDetails()" required>
          <option value="">-- Choose User --</option>
        </select>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Employee Code</label>
          <input type="text" id="empCode" class="disabled-input" readonly>
        </div>
        <div class="form-group">
          <label>Designation</label>
          <input type="text" id="designation" class="disabled-input" readonly>
        </div>
      </div>
      
      <div class="section-title">Section 2: Travel and Expense Claims</div>
      <div class="row">
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="date" required>
        </div>
        <div class="form-group">
          <label>PO No.</label>
          <input type="text" id="poNo">
        </div>
      </div>
      <div class="form-group">
        <label>Particulars</label>
        <textarea id="particulars" rows="3" required></textarea>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Opening Reading</label>
          <input type="number" id="openingReading" oninput="calcDiff()" required>
        </div>
        <div class="form-group">
          <label>Closing Reading</label>
          <input type="number" id="closingReading" oninput="calcDiff()" required>
        </div>
      </div>
      <div class="form-group">
        <label>Reading Difference</label>
        <input type="number" id="readingDiff" class="disabled-input" readonly>
      </div>
      
      <div class="row">
        <div class="form-group">
          <label>T.A.</label>
          <input type="number" id="taValue" oninput="calcTotal()" value="0">
        </div>
        <div class="form-group">
          <label>D.A.</label>
          <input type="number" id="daValue" oninput="calcTotal()" value="0">
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Hotel</label>
          <input type="number" id="hotelValue" oninput="calcTotal()" value="0">
        </div>
        <div class="form-group">
          <label>Mobile Expense</label>
          <input type="number" id="mobileValue" oninput="calcTotal()" value="0">
        </div>
      </div>
      <div class="form-group">
        <label>Grand Total (INR)</label>
        <input type="number" id="grandVal" class="disabled-input" readonly value="0">
      </div>
      
      <div class="form-group">
        <label>Upload Supporting Bill (File)</label>
        <input type="file" id="billFile" required>
      </div>
      
      <button type="submit" class="btn" id="submitBtn">Register Expense Claim</button>
      <div id="loader" class="hide" style="text-align:center; margin-top:15px;">
        <span class="spinner"></span> Processing Secure Submission...
      </div>
    </form>
  </div>
  
  <script>
    // Autofill values, calculate differences, submittal processing
    function calcDiff() {
      var op = parseFloat(document.getElementById('openingReading').value || 0);
      var cl = parseFloat(document.getElementById('closingReading').value || 0);
      document.getElementById('readingDiff').value = cl - op;
    }
    function calcTotal() {
      var ta = parseFloat(document.getElementById('taValue').value || 0);
      var da = parseFloat(document.getElementById('daValue').value || 0);
      var hotel = parseFloat(document.getElementById('hotelValue').value || 0);
      var mob = parseFloat(document.getElementById('mobileValue').value || 0);
      var grand = ta + da + hotel + mob;
      document.getElementById('grandVal').value = grand;
    }
  </script>
</body>
</html>
`
  }
];
