export type Language = 'en' | 'hi' | 'gu';

export interface TranslationSet {
  // Welcome & Login Screen
  welcomeTitle: string;
  welcomeSubtitle: string;
  selectLanguage: string;
  loginAs: string;
  driver: string;
  fleetOwner: string;
  admin: string;
  driverLoginTitle: string;
  driverLoginDesc: string;
  enterDriverCode: string;
  driverCodePlaceholder: string;
  loginButton: string;
  backButton: string;
  ownerLoginTitle: string;
  ownerLoginDesc: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  adminLoginTitle: string;
  adminLoginDesc: string;
  demoCredentials: string;
  demoDriverCodes: string;

  // Navigation
  home: string;
  vehicles: string;
  media: string;
  alerts: string;
  logout: string;

  // Fleet Owner - Home / Stats
  ownerDashboard: string;
  welcomeOwner: string;
  totalVehicles: string;
  activeDrivers: string;
  totalFills: string;
  totalMediaStored: string;
  addDriverTitle: string;
  driverName: string;
  driverCode: string;
  createDriverBtn: string;
  addVehicleTitle: string;
  vehiclePlate: string;
  vehicleModel: string;
  initialOdo: string;
  createVehicleBtn: string;
  successDriverAdded: string;
  successVehicleAdded: string;
  registeredDriversList: string;

  // Fleet Owner - Vehicles Tab
  vehicleDetailsTitle: string;
  plateNumber: string;
  model: string;
  fuelCapacity: string;
  totalFillsRecorded: string;
  lastOdoReading: string;
  viewDetailsBtn: string;
  closeDetailsBtn: string;
  noVehiclesYet: string;

  // Fleet Owner - Media Tab
  mediaVerification: string;
  mediaDesc: string;
  receiptGeotag: string;
  odoGeotag: string;
  distanceDiff: string;
  mismatchedAlert: string;
  matchedSuccess: string;
  videoFill: string;
  pumpMeterPhoto: string;
  receiptPhoto: string;
  odometerPhoto: string;
  dateCaptured: string;
  station: string;
  amountPaid: string;
  fuelAmount: string;
  calculatedRate: string;

  // Fleet Owner - Alerts Tab
  activeAlerts: string;
  alertsDesc: string;
  fuelDropWarning: string;
  locationMismatchWarning: string;
  criticalAlert: string;
  resolvedAlert: string;
  simulatedAlertMsg: string;

  // Driver Flow - Fill Wizard
  driverDashboard: string;
  welcomeDriver: string;
  fillCngBtn: string;
  fillCngWizardTitle: string;
  step: string;
  of: string;
  
  // Wizard Steps
  step1Title: string;
  step1Desc: string;
  recordVideoBtn: string;
  recordingActive: string;
  stopRecordingBtn: string;
  videoRecordedSuccess: string;

  step2Title: string;
  step2Desc: string;
  capturePumpPhotoBtn: string;
  pumpPhotoCaptured: string;

  step3Title: string;
  step3Desc: string;
  captureReceiptPhotoBtn: string;
  receiptPhotoCaptured: string;

  step4Title: string;
  step4Desc: string;
  selectVehicle: string;
  selectStation: string;
  fillKgs: string;
  fillRate: string;
  totalPayable: string;
  autoTime: string;

  step5Title: string;
  step5Desc: string;
  captureOdoPhotoBtn: string;
  ocrProcessing: string;
  ocrDetectedKms: string;
  editKmsDesc: string;
  geotagCaptured: string;

  submitFillBtn: string;
  fillSubmittedSuccess: string;

  // Admin Dashboard
  adminDashboardTitle: string;
  adminSummary: string;
  totalSystemOwners: string;
  avgFuelPrice: string;
  systemHealth: string;
  auditLogs: string;
  manageUsers: string;
  activeSystemAlerts: string;
  cngSystemStats: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    welcomeTitle: "Techinnovate Mobility",
    welcomeSubtitle: "Advanced CNG Fleet Fuel Monitoring & Compliance Platform",
    selectLanguage: "Select Language / भाषा चुनें / ભાષા પસંદ કરો",
    loginAs: "Select Portal Login Role",
    driver: "CNG Vehicle Driver",
    fleetOwner: "Fleet Operations Owner",
    admin: "System Administrator",
    driverLoginTitle: "Driver Authentication",
    driverLoginDesc: "Enter your unique driver access code assigned by your fleet owner.",
    enterDriverCode: "Access Code",
    driverCodePlaceholder: "e.g. DRV789",
    loginButton: "Secure Login",
    backButton: "Go Back",
    ownerLoginTitle: "Fleet Owner Portal",
    ownerLoginDesc: "Log in with your registered email to manage vehicles, drivers, and media verification.",
    emailPlaceholder: "owner@example.com",
    passwordPlaceholder: "••••••••",
    adminLoginTitle: "System Admin Access",
    adminLoginDesc: "Enter administration credentials to manage global CNG network and fleet accounts.",
    demoCredentials: "Demo Account: owner@cng.com | password",
    demoDriverCodes: "Active Demo Driver Codes in system: ",

    home: "Home",
    vehicles: "Vehicles",
    media: "Media Verification",
    alerts: "Alerts",
    logout: "Logout",

    ownerDashboard: "Fleet Owner Dashboard",
    welcomeOwner: "Welcome, Operations Owner",
    totalVehicles: "Total Registered Vehicles",
    activeDrivers: "Active Driver Accounts",
    totalFills: "Total CNG Fills Recorded",
    totalMediaStored: "Verified Media Files",
    addDriverTitle: "Add New Driver Account",
    driverName: "Full Name of Driver",
    driverCode: "Unique Driver Login Code",
    createDriverBtn: "Generate Driver Account",
    addVehicleTitle: "Register Fleet Vehicle",
    vehiclePlate: "Registration Plate Number",
    vehicleModel: "Vehicle Model & Make (e.g. Maruti Super Carry)",
    initialOdo: "Current Odometer Reading (KMs)",
    createVehicleBtn: "Register Vehicle",
    successDriverAdded: "New driver registered successfully with access code!",
    successVehicleAdded: "New vehicle registered in the fleet registry!",
    registeredDriversList: "Registered Driver Accounts",

    vehicleDetailsTitle: "Fleet Vehicle Profile & History",
    plateNumber: "Plate Number",
    model: "Make & Model",
    fuelCapacity: "CNG Cylinder Capacity (KGs)",
    totalFillsRecorded: "Fills Count",
    lastOdoReading: "Last Odometer Value",
    viewDetailsBtn: "View Full Details",
    closeDetailsBtn: "Close Profile",
    noVehiclesYet: "No vehicles registered yet. Add your first vehicle in the Home tab!",

    mediaVerification: "Geotagged Media Cross-Verification",
    mediaDesc: "Cross-verifying filling pump and driver odometer photos. Items showing discrepancies > 500 meters are automatically flagged.",
    receiptGeotag: "Receipt Location Geotag",
    odoGeotag: "Odometer Location Geotag",
    distanceDiff: "Geographic Coordinate Variance",
    mismatchedAlert: "🚨 LOCATION MISMATCH ERROR: Discrepancy exceeds 500m limit! Potential Fraud Alert.",
    matchedSuccess: "✅ LOCATION MATCHED: Distance discrepancy within acceptable limits (< 500m).",
    videoFill: "Filling Process Video",
    pumpMeterPhoto: "Pump Meter Reading Photo",
    receiptPhoto: "Receipt Receipt Photo",
    odometerPhoto: "Odometer Panel Photo",
    dateCaptured: "Timestamp",
    station: "CNG Station Name",
    amountPaid: "Calculated Cost",
    fuelAmount: "CNG Quantity",
    calculatedRate: "Fuel Rate",

    activeAlerts: "Live Operations Alerts",
    alertsDesc: "Real-time system notifications, high fuel drops (>20%), and coordinates verification warnings.",
    fuelDropWarning: "⚠️ CRITICAL: Abnormal Fuel level Drop detected (>20% variance since last fill). Check for leaks or siphonage.",
    locationMismatchWarning: "🚨 DISCREPANCY: Driver uploaded filling receipt with location mismatch exceeding 500 meters.",
    criticalAlert: "Critical Warning",
    resolvedAlert: "Resolved / Monitored",
    simulatedAlertMsg: "The system continuously scans all submissions. Alerts will populate automatically when an anomaly is detected.",

    driverDashboard: "CNG Driver Portal",
    welcomeDriver: "Welcome back, Driver",
    fillCngBtn: "Start New CNG Fill Entry",
    fillCngWizardTitle: "Record CNG Filling Details",
    step: "Step",
    of: "of",

    step1Title: "1. Video of CNG Filling Process",
    step1Desc: "Record a short video showing the CNG dispenser nozzle safely locked into the vehicle's receptacle while filling.",
    recordVideoBtn: "Start Live Video Capture",
    recordingActive: "🎥 RECORDING CNG FILLING LIVE...",
    stopRecordingBtn: "Stop and Save Video",
    videoRecordedSuccess: "✓ Video recorded and timestamped successfully!",

    step2Title: "2. Capture Pump Meter Reading",
    step2Desc: "Hold camera steady and capture a clear picture of the digital display on the gas pump showing total KGs and amount.",
    capturePumpPhotoBtn: "Take Pump Meter Photo",
    pumpPhotoCaptured: "✓ Pump meter photo captured successfully!",

    step3Title: "3. Capture Sales Receipt Photo",
    step3Desc: "Snap a clear picture of the physical paper invoice printed from the terminal. This step automatically records your GPS location.",
    captureReceiptPhotoBtn: "Capture Receipt Photo",
    receiptPhotoCaptured: "✓ Sales receipt photo captured & GPS geotagged!",

    step4Title: "4. Enter Filling Quantities & Station",
    step4Desc: "Manually confirm KGs filled and rate per KG. The system will auto-calculate the total bill.",
    selectVehicle: "Select Your Assigned Vehicle",
    selectStation: "Select Authorized Gas Retailer",
    fillKgs: "CNG Quantity Filled (in Kilograms)",
    fillRate: "CNG Price per KG (INR / ₹)",
    totalPayable: "Total Calculated Payable Amount",
    autoTime: "Captured Timestamp (Auto)",

    step5Title: "5. Capture Vehicle Odometer & Submit",
    step5Desc: "Snap your current dashboard odometer reading. Our intelligent OCR tool will automatically read the mileage from the photo, which you can review.",
    captureOdoPhotoBtn: "Capture Dashboard Odometer",
    ocrProcessing: "Analyzing image with OCR Neural Engine...",
    ocrDetectedKms: "Detected Mileage (Kilometers)",
    editKmsDesc: "Verify or correct the OCR output if there's a discrepancy.",
    geotagCaptured: "GPS Geotag Coordinates Captured Successfully",

    submitFillBtn: "Submit Verified CNG Entry",
    fillSubmittedSuccess: "CNG fuel entry uploaded successfully! Thank you for verifying your logs.",

    adminDashboardTitle: "Global Admin Console",
    adminSummary: "CNG Network Overview",
    totalSystemOwners: "Total Monitored Fleets",
    avgFuelPrice: "Avg. CNG Rate (Gujarat / Varodara)",
    systemHealth: "System Network Health Score",
    auditLogs: "Global System Audit Trail",
    manageUsers: "Manage Enterprise Subscriptions",
    activeSystemAlerts: "Global Active Alert Queue",
    cngSystemStats: "CNG Analytics Monitoring Panel"
  },
  hi: {
    welcomeTitle: "स्मार्ट सीएनजी ईंधन ट्रैकर",
    welcomeSubtitle: "एंटरप्राइज बेड़े ईंधन निगरानी और स्वचालित सत्यापन प्रणाली",
    selectLanguage: "भाषा चुनें / Select Language / ભાષા પસંદ કરો",
    loginAs: "पोर्टल लॉगिन भूमिका का चयन करें",
    driver: "सीएनजी वाहन चालक",
    fleetOwner: "बेड़े संचालन मालिक",
    admin: "सिस्टम व्यवस्थापक (एडमिन)",
    driverLoginTitle: "चालक सत्यापन",
    driverLoginDesc: "अपने बेड़े के मालिक द्वारा दिया गया अपना विशिष्ट ड्राइवर एक्सेस कोड दर्ज करें।",
    enterDriverCode: "एक्सेस कोड",
    driverCodePlaceholder: "उदा. DRV789",
    loginButton: "सुरक्षित लॉगिन",
    backButton: "पीछे जाएं",
    ownerLoginTitle: "बेड़े मालिक पोर्टल",
    ownerLoginDesc: "वाहनों, ड्राइवरों और मीडिया सत्यापन को प्रबंधित करने के लिए अपने पंजीकृत ईमेल से लॉगिन करें।",
    emailPlaceholder: "owner@example.com",
    passwordPlaceholder: "••••••••",
    adminLoginTitle: "सिस्टम एडमिन एक्सेस",
    adminLoginDesc: "वैश्विक सीएनजी नेटवर्क और बेड़े खातों को प्रबंधित करने के लिए एडमिन क्रेडेंशियल दर्ज करें।",
    demoCredentials: "डेमो खाता: owner@cng.com | password",
    demoDriverCodes: "सिस्टम में सक्रिय डेमो ड्राइवर कोड: ",

    home: "होम",
    vehicles: "वाहन",
    media: "मीडिया सत्यापन",
    alerts: "अलर्ट",
    logout: "लॉगआउट",

    ownerDashboard: "फ़्लीट ओनर डैशबोर्ड",
    welcomeOwner: "आपका स्वागत है, ऑपरेशन्स ओनर",
    totalVehicles: "कुल पंजीकृत वाहन",
    activeDrivers: "सक्रिय चालक खाते",
    totalFills: "कुल दर्ज सीएनजी फिलिंग",
    totalMediaStored: "सत्यापित मीडिया फाइलें",
    addDriverTitle: "नया चालक खाता जोड़ें",
    driverName: "चालक का पूरा नाम",
    driverCode: "अद्वितीय ड्राइवर लॉगिन कोड",
    createDriverBtn: "ड्राइवर खाता बनाएं",
    addVehicleTitle: "बेड़े में वाहन पंजीकृत करें",
    vehiclePlate: "पंजीकरण प्लेट संख्या",
    vehicleModel: "वाहन का मॉडल और निर्माता (उदा. मारुति सुपर कैरी)",
    initialOdo: "वर्तमान ओडोमीटर रीडिंग (किमी)",
    createVehicleBtn: "वाहन पंजीकृत करें",
    successDriverAdded: "एक्सेस कोड के साथ नया ड्राइवर सफलतापूर्वक पंजीकृत हुआ!",
    successVehicleAdded: "बेड़े की सूची में नया वाहन सफलतापूर्वक जोड़ा गया!",
    registeredDriversList: "पंजीकृत चालक खाते",

    vehicleDetailsTitle: "वाहन प्रोफ़ाइल और इतिहास",
    plateNumber: "प्लेट नंबर",
    model: "मॉडल और मेक",
    fuelCapacity: "सीएनजी सिलेंडर क्षमता (किग्रा)",
    totalFillsRecorded: "भरने की संख्या",
    lastOdoReading: "अंतिम ओडोमीटर मान",
    viewDetailsBtn: "पूर्ण विवरण देखें",
    closeDetailsBtn: "प्रोफ़ाइल बंद करें",
    noVehiclesYet: "अभी तक कोई वाहन पंजीकृत नहीं है। होम टैब में अपना पहला वाहन जोड़ें!",

    mediaVerification: "जियोटैग मीडिया क्रॉस-सत्यापन",
    mediaDesc: "गैस पंप और ड्राइवर के ओडोमीटर फोटो का क्रॉस-सत्यापन। 500 मीटर से अधिक विसंगति दिखाने वाले आइटम स्वचालित रूप से फ़्लैग किए जाते हैं।",
    receiptGeotag: "रसीद स्थान जियोटैग",
    odoGeotag: "ओडोमीटर स्थान जियोटैग",
    distanceDiff: "भौगोलिक समन्वय अंतर",
    mismatchedAlert: "🚨 स्थान बेमेल त्रुटि: विसंगति 500 मीटर की सीमा से अधिक है! संभावित धोखाधड़ी अलर्ट।",
    matchedSuccess: "✅ स्थान मेल खा गया: दूरी का अंतर स्वीकार्य सीमा (< 500 मीटर) के भीतर है।",
    videoFill: "भरने की प्रक्रिया का वीडियो",
    pumpMeterPhoto: "पंप मीटर रीडिंग फोटो",
    receiptPhoto: "बिक्री रसीद फोटो",
    odometerPhoto: "ओडोमीटर पैनल फोटो",
    dateCaptured: "समय और दिनांक",
    station: "सीएनजी स्टेशन का नाम",
    amountPaid: "परिकलित लागत",
    fuelAmount: "सीएनजी मात्रा",
    calculatedRate: "ईंधन दर",

    activeAlerts: "सक्रिय संचालन अलर्ट",
    alertsDesc: "वास्तविक समय प्रणाली सूचनाएं, उच्च ईंधन गिरावट (>20%), और निर्देशांक सत्यापन चेतावनी।",
    fuelDropWarning: "⚠️ गंभीर: असामान्य ईंधन गिरावट का पता चला (पिछली फिलिंग से >20% अंतर)। रिसाव या हेरफेर की जांच करें।",
    locationMismatchWarning: "🚨 विसंगति: ड्राइवर ने 500 मीटर से अधिक के स्थान बेमेल के साथ रसीद अपलोड की।",
    criticalAlert: "गंभीर चेतावनी",
    resolvedAlert: "हल / निगरानी में",
    simulatedAlertMsg: "सिस्टम लगातार सभी प्रविष्टियों को स्कैन करता है। विसंगति का पता चलने पर अलर्ट स्वतः आ जाएंगे।",

    driverDashboard: "सीएनजी ड्राइवर पोर्टल",
    welcomeDriver: "वापसी पर स्वागत है, ड्राइवर",
    fillCngBtn: "नई सीएनजी प्रविष्टि शुरू करें",
    fillCngWizardTitle: "सीएनजी भरने का विवरण रिकॉर्ड करें",
    step: "चरण",
    of: "का",

    step1Title: "1. सीएनजी भरने की प्रक्रिया का वीडियो",
    step1Desc: "भरते समय वाहन में सुरक्षित रूप से लॉक किए गए सीएनजी नोजल को दिखाते हुए एक छोटा वीडियो रिकॉर्ड करें।",
    recordVideoBtn: "लाइव वीडियो कैप्चर शुरू करें",
    recordingActive: "🎥 लाइव सीएनजी फिलिंग रिकॉर्ड हो रही है...",
    stopRecordingBtn: "रिकॉर्डिंग बंद करें और सहेजें",
    videoRecordedSuccess: "✓ वीडियो सफलतापूर्वक सहेजा और रिकॉर्ड किया गया!",

    step2Title: "2. पंप मीटर रीडिंग कैप्चर करें",
    step2Desc: "कैमरा स्थिर रखें और गैस पंप पर डिजिटल डिस्प्ले की एक स्पष्ट तस्वीर लें, जिसमें कुल किग्रा और राशि दिखाई दे।",
    capturePumpPhotoBtn: "पंप मीटर की फोटो लें",
    pumpPhotoCaptured: "✓ पंप मीटर फोटो सफलतापूर्वक कैप्चर की गई!",

    step3Title: "3. बिक्री रसीद की फोटो लें",
    step3Desc: "टर्मिनल से प्रिंट किए गए भौतिक बिल की एक स्पष्ट तस्वीर लें। यह चरण आपके जीपीएस स्थान को स्वचालित रूप से रिकॉर्ड करता है।",
    captureReceiptPhotoBtn: "रसीद की फोटो लें",
    receiptPhotoCaptured: "✓ बिक्री रसीद फोटो कैप्चर और जीपीएस जियोटैग किया गया!",

    step4Title: "4. भरी गई मात्रा और स्टेशन दर्ज करें",
    step4Desc: "भरे गए किलोग्राम और प्रति किलोग्राम की दर मैन्युअल रूप से पुष्टि करें। सिस्टम कुल बिल की गणना स्वतः कर देगा।",
    selectVehicle: "अपना आवंटित वाहन चुनें",
    selectStation: "अधिकृत गैस रिटेलर चुनें",
    fillKgs: "सीएनजी की मात्रा (किलोग्राम में)",
    fillRate: "सीएनजी दर प्रति किग्रा (INR / ₹)",
    totalPayable: "कुल परिकलित देय राशि",
    autoTime: "रिकॉर्ड किया गया समय (स्वतः)",

    step5Title: "5. वाहन ओडोमीटर कैप्चर करें और सबमिट करें",
    step5Desc: "अपनी वर्तमान डैशबोर्ड ओडोमीटर रीडिंग की फोटो लें। हमारा स्मार्ट ओसीआर टूल फोटो से माइलेज पढ़ लेगा, जिसे आप संपादित भी कर सकते हैं।",
    captureOdoPhotoBtn: "डैशबोर्ड ओडोमीटर कैप्चर करें",
    ocrProcessing: "ओसीआर न्यूरल इंजन के साथ छवि का विश्लेषण कर रहा है...",
    ocrDetectedKms: "पता चला माइलेज (किलोमीटर)",
    editKmsDesc: "यदि कोई अंतर है, तो ओसीआर आउटपुट को सत्यापित या सही करें।",
    geotagCaptured: "जीपीएस जियोटैग निर्देशांक सफलतापूर्वक कैप्चर किए गए",

    submitFillBtn: "सत्यापित सीएनजी प्रविष्टि सबमिट करें",
    fillSubmittedSuccess: "सीएनजी ईंधन प्रविष्टि सफलतापूर्वक अपलोड की गई! सत्यापन के लिए धन्यवाद।",

    adminDashboardTitle: "ग्लोबल एडमिन कंसोल",
    adminSummary: "सीएनजी नेटवर्क अवलोकन",
    totalSystemOwners: "कुल बेड़े",
    avgFuelPrice: "औसत सीएनजी दर (गुजरात)",
    systemHealth: "सिस्टम हेल्थ स्कोर",
    auditLogs: "ग्लोबल सिस्टम ऑडिट ट्रेल",
    manageUsers: "एंटरप्राइज सदस्यता प्रबंधित करें",
    activeSystemAlerts: "ग्लोबल एक्टिव अलर्ट कतार",
    cngSystemStats: "सीएनजी विश्लेषिकी निगरानी पैनल"
  },
  gu: {
    welcomeTitle: "સ્માર્ટ સીએનજી ફ્યુઅલ ટ્રેકર",
    welcomeSubtitle: "એન્ટરપ્રાઇઝ ફ્લીટ ફ્યુઅલ મોનિટરિંગ અને ઓટોમેટેડ વેરિફિકેશન સિસ્ટમ",
    selectLanguage: "ભાષા પસંદ કરો / Select Language / भाषा चुनें",
    loginAs: "પોર્ટલ લોગિન ભૂમિકા પસંદ કરો",
    driver: "સીએનજી વાહન ચાલક",
    fleetOwner: "ફ્લીટ ઓપરેશન્સ માલિક",
    admin: "સિસ્ટમ એડમિનિસ્ટ્રેટર",
    driverLoginTitle: "ડ્રાઇવર પ્રમાણીકરણ",
    driverLoginDesc: "તમારા ફ્લીટ માલિક દ્વારા ફાળવવામાં આવેલ તમારો અનન્ય ડ્રાઇવર એક્સેસ કોડ દાખલ કરો.",
    enterDriverCode: "એક્સેસ કોડ",
    driverCodePlaceholder: "દા.ત. DRV789",
    loginButton: "સુરક્ષિત લોગિન",
    backButton: "પાછા જાઓ",
    ownerLoginTitle: "ફ્લીટ ઓનર પોર્ટલ",
    ownerLoginDesc: "વાહનો, ડ્રાઇવરો અને મીડિયા વેરિફિકેશનનું સંચાલન કરવા માટે તમારા રજિસ્ટર્ડ ઇમેઇલ વડે લોગિન કરો.",
    emailPlaceholder: "owner@example.com",
    passwordPlaceholder: "••••••••",
    adminLoginTitle: "સિસ્ટમ એડમિન એક્સેસ",
    adminLoginDesc: "ગ્લોબલ સીએનજી નેટવર્ક અને ફ્લીટ એકાઉન્ટ્સનું સંચાલન કરવા માટે એડમિનિસ્ટ્રેટર ઓળખપત્રો દાખલ કરો.",
    demoCredentials: "ડેમો એકાઉન્ટ: owner@cng.com | password",
    demoDriverCodes: "સિસ્ટમમાં સક્રિય ડેમો ડ્રાઇવર કોડ્સ: ",

    home: "હોમ",
    vehicles: "વાહનો",
    media: "મીડિયા ચકાસણી",
    alerts: "એલર્ટ્સ",
    logout: "લોગઆઉટ",

    ownerDashboard: "ફ્લીટ ઓનર ડૅશબોર્ડ",
    welcomeOwner: "આપનું સ્વાગત છે, ઓપરેશન્સ ઓનર",
    totalVehicles: "કુલ રજિસ્ટર્ડ વાહનો",
    activeDrivers: "સક્રિય ડ્રાઇવર ખાતાઓ",
    totalFills: "કુલ સીએનજી ફિલિંગ નોંધાયેલ",
    totalMediaStored: "વેરિફાઇડ મીડિયા ફાઇલો",
    addDriverTitle: "નવું ડ્રાઇવર ખાતું ઉમેરો",
    driverName: "ડ્રાઇવરનું પૂરું નામ",
    driverCode: "અનન્ય ડ્રાઇવર લોગિન કોડ",
    createDriverBtn: "ડ્રાઇવર ખાતું બનાવો",
    addVehicleTitle: "ફ્લીટમાં વાહન રજીસ્ટર કરો",
    vehiclePlate: "રજીસ્ટ્રેશન પ્લેટ નંબર",
    vehicleModel: "વાહન મોડેલ અને ઉત્પાદક (દા.ત. મારુતિ સુપર કેરી)",
    initialOdo: "વર્તમાન ઓડોમીટર રીડિંગ (કિમી)",
    createVehicleBtn: "વાહન રજીસ્ટર કરો",
    successDriverAdded: "ઍક્સેસ કોડ સાથે નવો ડ્રાઇવર સફળતાપૂર્વક રજીસ્ટર થયો!",
    successVehicleAdded: "ફ્લીટ રજિસ્ટ્રીમાં નવું વાહન સફળતાપૂર્વક ઉમેરાયું!",
    registeredDriversList: "નોંધાયેલા ડ્રાઇવર એકાઉન્ટ્સ",

    vehicleDetailsTitle: "વાહન પ્રોફાઇલ અને ઇતિહાસ",
    plateNumber: "પ્લેટ નંબર",
    model: "મોડલ અને મેક",
    fuelCapacity: "સીએનજી સિલિન્ડર ક્ષમતા (કિલો)",
    totalFillsRecorded: "ભરવાની સંખ્યા",
    lastOdoReading: "અંતિમ ઓડોમીટર મૂલ્ય",
    viewDetailsBtn: "સંપૂર્ણ વિગતો જુઓ",
    closeDetailsBtn: "પ્રોફાઇલ બંધ કરો",
    noVehiclesYet: "હજી સુધી કોઈ વાહનો રજીસ્ટર થયા નથી. હોમ ટેબમાં તમારું પ્રથમ વાહન ઉમેરો!",

    mediaVerification: "જીઓટેગ મીડિયા ક્રોસ-વેરિફિકેશન",
    mediaDesc: "ગેસ પંપ અને ડ્રાઇવરના ઓડોમીટર ફોટાની ક્રોસ-ચકાસણી. 500 મીટરથી વધુ વિસંગતતા દર્શાવતી વસ્તુઓ આપમેળે ફ્લેગ થાય છે.",
    receiptGeotag: "રસીદ સ્થાન જીઓટેગ",
    odoGeotag: "ઓડોમીટર સ્થાન જીઓટેગ",
    distanceDiff: "ભૌગોલિક સંકલન તફાવત",
    mismatchedAlert: "🚨 સ્થાન મેળ ખાતું નથી: વિસંગતતા 500 મીટરની મર્યાદા કરતાં વધુ છે! સંભવિત છેતરપિંડી એલર્ટ.",
    matchedSuccess: "✅ સ્થાન મેળ ખાય છે: અંતરનો તફાવત સ્વીકાર્ય મર્યાદા (< 500 મીટર) ની અંદર છે.",
    videoFill: "ભરવાની પ્રક્રિયાનો વીડિયો",
    pumpMeterPhoto: "પંપ મીટર રીડિંગ ફોટો",
    receiptPhoto: "વેચાણ રસીદ ફોટો",
    odometerPhoto: "ઓડોમીટર પેનલ ફોટો",
    dateCaptured: "સમય અને તારીખ",
    station: "સીએનજી સ્ટેશનનું નામ",
    amountPaid: "ગણતરી કરેલ કિંમત",
    fuelAmount: "સીએનજી જથ્થો",
    calculatedRate: "બળતણ દર",

    activeAlerts: "સક્રિય ઓપરેશન્સ એલર્ટ્સ",
    alertsDesc: "રીઅલ-ટાઇમ સિસ્ટમ સૂચનાઓ, ઉચ્ચ બળતણ ઘટાડો (>20%), અને કોઓર્ડિનેટ્સ વેરિફિકેશન ચેતવણીઓ.",
    fuelDropWarning: "⚠️ ગંભીર: અસામાન્ય બળતણ ઘટાડો જોવા મળ્યો (છેલ્લી ફિલિંગ પછીથી >20% તફાવત). લિકેજ અથવા ચોરી તપાસો.",
    locationMismatchWarning: "🚨 વિસંગતતા: ડ્રાઇવરે 500 મીટરથી વધુના લોકેશન મિસમેચ સાથે રસીદ અપલોડ કરી.",
    criticalAlert: "ગંભીર ચેતવણી",
    resolvedAlert: "ઉકેલાયેલ / મોનિટર હેઠળ",
    simulatedAlertMsg: "સિસ્ટમ સતત બધી સબમિશન સ્કેન કરે છે. વિસંગતતા મળવા પર ચેતવણીઓ આપમેળે દેખાશે.",

    driverDashboard: "સીએનજી ડ્રાઇવર પોર્ટલ",
    welcomeDriver: "પાછા સ્વાગત છે, ડ્રાઇવર",
    fillCngBtn: "નવી સીએનજી એન્ટ્રી શરૂ કરો",
    fillCngWizardTitle: "સીએનજી ભરવાની વિગતો રેકોર્ડ કરો",
    step: "પગલું",
    of: "માંથી",

    step1Title: "1. સીએનજી ભરવાની પ્રક્રિયાનો વીડિયો",
    step1Desc: "ભરતી વખતે વાહનમાં સુરક્ષિત રીતે લૉક કરેલ સીએનજી નોઝલ દર્શાવતો નાનો વીડિયો રેકોર્ડ કરો.",
    recordVideoBtn: "લાઇવ વિડિયો કેપ્ચર શરૂ કરો",
    recordingActive: "🎥 લાઇવ સીએનજી ફિલિંગ રેકોર્ડ થઈ રહ્યું છે...",
    stopRecordingBtn: "રેકોર્ડિંગ બંધ કરો અને સેવ કરો",
    videoRecordedSuccess: "✓ વિડિઓ સફળતાપૂર્વક સેવ અને રેકોર્ડ કરવામાં આવ્યો!",

    step2Title: "2. પંપ મીટર રીડિંગ કેપ્ચર કરો",
    step2Desc: "કેમેરા સ્થિર રાખો અને ગેસ પંપ પર ડિજિટલ ડિસ્પ્લેનો સ્પષ્ટ ફોટો લો, જેમાં કુલ કિલો અને રકમ દર્શાવવામાં આવે.",
    capturePumpPhotoBtn: "પંપ મીટરનો ફોટો લો",
    pumpPhotoCaptured: "✓ પંપ મીટર ફોટો સફળતાપૂર્વક કેપ્ચર થયો!",

    step3Title: "3. વેચાણ રસીદનો ફોટો લો",
    step3Desc: "ટર્મિનલ પરથી પ્રિન્ટ થયેલ ભૌતિક બિલનો સ્પષ્ટ ફોટો લો. આ પગલું તમારા જીપીએસ સ્થાનને આપમેળે રેકોર્ડ કરે છે.",
    captureReceiptPhotoBtn: "રસીદનો ફોટો લો",
    receiptPhotoCaptured: "✓ વેચાણ રસીદ ફોટો કેપ્ચર અને જીપીએસ જીઓટેગ થયો!",

    step4Title: "4. ભરેલો જથ્થો અને સ્ટેશન દાખલ કરો",
    step4Desc: "ભરેલા કિલોગ્રામ અને પ્રતિ કિલોગ્રામનો દર મેન્યુઅલી કન્ફર્મ કરો. સિસ્ટમ કુલ બિલની ગણતરી આપમેળે કરશે.",
    selectVehicle: "તમારું ફાળવેલ વાહન પસંદ કરો",
    selectStation: "અધિકૃત ગેસ રિટેલર પસંદ કરો",
    fillKgs: "સીએનજી જથ્થો (કિલોગ્રામમાં)",
    fillRate: "સીએનજી દર પ્રતિ કિલો (INR / ₹)",
    totalPayable: "કુલ પરિકલિત ચુકવવાપાત્ર રકમ",
    autoTime: "રેકોર્ડ કરેલ સમય (આપમેળે)",

    step5Title: "5. વાહન ઓડોમીટર કેપ્ચર કરો અને સબમિટ કરો",
    step5Desc: "તમારા વર્તમાન ડૅશબોર્ડ ઓડોમીટર રીડિંગનો ફોટો લો. અમારું સ્માર્ટ OCR સાધન ફોટોમાંથી માઇલેજ વાંચશે, જેને તમે સુધારી પણ શકો છો.",
    captureOdoPhotoBtn: "ડૅશબોર્ડ ઓડોમીટર કેપ્ચર કરો",
    ocrProcessing: "ઓસીઆર ન્યુરલ એન્જિન વડે છબીનું વિશ્લેષણ કરી રહ્યું છે...",
    ocrDetectedKms: "શોધાયેલ માઇલેજ (કિલોમીટર)",
    editKmsDesc: "જો કોઈ તફાવત હોય, તો ઓસીઆર આઉટપુટને ચકાસો અથવા સુધારો.",
    geotagCaptured: "જીપીએસ જીઓટેગ કોઓર્ડિનેટ્સ સફળતાપૂર્વક કેપ્ચર થયા",

    submitFillBtn: "ચકાસાયેલ સીએનજી એન્ટ્રી સબમિટ કરો",
    fillSubmittedSuccess: "સીએનજી ફ્યુઅલ એન્ટ્રી સફળતાપૂર્વક અપલોડ થઈ! ચકાસણી બદલ આભાર.",

    adminDashboardTitle: "ગ્લોબલ એડમિન કન્સોલ",
    adminSummary: "સીએનજી નેટવર્ક ઝાંખી",
    totalSystemOwners: "કુલ ફ્લીટ મોનિટર",
    avgFuelPrice: "સરેરાશ સીએનજી દર (ગુજરાત)",
    systemHealth: "સિસ્ટમ હેલ્થ સ્કોર",
    auditLogs: "ગ્લોબલ સિસ્ટમ ઓડિટ ટ્રેલ",
    manageUsers: "એન્ટરપ્રાઇઝ સબ્સ્ક્રિપ્શન સંચાલિત કરો",
    activeSystemAlerts: "ગ્લોબલ એક્ટિવ એલર્ટ કતાર",
    cngSystemStats: "સીએનજી વિશ્લેષણાત્મક મોનિટરિંગ પેનલ"
  }
};
