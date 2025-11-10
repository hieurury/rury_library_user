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
  NInput,
  NSelect,
  NButton,
  NIcon,
  NSlider,
  NDivider,
  NLayout,
  NLayoutSider,
  NLayoutContent
} from 'naive-ui';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getAllBooks, getTopBooks } from '../services/apiBook.js';
import { getCategories } from '../services/apiCategories.js';
import FavoriteButton from '../components/FavoriteButton.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();

// Data
const allBooks = ref([]);
const topBooks = ref([]);
const allCategories = ref([]);
const loading = ref(false);

// Filters
const searchQuery = ref('');
const selectedCategory = ref(null);
const selectedYearRange = ref(null);
const priceRange = ref([0, 10000]);
const borrowRange = ref([0, 10]);

// Pagination
const currentPage = ref(1);
const pageSize = ref(9);

onMounted(async () => {
  await Promise.all([
    loadAllBooks(),
    loadTopBooks(),
    loadCategories()
  ]);
});

const loadAllBooks = async () => {
  loading.value = true;
  try {
    const response = await getAllBooks();
    allBooks.value = response.data;
  } catch (error) {
    message.error('Không thể tải danh sách sách.');
  } finally {
    loading.value = false;
  }
};

const loadTopBooks = async () => {
  try {
    const response = await getTopBooks();
    topBooks.value = response.data;
  } catch (error) {
    // Silent error
  }
};

const loadCategories = async () => {
  try {
    const response = await getCategories();
    allCategories.value = response.data;
  } catch (error) {
    message.error('Không thể tải danh mục thể loại.');
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

const formatDate = (dateString) => {
    if(!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

// Helper: Tạo cụm năm cố định
const yearRangeOptions = [
  { label: 'Tất cả năm', value: null },
  { label: 'Trước 2020', value: 'before-2020', start: 0, end: 2019 },
  { label: '2020 - 2022', value: '2020-2022', start: 2020, end: 2022 },
  { label: '2022 - 2024', value: '2022-2024', start: 2022, end: 2024 },
  { label: '2024 - Hiện tại', value: '2024-now', start: 2024, end: new Date().getFullYear() }
];

// Helper: Tính max price (giới hạn 10,000)
const maxPrice = computed(() => {
  return 10000;
});

// Helper: Tính max borrow (giới hạn 10)
const maxBorrow = computed(() => {
  return 10;
});

// Watch maxPrice và maxBorrow để update slider (không cần nữa vì giá trị cố định)
// watch(maxPrice, (newMax) => {
//   priceRange.value = [0, newMax];
// });

// watch(maxBorrow, (newMax) => {
//   borrowRange.value = [0, newMax];
// });

// Options cho select
const categoryOptions = computed(() => [
  { label: 'Tất cả thể loại', value: null },
  ...allCategories.value.map(c => ({
    label: c.TenLoai,
    value: c.MaLoai
  }))
]);

const yearOptions = yearRangeOptions;

// Filtered books
const filteredBooks = computed(() => {
  let result = allBooks.value;

  // Filter by search query (tên sách hoặc tác giả)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book => 
      book.TENSACH.toLowerCase().includes(query) ||
      book.TACGIA.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(book => 
      book.THELOAI && book.THELOAI.some(tl => tl.MaLoai === selectedCategory.value)
    );
  }

  // Filter by year range
  if (selectedYearRange.value) {
    const range = yearRangeOptions.find(r => r.value === selectedYearRange.value);
    if (range && range.value !== null) {
      result = result.filter(book => 
        book.NAMXUATBAN >= range.start && book.NAMXUATBAN <= range.end
      );
    }
  }

  // Filter by price range
  result = result.filter(book => {
    const price = book.DONGIA || 0;
    return price >= priceRange.value[0] && price <= priceRange.value[1];
  });

  // Filter by borrow count
  result = result.filter(book => {
    const borrow = getBorrowCount(book.MASACH);
    return borrow >= borrowRange.value[0] && borrow <= borrowRange.value[1];
  });

  return result;
});

// Paginated books
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredBooks.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredBooks.value.length / pageSize.value);
});

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = null;
  selectedYearRange.value = null;
  priceRange.value = [0, 10000];
  borrowRange.value = [0, 10];
  currentPage.value = 1;
};

// Reset page when filters change
watch([searchQuery, selectedCategory, selectedYearRange, priceRange, borrowRange], () => {
  currentPage.value = 1;
});
</script>

<template>
  <NLayout has-sider class="min-h-screen">
    <!-- Sider - Bộ lọc -->
    <NLayoutSider
      bordered
      collapse-mode="width"
      :width="320"
      :native-scrollbar="false"
      class="bg-white dark:bg-gray-800"
    >
      <div class="p-6 sticky top-0 bottom-0 overflow-auto">
        <NSpace vertical size="large">
          <!-- Header Sider -->
          <div>
            <h2 class="text-2xl font-bold mb-2">Bộ lọc</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tìm thấy <strong>{{ filteredBooks.length }}</strong> cuốn sách
            </p>
          </div>

          <NDivider class="!my-2" />

          <!-- Search -->
          <div>
            <NText class="block mb-2 font-semibold">Tìm kiếm</NText>
            <NInput
              v-model:value="searchQuery"
              placeholder="Tên sách hoặc tác giả..."
              clearable
            >
              <template #prefix>
                <NIcon>
                  <i class="fa-solid fa-magnifying-glass"></i>
                </NIcon>
              </template>
            </NInput>
          </div>

          <!-- Category Filter -->
          <div>
            <NText class="block mb-2 font-semibold">Thể loại</NText>
            <NSelect
              v-model:value="selectedCategory"
              :options="categoryOptions"
              placeholder="Chọn thể loại"
              clearable
            />
          </div>

          <!-- Year Range Filter -->
          <div>
            <NText class="block mb-2 font-semibold">Năm xuất bản</NText>
            <NSelect
              v-model:value="selectedYearRange"
              :options="yearOptions"
              placeholder="Chọn năm xuất bản"
              clearable
            />
          </div>

          <!-- Price Range -->
          <div>
            <NText class="block mb-2 font-semibold">
              Giá mượn: {{ formatPrice(priceRange[0]) }} - {{ formatPrice(priceRange[1]) }}
            </NText>
            <NSlider
              v-model:value="priceRange"
              :min="0"
              :max="10000"
              :step="500"
              range
            />
          </div>

          <!-- Borrow Count Range -->
          <div>
            <NText class="block mb-2 font-semibold">
              Số lượt mượn: {{ borrowRange[0] }} - {{ borrowRange[1] }}
            </NText>
            <NSlider
              v-model:value="borrowRange"
              :min="0"
              :max="10"
              :step="1"
              range
            />
          </div>

          <NDivider class="!my-2" />

          <!-- Reset Button -->
          <NButton @click="resetFilters" secondary block>
            <template #icon>
              <NIcon>
                <i class="fa-solid fa-rotate-right"></i>
              </NIcon>
            </template>
            Đặt lại bộ lọc
          </NButton>
        </NSpace>
      </div>
    </NLayoutSider>

    <!-- Content - Danh sách sách -->
    <NLayoutContent class="p-8 bg-gray-50 dark:bg-gray-900">
      <NSpace vertical size="large">
        <!-- Header -->
        <div class="text-center">
          <h1 class="text-4xl font-bold mb-2">Thư viện sách</h1>
          <p class="text-gray-500 dark:text-gray-400">
            Khám phá {{ allBooks.length }} đầu sách đa dạng
          </p>
        </div>

        <!-- Books Grid -->
        <NGrid cols="3" x-gap="24" y-gap="24">
          <!-- Loading -->
          <NGi v-if="loading" v-for="n in 9" :key="`skeleton-${n}`" span="1">
            <NSkeleton height="400px" width="100%" />
          </NGi>

          <!-- Books -->
          <NGi v-else v-for="book in paginatedBooks" :key="book.MASACH" span="1">
                <NThing 
                  class="shadow-md rounded-lg hover:shadow-xl dark:border dark:border-gray-700 transition-shadow duration-200 cursor-pointer"
                  @click="router.push(`/book/${book.MASACH}`)"
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
                      <NGi span="3">
                        <NSpace vertical justify="space-between" class="p-2 h-full">
                          <NSpace vertical>
                              <!-- Title -->
                            <NEllipsis :line-clamp="1" class="max-w-full">
                              <h3 class="text-lg font-semibold">{{ book.TENSACH }}</h3>
                            </NEllipsis>
                              <!-- Author -->
                              <NEllipsis :line-clamp="1" class="text-sm text-gray-500 dark:text-gray-400 max-w-full">
                                  Tác giả: {{ book.TACGIA }} - Nhà xuất bản: {{ book.MAXB.TENNXB }}
                            </NEllipsis>
                            <!-- Description -->
                            <NEllipsis :line-clamp="2" class="text-sm text-gray-600 dark:text-gray-400 max-w-full">
                              {{ book.MOTA }}
                            </NEllipsis>

                            <!-- Categories -->
                            <NSpace>
                              <NTag
                                v-for="category in book.THELOAI?.slice(0, 2)"
                                :key="category.MaLoai"
                                :color="{ color: category.Color }"
                                size="small"
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

          <!-- Empty State -->
          <NGi v-if="!loading && paginatedBooks.length === 0" span="3">
            <NCard class="text-center py-16">
              <NSpace vertical align="center">
                <NIcon size="64" color="#ccc">
                  <i class="fa-solid fa-book"></i>
                </NIcon>
                <h3 class="text-xl font-semibold">Không tìm thấy sách</h3>
                <p class="text-gray-500">Thử điều chỉnh bộ lọc để xem thêm kết quả</p>
                <NButton @click="resetFilters" type="primary">
                  Đặt lại bộ lọc
                </NButton>
              </NSpace>
            </NCard>
          </NGi>
        </NGrid>

        <!-- Pagination -->
        <NSpace v-if="!loading && paginatedBooks.length > 0" justify="center" class="mt-8">
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
    </NLayoutContent>
  </NLayout>
</template>

<style scoped>
/* Custom styles if needed */
</style>
