<script setup>
import {
    NSpace,
    NButton,
    NImage
}                               from    'naive-ui';
import {
    useRouter
}                               from    'vue-router';

const router = useRouter();
const BASE_API = import.meta.env.VITE_BASE_API;

const goHome = () => {
    router.push('/');
};

const goBack = () => {
    router.back();
};
</script>

<template>
    <NSpace vertical justify="center" align="center" class="min-h-screen bg-[url('/banner/book-bg2.png')] bg-cover">
        <NSpace vertical align="center" class="text-center p-8">
            <div class="relative">
                <h1 class="animate-bounce text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 leading-none">
                    404
                </h1>
            </div>

            <!-- Message -->
            <NSpace vertical align="center" class="mt-4">
                <h2 class="text-3xl font-semibold text-white">
                    Oops! Trang không tồn tại
                </h2>
                <p class="text-slate-400 text-lg max-w-md">
                    Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
                </p>
            </NSpace>

            <!-- decor -->
            <NSpace class="my-8" align="center">
                <i class="fa-solid fa-book text-4xl text-purple-500/50 transform -rotate-12"></i>
                <i class="fa-solid fa-book-bookmark text-5xl text-pink-500/50"></i>
                <i class="fa-solid fa-book text-4xl text-purple-500/50 transform rotate-12"></i>
            </NSpace>

            <!-- Action buttons -->
            <NSpace class="mt-4">
                <NButton 
                    @click="goBack" 
                    size="large"
                    quaternary
                    class="text-white"
                    style="color: white;"
                >
                    <template #icon>
                        <i class="fa-solid fa-arrow-left"></i>
                    </template>
                    Quay lại
                </NButton>
                <NButton 
                    @click="goHome" 
                    size="large"
                    color="rgb(136, 8, 136)"
                >
                    <template #icon>
                        <i class="fa-solid fa-house"></i>
                    </template>
                    Về trang chủ
                </NButton>
            </NSpace>

            <!-- Footer hint -->
            <p class="text-slate-500 text-sm mt-12">
                <i class="fa-solid fa-circle-info mr-1"></i>
                Nếu bạn cho rằng đây là lỗi, vui lòng liên hệ hỗ trợ.
            </p>
        </NSpace>
    </NSpace>
</template>

<style scoped>
</style>
