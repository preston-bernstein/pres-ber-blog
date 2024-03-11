<template>
    <header
        class="z-50 fixed top-0 left-0 right-0 pt-4 pb-4 grid grid-cols-2 pl-2 pr-2 justify-center gap-2"
    >
        <div
            class="grid grid-cols-2 justify-between items-center py-2 relative bg-white border border-gray-300 rounded-md"
            data-js="header"
        >
            <HeaderSiteLink
                href="https://prestonbernstein.com"
                text="Preston Bernstein"
            />
            <HeaderMenuButton :text="{ open: 'Menu', closed: 'Close' }"/>
        </div>
    </header>
</template>