

import { create } from 'zustand';

interface PluginStore {
  domainNames: string[];
  pluginList: any[];
  filteredList: any[];
  setDomainNames: (domains: string[]) => void;
  setPluginList: (plugins: any[]) => void;
  setFilteredList: (plugins: any[]) => void;
}

export const usePluginStore = create<PluginStore>((set) => ({
  domainNames: [],
  pluginList: [],
  filteredList: [],
  setDomainNames: (domains) => set({ domainNames: domains }),
  setPluginList: (plugins) => set({ pluginList: plugins }),
  setFilteredList: (plugins) => set({ filteredList: plugins }),
}));
