import { create } from 'zustand';

interface YearState {
  activeYear: number;
  setActiveYear: (year: number) => void;
}

export const useYearStore = create<YearState>((set) => ({
  activeYear: new Date().getFullYear(),
  setActiveYear: (activeYear) => set({ activeYear }),
}));
