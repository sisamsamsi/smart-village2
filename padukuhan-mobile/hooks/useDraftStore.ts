import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Draft {
  id: string;
  type: 'warga' | 'mutasi';
  label: string; // e.g. "Budi (NIK: 34021...)" or "Mutasi Kematian - Ani"
  data: any;
  createdAt: string;
}

interface DraftState {
  drafts: Draft[];
  addDraft: (type: 'warga' | 'mutasi', label: string, data: any) => void;
  deleteDraft: (id: string) => void;
  clearDrafts: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      drafts: [],
      addDraft: (type, label, data) => set((state) => ({
        drafts: [
          ...state.drafts,
          {
            id: Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
            type,
            label,
            data,
            createdAt: new Date().toISOString(),
          }
        ]
      })),
      deleteDraft: (id) => set((state) => ({
        drafts: state.drafts.filter((d) => d.id !== id)
      })),
      clearDrafts: () => set({ drafts: [] }),
    }),
    {
      name: 'smart-village-drafts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
