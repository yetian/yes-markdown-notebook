<template>
  <div>
    <div class="header">
      <div class="header-action" @click.stop="openFile()">📂 Open</div>
      <div class="header-action">💾 Save</div>
    </div>
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
      content: '', // current content
      renderedContent: '',
      currentFilePath: '',
      // mdFile: {filePath: '', content: ''}
      mdFiles: []
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
    },
    openFile: async function () {
      const result = await window.api.openMDFile()

      if (result) {
        this.currentFilePath = result.filePath
        this.content = result.content
        this.addToFileList(result.filePath, result.content)
      }
    },
    addToFileList: function (filePath, content) {
      if (!filePath || !content) return
      if (this.mdFiles.find((file) => file.filePath === filePath)) return
      this.mdFiles.push({ filePath, content })
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  width: 100%;
  background-color: #fafafa;
  height: 47px;
  border-bottom: 1px solid #ddd;
  line-height: 47px;
  font-weight: 400;
}

.header-action {
  width: 100px;
  text-align: center;
  border-right: 1px solid #ddd;
  cursor: pointer;
}

.header-action:hover {
  background-color: #eee;
}

.header-action:active {
  background-color: #ddd;
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
