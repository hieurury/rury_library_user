<script setup>
import { 
  NSpace, 
  NCard, 
  NGrid, 
  NGi, 
  NTag,
  NEllipsis,
  NImage,
  useMessage,
  NSkeleton,
  NThing,
  NText,
  NBadge,
  NPagination,
  NButton,
  NIcon,
  NEmpty,
  NStatistic,
  NDivider
} from 'naive-ui';

// Define component name for KeepAlive
defineOptions({ name: 'SearchResultsView' });
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { searchBooks, getTopBooks } from '../services/apiBook.js';
import FavoriteButton from '../components/FavoriteButton.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const route = useRoute();
const message = useMessage();

// Data
const searchResults = ref([]);
const topBooks = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const searchInput = ref(''); // Input riêng cho thanh search
const searchTime = ref(0); // Thời gian tìm kiếm
const hasSearched = ref(false); // Đã thực hiện tìm kiếm chưa

// Pagination
const currentPage = ref(1);
const pageSize = ref(9);

// Get query from URL
onMounted(async () => {
  searchQuery.value = route.query.q || '';
  searchInput.value = searchQuery.value; // Sync input với query
  await loadTopBooks();
  if (searchQuery.value) {
    await performSearch();
  }
});

// Watch for route query changes
watch(() => route.query.q, async (newQuery) => {
  if (newQuery !== searchQuery.value) {
    searchQuery.value = newQuery || '';
    searchInput.value = searchQuery.value;
    currentPage.value = 1;
    if (searchQuery.value) {
      await performSearch();
    }
  }
});

const loadTopBooks = async () => {
  try {
    const response = await getTopBooks();
    topBooks.value = response.data;
  } catch (error) {
    // Silent error
  }
};

const performSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  loading.value = true;
  hasSearched.value = false;
  const startTime = performance.now();
  
  try {
    const response = await searchBooks(searchQuery.value);
    searchResults.value = response.data || [];
    searchTime.value = ((performance.now() - startTime) / 1000).toFixed(2);
  } catch (error) {
    message.error('Không thể tìm kiếm sách.');
    searchResults.value = [];
    searchTime.value = 0;
  } finally {
    loading.value = false;
    hasSearched.value = true;
  }
};

// Handle search from input
const handleSearch = () => {
  if (searchInput.value.trim()) {
    router.push({ 
      name: 'Search', 
      query: { q: searchInput.value.trim() } 
    });
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

// Helper: Lấy số lượt mượn từ topBooks
const getBorrowCount = (maSach) => {
  const topBook = topBooks.value.find(b => b.MASACH === maSach);
  return topBook ? topBook.BorrowCount : 0;
};

// Helper: Format giá tiền
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Statistics
const totalResults = computed(() => searchResults.value.length);

const totalCategories = computed(() => {
  const categories = new Set();
  searchResults.value.forEach(book => {
    book.THELOAI?.forEach(cat => categories.add(cat.MaLoai));
  });
  return categories.size;
});

const totalAuthors = computed(() => {
  const authors = new Set();
  searchResults.value.forEach(book => {
    if (book.TACGIA) authors.add(book.TACGIA);
  });
  return authors.size;
});

const avgPrice = computed(() => {
  if (searchResults.value.length === 0) return 0;
  const total = searchResults.value.reduce((sum, book) => sum + (book.DONGIA || 0), 0);
  return total / searchResults.value.length;
});

// Paginated results
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return searchResults.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(searchResults.value.length / pageSize.value);
});

// Navigate to book detail
const goToBook = (bookId) => {
  router.push(`/book/${bookId}`);
};

// Go back to books page
const goToBooks = () => {
  router.push('/books');
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <NSpace vertical size="large">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-2 dark:text-white">Kết quả tìm kiếm</h1>
        <p class="text-gray-600 dark:text-gray-400" v-if="searchQuery">
          Từ khóa: "<span class="font-semibold text-primary">{{ searchQuery }}</span>"
          <span v-if="!loading && searchResults.length > 0" class="ml-2 text-sm">
            ({{ searchTime }}s)
          </span>
        </p>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="search-wrapper">
          <div class="search-icon-left">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
          <input 
            v-model="searchInput"
            type="text" 
            placeholder="Nhập tên sách, tác giả, thể loại...." 
            class="search-input"
            @keypress="handleKeyPress"
          />
          <NButton 
            type="primary" 
            size="large"
            class="search-button"
            @click="handleSearch"
            :loading="loading"
          >
            <template #icon>
              <NIcon><i class="fa-solid fa-search"></i></NIcon>
            </template>
            Tìm kiếm
          </NButton>
        </div>
      </div>

      <!-- Statistics Summary -->
      <NCard v-if="!loading && searchResults.length > 0" class="shadow-md">
          <NGrid :cols="4" :x-gap="24">
            <NGi>
              <NStatistic label="Kết quả tìm thấy" :value="totalResults">
                <template #prefix>
                  <NIcon class="text-blue-500">
                    <i class="fa-solid fa-book"></i>
                  </NIcon>
                </template>
                <template #suffix>sách</template>
              </NStatistic>
            </NGi>
            <NGi>
              <NStatistic label="Thể loại" :value="totalCategories">
                <template #prefix>
                  <NIcon class="text-green-500">
                    <i class="fa-solid fa-tags"></i>
                  </NIcon>
                </template>
              </NStatistic>
            </NGi>
            <NGi>
              <NStatistic label="Tác giả" :value="totalAuthors">
                <template #prefix>
                  <NIcon class="text-purple-500">
                    <i class="fa-solid fa-pen-fancy"></i>
                  </NIcon>
                </template>
              </NStatistic>
            </NGi>
            <NGi>
              <NStatistic label="Giá trung bình">
                <template #prefix>
                  <NIcon class="text-orange-500">
                    <i class="fa-solid fa-tag"></i>
                  </NIcon>
                </template>
                {{ formatPrice(avgPrice) }}
              </NStatistic>
            </NGi>
          </NGrid>
        </NCard>

      <NDivider v-if="loading || searchResults.length > 0" />

      <!-- Results Grid -->
      <NGrid v-if="loading || paginatedResults.length > 0" cols="3" x-gap="24" y-gap="24">
        <!-- Loading Skeletons -->
        <NGi v-if="loading" v-for="n in 9" :key="`skeleton-${n}`" span="1">
          <NSkeleton height="200px" width="100%" />
        </NGi>

        <!-- Books -->
        <NGi v-else v-for="book in paginatedResults" :key="book.MASACH" span="1">
            <NThing 
              class="shadow-md rounded-lg hover:shadow-xl dark:border dark:border-gray-700 h-full transition-shadow duration-200 cursor-pointer bg-white dark:bg-gray-800"
              @click="goToBook(book.MASACH)"
            >
              <template #description>
                <NGrid cols="5" x-gap="12">
                  <!-- Image -->
                  <NGi span="2">
                    <NBadge :value="getBorrowCount(book.MASACH)" processing>
                      <template #value>
                        <NIcon size="14">
                          <i class="fa-solid fa-fire"></i>
                        </NIcon>
                        <span class="ml-0.5">{{ getBorrowCount(book.MASACH) }}</span>
                      </template>
                      <NImage
                        :src="`${API_BASE}${book.HINHANH}`"
                        :alt="book.TENSACH"
                        class="rounded-md"
                        object-fit="cover"
                      />
                    </NBadge>
                  </NGi>

                  <!-- Info -->
                  <NGi span="3" class="overflow-hidden">
                    <NSpace vertical justify="space-between" class="p-2 h-full w-full">
                      <NSpace vertical class="w-full overflow-hidden">
                        <!-- Title -->
                        <NEllipsis :line-clamp="1" :tooltip="{ width: 300, contentStyle: 'color: #fff' }">
                          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ book.TENSACH }}</h3>
                        </NEllipsis>
                        <!-- Author -->
                        <NEllipsis :line-clamp="1" :tooltip="{ width: 300, contentStyle: 'color: #fff' }">
                          <span class="text-sm text-gray-600 dark:text-gray-300">
                            Tác giả: {{ book.TACGIA || 'Chưa rõ' }}
                          </span>
                        </NEllipsis>
                        <!-- Publisher -->
                        <NEllipsis :line-clamp="1" :tooltip="{ width: 300, contentStyle: 'color: #fff' }">
                          <span class="text-sm text-gray-500 dark:text-gray-400">
                            NXB: {{ book.MAXB?.TENNXB || 'Chưa rõ' }}
                          </span>
                        </NEllipsis>
                        <!-- Description -->
                        <NEllipsis :line-clamp="1" :tooltip="{ width: 350, contentStyle: 'color: #fff' }">
                          <span class="text-sm text-gray-700 dark:text-gray-200">
                            {{ book.MOTA || 'Không có mô tả' }}
                          </span>
                        </NEllipsis>

                        <!-- Categories -->
                        <NSpace @click.stop>
                          <NTag
                            v-for="category in book.THELOAI?.slice(0, 2)"
                            :key="category.MaLoai"
                            :color="{ color: category.Color }"
                            size="small"
                            class="cursor-pointer hover:opacity-80"
                            @click="router.push(`/categories/${category.MaLoai}`)"
                          >
                            {{ category.TenLoai }}
                          </NTag>
                        </NSpace>
                      </NSpace>

                      <!-- Price -->
                      <NSpace justify="space-between" align="end">
                        <NTag type="warning" class="font-semibold">
                          <i class="fa-solid fa-tag mr-1"></i>
                          {{ formatPrice(book.DONGIA) }}
                        </NTag>
                        <FavoriteButton :book-id="book.MASACH" size="tiny" circle />
                      </NSpace>
                    </NSpace>
                  </NGi>
                </NGrid>
              </template>
            </NThing>
          </NGi>
        </NGrid>

      <!-- Empty State - Only show after search completed with no results -->
      <NCard v-if="!loading && hasSearched && searchResults.length === 0" class="text-center py-16">
        <NEmpty description="Không tìm thấy kết quả phù hợp">
          <template #icon>
            <NIcon size="64" color="#ccc">
              <i class="fa-solid fa-search"></i>
            </NIcon>
          </template>
          <template #extra>
            <NSpace vertical align="center">
              <p class="text-gray-500 dark:text-gray-400">
                Thử tìm kiếm với từ khóa khác hoặc duyệt thư viện sách
              </p>
              <NButton @click="goToBooks" type="primary">
                <template #icon>
                  <NIcon><i class="fa-solid fa-book"></i></NIcon>
                </template>
                Xem tất cả sách
              </NButton>
            </NSpace>
          </template>
        </NEmpty>
      </NCard>

      <!-- Pagination -->
      <NSpace v-if="!loading && paginatedResults.length > 0" justify="center" class="mt-8">
        <NPagination
          v-model:page="currentPage"
          :page-count="totalPages"
          :page-size="pageSize"
          show-size-picker
          :page-sizes="[9, 18, 27, 36]"
          @update:page-size="(size) => { pageSize = size; currentPage = 1; }"
        />
      </NSpace>
    </NSpace>
  </div>
</template>

<style scoped>
/* Fix NEllipsis overflow */
:deep(.n-ellipsis) {
  max-width: 100%;
  min-width: 0;
}

:deep(.n-grid) {
  min-width: 0;
}

:deep(.n-gi) {
  min-width: 0;
}

/* Search Bar Styles - Same as Homepage */
.search-container {
  width: 100%;
}

.search-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 64px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.search-wrapper:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.search-icon-left {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: #6b7280;
  font-size: 20px;
}

.search-input {
  flex: 1;
  height: 48px;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 0 16px;
  color: #1f2937;
  background: transparent;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 500;
}

.search-button {
  height: 48px;
  padding: 0 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  white-space: nowrap;
}

/* Dark mode */
:global(.dark) .search-wrapper {
  background: rgba(31, 41, 55, 0.9);
  border-color: rgba(75, 85, 99, 0.5);
}

:global(.dark) .search-wrapper:focus-within {
  border-color: #3b82f6;
  background: rgba(31, 41, 55, 1);
}

:global(.dark) .search-input {
  color: #f3f4f6;
}

:global(.dark) .search-input::placeholder {
  color: #9ca3af;
}

:global(.dark) .search-icon-left {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .search-wrapper {
    height: 56px;
  }
  
  .search-icon-left {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .search-input {
    height: 40px;
    font-size: 14px;
    padding: 0 12px;
  }
  
  .search-button {
    height: 40px;
    padding: 0 20px;
    font-size: 14px;
  }
}
</style>
