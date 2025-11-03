<script setup>
import {
    NSpace,
    NGrid,
    NGi,
    NDivider,
    NIcon,
    NGradientText,
    NAvatar,
    NButton
} from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
    <footer class="bg-gray-900 text-gray-300 py-12">
        <div class="container mx-auto px-8 max-w-7xl">
            <NGrid :cols="4" :x-gap="32" :y-gap="24">
                <!-- Logo & About -->
                <NGi :span="1">
                    <NSpace vertical :size="16">
                        <RouterLink to="/" class="flex items-center gap-3">
                            <NAvatar
                                round
                                size="large"
                                src="/logo-nobg.png"
                            />
                            <NGradientText 
                                type="warning"
                                class="text-2xl font-bold"
                            >
                                RuryLib
                            </NGradientText>
                        </RouterLink>
                        <p class="text-sm text-gray-400">
                            Thư viện sách trực tuyến hiện đại, mang đến trải nghiệm đọc sách tốt nhất cho bạn.
                        </p>
                        <NSpace :size="12">
                            <NButton text class="text-gray-400 hover:text-white">
                                <NIcon size="20"><i class="fab fa-facebook"></i></NIcon>
                            </NButton>
                            <NButton text class="text-gray-400 hover:text-white">
                                <NIcon size="20"><i class="fab fa-twitter"></i></NIcon>
                            </NButton>
                            <NButton text class="text-gray-400 hover:text-white">
                                <NIcon size="20"><i class="fab fa-instagram"></i></NIcon>
                            </NButton>
                            <NButton text class="text-gray-400 hover:text-white">
                                <NIcon size="20"><i class="fab fa-youtube"></i></NIcon>
                            </NButton>
                        </NSpace>
                    </NSpace>
                </NGi>

                <!-- Quick Links -->
                <NGi :span="1">
                    <NSpace vertical :size="12">
                        <h3 class="text-white font-semibold text-lg mb-2">Liên kết nhanh</h3>
                        <RouterLink to="/" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-home"></i></NIcon>
                            Trang chủ
                        </RouterLink>
                        <RouterLink to="/books" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-book"></i></NIcon>
                            Sách
                        </RouterLink>
                        <RouterLink to="/test/ai" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-robot"></i></NIcon>
                            Thủ thư AI
                        </RouterLink>
                        <RouterLink to="/user/profile" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-user"></i></NIcon>
                            Trang cá nhân
                        </RouterLink>
                    </NSpace>
                </NGi>

                <!-- Support -->
                <NGi :span="1">
                    <NSpace vertical :size="12">
                        <h3 class="text-white font-semibold text-lg mb-2">Hỗ trợ</h3>
                        <a href="#" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-question-circle"></i></NIcon>
                            Câu hỏi thường gặp
                        </a>
                        <a href="#" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-book-open"></i></NIcon>
                            Hướng dẫn mượn sách
                        </a>
                        <a href="#" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-shield-alt"></i></NIcon>
                            Chính sách bảo mật
                        </a>
                        <a href="#" class="text-sm hover:text-white transition-colors block">
                            <NIcon class="mr-2"><i class="fa-solid fa-file-contract"></i></NIcon>
                            Điều khoản sử dụng
                        </a>
                    </NSpace>
                </NGi>

                <!-- Contact -->
                <NGi :span="1">
                    <NSpace vertical :size="12">
                        <h3 class="text-white font-semibold text-lg mb-2">Liên hệ</h3>
                        <div class="text-sm">
                            <NIcon class="mr-2"><i class="fa-solid fa-map-marker-alt"></i></NIcon>
                            123 Đường Sách, Quận 1, TP.HCM
                        </div>
                        <div class="text-sm">
                            <NIcon class="mr-2"><i class="fa-solid fa-phone"></i></NIcon>
                            (84) 123-456-789
                        </div>
                        <div class="text-sm">
                            <NIcon class="mr-2"><i class="fa-solid fa-envelope"></i></NIcon>
                            contact@rurylib.com
                        </div>
                        <div class="text-sm">
                            <NIcon class="mr-2"><i class="fa-solid fa-clock"></i></NIcon>
                            T2-T7: 8:00 - 20:00
                        </div>
                    </NSpace>
                </NGi>
            </NGrid>

            <NDivider class="my-8 border-gray-700" />

            <div class="text-center text-sm text-gray-500">
                <p>© 2024 RuryLib. All rights reserved.</p>
                <p class="mt-2">Made with <NIcon color="red"><i class="fa-solid fa-heart"></i></NIcon> by RuryLib Team</p>
            </div>
        </div>
    </footer>
</template>

<style scoped>
a {
    text-decoration: none;
    color: inherit;
}

footer {
    border-top: 1px solid rgba(75, 85, 99, 0.3);
}
</style>
