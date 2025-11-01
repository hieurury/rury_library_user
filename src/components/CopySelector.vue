<script setup>
import { ref, watch } from 'vue';
import {
    NModal,
    NCard,
    NSpace,
    NButton,
    NIcon,
    NTag,
    NSpin,
    NEmpty,
    useMessage,
    NRadioGroup,
    NRadioButton,
    NText
} from 'naive-ui';
import { getAvailableCopies } from '../services/apiBook';
import { addToBag, isInBag } from '../hooks/useBag';
import { setBookIds, getBookIds } from '../hooks/usePayment';

const props = defineProps({
    show: Boolean,
    bookId: String,
    bookName: String,
    mode: {
        type: String,
        default: 'addOnly' // 'addOnly' hoặc 'addAndConfirm'
    }
});

const emit = defineEmits(['update:show', 'added', 'addedAndConfirm']);

const message = useMessage();
const loading = ref(false);
const copies = ref([]);
const selectedCopy = ref(null);
const totalAvailable = ref(0);

// Watch show prop để load copies khi modal mở
watch(() => props.show, async (newVal) => {
    if (newVal && props.bookId) {
        await loadCopies();
    }
}, { immediate: true });

const loadCopies = async () => {
    loading.value = true;
    try {
        const response = await getAvailableCopies(props.bookId);
        copies.value = response.data.copies || [];
        totalAvailable.value = response.data.totalAvailable || 0;
        
        // Auto select first available copy not in bag
        const firstAvailable = copies.value.find(copy => !isInBag(copy.MA_BANSAO));
        if (firstAvailable) {
            selectedCopy.value = firstAvailable.MA_BANSAO;
        }
    } catch (error) {
        console.error(error);
        message.error('Không thể tải danh sách bản sao');
    } finally {
        loading.value = false;
    }
};

const handleConfirm = () => {
    if (!selectedCopy.value) {
        message.warning('Vui lòng chọn bản sao');
        return;
    }
    
    const copy = copies.value.find(c => c.MA_BANSAO === selectedCopy.value);
    if (!copy) return;
    
    // Kiểm tra đã có trong balo chưa
    if (isInBag(selectedCopy.value)) {
        message.warning('Bản sao này đã có trong balo');
        return;
    }
    const bookIdsInBag = getBookIds();
    setBookIds([...bookIdsInBag, copy.MA_BANSAO]);
    // Thêm vào balo
    const success = addToBag(props.bookId, selectedCopy.value, copy.TINHTRANG);
    
    if (success) {
        const conditionText = copy.TINHTRANG === 'new' ? 'Mới' : 'Cũ';
        message.success(`Đã thêm bản sao (${conditionText}) vào balo`);
        
        handleClose();
        
        // Emit event tương ứng với mode
        // QUAN TRỌNG: Chỉ emit SAU KHI đóng modal để tránh race condition
        if (props.mode === 'addAndConfirm') {
            emit('addedAndConfirm', { bookId: props.bookId, copyId: selectedCopy.value });
        } else {
            emit('added', { bookId: props.bookId, copyId: selectedCopy.value });
        }
    } else {
        message.error('Không thể thêm vào balo');
    }
};

const handleClose = () => {
    emit('update:show', false);
    selectedCopy.value = null;
};

const getConditionColor = (condition) => {
    return condition === 'new' ? 'success' : 'warning';
};

const getConditionText = (condition) => {
    return condition === 'new' ? 'Mới' : 'Cũ';
};
</script>

<template>
    <NModal
        :show="show"
        @update:show="handleClose"
        preset="card"
        title="Chọn bản sao sách"
        class="max-w-md"
        :bordered="false"
    >
        <template #header>
            <NSpace vertical :size="4">
                <div class="font-bold text-lg">Chọn bản sao sách</div>
                <NText depth="3" class="text-sm">{{ bookName }}</NText>
            </NSpace>
        </template>

        <div v-if="loading" class="flex justify-center items-center h-40">
            <NSpin size="large" />
        </div>

        <div v-else-if="copies.length === 0">
            <NEmpty description="Không có bản sao nào available">
                <template #extra>
                    <NText depth="3">Tất cả bản sao đã được mượn hết</NText>
                </template>
            </NEmpty>
        </div>

        <NSpace v-else vertical :size="16">
            <div class="flex items-center justify-between">
                <NText>
                    <NIcon><i class="fa-solid fa-books"></i></NIcon>
                    Có <strong>{{ totalAvailable }}</strong> bản sao khả dụng
                </NText>
            </div>

            <NRadioGroup v-model:value="selectedCopy" name="copy-selector">
                <NSpace vertical :size="8">
                    <div
                        v-for="copy in copies"
                        :key="copy.MA_BANSAO"
                        :class="[
                            'border rounded-lg p-3 cursor-pointer transition-all',
                            selectedCopy === copy.MA_BANSAO 
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                : 'border-gray-200 dark:border-gray-700',
                            isInBag(copy.MA_BANSAO) ? 'opacity-50 cursor-not-allowed' : ''
                        ]"
                        @click="!isInBag(copy.MA_BANSAO) && (selectedCopy = copy.MA_BANSAO)"
                    >
                        <NSpace justify="space-between" align="center">
                            <NSpace vertical :size="4">
                                <NSpace :size="8" align="center">
                                    <NRadioButton 
                                        :value="copy.MA_BANSAO"
                                        :disabled="isInBag(copy.MA_BANSAO)"
                                    />
                                    <div>
                                        <div class="font-mono text-sm">{{ copy.MA_BANSAO }}</div>
                                        <NText v-if="copy.GHICHU" depth="3" class="text-xs">
                                            {{ copy.GHICHU }}
                                        </NText>
                                    </div>
                                </NSpace>
                            </NSpace>

                            <NSpace :size="4">
                                <NTag 
                                    :type="getConditionColor(copy.TINHTRANG)" 
                                    size="small"
                                >
                                    {{ getConditionText(copy.TINHTRANG) }}
                                </NTag>
                                <NTag v-if="isInBag(copy.MA_BANSAO)" type="info" size="small">
                                    Trong balo
                                </NTag>
                            </NSpace>
                        </NSpace>
                    </div>
                </NSpace>
            </NRadioGroup>
        </NSpace>

        <template #footer>
            <NSpace justify="end">
                <NButton @click="handleClose">Hủy</NButton>
                <NButton 
                    type="primary" 
                    @click="handleConfirm"
                    :disabled="!selectedCopy || copies.length === 0"
                >
                    <template #icon>
                        <NIcon><i class="fa-solid fa-check"></i></NIcon>
                    </template>
                    Thêm vào balo
                </NButton>
            </NSpace>
        </template>
    </NModal>
</template>

<style scoped>
.n-radio-button {
    cursor: pointer;
}
</style>
