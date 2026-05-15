export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  initialOdo: number;
  currentOdo: number;
  fuelCapacity: number; // In KGs
  status: 'Active' | 'In Maintenance';
}

export interface Driver {
  id: string;
  name: string;
  code: string;
  assignedVehicleId?: string;
  status: 'Active' | 'On Trip' | 'Inactive';
}

export interface CngFill {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  timestamp: string;
  station: string;
  kgsFilled: number;
  ratePerKg: number;
  totalAmount: number;
  videoUrl: string;
  pumpPhotoUrl: string;
  receiptPhotoUrl: string;
  receiptGeo: { lat: number; lng: number; address: string };
  odometerPhotoUrl: string;
  odometerGeo: { lat: number; lng: number; address: string };
  odometerValue: number;
  distanceDifferenceMeters: number; // Calculated distance
  isLocationMismatched: boolean;
  isFuelDropAlert: boolean;
  fuelDropPercentage?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  user: string;
  type: 'info' | 'warning' | 'critical' | 'success';
}

// Helper to calculate distance in meters between two coordinates using Haversine Formula
export function calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plateNumber: 'GJ-06-AZ-1234',
    model: 'Maruti Suzuki Super Carry CNG',
    initialOdo: 12000,
    currentOdo: 12450,
    fuelCapacity: 10,
    status: 'Active'
  },
  {
    id: 'veh-2',
    plateNumber: 'GJ-01-XY-9876',
    model: 'Tata Ace Gold CNG',
    initialOdo: 45000,
    currentOdo: 45890,
    fuelCapacity: 12,
    status: 'Active'
  },
  {
    id: 'veh-3',
    plateNumber: 'GJ-03-BB-5544',
    model: 'Mahindra Supro CNG Duo',
    initialOdo: 27500,
    currentOdo: 28110,
    fuelCapacity: 15,
    status: 'Active'
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Rajesh Kumar',
    code: 'DRV777',
    assignedVehicleId: 'veh-1',
    status: 'Active'
  },
  {
    id: 'drv-2',
    name: 'Amit Patel',
    code: 'DRV888',
    assignedVehicleId: 'veh-2',
    status: 'Active'
  },
  {
    id: 'drv-3',
    name: 'Suresh Sharma',
    code: 'DRV999',
    assignedVehicleId: 'veh-3',
    status: 'Active'
  }
];

export const INITIAL_FILLS: CngFill[] = [
  {
    id: 'fill-1',
    vehicleId: 'veh-1',
    vehiclePlate: 'GJ-06-AZ-1234',
    driverId: 'drv-1',
    driverName: 'Rajesh Kumar',
    timestamp: '2026-03-01T10:15:00.000Z',
    station: 'Vadodara Gas Limited (Alkapuri)',
    kgsFilled: 8.5,
    ratePerKg: 82.5,
    totalAmount: 701.25,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-gas-pump-nozzle-in-car-tank-40022-large.mp4', // High-quality video preview
    pumpPhotoUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // gas pump meter representation
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // invoice mock representation
    receiptGeo: {
      lat: 22.3072,
      lng: 73.1812,
      address: 'Alkapuri CNG Station, Vadodara, Gujarat'
    },
    odometerPhotoUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', // Dashboard/Odometer panel
    odometerGeo: {
      lat: 22.3074,
      lng: 73.1815,
      address: 'Beside Alkapuri CNG Pump, Vadodara'
    },
    odometerValue: 12450,
    distanceDifferenceMeters: 38, // Within 500m
    isLocationMismatched: false,
    isFuelDropAlert: false
  },
  {
    id: 'fill-2',
    vehicleId: 'veh-2',
    vehiclePlate: 'GJ-01-XY-9876',
    driverId: 'drv-2',
    driverName: 'Amit Patel',
    timestamp: '2026-03-02T14:30:00.000Z',
    station: 'Adani Gas (Gotri Road)',
    kgsFilled: 10.2,
    ratePerKg: 81.0,
    totalAmount: 826.2,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-refueling-car-at-a-petrol-station-42222-large.mp4',
    pumpPhotoUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    receiptGeo: {
      lat: 22.3072,
      lng: 73.1812, // Gotri Gas station
      address: 'Adani CNG Retail, Gotri, Vadodara'
    },
    odometerGeo: {
      lat: 22.3291,
      lng: 73.1604, // ~3100 meters away! Driver snapped odometer from a remote hotel
      address: 'Suburban Highway Motel, 3.1km from station'
    },
    odometerPhotoUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    odometerValue: 45890,
    distanceDifferenceMeters: 3120, // > 500 meters! Flagged as MISMATCHED
    isLocationMismatched: true,
    isFuelDropAlert: false
  },
  {
    id: 'fill-3',
    vehicleId: 'veh-3',
    vehiclePlate: 'GJ-03-BB-5544',
    driverId: 'drv-3',
    driverName: 'Suresh Sharma',
    timestamp: '2026-03-03T08:45:00.000Z',
    station: 'Gujarat Gas (Makarpura GIDC)',
    kgsFilled: 12.0,
    ratePerKg: 83.4,
    totalAmount: 1000.8,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-gas-pump-nozzle-in-car-tank-40022-large.mp4',
    pumpPhotoUrl: 'https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    receiptGeo: {
      lat: 22.2523,
      lng: 73.1955,
      address: 'Makarpura GIDC CNG Hub, Vadodara'
    },
    odometerGeo: {
      lat: 22.2529,
      lng: 73.1959,
      address: 'Makarpura Service Lane, Vadodara'
    },
    odometerPhotoUrl: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    odometerValue: 28110,
    distanceDifferenceMeters: 82, // Within range
    isLocationMismatched: false,
    isFuelDropAlert: true, // Fuel Drop Alert triggered!
    fuelDropPercentage: 24.5 // Fuel drops by more than 20%
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-03T09:00:00.000Z',
    event: 'System Audit: Fuel drop alarm triggered for GJ-03-BB-5544. Fuel level drop of 24.5% detected.',
    user: 'System OCR Engine',
    type: 'critical'
  },
  {
    id: 'log-2',
    timestamp: '2026-03-02T14:31:00.000Z',
    event: 'Security Check: Driver Amit Patel submitted odometer location mismatching receipt coordinates by 3.12km.',
    user: 'GPS Geofencing Validator',
    type: 'warning'
  },
  {
    id: 'log-3',
    timestamp: '2026-03-01T10:16:00.000Z',
    event: 'Log validation: CNG Fill GJ-06-AZ-1234 verified at Vadodara Gas Ltd.',
    user: 'Automatic Auditor',
    type: 'success'
  },
  {
    id: 'log-4',
    timestamp: '2026-02-28T18:00:00.000Z',
    event: 'Fleet registration updated. 3 vehicles assigned and synchronized.',
    user: 'Admin (Super)',
    type: 'info'
  }
];

// Function to load data from localstorage
export function loadSavedData() {
  const savedVehicles = localStorage.getItem('cng_vehicles');
  const savedDrivers = localStorage.getItem('cng_drivers');
  const savedFills = localStorage.getItem('cng_fills');
  const savedLogs = localStorage.getItem('cng_logs');

  if (!savedVehicles) localStorage.setItem('cng_vehicles', JSON.stringify(INITIAL_VEHICLES));
  if (!savedDrivers) localStorage.setItem('cng_drivers', JSON.stringify(INITIAL_DRIVERS));
  if (!savedFills) localStorage.setItem('cng_fills', JSON.stringify(INITIAL_FILLS));
  if (!savedLogs) localStorage.setItem('cng_logs', JSON.stringify(INITIAL_AUDIT_LOGS));

  return {
    vehicles: savedVehicles ? JSON.parse(savedVehicles) : INITIAL_VEHICLES,
    drivers: savedDrivers ? JSON.parse(savedDrivers) : INITIAL_DRIVERS,
    fills: savedFills ? JSON.parse(savedFills) : INITIAL_FILLS,
    logs: savedLogs ? JSON.parse(savedLogs) : INITIAL_AUDIT_LOGS
  };
}

// Save updates back to localstorage
export function saveAllData(vehicles: Vehicle[], drivers: Driver[], fills: CngFill[], logs: AuditLog[]) {
  localStorage.setItem('cng_vehicles', JSON.stringify(vehicles));
  localStorage.setItem('cng_drivers', JSON.stringify(drivers));
  localStorage.setItem('cng_fills', JSON.stringify(fills));
  localStorage.setItem('cng_logs', JSON.stringify(logs));
}
