<script setup lang="ts">
import { useHeaderMenuStore } from '~/store/headerMenu';

const store = useHeaderMenuStore();

</script>

<template>
    <div
    class="bg-white font-normal leading-relaxed text-base text-black"
    >
        <LayoutHeader />
        <div :class="{'opacity-0': store.isMenuOpen}">
            <slot />
        </div>
    </div>
</template>