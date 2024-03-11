<template>
    <a
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
      class="text-xs leading-tight uppercase ml-4 transition-colors"
      data-js="menu-button"
    >
      {{ text }}
    </a>
  </template>
  
  <script>
  export default {
    props: {
      href: String,
      text: String,
    },
  };
  </script>