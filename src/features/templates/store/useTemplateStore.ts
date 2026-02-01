import { TemplateService } from "@/src/services/templateService";
import { TransactionTemplate } from "@/src/types/template";
import { create } from "zustand";

interface TemplateState {
  templates: TransactionTemplate[];
  isLoading: boolean;

  setTemplates: (templates: TransactionTemplate[]) => void;
  initializeTemplates: (userId: string) => () => void;
  addTemplate: (data: Omit<TransactionTemplate, "id">) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  isLoading: false,

  setTemplates: (templates) => set({ templates }),

  initializeTemplates: (userId: string) => {
    const unsub = TemplateService.subscribeTemplates(userId, (data) => {
      set({ templates: data });
    });
    return unsub;
  },

  addTemplate: async (data) => {
    set({ isLoading: true });
    try {
      await TemplateService.addTemplate(data);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTemplate: async (id) => {
    try {
      await TemplateService.deleteTemplate(id);
    } catch (error) {
      throw error;
    }
  },
}));
