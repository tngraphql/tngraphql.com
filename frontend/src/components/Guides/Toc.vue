<template>
  <div class="toc">
    <div class="toc-content">
      <dimer-tree :node="node" />
    </div>
  </div>
</template>

<script>
  export default {
    props: ['node'],
    data() {
      return {
        ab: Math.random(),
        listenScroll: function(e) {
          let listID = this.listID
          listID = listID.map(item => {
            return {
              id: item,
              top: document.querySelector(`.doc a[href="${ item }"]`).getBoundingClientRect().top
            };
          });
          function remove() {
            document.querySelectorAll(`.toc-content a`).forEach(item => {
              item.classList.remove('active');
            })
          }
          for(const index in listID ) {
            const current = listID[index];
            const next = listID[Number(index) + 1];
            remove();
            if ( ! next && current.top <= 105) {
              document.querySelector(`.toc-content a[href="${ current.id }"]`).classList.add('active');
              break;
            }
            if ( current.top <= 105 && next.top > 105 ) {
              document.querySelector(`.toc-content a[href="${ current.id }"]`).classList.add('active');
              break;
            }
          }
        },
        listID: []
      }
    },
    mounted() {
      let listID = [];

      this.findId(this.node, listID);

      this.listID = listID

      this.listenScroll = this.listenScroll.bind(this)

      if ( listID.length ) {
        document.addEventListener("scroll", this.listenScroll);
      }
    },
    destroyed() {
      document.removeEventListener('scroll', this.listenScroll)
    },
    methods: {
      findId(node, t = []) {
        if ( ! node ) {
          return;
        }
        if (!node.children || !node.children.length ) {
          return;
        }

        for(let item of node.children) {
          if ( item.props && item.props.href ) {
            t.push(item.props.href);
          }
          this.findId(item, t);
        }
      }
    }
  }
</script>

<style>
  .toc {
    position: sticky;
    top: calc(var(--header-height) + 6px);
    flex: 0 0 240px;
    height: 100vh;
  }

  .toc-content {
    height: 100%;
    width: 300px;
    overflow: auto;
    padding: 50px 0px 50px 25px;
  }

  .toc-content a.active{
    color: black;
  }

  .toc .title {
    color: var(--grey-200);
    font-size: 1.6rem;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    margin-bottom: 30px;
  }

  .toc .title svg {
    margin-right: 8px;
    position: relative;
    top: 1px;
  }

  .toc-container {
    border-left: solid 1px var(--grey-100);
    padding: 10px 30px 70px 25px;
  }
  .toc-container h2 {
    display: none;
  }

  .toc-container ul {
    list-style: none;
  }

  .toc-container ul li ul {
    margin-left: 25px;
  }

  .toc-container ul li a {
    color: var(--grey-200);
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 8px;
    display: block;
    white-space: wrap;
  }

  .toc-container ul li a:hover {
    color: inherit;
  }
</style>
