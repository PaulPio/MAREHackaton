import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import InboxView from '../views/InboxView.vue'
import MicrositeView from '../views/MicrositeView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/inbox',
    name: 'Inbox',
    component: InboxView
  },
  {
    path: '/site/:id',
    name: 'Microsite',
    component: MicrositeView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
