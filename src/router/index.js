// Composables
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import PrivacyView from '@/views/PrivacyView.vue'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView
      },
      {
        path: '/Privacybeleid',
        name: 'Privacy',
        component: PrivacyView
      },
      {
        path: '/superadmin',
        name: 'SuperAdmin',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import('@/views/SuperAdminView.vue'),
      }
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
