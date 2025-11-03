<script setup>
import {
    NSpace,
    NCard,
    NImage,
    NButton,
    NIcon,
    NTag,
    NText,
    NDivider,
    NSpin,
    useMessage,
    NGrid,
    NGi,
    NEllipsis,
    NDescriptions,
    NDescriptionsItem,
    NEmpty
} from 'naive-ui';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById } from '../services/apiBook';
import CopySelector from '../components/CopySelector.vue';
import FavoriteButton from '../components/FavoriteButton.vue';
import { addToBag, clearBag } from '../hooks/useBag.js';

const API_BASE = import.meta.env.VITE_API_BASE;
const route = useRoute();
const router = useRouter();
const message = useMessage();

const bookId = ref(null);
const bookData = ref(null);
const loading = ref(false);
const showCopySelector = ref(false);
const copySelectorMode = ref('addOnly'); // 'addOnly' hoặc 'addAndConfirm'

onMounted(async () => {
    bookId.value = route.params.id;
    await loadBookData();
});

const loadBookData = async () => {
    loading.value = true;
    try {
        const rs = await getBookById(bookId.value);
        bookData.value = rs.data;
    } catch (error) {
        message.error('Không thể tải thông tin sách');
    } finally {
        loading.value = false;
    }
};

const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

// Thêm vào balo - chỉ thêm, không chuyển trang
const handleAddToBag = () => {
    copySelectorMode.value = 'addOnly';
    showCopySelector.value = true;
};

// Xác nhận mượn - thêm vào balo và chuyển trang confirm
const handleBorrowNow = () => {
    copySelectorMode.value = 'addAndConfirm';
    showCopySelector.value = true;
};

// Callback khi chỉ thêm vào balo (không chuyển trang)
const handleCopyAdded = () => {
    // Chỉ thông báo, không làm gì thêm
};

// Callback khi thêm và xác nhận (chuyển trang)
const handleCopyAddedAndConfirm = () => {
    router.push('/borrow/confirm');
};

const handleBackHome = () => {
    router.push('/');
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-screen">
            <NSpin size="large" />
        </div>

        <!-- Book Detail Content -->
        <template v-else-if="bookData">
            <div class="container mx-auto px-4 py-8 max-w-7xl">
                <NSpace vertical :size="24">
                    <!-- Back Button -->
                    <NButton text @click="handleBackHome">
                        <template #icon>
                            <NIcon><i class="fa-solid fa-arrow-left"></i></NIcon>
                        </template>
                        Quay lại trang chủ
                    </NButton>

                    <!-- Main Content Grid -->
                    <NGrid cols="1 m:2" x-gap="24" y-gap="24" responsive="screen">
                        <!-- Left: Image -->
                        <NGi>
                            <NCard :bordered="true" class="sticky top-4">
                                <NSpace vertical align="center">
                                    <NImage
                                        :src="`${API_BASE}${bookData.HINHANH}`"
                                        :alt="bookData.TENSACH"
                                        :preview-src="`${API_BASE}${bookData.HINHANH}`"
                                        object-fit="contain"
                                        class="w-full max-h-[500px] rounded-lg shadow-lg"
                                    />
                                    
                                    <!-- Action Buttons -->
                                    <NSpace vertical class="w-full" :size="8">
                                        <FavoriteButton 
                                            :book-id="bookData.MASACH" 
                                            size="large" 
                                            block
                                        />
                                        <NButton 
                                            type="primary" 
                                            size="large"
                                            block
                                            @click="handleAddToBag"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-bag-shopping"></i></NIcon>
                                            </template>
                                            Thêm vào balo
                                        </NButton>
                                        <NButton 
                                            type="success" 
                                            size="large"
                                            block
                                            @click="handleBorrowNow"
                                        >
                                            <template #icon>
                                                <NIcon><i class="fa-solid fa-check-circle"></i></NIcon>
                                            </template>
                                            Xác nhận mượn
                                        </NButton>
                                    </NSpace>

                                    <!-- Price Tag -->
                                    <NTag type="warning" size="large" class="w-full text-center">
                                        <NIcon><i class="fa-solid fa-tag"></i></NIcon>
                                        Giá mượn: {{ formatPrice(bookData.DONGIA || bookData.GIABAN || 0) }}
                                    </NTag>
                                </NSpace>
                            </NCard>
                        </NGi>

                        <!-- Right: Info -->
                        <NGi>
                            <NSpace vertical :size="24">
                                <!-- Title & Basic Info -->
                                <NCard :bordered="true">
                                    <NSpace vertical :size="16">
                                        <h1 class="text-3xl font-bold uppercase">
                                            {{ bookData.TENSACH }}
                                        </h1>

                                        <NDivider class="!my-0" />

                                        <NDescriptions label-placement="left" :column="1" size="medium">
                                            <NDescriptionsItem label="Tác giả">
                                                <NText strong>
                                                    <NIcon class="mr-1"><i class="fa-solid fa-user-pen"></i></NIcon>
                                                    {{ bookData.TACGIA }}
                                                </NText>
                                            </NDescriptionsItem>
                                            
                                            <NDescriptionsItem label="Nhà xuất bản">
                                                <NText>
                                                    <NIcon class="mr-1"><i class="fa-solid fa-building"></i></NIcon>
                                                    {{ bookData.NHAXUATBAN?.TenNXB || 'Đang cập nhật' }}
                                                </NText>
                                            </NDescriptionsItem>

                                            <NDescriptionsItem label="Thể loại">
                                                <NSpace :size="4">
                                                    <NTag
                                                        v-for="category in bookData.THELOAI"
                                                        :key="category.MaLoai"
                                                        :color="{ color: category.Color }"
                                                        size="medium"
                                                    >
                                                        {{ category.TenLoai }}
                                                    </NTag>
                                                </NSpace>
                                            </NDescriptionsItem>

                                            <NDescriptionsItem label="Năm xuất bản">
                                                <NText>
                                                    <NIcon class="mr-1"><i class="fa-solid fa-calendar"></i></NIcon>
                                                    {{ bookData.NAMXUATBAN || 'Đang cập nhật' }}
                                                </NText>
                                            </NDescriptionsItem>

                                            <NDescriptionsItem label="Số quyển">
                                                <NTag type="info">
                                                    <NIcon><i class="fa-solid fa-book-copy"></i></NIcon>
                                                    {{ bookData.SOQUYEN || 0 }} quyển
                                                </NTag>
                                            </NDescriptionsItem>
                                        </NDescriptions>
                                    </NSpace>
                                </NCard>

                                <!-- Description -->
                                <NCard title="Mô tả" :bordered="true">
                                    <NText v-if="bookData.MOTA" class="whitespace-pre-line">
                                        {{ bookData.MOTA }}
                                    </NText>
                                    <NEmpty v-else description="Chưa có mô tả" />
                                </NCard>

                                <!-- Additional Info -->
                                <NCard title="Thông tin chi tiết" :bordered="true">
                                    <NDescriptions label-placement="left" :column="1" size="small">
                                        <NDescriptionsItem label="Mã sách">
                                            <NTag size="small">{{ bookData.MASACH }}</NTag>
                                        </NDescriptionsItem>
                                        
                                        <NDescriptionsItem label="Ngôn ngữ">
                                            {{ bookData.NGONNGU || 'Tiếng Việt' }}
                                        </NDescriptionsItem>

                                        <NDescriptionsItem label="Số trang">
                                            {{ bookData.SOTRANG || 'Đang cập nhật' }} trang
                                        </NDescriptionsItem>

                                        <NDescriptionsItem label="Kích thước">
                                            {{ bookData.KICHTHUOC || 'Đang cập nhật' }}
                                        </NDescriptionsItem>

                                        <NDescriptionsItem label="Trọng lượng">
                                            {{ bookData.TRONGLUONG || 'Đang cập nhật' }}
                                        </NDescriptionsItem>
                                    </NDescriptions>
                                </NCard>
                            </NSpace>
                        </NGi>
                    </NGrid>
                </NSpace>
            </div>
        </template>

        <!-- Empty State -->
        <div v-else class="flex justify-center items-center h-screen">
            <NEmpty description="Không tìm thấy sách" />
        </div>

        <!-- Copy Selector Modal -->
        <CopySelector
            v-model:show="showCopySelector"
            :book-id="bookData?.MASACH"
            :book-name="bookData?.TENSACH"
            :mode="copySelectorMode"
            @added="handleCopyAdded"
            @added-and-confirm="handleCopyAddedAndConfirm"
        />
    </div>
</template>

<style scoped>
.container {
    max-width: 1400px;
}
</style>