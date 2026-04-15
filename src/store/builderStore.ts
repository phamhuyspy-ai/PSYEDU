import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BlockType = 'content' | 'contact' | 'single_choice' | 'multi_choice' | 'likert' | 'text' | 'matrix';

export interface Option {
  id: string;
  code: string;
  label: string;
  stored_value: string;
  score: number;
  sort_order: number;
  is_active: boolean;
}

export interface MatrixRow {
  id: string;
  code: string;
  label: string;
  sort_order: number;
  subscale_code?: string;
}

export interface MatrixColumn {
  id: string;
  code: string;
  label: string;
  input_type: 'linear' | 'checkbox' | 'text' | 'number';
  stored_value: string;
  score: number;
  sort_order: number;
}

export interface Block {
  id: string;
  type: BlockType;
  code: string;
  title: string;
  description?: string;
  help_text?: string;
  placeholder?: string;
  required: boolean;
  visible: boolean;
  sort_order: number;
  
  // Scoring
  score_enabled?: boolean;
  score_group_code?: string;
  reverse_score?: boolean;
  weight?: number;
  min_score?: number;
  max_score?: number;

  // Behavior
  validation_message?: string;
  answer_limit?: number;
  default_value?: string;

  // Options (for choice, likert)
  options?: Option[];

  // Matrix specific
  scoring_mode?: string;
  alert_rules?: string;
  rows?: MatrixRow[];
  columns?: MatrixColumn[];
}

export interface RewardConfig {
  type: 'link' | 'voucher' | 'qr' | 'file' | 'none';
  value: string;
  message: string;
}

export interface AlertConfig {
  id: string;
  min_score: number;
  max_score: number;
  message: string;
  color: string;
}

export interface EncouragementMessage {
  id: string;
  after_block_index: number;
  message: string;
  type: 'success' | 'motivation' | 'celebration';
}

export type FormType = 'assessment' | 'survey';

export interface FormMeta {
  id: string;
  code: string;
  title: string;
  description: string;
  type: FormType;
  publish_status: 'draft' | 'published';
  collection_status: 'closed' | 'open';
  
  // Scheduling
  start_date?: string;
  end_date?: string;
  
  // Result & Post-submission configs
  thank_you_message?: string;
  show_results?: boolean;
  show_radar_chart?: boolean;
  send_email?: boolean;
  reward?: RewardConfig;
  alerts?: AlertConfig[];
  encouragement_messages?: EncouragementMessage[];
}

interface BuilderState {
  forms: FormMeta[];
  form: FormMeta | null;
  blocks: Block[];
  activeBlockId: string | null;
  hasHydrated: boolean;
  
  setForms: (forms: FormMeta[]) => void;
  setForm: (form: FormMeta) => void;
  updateFormMeta: (updates: Partial<FormMeta>) => void;
  
  addBlock: (block: Omit<Block, 'id' | 'sort_order'>) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (id: string, newIndex: number) => void;
  
  setActiveBlock: (id: string | null) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set) => ({
      forms: [],
      form: null,
      blocks: [],
      activeBlockId: null,
      hasHydrated: false,

      setForms: (forms) => set({ forms }),
      setForm: (form) => set({ form }),
      updateFormMeta: (updates) => set((state) => ({ 
        form: state.form ? { ...state.form, ...updates } : null 
      })),

      addBlock: (blockData) => set((state) => {
        const newBlock: Block = {
          ...blockData,
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
          sort_order: state.blocks.length,
        };
        return { blocks: [...state.blocks, newBlock], activeBlockId: newBlock.id };
      }),

      updateBlock: (id, updates) => set((state) => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, ...updates } : b)
      })),

      removeBlock: (id) => set((state) => ({
        blocks: state.blocks.filter(b => b.id !== id),
        activeBlockId: state.activeBlockId === id ? null : state.activeBlockId
      })),

      moveBlock: (id, newIndex) => set((state) => {
        const blocks = [...state.blocks];
        const oldIndex = blocks.findIndex(b => b.id === id);
        if (oldIndex === -1) return state;
        
        const [movedBlock] = blocks.splice(oldIndex, 1);
        blocks.splice(newIndex, 0, movedBlock);
        
        // Update sort_order
        const updatedBlocks = blocks.map((b, index) => ({ ...b, sort_order: index }));
        return { blocks: updatedBlocks };
      }),

      setActiveBlock: (id) => set({ activeBlockId: id }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: 'psyedu-builder',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
