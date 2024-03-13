<script setup lang="ts">
import { useHeaderMenuStore } from '~/store/headerMenu';

const store = useHeaderMenuStore();

</script>

<template>
    <div
    class="bg-white font-normal leading-relaxed text-base text-black"
    >
        <LayoutHeader />
        <LayoutMain :class="{'opacity-0': store.isMenuOpen}">
            <slot />
        </LayoutMain>
        <LayoutFooter />
        <LayoutFooterLegal />
    </div>
</template>