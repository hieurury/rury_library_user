<script setup>
import { ref, onMounted, h } from 'vue';
import {
    NLayout,
    NLayoutSider,
    NLayoutContent,
    NGrid,
    NGi,
    NCard,
    NImage,
    NButton,
    NIcon,
    NSpace,
    NEmpty,
    NPopconfirm,
    NTag,
    useMessage
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { getAccountData } from '../../hooks/useAccount';
import { getUserInfo, removeFavorite } from '../../services/apiUser';
import { getBookById } from '../../services/apiBook';
import ProfileSidebar from '../../components/ProfileSidebar.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

const userInfo = ref(null);
const favorites = ref([]);
const loading = ref(true);

onMounted(async () => {
    const userData = getAccountData();
    if (!userData) {
        router.push('/auth/login');
        return;
    }

    try {
        // Lấy thông tin user
        const rs = await getUserInfo(userData.MADOCGIA);
        userInfo.value = rs.data;

        // Lấy danh sách favorites từ user
        const favoritesData = userInfo.value.FAVORITES || [];

        // Lấy thông tin chi tiết từng sách
        if (favoritesData.length > 0) {
            const bookPromises = favoritesData.map(async (fav) => {
                try {
                    const bookRes = await getBookById(fav.MASACH);
                    return {
                        ...bookRes.data,
                        addedDate: new Date(fav.NGAYTHEMSACH).toLocaleDateString('vi-VN')
                    };
                } catch (error) {
                    return null;
                }
            });

            const books = await Promise.all(bookPromises);
            favorites.value = books.filter(book => book !== null);
        }
    } catch (error) {
        message.error('Không thể tải danh sách sách yêu thích');
    } finally {
        loading.value = false;
    }
});

const handleRemoveFavorite = async (bookId) => {
    try {
        const userData = getAccountData();
        await removeFavorite(userData.MADOCGIA, bookId);
        
        // Remove từ frontend
        favorites.value = favorites.value.filter(book => book.MASACH !== bookId);
        message.success('Đã xóa khỏi danh sách yêu thích');
    } catch (error) {
        message.error('Không thể xóa sách khỏi danh sách yêu thích');
    }
};

const handleViewBook = (bookId) => {
    router.push(`/book/${bookId}`);
};
</script>

<template>
    <NLayout>
        <NLayoutContent class="min-h-screen p-4">
            <div class="mb-6">
                <h1 class="text-3xl font-bold mb-2">Sách Yêu Thích</h1>
                <p class="text-gray-500 dark:text-gray-400">
                    Quản lý danh sách các cuốn sách bạn đã lưu
                </p>
            </div>

            <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
                <NIcon size="40" class="animate-spin">
                    <i class="fa-solid fa-spinner"></i>
                </NIcon>
            </div>

            <NEmpty v-else-if="favorites.length === 0" 
                description="Bạn chưa có sách yêu thích nào"
                class="min-h-[400px] flex items-center justify-center">
                <template #icon>
                    <NIcon size="60" color="#d1d5db">
                        <i class="fa-solid fa-heart-crack"></i>
                    </NIcon>
                </template>
                <template #extra>
                    <NButton type="primary" @click="router.push('/')">
                        <template #icon>
                            <NIcon><i class="fa-solid fa-magnifying-glass"></i></NIcon>
                        </template>
                        Khám phá sách
                    </NButton>
                </template>
            </NEmpty>

            <NGrid v-else cols="1 s:2 m:3 l:4 xl:5" x-gap="16" y-gap="16">
                <NGi v-for="book in favorites" :key="book.MASACH">
                    <NCard class="h-full hover:shadow-lg transition-shadow duration-300" :bordered="true">
                        <div class="flex flex-col h-full">
                            <!-- Book Image -->
                            <div class="relative mb-3">
                                <NImage
                                    :src="`${API_BASE}${book.HINHANH}`"
                                    :alt="book.TENSACH"
                                    class="w-full h-64 object-cover rounded-md"
                                    :fallback-src="'/books/default-book.png'"
                                />
                                <NTag 
                                    class="absolute top-2 right-2"
                                    type="warning"
                                    size="small"
                                    :bordered="false"
                                >
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-heart"></i></NIcon>
                                    </template>
                                    Yêu thích
                                </NTag>
                            </div>

                            <!-- Book Info -->
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold mb-2 line-clamp-2" :title="book.TENSACH">
                                    {{ book.TENSACH }}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <NIcon size="14"><i class="fa-solid fa-calendar-plus"></i></NIcon>
                                    Đã lưu: {{ book.addedDate }}
                                </p>
                                <p v-if="book.TACGIA" class="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
                                    <NIcon size="14"><i class="fa-solid fa-user-pen"></i></NIcon>
                                    {{ book.TACGIA }}
                                </p>
                            </div>

                            <!-- Actions -->
                            <NSpace class="mt-3" justify="space-between">
                                <NButton 
                                    type="info" 
                                    size="small"
                                    @click="handleViewBook(book.MASACH)"
                                >
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-eye"></i></NIcon>
                                    </template>
                                    Xem chi tiết
                                </NButton>
                                
                                <NPopconfirm
                                    @positive-click="handleRemoveFavorite(book.MASACH)"
                                    positive-text="Xóa"
                                    negative-text="Hủy"
                                >
                                    <template #trigger>
                                        <NButton 
                                            type="error" 
                                            size="small"
                                            quaternary
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-trash"></i></NIcon>
                                            </template>
                                        </NButton>
                                    </template>
                                    Bạn có chắc muốn xóa sách này khỏi danh sách yêu thích?
                                </NPopconfirm>
                            </NSpace>
                        </div>
                    </NCard>
                </NGi>
            </NGrid>
        </NLayoutContent>
    </NLayout>
</template>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
