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
import ProfileOverview          from "../views/profile/ProfileOverview.vue";
import ProfileFavorites         from "../views/profile/ProfileFavorites.vue";
import ProfileSettings          from "../views/profile/ProfileSettings.vue";
import ProfileBorrowHistory     from "../views/profile/ProfileBorrowHistory.vue";
import AILibrarian               from "../views/AILibrarian.vue";
import BookDetail               from "../views/BookDetail.vue";
import BooksView                from "../views/BooksView.vue";
import SearchResultsView        from "../views/SearchResultsView.vue";
import BorrowConfirmView        from "../views/BorrowConfirmView.vue";
import OnlineCashReturnView     from "../views/OnlineCashReturnView.vue";
import CategoryView             from "../views/CategoryView.vue";

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
            },
            {
                path: 'categories/:maLoai',
                name: 'Category',
                component: CategoryView
            },
            {
                path: 'search',
                name: 'Search',
                component: SearchResultsView
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
                redirect: '/user/profile/overview',
                children: [
                    {
                        path: 'overview',
                        name: 'ProfileOverview',
                        component: ProfileOverview
                    },
                    {
                        path: 'history',
                        name: 'ProfileBorrowHistory',
                        component: ProfileBorrowHistory
                    },
                    {
                        path: 'favorites',
                        name: 'ProfileFavorites',
                        component: ProfileFavorites
                    },
                    {
                        path: 'settings',
                        name: 'ProfileSettings',
                        component: ProfileSettings
                    }
                ]
            }
        ]
    },
    {
        path: '/book',
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
        path: '/borrow',
        name: 'Borrow',
        component: NoneLayout,
        children: [
            {
                path: 'confirm',
                name: 'BorrowConfirm',
                component: BorrowConfirmView
            }
        ]
    },
    {
        path: '/chat',
        name: 'chat',
        component: NoneLayout,
        children: [
            {
                path: 'ai',
                name: 'chatAI',
                component: AILibrarian
            }
        ]
    },
    {
        path: '/payment',
        name: 'Payment',
        component: NoneLayout,
        children: [
            {
                path: 'return',
                name: 'OnlineCashReturn',
                component: OnlineCashReturnView
            }
        ]
    }
]


const routes = createRouter({
    history: createWebHistory(),
    routes: router
})

routes.beforeEach((to, from, next) => {
    const publicPages = ['/', '/auth/login', '/auth/register', '/books', '/search'];
    const publicPrefixes = ['/categories/', '/book/'];
    const isPublicPage = publicPages.includes(to.path) || publicPrefixes.some(prefix => to.path.startsWith(prefix));
    const authRequired = !isPublicPage;
    const loggedIn = getAccountData() !== null;

    if (authRequired && !loggedIn) {
        return next('/auth/login');
    }
    next();
});

export default routes;