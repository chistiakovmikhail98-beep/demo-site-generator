'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Niche } from '../types';
import { getNichePreset } from './niches';
import { getDefaultBlocks } from './block-definitions';

export interface StudioInfo {
  name: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  telegram: string;
  vk: string;
  instagram: string;
  whatsapp: string;
}

export interface BuilderState {
  // Current step (0-6)
  step: number;

  // Step 0: Niche
  niche: Niche | null;

  // Step 1: Blocks
  selectedBlocks: string[];
  blockVariants: Record<string, 1 | 2 | 3>;

  // Step 2: Brief
  studioInfo: StudioInfo;
  heroTitle: string;
  heroSubtitle: string;
  pricingInfo: string;

  // Step 3: Design
  colorPresetId: string;
  customColors: { primary: string; accent: string } | null;
  typographyPresetId: string;

  // Step 5: Registration
  regEmail: string;
  regPhone: string;

  // Existing project (editing mode via "Доработать")
  existingProjectSlug: string | null;
  existingProjectId: string | null;

  // Result
  createdProjectSlug: string | null;
  createdPassword: string | null;
}

export interface BuilderActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setNiche: (niche: Niche) => void;

  toggleBlock: (blockId: string) => void;
  setBlockVariant: (blockId: string, variant: 1 | 2 | 3) => void;

  updateStudioInfo: (info: Partial<StudioInfo>) => void;
  setHeroTitle: (title: string) => void;
  setHeroSubtitle: (subtitle: string) => void;
  setPricingInfo: (info: string) => void;

  setColorPreset: (id: string) => void;
  setCustomColors: (colors: { primary: string; accent: string } | null) => void;
  setTypographyPreset: (id: string) => void;

  setRegEmail: (email: string) => void;
  setRegPhone: (phone: string) => void;

  setCreatedProject: (slug: string, password: string) => void;

  loadFromProject: (state: Partial<BuilderState>, slug: string, projectId: string) => void;
  reset: () => void;
}

const INITIAL_STUDIO: StudioInfo = {
  name: '', city: '', phone: '', email: '', address: '', description: '',
  telegram: '', vk: '', instagram: '', whatsapp: '',
};

const initialState: BuilderState = {
  step: 0,
  niche: null,
  selectedBlocks: getDefaultBlocks(),
  blockVariants: {},
  studioInfo: { ...INITIAL_STUDIO },
  heroTitle: '',
  heroSubtitle: '',
  pricingInfo: '',
  colorPresetId: 'neon-rose',
  customColors: null,
  typographyPresetId: 'modern',
  regEmail: '',
  regPhone: '',
  existingProjectSlug: null,
  existingProjectId: null,
  createdProjectSlug: null,
  createdPassword: null,
};

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 6) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

      setNiche: (niche) => {
        const preset = getNichePreset(niche);
        set({
          niche,
          heroTitle: preset.defaultSlogan,
        });
      },

      toggleBlock: (blockId) => set((s) => {
        const idx = s.selectedBlocks.indexOf(blockId);
        if (idx >= 0) {
          return { selectedBlocks: s.selectedBlocks.filter(b => b !== blockId) };
        }
        return { selectedBlocks: [...s.selectedBlocks, blockId] };
      }),

      setBlockVariant: (blockId, variant) => set((s) => ({
        blockVariants: { ...s.blockVariants, [blockId]: variant },
      })),

      updateStudioInfo: (info) => set((s) => ({
        studioInfo: { ...s.studioInfo, ...info },
      })),

      setHeroTitle: (heroTitle) => set({ heroTitle }),
      setHeroSubtitle: (heroSubtitle) => set({ heroSubtitle }),
      setPricingInfo: (pricingInfo) => set({ pricingInfo }),

      setColorPreset: (colorPresetId) => set({ colorPresetId, customColors: null }),
      setCustomColors: (customColors) => set({ customColors, colorPresetId: 'custom' }),
      setTypographyPreset: (typographyPresetId) => set({ typographyPresetId }),

      setRegEmail: (regEmail) => set({ regEmail }),
      setRegPhone: (regPhone) => set({ regPhone }),

      setCreatedProject: (slug, password) => set({
        createdProjectSlug: slug,
        createdPassword: password,
      }),

      loadFromProject: (state, slug, projectId) => set({
        ...initialState,
        ...state,
        existingProjectSlug: slug,
        existingProjectId: projectId,
        step: state.step ?? 1,
      }),

      reset: () => set(initialState),
    }),
    {
      name: 'fitwebai-builder',
      version: 1,
    }
  )
);
