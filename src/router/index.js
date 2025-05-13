import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: () => import('../views/Subscriptions.vue')
  },
  {
    path: '/subscription/:id',
    name: 'SubscriptionDetail',
    component: () => import('../views/SubscriptionDetail.vue')
  },
  {
    path: '/add-subscription',
    name: 'AddSubscription',
    component: () => import('../views/AddSubscription.vue')
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('../views/Analytics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router