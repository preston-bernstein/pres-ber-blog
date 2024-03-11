<script setup lang="ts">
import { defineProps } from 'vue';
import { useHeaderMenuStore } from '~/store/headerMenu';

interface TextProps {
    text: {
        open: string;
        closed: string;
    }
}

const props = defineProps<{
  text: TextProps;
}>();

const store = useHeaderMenuStore();

// Method to toggle the menu state
const toggleMenu = () => store.toggleMenu();
</script>

<template>
  <button @click="toggleMenu" class="text-xs leading-tight border-0 py-1 px-2 m-0 mr-1 transition-colors text-center rounded-sm cursor-pointer uppercase">
    {{ store.isMenuOpen ? props.text.closed : props.text.open }}
  </button>
  <nav v-if="store.isMenuOpen" class="navigation-menu">
    <!-- Navigation items here -->
  </nav>
</template>
