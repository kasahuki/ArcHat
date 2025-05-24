import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/home.vue'
import Login from '../views/user/login.vue'
import Chat from '../views/chat/Chat.vue'
import UserHub from '../views/user/UserHub.vue'
import MailBox from '../views/mail/MailBox.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
       {
        path:'/',
        component:Home,
        name:'home',
        children:[
            {
                path:'/chat',
                component:Chat,
                name:'chat',
            },
            {
                path:'/UserHub',
                component:UserHub,
                name:'UserHub',
            },
            {
                path:'/mail',
                component:MailBox,
                name:'mail',
            }
        ]
       }, 
       {
        path: '/login',
        component: Login,
        name: 'login',
       },
    ],
})

export default router
