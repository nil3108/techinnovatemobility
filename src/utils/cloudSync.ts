/**
 * ============================================================
 * CNG FLOW - CLOUD DATA SYNC ARCHITECTURE
 * ============================================================
 * 
 * This module demonstrates how a real-world multi-device CNG 
 * tracking system would work. In production, this would connect
 * to Firebase, Supabase, or a custom backend server.
 * 
 * DATA FLOW ARCHITECTURE:
 * ─────────────────────────────────────────────────────────────
 * 
 *  [DRIVER PHONE 1] ──┐
 *  (DRV777 Rajesh)    │
 *                      │
 *  [DRIVER PHONE 2] ──┼──► [CLOUD SERVER API] ──► [OWNER DASHBOARD]
 *  (DRV888 Amit)      │    (Firebase/Supabase)    (Web/Mobile App)
 *                      │
 *  [DRIVER PHONE 3] ──┘
 *  (DRV999 Suresh)
 * 
 * 
 * HOW IT WORKS IN PRODUCTION:
 * ─────────────────────────────────────────────────────────────
 * 
 * 1. DRIVER REGISTRATION (Owner creates account)
 *    - Owner logs into their dashboard
 *    - Creates a new driver with name + unique access code
 *    - Driver receives their code (e.g., DRV777)
 *    - This data is stored in the CLOUD DATABASE
 * 
 * 2. DRIVER LOGIN (Driver enters code on their phone)
 *    - Driver opens the app on THEIR device
 *    - Enters the access code (DRV777)
 *    - App validates against CLOUD DATABASE
 *    - If valid, driver sees their assigned vehicle
 *    - JWT token is issued for secure API calls
 * 
 * 3. CNG FILL SUBMISSION (Driver records a fill)
 *    - Driver completes the 5-step wizard
 *    - Video, photos, GPS coordinates are captured
 *    - Data is uploaded to CLOUD STORAGE (Firebase Storage/S3)
 *    - Fill record is saved to CLOUD DATABASE
 *    - Real-time sync notifies the owner dashboard
 * 
 * 4. OWNER VERIFICATION (Owner reviews data)
 *    - Owner opens their dashboard on ANY device
 *    - Fetches all fill records from CLOUD DATABASE
 *    - Views videos, photos, and GPS coordinates
 *    - System automatically flags mismatches
 *    - Alerts are generated for anomalies
 * 
 * 
 * PRODUCTION TECHNOLOGY STACK:
 * ─────────────────────────────────────────────────────────────
 * 
 * Backend Options:
 *   - Firebase (Firestore + Storage + Auth)
 *   - Supabase (PostgreSQL + Storage + Auth)
 *   - Custom: Node.js/Express + MongoDB/PostgreSQL
 *   - Custom: Python/Django + PostgreSQL
 * 
 * Authentication:
 *   - Firebase Authentication (Phone OTP, Email/Password)
 *   - JWT (JSON Web Tokens) for API security
 *   - OAuth 2.0 for third-party integrations
 * 
 * Real-time Sync:
 *   - Firebase Realtime Database listeners
 *   - WebSockets (Socket.io)
 *   - Server-Sent Events (SSE)
 * 
 * Cloud Storage (Media):
 *   - Firebase Storage (videos, photos)
 *   - AWS S3 + CloudFront CDN
 *   - Google Cloud Storage
 * 
 * Security:
 *   - HTTPS/TLS encryption for all data in transit
 *   - AES-256 encryption for data at rest
 *   - Geofencing validation on server-side
 *   - Rate limiting to prevent abuse
 * 
 * ============================================================
 */

import { Driver, CngFill, calculateDistanceInMeters } from './mockData';

// Simulated network delay for realistic behavior
const simulateNetworkDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Simulated "device fingerprint" to show multi-device behavior
export interface DeviceInfo {
  deviceId: string;
  deviceType: 'Android Phone' | 'iOS Phone' | 'Desktop Browser';
  deviceModel: string;
  location: string;
  lastSync: string;
  status: 'online' | 'offline' | 'syncing';
}

export interface SyncStatus {
  lastSyncTimestamp: string;
  pendingUploads: number;
  totalSynced: number;
  cloudStorageUsed: string;
  networkLatency: string;
  syncHealth: 'excellent' | 'good' | 'poor' | 'offline';
}

// Simulated device fleet
export const SIMULATED_DEVICES: DeviceInfo[] = [
  {
    deviceId: 'DRV777-PHONE',
    deviceType: 'Android Phone',
    deviceModel: 'Samsung Galaxy M34 5G',
    location: 'Alkapuri, Vadodara',
    lastSync: new Date(Date.now() - 300000).toISOString(), // 5 mins ago
    status: 'online'
  },
  {
    deviceId: 'DRV888-PHONE',
    deviceType: 'iOS Phone',
    deviceModel: 'iPhone 14 Pro',
    location: 'Gotri Road, Vadodara',
    lastSync: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
    status: 'syncing'
  },
  {
    deviceId: 'DRV999-PHONE',
    deviceType: 'Android Phone',
    deviceModel: 'Redmi Note 12 Pro',
    location: 'Makarpura GIDC, Vadodara',
    lastSync: new Date(Date.now() - 1200000).toISOString(), // 20 mins ago
    status: 'online'
  },
  {
    deviceId: 'OWNER-DESKTOP',
    deviceType: 'Desktop Browser',
    deviceModel: 'Chrome on Windows 11',
    location: 'Fleet HQ, Alkapuri',
    lastSync: new Date().toISOString(),
    status: 'online'
  }
];

// Simulated cloud storage breakdown
export interface CloudStorageBreakdown {
  totalCapacity: string;
  usedSpace: string;
  videoStorage: string;
  photoStorage: string;
  documentStorage: string;
  percentageUsed: number;
}

export const CLOUD_STORAGE: CloudStorageBreakdown = {
  totalCapacity: '100 GB',
  usedSpace: '12.4 GB',
  videoStorage: '9.2 GB',
  photoStorage: '2.8 GB',
  documentStorage: '0.4 GB',
  percentageUsed: 12.4
};

// ============================================================
// SIMULATED CLOUD API FUNCTIONS
// ============================================================

/**
 * Simulates driver authentication via cloud API
 * In production: POST /api/auth/driver/login
 */
export async function cloudAuthenticateDriver(code: string): Promise<{
  success: boolean;
  token?: string;
  driver?: Driver;
  message: string;
}> {
  await simulateNetworkDelay(600);
  
  const drivers: Driver[] = JSON.parse(localStorage.getItem('cng_drivers') || '[]');
  const foundDriver = drivers.find(d => d.code.toUpperCase() === code.toUpperCase());
  
  if (foundDriver) {
    return {
      success: true,
      token: `jwt_token_${foundDriver.code}_${Date.now()}`,
      driver: foundDriver,
      message: `Driver ${foundDriver.name} authenticated successfully via cloud API`
    };
  }
  
  return {
    success: false,
    message: 'Invalid driver code. Cloud API returned 401 Unauthorized.'
  };
}

/**
 * Simulates submitting a CNG fill record to cloud
 * In production: POST /api/fills + PUT /api/storage/upload
 */
export async function cloudSubmitFill(fillData: Omit<CngFill, 'id'>): Promise<{
  success: boolean;
  fillId?: string;
  message: string;
  syncStatus: string;
}> {
  await simulateNetworkDelay(1200);
  
  const fills: CngFill[] = JSON.parse(localStorage.getItem('cng_fills') || '[]');
  const newFill: CngFill = {
    ...fillData,
    id: `cloud-fill-${Date.now()}`
  };
  
  fills.unshift(newFill);
  localStorage.setItem('cng_fills', JSON.stringify(fills));
  
  return {
    success: true,
    fillId: newFill.id,
    message: `CNG fill record uploaded to cloud successfully`,
    syncStatus: 'synced'
  };
}

/**
 * Simulates fetching all fills from cloud for owner dashboard
 * In production: GET /api/fills?ownerId=xxx
 */
export async function cloudFetchOwnerFills(): Promise<{
  success: boolean;
  fills: CngFill[];
  totalRecords: number;
  syncTime: string;
}> {
  await simulateNetworkDelay(500);
  
  const fills: CngFill[] = JSON.parse(localStorage.getItem('cng_fills') || '[]');
  
  return {
    success: true,
    fills: fills,
    totalRecords: fills.length,
    syncTime: new Date().toISOString()
  };
}

/**
 * Simulates the geotag verification process
 * In production: This would run on the SERVER-SIDE to prevent tampering
 */
export async function cloudVerifyGeotags(fill: CngFill): Promise<{
  verified: boolean;
  distanceMeters: number;
  isMismatched: boolean;
  serverTimestamp: string;
  verificationHash: string;
}> {
  await simulateNetworkDelay(300);
  
  const distance = calculateDistanceInMeters(
    fill.receiptGeo.lat,
    fill.receiptGeo.lng,
    fill.odometerGeo.lat,
    fill.odometerGeo.lng
  );
  
  return {
    verified: true,
    distanceMeters: distance,
    isMismatched: distance > 500,
    serverTimestamp: new Date().toISOString(),
    verificationHash: `sha256_${btoa(JSON.stringify(fill)).substring(0, 16)}`
  };
}

/**
 * Simulates real-time sync status
 * In production: WebSocket connection or Firebase listener
 */
export async function cloudGetSyncStatus(): Promise<SyncStatus> {
  await simulateNetworkDelay(200);
  
  return {
    lastSyncTimestamp: new Date().toISOString(),
    pendingUploads: Math.floor(Math.random() * 3),
    totalSynced: JSON.parse(localStorage.getItem('cng_fills') || '[]').length,
    cloudStorageUsed: CLOUD_STORAGE.usedSpace,
    networkLatency: `${Math.floor(Math.random() * 50 + 20)}ms`,
    syncHealth: 'excellent'
  };
}

/**
 * Explains the multi-device data flow
 */
export function getDataFlowDiagram(): string {
  return `
┌─────────────────────────────────────────────────────────────────┐
│                    CNG FLOW DATA ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  DRIVER 1    │    │  DRIVER 2    │    │  DRIVER 3    │      │
│  │  Samsung     │    │  iPhone 14   │    │  Redmi       │      │
│  │  DRV777      │    │  DRV888      │    │  DRV999      │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         │   HTTPS/TLS Encrypted API Calls       │               │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ☁️  CLOUD SERVER (Firebase/Supabase)        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ Auth Service│  │ Database    │  │ File Storage│     │   │
│  │  │ (JWT Tokens)│  │ (Firestore) │  │ (Videos/    │     │   │
│  │  │             │  │             │  │  Photos)    │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                    │
│                            │  Real-time Sync                    │
│                            │  (WebSocket/Firebase)              │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              📊 OWNER DASHBOARD (Any Device)            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ Vehicle     │  │ Media       │  │ Alert       │     │   │
│  │  │ Manager     │  │ Verifier    │  │ Monitor     │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
  `;
}
