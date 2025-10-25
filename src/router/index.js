import { 
    createWebHistory, 
    createRouter 
}                               from "vue-router";
//layouts
import MainLayout               from '../layouts/MainLayout.vue';
import AuthLayout               from "../layouts/AuthLayout.vue";
import NoneLayout               from "../layouts/NoneLayout.vue";
import ProfileLayout            from "../layouts/ProfileLayout.vue";
//views
import HomeView                 from '../views/HomeView.vue'
import LoginView                from '../views/LoginView.vue'
import RegisterView             from '../views/RegisterView.vue'
import ProfileView              from "../views/ProfileView.vue";
import TestAIView               from "../views/TestAIView.vue";
import BookDetail               from "../views/BookDetail.vue";
import BooksView                from "../views/BooksView.vue";

//auth
import {
    setAccountData,
    getAccountData,
    removeAccountData
}                               from '../hooks/useAccount.js';


const router = [
    {
        path: '/',
        name: 'Base',
        component: MainLayout,
        children: [
            {
                path: '',
                name: 'Home',
                component: HomeView,
            },
            {
                path: 'books',
                name: 'Books',
                component: BooksView
            }
        ]
    },
    {
        path: '/auth',
        name: 'Auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                name: 'Login',
                component: LoginView
            },
            {
                path: 'register',
                name: 'Register',
                component: RegisterView
            }
        ]
    },
    {
        path: '/user',
        name: 'User',
        component: ProfileLayout,
        children: [
            {
                path: 'profile',
                name: 'UserProfile',
                component: ProfileView
            }
        ]
    },
    {
        path: '/books',
        name: 'Book',
        component: NoneLayout,
        children: [
            {
                path: ':id',
                name: 'BookDetail',
                component: BookDetail
            }
        ]
    },
    {
        path: '/test',
        name: 'Test',
        component: NoneLayout,
        children: [
            {
                path: 'ai',
                name: 'TestAI',
                component: TestAIView
            }
        ]
    }
]


const routes = createRouter({
    history: createWebHistory(),
    routes: router
})

routes.beforeEach((to, from, next) => {
    const publicPages = ['/', '/auth/login', '/auth/register'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = getAccountData() !== null;

    if (authRequired && !loggedIn) {
        return next('/auth/login');
    }
    next();
});

export default routes;