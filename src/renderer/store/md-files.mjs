import { defineStore } from 'pinia'

export const useMDFileStore = defineStore('mdFiles', {
  state: () => ({
    mdFileList: [] // { path: string, fileName: string }
  }),
  persist: true
})
