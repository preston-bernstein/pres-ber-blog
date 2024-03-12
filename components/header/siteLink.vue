<template>
    <NuxtLink
      class="text-xs leading-tight uppercase ml-4 transition-colors"
      :to="href"
    >
      {{ text }}
    </NuxtLink>
  </template>
  
  <script>
  export default {
    props: {
      href: String,
      text: String,
    },
  };
  </script>