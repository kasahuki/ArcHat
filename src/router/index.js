import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Login from '../views/user/Login.vue'
import Chat from '../views/chat/Chat.vue'
import UserHub from '../views/user/UserHub.vue'
import MailBox from '../views/mail/MailBox.vue'
import silent from '@/views/silent.vue'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Home,
            name: 'home',
            redirect: '/chat',
            children: [
                {
                    path: '/chat',
                    name: 'Chat',
                    component: () => import('@/views/chat/Chat.vue'),
                    children: [
                        {
                            path: '',
                            name: 'StartPage',
                            component: () => import('@/views/chat/StartPage.vue')
                        },
                        {
                            path: ':id',
                            name: 'ChatRoom',
                            component: () => import('@/views/chat/Chat.vue')
                        }
                    ]
                },
                {
                    path: '/UserHub',
                    component: UserHub,
                    name: 'UserHub',
                },
                {
                    path: '/mail',
                    component: MailBox,
                    name: 'mail',
                }
            ]
        },
        {
            path: '/login',
            component: Login,
            name: 'login',
        },
        {
            path: '/silent',
            componnet: silent,
            name: 'silent'
        },
        // 404页面
        {
            path: '/:pathMatch(.*)*',
            component: () => import('../components/404NotFound.vue')
        }
    ],
})

export default router
