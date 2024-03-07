<template>
    <main>
      <!-- Query for blog posts for the current page -->
      <ContentQuery
        path="/blog"
        :only="['headline', 'excerpt', 'date', 'tags', '_path', 'image']"
        :sort="{ date: -1 }"
        :skip="blogCountLimit * (getPageNumber() - 1)"
        :limit="blogCountLimit"
      >
        <!-- Display results if found -->
        <template v-slot="{ data }">
          <BlogHero />
          <Section id="main" class="!pt-0">
            <BlogList :data="data" />
            <ContentQuery
              path="/blog"
              :only="['headline']"
            >
              <template v-slot="{ data }">
                <!-- Only show pagination if more than one page exists -->
                <BlogPagination
                  v-if="getPageLimit(data.length) > 1"
                  class="mt-8"
                  :currentPage="getPageNumber()"
                  :totalPages="getPageLimit(data.length)"
                  :nextPage="getPageNumber() < getPageLimit(data.length)"
                  baseUrl="/blog/"
                  pageUrl="/blog/page/"
                />
              </template>
              <template #not-found>
                <!-- Placeholder for future use or customization -->
              </template>
            </ContentQuery>
          </Section>
        </template>
        <!-- Display a message if no posts are found -->
        <template #not-found>
          <BlogHero />
          <Section id="main" class="!pt-0">
            <BlogList :data="[]" message="There are no posts on this page. Try checking another one." />
          </Section>
        </template>
      </ContentQuery>
    </main>
  </template>
  
  <script setup>
  import { useRoute, useRouter } from 'vue-router';
  
  const blogCountLimit = 6;
  const { params } = useRoute();
  const router = useRouter();
  
  // Calculate the total number of pages based on the total number of posts
  const getPageLimit = (totalPosts) => Math.ceil(totalPosts / blogCountLimit);
  
  // Extract the current page number from the URL
  const getPageNumber = () => parseInt(params.number) || 1;
  
  // Redirect to the main blog page if the page number is invalid
  try {
    const pageNo = getPageNumber();
    if (pageNo < 1) throw new Error('Invalid page number');
  } catch (err) {
    console.error(err.message);
    router.replace('/blog/');
  }
  </script>
  