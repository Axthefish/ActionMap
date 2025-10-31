"use client";

import { useLanguageStore } from '@/lib/store/languageStore';

export default function LanguageToggle() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  return (
    <div className="flex items-center gap-1 rounded-lg bg-foreground/10 backdrop-blur px-1 py-1 border border-white/10">
      <button
        className={`px-2 py-1 rounded-md text-sm ${language === 'en' ? 'bg-foreground text-background' : 'text-foreground/80 hover:text-foreground'}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded-md text-sm ${language === 'zh' ? 'bg-foreground text-background' : 'text-foreground/80 hover:text-foreground'}`}
        onClick={() => setLanguage('zh')}
      >
        中文
      </button>
    </div>
  );
}


