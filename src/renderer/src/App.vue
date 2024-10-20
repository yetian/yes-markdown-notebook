<template>
  <div>
    <div class="header"> &nbsp; Ye's Markdown Notebook</div>
    <div class="content">
      <div class="content-project">project</div>
      <div class="content-editor">
        <VAceEditor
          v-model:value="content"
          lang="markdown"
          theme="chrome"
          :wrap="true"
          style="height: 100%"
        />
      </div>
      <div class="content-previewer" v-html="renderedContent"></div>
    </div>
    <div class="footer">footer</div>
  </div>
</template>

<script>
import mermaid from 'mermaid'
import { VAceEditor } from 'vue3-ace-editor'
import 'ace-builds/src-noconflict/mode-markdown'
import 'ace-builds/src-noconflict/theme-chrome'

import markdownIt from 'markdown-it'
import markdownItMermaid from '@wekanteam/markdown-it-mermaid'
import markdownItMathjax3 from 'markdown-it-mathjax3'

import { debounce } from 'lodash'

const mdi = markdownIt()
mdi.use(markdownItMermaid)
mdi.use(markdownItMathjax3)

export default {
  name: 'YesMarkdownNotebook',
  components: {
    VAceEditor
  },
  data() {
    return {
      content: '',
      renderedContent: ''
    }
  },
  watch: {
    content: {
      handler: debounce(function () {
        this.renderAll()
      }, 1000),
      immediate: true
    }
  },
  mounted() {
    mermaid.initialize({
      startOnLoad: false
    })
  },
  methods: {
    renderAll: function () {
      this.renderedContent = mdi.render(this.content)

      // render mermaid
      setTimeout(() => {
        mermaid.run({ nodes: document.querySelectorAll('.mermaid') })
      }, 100)
    }
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  background-color: #fafafa;
  height: 47px;
  border-bottom: 1px solid #ddd;
  line-height: 47px;
  font-weight: 700;
}

.content {
  height: calc(100vh - 80px);
  display: flex;
}

.content-project {
  flex: 1 1 0;
  border-right: 1px solid #ddd;
}

.content-editor {
  flex: 2 1 0;
  border-right: 1px solid #ddd;
}

.footer {
  height: 31px;
  border-top: 1px solid #ddd;
  background-color: #fafafa;
}

.content-previewer {
  flex: 2 1 0;
  padding: 10px;
  overflow: auto;
}
</style>
