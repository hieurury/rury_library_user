import { ref, computed } from 'vue';

const BALO_STORAGE_KEY = 'rurylib_balo';

// Reactive state for balo items
const baloItems = ref([]);

/**
 * Load balo items from localStorage
 * @returns {Array} Array of maBanSao IDs
 */
const loadBaloFromStorage = () => {
    try {
        const stored = localStorage.getItem(BALO_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
};

/**
 * Save balo items to localStorage
 * @param {Array} items - Array of maBanSao IDs
 */
const saveBaloToStorage = (items) => {
    try {
        localStorage.setItem(BALO_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        // Silent error
    }
};

/**
 * Initialize balo from localStorage
 */
const initBalo = () => {
    baloItems.value = loadBaloFromStorage();
};

/**
 * Add a book copy to balo
 * @param {String} maBanSao - ID of book copy
 * @returns {Boolean} true if added, false if already exists
 */
const addToBalo = (maBanSao) => {
    if (!maBanSao) return false;
    
    // Check if already exists
    if (baloItems.value.includes(maBanSao)) {
        return false;
    }
    
    // Add to array
    baloItems.value.push(maBanSao);
    
    // Save to localStorage
    saveBaloToStorage(baloItems.value);
    
    return true;
};

/**
 * Remove a book copy from balo
 * @param {String} maBanSao - ID of book copy
 * @returns {Boolean} true if removed, false if not found
 */
const removeFromBalo = (maBanSao) => {
    const index = baloItems.value.indexOf(maBanSao);
    
    if (index === -1) {
        return false;
    }
    
    // Remove from array
    baloItems.value.splice(index, 1);
    
    // Save to localStorage
    saveBaloToStorage(baloItems.value);
    
    return true;
};

/**
 * Get all balo items
 * @returns {Array} Array of maBanSao IDs
 */
const getBaloItems = () => {
    return [...baloItems.value];
};

/**
 * Clear all items from balo
 */
const clearBalo = () => {
    baloItems.value = [];
    saveBaloToStorage([]);
};

/**
 * Get count of items in balo
 * @returns {Number} Count of items
 */
const getBaloCount = computed(() => {
    return baloItems.value.length;
});

/**
 * Check if a book copy is in balo
 * @param {String} maBanSao - ID of book copy
 * @returns {Boolean} true if in balo
 */
const isInBalo = (maBanSao) => {
    return baloItems.value.includes(maBanSao);
};

// Initialize on module load
initBalo();

export default {
    baloItems,
    getBaloCount,
    addToBalo,
    removeFromBalo,
    getBaloItems,
    clearBalo,
    isInBalo,
    initBalo
};
