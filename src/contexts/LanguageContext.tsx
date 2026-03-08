import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "hi" | "mr";

export const languageLabels: Record<Language, string> = {
  en: "EN",
  hi: "हिं",
  mr: "मरा",
};

export const languageNames: Record<Language, string> = {
  en: "English",
  hi: "हिन्दी",
  mr: "मराठी",
};

// Translation keys
const translations = {
  // Layout / Nav
  appName: { en: "AnganTrack", hi: "आंगनट्रैक", mr: "आंगनट्रॅक" },
  appSubtitle: { en: "AI Health Monitor", hi: "AI स्वास्थ्य मॉनिटर", mr: "AI आरोग्य मॉनिटर" },
  online: { en: "Online", hi: "ऑनलाइन", mr: "ऑनलाइन" },
  offline: { en: "Offline", hi: "ऑफलाइन", mr: "ऑफलाइन" },
  navHome: { en: "Home", hi: "होम", mr: "होम" },
  navChildren: { en: "Children", hi: "बच्चे", mr: "मुले" },
  navScan: { en: "Scan", hi: "स्कैन", mr: "स्कॅन" },
  navMap: { en: "Map", hi: "नक्शा", mr: "नकाशा" },
  navLearn: { en: "Learn", hi: "सीखें", mr: "शिका" },
  navVoice: { en: "Voice", hi: "आवाज़", mr: "आवाज" },
  navSupervisor: { en: "Supervisor", hi: "पर्यवेक्षक", mr: "पर्यवेक्षक" },
  navVisits: { en: "Visits", hi: "विजिट", mr: "भेटी" },
  navSupplies: { en: "Supplies", hi: "आपूर्ति", mr: "पुरवठा" },

  // Dashboard
  greeting: { en: "Good Morning, Sunita 👋", hi: "सुप्रभात, सुनीता 👋", mr: "सुप्रभात, सुनीता 👋" },
  centerInfo: { en: "Anganwadi Center #47, Rampur Block", hi: "आंगनवाड़ी केंद्र #47, रामपुर ब्लॉक", mr: "अंगणवाडी केंद्र #47, रामपूर ब्लॉक" },
  totalChildren: { en: "Total Children", hi: "कुल बच्चे", mr: "एकूण मुले" },
  normal: { en: "Normal", hi: "सामान्य", mr: "सामान्य" },
  atRisk: { en: "At Risk", hi: "जोखिम में", mr: "धोक्यात" },
  severe: { en: "Severe", hi: "गंभीर", mr: "गंभीर" },
  takeAttendance: { en: "Take Attendance", hi: "उपस्थिति लें", mr: "उपस्थिती घ्या" },
  selectSessionType: { en: "Select Session Type", hi: "सत्र प्रकार चुनें", mr: "सत्र प्रकार निवडा" },
  teachingSession: { en: "Teaching Session", hi: "शिक्षण सत्र", mr: "शिक्षण सत्र" },
  nutritionDistribution: { en: "Nutrition Distribution", hi: "पोषण वितरण", mr: "पोषण वितरण" },
  healthCheckSession: { en: "Health Check Session", hi: "स्वास्थ्य जांच सत्र", mr: "आरोग्य तपासणी सत्र" },
  aiInsight: { en: "AI Insight", hi: "AI अंतर्दृष्टि", mr: "AI अंतर्दृष्टी" },
  aiInsightText: {
    en: "3 children in Rampur show early signs of growth faltering. Recommend nutritional intervention this week.",
    hi: "रामपुर में 3 बच्चों में विकास रुकने के शुरुआती लक्षण दिखे हैं। इस सप्ताह पोषण हस्तक्षेप की सिफारिश।",
    mr: "रामपूरमधील 3 मुलांमध्ये वाढ खुंटण्याची प्रारंभिक लक्षणे दिसत आहेत. या आठवड्यात पोषण हस्तक्षेपाची शिफारस.",
  },
  communityAlert: { en: "Community Alert", hi: "सामुदायिक चेतावनी", mr: "समुदाय सूचना" },
  communityAlertText: {
    en: "Diarrhea outbreak reported in Sundarpur village. 5 children affected. Immediate ORS distribution needed.",
    hi: "सुंदरपुर गांव में दस्त का प्रकोप। 5 बच्चे प्रभावित। तुरंत ORS वितरण आवश्यक।",
    mr: "सुंदरपूर गावात अतिसाराचा उद्रेक. 5 मुले प्रभावित. तात्काळ ORS वितरण आवश्यक.",
  },
  highRiskChildren: { en: "High-Risk Children", hi: "उच्च-जोखिम बच्चे", mr: "उच्च-धोक्याची मुले" },
  viewAll: { en: "View All", hi: "सभी देखें", mr: "सर्व पहा" },
  reminders: { en: "Reminders & Tasks", hi: "रिमाइंडर और कार्य", mr: "स्मरणपत्रे आणि कार्ये" },
  quickActions: { en: "Quick Actions", hi: "त्वरित कार्य", mr: "जलद कृती" },
  compareCenters: { en: "Compare Centers", hi: "केंद्र तुलना", mr: "केंद्र तुलना" },
  supervisorDashboard: { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड" },
  stock: { en: "Stock", hi: "स्टॉक", mr: "साठा" },
  vaccines: { en: "Vaccines", hi: "टीके", mr: "लसी" },
  aiScan: { en: "AI Scan", hi: "AI स्कैन", mr: "AI स्कॅन" },
  addChild: { en: "Add Child", hi: "बच्चा जोड़ें", mr: "मूल जोडा" },
  recordVisit: { en: "Record Visit", hi: "विजिट रिकॉर्ड", mr: "भेट नोंदवा" },
  learn: { en: "Learn", hi: "सीखें", mr: "शिका" },

  // Attendance
  present: { en: "Present", hi: "उपस्थित", mr: "उपस्थित" },
  absent: { en: "Absent", hi: "अनुपस्थित", mr: "अनुपस्थित" },
  markAllPresent: { en: "Mark All Present", hi: "सभी उपस्थित करें", mr: "सर्व उपस्थित करा" },
  saveAttendance: { en: "Save Attendance", hi: "उपस्थिति सहेजें", mr: "उपस्थिती जतन करा" },
  attendanceSaved: { en: "Attendance saved!", hi: "उपस्थिति सहेजी गई!", mr: "उपस्थिती जतन झाली!" },

  // Children List
  childrenRegistry: { en: "Children Registry", hi: "बच्चों की रजिस्ट्री", mr: "मुलांची नोंदणी" },
  searchByName: { en: "Search by name...", hi: "नाम से खोजें...", mr: "नावाने शोधा..." },

  // Nutrition Stock
  nutritionStock: { en: "Nutrition Stock", hi: "पोषण स्टॉक", mr: "पोषण साठा" },
  rationManagement: { en: "Ration & Inventory Management", hi: "राशन और इन्वेंटरी प्रबंधन", mr: "रेशन आणि साठा व्यवस्थापन" },
  currentStock: { en: "Current Stock", hi: "वर्तमान स्टॉक", mr: "सध्याचा साठा" },
  lowStock: { en: "Low Stock", hi: "कम स्टॉक", mr: "कमी साठा" },
  sufficient: { en: "Sufficient", hi: "पर्याप्त", mr: "पुरेसा" },
  critical: { en: "Critical", hi: "गंभीर", mr: "गंभीर" },
  addStock: { en: "Add", hi: "जोड़ें", mr: "जोडा" },
  history: { en: "History", hi: "इतिहास", mr: "इतिहास" },
  pdf: { en: "PDF", hi: "PDF", mr: "PDF" },
  selectItem: { en: "Select Item", hi: "आइटम चुनें", mr: "वस्तू निवडा" },
  quantity: { en: "Quantity", hi: "मात्रा", mr: "प्रमाण" },
  enterQuantity: { en: "Enter quantity", hi: "मात्रा दर्ज करें", mr: "प्रमाण टाका" },
  stockUpdated: { en: "Stock updated successfully!", hi: "स्टॉक सफलतापूर्वक अपडेट!", mr: "साठा यशस्वीरित्या अद्यतनित!" },
  monthlyPrediction: { en: "Monthly Requirement Prediction", hi: "मासिक आवश्यकता अनुमान", mr: "मासिक गरज अंदाज" },
  required: { en: "Required", hi: "आवश्यक", mr: "आवश्यक" },
  available: { en: "Available", hi: "उपलब्ध", mr: "उपलब्ध" },
  shortage: { en: "Shortage", hi: "कमी", mr: "तुटवडा" },
  stockHistory: { en: "Stock History", hi: "स्टॉक इतिहास", mr: "साठा इतिहास" },
  noStockHistory: { en: "No stock history yet", hi: "अभी तक कोई स्टॉक इतिहास नहीं", mr: "अद्याप साठा इतिहास नाही" },
  rice: { en: "Rice", hi: "चावल", mr: "तांदूळ" },
  dal: { en: "Dal", hi: "दाल", mr: "डाळ" },
  oil: { en: "Oil", hi: "तेल", mr: "तेल" },
  eggs: { en: "Eggs", hi: "अंडे", mr: "अंडी" },
  supplementPackets: { en: "Supplement Packets", hi: "सप्लीमेंट पैकेट", mr: "पूरक पॅकेट" },

  // Vaccine Tracker
  vaccineTracker: { en: "Vaccine Tracker", hi: "वैक्सीन ट्रैकर", mr: "लस ट्रॅकर" },
  immunizationCalendar: { en: "Smart Immunization Calendar", hi: "स्मार्ट टीकाकरण कैलेंडर", mr: "स्मार्ट लसीकरण दिनदर्शिका" },
  immunizationRecord: { en: "Immunization Record", hi: "टीकाकरण रिकॉर्ड", mr: "लसीकरण नोंद" },
  summary: { en: "Summary", hi: "सारांश", mr: "सारांश" },
  children: { en: "Children", hi: "बच्चे", mr: "मुले" },
  campList: { en: "Camp List", hi: "कैंप सूची", mr: "शिबिर यादी" },
  vaccinated: { en: "Vaccinated", hi: "टीकाकृत", mr: "लसीकरण" },
  overdue: { en: "Overdue", hi: "विलंबित", mr: "मुदत उलटलेली" },
  dueSoon: { en: "Due Soon", hi: "जल्द देय", mr: "लवकरच देय" },
  upcoming: { en: "Upcoming", hi: "आगामी", mr: "आगामी" },
  done: { en: "Done", hi: "हो गया", mr: "झाले" },
  monthlyCampList: { en: "Monthly Vaccination Camp List", hi: "मासिक टीकाकरण शिविर सूची", mr: "मासिक लसीकरण शिबिर यादी" },
  childrenDueVaccination: { en: "children due for vaccination", hi: "बच्चों का टीकाकरण बाकी", mr: "मुलांचे लसीकरण बाकी" },
  noVaccinationsDue: { en: "No vaccinations due this month 🎉", hi: "इस माह कोई टीकाकरण बाकी नहीं 🎉", mr: "या महिन्यात कोणतेही लसीकरण बाकी नाही 🎉" },

  // Child Profile
  health: { en: "Health", hi: "स्वास्थ्य", mr: "आरोग्य" },
  development: { en: "Development", hi: "विकास", mr: "विकास" },
  aiRiskAssessment: { en: "AI Risk Assessment", hi: "AI जोखिम मूल्यांकन", mr: "AI धोका मूल्यांकन" },
  underweight: { en: "Underweight", hi: "कम वजन", mr: "कमी वजन" },
  stuntingRisk: { en: "Stunting Risk", hi: "बौनापन जोखिम", mr: "खुंटलेली वाढ" },
  dropoutRisk: { en: "Dropout Risk", hi: "ड्रॉपआउट जोखिम", mr: "गळती धोका" },
  flagged: { en: "Flagged", hi: "चिन्हित", mr: "चिन्हांकित" },
  moderate: { en: "Moderate", hi: "मध्यम", mr: "मध्यम" },
  growthCharts: { en: "Growth Charts", hi: "विकास चार्ट", mr: "वाढ तक्ते" },
  growthPrediction: { en: "6-Month Growth Prediction", hi: "6 माह विकास पूर्वानुमान", mr: "6 महिने वाढ अंदाज" },
  actualWeight: { en: "Actual Weight", hi: "वास्तविक वजन", mr: "प्रत्यक्ष वजन" },
  aiPredicted: { en: "AI Predicted", hi: "AI पूर्वानुमान", mr: "AI अंदाज" },
  hemoglobinLevel: { en: "Hemoglobin Level", hi: "हीमोग्लोबिन स्तर", mr: "हिमोग्लोबिन पातळी" },
  aiNutritionPlan: { en: "AI Nutrition Plan", hi: "AI पोषण योजना", mr: "AI पोषण योजना" },
  visitHistory: { en: "Visit History", hi: "विजिट इतिहास", mr: "भेट इतिहास" },
  photoTimeline: { en: "Photo Timeline", hi: "फोटो टाइमलाइन", mr: "फोटो टाइमलाइन" },

  // Development Tracker
  possibleDelay: { en: "⚠ Possible Development Delay", hi: "⚠ संभावित विकासात्मक विलंब", mr: "⚠ संभाव्य विकासात्मक विलंब" },
  developmentProgress: { en: "Development Progress", hi: "विकास प्रगति", mr: "विकास प्रगती" },
  suggestedActivities: { en: "Suggested Activities", hi: "सुझावित गतिविधियां", mr: "सुचवलेल्या क्रिया" },
  motorDev: { en: "Motor Development", hi: "मोटर विकास", mr: "मोटर विकास" },
  speechDev: { en: "Speech Development", hi: "भाषा विकास", mr: "भाषा विकास" },
  socialDev: { en: "Social Development", hi: "सामाजिक विकास", mr: "सामाजिक विकास" },
  cognitiveDev: { en: "Cognitive Development", hi: "संज्ञानात्मक विकास", mr: "संज्ञानात्मक विकास" },

  // AI Scan
  aiHealthScan: { en: "AI Health Scan", hi: "AI स्वास्थ्य स्कैन", mr: "AI आरोग्य स्कॅन" },
  scanChild: { en: "Scan Child for Assessment", hi: "मूल्यांकन के लिए बच्चे को स्कैन करें", mr: "मूल्यांकनासाठी मुलाचे स्कॅन करा" },
  takePhotoOrUpload: { en: "Take a photo or upload an image for AI analysis", hi: "AI विश्लेषण के लिए फोटो लें या अपलोड करें", mr: "AI विश्लेषणासाठी फोटो काढा किंवा अपलोड करा" },
  takePhoto: { en: "Take Photo", hi: "फोटो लें", mr: "फोटो काढा" },
  upload: { en: "Upload", hi: "अपलोड", mr: "अपलोड" },
  lastScanResult: { en: "Last Scan Result", hi: "अंतिम स्कैन परिणाम", mr: "शेवटचा स्कॅन निकाल" },
  malnutritionDetection: { en: "Malnutrition Detection", hi: "कुपोषण पहचान", mr: "कुपोषण ओळख" },
  moderateRisk: { en: "Moderate Risk", hi: "मध्यम जोखिम", mr: "मध्यम धोका" },
  skinCondition: { en: "Skin Condition", hi: "त्वचा स्थिति", mr: "त्वचा स्थिती" },
  pallorAnemia: { en: "Pallor (Anemia Indicator)", hi: "पीलापन (एनीमिया सूचक)", mr: "फिकटपणा (अ‍ॅनिमिया सूचक)" },
  detected: { en: "Detected", hi: "पाया गया", mr: "आढळले" },
  growthAssessment: { en: "Growth Assessment", hi: "विकास मूल्यांकन", mr: "वाढ मूल्यांकन" },
  belowAverage: { en: "Below Average", hi: "औसत से कम", mr: "सरासरीपेक्षा कमी" },
  privacyConsent: { en: "Privacy & Consent", hi: "गोपनीयता और सहमति", mr: "गोपनीयता आणि संमती" },
  privacyText: {
    en: "All photos are processed locally. Data is encrypted and shared only with authorized health workers. Parental consent is required before scanning.",
    hi: "सभी फोटो स्थानीय रूप से प्रोसेस होते हैं। डेटा एन्क्रिप्टेड है और केवल अधिकृत स्वास्थ्य कार्यकर्ताओं के साथ साझा किया जाता है।",
    mr: "सर्व फोटो स्थानिक पातळीवर प्रक्रिया केले जातात. डेटा एन्क्रिप्टेड आहे आणि केवळ अधिकृत आरोग्य कर्मचाऱ्यांसोबत सामायिक केला जातो.",
  },

  // GeoMap
  riskHeatmap: { en: "Risk Heatmap", hi: "जोखिम हीटमैप", mr: "धोका हीटमॅप" },
  villageRiskSummary: { en: "Village Risk Summary", hi: "गांव जोखिम सारांश", mr: "गाव धोका सारांश" },

  // Voice Assistant
  voiceAssistant: { en: "Voice Assistant", hi: "वॉइस असिस्टेंट", mr: "व्हॉइस असिस्टंट" },
  tapToSpeak: { en: "Tap to speak", hi: "बोलने के लिए टैप करें", mr: "बोलण्यासाठी टॅप करा" },
  listeningStop: { en: "Listening... tap to stop", hi: "सुन रहे हैं... रोकने के लिए टैप करें", mr: "ऐकत आहे... थांबवण्यासाठी टॅप करा" },

  // Micro Learning  
  microLearning: { en: "Micro Learning", hi: "माइक्रो लर्निंग", mr: "मायक्रो लर्निंग" },
  audioTipsGuides: { en: "Audio tips & video guides", hi: "ऑडियो टिप्स और वीडियो गाइड", mr: "ऑडिओ टिप्स आणि व्हिडिओ मार्गदर्शक" },
  yourProgress: { en: "Your Progress", hi: "आपकी प्रगति", mr: "तुमची प्रगती" },
  complete: { en: "Complete", hi: "पूर्ण", mr: "पूर्ण" },
  tipsCompleted: { en: "tips completed", hi: "टिप्स पूरी हुईं", mr: "टिप्स पूर्ण" },
  audioTips: { en: "Audio Tips", hi: "ऑडियो टिप्स", mr: "ऑडिओ टिप्स" },
  videoGuides: { en: "Video Guides", hi: "वीडियो गाइड", mr: "व्हिडिओ मार्गदर्शक" },
  markDone: { en: "Mark done", hi: "पूर्ण करें", mr: "पूर्ण करा" },
  choose: { en: "Choose...", hi: "चुनें...", mr: "निवडा..." },
  supervisor: { en: "Supervisor", hi: "पर्यवेक्षक", mr: "पर्यवेक्षक" },
  visitTracking: { en: "Visit Tracking", hi: "विजिट ट्रैकिंग", mr: "भेट ट्रॅकिंग" },

  // Attendance History
  attendanceHistory: { en: "Attendance History", hi: "उपस्थिति इतिहास", mr: "उपस्थिती इतिहास" },
  reviewPastRecords: { en: "Review past attendance records", hi: "पिछले उपस्थिति रिकॉर्ड देखें", mr: "मागील उपस्थिती नोंदी पहा" },
  sessionType: { en: "Session", hi: "सत्र", mr: "सत्र" },
  date: { en: "Date", hi: "तारीख", mr: "तारीख" },
  allSessions: { en: "All Sessions", hi: "सभी सत्र", mr: "सर्व सत्रे" },
  allDates: { en: "All Dates", hi: "सभी तारीखें", mr: "सर्व तारखा" },
  totalRecords: { en: "Records", hi: "रिकॉर्ड", mr: "नोंदी" },
  avgAttendance: { en: "Avg. Attendance", hi: "औसत उपस्थिति", mr: "सरासरी उपस्थिती" },
  noAttendanceRecords: { en: "No attendance records yet. Take attendance first!", hi: "अभी तक कोई उपस्थिति रिकॉर्ड नहीं। पहले उपस्थिति लें!", mr: "अद्याप उपस्थिती नोंदी नाहीत. आधी उपस्थिती घ्या!" },
  name: { en: "Name", hi: "नाम", mr: "नाव" },
  status: { en: "Status", hi: "स्थिति", mr: "स्थिती" },
  viewHistory: { en: "View History", hi: "इतिहास देखें", mr: "इतिहास पहा" },

  // Add Child
  registerChild: { en: "Register Child", hi: "बच्चे का पंजीकरण", mr: "मुलाची नोंदणी" },
  fillChildDetails: { en: "Fill in child & guardian details", hi: "बच्चे और अभिभावक का विवरण भरें", mr: "मूल आणि पालकांचे तपशील भरा" },
  childName: { en: "Child Name", hi: "बच्चे का नाम", mr: "मुलाचे नाव" },
  enterChildName: { en: "Enter child's name", hi: "बच्चे का नाम दर्ज करें", mr: "मुलाचे नाव टाका" },
  motherName: { en: "Mother's Name", hi: "माता का नाम", mr: "आईचे नाव" },
  enterMotherName: { en: "Enter mother's name", hi: "माता का नाम दर्ज करें", mr: "आईचे नाव टाका" },
  fatherName: { en: "Father's Name", hi: "पिता का नाम", mr: "वडिलांचे नाव" },
  enterFatherName: { en: "Enter father's name", hi: "पिता का नाम दर्ज करें", mr: "वडिलांचे नाव टाका" },
  optional: { en: "Optional", hi: "वैकल्पिक", mr: "ऐच्छिक" },
  dateOfBirth: { en: "Date of Birth", hi: "जन्म तिथि", mr: "जन्मतारीख" },
  gender: { en: "Gender", hi: "लिंग", mr: "लिंग" },
  male: { en: "Male", hi: "पुरुष", mr: "पुरुष" },
  female: { en: "Female", hi: "महिला", mr: "स्त्री" },
  other: { en: "Other", hi: "अन्य", mr: "इतर" },
  village: { en: "Village", hi: "गाँव", mr: "गाव" },
  selectVillage: { en: "Select village", hi: "गाँव चुनें", mr: "गाव निवडा" },
  phoneNumber: { en: "Phone Number", hi: "फोन नंबर", mr: "फोन नंबर" },
  weight: { en: "Weight", hi: "वजन", mr: "वजन" },
  height: { en: "Height", hi: "ऊंचाई", mr: "उंची" },
  childRegistered: { en: "Child registered successfully!", hi: "बच्चे का पंजीकरण सफल!", mr: "मुलाची नोंदणी यशस्वी!" },
  childUpdated: { en: "Child updated successfully!", hi: "बच्चे की जानकारी अपडेट हुई!", mr: "मुलाची माहिती अपडेट झाली!" },
  childDeleted: { en: "Child removed from registry", hi: "बच्चे को रजिस्ट्री से हटाया गया", mr: "मुलाला नोंदणीतून काढले" },
  editChild: { en: "Edit Child", hi: "बच्चे को संपादित करें", mr: "मुलाची माहिती बदला" },
  deleteChild: { en: "Delete", hi: "हटाएं", mr: "काढा" },
  confirmDeleteChild: { en: "Are you sure you want to remove this child?", hi: "क्या आप इस बच्चे को हटाना चाहते हैं?", mr: "तुम्हाला हे मूल काढायचे आहे का?" },
  updateChild: { en: "Update Child", hi: "अपडेट करें", mr: "अपडेट करा" },
} as const;

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => translations[key]?.en || key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("app-language");
    return (saved as Language) || "en";
  });

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem("app-language", l);
  };

  const t = (key: TranslationKey): string => {
    return translations[key]?.[lang] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
