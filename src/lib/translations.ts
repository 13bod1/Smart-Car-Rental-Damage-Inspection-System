export type Lang = "en" | "ar";

export const t = {
  en: {
    // Navbar
    home: "Home",
    browseFleet: "Browse Fleet",
    snapId: "Snap & ID",
    damageScan: "Damage Scan",
    compare: "Compare",
    roadtrip: "Roadtrip",
    map: "Map",
    dashboard: "Dashboard",
    signIn: "Sign In",
    getStarted: "Get Started",
    signOut: "Sign Out",
    fleetOwner: "Fleet Owner",
    renter: "Renter",
    ownerDashboard: "Owner Dashboard",
    myDashboard: "My Dashboard",
    manageFleet: "Manage Fleet",
    browseVehicles: "Browse Vehicles",

    // Hero
    poweredBy: "Powered by Gemini AI",
    heroTitle1: "Rent Smarter.",
    heroTitle2: "Return Safer.",
    heroDesc:
      "The only car rental platform with built-in AI damage assessment, instant vehicle identification, and smart car comparison. No disputes. No surprises.",
    browseFleetBtn: "Browse Fleet",
    snapIdentify: "📸 Snap & Identify",

    // AI Features
    aiFeaturesTitle: "🧠 AI-Powered Features",
    aiFeaturesDesc: "Four intelligent tools that make car rental effortless.",
    snapTitle: "Snap & Identify",
    snapDesc:
      "Point your camera at any car on the street. Gemini AI instantly identifies the make, model, year, and tells you its market value and rental rate in Egypt.",
    snapBadge: "Gemini Vision",
    damageTitle: "AI Damage Scanner",
    damageDesc:
      "Upload a photo of any vehicle and AI detects scratches, dents, and cracks — estimating repair costs and recommending deposit actions automatically.",
    damageBadge: "Computer Vision",
    compareTitle: "AI Car Comparator",
    compareDesc:
      "Compare up to 3 cars side-by-side. AI analyzes comfort, value, reliability, and fuel economy tailored to Egyptian roads and fuel prices.",
    compareBadge: "Smart Analysis",
    advisorTitle: "AI Car Advisor",
    advisorDesc:
      "Chat with our AI assistant in the bottom-right corner of any page. Ask about prices, get recommendations, or learn about any car model.",
    advisorBadge: "Conversational AI",

    // Classic Features
    whyTitle: "Why AutoRent AI?",
    whyDesc: "Cutting-edge technology meets a seamless rental experience.",
    feature1Title: "Real-Time Updates",
    feature1Desc:
      "Supabase Realtime subscriptions push damage reports and deposit decisions to your screen the moment they're ready.",
    feature2Title: "Row-Level Security",
    feature2Desc:
      "Your data is yours. RLS policies ensure renters only see their contracts and owners only see their fleet.",
    feature3Title: "Automated Payments",
    feature3Desc:
      "Deposit holds, refunds, and deductions are processed automatically at the end of every rental.",

    // Stats
    vehiclesListed: "Vehicles Listed",
    damageAccuracy: "Damage Detection Accuracy",
    aiTime: "AI Analysis Time",
    rentalsCompleted: "Rentals Completed",

    // How it works
    howItWorks: "How It Works",
    step1Title: "Browse & Book",
    step1Desc:
      "Choose from hundreds of verified vehicles. Pay securely with deposit hold.",
    step2Title: "Pick Up & Go",
    step2Desc:
      "Take pre-rental photos via the app. They're stored securely in Supabase Storage.",
    step3Title: "Return & Settle",
    step3Desc:
      "Upload 4 return photos. AI assesses damage in seconds and your deposit is settled automatically.",

    // Reviews
    reviewsTitle: "What Our Fleet Owners Say",
    reviewsDesc:
      "Verified reviews from fleet owners across Egypt who trust AutoRent AI.",

    // CTA
    ctaTitle: "Ready to get started?",
    ctaDesc:
      "Join thousands of renters and fleet owners using the smartest car rental platform in Egypt.",
    createAccount: "Create Free Account",
    trySnap: "📸 Try Snap & Identify",

    // Footer
    footerTagline: "Egypt's smartest car rental platform powered by Gemini AI.",
    aiTools: "AI Tools",
    platform: "Platform",
    footerRights: "© 2026 AutoRent AI. All rights reserved.",

    // Fleet page
    browseOurFleet: "Browse Our Fleet",
    availableVehicles: "available vehicles ready to rent",
    searchPlaceholder: "Search by make (Toyota, BMW…)",
    all: "All",
    economy: "🚗 Economy",
    standard: "🚙 Standard",
    luxury: "🏎️ Luxury",
    suv: "🚐 SUV",
    van: "🚌 Van",
    noVehiclesFound: "No vehicles found",
    tryAdjustingFilters: "Try adjusting your filters.",
    perDay: "/ day",
    deposit: "Deposit",

    // Vehicle card
    available: "available",
    rented: "rented",
    maintenance: "maintenance",

    // Auth
    welcomeBack: "Welcome back",
    signInSubtitle: "Sign in to your account",
    email: "Email",
    password: "Password",
    fullName: "Full Name",
    signingIn: "Signing in…",
    creatingAccount: "Creating account…",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    createAccountTitle: "Create your account",
    createAccountSubtitle: "Start renting or listing vehicles today",
    iAmA: "I am a…",
    renterRole: "🙋 Renter",
    ownerRole: "🏢 Fleet Owner",
    checkEmail: "Check Your Email",
    accountCreated: "Account Created!",
    goToLogin: "Go to Login",
    redirecting: "Redirecting to your dashboard…",
    verificationEmailSent:
      "We've sent a verification link to your email address. Please click the link to activate your account.",
    passwordRequirements: "Min. 10 chars, uppercase, number, symbol",
    charMin: "At least 10 characters",
    oneUpper: "One uppercase letter",
    oneLower: "One lowercase letter",
    oneNumber: "One number",
    oneSpecial: "One special character",
    strengthenPassword: "Strengthen your password to continue",

    // WhatsApp / Quick Contact
    whatsappSupport: "WhatsApp Support",
    contactUs: "Contact Support",
    whatsappMessage:
      "Hello AutoRent AI, I would like to inquire about car rental and fleet management.",

    // Damage Scanner Page
    damageHeader: "AI Damage Assessment",
    damagePageTitle: "🔍 AI Damage Scanner",
    damagePageDesc:
      "Upload a photo of any vehicle and our AI will detect damage, estimate repair costs, and recommend deposit actions.",
    damageDropzone: "Drop a car photo to scan for damage",
    damageDropzoneSub: "Front, rear, left, or right angles work best",
    scanForDamage: "🛡️ Scan for Damage",
    damageAnalyzing: "AI is analyzing the vehicle for damage…",
    damageAnalyzingSub: "Checking for scratches, dents, cracks, and more",
    noDamageDetected: "No Damage Detected! Vehicle in excellent condition.",
    damageDetectedTitle: "Damage Detected",
    confidence: "confidence",
    estimatedRepair: "Total Estimated Repair Cost",
    depositAction: "Deposit Recommendation",
    repairRecommendations: "AI Repair Recommendations & Tips",
    tryAgain: "Scan Another Photo",
    fullRefund: "Full Refund (100%)",
    partialDeduction: "Partial Deduction",
    fullConfiscation: "Full Confiscation",
    zone: "Zone",
    severity: "Severity",
    cost: "Estimated Cost",
    minor: "Minor",
    moderate: "Moderate",
    severe: "Severe",

    // Snap & Identify Page
    snapHeader: "Powered by Gemini AI",
    snapPageTitle: "📸 Snap & Identify",
    snapPageDesc:
      "Photograph any car and instantly discover its make, model, market value, and rental rate in Egypt.",
    snapDropzone: "Drop a car photo here, or click to upload / take a photo",
    snapDropzoneSub: "Clear angle showing the car works best",
    identifyCarBtn: "🤖 Identify Car",
    snapAnalyzing: "Gemini Vision is analyzing the car…",
    snapAnalyzingSub: "Identifying make, model, year, and market rate in EGP",
    marketValuation: "Estimated Market Value",
    dailyRentalRate: "Estimated Daily Rental",
    vehicleSpecs: "Vehicle Specifications",
    funFactTitle: "💡 Fun Fact & History",
    bodyType: "Body Type",
    transmission: "Transmission",
    fuelType: "Fuel Type",
    color: "Color",
    condition: "Condition",

    // Compare Page
    compareHeader: "AI Car Comparator",
    compareSubtitle:
      "Compare up to 3 cars side-by-side with AI analysis tailored to Egyptian roads, traffic, and fuel economy.",
    compareSelectedBtn: "⚔️ Compare Selected Cars",
    surpriseMeBtn: "🎲 Surprise Me!",
    addCarSlot: "➕ Add Car",
    selectCarPlaceholder: "Select or search a car…",
    pros: "Pros & Advantages",
    cons: "Cons & Considerations",
    bestFor: "Best For",
    aiRecommendation: "🎯 AI Recommendation",
    comparisonSummary: "Comparison Summary",
    comfortRating: "Comfort",
    valueRating: "Value for Money",
    reliabilityRating: "Reliability",
    fuelEconomy: "Fuel Economy",

    // Roadtrip Planner Page
    roadtripHeader: "Egypt Roadtrip Planner",
    roadtripSubtitle:
      "Plan your trip across Egypt with smart fuel calculations, optimal route itineraries, and vehicle recommendations.",
    departureCity: "Departure City",
    destinationCity: "Destination",
    tripDuration: "Trip Duration (Days)",
    passengersCount: "Passengers",
    drivingStyle: "Driving Style",
    relaxedDriving: "Relaxed & Scenic",
    balancedDriving: "Balanced",
    fastDriving: "Express & Fast",
    planRoadtripBtn: "🚗 Plan Roadtrip with AI",
    planningTrip: "Calculating routes, fuel costs, and Egyptian scenic spots…",
    itineraryTitle: "🗺️ Day-by-Day Itinerary",
    recommendedVehicle: "Recommended Car for this Trip",
    estimatedFuelCost: "Estimated Fuel Cost",
    playlistVibe: "🎵 Recommended Music & Vibe",
    travelTips: "💡 Egyptian Road Trip Tips",

    // AI Chat Widget
    chatAdvisorTitle: "AutoRent AI Advisor",
    chatAdvisorSubtitle: "Online • Powered by Gemini",
    chatGreeting:
      "Hey! 👋 I'm your AutoRent AI Advisor. Ask me anything about cars, rental prices in Egypt, or which vehicle is right for your trip!",
    chatPlaceholder: "Ask about any car, price, or trip…",
    chatSend: "Send",
    chatError: "Sorry, I encountered an issue. Please try again! 🔧",

    // Fleet Details & Booking
    backToFleet: "← Back to Fleet",
    vehicleNotFound: "Vehicle Not Found",
    dailyRateLabel: "Daily Rate",
    depositLabelText: "Refundable Deposit",
    plateLabel: "Plate Number",
    specsLabel: "Specifications",
    bookNowBtn: "Book This Car",
    checkoutTitle: "Complete Your Reservation",

    // Dashboard
    dashboardTitle: "Dashboard",
    ownerApprovalsTab: "Rental Approvals",
    activeRentalsTab: "Active Rentals",
    myFleetTab: "My Fleet",
    damageReportsTab: "Damage Reports",
    myBookingsTab: "My Bookings",
    totalEarnings: "Total Earnings",
    activeRentalsStat: "Active Rentals",
    pendingRequestsStat: "Pending Requests",
    approveBtn: "✅ Approve",
    declineBtn: "❌ Decline",
    completeRentalBtn: "🏁 Complete Rental",
    pleaseSignIn: "Please sign in",
    needAccount: "You need an account to access the dashboard.",
  },

  ar: {
    // Navbar
    home: "الرئيسية",
    browseFleet: "تصفح الأسطول",
    snapId: "التعرف بالصورة",
    damageScan: "فحص الأضرار",
    compare: "مقارنة السيارات",
    roadtrip: "رحلة طويلة",
    map: "الخريطة",
    dashboard: "لوحة التحكم",
    signIn: "تسجيل الدخول",
    getStarted: "ابدأ الآن",
    signOut: "تسجيل الخروج",
    fleetOwner: "مالك الأسطول",
    renter: "مستأجر",
    ownerDashboard: "لوحة تحكم المالك",
    myDashboard: "لوحة تحكمي",
    manageFleet: "إدارة الأسطول",
    browseVehicles: "تصفح السيارات",

    // Hero
    poweredBy: "مدعوم بذكاء Gemini",
    heroTitle1: "استأجر بذكاء.",
    heroTitle2: "أعد بأمان.",
    heroDesc:
      "المنصة الوحيدة لتأجير السيارات مع تقييم الأضرار بالذكاء الاصطناعي، وتحديد المركبات فورياً، ومقارنة ذكية للسيارات. بدون نزاعات. بدون مفاجآت.",
    browseFleetBtn: "تصفح السيارات",
    snapIdentify: "📸 التقط وتعرف",

    // AI Features
    aiFeaturesTitle: "🧠 مزايا الذكاء الاصطناعي",
    aiFeaturesDesc: "أربعة أدوات ذكية تجعل تأجير السيارات سهلاً وآمناً.",
    snapTitle: "التقط وتعرف",
    snapDesc:
      "وجّه كاميرتك نحو أي سيارة في الشارع. يتعرف Gemini AI فوراً على الماركة والموديل والسنة ويخبرك بقيمتها السوقية وسعر تأجيرها في مصر.",
    snapBadge: "رؤية Gemini",
    damageTitle: "فاحص الأضرار بالذكاء الاصطناعي",
    damageDesc:
      "ارفع صورة لأي مركبة وسيكتشف الذكاء الاصطناعي الخدوش والحفر والشقوق — ويقدر تكاليف الإصلاح ويوصي بإجراءات الوديعة تلقائياً.",
    damageBadge: "رؤية حاسوبية",
    compareTitle: "مقارن السيارات الذكي",
    compareDesc:
      "قارن ما يصل إلى 3 سيارات جنباً إلى جنب. يحلل الذكاء الاصطناعي الراحة والقيمة والموثوقية واقتصاد الوقود وفقاً لطرق مصر وأسعار الوقود.",
    compareBadge: "تحليل ذكي",
    advisorTitle: "مستشار السيارات الذكي",
    advisorDesc:
      "تحدث مع مساعدنا الذكي في الزاوية السفلى من أي صفحة. اسأل عن الأسعار، أو احصل على توصيات، أو تعرف على أي موديل سيارة.",
    advisorBadge: "ذكاء اصطناعي محادثاتي",

    // Classic Features
    whyTitle: "لماذا AutoRent AI؟",
    whyDesc: "تقنية متطورة تلتقي بتجربة تأجير سلسة وعادلة.",
    feature1Title: "تحديثات فورية",
    feature1Desc:
      "تصلك تقارير الأضرار وقرارات الوديعة فور صدورها على شاشتك مباشرة.",
    feature2Title: "أمان على مستوى الصفوف",
    feature2Desc:
      "بياناتك لك وحدك. تضمن سياسات الحماية أن يرى المستأجرون عقودهم فقط والملاك أسطولهم فقط.",
    feature3Title: "مدفوعات آلية",
    feature3Desc:
      "تتم معالجة حجز الودائع والمبالغ المستردة والخصومات تلقائياً في نهاية كل إيجار.",

    // Stats
    vehiclesListed: "سيارة مدرجة",
    damageAccuracy: "دقة كشف الأضرار",
    aiTime: "وقت تحليل الذكاء الاصطناعي",
    rentalsCompleted: "إيجار مكتمل",

    // How it works
    howItWorks: "كيف يعمل؟",
    step1Title: "تصفح واحجز",
    step1Desc: "اختر من بين مئات المركبات الموثقة. ادفع بأمان مع حجز الوديعة.",
    step2Title: "استلم وانطلق",
    step2Desc:
      "التقط صوراً قبل الاستئجار عبر التطبيق. يتم تخزينها بأمان في Supabase.",
    step3Title: "أعد وتسوّ",
    step3Desc:
      "ارفع 4 صور عند الإعادة. يقيّم الذكاء الاصطناعي الأضرار في ثوانٍ وتتم تسوية وديعتك تلقائياً.",

    // Reviews
    reviewsTitle: "ماذا يقول أصحاب الأساطيل",
    reviewsDesc: "تقييمات موثقة من أصحاب الأساطيل في مصر يثقون بـ AutoRent AI.",

    // CTA
    ctaTitle: "هل أنت مستعد للبدء؟",
    ctaDesc:
      "انضم إلى آلاف المستأجرين وأصحاب الأساطيل الذين يستخدمون أذكى منصة لتأجير السيارات في مصر.",
    createAccount: "أنشئ حساباً مجانياً",
    trySnap: "📸 جرب التقط وتعرف",

    // Footer
    footerTagline: "أذكى منصة لتأجير السيارات في مصر مدعومة بـ Gemini AI.",
    aiTools: "أدوات الذكاء الاصطناعي",
    platform: "المنصة",
    footerRights: "© 2026 AutoRent AI. جميع الحقوق محفوظة.",

    // Fleet page
    browseOurFleet: "تصفح أسطولنا",
    availableVehicles: "سيارة متاحة للإيجار الآن",
    searchPlaceholder: "ابحث بالماركة (تويوتا، BMW، هيونداي…)",
    all: "الكل",
    economy: "🚗 اقتصادي",
    standard: "🚙 عادي",
    luxury: "🏎️ فاخر",
    suv: "🚐 دفع رباعي",
    van: "🚌 فان",
    noVehiclesFound: "لا توجد سيارات مطابقة",
    tryAdjustingFilters: "حاول تغيير كلمات البحث أو الفلاتر.",
    perDay: "/ يوم",
    deposit: "الوديعة",

    // Vehicle card
    available: "متاح",
    rented: "مستأجر",
    maintenance: "صيانة",

    // Auth
    welcomeBack: "مرحباً بعودتك",
    signInSubtitle: "سجّل الدخول إلى حسابك",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    fullName: "الاسم بالكامل",
    signingIn: "جارٍ تسجيل الدخول…",
    creatingAccount: "جارٍ إنشاء الحساب…",
    dontHaveAccount: "ليس لديك حساب؟",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    createAccountTitle: "أنشئ حسابك",
    createAccountSubtitle: "ابدأ في استئجار السيارات أو إدراج أسطولك اليوم",
    iAmA: "أنا...",
    renterRole: "🙋 مستأجر",
    ownerRole: "🏢 مالك أسطول",
    checkEmail: "تحقق من بريدك الإلكتروني",
    accountCreated: "تم إنشاء الحساب بنجاح!",
    goToLogin: "الذهاب لتسجيل الدخول",
    redirecting: "جارٍ التحويل إلى لوحة التحكم...",
    verificationEmailSent:
      "أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى الضغط على الرابط لتفعيل حسابك.",
    passwordRequirements: "على الأقل 10 خانات، حرف كبير، رقم، ورمز",
    charMin: "10 خانات على الأقل",
    oneUpper: "حرف كبير واحد",
    oneLower: "حرف صغير واحد",
    oneNumber: "رقم واحد",
    oneSpecial: "رمز خاص واحد",
    strengthenPassword: "قم بتقوية كلمة المرور للمتابعة",

    // WhatsApp / Quick Contact
    whatsappSupport: "دعم واتساب",
    contactUs: "تواصل مع الدعم",
    whatsappMessage:
      "مرحباً AutoRent AI، أود الاستفسار بخصوص تأجير السيارات وإدارة الأسطول.",

    // Damage Scanner Page
    damageHeader: "تقييم الأضرار بالذكاء الاصطناعي",
    damagePageTitle: "🔍 فاحص أضرار السيارات",
    damagePageDesc:
      "ارفع صورة لأي سيارة وسيقوم الذكاء الاصطناعي باكتشاف الأضرار، وتقدير تكاليف الإصلاح بالجنيه المصري، وتوصيات الوديعة.",
    damageDropzone: "اسحب صورة السيارة هنا للفحص، أو اضغط للرفع",
    damageDropzoneSub: "أفضل الزوايا: الأمام، الخلف، الجانب الأيمن أو الأيسر",
    scanForDamage: "🛡️ فحص الأضرار الآن",
    damageAnalyzing: "الذكاء الاصطناعي يحلل أضرار السيارة…",
    damageAnalyzingSub: "جارٍ فحص الخدوش، الصدمات، الشروخ وحالة الطلاء",
    noDamageDetected: "لم يتم اكتشاف أي أضرار! السيارة في حالة ممتازة.",
    damageDetectedTitle: "تم اكتشاف أضرار في السيارة",
    confidence: "دقة التقييم",
    estimatedRepair: "إجمالي تكلفة الإصلاح المتوقعة",
    depositAction: "توصية الوديعة المالية",
    repairRecommendations: "نصائح وتوصيات الإصلاح من الذكاء الاصطناعي",
    tryAgain: "فحص صورة أخرى",
    fullRefund: "استرداد الوديعة كاملاً (100%)",
    partialDeduction: "خصم جزئي من الوديعة",
    fullConfiscation: "حجز الوديعة كاملاً",
    zone: "المنطقة",
    severity: "الشدة",
    cost: "التكلفة المتوقعة",
    minor: "بسيط",
    moderate: "متوسط",
    severe: "شديد",

    // Snap & Identify Page
    snapHeader: "مدعوم بذكاء Gemini AI",
    snapPageTitle: "📸 التقط وتعرف على السيارة",
    snapPageDesc:
      "صوّر أي سيارة في الشارع واكتشف فوراً ماركتها، وموديلها، وسعر تأجيرها وقيمتها السوقية في مصر.",
    snapDropzone: "اسحب صورة السيارة هنا، أو اضغط للرفع أو التقاط صورة",
    snapDropzoneSub: "صورة واضحة تظهر السيارة بالكامل تعطي أدق نتيجة",
    identifyCarBtn: "🤖 تعرف على السيارة بالذكاء الاصطناعي",
    snapAnalyzing: "جاري تحليل صورة السيارة عبر رؤية Gemini…",
    snapAnalyzingSub: "التعرف على الماركة، الموديل، السنة والسعر بالجنيه المصري",
    marketValuation: "القيمة السوقية التقريبية",
    dailyRentalRate: "سعر الإيجار اليومي المتوقع",
    vehicleSpecs: "مواصفات المركبة",
    funFactTitle: "💡 معلومة شيقة وتاريخ السيارة",
    bodyType: "نوع الهيكل",
    transmission: "ناقل الحركة",
    fuelType: "نوع الوقود",
    color: "اللون",
    condition: "الحالة التقديرية",

    // Compare Page
    compareHeader: "مقارن السيارات الذكي",
    compareSubtitle:
      "قارن بين ما يصل إلى 3 سيارات جنباً إلى جنب مع تحليل ذكي ملائم للطرق وأسعار الوقود وحركة المرور في مصر.",
    compareSelectedBtn: "⚔️ مقارنة السيارات المختارة",
    surpriseMeBtn: "🎲 اختر سيارات عشوائية!",
    addCarSlot: "➕ إضافة سيارة",
    selectCarPlaceholder: "اختر أو ابحث عن سيارة…",
    pros: "المميزات ونقاط القوة",
    cons: "العيوب والملاحظات",
    bestFor: "الأنسب لـ",
    aiRecommendation: "🎯 ترشيح الذكاء الاصطناعي النهائي",
    comparisonSummary: "ملخص المقارنة",
    comfortRating: "الراحة",
    valueRating: "القيمة مقابل السعر",
    reliabilityRating: "الاعتمادية",
    fuelEconomy: "اقتصاد الوقود",

    // Roadtrip Planner Page
    roadtripHeader: "مخطط رحلات الطرق في مصر",
    roadtripSubtitle:
      "خطط لرحلتك البرية عبر مصر مع حسابات استهلاك الوقود الذكية، وتفاصيل المسار، وترشيح السيارة المثالية.",
    departureCity: "مدينة الانطلاق",
    destinationCity: "الوجهة",
    tripDuration: "مدة الرحلة (أيام)",
    passengersCount: "عدد الركاب",
    drivingStyle: "أسلوب القيادة",
    relaxedDriving: "مريح وهادئ مع مناظر طبيعية",
    balancedDriving: "متوازن",
    fastDriving: "سريع ومباشر",
    planRoadtripBtn: "🚗 تخطيط الرحلة بالذكاء الاصطناعي",
    planningTrip: "جارٍ حساب المسارات، تكاليف الوقود، وأجمل معالم الطريق في مصر…",
    itineraryTitle: "🗺️ خطة الرحلة يوماً بيوم",
    recommendedVehicle: "السيارة المقترحة لهذه الرحلة",
    estimatedFuelCost: "تكلفة الوقود التقديرية",
    playlistVibe: "🎵 الموسيقى وأجواء الرحلة",
    travelTips: "💡 نصائح مهمة للقيادة على طرق مصر",

    // AI Chat Widget
    chatAdvisorTitle: "مستشار AutoRent الذكي",
    chatAdvisorSubtitle: "متصل الآن • مدعوم بـ Gemini",
    chatGreeting:
      "أهلاً بك! 👋 أنا مستشارك الذكي في AutoRent. اسألني عن أي سيارة، أو أسعار الإيجار في مصر، أو أفضل سيارة تناسب رحلتك!",
    chatPlaceholder: "اسأل عن أي سيارة، سعر إيجار، أو رحلة...",
    chatSend: "إرسال",
    chatError: "عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى! 🔧",

    // Fleet Details & Booking
    backToFleet: "← العودة إلى الأسطول",
    vehicleNotFound: "السيارة غير موجودة",
    dailyRateLabel: "السعر اليومي",
    depositLabelText: "الوديعة المستردة",
    plateLabel: "رقم اللوحة",
    specsLabel: "المواصفات",
    bookNowBtn: "احجز هذه السيارة",
    checkoutTitle: "إتمام الحجز",

    // Dashboard
    dashboardTitle: "لوحة التحكم",
    ownerApprovalsTab: "طلبات الإيجار والموافقات",
    activeRentalsTab: "الإيجارات النشطة",
    myFleetTab: "أسطول سياراتي",
    damageReportsTab: "تقارير فحص الأضرار",
    myBookingsTab: "حجوزاتي",
    totalEarnings: "إجمالي الأرباح",
    activeRentalsStat: "الإيجارات الحالية",
    pendingRequestsStat: "الطلبات المعلقة",
    approveBtn: "✅ قبول",
    declineBtn: "❌ رفض",
    completeRentalBtn: "🏁 إنهاء الإيجار واستلام السيارة",
    pleaseSignIn: "يرجى تسجيل الدخول",
    needAccount: "تحتاج إلى تسجيل الدخول للوصول إلى لوحة التحكم.",
  },
};
