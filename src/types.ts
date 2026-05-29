export enum UserRole {
  EMPLOYEE = "Employee",
  SALESPERSON = "Salesperson",
  SUPERVISOR = "Supervisor",
  HR = "HR",
  ACCOUNTS = "Accounts",
  MIS_ADMIN = "MIS Admin",
  SUPER_ADMIN = "Super Admin"
}

export interface UserMaster {
  email: string;
  name: string;
  code: string;
  designation: string;
  state: string;
  department: string;
  supervisorName: string;
  supervisorEmail: string;
  hrName: string;
  hrEmail: string;
  role: UserRole;
  active: boolean;
}

export interface Claim {
  id: string; // Submission Number: e.g. TADA-2026-00001
  timestamp: string;
  employeeName: string;
  employeeCode: string;
  employeeEmail: string;
  designation: string;
  state: string;
  department: string;
  date: string;
  poNo: string;
  particulars: string;
  openingReading: number;
  closingReading: number;
  readingDifference: number; // calculated: closing - opening
  ta: number;
  da: number;
  hotel: number;
  mobileExp: number;
  otherExp: number;
  grandTotal: number; // calculated sum
  dispatchedPoNo: string;
  billUploadFileLink: string;
  supervisorName: string;
  supervisorEmail: string;
  supervisorApprovalStatus: "Pending" | "Approved" | "Rejected";
  supervisorApprovalDate: string;
  supervisorRemarks: string;
  hrName: string;
  hrEmail: string;
  hrApprovalStatus: "Pending" | "Approved" | "Rejected";
  hrApprovalDate: string;
  hrRemarks: string;
  accountsPaymentStatus: "Pending" | "Paid";
  paymentDate: string;
  accountsRemarks: string;
  recordStatus: "Pending" | "Approved" | "Rejected" | "Paid";
  createdBy: string;
  updatedBy: string;
  lastUpdatedTimestamp: string;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "dropdown"
  | "email"
  | "file"
  | "calculated"
  | "hidden";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  section: "Employee Details" | "Claim Details";
  required: boolean;
  order: number;
  placeholder?: string;
  autofillFromUserMaster?: string; // key of UserMaster
  formula?: string; // description of formula, like "closing - opening"
  visibleToEmployee: boolean;
  visibleToSupervisor: boolean;
  visibleToHR: boolean;
  visibleToAccounts: boolean;
}

export interface AccessRule {
  role: UserRole;
  menuName: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  dataVisibilityType: "Own Data Only" | "Team Data Only" | "Department Data Only" | "State Data Only" | "All Data";
}

export interface EmailTemplate {
  mailType: string;
  triggerEvent: string;
  subject: string;
  body: string;
  signature: string;
  footer: string;
}

export interface NotificationRule {
  mailType: string;
  triggerEvent: string;
  enabled: boolean;
  sendToEmployee: boolean;
  sendToSupervisor: boolean;
  sendToHR: boolean;
  sendToAdmin: boolean;
  sendToAccounts: boolean;
  ccList: string; // comma-separated emails
  bccList: string; // comma-separated emails
}

export interface MailLogEntry {
  timestamp: string;
  mailType: string;
  triggerEvent: string;
  submissionNumber: string;
  recipient: string;
  cc: string;
  bcc: string;
  subject: string;
  status: "Success" | "Failed";
  errorMessage: string;
  sentBy: string;
  relatedEmployee: string;
}

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  action: string;
  sheetName: string;
  rowNumber: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  submissionNumber: string;
  remarks: string;
}

export interface SystemSettings {
  companyName: string;
  logoUrl: string;
  financialYear: string;
  themeColor: string;
  driveFolderId: string;
  instantMailOn: boolean;
  supervisorReminderCycle: string; // e.g., "Every 15 days", "Weekly"
  hrReminderCycle: string;
  accountsSummaryDay: string; // "1st of Month"
}
