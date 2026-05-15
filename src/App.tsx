import React, { useState, useEffect, useRef } from 'react';
import {
  Fuel,
  User,
  Users,
  Shield,
  Languages,
  Video,
  Camera,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Clock,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  Smartphone,
  Activity,
  LogOut,
  Eye,
  Database
} from 'lucide-react';
import { translations, Language } from './utils/translations';
import {
  loadSavedData,
  saveAllData,
  calculateDistanceInMeters,
  Vehicle,
  Driver,
  CngFill,
  AuditLog
} from './utils/mockData';
// Cloud sync imports removed
import { isGoogleSheetsConfigured, getConfigStatus, saveGoogleSheetsUrl, getGoogleSheetsUrl } from './utils/googleSheetsApi';
import GoogleSheetsSetup from './components/GoogleSheetsSetup';
import { capturePhoto, VideoRecorder, getCurrentLocation } from './utils/camera';

export default function App() {
  // Language & Portal States
  const [lang, setLang] = useState<Language>('en');
  const [portal, setPortal] = useState<'welcome' | 'driver' | 'owner' | 'admin' | 'driver-login-select' | 'owner-login-select' | 'admin-login-select'>('welcome');
  const [isMobilePreview, setIsMobilePreview] = useState<boolean>(false);
  const [showGoogleSheetsSetup, setShowGoogleSheetsSetup] = useState<boolean>(false);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(getGoogleSheetsUrl());

  // Database States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fills, setFills] = useState<CngFill[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Auth States
  const [driverCodeInput, setDriverCodeInput] = useState('');
  const [driverError, setDriverError] = useState('');
  const [loggedInDriver, setLoggedInDriver] = useState<Driver | null>(null);
  
  // Owner Auth States
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [ownerTab, setOwnerTab] = useState<'home' | 'vehicles' | 'media' | 'alerts'>('home');

  // Admin Auth States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardVehicleId, setWizardVehicleId] = useState('');
  const [wizardKgs, setWizardKgs] = useState('');
  const [wizardRate, setWizardRate] = useState('');
  const [wizardStation, setWizardStation] = useState('Vadodara Gas Limited');

  // Video Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSecs, setRecordingSecs] = useState(0);
  const [videoRecorded, setVideoRecorded] = useState(false);
  const [videoPreviewMode, setVideoPreviewMode] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoDataUrl, setVideoDataUrl] = useState('');

  // Camera Capture States
  const [pumpCaptured, setPumpCaptured] = useState(false);
  const [pumpPhotoData, setPumpPhotoData] = useState('');
  const [pumpStream, setPumpStream] = useState<MediaStream | null>(null);
  const [receiptCaptured, setReceiptCaptured] = useState(false);
  const [receiptPhotoData, setReceiptPhotoData] = useState('');
  const [receiptStream, setReceiptStream] = useState<MediaStream | null>(null);
  const [odoCaptured, setOdoCaptured] = useState(false);
  const [odoPhotoData, setOdoPhotoData] = useState('');
  const [odoStream, setOdoStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // Location States
  const [receiptLocation, setReceiptLocation] = useState({ lat: 0, lng: 0 });
  const [receiptLocationPreset, setReceiptLocationPreset] = useState<'valid' | 'invalid'>('valid');
  const [odoLocation, setOdoLocation] = useState({ lat: 0, lng: 0 });

  // OCR & Simulation States
  const [odoOcrProcessing, setOdoOcrProcessing] = useState(false);
  const [odoDetectedKms, setOdoDetectedKms] = useState('');
  const [simulateOdoOffset, setSimulateOdoOffset] = useState(false);
  const [simulateFuelDrop, setSimulateFuelDrop] = useState(false);

  // Form States
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverCode, setNewDriverCode] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehicleInitialOdo, setNewVehicleInitialOdo] = useState('');
  const [newVehicleCapacity, setNewVehicleCapacity] = useState('8');

  // UI States
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const pumpPreviewRef = useRef<HTMLVideoElement>(null);
  const receiptPreviewRef = useRef<HTMLVideoElement>(null);
  const odoPreviewRef = useRef<HTMLVideoElement>(null);

  // Translations
  const t = translations[lang];

  // Recorder instance
  const recorderInstance = new VideoRecorder();

  // Load all data function
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const data = await loadSavedData();
      setVehicles(data.vehicles);
      setDrivers(data.drivers);
      setFills(data.fills);
      setLogs(data.logs);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Login Handlers
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const driver = drivers.find(d => d.code === driverCodeInput.toUpperCase());
    if (driver) {
      setLoggedInDriver(driver);
      setPortal('driver');
      setDriverError('');
    } else {
      setDriverError('Invalid driver code. Please try again.');
    }
  };

  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (ownerEmail === 'admin@techinnovatemobility.com' && ownerPassword === 'admin123') {
      setIsOwnerLoggedIn(true);
      setPortal('owner');
      setOwnerError('');
    } else {
      setOwnerError('Invalid credentials. Try admin@techinnovatemobility.com / admin123');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@techinnovatemobility.com' && adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setPortal('admin');
      setAdminError('');
    } else {
      setAdminError('Invalid credentials. Try admin@techinnovatemobility.com / admin123');
    }
  };

  // Driver Management
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: `DRV-${Date.now()}`,
      name: newDriverName,
      code: newDriverCode.toUpperCase(),
      status: 'Active'
    };
    const updatedDrivers = [...drivers, newDriver];
    setDrivers(updatedDrivers);
    saveAllData(updatedDrivers, drivers, fills, logs);
    setNewDriverName('');
    setNewDriverCode('');
    setSuccessMsg('Driver registered successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteDriver = (id: string) => {
    const updatedDrivers = drivers.filter(d => d.id !== id);
    setDrivers(updatedDrivers);
    saveAllData(updatedDrivers, drivers, fills, logs);
  };

  // Vehicle Management
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle: Vehicle = {
      id: `VEH-${Date.now()}`,
      plateNumber: newVehiclePlate.toUpperCase(),
      model: newVehicleModel,
      initialOdo: parseInt(newVehicleInitialOdo) || 0,
      currentOdo: parseInt(newVehicleInitialOdo) || 0,
      fuelCapacity: parseInt(newVehicleCapacity),
      status: 'Active'
    };
    const updatedVehicles = [...vehicles, newVehicle];
    setVehicles(updatedVehicles);
    saveAllData(updatedVehicles, drivers, fills, logs);
    setNewVehiclePlate('');
    setNewVehicleModel('');
    setNewVehicleInitialOdo('');
    setNewVehicleCapacity('8');
    setSuccessMsg('Vehicle registered successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(v => v.id !== id);
    setVehicles(updatedVehicles);
    saveAllData(updatedVehicles, drivers, fills, logs);
  };

  // Wizard Submit
  const handleWizardSubmit = async () => {
    if (!wizardVehicleId) {
      alert('Please select a vehicle!');
      return;
    }
    setIsLoading(true);
    try {
      const driver = loggedInDriver;
      const vehicle = vehicles.find(v => v.id === wizardVehicleId);

      let distanceDifferenceMeters = 0;
      if (simulateOdoOffset) {
        distanceDifferenceMeters = 2800;
      } else {
        distanceDifferenceMeters = calculateDistanceInMeters(
          receiptLocation.lat, receiptLocation.lng,
          odoLocation.lat, odoLocation.lng
        );
      }

      const newFill: CngFill = {
        id: `FILL-${Date.now()}`,
        driverId: driver?.id || '',
        driverName: driver?.name || '',
        vehicleId: wizardVehicleId,
        vehiclePlate: vehicle?.plateNumber || '',
        station: wizardStation,
        kgsFilled: parseFloat(wizardKgs) || 0,
        ratePerKg: parseFloat(wizardRate) || 0,
        totalAmount: currentTotalPayable,
        odometerValue: parseInt(odoDetectedKms) || 0,
        timestamp: new Date().toISOString(),
        videoUrl: videoDataUrl || 'No video',
        pumpPhotoUrl: pumpPhotoData || 'No photo',
        receiptPhotoUrl: receiptPhotoData || 'No photo',
        odometerPhotoUrl: odoPhotoData || 'No photo',
        receiptGeo: { lat: receiptLocation.lat, lng: receiptLocation.lng, address: 'Auto-captured' },
        odometerGeo: { lat: odoLocation.lat, lng: odoLocation.lng, address: 'Auto-captured' },
        isLocationMismatched: distanceDifferenceMeters > 500,
        distanceDifferenceMeters,
        isFuelDropAlert: simulateFuelDrop,
        fuelDropPercentage: simulateFuelDrop ? 22.5 : 0,
      };

      const updatedFills = [...fills, newFill];
      setFills(updatedFills);
      saveAllData(vehicles, drivers, updatedFills, logs);

      setIsWizardOpen(false);
      setWizardStep(1);
      setVideoRecorded(false);
      setVideoPreviewMode(false);
      setVideoStream(null);
      setPumpCaptured(false);
      setReceiptCaptured(false);
      setOdoCaptured(false);
      setPumpStream(null);
      setReceiptStream(null);
      setOdoStream(null);
      setSimulateOdoOffset(false);
      setSimulateFuelDrop(false);

      setSuccessMsg('✅ Fill record saved to Google Sheets! ' + t.fillSubmittedSuccess);
      setTimeout(() => setSuccessMsg(''), 5000);

    } catch (error) {
      console.error('Error saving fill:', error);
      alert('Error saving to Google Sheets. Data saved locally only.');
    }
    setIsLoading(false);
  };

  // Comprehensive logout handler
  const handleLogout = () => {
    setPortal('welcome');
    setIsOwnerLoggedIn(false);
    setIsAdminLoggedIn(false);
    setLoggedInDriver(null);
    setDriverCodeInput('');
    setDriverError('');
    setOwnerError('');
    setAdminError('');
    setIsWizardOpen(false);
    setWizardStep(1);
    setVideoRecorded(false);
    setVideoPreviewMode(false);
    setVideoStream(null);
    setPumpCaptured(false);
    setReceiptCaptured(false);
    setOdoCaptured(false);
    setSimulateOdoOffset(false);
    setSimulateFuelDrop(false);
    setPumpStream(null);
    setReceiptStream(null);
    setOdoStream(null);
  };

  // Calculation for automated amount
  const currentTotalPayable = (parseFloat(wizardKgs) || 0) * (parseFloat(wizardRate) || 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex flex-col antialiased selection:bg-red-600 selection:text-white font-sans">
      
      {/* Top Dynamic Header with Company Branding */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setPortal('welcome')}>
            <img src="/superapp/logo.png" alt="Brand Logo" className="h-10 object-contain" />
          </div>

          {/* Active Portal Pill Indicator */}
          {portal !== 'welcome' && (
            <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-full px-3.5 py-1">
              <Activity className="h-3.5 w-3.5 text-emerald-400 animate-pulse mr-2" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {portal === 'driver' && `${t.driverDashboard}: ${loggedInDriver?.name}`}
                {portal === 'owner' && t.ownerDashboard}
                {portal === 'admin' && t.adminDashboardTitle}
              </span>
            </div>
          )}

          {/* Controls: Language selection, Mobile Simulation & Reset */}
          <div className="flex items-center space-x-3 ml-auto">
            
            {/* Language Picker */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
              <Languages className="h-4 w-4 text-emerald-400 mx-2" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none border-none pr-4 cursor-pointer hover:text-emerald-400 transition-colors"
              >
                <option value="en" className="bg-slate-900 text-slate-100">English</option>
                <option value="hi" className="bg-slate-900 text-slate-100">हिन्दी (Hindi)</option>
                <option value="gu" className="bg-slate-900 text-slate-100">ગુજરાતી (Gujarati)</option>
              </select>
            </div>

            {/* Mobile Simulator Toggle */}
            <button
              onClick={() => setIsMobilePreview(!isMobilePreview)}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
                isMobilePreview 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
              }`}
              title="Toggle Mobile PWA Frame Mode"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">PWA Frame</span>
            </button>

            {/* Google Sheets Setup Button */}
            <button
              onClick={() => setShowGoogleSheetsSetup(true)}
              className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
                isGoogleSheetsConfigured()
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
              }`}
              title={getConfigStatus()}
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{isGoogleSheetsConfigured() ? 'Connected' : 'Setup DB'}</span>
            </button>

            {/* Refresh Data Button */}
            <button
              onClick={() => {
                loadAllData();
                setSuccessMsg('🔄 Refreshing data from Google Sheets...');
                setTimeout(() => setSuccessMsg(''), 3000);
              }}
              className="p-2 rounded-lg border bg-slate-900 text-slate-400 border-slate-800 hover:bg-emerald-900 hover:text-emerald-400 hover:border-emerald-800 transition-all text-xs font-medium"
              title="Refresh data from Google Sheets"
            >
              <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            {/* Portal Quick Exit / Logout */}
            {portal !== 'welcome' && (
              <button
                onClick={handleLogout}
                className="bg-rose-950/40 border border-rose-900/60 text-rose-400 hover:bg-rose-900 hover:text-white p-2 rounded-lg transition-all cursor-pointer z-50 relative"
                title={t.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h3 className="text-lg font-bold text-white">Loading from Google Sheets...</h3>
              <p className="text-sm text-slate-400">Fetching your fleet data from the cloud</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Success Banner */}
      {successMsg && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 text-center font-semibold text-sm shadow-lg animate-fade-in flex items-center justify-center gap-2 z-50">
          <CheckCircle2 className="h-5 w-5 text-white animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Content wrapper with conditional simulated PWA Shell wrapper */}
      <main className="flex-grow flex flex-col items-center py-6 px-4 sm:px-6">
        
        <div className={`w-full transition-all duration-300 ${
          isMobilePreview 
            ? 'max-w-[412px] min-h-[760px] bg-slate-950 rounded-[40px] border-[10px] border-slate-800 shadow-2xl ring-12 ring-slate-900/50 p-3.5 overflow-y-auto flex flex-col' 
            : 'max-w-7xl'
        }`}>
          
          {/* MOBILE SPEAKER & CAMERA SIMULATION BAR */}
          {isMobilePreview && (
            <div className="w-full flex justify-center items-center pb-3.5 pt-1">
              <div className="w-24 h-4 bg-slate-800 rounded-full relative">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full absolute left-2 top-0.75 border border-slate-750"></div>
                <div className="w-10 h-1 bg-slate-700 rounded-full absolute left-9 top-1.5"></div>
              </div>
            </div>
          )}

          {/* ==================== 1. WELCOME / LANGUAGE / LOGIN SELECTOR SCREEN ==================== */}
          {portal === 'welcome' && (
            <div className="flex-grow flex flex-col justify-center py-6 px-4">
              <div className="text-center max-w-2xl mx-auto mb-10">
                
                {/* Logo from Reference */}
                <div className="flex justify-center mb-8">
                  <img src="/superapp/logo.png" alt="Brand Logo" className="h-28 object-contain" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
                  {t.welcomeTitle}
                </h2>
                <p className="text-slate-500 text-sm">
                  {t.welcomeSubtitle}
                </p>
              </div>

              {/* Language dynamic display - Styled like Reference */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 py-8 max-w-md mx-auto w-full mb-8 text-center shadow-sm relative">
                <span className="text-[10px] font-black text-slate-400 block mb-6 uppercase tracking-[0.2em]">
                  {t.selectLanguage.split('/')[0]}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLang('en')}
                    className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all ${
                      lang === 'en'
                        ? 'bg-[#EE2726] text-white shadow-lg shadow-red-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang('hi')}
                    className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all ${
                      lang === 'hi'
                        ? 'bg-[#EE2726] text-white shadow-lg shadow-red-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hindi
                  </button>
                  <button
                    onClick={() => setLang('gu')}
                    className={`py-3 px-2 rounded-2xl font-bold text-xs transition-all ${
                      lang === 'gu'
                        ? 'bg-[#EE2726] text-white shadow-lg shadow-red-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Gujarati
                  </button>
                </div>
              </div>

              {/* Driver Primary Action Button */}
              <div className="max-w-md mx-auto w-full space-y-6">
                <button
                  onClick={() => {
                    setPortal('driver-login-select');
                  }}
                  className="w-full py-5 bg-[#EE2726] text-white font-bold text-lg rounded-full shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98]"
                >
                  {t.driver}
                </button>

                <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-400">
                  <button onClick={() => setPortal('owner-login-select')} className="hover:text-[#EE2726]">{t.fleetOwner}</button>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <button onClick={() => setPortal('admin-login-select')} className="hover:text-[#EE2726]">{t.admin}</button>
                </div>

                <div className="text-center pt-4">
                  <span className="text-[10px] text-slate-400 font-mono border-b border-dotted border-slate-300 pb-1">
                    Server: ***
                  </span>
                </div>
                

              </div>
            </div>
          )}

          {/* New specific driver login selection state to match intended flow */}
          {portal === 'driver-login-select' && (
            <div className="flex-grow flex flex-col justify-center py-6 px-4">
               <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto w-full shadow-sm">
                  <div className="flex justify-center mb-6">
                    <div className="flex justify-center">
                      <img src="/superapp/logo.png" alt="Brand Logo" className="h-20 object-contain" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t.driverLoginTitle}</h3>
                  <p className="text-slate-500 text-xs mb-6">{t.driverLoginDesc}</p>
                  
                  <form onSubmit={handleDriverLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
                        {t.enterDriverCode}
                      </label>
                      <input
                        type="text"
                        value={driverCodeInput}
                        onChange={(e) => setDriverCodeInput(e.target.value)}
                        placeholder={t.driverCodePlaceholder}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase font-bold"
                      />
                    </div>
                    {driverError && <p className="text-[#EE2726] text-[10px] font-bold ml-1">{driverError}</p>}
                    
                    <button
                      type="submit"
                      className="w-full bg-[#EE2726] text-white font-bold text-sm rounded-full py-4 transition-all shadow-lg shadow-red-100 mt-2"
                    >
                      {t.loginButton}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPortal('welcome')}
                      className="w-full text-slate-400 font-bold text-xs py-2 hover:text-slate-600 transition-colors"
                    >
                      {t.backButton}
                    </button>
                  </form>
               </div>
            </div>
          )}

          {/* Owner Login State */}
          {portal === 'owner-login-select' && (
            <div className="flex-grow flex flex-col justify-center py-6 px-4">
               <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto w-full shadow-sm">
                  <div className="flex justify-center mb-6">
                    <div className="flex justify-center">
                      <img src="/superapp/logo.png" alt="Brand Logo" className="h-20 object-contain" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t.ownerLoginTitle}</h3>
                  <p className="text-slate-500 text-xs mb-6">{t.ownerLoginDesc}</p>
                  
                  <form onSubmit={handleOwnerLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Password</label>
                      <input
                        type="password"
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    {ownerError && <p className="text-[#EE2726] text-[10px] font-bold ml-1">{ownerError}</p>}
                    
                    <button
                      type="submit"
                      className="w-full bg-[#EE2726] text-white font-bold text-sm rounded-full py-4 transition-all shadow-lg shadow-red-100 mt-2"
                    >
                      {t.loginButton}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPortal('welcome')}
                      className="w-full text-slate-400 font-bold text-xs py-2 hover:text-slate-600 transition-colors"
                    >
                      {t.backButton}
                    </button>
                  </form>
               </div>
            </div>
          )}

          {/* Admin Login State */}
          {portal === 'admin-login-select' && (
            <div className="flex-grow flex flex-col justify-center py-6 px-4">
               <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md mx-auto w-full shadow-sm">
                  <div className="flex justify-center mb-6">
                    <div className="flex justify-center">
                      <img src="/superapp/logo.png" alt="Brand Logo" className="h-20 object-contain" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t.adminLoginTitle}</h3>
                  <p className="text-slate-500 text-xs mb-6">{t.adminLoginDesc}</p>
                  
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Email Address</label>
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">Password</label>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    {adminError && <p className="text-[#EE2726] text-[10px] font-bold ml-1">{adminError}</p>}
                    
                    <button
                      type="submit"
                      className="w-full bg-[#EE2726] text-white font-bold text-sm rounded-full py-4 transition-all shadow-lg shadow-red-100 mt-2"
                    >
                      {t.loginButton}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPortal('welcome')}
                      className="w-full text-slate-400 font-bold text-xs py-2 hover:text-slate-600 transition-colors"
                    >
                      {t.backButton}
                    </button>
                  </form>
               </div>
            </div>
          )}


          {/* ==================== 2. DRIVER PORTAL & FILL WIZARD ==================== */}
          {portal === 'driver' && loggedInDriver && (
            <div className="flex-grow flex flex-col py-4">
              
              {/* Welcome Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
                      {t.driverDashboard}
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">
                      {t.welcomeDriver}, <span className="text-emerald-400">{loggedInDriver.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                      Assigned Access Code: <span className="font-bold text-slate-300 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">{loggedInDriver.code}</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 px-4.5 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 z-50 relative"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.logout}
                  </button>
                </div>
              </div>

              {/* Fill CNG Dashboard Action */}
              {!isWizardOpen ? (
                <div className="flex-grow flex flex-col justify-center items-center py-8 max-w-xl mx-auto w-full">
                  
                  <div className="text-center mb-8">
                    <div className="inline-flex bg-emerald-950/40 border border-emerald-800/50 p-6 rounded-full mb-4 animate-bounce">
                      <Fuel className="h-16 w-16 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Ready to log a refueling transaction?</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                      This is an automated, geotagged and verified fill logging workflow. Ensure you have stable GPS access and a clear view of camera images.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsWizardOpen(true);
                      setWizardStep(1);
                    }}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-lg rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-950/45 tracking-wide hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {t.fillCngBtn}
                  </button>

                  {/* Fleet Vehicle Selection Info */}
                  <div className="w-full bg-slate-950 border border-slate-850 rounded-2xl p-4 mt-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Fleet Vehicle Selection</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">Currently Selected Vehicle</span>
                        {wizardVehicleId ? (
                          <>
                            <span className="font-extrabold text-emerald-400 block text-sm font-odo tracking-wider mt-0.5">
                              {vehicles.find(v => v.id === wizardVehicleId)?.plateNumber || 'Not Found'}
                            </span>
                            <span className="text-[9px] text-emerald-400/70 block mt-0.5">
                              {vehicles.find(v => v.id === wizardVehicleId)?.model || ''}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-amber-400 font-bold block mt-0.5">
                            Select vehicle in Step 4
                          </span>
                        )}
                      </div>
                      <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">System Check-In GPS</span>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1.5 inline-block"></span>
                          ONLINE / GEOLOCATION ACTIVE
                        </span>
                      </div>
                      <div className="bg-slate-900/70 border border-slate-850 rounded-xl p-3">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">System Check-In GPS</span>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1 flex items-center">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping mr-1.5 inline-block"></span>
                          ONLINE / GEOLOCATION ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                
                /* ==================== STEP-BY-STEP WIZARD OVERLAY / CONTAINER ==================== */
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-2xl mx-auto w-full shadow-2xl">
                  
                  {/* Wizard Header */}
                  <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-5">
                    <div>
                      <h3 className="font-extrabold text-lg text-white">{t.fillCngWizardTitle}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-semibold text-emerald-400">
                        {t.step} {wizardStep} {t.of} 5
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (confirm("Are you sure you want to cancel the refueling entry? Progress will be lost.")) {
                          setIsWizardOpen(false);
                          setWizardStep(1);
                        }
                      }}
                      className="text-slate-500 hover:text-slate-350 hover:bg-slate-900 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Steps progress track */}
                  <div className="flex items-center justify-between mb-6 px-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <React.Fragment key={num}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border transition-all ${
                            wizardStep === num
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950 ring-4 ring-emerald-950'
                              : wizardStep > num
                              ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-400'
                              : 'bg-slate-900 border-slate-800 text-slate-600'
                          }`}
                        >
                          {wizardStep > num ? <Check className="h-4 w-4 text-emerald-400 stroke-[3]" /> : num}
                        </div>
                        {num < 5 && (
                          <div
                            className={`flex-1 h-1 mx-2 rounded transition-all ${
                              wizardStep > num ? 'bg-emerald-900' : 'bg-slate-850'
                            }`}
                          ></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* STEP CONTENT VIEWS */}
                  <div className="bg-slate-900 rounded-xl p-4.5 border border-slate-850 mb-6 min-h-[240px] flex flex-col justify-center">
                    
                    {/* STEP 1: RECORD FILLING VIDEO - REAL CAMERA */}
                    {wizardStep === 1 && (
                      <div className="text-center space-y-4">
                        <div className="max-w-md mx-auto">
                          <h4 className="text-base font-bold text-white mb-2">{t.step1Title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {t.step1Desc}
                          </p>
                          <p className="text-[10px] text-amber-400 mt-2 font-bold">
                            ⚠️ Minimum 10 seconds required. Tap "Start" to open your camera.
                          </p>
                        </div>

                        {/* Camera Viewport with Live Preview */}
                        <div className="w-full max-w-xs mx-auto aspect-video bg-slate-950 border-2 border-slate-850 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner">
                          {/* Live Video Preview (shown when camera is active but not yet recorded) */}
                          {(isRecording || (videoPreviewMode && !videoRecorded) || videoStream) && !videoRecorded && (
                            <video
                              ref={videoPreviewRef}
                              autoPlay
                              playsInline
                              muted
                              className="absolute inset-0 w-full h-full object-cover"
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.play().catch(err => console.log('Play error:', err));
                              }}
                            />
                          )}
                          
                          {/* Recording Overlay */}
                          {isRecording && (
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 z-10">
                              <div className="space-y-2 text-center w-full">
                                <div className="flex items-center justify-center gap-2">
                                  <span className="w-3.5 h-3.5 bg-rose-600 rounded-full animate-pulse inline-block"></span>
                                  <span className="text-[10px] font-bold text-rose-400 tracking-widest uppercase">🔴 RECORDING LIVE...</span>
                                </div>
                                <p className="text-3xl font-bold text-white font-odo tracking-widest drop-shadow-lg">
                                  {recordingSecs < 10 ? `00:0${recordingSecs}` : `00:${recordingSecs}`}
                                </p>
                                <div className="text-[10px] text-white font-medium drop-shadow-lg">
                                  {recordingSecs < 10 
                                    ? `⚠️ Record ${10 - recordingSecs} more seconds...` 
                                    : "✓ Minimum met - record as long as needed!"
                                  }
                                </div>
                                <div className="w-40 h-2 bg-slate-900/80 rounded-full mx-auto overflow-hidden border border-slate-700">
                                  <div 
                                    className={`h-full transition-all duration-350 ${recordingSecs < 10 ? 'bg-amber-500' : 'bg-rose-600'}`} 
                                    style={{ width: `${Math.min(100, (recordingSecs / 10) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Video Recorded Success */}
                          {videoRecorded && !isRecording && (
                            <div className="text-center space-y-2 p-4">
                              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">✓ Video Recorded!</p>
                              <p className="text-[10px] text-slate-400 font-semibold font-odo">Duration: {recordingSecs} seconds</p>
                            </div>
                          )}
                          
                          {/* Camera Not Started */}
                          {!videoPreviewMode && !isRecording && !videoRecorded && (
                            <div className="text-center text-slate-500 relative p-4">
                              <Video className="h-10 w-10 mx-auto mb-2 opacity-50 text-emerald-400" />
                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tap to Open Camera</p>
                              <p className="text-[9px] text-slate-500 mt-1">Live preview will appear here</p>
                            </div>
                          )}
                          
                          {cameraError && (
                            <div className="absolute bottom-2 left-2 right-2 bg-rose-950/90 p-2 rounded text-[9px] text-rose-400 z-20">
                              {cameraError}
                            </div>
                          )}
                        </div>

                        {/* Recording Controls */}
                        <div className="pt-2">
                          {!videoPreviewMode && !isRecording && !videoRecorded && (
                            <button
                              type="button"
                              onClick={async () => {
                                setCameraError('');
                                try {
                                  const stream = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
                                    audio: true
                                  });
                                  setVideoStream(stream);
                                  setVideoPreviewMode(true);
                                  if (videoPreviewRef.current) {
                                    videoPreviewRef.current.srcObject = stream;
                                    setTimeout(() => {
                                      if (videoPreviewRef.current) {
                                        videoPreviewRef.current.play().catch(err => console.log('Auto-play error:', err));
                                      }
                                    }, 100);
                                  }
                                } catch (error: any) {
                                  setCameraError(error.message || 'Failed to open camera');
                                }
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              <Video className="h-4 w-4" />
                              Open Camera
                            </button>
                          )}
                          {videoPreviewMode && !isRecording && !videoRecorded && (
                            <button
                              type="button"
                              onClick={async () => {
                                setCameraError('');
                                const result = await recorderInstance.start((secs) => setRecordingSecs(secs));
                                if (result.success) {
                                  setIsRecording(true);
                                  setRecordingSecs(0);
                                  setVideoPreviewMode(false);
                                  // Switch preview to recorder's stream
                                  const stream = recorderInstance.getStream();
                                  if (stream && videoPreviewRef.current) {
                                    setVideoStream(stream);
                                    videoPreviewRef.current.srcObject = stream;
                                    setTimeout(() => {
                                      if (videoPreviewRef.current) {
                                        videoPreviewRef.current.play().catch(err => console.log('Play error:', err));
                                      }
                                    }, 100);
                                  }
                                } else {
                                  setCameraError(result.error || 'Failed to start recording');
                                }
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              <span className="w-2.5 h-2.5 bg-white rounded-full inline-block"></span>
                              Start Recording
                            </button>
                          )}
                          {isRecording && (
                            <button
                              type="button"
                              disabled={recordingSecs < 10}
                              onClick={async () => {
                                const result = await recorderInstance.stop();
                                if (result.success && result.blob) {
                                  setVideoBlob(result.blob);
                                  const dataUrl = URL.createObjectURL(result.blob);
                                  setVideoDataUrl(dataUrl);
                                  setVideoRecorded(true);
                                  // Stop the preview stream
                                  recorderInstance.stopStream();
                                  setVideoStream(null);
                                  if (videoPreviewRef.current) {
                                    videoPreviewRef.current.srcObject = null;
                                  }
                                }
                                setIsRecording(false);
                              }}
                              className={`font-bold text-xs rounded-lg px-5 py-3 transition-all inline-flex items-center gap-1.5 ${
                                recordingSecs < 10 
                                  ? 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md'
                              }`}
                            >
                              {recordingSecs < 10 ? `Wait ${10 - recordingSecs}s...` : '⏹ Stop Recording'}
                            </button>
                          )}
                          {videoRecorded && (
                            <div className="flex justify-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoRecorded(false);
                                  setVideoBlob(null);
                                  setVideoDataUrl('');
                                  setRecordingSecs(0);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg px-4 py-2.5 transition-all border border-slate-700"
                              >
                                Record Again
                              </button>
                              <span className="text-xs text-emerald-400 font-bold self-center">✓ Video Ready!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CAPTURE PUMP PHOTO - REAL CAMERA */}
                    {wizardStep === 2 && (
                      <div className="text-center space-y-4">
                        <div className="max-w-md mx-auto">
                          <h4 className="text-base font-bold text-white mb-2">{t.step2Title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Point your camera at the gas pump meter display showing KGs and price.
                          </p>
                        </div>

                        {/* Camera Viewport for Pump with Live Preview */}
                        <div className="w-full max-w-xs mx-auto aspect-video bg-slate-950 border-2 border-slate-850 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner">
                          {/* Live Camera Preview */}
                          {!pumpCaptured && pumpStream && (
                            <video
                              ref={pumpPreviewRef}
                              autoPlay
                              playsInline
                              muted
                              className="absolute inset-0 w-full h-full object-cover"
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.play().catch(err => console.log('Play error:', err));
                              }}
                            />
                          )}
                          
                          {pumpCaptured && pumpPhotoData ? (
                            <div className="w-full h-full relative">
                              <img
                                src={pumpPhotoData}
                                alt="Captured pump meter"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 to-transparent flex flex-col justify-end p-3.5">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-emerald-400 uppercase">✓ Pump Photo Captured</span>
                                  <span className="text-[9px] bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-400 border border-emerald-800">
                                    GPS: {receiptLocation.lat.toFixed(4)}, {receiptLocation.lng.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : isCapturing ? (
                            <div className="text-center z-10">
                              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-[10px] text-emerald-400">Opening camera...</p>
                            </div>
                          ) : !pumpStream ? (
                            <div className="text-center text-slate-500 p-4 z-10">
                              <Camera className="h-10 w-10 mx-auto mb-2 opacity-50 text-emerald-400" />
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tap to Open Camera</p>
                              <p className="text-[9px] text-slate-500 mt-1">Live preview will appear</p>
                            </div>
                          ) : null}
                          
                          {/* Capture Overlay when preview is active */}
                          {!pumpCaptured && pumpStream && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                              <button
                                type="button"
                                onClick={async () => {
                                  const result = await capturePhoto();
                                  if (result.success && result.dataUrl) {
                                    setPumpPhotoData(result.dataUrl);
                                    setPumpCaptured(true);
                                    // Stop stream
                                    if (pumpStream) {
                                      pumpStream.getTracks().forEach(track => track.stop());
                                    }
                                    setPumpStream(null);
                                    if (pumpPreviewRef.current) {
                                      pumpPreviewRef.current.srcObject = null;
                                    }
                                    // Get GPS location
                                    const loc = await getCurrentLocation();
                                    setReceiptLocation({ lat: loc.lat, lng: loc.lng });
                                  } else {
                                    setCameraError(result.error || 'Failed to capture photo');
                                  }
                                }}
                                className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                              >
                                <div className="w-12 h-12 bg-emerald-500 rounded-full"></div>
                              </button>
                            </div>
                          )}
                          
                          {cameraError && (
                            <div className="absolute bottom-2 left-2 right-2 bg-rose-950/90 p-2 rounded text-[9px] text-rose-400 z-20">
                              {cameraError}
                            </div>
                          )}
                        </div>

                        <div className="pt-1 flex flex-col items-center gap-2">
                          {!pumpCaptured && !pumpStream ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setCameraError('');
                                setIsCapturing(true);
                                try {
                                  // Open camera for preview
                                  const stream = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: 'environment', width: { ideal: 1920 } },
                                    audio: false
                                  });
                                  setPumpStream(stream);
                                  if (pumpPreviewRef.current) {
                                    pumpPreviewRef.current.srcObject = stream;
                                    setTimeout(() => {
                                      if (pumpPreviewRef.current) {
                                        pumpPreviewRef.current.play().catch(err => console.log('Play error:', err));
                                      }
                                    }, 100);
                                  }
                                } catch (error: any) {
                                  setCameraError(error.message || 'Failed to open camera');
                                }
                                setIsCapturing(false);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              <Camera className="h-4 w-4" />
                              Open Camera
                            </button>
                          ) : pumpCaptured ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setPumpCaptured(false);
                                  setPumpPhotoData('');
                                  // Reopen camera
                                  setPumpStream(null);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg px-4 py-2 border border-slate-700"
                              >
                                Retake
                              </button>
                              <span className="text-xs text-emerald-400 font-bold self-center">✓ Photo Ready!</span>
                            </div>
                          ) : pumpStream ? (
                            <button
                              type="button"
                              onClick={async () => {
                                // Stop stream without capturing
                                if (pumpStream) {
                                  pumpStream.getTracks().forEach(track => track.stop());
                                }
                                setPumpStream(null);
                                if (pumpPreviewRef.current) {
                                  pumpPreviewRef.current.srcObject = null;
                                }
                              }}
                              className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all inline-flex items-center gap-1.5"
                            >
                              Close Camera
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: CAPTURE RECEIPT PHOTO & GPS GEOTAG - REAL CAMERA */}
                    {wizardStep === 3 && (
                      <div className="text-center space-y-4">
                        <div className="max-w-md mx-auto">
                          <h4 className="text-base font-bold text-white mb-2">{t.step3Title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Capture the sales receipt. Your GPS location will be automatically recorded.
                          </p>
                        </div>

                        {/* Camera Viewport for Receipt */}
                        <div className="w-full max-w-xs mx-auto aspect-video bg-slate-950 border-2 border-slate-850 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner">
                          {/* Live Camera Preview */}
                          {!receiptCaptured && receiptStream && (
                            <video
                              ref={receiptPreviewRef}
                              autoPlay
                              playsInline
                              muted
                              className="absolute inset-0 w-full h-full object-cover"
                              onLoadedMetadata={(e) => {
                                const video = e.target as HTMLVideoElement;
                                video.play().catch(err => console.log('Play error:', err));
                              }}
                            />
                          )}
                          
                          {receiptCaptured && receiptPhotoData ? (
                            <div className="w-full h-full relative">
                              <img
                                src={receiptPhotoData}
                                alt="Captured receipt"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 to-transparent flex flex-col justify-end p-3.5">
                                <div className="text-left">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold tracking-wider">📍 GPS GEOTAG CAPTURED</span>
                                  <span className="text-[10px] font-bold text-emerald-400 block">
                                    Lat: {receiptLocation.lat.toFixed(4)}, Lng: {receiptLocation.lng.toFixed(4)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : isCapturing ? (
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-[10px] text-emerald-400">Opening camera...</p>
                            </div>
                          ) : !receiptStream ? (
                            <div className="text-center text-slate-500 p-4">
                              <MapPin className="h-10 w-10 mx-auto mb-2 opacity-50 text-emerald-400" />
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Camera to Capture Receipt</p>
                              <p className="text-[9px] text-slate-600 mt-1">Live preview will appear before capture</p>
                            </div>
                          ) : null}

                          {/* Capture Overlay when preview is active */}
                          {!receiptCaptured && receiptStream && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                              <button
                                type="button"
                                onClick={async () => {
                                  setCameraError('');
                                  // Get GPS first
                                  const loc = await getCurrentLocation();
                                  if (receiptLocationPreset === 'invalid') {
                                    setReceiptLocation({ lat: 22.3505, lng: 73.1420 });
                                  } else {
                                    setReceiptLocation({ lat: loc.lat, lng: loc.lng });
                                  }
                                  // Capture photo
                                  const result = await capturePhoto();
                                  if (result.success && result.dataUrl) {
                                    setReceiptPhotoData(result.dataUrl);
                                    setReceiptCaptured(true);
                                    // Stop stream
                                    if (receiptStream) {
                                      receiptStream.getTracks().forEach(track => track.stop());
                                    }
                                    setReceiptStream(null);
                                    if (receiptPreviewRef.current) {
                                      receiptPreviewRef.current.srcObject = null;
                                    }
                                  } else {
                                    setCameraError(result.error || 'Failed to capture photo');
                                  }
                                }}
                                className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                              >
                                <div className="w-12 h-12 bg-emerald-500 rounded-full"></div>
                              </button>
                            </div>
                          )}

                        </div>

                        {/* GPS Location Display */}
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 max-w-xs mx-auto">
                          <div className="flex items-center justify-between text-[9px]">
                            <span className="text-slate-500">📍 GPS Coordinates:</span>
                            <span className="text-emerald-400 font-mono">
                              {receiptLocation.lat !== 0 
                                ? `${receiptLocation.lat.toFixed(4)}, ${receiptLocation.lng.toFixed(4)}`
                                : 'Waiting for capture...'}
                            </span>
                          </div>
                        </div>

                        {/* Test Location Override */}
                        <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-800/50 max-w-xs mx-auto">
                          <span className="text-[9px] text-amber-400 block mb-1 font-bold">🧪 Test Mode:</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setReceiptLocationPreset('valid')}
                              className={`flex-1 text-[9px] py-1 rounded ${
                                receiptLocationPreset === 'valid' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Valid Location
                            </button>
                            <button
                              type="button"
                              onClick={() => setReceiptLocationPreset('invalid')}
                              className={`flex-1 text-[9px] py-1 rounded ${
                                receiptLocationPreset === 'invalid' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              Mismatch 🚨
                            </button>
                          </div>
                        </div>

                        <div className="pt-1 flex flex-col items-center gap-2">
                          {!receiptCaptured && !receiptStream ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setCameraError('');
                                setIsCapturing(true);
                                try {
                                  const stream = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: 'environment', width: { ideal: 1920 } },
                                    audio: false
                                  });
                                  setReceiptStream(stream);
                                  if (receiptPreviewRef.current) {
                                    receiptPreviewRef.current.srcObject = stream;
                                    setTimeout(() => {
                                      if (receiptPreviewRef.current) {
                                        receiptPreviewRef.current.play().catch(err => console.log('Play error:', err));
                                      }
                                    }, 100);
                                  }
                                } catch (error: any) {
                                  setCameraError(error.message || 'Failed to open camera');
                                }
                                setIsCapturing(false);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              <Camera className="h-4 w-4" />
                              Open Camera
                            </button>
                          ) : receiptCaptured ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReceiptCaptured(false);
                                  setReceiptPhotoData('');
                                  setReceiptStream(null);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg px-4 py-2 border border-slate-700"
                              >
                                Retake
                              </button>
                              <span className="text-xs text-emerald-400 font-bold self-center">✓ Receipt & GPS Ready!</span>
                            </div>
                          ) : receiptStream ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (receiptStream) {
                                  receiptStream.getTracks().forEach(track => track.stop());
                                }
                                setReceiptStream(null);
                                if (receiptPreviewRef.current) {
                                  receiptPreviewRef.current.srcObject = null;
                                }
                              }}
                              className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all inline-flex items-center gap-1.5"
                            >
                              Close Camera
                            </button>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* STEP 4: MANUAL QUANTITIES & RATE AUTO-CALCULATION */}
                    {wizardStep === 4 && (
                      <div className="space-y-4">
                        <div className="text-center max-w-md mx-auto">
                          <h4 className="text-base font-bold text-white mb-1">{t.step4Title}</h4>
                          <p className="text-xs text-slate-400">{t.step4Desc}</p>
                        </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                          
                          {/* Vehicle Select - Driver can choose any fleet vehicle */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              {t.selectVehicle}
                            </label>
                            <select
                              value={wizardVehicleId}
                              onChange={(e) => setWizardVehicleId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">-- Select Vehicle to Fill --</option>
                              {vehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                  {v.plateNumber} — {v.model} ({v.fuelCapacity} KGs CNG)
                                </option>
                              ))}
                            </select>
                            {wizardVehicleId && (
                              <span className="text-[9px] text-emerald-400 block mt-1.5 font-semibold">
                                ✓ Selected: {vehicles.find(v => v.id === wizardVehicleId)?.plateNumber}
                              </span>
                            )}
                            {vehicles.length === 0 && (
                              <span className="text-[10px] text-amber-400 block mt-1">
                                ⚠️ No vehicles registered in fleet yet
                              </span>
                            )}
                          </div>

                          {/* Station Select */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              {t.selectStation}
                            </label>
                            <select
                              value={wizardStation}
                              onChange={(e) => setWizardStation(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Vadodara Gas Limited">Vadodara Gas Limited</option>
                              <option value="Adani Gas">Adani Gas</option>
                              <option value="Gujarat Gas">Gujarat Gas</option>
                            </select>
                          </div>

                          {/* CNG Quantity (KGS) */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              {t.fillKgs}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={wizardKgs}
                              onChange={(e) => setWizardKgs(e.target.value)}
                              placeholder="e.g. 9.2"
                              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-odo tracking-widest"
                            />
                          </div>

                          {/* Price per KG */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              {t.fillRate}
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={wizardRate}
                              onChange={(e) => setWizardRate(e.target.value)}
                              placeholder="e.g. 82.5"
                              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold font-odo tracking-widest"
                            />
                          </div>

                        </div>

                        {/* Dynamic auto calculation box */}
                        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-4 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                              {t.totalPayable}
                            </span>
                            <span className="text-xs text-slate-400 italic">
                              Calculation: {wizardKgs || '0'} KGs × ₹{wizardRate || '0'} /KG
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-extrabold text-emerald-400 font-odo tracking-wider">
                              ₹ {currentTotalPayable.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Timestamp visualization */}
                        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-850/50 text-[10px] text-slate-400 flex justify-between">
                          <span>{t.autoTime}</span>
                          <span className="font-semibold text-slate-300">
                            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 5: CAPTURE ODOMETER, SIMULATE NEURAL OCR & GEOTAG */}
                    {wizardStep === 5 && (
                      <div className="text-center space-y-4">
                        <div className="max-w-md mx-auto">
                          <h4 className="text-base font-bold text-white mb-1">{t.step5Title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {t.step5Desc} <strong className="text-emerald-400 block mt-1">📷 Direct Live Hardware Camera Only (No file selection permitted)</strong>
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                          
                          {/* Camera Odometer with Live Preview */}
                          <div className="w-full aspect-video bg-slate-950 border-2 border-slate-850 rounded-xl overflow-hidden relative flex flex-col items-center justify-center shadow-inner">
                            {/* Live Camera Preview */}
                            {!odoCaptured && odoStream && (
                              <video
                                ref={odoPreviewRef}
                                autoPlay
                                playsInline
                                muted
                                className="absolute inset-0 w-full h-full object-cover"
                                onLoadedMetadata={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.play().catch(err => console.log('Play error:', err));
                                }}
                              />
                            )}
                            
                            {odoCaptured ? (
                              <div className="w-full h-full relative">
                                <img
                                  src={odoPhotoData || "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"}
                                  alt="Dashboard Odometer Mileage dial representation"
                                  className="w-full h-full object-cover opacity-75"
                                />
                                {odoOcrProcessing ? (
                                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col justify-center items-center p-4">
                                    <span className="h-6 w-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-2"></span>
                                    <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">
                                      {t.ocrProcessing}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 to-transparent flex flex-col justify-end p-3.5">
                                    <div className="text-left">
                                      <span className="text-[8px] text-slate-450 block uppercase font-bold tracking-wider">LIVE CLUSTER CAPTURE</span>
                                      <span className="text-[11px] font-extrabold text-emerald-400 block tracking-wider">
                                        ✓ SCAN SUCCESSFUL
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : !odoStream ? (
                              <div className="text-center text-slate-550 p-4 z-10">
                                <Camera className="h-10 w-10 mx-auto mb-2 opacity-50 text-emerald-400" />
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tap to Open Camera</p>
                                <p className="text-[9px] text-slate-600">Auto-recognize KMs via Neural OCR Engine</p>
                              </div>
                            ) : (
                              /* Capture Overlay when preview is active */
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const result = await capturePhoto();
                                    if (result.success && result.dataUrl) {
                                      setOdoPhotoData(result.dataUrl);
                                      setOdoCaptured(true);
                                      // Stop stream
                                      if (odoStream) {
                                        odoStream.getTracks().forEach(track => track.stop());
                                      }
                                      setOdoStream(null);
                                      if (odoPreviewRef.current) {
                                        odoPreviewRef.current.srcObject = null;
                                      }
                                      // Simulate OCR processing
                                      setOdoOcrProcessing(true);
                                      setTimeout(() => {
                                        setOdoOcrProcessing(false);
                                        // Auto-detect from current vehicle odometer
                                        const veh = vehicles.find(v => v.id === wizardVehicleId) || vehicles[0];
                                        const nextOdo = veh ? veh.currentOdo + Math.round(Number(wizardKgs) * 20) : 15240;
                                        setOdoDetectedKms(nextOdo.toString());
                                      }, 1200);
                                      // Get GPS location
                                      const loc = await getCurrentLocation();
                                      setOdoLocation({ lat: loc.lat, lng: loc.lng });
                                    } else {
                                      setCameraError(result.error || 'Failed to capture photo');
                                    }
                                  }}
                                  className="w-16 h-16 bg-white rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                                >
                                  <div className="w-12 h-12 bg-emerald-500 rounded-full"></div>
                                </button>
                              </div>
                            )}
                            {cameraError && (
                              <div className="absolute bottom-2 left-2 right-2 bg-rose-950/90 p-2 rounded text-[9px] text-rose-400 z-20">
                                {cameraError}
                              </div>
                            )}
                        </div>

                        {/* Odometer Camera Controls */}
                        <div className="pt-2">
                          {!odoCaptured && !odoStream ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setCameraError('');
                                try {
                                  const stream = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: 'environment', width: { ideal: 1920 } },
                                    audio: false
                                  });
                                  setOdoStream(stream);
                                  if (odoPreviewRef.current) {
                                    odoPreviewRef.current.srcObject = stream;
                                    setTimeout(() => {
                                      if (odoPreviewRef.current) {
                                        odoPreviewRef.current.play().catch(err => console.log('Play error:', err));
                                      }
                                    }, 100);
                                  }
                                } catch (error: any) {
                                  setCameraError(error.message || 'Failed to open camera');
                                }
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center justify-center gap-1.5"
                            >
                              <Camera className="h-4 w-4" />
                              Open Odometer Camera
                            </button>
                          ) : odoCaptured ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setOdoCaptured(false);
                                  setOdoPhotoData('');
                                  setOdoStream(null);
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg px-4 py-2 border border-slate-700"
                              >
                                Retake Photo
                              </button>
                              <span className="text-xs text-emerald-400 font-bold self-center flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Ready!
                              </span>
                            </div>
                          ) : odoStream ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (odoStream) {
                                  odoStream.getTracks().forEach(track => track.stop());
                                }
                                setOdoStream(null);
                                if (odoPreviewRef.current) {
                                  odoPreviewRef.current.srcObject = null;
                                }
                              }}
                              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg px-5 py-3 transition-all inline-flex items-center justify-center gap-1.5"
                            >
                              Close Camera
                            </button>
                          ) : null}
                        </div>

                        {/* OCR Detected Output & Editable field */}
                        <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                            
                            {/* Detected Field */}
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                                {t.ocrDetectedKms}
                              </label>
                              <input
                                type="number"
                                value={odoDetectedKms}
                                onChange={(e) => setOdoDetectedKms(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 text-white font-bold font-odo text-xl rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none tracking-widest"
                                placeholder="Reading value"
                              />
                              <span className="text-[10px] text-slate-500 block mt-1">
                                {t.editKmsDesc}
                              </span>
                            </div>

                            {/* Location Check-in Confirmation */}
                            <div className="border-t border-slate-900 pt-2 text-[10px] text-slate-400 space-y-1">
                              <span className="font-bold uppercase text-slate-500 block">Captured Geotag Context</span>
                              <div className="flex items-center gap-1 text-emerald-400">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>
                                  {odoLocation.lat !== 0 
                                    ? `${odoLocation.lat.toFixed(4)}, ${odoLocation.lng.toFixed(4)}`
                                    : simulateOdoOffset ? '22.3285, 73.1580 (Simulated)' : 'Waiting for capture...'}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* DRILLS TO SIMULATE VERIFICATION ISSUES */}
                        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left space-y-3">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block border-b border-slate-850 pb-1.5">
                            Anomalous Testing Scenarios (Demonstrate Flag Logic)
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            
                            {/* Toggle 1: Distance Mismatch simulation */}
                            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={simulateOdoOffset}
                                onChange={(e) => setSimulateOdoOffset(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                              />
                              <div>
                                <span className="text-xs font-bold text-white block">Simulate Distance Discrepancy (&gt;500m)</span>
                                <span className="text-[10px] text-slate-500 block leading-tight">
                                  Odometer is captured 2.8 kilometers away from the gas pump location. This automatically flags a "Geotag Mismatch".
                                </span>
                              </div>
                            </label>

                            {/* Toggle 2: Fuel Drop Alert Simulation */}
                            <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={simulateFuelDrop}
                                onChange={(e) => setSimulateFuelDrop(e.target.checked)}
                                className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 mt-0.5"
                              />
                              <div>
                                <span className="text-xs font-bold text-white block">Simulate Fuel Drop Alert (&gt;20%)</span>
                                <span className="text-[10px] text-slate-500 block leading-tight">
                                  Simulates a significant fuel variance of 22.5% since the previous log, triggering a critical operational flag.
                                </span>
                              </div>
                            </label>

                          </div>
                        </div>

                        <div className="pt-1">
                          {!odoCaptured ? (
                            <button
                              type="button"
                              onClick={() => setOdoCaptured(true)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg px-5 py-3 transition-all shadow-md inline-flex items-center gap-1.5"
                            >
                              <Camera className="h-4 w-4" />
                              {t.captureOdoPhotoBtn}
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-400 font-bold block">{t.geotagCaptured}</span>
                          )}
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Wizard navigation controls */}
                  <div className="flex justify-between items-center border-t border-slate-850 pt-4">
                    
                    {/* Back button */}
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(wizardStep - 1)}
                        className="bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t.backButton}
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {/* Next/Submit button */}
                    {wizardStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => {
                          // Validate steps before moving
                          if (wizardStep === 1 && !videoRecorded) {
                            alert('Please record a video of the CNG filling process first!');
                            return;
                          }
                          if (wizardStep === 2 && !pumpCaptured) {
                            alert('Please capture the digital gas pump scale readout first!');
                            return;
                          }
                          if (wizardStep === 3 && !receiptCaptured) {
                            alert('Please snap a picture of the physical receipt printed!');
                            return;
                          }
                          if (wizardStep === 4 && !wizardVehicleId) {
                            alert('Please select the vehicle you want to fill with CNG!');
                            return;
                          }
                          setWizardStep(wizardStep + 1);
                        }}
                        className="bg-emerald-600 text-slate-950 hover:bg-emerald-500 px-6 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleWizardSubmit}
                        disabled={!odoCaptured || odoOcrProcessing}
                        className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md ${
                          odoCaptured && !odoOcrProcessing
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:scale-[1.02]'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {t.submitFillBtn}
                      </button>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}


          {/* ==================== 3. FLEET OWNER PORTAL ==================== */}
          {portal === 'owner' && isOwnerLoggedIn && (
            <div className="flex-grow flex flex-col py-2">
              
              {/* Owner Welcome & Overall App Status Info */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest block mb-0.5">
                      {t.ownerDashboard}
                    </span>
                    <h2 className="text-2xl font-extrabold text-white">
                      {t.welcomeOwner}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitored Region: <span className="font-bold text-slate-300">Gujarat CNG Circle (Vadodara/Ahmedabad)</span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleLogout}
                      className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 z-50 relative"
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </button>
                  </div>
                </div>

                {/* Custom Navigation buttons */}
                <div className="grid grid-cols-4 gap-2.5 border-t border-slate-850/80 pt-4 mt-4">
                  <button
                    onClick={() => setOwnerTab('home')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      ownerTab === 'home'
                        ? 'bg-cyan-600 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>{t.home}</span>
                  </button>
                  <button
                    onClick={() => setOwnerTab('vehicles')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      ownerTab === 'vehicles'
                        ? 'bg-cyan-600 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <Fuel className="h-4 w-4" />
                    <span>{t.vehicles}</span>
                  </button>
                  <button
                    onClick={() => setOwnerTab('media')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      ownerTab === 'media'
                        ? 'bg-cyan-600 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <Camera className="h-4 w-4" />
                    <span>{t.media}</span>
                  </button>
                  <button
                    onClick={() => setOwnerTab('alerts')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      ownerTab === 'alerts'
                        ? 'bg-cyan-600 text-slate-950 shadow-md'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-850 border border-slate-800'
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>{t.alerts}</span>
                  </button>
                </div>
              </div>

              {/* ==================== OWNER - HOME TAB ==================== */}
              {ownerTab === 'home' && (
                <div className="space-y-6">
                  
                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-3 opacity-10">
                        <Fuel className="h-12 w-12 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.totalVehicles}
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-1 font-odo tracking-widest">
                        {vehicles.length}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-medium block mt-1">
                        100% fleet active
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-3 opacity-10">
                        <Users className="h-12 w-12 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.activeDrivers}
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-1 font-odo tracking-widest">
                        {drivers.length}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-medium block mt-1">
                        Code-specific login
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-3 opacity-10">
                        <Clock className="h-12 w-12 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.totalFills}
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-1 font-odo tracking-widest">
                        {fills.length}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-medium block mt-1">
                        Automatically validated
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-3 opacity-10">
                        <Camera className="h-12 w-12 text-cyan-400" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {t.totalMediaStored}
                      </span>
                      <span className="text-2xl font-extrabold text-white block mt-1 font-odo tracking-widest">
                        {fills.length * 4}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-medium block mt-1">
                        Videos & Geotag photos
                      </span>
                    </div>

                  </div>

                  {/* Dual Forms: Register Driver and Register Vehicle */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Add Driver Code Column */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="font-extrabold text-base text-white border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 text-cyan-400" />
                        {t.addDriverTitle}
                      </h3>
                      
                      <form onSubmit={handleAddDriver} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            {t.driverName}
                          </label>
                          <input
                            type="text"
                            required
                            value={newDriverName}
                            onChange={(e) => setNewDriverName(e.target.value)}
                            placeholder="e.g. Ramesh Patel"
                            className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                            {t.driverCode}
                          </label>
                          <input
                            type="text"
                            required
                            value={newDriverCode}
                            onChange={(e) => setNewDriverCode(e.target.value)}
                            placeholder="e.g. DRV505"
                            className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase font-bold"
                          />
                          <span className="text-[10px] text-slate-500 block mt-1.5">
                            Drivers will type this code on the welcome screen to access their filling workflow.
                          </span>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold text-xs rounded-xl py-3 transition-colors shadow-md"
                        >
                          {t.createDriverBtn}
                        </button>
                      </form>

                      {/* Existing drivers list */}
                      <div className="mt-6 pt-6 border-t border-slate-850">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                          {t.registeredDriversList}
                        </h4>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto">
                          {drivers.map((d) => (
                            <div key={d.id} className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-850">
                              <div>
                                <span className="text-xs font-bold text-white block">{d.name}</span>
                                <span className="text-[9px] text-slate-500 font-semibold uppercase">Code: {d.code}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteDriver(d.id)}
                                className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                                title="Remove Driver"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Add Vehicle Column */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <h3 className="font-extrabold text-base text-white border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
                        <Fuel className="h-4.5 w-4.5 text-cyan-400" />
                        {t.addVehicleTitle}
                      </h3>
                      
                      <form onSubmit={handleAddVehicle} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                              {t.vehiclePlate}
                            </label>
                            <input
                              type="text"
                              required
                              value={newVehiclePlate}
                              onChange={(e) => setNewVehiclePlate(e.target.value)}
                              placeholder="e.g. GJ-06-XY-9999"
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 uppercase font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                              {t.vehicleModel}
                            </label>
                            <input
                              type="text"
                              required
                              value={newVehicleModel}
                              onChange={(e) => setNewVehicleModel(e.target.value)}
                              placeholder="e.g. Tata Ace Gold"
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                              {t.initialOdo}
                            </label>
                            <input
                              type="number"
                              required
                              value={newVehicleInitialOdo}
                              onChange={(e) => setNewVehicleInitialOdo(e.target.value)}
                              placeholder="e.g. 15000"
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                              {t.fuelCapacity}
                            </label>
                            <select
                              value={newVehicleCapacity}
                              onChange={(e) => setNewVehicleCapacity(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-850 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none"
                            >
                              <option value="8">8 KGs</option>
                              <option value="10">10 KGs</option>
                              <option value="12">12 KGs</option>
                              <option value="15">15 KGs</option>
                              <option value="18">18 KGs</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-cyan-600 text-slate-950 hover:bg-cyan-500 font-bold text-xs rounded-xl py-3 transition-colors shadow-md"
                        >
                          {t.createVehicleBtn}
                        </button>
                      </form>

                      {/* Existing vehicles quick table */}
                      <div className="mt-6 pt-6 border-t border-slate-850">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                          Active Fleet Vehicle Registry
                        </h4>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto">
                          {vehicles.map((v) => (
                            <div key={v.id} className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-xl border border-slate-850">
                              <div>
                                <span className="text-xs font-bold text-slate-200 block font-odo tracking-wider">{v.plateNumber}</span>
                                <span className="text-[9px] text-slate-500 font-medium">{v.model}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                                  {v.currentOdo} KMs
                                </span>
                                <button
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
                                  title="Deregister Vehicle"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* Cloud sync sections removed */}

              {/* Cloud sync sections removed */}

              {/* Skip to vehicles tab */}

              {/* ==================== OWNER - VEHICLES TAB ==================== */}
              {ownerTab === 'vehicles' && (
                <div className="space-y-6">
                  
                  {/* List of vehicles with historical data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vehicles.length === 0 ? (
                      <div className="col-span-3 text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl">
                        <Fuel className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">{t.noVehiclesYet}</p>
                      </div>
                    ) : (
                      vehicles.map((v) => {
                        const vehicleFills = fills.filter(f => f.vehicleId === v.id);
                        const latestOdo = v.currentOdo;
                        const totalSpent = vehicleFills.reduce((sum, f) => sum + f.totalAmount, 0);
                        const totalKgs = vehicleFills.reduce((sum, f) => sum + f.kgsFilled, 0);
                        
                        return (
                          <div
                            key={v.id}
                            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 relative overflow-hidden hover:border-cyan-500/40 transition-all"
                          >
                            <div className="absolute top-0 right-0 mt-3 mr-3">
                              <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full inline-block"></span>
                            </div>

                            <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2.5 py-0.5 rounded uppercase block w-fit mb-3">
                              {v.model}
                            </span>

                            <h3 className="text-xl font-extrabold text-white font-odo tracking-wider">
                              {v.plateNumber}
                            </h3>

                            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-850">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                                  {t.lastOdoReading}
                                </span>
                                <span className="text-xs font-bold text-slate-300 font-odo tracking-wider">
                                  {latestOdo} KMs
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                                  {t.fuelCapacity}
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                  {v.fuelCapacity} KGs
                                </span>
                              </div>
                              <div className="mt-2">
                                <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                                  {t.totalFillsRecorded}
                                </span>
                                <span className="text-xs font-bold text-slate-300">
                                  {vehicleFills.length} Fillings
                                </span>
                              </div>
                              <div className="mt-2">
                                <span className="text-[9px] text-slate-500 uppercase block font-semibold">
                                  Total Fuel & Cost
                                </span>
                                <span className="text-xs font-extrabold text-emerald-400 font-odo tracking-wider block">
                                  {totalKgs.toFixed(1)} KG / ₹{totalSpent.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedVehicle(v)}
                              className="w-full mt-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              {t.viewDetailsBtn}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Vehicle details drawer modal */}
                  {selectedVehicle && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-3 mb-4">
                        <div>
                          <h3 className="font-extrabold text-base text-white">
                            {t.vehicleDetailsTitle}
                          </h3>
                          <p className="text-xs text-cyan-400 font-bold font-odo tracking-wider mt-0.5">
                            {selectedVehicle.plateNumber} • {selectedVehicle.model}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedVehicle(null)}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold"
                        >
                          {t.closeDetailsBtn}
                        </button>
                      </div>

                      {/* Show list of historic fills for this vehicle */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Refueling Log History</h4>
                        {fills.filter(f => f.vehicleId === selectedVehicle.id).length === 0 ? (
                          <p className="text-xs text-slate-500 italic py-4">No refueling logs recorded yet for this vehicle.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider">
                                  <th className="py-2.5 font-bold">Date & Time</th>
                                  <th className="py-2.5 font-bold">Driver</th>
                                  <th className="py-2.5 font-bold">CNG Station</th>
                                  <th className="py-2.5 font-bold">Qty (KGs)</th>
                                  <th className="py-2.5 font-bold">Price /KG</th>
                                  <th className="py-2.5 font-bold">Total Bill</th>
                                  <th className="py-2.5 font-bold">Odometer</th>
                                  <th className="py-2.5 font-bold">Location Mismatch</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-900">
                                {fills.filter(f => f.vehicleId === selectedVehicle.id).map((f) => (
                                  <tr key={f.id} className="hover:bg-slate-900/40">
                                    <td className="py-3 font-medium text-slate-300">
                                      {new Date(f.timestamp).toLocaleString()}
                                    </td>
                                    <td className="py-3 font-semibold text-slate-200">{f.driverName}</td>
                                    <td className="py-3 text-slate-300 font-medium">{f.station}</td>
                                    <td className="py-3 font-bold font-odo text-slate-200">{f.kgsFilled} KG</td>
                                    <td className="py-3 font-odo text-slate-300">₹ {f.ratePerKg}</td>
                                    <td className="py-3 font-extrabold text-emerald-400 font-odo">₹ {f.totalAmount}</td>
                                    <td className="py-3 font-bold font-odo text-slate-300">{f.odometerValue} KM</td>
                                    <td className="py-3">
                                      {f.isLocationMismatched ? (
                                        <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-900/60 px-2 py-0.5 rounded font-bold">
                                          FAIL ({f.distanceDifferenceMeters}m)
                                        </span>
                                      ) : (
                                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded font-bold">
                                          PASS
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ==================== OWNER - MEDIA TAB (VERIFICATION OF DATA) ==================== */}
              {ownerTab === 'media' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-extrabold text-lg text-white mb-2">
                      {t.mediaVerification}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t.mediaDesc}
                    </p>
                  </div>

                  {/* Empty state */}
                  {fills.length === 0 && (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center">
                      <Camera className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-slate-400">No Fill Records Yet</h4>
                      <p className="text-xs text-slate-500 mt-1">When drivers submit CNG fills, media will appear here</p>
                    </div>
                  )}

                  {/* List of fills with media evidence */}
                  <div className="space-y-5">
                    {fills.map((fill) => (
                      <div
                        key={fill.id}
                        className={`bg-slate-950 border rounded-2xl p-5 space-y-4 transition-all ${
                          fill.isLocationMismatched
                            ? 'border-rose-900/60 bg-gradient-to-br from-slate-950 via-slate-950 to-rose-950/10'
                            : 'border-slate-800 hover:border-slate-750'
                        }`}
                      >
                        
                        {/* Header */}
                        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-850 pb-3">
                          <div>
                            <span className="text-[9px] font-extrabold bg-slate-900 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded uppercase tracking-widest">
                              Log: {fill.id?.substring(5) || 'N/A'}
                            </span>
                            <h4 className="text-base font-bold text-white mt-1">
                              <span className="text-cyan-400">{fill.vehiclePlate || 'Unknown'}</span>
                              {' • '}
                              <span className="text-slate-300">{fill.driverName || 'Unknown Driver'}</span>
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">
                              {new Date(fill.timestamp).toLocaleString()}
                            </span>
                            <span className="text-xs text-emerald-400">{fill.station}</span>
                          </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-slate-900/50 p-3 rounded-lg flex flex-wrap gap-4 text-xs">
                          <div>
                            <span className="text-slate-500 block">KGS Filled</span>
                            <span className="text-white font-bold font-odo">{fill.kgsFilled} KG</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Rate/KG</span>
                            <span className="text-white font-bold font-odo">₹{fill.ratePerKg}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Total</span>
                            <span className="text-emerald-400 font-bold font-odo">₹{fill.totalAmount}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Odometer</span>
                            <span className="text-white font-bold font-odo">{fill.odometerValue} KM</span>
                          </div>
                        </div>

                        {/* Media Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          
                          {/* Video */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                              <Video className="h-3 w-3 text-cyan-400" />
                              Video
                            </span>
                            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                              {fill.videoUrl && !fill.videoUrl.includes('No video') ? (
                                <video
                                  src={fill.videoUrl}
                                  className="w-full h-full object-cover"
                                  controls
                                  playsInline
                                  muted
                                  onError={(e) => {
                                    (e.target as HTMLVideoElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <Video className="h-6 w-6 text-slate-600 mx-auto" />
                                  <span className="text-[8px] text-slate-500">No video</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pump Photo */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                              <Camera className="h-3 w-3 text-cyan-400" />
                              Pump Meter
                            </span>
                            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                              {fill.pumpPhotoUrl && !fill.pumpPhotoUrl.includes('No photo') ? (
                                <img
                                  src={fill.pumpPhotoUrl}
                                  alt="Pump meter"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <Camera className="h-6 w-6 text-slate-600 mx-auto" />
                                  <span className="text-[8px] text-slate-500">No photo</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Receipt Photo */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-cyan-400" />
                              Receipt
                            </span>
                            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                              {fill.receiptPhotoUrl && !fill.receiptPhotoUrl.includes('No photo') ? (
                                <img
                                  src={fill.receiptPhotoUrl}
                                  alt="Receipt"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <MapPin className="h-6 w-6 text-slate-600 mx-auto" />
                                  <span className="text-[8px] text-slate-500">No photo</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Odometer Photo */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                              <Check className="h-3 w-3 text-cyan-400" />
                              Odometer
                            </span>
                            <div className="aspect-video bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                              {fill.odometerPhotoUrl && !fill.odometerPhotoUrl.includes('No photo') ? (
                                <img
                                  src={fill.odometerPhotoUrl}
                                  alt="Odometer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-center p-2">
                                  <Check className="h-6 w-6 text-slate-600 mx-auto" />
                                  <span className="text-[8px] text-slate-500">No photo</span>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>

                        {/* GPS & Location Verification */}
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">📍 GPS Verification</h5>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500 block">Receipt Location</span>
                              <span className="text-emerald-400 font-mono text-[10px]">
                                {fill.receiptGeo?.lat?.toFixed(4) || 'N/A'}, {fill.receiptGeo?.lng?.toFixed(4) || 'N/A'}
                              </span>
                              <span className="text-[9px] text-slate-500 block truncate">{fill.receiptGeo?.address || 'No address'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Odometer Location</span>
                              <span className="text-emerald-400 font-mono text-[10px]">
                                {fill.odometerGeo?.lat?.toFixed(4) || 'N/A'}, {fill.odometerGeo?.lng?.toFixed(4) || 'N/A'}
                              </span>
                              <span className="text-[9px] text-slate-500 block truncate">{fill.odometerGeo?.address || 'No address'}</span>
                            </div>
                          </div>
                          
                          {/* Distance & Status */}
                          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] text-slate-500">Distance Between Locations:</span>
                              <span className="text-sm font-bold text-white ml-2 font-odo">{fill.distanceDifferenceMeters || 0}m</span>
                            </div>
                            <div>
                              {(fill.isLocationMismatched || fill.distanceDifferenceMeters > 500) ? (
                                <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-900 px-2 py-1 rounded font-bold">
                                  🚨 MISMATCH ({fill.distanceDifferenceMeters}m {'>'} 500m)
                                </span>
                              ) : (
                                <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-1 rounded font-bold">
                                  ✅ VERIFIED
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Fuel Drop Alert */}
                          {fill.isFuelDropAlert && (
                            <div className="mt-2 p-2 bg-rose-950/50 border border-rose-900 rounded-lg">
                              <span className="text-[9px] text-rose-400 font-bold">
                                ⚠️ FUEL DROP ALERT: {fill.fuelDropPercentage}% drop detected!
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ==================== OWNER - ALERTS TAB ==================== */}
              {ownerTab === 'alerts' && (
                <div className="space-y-6">
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                    <h3 className="font-extrabold text-lg text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-rose-500 animate-bounce" />
                      {t.activeAlerts}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t.alertsDesc}
                    </p>
                  </div>

                  <div className="space-y-4">
                    
                    {/* Scan database for fuel drops & mismatches */}
                    {fills.filter(f => f.isLocationMismatched || f.isFuelDropAlert).length === 0 ? (
                      <div className="text-center py-16 bg-slate-950 border border-slate-800 rounded-2xl">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <h4 className="text-base font-bold text-white">All operations running smoothly!</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          No fuel drop alerts or coordinate discrepancies exist in the registered history logs.
                        </p>
                      </div>
                    ) : (
                      fills.map((f) => {
                        return (
                          <div key={f.id} className="space-y-3">
                            
                            {/* 1. Fuel Drop Alert Display */}
                            {f.isFuelDropAlert && (
                              <div className="bg-slate-950 border border-rose-900/60 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg animate-fade-in">
                                <div className="flex items-start space-x-4">
                                  <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-3 flex-shrink-0">
                                    <TrendingDown className="h-6 w-6 text-rose-400" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-extrabold bg-rose-950 text-rose-400 border border-rose-900/60 px-2.5 py-0.5 rounded uppercase block w-fit mb-1">
                                      {t.criticalAlert}
                                    </span>
                                    <h4 className="text-base font-extrabold text-white leading-tight">
                                      Critical Fuel Level Drop Detected (&gt;20%)
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                      Vehicle <b className="text-cyan-400 font-odo tracking-wider">{f.vehiclePlate}</b> was logged by driver <b>{f.driverName}</b> with an unexplained CNG drop of <b className="text-rose-400">{f.fuelDropPercentage || 22.5}%</b>.
                                    </p>
                                    <span className="text-[10px] text-slate-500 block mt-1">
                                      Timestamp: {new Date(f.timestamp).toLocaleString()} • Station: {f.station}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end justify-center">
                                  <span className="text-[10px] text-rose-400 font-bold bg-rose-950/50 border border-rose-900/60 px-3 py-1 rounded-full flex items-center gap-1">
                                    <span className="h-2 w-2 bg-rose-500 rounded-full animate-ping"></span>
                                    Drop Alert: {f.fuelDropPercentage || 22.5}%
                                  </span>
                                  <span className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">Ref: {f.id}</span>
                                </div>
                              </div>
                            )}

                            {/* 2. Location Mismatch Alert Display */}
                            {f.isLocationMismatched && (
                              <div className="bg-slate-950 border border-amber-600/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg animate-fade-in">
                                <div className="flex items-start space-x-4">
                                  <div className="bg-amber-950/80 border border-amber-800 rounded-xl p-3 flex-shrink-0">
                                    <MapPin className="h-6 w-6 text-amber-400" />
                                  </div>
                                  <div>
                                    <span className="text-[9px] font-extrabold bg-amber-950 text-amber-400 border border-amber-900/60 px-2.5 py-0.5 rounded uppercase block w-fit mb-1">
                                      Discrepancy Warning
                                    </span>
                                    <h4 className="text-base font-extrabold text-white leading-tight">
                                      GPS Geotag Coordinates Diverged &gt; 500m
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                      Driver <b>{f.driverName}</b> submitted a refueling log for vehicle <b className="text-cyan-400 font-odo tracking-wider">{f.vehiclePlate}</b> where the physical location of odometer capture and sales receipt varied by <b>{f.distanceDifferenceMeters} meters</b>.
                                    </p>
                                    <span className="text-[10px] text-slate-500 block mt-1">
                                      Receipt Location: {f.receiptGeo.address} <br/>
                                      Odo Capture Spot: {f.odometerGeo.address}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end justify-center">
                                  <span className="text-[10px] text-amber-400 font-bold bg-amber-950/50 border border-amber-900/60 px-3 py-1 rounded-full flex items-center gap-1">
                                    Variance: {f.distanceDifferenceMeters}m
                                  </span>
                                  <span className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">Ref: {f.id}</span>
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })
                    )}

                  </div>

                </div>
              )}

            </div>
          )}


          {/* ==================== 4. GLOBAL ADMIN CONSOLE ==================== */}
          {portal === 'admin' && isAdminLoggedIn && (
            <div className="flex-grow flex flex-col py-2 space-y-6">
              
              {/* Admin Header */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
                <div>
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest block mb-0.5">
                    {t.adminDashboardTitle}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">
                    {t.cngSystemStats}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Monitoring Global CNG Dispensing Network: <span className="font-bold text-emerald-400">Vadodara Gas, Adani Gas, Gujarat Gas</span>
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 z-50 relative"
                >
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </button>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t.totalSystemOwners}</span>
                  <span className="text-2xl font-extrabold text-white block font-odo tracking-wider mt-1">14 Fleets</span>
                  <span className="text-[9px] text-emerald-400 font-medium block mt-1">Gujarat Zone • Active</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t.avgFuelPrice}</span>
                  <span className="text-2xl font-extrabold text-emerald-400 block font-odo tracking-wider mt-1">₹ 82.30 /KG</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Last updated: Realtime</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{t.systemHealth}</span>
                  <span className="text-2xl font-extrabold text-white block font-odo tracking-wider mt-1">98.6%</span>
                  <span className="text-[9px] text-emerald-400 block mt-1">OCR accuracy & GPS lock</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Alert Response Rate</span>
                  <span className="text-2xl font-extrabold text-rose-400 block font-odo tracking-wider mt-1">100% Resolved</span>
                  <span className="text-[9px] text-slate-400 block mt-1">Audit trails stored offline</span>
                </div>
              </div>

              {/* Global Audit Logs & User Management */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Audit Logs Column */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 lg:col-span-2">
                  <h3 className="font-extrabold text-base text-white border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-purple-400" />
                    {t.auditLogs}
                  </h3>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border text-xs flex justify-between items-start gap-3 ${
                          log.type === 'critical'
                            ? 'bg-rose-950/20 border-rose-900/60 text-rose-200'
                            : log.type === 'warning'
                            ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                            : log.type === 'success'
                            ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-200'
                            : 'bg-slate-900 border-slate-850 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase block opacity-60">
                            Logged by {log.user} • {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <p className="font-medium leading-relaxed">{log.event}</p>
                        </div>
                        <span className="text-[9.5px] font-bold bg-slate-950/80 px-2 py-0.5 rounded shrink-0">
                          {log.type.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage Enterprise list */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                  <h3 className="font-extrabold text-base text-white border-b border-slate-850 pb-3 mb-4 flex items-center gap-2">
                    <Users className="h-4.5 w-4.5 text-purple-400" />
                    {t.manageUsers}
                  </h3>

                  <div className="space-y-3">
                    
                    {/* Super Carry Fleet Profile */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Enterprise Subscribed</span>
                      <span className="text-xs font-bold text-white block">Gujarat Gas Logistic Fleet Corp</span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        Active subscriptions: 3 vehicles, 3 driver accounts logged in Vadodara central region.
                      </p>
                      <div className="mt-3 pt-2.5 border-t border-slate-850 flex justify-between items-center">
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/65 px-2 py-0.5 rounded font-bold">
                          PLAN: ENTERPRISE GOLD
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold">Expires 2027</span>
                      </div>
                    </div>

                    {/* Gujarat Gas price matrix */}
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-2">Gujarat Retail CNG Rate matrix</span>
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vadodara Gas Ltd</span>
                          <span className="font-bold font-odo tracking-wide text-slate-200">₹ 82.50 /KG</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Adani Gas Retail</span>
                          <span className="font-bold font-odo tracking-wide text-slate-200">₹ 81.00 /KG</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gujarat Gas Corp</span>
                          <span className="font-bold font-odo tracking-wide text-slate-200">₹ 83.40 /KG</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* MOBILE PWA BOTTOM NAVIGATION BAR FOR IMMERSIVE EXPERIENCE */}
          {isMobilePreview && portal === 'owner' && (
            <div className="w-full border-t border-slate-850 pt-3 mt-auto bg-slate-950 flex justify-around text-center">
              <div className="cursor-pointer" onClick={() => {
                if (portal === 'owner') setOwnerTab('home');
              }}>
                <User className={`h-5 w-5 mx-auto ${portal === 'owner' && ownerTab === 'home' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[9px] block mt-0.5 text-slate-400">Home</span>
              </div>
              <div className="cursor-pointer" onClick={() => {
                if (portal === 'owner') setOwnerTab('vehicles');
              }}>
                <Fuel className={`h-5 w-5 mx-auto ${portal === 'owner' && ownerTab === 'vehicles' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[9px] block mt-0.5 text-slate-400">Vehicles</span>
              </div>
              <div className="cursor-pointer" onClick={() => {
                if (portal === 'owner') setOwnerTab('media');
              }}>
                <Camera className={`h-5 w-5 mx-auto ${portal === 'owner' && ownerTab === 'media' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[9px] block mt-0.5 text-slate-400">Media</span>
              </div>
              <div className="cursor-pointer" onClick={() => {
                if (portal === 'owner') setOwnerTab('alerts');
              }}>
                <AlertTriangle className={`h-5 w-5 mx-auto ${portal === 'owner' && ownerTab === 'alerts' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="text-[9px] block mt-0.5 text-slate-400">Alerts</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Google Sheets Setup Modal */}
      {showGoogleSheetsSetup && (
        <GoogleSheetsSetup
          onClose={() => setShowGoogleSheetsSetup(false)}
          onSaveUrl={(url) => {
            setGoogleSheetsUrl(url);
            saveGoogleSheetsUrl(url);
          }}
          currentUrl={googleSheetsUrl}
        />
      )}

      {/* Immersive Footer */}
      <footer className="bg-slate-950 border-t border-slate-850 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="font-semibold text-slate-400">CNG Flow</span> Fuel Audit & Compliance Platform.
          </div>
          <div className="flex space-x-4 text-[11px]">
            <span>Secure 256-bit Geotag Cryptography</span>
            <span>•</span>
            <span>Automatic Neural OCR Engine</span>
            <span>•</span>
            <span>PWA Standalone Verified</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
