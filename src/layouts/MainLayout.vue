<script setup>
import { 
    NAvatar, 
    NSpace, 
    NConfigProvider, 
    darkTheme,
    NGradientText,
    NSwitch,
    NButton,
    NIcon,
    NImage,
    NDropdown,
    useMessage
}                               from    'naive-ui';
import { 
    isDark, 
    toggleDark 
}                               from    '../hooks/useDark';
import {
    getAccountData,
    removeAccountData
}                               from    '../hooks/useAccount';
import { ref, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import Footer from '../components/Footer.vue';
import BagButton from '../components/BagButton.vue';
import NotificationBell from '../components/NotificationBell.vue';

const message = useMessage();
const router = useRouter();

// Check if user is logged in
const accountData = ref(getAccountData());
const isLoggedIn = computed(() => accountData.value !== null);

const isHomeView = computed(() => router.currentRoute.value.path === '/');
const isBookView = computed(() => router.currentRoute.value.path.startsWith('/books'));
const isChatAIView = computed(() => router.currentRoute.value.path.startsWith('/chat'));

// Function to render icon
const renderIcon = (iconClass) => {
  return () => h(NIcon, null, { default: () => h('i', { class: iconClass }) });
};

// User dropdown options
const userDropdownOptions = [
  {
    label: 'Trang cá nhân',
    key: 'profile',
    icon: renderIcon('fa-solid fa-user')
  },
  {
    label: 'Sách đã mượn',
    key: 'borrowed',
    icon: renderIcon('fa-solid fa-book')
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    label: 'Đăng xuất',
    key: 'logout',
    icon: renderIcon('fa-solid fa-right-from-bracket')
  }
];

// Handle dropdown selection
const handleDropdownSelect = (key) => {
  if (key === 'profile') {
    router.push('/user/profile');
  } else if (key === 'borrowed') {
    router.push('/user/profile');
  } else if (key === 'logout') {
    removeAccountData();
    accountData.value = null;
    message.success('Đăng xuất thành công');
    router.push('/');
  }
};
</script>

<template>
    <header class="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm">
        <nav class="lg:py-4 py-3 lg:px-[10%] px-4">
            <NSpace justify="space-between" align="center">
                <!-- Logo -->
                <RouterLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <NAvatar
                        round
                        size="large"
                        src="/logo-nobg.png"
                    />
                    <h3 
                        type="warning"
                        class="text-2xl lg:text-3xl font-bold"
                    >
                        RuryLib
                    </h3>
                </RouterLink>

                <!-- Navigation Links - Desktop -->
                <NSpace class="hidden lg:flex uppercase font-semibold dark:text-gray-300" size="large" align="center">
                    <router-link 
                        to="/" 
                        class="px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        :class="{ 'border-b-2 border-gray-600 dark:border-blue-400 text-blue-600 dark:text-blue-400': isHomeView }"
                    >
                        <NIcon class="mr-1"><i class="fa-solid fa-home"></i></NIcon>
                        Trang chủ
                    </router-link>
                    <router-link 
                        to="/books" 
                        class="px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        :class="{ 'border-b-2 border-gray-600 dark:border-blue-400 text-blue-600 dark:text-blue-400': isBookView }"
                    >
                        <NIcon class="mr-1"><i class="fa-solid fa-book"></i></NIcon>
                        Sách
                    </router-link>
                    <router-link 
                        to="/chat/ai" 
                        class="px-4 py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        :class="{ 'border-b-2 border-gray-600 dark:border-blue-400 text-blue-600 dark:text-blue-400': isChatAIView }"
                    >
                        <NIcon class="mr-1"><i class="fa-solid fa-robot"></i></NIcon>
                        Thủ thư AI
                    </router-link>
                </NSpace>

                <!-- Right Side Actions -->
                <NSpace align="center" :size="12">
                    <!-- Notification Bell - Only show if logged in -->
                    <NotificationBell v-if="isLoggedIn" />
                    
                    <!-- Bag Button - Only show if logged in -->
                    <BagButton v-if="isLoggedIn" />
                    
                    <!-- User Dropdown if logged in -->
                    <NDropdown 
                        v-if="isLoggedIn"
                        :options="userDropdownOptions" 
                        @select="handleDropdownSelect"
                        trigger="click"
                    >
                        <NButton type="primary" size="large" class="hidden lg:flex">
                            <template #icon>
                                <NIcon><i class="fa-solid fa-user"></i></NIcon>
                            </template>
                            {{ accountData?.TEN || 'Tài khoản' }}
                            <template #icon-after>
                                <NIcon><i class="fa-solid fa-chevron-down"></i></NIcon>
                            </template>
                        </NButton>
                    </NDropdown>

                    <!-- Auth Buttons if not logged in - Desktop -->
                    <NSpace v-if="!isLoggedIn" class="hidden lg:flex" :size="12">
                        <NButton type="info" size="large">
                            <template #icon>
                                <NIcon><i class="fa-solid fa-right-to-bracket"></i></NIcon>
                            </template>
                            <RouterLink to="/auth/login">Đăng nhập</RouterLink>
                        </NButton>
                        <NButton type="primary" size="large">
                            <template #icon>
                                <NIcon><i class="fa-solid fa-user-plus"></i></NIcon>
                            </template>
                            <RouterLink to="/auth/register">Đăng ký</RouterLink>
                        </NButton>
                    </NSpace>
                    
                    <!-- Dark Mode Toggle -->
                    <NSwitch v-model:value="isDark" size="large">
                        <template #checked-icon>
                            <NIcon><i class="fa-solid fa-sun"></i></NIcon>
                        </template>
                        <template #unchecked-icon>
                            <NIcon><i class="fa-solid fa-moon"></i></NIcon>
                        </template>
                    </NSwitch>

                </NSpace>
            </NSpace>
        </nav>
    </header>
    
    <main class="min-h-screen">
        <router-view v-slot="{ Component }">
            <KeepAlive :include="['HomeView', 'BooksView', 'SearchResultsView']">
                <component :is="Component" />
            </KeepAlive>
        </router-view>
    </main>

    <Footer />
</template>

<style scoped>
header {
    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

:global(.dark) header {
    border-bottom-color: rgba(75, 85, 99, 0.3);
}

/* Active link styling */
.router-link-active {
    font-weight: 600;
}

/* Smooth transitions */
a {
    transition: all 0.2s ease;
}

/* Remove default link styling */
a {
    text-decoration: none;
    color: inherit;
}
</style>