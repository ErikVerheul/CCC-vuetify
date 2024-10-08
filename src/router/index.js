// Composables
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import QuizPlanningView from '@/views/QuizPlanningView.vue'
import QuizResultsView from '@/views/QuizResultsView.vue'
import { useAppStore } from '../store/app.js'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        component: HomeView,
      },
      {
        path: '/Privacybeleid',
        name: 'Privacy',
        component: PrivacyView,
      },
      {
        path: '/QuizPlanningView',
        name: 'QuizPlanning',
        component: QuizPlanningView,
      },
      {
        path: '/QuizResultsView',
        name: 'QuizResults',
        component: QuizResultsView,
      },
      {
        path: '/superAdmin',
        name: 'SuperAdmin',
        // route level code-splitting
        // this generates a separate chunk for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/SuperAdminView.vue'),
        // prevent any other account than admin to access this view
        beforeEnter(to, from, next) {
          const store = useAppStore()
          if (store.userData && store.userData.alias === 'admin') {
            next()
          } else {
            next('/')
          }
        },
      },
      {
        // route any unknown path to HomeView
        path: '/:pathMatch(.*)*',
        component: HomeView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
