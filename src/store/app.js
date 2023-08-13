// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    firebaseUser: undefined,
    userData: {},
    screenName: ''
  }),
})
