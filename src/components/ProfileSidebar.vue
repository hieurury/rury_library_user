<script setup>
import {
    NMenu,
    NIcon
} from 'naive-ui';
import { h, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Function to render icon
const renderIcon = (icon) => {
    return () => h(NIcon, null, { default: () => h('i', { class: icon }) });
};

// Menu items
const menuOptions = [
    {
        label: 'Tổng quát',
        key: '/user/profile/overview',
        icon: renderIcon('fa-solid fa-chart-line')
    },
    {
        label: 'Lịch sử mượn',
        key: '/user/profile/history',
        icon: renderIcon('fa-solid fa-clock-rotate-left')
    },
    {
        label: 'Sở thích',
        key: '/user/profile/favorites',
        icon: renderIcon('fa-solid fa-heart')
    },
    {
        label: 'Cài đặt',
        key: '/user/profile/settings',
        icon: renderIcon('fa-solid fa-cog')
    }
];

// Active key based on current route
const activeKey = computed(() => route.path);

// Handle menu select
const handleMenuSelect = (key) => {
    router.push(key);
};
</script>

<template>
    <div class="profile-sidebar h-full bg-white dark:bg-gray-800/20">
        <div class="p-4">
            <h3 class="text-lg font-semibold mb-4 dark:text-white">Menu</h3>
            <NMenu
                :value="activeKey"
                :options="menuOptions"
                @update:value="handleMenuSelect"
                :default-expand-all="true"
            />
        </div>
    </div>
</template>

<style scoped>
.profile-sidebar {
    border-right: 1px solid rgba(229, 231, 235, 0.5);
}

:global(.dark) .profile-sidebar {
    border-right-color: rgba(75, 85, 99, 0.3);
}
</style>
