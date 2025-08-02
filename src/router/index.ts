import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import QuizView from '../views/QuizView.vue'
import Admin from '../views/Admin.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Quiz', component: QuizView },
  { path: '/admin', name: 'Admin', component: Admin }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
