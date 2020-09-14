// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import '~/assets/fonts/calibre.css'
import '~/assets/fonts/jetbrains.css'
import DefaultLayout from '~/layouts/Default.vue'
import { Dimer, DimerTree, DimerSearch, DimerTabs, utils } from 'dimer-vue'
import CodeBlock from '~/components/CodeBlock.vue'
import Tabs from '~/components/Tabs'

console.log(`
Hey there!

You are interested in the source code of this project, or you find something that should be fixed?

Lucky you... the website is open source!
Feel free to make any suggestion in an issue or PR directly your change(s). 🤗

🔗 https://github.com/tngraphql/tngraphql.com

`)

export default function (Vue, { router, head, isClient }) {
  Dimer.addRenderer(function (node, rerender, createElement) {
    /**
     * Wrapping tabs inside a custom component
     */
    if (node.props.className && node.props.className.indexOf('tabs') > -1) {
      return createElement(Tabs, { props: { node } })
    }

    // Handles correctly any external link
    if (node.tag === 'a' && /^http(s)?/.test(node.props.href)) {
      node.props.target = '_blank'
      node.props.rel = 'noreferrer'

      const attrs = utils.propsToAttrs(node.props)
      const children = node.children.map(rerender)

      return createElement('a', { attrs }, children)
    }

    if (['h2', 'h3', 'h4'].includes(node.tag)) {
      const children = node.children.concat([{
        type: 'element',
        tag: 'span',
        props: {
          className: ['bookmark'],
          id: node.props.id,
        },
        children: [],
      }])
      return createElement(node.tag, {}, children.map(rerender))
    }

    if (node.tag === 'div' && node.props.className && node.props.className.includes('dimer-highlight')) {
      if (node.children.length === 2) {
        return createElement(CodeBlock, {
          props: {
            title: node.children[0].children[0].value,
          },
          scopedSlots: {
            default: () => {
              return createElement('pre', {
                domProps: {
                  innerHTML: `<code>${node.children[1].children[0].children[0].value}</code>`
                }
              })
            }
          },
        })
      }

      return createElement(CodeBlock, {
        scopedSlots: {
          default: () => {
            return createElement('pre', {
              domProps: {
                innerHTML: `<code>${node.children[0].children[0].children[0].value}</code>`
              }
            })
          }
        },
      })
    }
  })

  Dimer.use(DimerTree)
  Dimer.use(DimerSearch)
  Dimer.use(DimerTabs)
  Vue.use(Dimer)
  Vue.mixin({
    methods: {
      '$searchDocs': function (zone,version,query) {
        const { baseUrl } = this.$attrs;

        const url = `${ baseUrl }${ zone }/versions/${ version }/search.json?limit=0&query=${ query }`;

        return fetch(url).then(res => res.json());
      }
    }
  })

  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
  head.meta.push({
    name: 'viewport',
    content: 'width=device-width, initial-scale=1, shrink-to-fit=no',
  })
  head.link.push({
      rel: 'stylesheet',
      href: '//fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext'
  })
}
// //fonts.googleapis.com/css?family=Miriam+Libre:400,700|Source+Sans+Pro:200,400,700,600,400italic,700italic
