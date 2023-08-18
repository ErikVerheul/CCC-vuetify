// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    screenWidth: window.screen.availWidth > 600 ? 600 : window.screen.availWidth,
    // allow 120 px for unknown space usage like browser adres bar
    screenHeight: window.screen.availHeight - 180,
    backContinueHeight: 60,
    firebaseUser: undefined,
    userData: {},
    screenName: ''
  }),
})
