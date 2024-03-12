// ~/store/headerMenu.ts
import { defineStore } from 'pinia';

export const useHeaderMenuStore = defineStore('headerMenu', {
  state: () => ({
    isMenuOpen: false,
    menuItems: [
      {
        name: 'Work', path: 'work',
      }, {
        name: 'Blog', path: '/blog',
      }, {
        name: 'About', path: '/about'
      }, {
        name: 'Subscribe', path: '/subscribe'
      }
    ]
  }),
  actions: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
  },
});
