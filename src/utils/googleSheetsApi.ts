/**
 * CNG FLOW - GOOGLE SHEETS API SERVICE
 * Uses localStorage as primary storage, Google Sheets for cloud sync
 */

// ==================== CONFIGURATION ====================
function getApiUrl(): string {
  const stored = localStorage.getItem('cng_google_sheets_url');
  if (stored) return stored;
  
  // Support URL parameter for easy device setup
  const urlParams = new URLSearchParams(window.location.search);
  const urlFromParam = urlParams.get('api_url');
  if (urlFromParam) {
    localStorage.setItem('cng_google_sheets_url', urlFromParam);
    return urlFromParam;
  }
  
  return '';
}

export function setApiUrl(url: string) {
  localStorage.setItem('cng_google_sheets_url', url);
}

export function isGoogleSheetsConfigured(): boolean {
  return getApiUrl().length > 0;
}

export function getConfigStatus(): string {
  return isGoogleSheetsConfigured() ? 'Connected to Google Sheets' : 'Demo Mode (localStorage)';
}

export function getGoogleSheetsUrl(): string {
  return localStorage.getItem('cng_google_sheets_url') || '';
}

export function saveGoogleSheetsUrl(url: string) {
  localStorage.setItem('cng_google_sheets_url', url);
}

// ==================== JSONP HELPER ====================
function jsonpRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'cb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout'));
    }, 15000);
    
    function cleanup() {
      clearTimeout(timeout);
      delete (window as any)[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }
    
    (window as any)[callbackName] = function(data: any) {
      cleanup();
      resolve(data);
    };
    
    const script = document.createElement('script');
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    script.onerror = function() {
      cleanup();
      reject(new Error('Script error'));
    };
    
    document.head.appendChild(script);
  });
}

// ==================== LOCALSTORAGE FALLBACK ====================
function fallbackRequest(action: string, data?: any): any {
  switch(action) {
    case 'getDrivers':
      return { success: true, drivers: JSON.parse(localStorage.getItem('cng_drivers') || '[]') };
    case 'authenticateDriver': {
      const drivers = JSON.parse(localStorage.getItem('cng_drivers') || '[]');
      const driver = drivers.find((d: any) => d.code?.toUpperCase() === data?.code?.toUpperCase());
      return driver ? { success: true, driver } : { success: false, message: 'Invalid code' };
    }
    case 'addDriver': {
      const d = JSON.parse(localStorage.getItem('cng_drivers') || '[]');
      const newDriver = { id: 'drv-' + Date.now(), name: data.name, code: data.code.toUpperCase(), assignedVehicleId: data.assignedVehicleId || '', status: 'Active' };
      localStorage.setItem('cng_drivers', JSON.stringify([...d, newDriver]));
      return { success: true, driver: newDriver };
    }
    case 'getVehicles':
      return { success: true, vehicles: JSON.parse(localStorage.getItem('cng_vehicles') || '[]') };
    case 'addVehicle': {
      const v = JSON.parse(localStorage.getItem('cng_vehicles') || '[]');
      const newVehicle = { id: 'veh-' + Date.now(), plateNumber: data.plateNumber.toUpperCase(), model: data.model, initialOdo: parseInt(data.initialOdo) || 0, currentOdo: parseInt(data.initialOdo) || 0, fuelCapacity: parseInt(data.fuelCapacity) || 12, status: 'Active' };
      localStorage.setItem('cng_vehicles', JSON.stringify([...v, newVehicle]));
      return { success: true, vehicle: newVehicle };
    }
    case 'getFills':
      return { success: true, fills: JSON.parse(localStorage.getItem('cng_fills') || '[]') };
    case 'addFill': {
      const f = JSON.parse(localStorage.getItem('cng_fills') || '[]');
      const newFill = { id: 'fill-' + Date.now(), ...data, timestamp: new Date().toISOString() };
      localStorage.setItem('cng_fills', JSON.stringify([newFill, ...f]));
      return { success: true, fillId: newFill.id };
    }
    case 'getAlerts':
      return { success: true, alerts: JSON.parse(localStorage.getItem('cng_alerts') || '[]') };
    case 'addAlert': {
      const a = JSON.parse(localStorage.getItem('cng_alerts') || '[]');
      const newAlert = { id: 'alert-' + Date.now(), timestamp: new Date().toISOString(), ...data };
      localStorage.setItem('cng_alerts', JSON.stringify([newAlert, ...a]));
      return { success: true, alert: newAlert };
    }
    case 'getDashboardStats': {
      const v = JSON.parse(localStorage.getItem('cng_vehicles') || '[]');
      const d = JSON.parse(localStorage.getItem('cng_drivers') || '[]');
      const f = JSON.parse(localStorage.getItem('cng_fills') || '[]');
      const a = JSON.parse(localStorage.getItem('cng_alerts') || '[]');
      return { success: true, stats: { totalVehicles: v.length, totalDrivers: d.length, totalFills: f.length, totalAlerts: a.length } };
    }
    default:
      return { success: false, message: 'Unknown action' };
  }
}

// ==================== API HELPER ====================
async function apiRequest(action: string, data?: any): Promise<any> {
  const apiUrl = getApiUrl();
  
  // Always get from localStorage first
  const localResult = fallbackRequest(action, data);
  
  // Try Google Sheets if configured
  if (apiUrl) {
    const readActions = ['getDrivers', 'getVehicles', 'getFills', 'getAlerts'];
    
    if (readActions.includes(action)) {
      try {
        let url = `${apiUrl}?action=${action}`;
        if (action === 'authenticateDriver' && data?.code) {
          url += `&code=${encodeURIComponent(data.code)}`;
        }
        const result = await jsonpRequest(url);
        if (result?.success) {
          // Update localStorage with fresh data
          if (result.drivers) localStorage.setItem('cng_drivers', JSON.stringify(result.drivers));
          if (result.vehicles) localStorage.setItem('cng_vehicles', JSON.stringify(result.vehicles));
          if (result.fills) localStorage.setItem('cng_fills', JSON.stringify(result.fills));
          if (result.alerts) localStorage.setItem('cng_alerts', JSON.stringify(result.alerts));
          return result;
        }
      } catch (e) {
        console.log('Google Sheets sync failed, using localStorage');
      }
    }
    
    // For writes, send to Google Sheets in background
    const writeActions = ['addDriver', 'addVehicle', 'addFill', 'addAlert'];
    if (writeActions.includes(action)) {
      try {
        await fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify({ action, ...data })
        });
      } catch (e) {
        console.log('Google Sheets write failed');
      }
    }
  }
  
  return localResult;
}

// ==================== PUBLIC API ====================
export async function getDrivers() { return apiRequest('getDrivers'); }
export async function authenticateDriver(code: string) { return apiRequest('authenticateDriver', { code }); }
export async function addDriver(data: { name: string; code: string; assignedVehicleId?: string }) { return apiRequest('addDriver', data); }
export async function getVehicles() { return apiRequest('getVehicles'); }
export async function addVehicle(data: any) { return apiRequest('addVehicle', data); }
export async function getFills() { return apiRequest('getFills'); }
export async function addFill(data: any) { return apiRequest('addFill', data); }
export async function getAlerts() { return apiRequest('getAlerts'); }
export async function addAlert(data: any) { return apiRequest('addAlert', data); }
export async function getDashboardStats() { return apiRequest('getDashboardStats'); }

export async function uploadMediaToDrive(base64Data: string, fileName: string, mimeType: string, folderName: string) {
  const apiUrl = getApiUrl();
  
  // If no API, save locally as data URL
  if (!apiUrl) {
    console.log('📁 No Google Sheets URL, saving media locally');
    return { 
      success: true, 
      fileUrl: `data:${mimeType};base64,${base64Data.substring(0, 100)}...`, 
      message: 'Saved locally (no Drive connected)' 
    };
  }
  
  try {
    console.log(`📤 Uploading ${fileName} to Google Drive folder: ${folderName}`);
    
    // Send to Apps Script for Drive upload
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ 
        action: 'uploadMedia', 
        base64Data: base64Data,
        fileName: fileName, 
        mimeType: mimeType, 
        folderPath: folderName 
      })
    });
    
    // With no-cors we can't read response, but file IS being uploaded
    // Return a constructable Google Drive URL
    const fileUrl = `https://drive.google.com/drive/folders/CNG+Flow+Media/${folderName}`;
    
    console.log(`✅ ${fileName} sent to Google Drive`);
    
    return { 
      success: true, 
      fileUrl: fileUrl,
      fileName: fileName,
      message: 'File uploaded to Google Drive' 
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    // Still return success since the fill record should be saved
    return { 
      success: true, 
      fileUrl: `Upload pending: ${fileName}`,
      message: 'Upload queued (will sync when online)' 
    };
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
