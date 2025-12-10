
import axios from 'axios';
import { CRMEntry, Task, Meeting, User, UserRole, AuthResponse } from '../types';
import { MOCK_CRM_DATA, MOCK_TASKS_DATA, MOCK_MEETINGS_DATA } from './mockData';

// In a real app, this comes from env
const API_URL = 'https://api.incial.com/api/v1'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mock delay to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const crmApi = {
  // Mocking the get call for demonstration purposes since we don't have a real backend
  getAll: async (): Promise<{crmList: CRMEntry[]}> => {
    // REAL CALL: return api.get("/crm/all");
    await delay(600);
    const stored = localStorage.getItem('mock_crm_data');
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            // Sanitize legacy data: Ensure 'work' is string[], not object[]
            const sanitized = parsed.map((entry: any) => ({
                ...entry,
                work: Array.isArray(entry.work) 
                    ? entry.work.map((w: any) => (typeof w === 'object' && w !== null && 'name' in w) ? w.name : w) 
                    : []
            }));
            // Update storage with sanitized data
            localStorage.setItem('mock_crm_data', JSON.stringify(sanitized));
            return { crmList: sanitized };
        } catch (e) {
            console.warn("Failed to parse local CRM data", e);
            return { crmList: MOCK_CRM_DATA };
        }
    }
    return { crmList: MOCK_CRM_DATA };
  },

  create: async (data: Omit<CRMEntry, 'id'>): Promise<CRMEntry> => {
    // REAL CALL: return api.post("/crm/create", data);
    await delay(400);
    const newEntry = { 
        ...data, 
        id: Date.now(),
        // Generate a reference ID if it's a "Company" type status
        referenceId: (data.status === 'onboarded' || data.status === 'on progress') 
            ? `REF-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
            : undefined
    };
    return newEntry;
  },

  update: async (id: number, data: Partial<CRMEntry>): Promise<CRMEntry> => {
     // REAL CALL: return api.put(`/crm/update/${id}`, data);
     await delay(300);
     return { id, ...data } as CRMEntry;
  },

  delete: async (id: number): Promise<void> => {
    // REAL CALL: return api.delete(`/crm/delete/${id}`);
    await delay(300);
  }
};

export const tasksApi = {
  getAll: async (): Promise<Task[]> => {
    await delay(600);
    const stored = localStorage.getItem('mock_tasks_data');
    if (stored) return JSON.parse(stored);
    return MOCK_TASKS_DATA;
  },

  create: async (data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    await delay(300);
    const newEntry: Task = { 
      ...data, 
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    return newEntry;
  },

  update: async (id: number, data: Partial<Task>): Promise<Task> => {
     await delay(200);
     return { id, ...data } as Task;
  },

  delete: async (id: number): Promise<void> => {
    await delay(200);
  }
};

export const meetingsApi = {
  getAll: async (): Promise<Meeting[]> => {
    await delay(600);
    const stored = localStorage.getItem('mock_meetings_data');
    if (stored) return JSON.parse(stored);
    return MOCK_MEETINGS_DATA;
  },

  create: async (data: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> => {
    await delay(300);
    const newEntry: Meeting = {
      ...data,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    return newEntry;
  },

  update: async (id: number, data: Partial<Meeting>): Promise<Meeting> => {
    await delay(200);
    return { id, ...data } as Meeting;
  },

  delete: async (id: number): Promise<void> => {
    await delay(200);
  }
};

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // REAL CALL: return api.post("/auth/login", { email, password });
    await delay(800);
    
    // 1. SUPER ADMIN (Everything)
    if (email === 'super@incial.com' && password === 'super') {
      return {
        statusCode: 200,
        token: "mock-jwt-token-super",
        role: "ROLE_SUPER_ADMIN",
        user: { id: 1, name: "Super Admin", email, role: "ROLE_SUPER_ADMIN" as UserRole },
        message: "Login successful"
      };
    }

    // 2. ADMIN (Everything except Analytics)
    if (email === 'admin@incial.com' && password === 'admin') {
      return {
        statusCode: 200,
        token: "mock-jwt-token-admin",
        role: "ROLE_ADMIN",
        // FIX: Changed name from "Vallapata (Admin)" to "Vallapata" to match MOCK_TASKS_DATA
        user: { id: 2, name: "Vallapata", email, role: "ROLE_ADMIN" as UserRole },
        message: "Login successful"
      };
    }

    // 3. EMPLOYEE (Tasks, Companies, Client Tracker, Meetings)
    if (email === 'employee@incial.com' && password === 'employee') {
      return {
        statusCode: 200,
        token: "mock-jwt-token-employee",
        role: "ROLE_EMPLOYEE",
        user: { id: 3, name: "John Doe", email, role: "ROLE_EMPLOYEE" as UserRole },
        message: "Login successful"
      };
    }

    // 4. CLIENT (Own Company Data Only) - Mapping to Company ID 1 (SMR Rubbers)
    if (email === 'client@incial.com' && password === 'client') {
      return {
        statusCode: 200,
        token: "mock-jwt-token-client",
        role: "ROLE_CLIENT",
        user: { 
            id: 4, 
            name: "Anil Michael", 
            email, 
            role: "ROLE_CLIENT" as UserRole,
            companyId: 1 // Linked to SMR Rubbers in mock data
        },
        message: "Login successful"
      };
    }

    throw new Error("Invalid credentials");
  }
};
