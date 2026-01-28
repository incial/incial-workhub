
export type CRMStatus = 'onboarded' | 'drop' | 'on progress' | 'Quote Sent' | 'lead' | 'completed';

export type UserRole = 'ROLE_SUPER_ADMIN' | 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_CLIENT';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  clientCrmId?: number; // Linked CRM ID for Client Role
  googleId?: string; 
  avatarUrl?: string; 
  createdAt?: string; 
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface AuthResponse {
  statusCode: number;
  token: string;
  role: string;
  user: User;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  clientCrmId?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string; 
  otp: string; 
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SocialLinks {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  twitter?: string;
  other?: string;
}

export interface CRMEntry {
  id: number;
  company: string;
  phone: string;
  email: string;
  contactName: string;
  assignedTo: string;
  assigneeId?: number; // Linked User ID
  address?: string; 
  companyImageUrl?: string; 
  lastContact: string; 
  nextFollowUp: string; 
  dealValue: number;
  notes: string;
  status: CRMStatus;
  tags: string[];
  work: string[];
  leadSources: string[];
  driveLink?: string; 
  socials?: SocialLinks;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  referenceId?: string; 
}

export interface FilterState {
  status: string;
  assignedTo: string;
  search: string;
  dateRangeStart: string;
  dateRangeEnd: string;
}

export interface CompanyFilterState {
  search: string;
  status: string;
  workType: string;
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'In Review' | 'Posted' | 'Completed' | 'Dropped' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskType = 'General' | 'Reel' | 'Post' | 'Story' | 'Carousel' | 'Video';

export interface Task {
  id: number;
  companyId?: number; 
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType?: TaskType; 
  assignedTo?: string; // Deprecated: for backward compatibility
  assignedToList?: string[]; // New: list of assignee emails
  assigneeId?: number; // Deprecated: for backward compatibility
  dueDate: string; 
  attachments?: string[]; 
  taskLink?: string; 
  createdAt: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  isVisibleOnMainBoard?: boolean; 
}

export interface TaskFilterState {
  search: string;
  status: string;
  priority: string;
  assignedTo: string;
}

export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Postponed';

export interface Meeting {
  id: number;
  title: string;
  dateTime: string; 
  status: MeetingStatus;
  meetingLink?: string;
  notes?: string;
  companyId?: number; 
  assignedTo?: string;
  assigneeId?: number; // Linked User ID
  createdAt: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface MeetingFilterState {
  search: string;
  status: string;
  dateRangeStart: string;
}

export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export type CalendarItem = {
    id: string; 
    dateStr: string; 
    sortTime: number; 
    title: string;
    type: 'task' | 'meeting';
    data: Task | Meeting;
    status: string;
    priority?: string; 
};
