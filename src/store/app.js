import { defineStore } from 'pinia'

/* See https://www.geeksforgeeks.org/calculate-current-week-number-in-javascript/ */
function getWeekNumber() {
  const currentDate = new Date()
  const startDate = new Date(currentDate.getFullYear(), 0, 1)
  const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000))
  return Number(Math.ceil(days / 7))
}

export const useAppStore = defineStore('app', {
  state: () => ({
    largeScreenDetected: window.screen.availWidth >= 1280,
    screenWidth: window.screen.availWidth > 600 ? 600 : window.screen.availWidth,
    // allow 120 px for unknown space usage like browser address bar
    screenHeight: window.screen.availHeight - 180,
    backContinueHeight: 120,
    aliasesObject: {},
    firebaseUser: undefined,
    userData: {},
    screenName: '',
    currentYear: new Date().getFullYear(),
    currentWeekNr: getWeekNumber(),
    maxQuizWinners: 3
  }),
})
