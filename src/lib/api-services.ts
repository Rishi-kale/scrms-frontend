// API Service modules for Company Client Partner Platform
import { api, apiFetchRaw, smartHiringApi } from './api';
import { ALLOWED_ROLES } from "@/app/(app)/constant";

export interface UserHistory {
  id: string;
  userId: string;
  isActive: boolean;
  oldRoleId: string | null;
  newRoleId: string | null;
  changedById: string;
  changeType: 'assigned' | 'revoked';
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  isActive: boolean;
  actorId: string;
  action: string;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  role: {
    id: string;
    key: string;
    name: string;
  };
}

export interface Qualification {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}


export interface Resource {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}


export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  azureOid: string | null;
  azureTid: string | null;
  userRoles: UserRole[];
  histories: UserHistory[];
  changedHistories: UserHistory[];
  auditLogs: AuditLog[];
}


// Leads API types
export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Follow-up'
  | 'Proposal Sent'
  | 'In Negotiation'
  | 'Won'
  | 'Lost'
  | 'On-hold';

export interface LeadSummary {
  _id: string;
  customer: { id: string; name: string; email?: string; phone?: string; company?: string };
  title: string;
  description?: string;
  createdBy: string;
  source?: string;
  status: LeadStatus;
  projectManager?: string;
  teamSize?: number;
  projectHealth?: 'Good' | 'Moderate' | 'AT Risk';
  createdAt: string;
}

export interface LeadDetails extends LeadSummary {
  description?: string;
  attachments?: Array<{ id: string; url: string; name: string }>;
  notes?: string;
}

export interface LeadsListResponse {
  success: boolean;
  data: LeadSummary[] | {
    // Support both simple arrays and paginated shape
    page: number;
    totalPages: number;
    totalItems: number;
    limit?: number;
    leads: LeadSummary[];
  };
  message: string;
  error?: Record<string, unknown>;
}

export const leadsAPI = {
  fetchAll: async (params: {
    page?: number;
    limit?: number;
    status?: LeadStatus;
    source?: string;
    customerId?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.append('page', String(params.page));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.status) qs.append('status', String(params.status));
    if (params?.source) qs.append('source', String(params.source)); // Add source parameter
    if (params?.customerId) qs.append('customerId', params.customerId);
    return api.get<{
      success: boolean;
      data: LeadSummary[];
      message: string;
    }>(`/api/v1/leads${qs.toString() ? `?${qs.toString()}` : ''}`);
  },

  getById: async (id: string) => {
    return api.get<{
      success: boolean;
      data: LeadDetails;
      message: string;
    }>(`/api/v1/leads/${id}`);
  },

  create: async (payload: {
    title: string;
    description: string;
    source: string;
    status?: LeadStatus;
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerCompany?: string;
    createdBy?: string;
    projectHealth?: 'Good' | 'Moderate' | 'AT Risk';
  }) => {
    // Set default project health as 'Good' for new leads
    const finalPayload = {
      ...payload,
      projectHealth: payload.projectHealth || 'Good'
    };
    return api.post<{
      success: boolean;
      data: LeadDetails;
      message: string;
    }>(`/api/v1/leads`, finalPayload);
  },

  update: async (id: string, payload: Partial<{
    title: string;
    description: string;
    source: string;
    status: LeadStatus;
    updatedBy: string;
    projectManager: string;
    teamSize: number;
    projectHealth: 'Good' | 'Moderate' | 'AT Risk';
  }>) => {
    return api.put<{
      success: boolean;
      data: LeadDetails;
      message: string;
    }>(`/api/v1/leads/${id}`, payload);
  },

  remove: async (id: string) => {
    return api.delete<{
      success: boolean;
      data: null;
      message: string;
    }>(`/api/v1/leads/${id}`);
  },

  getByCustomer: async (customerId: string) => {
    return api.get<{
      success: boolean;
      data: { customer: { id: string; name: string }; leads: LeadSummary[]; totalLeads: number };
      message: string;
    }>(`/api/v1/leads/customer/${customerId}`);
  },

  syncLeadToJobs: async (leadId: string) => {
    return api.post<{
      success: boolean;
      data: null;
      message: string;
    }>(`/api/v1/leads/${leadId}/sync-to-jobs`);
  },
};

// Meta data types

export interface Customer {
  id: string;
  name: string;
  description?: string;
  status: string;
}


// Auth API - matches actual backend endpoints
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    return apiFetchRaw("/api/auth/login", {
      method: "POST",
      body: credentials,
      withCredentials: true,
    });
  },

  getUserDetails: async () => {
    return smartHiringApi.get<{
      success: boolean;
      data: {
        id: string;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        roles: Array<{
          id: string;
          name: string;
          key: string;
        }>;
      };
      message: string;
      error: Record<string, unknown>;
    }>('/api/auth/user/details');
  },

  signup: async (userData: { name: string; email: string; password: string }) => {
    return api.post<User>('/api/auth/signup', userData);
  },

  forgotPassword: async (email: string) => {
    return api.post('/api/auth/forgot-password', { email });
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    return api.patch('/api/auth/reset-password', data);
  }
};

export const metaAPI = {
  getCustomers: async () => {
    return api.get<{
      success: boolean;
      data: Customer[];  // Changed from object to array
      message: string;
    }>('/api/v1/customers');
  },
  // CRUD operations for Customers
  createCustomer: async (data: {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    description?: string;
    createdBy?: string;
  }) => {
    return api.post<Customer>('/api/v1/customers', data);
  },

  updateCustomer: async (id: string, data: { name: string; description?: string }) => {
    return api.put<Customer>(`/api/v1/customers/${id}`, data);
  },

  deleteCustomer: async (id: string) => {
    return api.delete(`/api/v1/customers/${id}`);
  },

}

export const adminAPI = {

  getAllUsers: async () => {
    return smartHiringApi.get<{
      success: boolean;
      data: {
        page: number;
        totalPages: number;
        totalItems: number;
        users: User[];
      };
      message: string;
      error: Record<string, unknown>;
    }>(`/api/admin/users?roleKeys=${ALLOWED_ROLES.join(",")}`);
  },

  createUser: async (data: { name: string; email: string; password: string; roleIds: string[] }) => {
    return api.post<User>('/api/admin/users', data);
  },

  updateUser: async (id: string, data: { name?: string; email?: string; isActive?: boolean }) => {
    return api.put<User>(`/api/admin/users/${id}`, data);
  },

  deleteUser: async (id: string) => {
    return api.delete(`/api/admin/users/${id}`);
  },

  // User Roles

  getProjectsByCustomer: async (customerId: string) => {
    return api.get(`/api/v1/leads/customer/${customerId}`);
  },

  assignProjectsToUser: async (data: { userId: string; leadIds: string[] }) => {
    return api.post('/api/v1/leads/assign', data);
  },

};

export const jobsMetaAPI = {

  getProjects: async () => {
    return api.get<{
      success: boolean;
      data: {
        items: Project[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
      message: string;
      error: Record<string, unknown>;
    }>('/api/jobs/meta/projects');
  },

  getProjectsByCustomer: async (customerId: string) => {
    return smartHiringApi.get<{
      success: boolean;
      data: {
        items: Project[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      };
      message: string;
      error: Record<string, unknown>;
    }>(`/api/jobs/meta/projects?customerId=${customerId}`);
  },

  // CRUD operations for Job Roles

  deleteJobRole: async (id: string) => {
    return api.delete(`/api/jobs/meta/job-roles/${id}`);
  },

  // CRUD operations for Customers
  createCustomer: async (data: { name: string; description?: string }) => {
    return api.post<Customer>('/api/jobs/meta/customers', data);
  },

  updateCustomer: async (id: string, data: { name: string; description?: string }) => {
    return api.put<Customer>(`/api/jobs/meta/customers/${id}`, data);
  },

  deleteCustomer: async (id: string) => {
    return api.delete(`/api/jobs/meta/customers/${id}`);
  },

};