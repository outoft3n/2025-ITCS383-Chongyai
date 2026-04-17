// Enums
export type Role = 'APPLICANT' | 'RECRUITER' | 'ADMIN';
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';
export type InterviewType = 'IN_PERSON' | 'VIDEO' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type ConferenceStatus = 'WAITING' | 'ACTIVE' | 'ENDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// User entities
export interface ApplicantProfile {
  id: string;
  userId: string;
  resumeUrl: string | null;
  skills: string[];
  experience: string | null;
  education: string | null;
  preferredLocation: string | null;
  preferredSalaryMin: number | null;
  preferredSalaryMax: number | null;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  companyDescription: string | null;
  website: string | null;
  industry: string | null;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  isVerified: boolean;
  isPaid: boolean;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt?: string;
  applicantProfile?: ApplicantProfile | null;
  recruiterProfile?: RecruiterProfile | null;
}

// Job
export interface Job {
  id: string;
  recruiterId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string[];
  viewCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  recruiter?: {
    id: string;
    firstName: string;
    lastName: string;
    recruiterProfile: { companyName: string } | null;
  };
  _count?: { applications: number };
  matchScore?: number;
}

// Application
export interface Application {
  id: string;
  applicantId: string;
  jobId: string;
  status: ApplicationStatus;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  applicant?: Partial<User>;
}

// Interview
export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  duration: number;
  type: InterviewType;
  status: InterviewStatus;
  notes: string | null;
  conferenceId: string | null;
  createdAt: string;
  updatedAt: string;
  application?: Application;
}

// Bookmark
export interface Bookmark {
  id: string;
  applicantId: string;
  jobId: string;
  createdAt: string;
  job?: Job;
}

// Message
export interface Message {
  id: string;
  senderId: string | null;
  receiverId: string | null;
  content: string;
  isBot: boolean;
  sessionId: string;
  createdAt: string;
}

// Conference
export interface ConferenceParticipant {
  id: string;
  conferenceId: string;
  userId: string;
  joinedAt: string | null;
  leftAt: string | null;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'profileImageUrl'>;
}

export interface Conference {
  id: string;
  roomCode: string;
  title: string;
  status: ConferenceStatus;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  participants?: ConferenceParticipant[];
}

// Payment
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  transactionRef: string | null;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  user?: Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

// Verification
export interface Verification {
  id: string;
  userId: string;
  citizenId: string;
  status: VerificationStatus;
  verifiedAt: string | null;
  createdAt: string;
}

// API response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

// Auth
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone: string | null;
  isVerified: boolean;
  isPaid: boolean;
  profileImageUrl: string | null;
  applicantProfile?: ApplicantProfile | null;
  recruiterProfile?: RecruiterProfile | null;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'APPLICANT' | 'RECRUITER';
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface CreateJobForm {
  title: string;
  description: string;
  requirements: string;
  location: string;
  jobType: JobType;
  salaryMin?: number;
  salaryMax?: number;
  skills: string[];
  expiresAt?: string;
  isActive?: boolean;
}

export interface SearchFilters {
  q?: string;
  jobType?: JobType;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  page?: number;
  limit?: number;
}

// Invitation
export interface Invitation {
  id: string;
  recruiterId: string;
  applicantId: string;
  jobId: string;
  message: string | null;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  recruiter?: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl: string | null;
    recruiterProfile: { companyName: string; industry: string | null } | null;
  };
  applicant?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
    applicantProfile: { skills: string[]; experience: string | null; education: string | null } | null;
  };
  job?: Pick<Job, 'id' | 'title' | 'location' | 'jobType' | 'salaryMin' | 'salaryMax'>;
}

// Reports
export interface ReportSummary {
  users: { total: number; applicants: number; recruiters: number; admins: number };
  jobs: { active: number; inactive: number };
  applications: { total: number; accepted: number };
  payments: { completed: number; revenue: number };
  recentActivity: { newUsers: number; newJobs: number };
}
