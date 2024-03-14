<template>
    <header class="flex justify-center items-center z-50 fixed top-0 left-0 right-0 w-full px-2 py-4">
        <div class="grid grid-cols-3 gap-2 bg-white outline-gray p-2 w-full max-w-screen-lg h-12 rounded-md mx-auto items-center" data-js="header">
            <HeaderSiteLink href="/" text="Preston Bernstein" />
            <HeaderMenuButton :text="{ open: 'Menu', closed: 'Close' }"/>
            <HeaderLogo />
            <HeaderNavMenu />
        </div>
    </header>
</template>
