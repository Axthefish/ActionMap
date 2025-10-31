"use client";

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/lib/store/languageStore';
import { t } from '@/lib/i18n';

interface ReviewSessionsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SessionListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  activeCycleIndex: number;
}

export default function ReviewSessionsDialog({ open, onClose }: ReviewSessionsDialogProps) {
  const lang = useLanguageStore((s) => s.language);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SessionListItem[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

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

  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/session-state?id=${id}`);
      const data = await res.json();
      setSelected(data.session_state);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[900px] max-w-[95vw] rounded-2xl bg-foreground/10 backdrop-blur-xl border border-white/10 p-6 grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">{t(lang, 'dialog_review_title')}</h3>
            <button className="text-foreground/70 hover:text-foreground" onClick={onClose}>{t(lang, 'close')}</button>
          </div>
          {loading ? (
            <div className="py-6 text-center text-foreground/70">Loading...</div>
          ) : (
            <ul className="max-h-[60vh] overflow-auto divide-y divide-white/10">
              {items.map((s) => (
                <li key={s.id} className="py-2 cursor-pointer hover:bg-foreground/5 px-2 rounded" onClick={() => loadSession(s.id)}>
                  <div className="text-sm text-foreground/80 font-medium">{s.id}</div>
                  <div className="text-xs text-foreground/50">{new Date(s.updatedAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="col-span-2">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-foreground/60">{t(lang, 'dialog_empty')}</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-foreground/70">Session: <span className="text-foreground">{selected.session_id}</span></div>
              <div className="text-sm text-foreground/70">Current Position: <span className="text-foreground">{selected.current_position}</span></div>
              {selected.last_assessment_narrative && (
                <div className="rounded border border-white/10 p-3 bg-foreground/5 whitespace-pre-wrap text-sm text-foreground/90 max-h-[50vh] overflow-auto">
                  {selected.last_assessment_narrative}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


