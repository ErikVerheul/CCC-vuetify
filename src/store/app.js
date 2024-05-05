import { defineStore } from 'pinia'

/*
* Calculate the weeknumber since the beginning of the year shifted 11 hours ahead to create a weeknumber break at 13:00 hrs.
* see: https://thetechthunder.com/posts/calculate-current-week-number-in-javascript
*/
function getWeekNumber() {
  const dayShift = (24 - 13) * 60 * 60 * 1000
  const now = Date.now()
  const startDate = new Date(new Date().getFullYear(), 0, 1).getTime() - dayShift 
  const days = (now - startDate) / (24 * 60 * 60 * 1000)
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
