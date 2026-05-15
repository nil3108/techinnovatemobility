/**
 * ================================================================
 * CNG FLOW - GOOGLE APPS SCRIPT BACKEND API
 * ================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://script.google.com → New project
 * 2. Name it "CNG Flow Backend API"
 * 3. Delete all default code and paste this entire script
 * 4. Click Save (Ctrl+S)
 * 5. Select "setupSheets" from the dropdown and click Run
 * 6. Grant permissions when asked
 * 7. Deploy → New deployment → Web app → Anyone can access
 * 8. Copy the deployment URL and paste it in the CNG Flow app
 * 
 * ================================================================
 */

// ==================== CONFIGURATION ====================
// Spreadsheet ID is stored in script properties after first run
function getSpreadsheetId() {
  return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
}

function setSpreadsheetId(id) {
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
}

// Get spreadsheet - creates new one if not exists
function getSpreadsheet() {
  var id = getSpreadsheetId();
  
  // Try existing spreadsheet first
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      Logger.log('Existing spreadsheet not found, creating new one...');
    }
  }
  
  // Create new spreadsheet
  var ss = SpreadsheetApp.create("CNG Flow Database");
  setSpreadsheetId(ss.getId());
  
  Logger.log('========================================');
  Logger.log('NEW SPREADSHEET CREATED!');
  Logger.log('URL: ' + ss.getUrl());
  Logger.log('ID: ' + ss.getId());
  Logger.log('========================================');
  
  return ss;
}

// Helper to get sheet by name
function getSheet(name) {
  var ss = getSpreadsheet();
  return ss.getSheetByName(name);
}

var DRIVE_FOLDER_NAME = "CNG Flow Media";

// ==================== WEB APP HANDLERS ====================
function doGet(e) {
  // Support JSONP callback for CORS bypass
  var callback = e.parameter.callback;
  
  var action = e.parameter.action;
  var response;
  
  switch(action) {
    case 'getDrivers':
      response = getDrivers();
      break;
    case 'getVehicles':
      response = getVehicles();
      break;
    case 'getFills':
      response = getFills();
      break;
    case 'getAlerts':
      response = getAlerts();
      break;
    case 'getDashboardStats':
      response = getDashboardStats();
      break;
    case 'authenticateDriver':
      response = authenticateDriver({ code: e.parameter.code });
      break;
    default:
      response = { success: false, message: 'Unknown action: ' + action };
  }
  
  // If JSONP callback is provided, wrap response in callback
  if (callback) {
    var output = ContentService.createTextOutput(callback + '(' + JSON.stringify(response) + ')');
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return output;
  }
  
  // Otherwise return JSON
  var jsonOutput = ContentService.createTextOutput(JSON.stringify(response));
  jsonOutput.setMimeType(ContentService.MimeType.JSON);
  return jsonOutput;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    var response;
    
    switch(action) {
      case 'addDriver':
        response = addDriver(data);
        break;
      case 'addVehicle':
        response = addVehicle(data);
        break;
      case 'addFill':
        response = addFill(data);
        break;
      case 'addAlert':
        response = addAlert(data);
        break;
      case 'uploadMedia':
        response = uploadMedia(data);
        break;
      case 'updateVehicleOdometer':
        response = updateVehicleOdometer(data);
        break;
      default:
        response = { success: false, message: 'Unknown action: ' + action };
    }
    
    var output = ContentService.createTextOutput(JSON.stringify(response));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
    
  } catch (error) {
    var errorOutput = ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: 'Server error: ' + error.toString() 
    }));
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;
  }
}

// ==================== DRIVER OPERATIONS ====================
function getDrivers() {
  var sheet = getSheet('Drivers');
  if (!sheet) return { success: false, message: 'Drivers sheet not found' };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var drivers = [];
  
  for (var i = 1; i < data.length; i++) {
    var driver = {};
    for (var j = 0; j < headers.length; j++) {
      driver[headers[j]] = data[i][j];
    }
    drivers.push(driver);
  }
  
  return { success: true, drivers: drivers };
}

function authenticateDriver(data) {
  var code = data.code;
  var result = getDrivers();
  
  if (!result.success) return result;
  
  var driver = null;
  for (var i = 0; i < result.drivers.length; i++) {
    if (result.drivers[i].code && 
        result.drivers[i].code.toUpperCase() === code.toUpperCase()) {
      driver = result.drivers[i];
      break;
    }
  }
  
  if (driver) {
    return { success: true, driver: driver };
  } else {
    return { success: false, message: 'Invalid driver code' };
  }
}

function addDriver(data) {
  var sheet = getSheet('Drivers');
  if (!sheet) return { success: false, message: 'Drivers sheet not found' };
  
  var id = 'drv-' + new Date().getTime();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    data.name,
    data.code.toUpperCase(),
    data.assignedVehicleId || '',
    'Active',
    timestamp
  ]);
  
  return { 
    success: true, 
    message: 'Driver added successfully',
    driver: {
      id: id,
      name: data.name,
      code: data.code.toUpperCase(),
      assignedVehicleId: data.assignedVehicleId || '',
      status: 'Active'
    }
  };
}

// ==================== VEHICLE OPERATIONS ====================
function getVehicles() {
  var sheet = getSheet('Vehicles');
  if (!sheet) return { success: false, message: 'Vehicles sheet not found' };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var vehicles = [];
  
  for (var i = 1; i < data.length; i++) {
    var vehicle = {};
    for (var j = 0; j < headers.length; j++) {
      vehicle[headers[j]] = data[i][j];
    }
    vehicles.push(vehicle);
  }
  
  return { success: true, vehicles: vehicles };
}

function addVehicle(data) {
  var sheet = getSheet('Vehicles');
  if (!sheet) return { success: false, message: 'Vehicles sheet not found' };
  
  var id = 'veh-' + new Date().getTime();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    data.plateNumber.toUpperCase(),
    data.model,
    parseInt(data.initialOdo) || 0,
    parseInt(data.initialOdo) || 0,
    parseInt(data.fuelCapacity) || 12,
    'Active',
    timestamp
  ]);
  
  return { 
    success: true, 
    message: 'Vehicle added successfully',
    vehicle: {
      id: id,
      plateNumber: data.plateNumber.toUpperCase(),
      model: data.model,
      initialOdo: parseInt(data.initialOdo) || 0,
      currentOdo: parseInt(data.initialOdo) || 0,
      fuelCapacity: parseInt(data.fuelCapacity) || 12,
      status: 'Active'
    }
  };
}

function updateVehicleOdometer(data) {
  var sheet = getSheet('Vehicles');
  if (!sheet) return { success: false, message: 'Vehicles sheet not found' };
  
  var allData = sheet.getDataRange().getValues();
  
  for (var i = 1; i < allData.length; i++) {
    if (allData[i][0] === data.vehicleId) {
      sheet.getRange(i + 1, 5).setValue(parseInt(data.currentOdo));
      return { success: true, message: 'Vehicle odometer updated' };
    }
  }
  
  return { success: false, message: 'Vehicle not found' };
}

// ==================== FILL OPERATIONS ====================
function getFills() {
  var sheet = getSheet('Fills');
  if (!sheet) return { success: false, message: 'Fills sheet not found' };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var fills = [];
  
  for (var i = 1; i < data.length; i++) {
    var fill = {};
    for (var j = 0; j < headers.length; j++) {
      fill[headers[j]] = data[i][j];
    }
    fills.push(fill);
  }
  
  fills.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return { success: true, fills: fills };
}

function addFill(data) {
  var sheet = getSheet('Fills');
  if (!sheet) return { success: false, message: 'Fills sheet not found' };
  
  var id = 'fill-' + new Date().getTime();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    data.vehicleId || '',
    data.vehiclePlate || '',
    data.driverId || '',
    data.driverName || '',
    timestamp,
    data.station || '',
    parseFloat(data.kgsFilled) || 0,
    parseFloat(data.ratePerKg) || 0,
    parseFloat(data.totalAmount) || 0,
    data.videoUrl || '',
    data.pumpPhotoUrl || '',
    data.receiptPhotoUrl || '',
    parseFloat(data.receiptLat) || 0,
    parseFloat(data.receiptLng) || 0,
    data.receiptAddress || '',
    data.odometerPhotoUrl || '',
    parseFloat(data.odometerLat) || 0,
    parseFloat(data.odometerLng) || 0,
    data.odometerAddress || '',
    parseInt(data.odometerValue) || 0,
    parseInt(data.distanceDifferenceMeters) || 0,
    data.isLocationMismatched ? 'true' : 'false',
    data.isFuelDropAlert ? 'true' : 'false',
    data.fuelDropPercentage || 0
  ]);
  
  // Update vehicle odometer
  if (data.vehicleId && data.odometerValue) {
    updateVehicleOdometer({
      vehicleId: data.vehicleId,
      currentOdo: data.odometerValue
    });
  }
  
  // Create alerts if needed
  if (data.isLocationMismatched) {
    addAlert({
      event: 'LOCATION MISMATCH: ' + data.driverName + ' submitted fill for ' + data.vehiclePlate + ' with ' + data.distanceDifferenceMeters + 'm distance gap.',
      user: 'GPS Validator',
      type: 'critical'
    });
  }
  
  if (data.isFuelDropAlert) {
    addAlert({
      event: 'FUEL DROP ALERT: Vehicle ' + data.vehiclePlate + ' shows ' + data.fuelDropPercentage + '% fuel drop!',
      user: 'Fuel Monitor',
      type: 'critical'
    });
  }
  
  return { 
    success: true, 
    message: 'Fill record added successfully',
    fillId: id,
    timestamp: timestamp
  };
}

// ==================== ALERT OPERATIONS ====================
function getAlerts() {
  var sheet = getSheet('Alerts');
  if (!sheet) return { success: false, message: 'Alerts sheet not found' };
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var alerts = [];
  
  for (var i = 1; i < data.length; i++) {
    var alert = {};
    for (var j = 0; j < headers.length; j++) {
      alert[headers[j]] = data[i][j];
    }
    alerts.push(alert);
  }
  
  alerts.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return { success: true, alerts: alerts };
}

function addAlert(data) {
  var sheet = getSheet('Alerts');
  if (!sheet) return { success: false, message: 'Alerts sheet not found' };
  
  var id = 'alert-' + new Date().getTime();
  var timestamp = new Date().toISOString();
  
  sheet.appendRow([
    id,
    timestamp,
    data.event,
    data.user || 'System',
    data.type || 'info'
  ]);
  
  return { success: true, message: 'Alert added' };
}

// ==================== MEDIA UPLOAD TO GOOGLE DRIVE ====================
function uploadMedia(data) {
  try {
    // Get or create the main folder
    var mainFolder = getOrCreateFolder(DRIVE_FOLDER_NAME);
    
    // Get or create subfolder based on media type
    var subFolderName = data.folderName || 'Others';
    var subFolder = getOrCreateSubFolder(mainFolder, subFolderName);
    
    // Decode base64 data
    var decoded = Utilities.base64Decode(data.base64Data);
    var blob = Utilities.newBlob(decoded, data.mimeType || 'image/jpeg', data.fileName);
    
    // Upload to Drive
    var file = subFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Get shareable link
    var fileUrl = 'https://drive.google.com/uc?id=' + file.getId();
    
    return {
      success: true,
      message: 'Media uploaded successfully',
      fileUrl: fileUrl,
      fileId: file.getId(),
      fileName: data.fileName,
      folderPath: DRIVE_FOLDER_NAME + '/' + subFolderName
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'Upload failed: ' + error.toString()
    };
  }
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateSubFolder(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(subFolderName);
}

// ==================== DASHBOARD STATS ====================
function getDashboardStats() {
  var drivers = getDrivers();
  var vehicles = getVehicles();
  var fills = getFills();
  var alerts = getAlerts();
  
  var totalSpent = 0;
  var totalKgs = 0;
  var totalRate = 0;
  
  if (fills.success) {
    for (var i = 0; i < fills.fills.length; i++) {
      totalSpent += parseFloat(fills.fills[i].totalAmount) || 0;
      totalKgs += parseFloat(fills.fills[i].kgsFilled) || 0;
      totalRate += parseFloat(fills.fills[i].ratePerKg) || 0;
    }
  }
  
  var criticalAlerts = 0;
  if (alerts.success) {
    for (var i = 0; i < alerts.alerts.length; i++) {
      if (alerts.alerts[i].type === 'critical') criticalAlerts++;
    }
  }
  
  return {
    success: true,
    stats: {
      totalVehicles: vehicles.success ? vehicles.vehicles.length : 0,
      totalDrivers: drivers.success ? drivers.drivers.length : 0,
      totalFills: fills.success ? fills.fills.length : 0,
      totalAlerts: alerts.success ? alerts.alerts.length : 0,
      criticalAlerts: criticalAlerts,
      totalSpent: totalSpent,
      totalKgs: totalKgs,
      avgFuelRate: fills.success && fills.fills.length > 0 
        ? totalRate / fills.fills.length 
        : 0
    }
  };
}

// ==================== INITIAL SETUP ====================
function setupSheets() {
  var ss = getSpreadsheet();
  
  Logger.log('Setting up sheets in: ' + ss.getUrl());
  
  // Create Drivers sheet
  var driversSheet = ss.getSheetByName('Drivers');
  if (!driversSheet) {
    driversSheet = ss.insertSheet('Drivers');
    driversSheet.appendRow(['id', 'name', 'code', 'assignedVehicleId', 'status', 'createdAt']);
    driversSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#4CAF50').setFontColor('white');
    Logger.log('Created Drivers sheet');
  }
  
  // Create Vehicles sheet
  var vehiclesSheet = ss.getSheetByName('Vehicles');
  if (!vehiclesSheet) {
    vehiclesSheet = ss.insertSheet('Vehicles');
    vehiclesSheet.appendRow(['id', 'plateNumber', 'model', 'initialOdo', 'currentOdo', 'fuelCapacity', 'status', 'createdAt']);
    vehiclesSheet.getRange('A1:H1').setFontWeight('bold').setBackground('#2196F3').setFontColor('white');
    Logger.log('Created Vehicles sheet');
  }
  
  // Create Fills sheet
  var fillsSheet = ss.getSheetByName('Fills');
  if (!fillsSheet) {
    fillsSheet = ss.insertSheet('Fills');
    fillsSheet.appendRow([
      'id', 'vehicleId', 'vehiclePlate', 'driverId', 'driverName', 'timestamp', 'station',
      'kgsFilled', 'ratePerKg', 'totalAmount', 'videoUrl', 'pumpPhotoUrl', 'receiptPhotoUrl',
      'receiptLat', 'receiptLng', 'receiptAddress', 'odometerPhotoUrl', 'odometerLat', 'odometerLng',
      'odometerAddress', 'odometerValue', 'distanceDifferenceMeters', 'isLocationMismatched',
      'isFuelDropAlert', 'fuelDropPercentage'
    ]);
    fillsSheet.getRange('A1:Y1').setFontWeight('bold').setBackground('#FF9800').setFontColor('white');
    Logger.log('Created Fills sheet');
  }
  
  // Create Alerts sheet
  var alertsSheet = ss.getSheetByName('Alerts');
  if (!alertsSheet) {
    alertsSheet = ss.insertSheet('Alerts');
    alertsSheet.appendRow(['id', 'timestamp', 'event', 'user', 'type']);
    alertsSheet.getRange('A1:E1').setFontWeight('bold').setBackground('#F44336').setFontColor('white');
    Logger.log('Created Alerts sheet');
  }
  
  // Add demo data if empty
  addDemoData(ss);
  
  Logger.log('========================================');
  Logger.log('SETUP COMPLETE!');
  Logger.log('Spreadsheet URL: ' + ss.getUrl());
  Logger.log('Spreadsheet ID: ' + ss.getId());
  Logger.log('========================================');
  Logger.log('');
  Logger.log('IMPORTANT: Copy this ID and save it:');
  Logger.log(ss.getId());
  
  return ss.getUrl();
}

function addDemoData(ss) {
  var driversSheet = ss.getSheetByName('Drivers');
  
  // Check if data already exists
  if (driversSheet.getLastRow() > 1) {
    Logger.log('Demo data already exists. Skipping...');
    return;
  }
  
  // Add demo vehicles
  var vehiclesSheet = ss.getSheetByName('Vehicles');
  vehiclesSheet.appendRow(['veh-1', 'GJ-06-AZ-1234', 'Maruti Suzuki Super Carry CNG', 12000, 12450, 10, 'Active', new Date().toISOString()]);
  vehiclesSheet.appendRow(['veh-2', 'GJ-01-XY-9876', 'Tata Ace Gold CNG', 45000, 45890, 12, 'Active', new Date().toISOString()]);
  vehiclesSheet.appendRow(['veh-3', 'GJ-03-BB-5544', 'Mahindra Supro CNG Duo', 27500, 28110, 15, 'Active', new Date().toISOString()]);
  
  // Add demo drivers
  driversSheet.appendRow(['drv-1', 'Rajesh Kumar', 'DRV777', 'veh-1', 'Active', new Date().toISOString()]);
  driversSheet.appendRow(['drv-2', 'Amit Patel', 'DRV888', 'veh-2', 'Active', new Date().toISOString()]);
  driversSheet.appendRow(['drv-3', 'Suresh Sharma', 'DRV999', 'veh-3', 'Active', new Date().toISOString()]);
  
  Logger.log('Demo data added successfully!');
}

// ==================== UTILITY FUNCTIONS ====================
function getWebAppUrl() {
  return ScriptApp.getService().getUrl();
}

// Function to test the connection
function testConnection() {
  var result = getDashboardStats();
  Logger.log('Connection test result: ' + JSON.stringify(result));
  return result;
}
