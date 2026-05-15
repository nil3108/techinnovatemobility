import { useState } from 'react';
import { 
  CheckCircle2, 
  X,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface GoogleSheetsSetupProps {
  onClose: () => void;
  onSaveUrl: (url: string) => void;
  currentUrl: string;
}

// Apps Script code to copy
const APPS_SCRIPT_CODE = `
// ==================== CNG FLOW BACKEND API ====================
function getSpreadsheetId() {
  return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
}

function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
}

function getSpreadsheet() {
  var id = getSpreadsheetId();
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) {}
  }
  var ss = SpreadsheetApp.create("CNG Flow Database");
  setSpreadsheetId(ss.getId());
  return ss;
}

function getSheet(name) {
  return getSpreadsheet().getSheetByName(name);
}

function doGet(e) { return handleRequest(e, 'GET'); }
function doPost(e) { return handleRequest(e, 'POST'); }

function handleRequest(e, method) {
  try {
    var action, data;
    if (method === 'GET') { action = e.parameter.action; }
    else { data = JSON.parse(e.postData.contents); action = data.action; }
    
    var response;
    switch(action) {
      case 'getDrivers': response = getDrivers(); break;
      case 'addDriver': response = addDriver(data); break;
      case 'authenticateDriver': response = authenticateDriver(data); break;
      case 'getVehicles': response = getVehicles(); break;
      case 'addVehicle': response = addVehicle(data); break;
      case 'getFills': response = getFills(); break;
      case 'addFill': response = addFill(data); break;
      case 'getAlerts': response = getAlerts(); break;
      case 'addAlert': response = addAlert(data); break;
      case 'getDashboardStats': response = getDashboardStats(); break;
      default: response = { success: false, message: 'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getDrivers() {
  var sheet = getSheet('Drivers');
  if (!sheet) return { success: false, message: 'Drivers sheet not found' };
  var data = sheet.getDataRange().getValues();
  var drivers = [];
  for (var i = 1; i < data.length; i++) {
    var d = {};
    for (var j = 0; j < data[0].length; j++) d[data[0][j]] = data[i][j];
    drivers.push(d);
  }
  return { success: true, drivers: drivers };
}

function authenticateDriver(data) {
  var result = getDrivers();
  if (!result.success) return result;
  var driver = null;
  for (var i = 0; i < result.drivers.length; i++) {
    if (result.drivers[i].code && result.drivers[i].code.toUpperCase() === data.code.toUpperCase()) {
      driver = result.drivers[i]; break;
    }
  }
  return driver ? { success: true, driver: driver } : { success: false, message: 'Invalid code' };
}

function addDriver(data) {
  var sheet = getSheet('Drivers');
  if (!sheet) return { success: false, message: 'Drivers sheet not found' };
  var id = 'drv-' + new Date().getTime();
  sheet.appendRow([id, data.name, data.code.toUpperCase(), data.assignedVehicleId || '', 'Active', new Date().toISOString()]);
  return { success: true, driver: { id: id, name: data.name, code: data.code.toUpperCase(), status: 'Active' } };
}

function getVehicles() {
  var sheet = getSheet('Vehicles');
  if (!sheet) return { success: false, message: 'Vehicles sheet not found' };
  var data = sheet.getDataRange().getValues();
  var vehicles = [];
  for (var i = 1; i < data.length; i++) {
    var v = {};
    for (var j = 0; j < data[0].length; j++) v[data[0][j]] = data[i][j];
    vehicles.push(v);
  }
  return { success: true, vehicles: vehicles };
}

function addVehicle(data) {
  var sheet = getSheet('Vehicles');
  if (!sheet) return { success: false, message: 'Vehicles sheet not found' };
  var id = 'veh-' + new Date().getTime();
  sheet.appendRow([id, data.plateNumber.toUpperCase(), data.model, parseInt(data.initialOdo) || 0, parseInt(data.initialOdo) || 0, parseInt(data.fuelCapacity) || 12, 'Active', new Date().toISOString()]);
  return { success: true, vehicle: { id: id, plateNumber: data.plateNumber.toUpperCase(), model: data.model } };
}

function getFills() {
  var sheet = getSheet('Fills');
  if (!sheet) return { success: false, message: 'Fills sheet not found' };
  var data = sheet.getDataRange().getValues();
  var fills = [];
  for (var i = 1; i < data.length; i++) {
    var f = {};
    for (var j = 0; j < data[0].length; j++) f[data[0][j]] = data[i][j];
    fills.push(f);
  }
  fills.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  return { success: true, fills: fills };
}

function addFill(data) {
  var sheet = getSheet('Fills');
  if (!sheet) return { success: false, message: 'Fills sheet not found' };
  var id = 'fill-' + new Date().getTime();
  sheet.appendRow([id, data.vehicleId || '', data.vehiclePlate || '', data.driverId || '', data.driverName || '', new Date().toISOString(), data.station || '', parseFloat(data.kgsFilled) || 0, parseFloat(data.ratePerKg) || 0, parseFloat(data.totalAmount) || 0, data.videoUrl || '', data.pumpPhotoUrl || '', data.receiptPhotoUrl || '', parseFloat(data.receiptLat) || 0, parseFloat(data.receiptLng) || 0, data.receiptAddress || '', data.odometerPhotoUrl || '', parseFloat(data.odometerLat) || 0, parseFloat(data.odometerLng) || 0, data.odometerAddress || '', parseInt(data.odometerValue) || 0, parseInt(data.distanceDifferenceMeters) || 0, data.isLocationMismatched ? 'true' : 'false', data.isFuelDropAlert ? 'true' : 'false', data.fuelDropPercentage || 0]);
  if (data.vehicleId && data.odometerValue) {
    var vs = getSheet('Vehicles');
    if (vs) {
      var vd = vs.getDataRange().getValues();
      for (var i = 1; i < vd.length; i++) {
        if (vd[i][0] === data.vehicleId) { vs.getRange(i + 1, 5).setValue(parseInt(data.odometerValue)); break; }
      }
    }
  }
  return { success: true, fillId: id };
}

function getAlerts() {
  var sheet = getSheet('Alerts');
  if (!sheet) return { success: false, message: 'Alerts sheet not found' };
  var data = sheet.getDataRange().getValues();
  var alerts = [];
  for (var i = 1; i < data.length; i++) {
    var a = {};
    for (var j = 0; j < data[0].length; j++) a[data[0][j]] = data[i][j];
    alerts.push(a);
  }
  alerts.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
  return { success: true, alerts: alerts };
}

function addAlert(data) {
  var sheet = getSheet('Alerts');
  if (!sheet) return { success: false, message: 'Alerts sheet not found' };
  sheet.appendRow(['alert-' + new Date().getTime(), new Date().toISOString(), data.event, data.user || 'System', data.type || 'info']);
  return { success: true };
}

function getDashboardStats() {
  var d = getDrivers(), v = getVehicles(), f = getFills(), a = getAlerts();
  return { success: true, stats: { totalVehicles: v.vehicles ? v.vehicles.length : 0, totalDrivers: d.drivers ? d.drivers.length : 0, totalFills: f.fills ? f.fills.length : 0, totalAlerts: a.alerts ? a.alerts.length : 0 } };
}

function setupSheets() {
  var ss = getSpreadsheet();
  ['Drivers', 'Vehicles', 'Fills', 'Alerts'].forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      var sheet = ss.insertSheet(name);
      if (name === 'Drivers') sheet.appendRow(['id', 'name', 'code', 'assignedVehicleId', 'status', 'createdAt']);
      if (name === 'Vehicles') sheet.appendRow(['id', 'plateNumber', 'model', 'initialOdo', 'currentOdo', 'fuelCapacity', 'status', 'createdAt']);
      if (name === 'Fills') sheet.appendRow(['id', 'vehicleId', 'vehiclePlate', 'driverId', 'driverName', 'timestamp', 'station', 'kgsFilled', 'ratePerKg', 'totalAmount', 'videoUrl', 'pumpPhotoUrl', 'receiptPhotoUrl', 'receiptLat', 'receiptLng', 'receiptAddress', 'odometerPhotoUrl', 'odometerLat', 'odometerLng', 'odometerAddress', 'odometerValue', 'distanceDifferenceMeters', 'isLocationMismatched', 'isFuelDropAlert', 'fuelDropPercentage']);
      if (name === 'Alerts') sheet.appendRow(['id', 'timestamp', 'event', 'user', 'type']);
    }
  });
  var vs = ss.getSheetByName('Vehicles'), ds = ss.getSheetByName('Drivers');
  if (vs && vs.getLastRow() <= 1) {
    vs.appendRow(['veh-1', 'GJ-06-AZ-1234', 'Maruti Suzuki Super Carry CNG', 12000, 12450, 10, 'Active', new Date().toISOString()]);
    vs.appendRow(['veh-2', 'GJ-01-XY-9876', 'Tata Ace Gold CNG', 45000, 45890, 12, 'Active', new Date().toISOString()]);
    vs.appendRow(['veh-3', 'GJ-03-BB-5544', 'Mahindra Supro CNG Duo', 27500, 28110, 15, 'Active', new Date().toISOString()]);
  }
  if (ds && ds.getLastRow() <= 1) {
    ds.appendRow(['drv-1', 'Rajesh Kumar', 'DRV777', 'veh-1', 'Active', new Date().toISOString()]);
    ds.appendRow(['drv-2', 'Amit Patel', 'DRV888', 'veh-2', 'Active', new Date().toISOString()]);
    ds.appendRow(['drv-3', 'Suresh Sharma', 'DRV999', 'veh-3', 'Active', new Date().toISOString()]);
  }
  Logger.log('Setup complete! Spreadsheet: ' + ss.getUrl());
}
`.trim();

export default function GoogleSheetsSetup({ onClose, onSaveUrl, currentUrl }: GoogleSheetsSetupProps) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState(currentUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = 5;

  const copyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const markComplete = (stepNum: number) => {
    if (!completedSteps.includes(stepNum)) {
      setCompletedSteps([...completedSteps, stepNum]);
    }
    if (stepNum < totalSteps) {
      setStep(stepNum + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-600 to-blue-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">☁️</span>
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">Google Cloud Setup</h2>
                <p className="text-sm text-white/80">Connect to Google Sheets & Drive in 5 steps</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full ${
                  completedSteps.includes(s) ? 'bg-white' :
                  step === s ? 'bg-white/50' : 'bg-white/20'
                }`}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {['Sheets', 'Drive', 'Script', 'Deploy', 'Connect'].map((label, i) => (
              <span key={i} className={`text-[10px] font-bold ${step === i + 1 ? 'text-white' : 'text-white/50'}`}>
                {completedSteps.includes(i + 1) ? '✓ ' : ''}{label}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: Create Spreadsheet */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold">1</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Google Spreadsheet</h3>
                  <p className="text-sm text-slate-400">This will store all your fleet data</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Open Google Sheets and create a new blank spreadsheet</p>
                    <p className="text-xs text-slate-400 mt-1">Rename it to "CNG Flow Database"</p>
                  </div>
                  <a
                    href="https://sheets.google.com/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shrink-0"
                  >
                    Open Sheets
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="bg-slate-900 p-3 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">After creating, you'll see a URL like this in your browser:</p>
                  <code className="text-xs text-cyan-400 break-all">
                    https://docs.google.com/spreadsheets/d/<span className="bg-cyan-900/50 px-1 rounded">YOUR_ID_HERE</span>/edit
                  </code>
                </div>
              </div>

              <button
                onClick={() => markComplete(1)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                I Created the Spreadsheet - Next Step
              </button>
            </div>
          )}

          {/* STEP 2: Create Drive Folders */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">2</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Google Drive Folders</h3>
                  <p className="text-sm text-slate-400">This will store photos and videos</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Open Google Drive and create folders</p>
                  </div>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shrink-0"
                  >
                    Open Drive
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="bg-slate-900 p-3 rounded-lg space-y-2">
                  <p className="text-xs text-white font-bold mb-2">Create this folder structure:</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-400">📁</span>
                    <span className="text-white font-mono">CNG Flow Media</span>
                    <span className="text-slate-500">(main folder)</span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">📁</span>
                      <span className="text-cyan-400 font-mono text-xs">Videos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">📁</span>
                      <span className="text-cyan-400 font-mono text-xs">PumpPhotos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">📁</span>
                      <span className="text-cyan-400 font-mono text-xs">ReceiptPhotos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-emerald-400">📁</span>
                      <span className="text-cyan-400 font-mono text-xs">OdometerPhotos</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-3 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                <button onClick={() => markComplete(2)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Folders Created - Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Create Apps Script */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Backend API</h3>
                  <p className="text-sm text-slate-400">This connects your app to Google</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Open Google Apps Script and create new project</p>
                  </div>
                  <a
                    href="https://script.google.com/home/projects/create"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shrink-0"
                  >
                    Open Apps Script
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="bg-slate-900 p-3 rounded-lg space-y-3">
                  <p className="text-xs text-white font-bold">Steps to follow:</p>
                  <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                    <li>Name your project: <span className="text-purple-400">CNG Flow Backend API</span></li>
                    <li>Delete all the default code in the editor</li>
                    <li>Click the button below to copy the code</li>
                    <li>Paste it in the editor (Ctrl+V)</li>
                    <li>Click Save (Ctrl+S)</li>
                  </ol>
                </div>

                <button
                  onClick={copyCode}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${
                    copiedCode 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-5 w-5" />
                      Code Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copy Apps Script Code
                    </>
                  )}
                </button>

                <div className="bg-amber-950/50 p-3 rounded-lg border border-amber-800/50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-200">
                      <strong>After saving:</strong> Select <span className="font-mono bg-amber-900/50 px-1 rounded">setupSheets</span> from the dropdown and click <span className="font-bold">Run</span>. Grant permissions when asked.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="px-4 py-3 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                <button onClick={() => markComplete(3)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Code Saved & Ran - Next Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Deploy */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Deploy as Web App</h3>
                  <p className="text-sm text-slate-400">Make the API accessible online</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="bg-slate-900 p-3 rounded-lg space-y-3">
                  <p className="text-xs text-white font-bold">Follow these steps in Apps Script:</p>
                  <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside">
                    <li>Click <span className="text-blue-400 font-bold">"Deploy"</span> button (top right)</li>
                    <li>Click <span className="text-blue-400 font-bold">"New deployment"</span></li>
                    <li>Click the <span className="text-blue-400 font-bold">⚙️ gear icon</span> and select <span className="text-blue-400 font-bold">"Web app"</span></li>
                    <li>Fill in:
                      <ul className="ml-4 mt-1 space-y-1 list-disc">
                        <li>Description: <span className="text-white">CNG Flow API</span></li>
                        <li>Execute as: <span className="text-white font-bold">Me</span></li>
                        <li>Who has access: <span className="text-emerald-400 font-bold">Anyone</span></li>
                      </ul>
                    </li>
                    <li>Click <span className="text-blue-400 font-bold">"Deploy"</span></li>
                    <li><span className="text-amber-400 font-bold">COPY the Web app URL</span> and paste it below!</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white">Paste your Web App URL here:</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="flex-1 bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      onClick={copyUrl}
                      className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
                    >
                      {copiedUrl ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="px-4 py-3 bg-slate-800 text-white rounded-xl font-bold">Back</button>
                <button 
                  onClick={() => markComplete(4)} 
                  disabled={!apiKey}
                  className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${
                    apiKey 
                      ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  URL Pasted - Final Step
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Connect */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">5</span>
                <div>
                  <h3 className="text-lg font-bold text-white">Connect & Test!</h3>
                  <p className="text-sm text-slate-400">Almost done - let's verify everything works</p>
                </div>
              </div>

              <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-800/50 space-y-3">
                <h4 className="text-sm font-bold text-emerald-400">✅ What's Connected:</h4>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    Google Sheets - stores all driver, vehicle, and fill data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    Google Drive - stores videos and photos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    Cross-device sync - drivers on any phone can submit data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    Real-time dashboard - see all data instantly
                  </li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">🔑 Test Credentials:</h4>
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                    <span className="text-slate-400">Owner Login:</span>
                    <span className="text-white font-mono">owner@cng.com / password</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                    <span className="text-slate-400">Driver 1:</span>
                    <span className="text-cyan-400 font-mono">DRV777 (Rajesh Kumar)</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                    <span className="text-slate-400">Driver 2:</span>
                    <span className="text-cyan-400 font-mono">DRV888 (Amit Patel)</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg flex justify-between">
                    <span className="text-slate-400">Driver 3:</span>
                    <span className="text-cyan-400 font-mono">DRV999 (Suresh Sharma)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSaveUrl(apiKey);
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                <CheckCircle2 className="h-6 w-6" />
                Save & Start Using App!
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
