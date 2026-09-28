"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeMode = "night" | "day";
type Language = "en" | "ur";

interface AppContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isPro: boolean;
  activatePro: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    home: "Home",
    checker: "Instant Checker",
    denominations: "Bond Draws",
    currencyRates: "Currency Rates",
    faq: "FAQ",
    signIn: "Sign In",
    launchApp: "Launch App",
    whatsapp: "WhatsApp",
    aiChatbot: "AI Chatbot",

    // Hero
    heroBadge: "Pakistan's #1 Prize Bond & Live Currency Terminal • 2026 Edition",
    heroTitle1: "Track Your Prize Bonds.",
    heroTitle2: "Never Miss A Million.",
    heroDesc: "Instant draw checker, live visual financial analytics, Gemini AI vision scanner, and real-time PKR currency exchange rates — all in one modern terminal.",
    getStartedFree: "Get Started Free",
    exploreCharts: "Explore Live Charts",

    // Checker
    checkerTitle: "Instant Prize Bond Draw Checker",
    checkerSubtitle: "Official database synchronized with National Savings of Pakistan",
    bondDenomination: "Bond Denomination",
    bondNumberLabel: "6-Digit Bond Serial Number",
    tryDemo: "Try winning demo (482671)",
    checkNow: "Check 12 Official Draws",
    checking: "Checking Draws...",
    freeLookup: "Free instant lookup. No registration needed.",

    // Charts & Rates
    chartTerminalTitle: "2026 Interactive Financial Terminal",
    currencyHistory: "Currency Rate History",
    prizePools: "Prize Pools by Denomination",
    portfolioSim: "Portfolio Growth Simulator",
    winnerDist: "Winner Distribution",
    converterTitle: "Instant PKR Currency Converter",
    youSend: "You Send / Convert",
    youReceive: "You Receive (Estimated PKR)",
    officialDenominations: "Official Bond Denominations & Prizes",
    faqTitle: "Frequently Asked Questions",

    // Pro Features
    proFeatures: "Pro Features",
    proDesc: "Unlimited bonds, live alerts & advanced analytics",
    unlockPro: "Unlock VIP Pro",
    proActivated: "VIP Pro Active",
    proBadge: "VIP PRO",
    freeTier: "Free Account",
    upgradeToPro: "Upgrade to VIP Pro",
    activateProTrial: "Activate Free VIP Pro Trial",

    // Dashboard
    dashboard: "Dashboard",
    myBonds: "My Bonds",
    currency: "Currency",
    aiAssistant: "AI Assistant",
    analytics: "Analytics",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    signOut: "Sign Out",

    // Modes
    nightMode: "Night Mode",
    dayMode: "Day Mode",
  },
  ur: {
    // Nav
    home: "ہوم",
    checker: "فوری چیکر",
    denominations: "بانڈ ڈراز",
    currencyRates: "کرنسی ریٹس",
    faq: "عام سوالات",
    signIn: "لاگ ان",
    launchApp: "ایپ کھولیں",
    whatsapp: "واٹس ایپ",
    aiChatbot: "اے آئی چیٹ بوٹ",

    // Hero
    heroBadge: "پاکستان کا نمبر 1 پرائز بانڈ اور لائیو کرنسی ٹرمینل • 2026 ایڈیشن",
    heroTitle1: "اپنے پرائز بانڈز محفوظ کریں۔",
    heroTitle2: "ایک ملین کا انعام کبھی مت چھوڑیں۔",
    heroDesc: "فوری قرعہ اندازی چیکر، لائیو مالیاتی تجزیات، اور ریئل ٹائم روپے کی شرح مبادلہ — سب ایک جدید ٹرمینل میں۔",
    getStartedFree: "مفت اکاؤنٹ بنائیں",
    exploreCharts: "لائیو چارٹس دیکھیں",

    // Checker
    checkerTitle: "فوری پرائز بانڈ رزلٹ چیکر",
    checkerSubtitle: "قومی بچت پاکستان کا باضابطہ تصدیق شدہ ڈیٹا",
    bondDenomination: "بانڈ کی مالیت",
    bondNumberLabel: "6 ہندسوں کا بانڈ نمبر",
    tryDemo: "جیتنے والا ڈیمو چیک کریں (482671)",
    checkNow: "12 سرکاری قرعہ اندازیاں چیک کریں",
    checking: "چیک کیا جا رہا ہے...",
    freeLookup: "فوری اور مفت تلاش۔ بغیر کسی رجسٹریشن کے۔",

    // Charts & Rates
    chartTerminalTitle: "2026 انٹرایکٹو فنانشل ٹرمینل",
    currencyHistory: "کرنسی ریٹ کی تاریخ",
    prizePools: "انعامی رقم بلحاظ مالیت",
    portfolioSim: "پورٹ فولیو سمولیٹر",
    winnerDist: "انعامات کی تقسیم",
    converterTitle: "فوری روپیہ کرنسی کنورٹر",
    youSend: "آپ تبدیل کریں",
    youReceive: "موصول ہونے والی رقم (روپے)",
    officialDenominations: "تمام پرائز بانڈز اور انعامی شیڈول",
    faqTitle: "اکثر پوچھے جانے والے سوالات",

    // Pro Features
    proFeatures: "پرو فیچرز",
    proDesc: "لامحدود بانڈز، لائیو الرٹس اور جدید تجزیات",
    unlockPro: "وی آئی پی پرو انلاک کریں",
    proActivated: "وی آئی پی پرو فعال ہے",
    proBadge: "وی آئی پی پرو",
    freeTier: "مفت اکاؤنٹ",
    upgradeToPro: "وی آئی پی پرو میں اپ گریڈ کریں",
    activateProTrial: "مفت وی آئی پی پرو ٹرائل فعال کریں",

    // Dashboard
    dashboard: "ڈیش بورڈ",
    myBonds: "میرے بانڈز",
    currency: "کرنسی",
    aiAssistant: "اے آئی اسسٹنٹ",
    analytics: "تجزیات",
    notifications: "اطلاعات",
    profile: "پروفائل",
    settings: "سیٹنگز",
    signOut: "سائن آؤٹ",

    // Modes
    nightMode: "نائٹ موڈ",
    dayMode: "ڈے موڈ",
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("night");
  const [language, setLanguage] = useState<Language>("en");
  const [isPro, setIsPro] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme
    const savedTheme = localStorage.getItem("aura_theme") as ThemeMode | null;
    if (savedTheme && (savedTheme === "night" || savedTheme === "day")) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("night");
    }

    // Load language
    const savedLang = localStorage.getItem("aura_lang") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "ur")) {
      setLanguage(savedLang);
    }

    // Load Pro status
    const savedPro = localStorage.getItem("aura_is_pro");
    if (savedPro === "true") {
      setIsPro(true);
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === "day") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme === "night" ? "day" : "night";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem("aura_theme", nextTheme);
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("aura_lang", lang);
    if (lang === "ur") {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
    }
  };

  const toggleLanguage = () => {
    handleSetLanguage(language === "en" ? "ur" : "en");
  };

  const activatePro = () => {
    setIsPro(true);
    localStorage.setItem("aura_is_pro", "true");
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage: handleSetLanguage,
        toggleLanguage,
        isPro,
        activatePro,
        t,
      }}
    >
      <div className={language === "ur" ? "font-urdu" : ""}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
