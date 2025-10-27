<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { NButton, NIcon, useMessage } from 'naive-ui';
import { getAccountData } from '../hooks/useAccount';
import { addFavorite, removeFavorite, getUserInfo } from '../services/apiUser';

const props = defineProps({
    bookId: {
        type: String,
        required: true
    },
    size: {
        type: String,
        default: 'medium' // tiny, small, medium, large
    },
    circle: {
        type: Boolean,
        default: false
    }
});

const message = useMessage();
const loading = ref(false);
const isFavorite = ref(false);
const userFavorites = ref([]);

// Check if user is logged in
const userData = computed(() => getAccountData());
const isLoggedIn = computed(() => userData.value !== null);

// Load user favorites on mount
onMounted(async () => {
    if (!isLoggedIn.value) return;
    
    try {
        const res = await getUserInfo(userData.value.MADOCGIA);
        userFavorites.value = res.data.FAVORITES || [];
        checkIsFavorite();
    } catch (error) {
        console.error('Error loading favorites:', error);
    }
});

// Watch bookId changes
watch(() => props.bookId, () => {
    checkIsFavorite();
});

const checkIsFavorite = () => {
    isFavorite.value = userFavorites.value.some(fav => fav.MASACH === props.bookId);
};

const handleClick = async () => {
    if (!isLoggedIn.value) {
        message.warning('Vui lòng đăng nhập để sử dụng tính năng này');
        return;
    }
    
    loading.value = true;
    try {
        if (isFavorite.value) {
            // Remove from favorites
            await removeFavorite(userData.value.MADOCGIA, props.bookId);
            userFavorites.value = userFavorites.value.filter(fav => fav.MASACH !== props.bookId);
            isFavorite.value = false;
            message.success('Đã xóa khỏi yêu thích');
        } else {
            // Add to favorites
            await addFavorite(userData.value.MADOCGIA, props.bookId);
            userFavorites.value.push({ MASACH: props.bookId, NGAYTHEMSACH: new Date() });
            isFavorite.value = true;
            message.success('Đã thêm vào yêu thích');
        }
    } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <NButton
        :type="isFavorite ? 'warning' : 'default'"
        :size="size"
        :circle="circle"
        :loading="loading"
        @click.stop="handleClick"
        :secondary="!isFavorite"
        :title="isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
    >
        <template #icon>
            <NIcon>
                <i :class="isFavorite ? 'fa-solid fa-star' : 'fa-regular fa-star'"></i>
            </NIcon>
        </template>
        <slot>{{ isFavorite ? 'Đã thích' : 'Yêu thích' }}</slot>
    </NButton>
</template>
