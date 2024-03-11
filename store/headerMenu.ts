// ~/store/headerMenu.ts
import { defineStore } from 'pinia';

export const useHeaderMenuStore = defineStore('headerMenu', {
  state: () => ({
    isMenuOpen: false,
  }),
  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
});
