<script setup>
import {
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NLayoutSider,
    NSpace,
    NSwitch,
    NButton,
    NIcon,
    NAvatar,
    NGradientText,
    NDropdown,
    useMessage
} from 'naive-ui';
import { isDark } from '../hooks/useDark';
import { getAccountData, removeAccountData } from '../hooks/useAccount';
import { ref, h } from 'vue';
import { useRouter } from 'vue-router';
import BagButton from '../components/BagButton.vue';
import ProfileSidebar from '../components/ProfileSidebar.vue';

const router = useRouter();
const message = useMessage();
const accountData = ref(getAccountData());

const renderIcon = (iconClass) => {
  return () => h(NIcon, null, { default: () => h('i', { class: iconClass }) });
};

const userDropdownOptions = [
  { label: 'Trang chủ', key: 'home', icon: renderIcon('fa-solid fa-home') },
  { label: 'Thủ thư AI', key: 'ai', icon: renderIcon('fa-solid fa-robot') },
  { type: 'divider', key: 'd1' },
  { label: 'Đăng xuất', key: 'logout', icon: renderIcon('fa-solid fa-right-from-bracket') }
];

const handleDropdownSelect = (key) => {
  if (key === 'home') {
    router.push('/');
  } else if (key === 'ai') {
    router.push('/chat/ai');
  } else if (key === 'logout') {
    removeAccountData();
    message.success('Đăng xuất thành công');
    router.push('/auth/login');
  }
};
</script>

<template>
    <NLayout>
        <NLayoutHeader bordered class="bg-white dark:bg-gray-900">
            <NSpace justify="space-between" class="p-4">
                <NSpace align="center">
                    <RouterLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <NAvatar round size="medium" src="/logo-nobg.png" />
                        <h3 type="warning" class="text-xl font-bold">RuryLib</h3>
                    </RouterLink>
                    <span class="text-gray-400">|</span>
                    <h2 class="dark:text-white text-black text-xl uppercase font-semibold">Trang cá nhân</h2>
                </NSpace>
                <NSpace align="center" :size="16">
                    <BagButton />
                    <NButton text size="large" @click="router.push('/')" class="hidden md:flex">
                        <template #icon><NIcon><i class="fa-solid fa-home"></i></NIcon></template>
                        Trang chủ
                    </NButton>
                    <NButton text size="large" @click="router.push('/chat/ai')" class="hidden md:flex">
                        <template #icon><NIcon><i class="fa-solid fa-robot"></i></NIcon></template>
                        Thủ thư AI
                    </NButton>
                    <NSwitch v-model:value="isDark" size="large">
                        <template #checked-icon><NIcon><i class="fa-solid fa-sun"></i></NIcon></template>
                        <template #unchecked-icon><NIcon><i class="fa-solid fa-moon"></i></NIcon></template>
                    </NSwitch>
                    <NDropdown :options="userDropdownOptions" @select="handleDropdownSelect" trigger="click">
                        <NButton type="primary" size="large">
                            <template #icon><NIcon><i class="fa-solid fa-user"></i></NIcon></template>
                            {{ accountData?.TEN || 'Tài khoản' }}
                            <template #icon-after><NIcon><i class="fa-solid fa-chevron-down"></i></NIcon></template>
                        </NButton>
                    </NDropdown>
                </NSpace>
            </NSpace>
        </NLayoutHeader>
        <NLayout has-sider>
            <NLayoutSider 
                bordered 
                collapse-mode="transform" 
                :width="280" 
            >
                <ProfileSidebar />
            </NLayoutSider>
            <NLayoutContent>
                <router-view></router-view>
            </NLayoutContent>
        </NLayout>
    </NLayout>
</template>

<style scoped>
a { text-decoration: none; color: inherit; }
header { border-bottom: 1px solid rgba(229, 231, 235, 0.5); }
:global(.dark) header { border-bottom-color: rgba(75, 85, 99, 0.3); }
</style>
