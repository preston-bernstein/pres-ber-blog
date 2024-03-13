<template>
    <header
        class="z-50 fixed top-0 left-0 right-0 pt-4 pb-4 pl-2 pr-2 flex justify-center items-center"
    >
        <div
            class="grid grid-cols-3 gap-2 items-center bg-white border border-gray-200 p-2 w-full max-w-screen-lg rounded-md"
            data-js="header"
        >
            <HeaderSiteLink href='/' text="Preston Bernstein" />
            <HeaderMenuButton :text="{ open: 'Menu', closed: 'Close' }"/>
            <HeaderLogo />
            <HeaderNavMenu />
        </div>
    </header>
</template>
