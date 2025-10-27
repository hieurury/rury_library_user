import { ref, computed } from 'vue';

const BAG_KEY = 'book-bag';

// Lấy dữ liệu balo từ localStorage
const getBagData = () => {
    try {
        const data = localStorage.getItem(BAG_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading bag data:', error);
        return [];
    }
};

// Lưu dữ liệu balo vào localStorage
const setBagData = (data) => {
    try {
        localStorage.setItem(BAG_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving bag data:', error);
    }
};

// Reactive bag state
// Cấu trúc mới: [{ bookId: 'SACH001', copyId: 'SACH001T001', condition: 'new' }, ...]
const bagItems = ref(getBagData());

// Selected items for borrowing (array of copyIds)
const selectedBagItems = ref([]);

// Computed: Số lượng sách trong balo
const bagCount = computed(() => bagItems.value.length);

// Computed: Số lượng sách được chọn
const selectedCount = computed(() => selectedBagItems.value.length);

// Thêm sách vào balo (với thông tin bản sao)
const addToBag = (bookId, copyId, condition = 'new') => {
    if (!bookId || !copyId) return false;
    
    // Kiểm tra bản sao này đã có trong balo chưa
    const existingIndex = bagItems.value.findIndex(item => item.copyId === copyId);
    if (existingIndex > -1) {
        return false; // Bản sao đã tồn tại
    }
    
    bagItems.value.push({ bookId, copyId, condition });
    setBagData(bagItems.value);
    return true; // Thêm thành công
};

// Xóa sách khỏi balo (theo copyId)
const removeFromBag = (copyId) => {
    const index = bagItems.value.findIndex(item => item.copyId === copyId);
    if (index > -1) {
        bagItems.value.splice(index, 1);
        setBagData(bagItems.value);
        return true;
    }
    return false;
};

// Kiểm tra bản sao có trong balo không
const isInBag = (copyId) => {
    return bagItems.value.some(item => item.copyId === copyId);
};

// Kiểm tra sách (bất kỳ bản sao nào) có trong balo không
const hasBookInBag = (bookId) => {
    return bagItems.value.some(item => item.bookId === bookId);
};

// Xóa toàn bộ balo
const clearBag = () => {
    bagItems.value = [];
    selectedBagItems.value = [];
    setBagData([]);
};

// Lấy số lượng sách trong balo
const getBagCount = () => {
    return bagItems.value.length;
};

// Toggle selected item
const toggleSelectedBagItem = (copyId) => {
    const index = selectedBagItems.value.indexOf(copyId);
    if (index > -1) {
        selectedBagItems.value.splice(index, 1);
    } else {
        selectedBagItems.value.push(copyId);
    }
};

// Select all bag items
const selectAllBagItems = () => {
    selectedBagItems.value = bagItems.value.map(item => item.copyId);
};

// Clear selection
const clearSelectedBagItems = () => {
    selectedBagItems.value = [];
};

// Get selected items detail
const getSelectedBagItems = () => {
    return bagItems.value.filter(item => selectedBagItems.value.includes(item.copyId));
};

// Check if item is selected
const isSelectedInBag = (copyId) => {
    return selectedBagItems.value.includes(copyId);
};

export {
    bagItems,
    bagCount,
    selectedBagItems,
    selectedCount,
    getBagData,
    setBagData,
    addToBag,
    removeFromBag,
    isInBag,
    hasBookInBag,
    clearBag,
    getBagCount,
    toggleSelectedBagItem,
    selectAllBagItems,
    clearSelectedBagItems,
    getSelectedBagItems,
    isSelectedInBag
};
