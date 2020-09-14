<template>
  <Layout>
    <a-header />
    <a-hero />
    <a-primary-features />
<!--    <a-video />-->
<!--    <a-secondary-features />-->
    <a-footer />
  </Layout>
</template>

<script>
  import AFooter from '~/components/Sections/Footer.vue'
  import AHeader from '~/components/Sections/Header.vue'
  import AVideo from '~/components/Home/Video.vue'
  import AHero from '~/components/Home/Hero.vue'
  import APrimaryFeatures from '~/components/Home/PrimaryFeatures.vue'
  import ASecondaryFeatures from '~/components/Home/SecondaryFeatures.vue'

  export default {
    metaInfo: {
      title: 'Home',
      meta: [
        { name: 'description', content: 'TNGraphQL is a fully-featured MVC framework for Node.js. It takes care of most of your web development hassles, offering you a clean and stable API to build web apps or microservices.' },
        { name: 'keywords', content: 'tngraphql, graphql, framework, node.js, mvc, javascript' },
        { property: 'og:title', content: 'TNGraphQL Framework - The MVC Framework For Node.js' },
        { property: 'og:description', content: 'TNGraphQL is a fully-featured MVC framework for Node.js. It takes care of most of your web development hassles, offering you a clean and stable API to build web apps or microservices.' },
      ],
    },
    components: { AHeader, AHero, APrimaryFeatures, AFooter, AVideo, ASecondaryFeatures },
  }
</script>
