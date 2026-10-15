import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { ENV } from './env';
import {
  IUser, IEmployee, IDepartment, ISkill, IProject,
  IAssignment, IRecommendation, ISkillEvidence,
  IMentorship, IMeeting, INotification, IAuditLog, IWorkloadPolicy
} from '../models/types';

interface DatabaseSchema {
  users: IUser[];
  employees: IEmployee[];
  departments: IDepartment[];
  skills: ISkill[];
  projects: IProject[];
  assignments: IAssignment[];
  recommendations: IRecommendation[];
  skillEvidence: ISkillEvidence[];
  mentorships: IMentorship[];
  meetings: IMeeting[];
  notifications: INotification[];
  auditLogs: IAuditLog[];
  policies: IWorkloadPolicy;
}

const defaultPolicies: IWorkloadPolicy = {
  maxUtilizationThreshold: 100.0,
  highRiskBlockingThreshold: 90.0,
  consecutiveOverloadLimitWeeks: 3,
  allowManagerExceptions: false,
  requireAuditJustification: true,
};

const defaultData: DatabaseSchema = {
  users: [],
  employees: [],
  departments: [],
  skills: [],
  projects: [],
  assignments: [],
  recommendations: [],
  skillEvidence: [],
  mentorships: [],
  meetings: [],
  notifications: [],
  auditLogs: [],
  policies: defaultPolicies,
};

class DataStore {
  private data: DatabaseSchema = { ...defaultData };
  private filePath: string;
  private isMongo: boolean = false;

  constructor() {
    const dataDir = path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'db.json');
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.saveToFile();
      }
    } catch (e) {
      console.warn('Could not read db.json, using in-memory store', e);
      this.data = { ...defaultData };
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to db.json', e);
    }
  }

  public async connectMongo() {
    try {
      console.log(`Connecting to MongoDB at ${ENV.MONGODB_URI}...`);
      await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      this.isMongo = true;
      console.log('✅ Connected to MongoDB successfully.');
    } catch (err: any) {
      this.isMongo = false;
      console.log('ℹ️ Local MongoDB daemon not detected. Using high-performance embedded resilient datastore (data/db.json).');
    }
  }

  public isConnectedToMongo(): boolean {
    return this.isMongo;
  }

  // Generic collection helper
  private collection<T extends { id?: string }>(key: keyof DatabaseSchema) {
    return {
      find: async (filter?: Partial<T> | ((item: T) => boolean)): Promise<T[]> => {
        const items = (this.data[key] as any[]) as T[];
        if (!filter) return items;
        if (typeof filter === 'function') {
          return items.filter(filter);
        }
        return items.filter(item => {
          return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        });
      },
      findOne: async (filter: Partial<T> | ((item: T) => boolean)): Promise<T | null> => {
        const items = (this.data[key] as any[]) as T[];
        if (typeof filter === 'function') {
          return items.find(filter) || null;
        }
        const found = items.find(item => {
          return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        });
        return found || null;
      },
      findById: async (id: string): Promise<T | null> => {
        const items = (this.data[key] as any[]) as T[];
        return items.find(item => item.id === id) || null;
      },
      create: async (doc: T): Promise<T> => {
        if (!doc.id) {
          doc.id = `${String(key).slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }
        (this.data[key] as any[]).push(doc);
        this.saveToFile();
        return doc;
      },
      updateOne: async (filter: Partial<T>, updates: Partial<T>): Promise<T | null> => {
        const items = (this.data[key] as any[]) as T[];
        const idx = items.findIndex(item => {
          return Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        });
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates };
        this.saveToFile();
        return items[idx];
      },
      findByIdAndUpdate: async (id: string, updates: Partial<T>): Promise<T | null> => {
        const items = (this.data[key] as any[]) as T[];
        const idx = items.findIndex(item => item.id === id);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates };
        this.saveToFile();
        return items[idx];
      },
      update: async (id: string, updates: Partial<T>): Promise<T | null> => {
        const items = (this.data[key] as any[]) as T[];
        const idx = items.findIndex(item => item.id === id);
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates };
        this.saveToFile();
        return items[idx];
      },
      deleteOne: async (filter: Partial<T>): Promise<boolean> => {
        const items = (this.data[key] as any[]) as T[];
        const initialLen = items.length;
        (this.data[key] as any[]) = items.filter(item => {
          return !Object.entries(filter).every(([k, v]) => (item as any)[k] === v);
        });
        this.saveToFile();
        return (this.data[key] as any[]).length < initialLen;
      },
      countDocuments: async (filter?: Partial<T>): Promise<number> => {
        if (!filter) return (this.data[key] as any[]).length;
        const res = await this.collection<T>(key).find(filter);
        return res.length;
      },
      insertMany: async (docs: T[]): Promise<T[]> => {
        docs.forEach(doc => {
          if (!doc.id) {
            doc.id = `${String(key).slice(0, 4)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          }
        });
        (this.data[key] as any[]).push(...docs);
        this.saveToFile();
        return docs;
      },
      clear: async (): Promise<void> => {
        (this.data[key] as any[]) = [];
        this.saveToFile();
      }
    };
  }

  public users = this.collection<IUser>('users');
  public employees = this.collection<IEmployee>('employees');
  public departments = this.collection<IDepartment>('departments');
  public skills = this.collection<ISkill>('skills');
  public projects = this.collection<IProject>('projects');
  public assignments = this.collection<IAssignment>('assignments');
  public recommendations = this.collection<IRecommendation>('recommendations');
  public skillEvidence = this.collection<ISkillEvidence>('skillEvidence');
  public mentorships = this.collection<IMentorship>('mentorships');
  public meetings = this.collection<IMeeting>('meetings');
  public notifications = this.collection<INotification>('notifications');
  public auditLogs = this.collection<IAuditLog>('auditLogs');

  public async getPolicies(): Promise<IWorkloadPolicy> {
    return this.data.policies || defaultPolicies;
  }

  public async updatePolicies(policies: Partial<IWorkloadPolicy>): Promise<IWorkloadPolicy> {
    this.data.policies = { ...this.data.policies, ...policies };
    this.saveToFile();
    return this.data.policies;
  }
}

export const db = new DataStore();
