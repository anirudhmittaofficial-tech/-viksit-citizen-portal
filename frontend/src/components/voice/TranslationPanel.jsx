import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Check } from 'lucide-react';
import { translateText, detectLanguage } from '../../utils/aiSpeechUtils';

export default function TranslationPanel({ originalText, onApplyTranslation }) {
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en'); // 'en' | 'hi'
  const [isTranslated, setIsTranslated] = useState(false);

  if (!originalText || originalText.trim().length === 0) return null;

  const currentDetectedLang = detectLanguage(originalText);

  const handleTranslate = () => {
    const target = currentDetectedLang === 'Hindi' ? 'en' : 'hi';
    setTargetLang(target);
    const result = translateText(originalText, target);
    setTranslatedText(result);
    setIsTranslated(true);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginBottom: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Languages size={18} color="#0F4C81" />
          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
            One-Click Multilingual Translation (Hindi ⟷ English)
          </strong>
        </div>

        <button
          type="button"
          onClick={handleTranslate}
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem', color: '#0F4C81', borderColor: '#0F4C81' }}
        >
          <ArrowRightLeft size={14} /> Translate ({currentDetectedLang === 'Hindi' ? 'To English' : 'To हिन्दी'})
        </button>
      </div>

      {isTranslated && (
        <div>
          {/* Side-by-Side Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '0.85rem' }}>
            
            {/* Original Card */}
            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#64748b', marginBottom: '0.4rem' }}>
                ORIGINAL ({currentDetectedLang})
              </div>
              <p style={{ fontSize: '0.9rem', color: '#0f172a', margin: 0, lineHeight: 1.5 }}>
                {originalText}
              </p>
            </div>

            {/* Translated Card */}
            <div style={{ backgroundColor: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#0369a1', marginBottom: '0.4rem' }}>
                TRANSLATED ({targetLang === 'en' ? 'English' : 'हिन्दी'})
              </div>
              <p style={{ fontSize: '0.9rem', color: '#0F4C81', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                {translatedText}
              </p>
            </div>

          </div>

          {onApplyTranslation && (
            <button
              type="button"
              onClick={() => onApplyTranslation(translatedText)}
              className="btn btn-outline"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem', color: '#166534', borderColor: '#86efac', backgroundColor: '#f0fdf4' }}
            >
              <Check size={14} /> Use Translated Text in Complaint Form
            </button>
          )}
        </div>
      )}
    </div>
  );
}
