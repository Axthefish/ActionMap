"use client";

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';
import { t } from '@/lib/i18n';
import { useBlueprintStore } from '@/lib/store/blueprintStore';

interface ResumeSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onResumed: () => void; // switch to dashboard
}

interface SessionListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  currentPosition: number;
  activeCycleIndex: number;
}

export default function ResumeSessionDialog({ open, onClose, onResumed }: ResumeSessionDialogProps) {
  const lang = useLanguageStore((s) => s.language);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SessionListItem[]>([]);
  const { setSessionState, setNarrative } = useBlueprintStore();

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/sessions');
        const data = await res.json();
        setItems(data.sessions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const handleOpen = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/session-state?id=${id}`);
      const data = await res.json();
      setSessionState(data.session_state);
      if (data.session_state.last_assessment_narrative) {
        setNarrative(data.session_state.last_assessment_narrative);
      }
      onResumed();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[640px] max-w-[90vw] rounded-2xl bg-foreground/10 backdrop-blur-xl border border-white/10 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{t(lang, 'dialog_resume_title')}</h3>
          <button className="text-foreground/70 hover:text-foreground" onClick={onClose}>{t(lang, 'close')}</button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-foreground/70">Loading...</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-foreground/60">{t(lang, 'dialog_empty')}</div>
        ) : (
          <ul className="max-h-[50vh] overflow-auto divide-y divide-white/10">
            {items.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <div className="text-sm text-foreground/80">
                  <div className="font-medium">{s.id}</div>
                  <div className="text-foreground/60">{new Date(s.updatedAt).toLocaleString()}</div>
                </div>
                <button className="px-3 py-1 rounded-md bg-foreground text-background hover:bg-foreground/90" onClick={() => handleOpen(s.id)}>
                  {t(lang, 'open')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


