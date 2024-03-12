<script setup lang="ts">
import { useHeaderMenuStore } from '~/store/headerMenu';

const store = useHeaderMenuStore();

const isLastItem = (index: number) => {
    return index === store.menuItems.length - 1;
};
</script>

<template>
    <nav 
        class="menu grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 py-2 absolute top-full left-0 right-0 col-span-full pointer-events-none"
    >
        <NuxtLink
            v-for="(item, index) in store.menuItems"
            :key="item.name"
            :to="item.path"
            class="menu-item opacity-0 pointer-events-none transition-opacity duration-300 ease-in-out text-xs leading-6 bg-white uppercase text-center transform transition-bg border border-brand_gray p-3 rounded-md"
            :class="{ 'opacity-100 pointer-events-auto': store.isMenuOpen, 'col-span-full': isLastItem(index) }"
        >
            {{ item.name }}
        </NuxtLink>
    </nav>
</template>
