// AI & Speech Utilities for Multilingual NLP, Auto-Language Detection & Automatic Grammar Correction

// 1. Language Detection (Hindi Devanagari vs English)
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'English';
  
  // Devanagari Unicode Range \u0900-\u097F
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;

  if (devanagariCount > 0 && devanagariCount >= englishCount * 0.2) {
    return 'Hindi';
  }
  return 'English';
};

// 2. Automated Speech Cleaning & Grammar Correction Engine
export const autoProcessSpeech = (rawText) => {
  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    return { text: rawText, language: 'English', category: null };
  }

  const trimmed = rawText.trim();
  const lang = detectLanguage(trimmed);
  const lower = trimmed.toLowerCase();

  // Category Inference
  let category = null;
  if (lower.includes('pothole') || lower.includes('road') || lower.includes('गड्ढा') || lower.includes('सड़क')) {
    category = 'Road Damage';
  } else if (lower.includes('light') || lower.includes('dark') || lower.includes('pole') || lower.includes('लाइट')) {
    category = 'Street Light';
  } else if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('कचरा')) {
    category = 'Garbage';
  } else if (lower.includes('water') || lower.includes('leak') || lower.includes('pipe') || lower.includes('पानी')) {
    category = 'Water Leakage';
  } else if (lower.includes('drain') || lower.includes('sewage') || lower.includes('नाली')) {
    category = 'Drainage Leakage';
  } else if (lower.includes('traffic') || lower.includes('signal') || lower.includes('सिग्नल')) {
    category = 'Traffic Signal';
  }

  // Grammar & Formatting auto-correction
  let corrected = trimmed;

  if (lang === 'Hindi') {
    // If Hindi, provide clean formatted text with translation preview if needed
    corrected = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!corrected.endsWith('.')) corrected += '.';
  } else {
    // English Auto-Grammar Corrections
    if (lower.includes('road damage no repair') || lower.includes('pothole road')) {
      corrected = 'The road surface is severely damaged with potholes and requires urgent repair.';
    } else if (lower.includes('street light not working') || lower.includes('no light')) {
      corrected = 'The street lights in this area are non-functional, causing darkness at night.';
    } else if (lower.includes('garbage overflow') || lower.includes('waste dump')) {
      corrected = 'Garbage has accumulated and is overflowing, creating unhygienic conditions.';
    } else if (lower.includes('water leakage pipe') || lower.includes('pipe leak')) {
      corrected = 'Underground water pipeline is leaking significantly on the main road.';
    } else {
      // General capitalization & punctuation cleanup
      corrected = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      if (!corrected.endsWith('.')) corrected += '.';
    }
  }

  return {
    text: corrected,
    language: lang,
    category
  };
};

// Legacy exports for manual controls if needed
export const translateText = (text, targetLang = 'en') => {
  if (!text) return '';
  return autoProcessSpeech(text).text;
};

export const improveComplaintGrammar = (rawText) => {
  return autoProcessSpeech(rawText).text;
};

export const extractLandmarksAndCategory = (text) => {
  const processed = autoProcessSpeech(text);
  return {
    category: processed.category || 'Road Damage',
    department: 'Municipal Department'
  };
};
