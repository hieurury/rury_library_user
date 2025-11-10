<script setup>
import { ref, computed, watch } from 'vue';
import {
    NDrawer,
    NDrawerContent,
    NSpace,
    NCard,
    NImage,
    NButton,
    NIcon,
    NEmpty,
    NTag,
    NText,
    NPopconfirm,
    NDivider,
    NSpin,
    NCheckbox,
    useMessage
} from 'naive-ui';
import { useRouter } from 'vue-router';
import { 
    bagItems, 
    removeFromBag, 
    clearBag,
    selectedBagItems,
    toggleSelectedBagItem,
    selectAllBagItems,
    clearSelectedBagItems,
    isSelectedInBag,
    getSelectedBagItems
} from '../hooks/useBag';
import { getAccountData } from '../hooks/useAccount';
import { getBookById } from '../services/apiBook';
import { getUserInfo, getBorrowingCount } from '../services/apiUser';
import { setBookIds, getBookIds, clearBookIds } from '../hooks/usePayment';
import FavoriteButton from './FavoriteButton.vue';
const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

// Props
const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
});

// Emits
const emit = defineEmits(['update:show']);

// Local state
const loading = ref(false);
const booksDetail = ref([]);
const userInfo = ref(null);
const currentBorrowingCount = ref(0);

// Computed
const showDrawer = computed({
    get: () => props.show,
    set: (value) => emit('update:show', value)
});

// Giới hạn số sách tối đa theo gói
const maxBooksAllowed = computed(() => {
    return userInfo.value?.GOI?.SoSachToiDa || 0;
});

// Số sách còn có thể mượn thêm
const remainingSlots = computed(() => {
    return Math.max(0, maxBooksAllowed.value - currentBorrowingCount.value);
});

// Kiểm tra có thể mượn thêm không
const canBorrowMore = computed(() => {
    return selectedBagItems.value.length <= remainingSlots.value;
});

// Watch bagItems để tải thông tin sách
watch(() => bagItems.value, async (newItems) => {
    if (newItems.length === 0) {
        booksDetail.value = [];
        clearSelectedBagItems();
        return;
    }
    loading.value = true;
    try {
        const bookPromises = newItems.map(async (item) => {
            try {
                const res = await getBookById(item.bookId);
                return {
                    ...res.data,
                    copyId: item.copyId,
                    condition: item.condition
                };
            } catch (error) {
                return null;
            }
        });
        
        const books = await Promise.all(bookPromises);
        booksDetail.value = books.filter(book => book !== null);
    } catch (error) {
        // Silent fail
    } finally {
        loading.value = false;
    }
}, { immediate: true, deep: true });

watch(() => props.show, async (newVal) => {
    if (newVal) {
        await loadUserInfo();
    }
}, { immediate: true });

const loadUserInfo = async () => {
    const userData = getAccountData();
    if (!userData) return;
    
    try {
        const [userRes, borrowingRes] = await Promise.all([
            getUserInfo(userData.MADOCGIA),
            getBorrowingCount(userData.MADOCGIA)
        ]);
        
        userInfo.value = userRes.data;
        currentBorrowingCount.value = borrowingRes.data?.count || 0;
    } catch (error) {
        // Silent fail
    }
};

// Methods
const handleRemove = (copyId) => {
    removeFromBag(copyId);
};

const handleClearAll = () => {
    clearBookIds();
    clearBag();
};

const handleCheckboxChange = (copyId, checked) => {
    if (checked && selectedBagItems.value.length >= remainingSlots.value) {
        message.warning(`Bạn chỉ còn có thể mượn thêm ${remainingSlots.value} cuốn sách`);
        return;
    }
    toggleSelectedBagItem(copyId);
};

const handleSelectAll = () => {
    if (selectedBagItems.value.length === bagItems.value.length) {
        clearSelectedBagItems();
    } else {
        // Chọn tối đa số sách còn được phép mượn
        const maxToSelect = Math.min(bagItems.value.length, remainingSlots.value);
        clearSelectedBagItems();
        for (let i = 0; i < maxToSelect; i++) {
            toggleSelectedBagItem(bagItems.value[i].copyId);
        }
    }
};

const handleConfirm = () => {
    const ids = getSelectedBagItems().map(item => item.copyId);
    setBookIds(ids);
    if (selectedBagItems.value.length === 0) {
        message.warning('Vui lòng chọn ít nhất 1 cuốn sách để mượn');
        return;
    }
    
    if (!canBorrowMore.value) {
        message.error(`Bạn chỉ còn có thể mượn thêm ${remainingSlots.value} cuốn sách`);
        return;
    }
    
    // Navigate to confirm page
    router.push('/borrow/confirm');
    showDrawer.value = false;
};
</script>

<template>
    <NDrawer v-model:show="showDrawer" :width="480" placement="right">
        <NDrawerContent title="Balo sách" closable>
            <template #header-extra>
                <NSpace :size="8">
                    <NTag type="info" size="small">
                        {{ bagItems.length }} cuốn
                    </NTag>
                    <NTag 
                        v-if="userInfo" 
                        :type="canBorrowMore ? 'success' : 'error'" 
                        size="small"
                    >
                        Đang mượn: {{ currentBorrowingCount }}/{{ maxBooksAllowed }}
                    </NTag>
                </NSpace>
            </template>

            <div v-if="loading" class="flex justify-center items-center h-64">
                <NSpin size="large" />
            </div>

            <NEmpty v-else-if="bagItems.length === 0" description="Balo trống">
                <template #icon>
                    <NIcon size="60" color="#d1d5db">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </NIcon>
                </template>
                <template #extra>
                    <NButton type="primary" @click="router.push('/')">
                        <template #icon>
                            <NIcon><i class="fa-solid fa-book"></i></NIcon>
                        </template>
                        Khám phá sách
                    </NButton>
                </template>
            </NEmpty>

            <NSpace v-else vertical :size="12">
                <!-- Select All Checkbox -->
                <NCard size="small" :bordered="true" class="bg-blue-50 dark:bg-blue-900/20">
                    <NSpace justify="space-between" align="center">
                        <NCheckbox
                            :checked="selectedBagItems.length === bagItems.length && bagItems.length > 0"
                            :indeterminate="selectedBagItems.length > 0 && selectedBagItems.length < bagItems.length"
                            @update:checked="handleSelectAll"
                        >
                            <NText strong>Chọn tất cả</NText>
                        </NCheckbox>
                        <NSpace :size="4">
                            <NTag 
                                :type="selectedBagItems.length > 0 ? 'info' : 'default'" 
                                size="small"
                            >
                                Đã chọn: {{ selectedBagItems.length }}
                            </NTag>
                            <NTag 
                                :type="canBorrowMore ? 'success' : 'error'" 
                                size="small"
                            >
                                Còn lại: {{ remainingSlots }}
                            </NTag>
                        </NSpace>
                    </NSpace>
                </NCard>
                
                <!-- Book list -->
                <NCard
                    v-for="book in booksDetail"
                    :key="book.copyId"
                    size="small"
                    :bordered="true"
                    :class="[
                        'hover:shadow-md transition-shadow',
                        isSelectedInBag(book.copyId) ? 'border-2 border-blue-500 dark:border-blue-400' : ''
                    ]"
                >
                    <div class="flex gap-3">
                        <!-- Checkbox -->
                        <div class="flex-shrink-0 flex items-center">
                            <NCheckbox
                                :checked="isSelectedInBag(book.copyId)"
                                @update:checked="(val) => handleCheckboxChange(book.copyId, val)"
                                size="large"
                            />
                        </div>
                        
                        <!-- Book Image -->
                        <div class="flex-shrink-0">
                            <NImage
                                :src="`${API_BASE}${book.HINHANH}`"
                                :alt="book.TENSACH"
                                width="60"
                                height="80"
                                object-fit="cover"
                                class="rounded"
                                :fallback-src="'/books/default-book.png'"
                            />
                        </div>

                        <!-- Book Info -->
                        <div class="flex-1 min-w-0">
                            <h4 
                                class="text-sm font-semibold mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                @click="router.push(`/book/${book.MASACH}`)"
                            >
                                {{ book.TENSACH }}
                            </h4>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-1 line-clamp-1">
                                {{ book.TACGIA }}
                            </p>
                            <NSpace :size="4" class="mb-1">
                                <NTag size="tiny" type="info">{{ book.copyId }}</NTag>
                                <NTag 
                                    size="tiny" 
                                    :type="book.condition === 'new' ? 'success' : 'warning'"
                                >
                                    {{ book.condition === 'new' ? 'Mới' : 'Cũ' }}
                                </NTag>
                            </NSpace>
                            <NSpace :size="4">
                                <NTag 
                                    v-for="category in book.THELOAI?.slice(0, 2)" 
                                    :key="category.MaLoai"
                                    :color="{ color: category.Color }"
                                    size="tiny"
                                >
                                    {{ category.TenLoai }}
                                </NTag>
                            </NSpace>
                        </div>

                        <!-- Remove Button -->
                        <div class="flex-shrink-0 flex flex-col gap-1">
                            <FavoriteButton :book-id="book.MASACH" size="tiny" circle />
                            <NPopconfirm
                                @positive-click="handleRemove(book.copyId)"
                                positive-text="Xóa"
                                negative-text="Hủy"
                            >
                                <template #trigger>
                                    <NButton
                                        type="error"
                                        size="small"
                                        quaternary
                                        circle
                                    >
                                        <template #icon>
                                            <NIcon><i class="fa-solid fa-trash"></i></NIcon>
                                        </template>
                                    </NButton>
                                </template>
                                Xóa sách này khỏi balo?
                            </NPopconfirm>
                        </div>
                    </div>
                </NCard>
            </NSpace>

            <template #footer>
                <NSpace v-if="bagItems.length > 0" vertical :size="12">
                    <NDivider class="!my-0" />
                    
                    <!-- User quota info -->
                    <NCard v-if="userInfo" size="small" class="bg-gray-50 dark:bg-gray-800">
                        <NSpace justify="space-between" align="center">
                            <div>
                                <NText depth="3" class="text-xs">Gói: {{ userInfo.GOI?.TenGoi }}</NText>
                            </div>
                            <NSpace :size="4">
                                <NTag type="info" size="tiny">
                                    Đang mượn: {{ currentBorrowingCount }}
                                </NTag>
                                <NTag type="success" size="tiny">
                                    Giới hạn: {{ maxBooksAllowed }}
                                </NTag>
                            </NSpace>
                        </NSpace>
                    </NCard>
                    
                    <NSpace justify="space-between">
                        <NText class="text-sm">
                            Đã chọn: <strong>{{ selectedBagItems.length }}</strong> / {{ bagItems.length }} cuốn
                        </NText>
                        <NPopconfirm
                            @positive-click="handleClearAll"
                            positive-text="Xóa hết"
                            negative-text="Hủy"
                        >
                            <template #trigger>
                                <NButton size="small" quaternary type="error">
                                    <template #icon>
                                        <NIcon><i class="fa-solid fa-trash-can"></i></NIcon>
                                    </template>
                                    Xóa hết
                                </NButton>
                            </template>
                            Xóa tất cả sách trong balo?
                        </NPopconfirm>
                    </NSpace>
                    <NButton 
                        type="primary" 
                        size="large" 
                        block 
                        @click="handleConfirm"
                        :disabled="selectedBagItems.length === 0 || !canBorrowMore"
                    >
                        <template #icon>
                            <NIcon><i class="fa-solid fa-check"></i></NIcon>
                        </template>
                        Xác nhận mượn ({{ selectedBagItems.length }})
                    </NButton>
                    <NText v-if="!canBorrowMore" type="error" class="text-xs text-center">
                        Vượt quá giới hạn! Bạn chỉ còn có thể mượn thêm {{ remainingSlots }} cuốn
                    </NText>
                </NSpace>
            </template>
        </NDrawerContent>
    </NDrawer>
</template>

<style scoped>
.line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
