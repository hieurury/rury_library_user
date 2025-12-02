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
  NText,
  NBadge,
  NPagination,
  NButton,
  NIcon,
  NEmpty,
  NStatistic,
  NDivider,
  NBreadcrumb,
  NBreadcrumbItem,
  NThing
} from 'naive-ui';

defineOptions({ name: 'CategoryView' });
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getBooksByCategory } from '../services/apiCategories.js';
import { getTopBooks } from '../services/apiBook.js';
import FavoriteButton from '../components/FavoriteButton.vue';

const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const route = useRoute();
const message = useMessage();

// Data
const categoryData = ref(null);
const books = ref([]);
const topBooks = ref([]);
const loading = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(9);

onMounted(async () => {
  await loadTopBooks();
  await loadCategoryBooks();
});

// Watch for route param changes
watch(() => route.params.maLoai, async (newMaLoai) => {
  if (newMaLoai) {
    currentPage.value = 1;
    await loadCategoryBooks();
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

const loadCategoryBooks = async () => {
  const maLoai = route.params.maLoai;
  if (!maLoai) return;
  
  loading.value = true;
  try {
    const response = await getBooksByCategory(maLoai);
    categoryData.value = response.data.category;
    books.value = response.data.books || [];
  } catch (error) {
    message.error('Không thể tải dữ liệu thể loại.');
    categoryData.value = null;
    books.value = [];
  } finally {
    loading.value = false;
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
const totalBooks = computed(() => books.value.length);

const totalAuthors = computed(() => {
  const authors = new Set();
  books.value.forEach(book => {
    if (book.TACGIA) authors.add(book.TACGIA);
  });
  return authors.size;
});

const avgPrice = computed(() => {
  if (books.value.length === 0) return 0;
  const total = books.value.reduce((sum, book) => sum + (book.DONGIA || 0), 0);
  return total / books.value.length;
});

// Paginated results
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return books.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(books.value.length / pageSize.value);
});

// Navigate to book detail
const goToBook = (bookId) => {
  router.push(`/book/${bookId}`);
};

// Go back
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    <NSpace vertical size="large">
      <!-- Breadcrumb -->
      <NBreadcrumb>
        <NBreadcrumbItem @click="router.push('/')">
          <NIcon class="mr-1"><i class="fa-solid fa-home"></i></NIcon>
          Trang chủ
        </NBreadcrumbItem>
        <NBreadcrumbItem @click="router.push('/books')">
          Sách
        </NBreadcrumbItem>
        <NBreadcrumbItem>
          {{ categoryData?.TenLoai || 'Thể loại' }}
        </NBreadcrumbItem>
      </NBreadcrumb>

      <!-- Header -->
      <div v-if="!loading && categoryData" class="text-center">
        <!-- Category Icon -->
        <div 
          v-if="categoryData.Icon"
          class="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
          :style="{ backgroundColor: categoryData.Color + '20', color: categoryData.Color }"
        >
          <NImage
            v-if="categoryData.Icon.startsWith('/')"
            :src="`${API_BASE}${categoryData.Icon}`"
            class="w-16 h-16 object-contain"
          />
          <i v-else :class="categoryData.Icon"></i>
        </div>
        
        <h1 class="text-4xl font-bold mb-2 dark:text-white">{{ categoryData.TenLoai }}</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {{ categoryData.MoTa || 'Khám phá các sách thuộc thể loại này' }}
        </p>
      </div>

      <!-- Loading Header -->
      <div v-if="loading" class="text-center">
        <NSkeleton class="w-24 h-24 mx-auto mb-4 rounded-full" />
        <NSkeleton class="h-10 w-64 mx-auto mb-2" />
        <NSkeleton class="h-6 w-96 mx-auto" />
      </div>

      <!-- Statistics -->
      <NCard v-if="!loading && categoryData" class="rounded-xl">
        <NGrid cols="3" x-gap="24" y-gap="12">
          <NGi>
            <NStatistic label="Tổng số sách" :value="totalBooks">
              <template #prefix>
                <NIcon class="text-blue-500"><i class="fa-solid fa-book"></i></NIcon>
              </template>
            </NStatistic>
          </NGi>
          <NGi>
            <NStatistic label="Tác giả" :value="totalAuthors">
              <template #prefix>
                <NIcon class="text-green-500"><i class="fa-solid fa-user-pen"></i></NIcon>
              </template>
            </NStatistic>
          </NGi>
          <NGi>
            <NStatistic label="Giá trung bình">
              <template #prefix>
                <NIcon class="text-yellow-500"><i class="fa-solid fa-tag"></i></NIcon>
              </template>
              {{ formatPrice(avgPrice) }}
            </NStatistic>
          </NGi>
        </NGrid>
      </NCard>

      <!-- Books Grid -->
      <NGrid cols="3" x-gap="16" y-gap="16">
        <!-- Loading Skeleton -->
        <NGi v-if="loading" v-for="n in 9" :key="`skeleton-${n}`" span="1">
          <NSkeleton height="200px" width="100%" />
        </NGi>

        <!-- Books -->
        <NGi v-else-if="books.length > 0" v-for="book in paginatedBooks" :key="book.MASACH" span="1">
          <NThing 
            class="shadow-md rounded-lg hover:shadow-xl dark:border dark:border-gray-700 h-full transition-shadow duration-200 cursor-pointer"
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
                      <NEllipsis :line-clamp="1" :tooltip="{ width: 300 }">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ book.TENSACH }}</h3>
                      </NEllipsis>
                      <!-- Author -->
                      <NEllipsis :line-clamp="1" :tooltip="{ width: 300 }">
                        <span class="text-sm text-gray-600 dark:text-gray-300">
                          Tác giả: {{ book.TACGIA }} - NXB: {{ book.MAXB?.TENNXB || 'N/A' }}
                        </span>
                      </NEllipsis>
                      <!-- Description -->
                      <NEllipsis :line-clamp="2" :tooltip="{ width: 350 }">
                        <span class="text-sm text-gray-700 dark:text-gray-200">
                          {{ book.MOTA }}
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
                      <div @click.stop>
                        <FavoriteButton :book-id="book.MASACH" size="tiny" circle />
                      </div>
                    </NSpace>
                  </NSpace>
                </NGi>
              </NGrid>
            </template>
          </NThing>
        </NGi>

        <!-- Empty State -->
        <NGi v-if="!loading && books.length === 0" span="3">
          <NEmpty description="Không có sách nào thuộc thể loại này">
            <template #extra>
              <NButton type="primary" @click="router.push('/books')">
                <template #icon>
                  <NIcon><i class="fa-solid fa-book"></i></NIcon>
                </template>
                Xem tất cả sách
              </NButton>
            </template>
          </NEmpty>
        </NGi>
      </NGrid>

      <!-- Pagination -->
      <NSpace v-if="totalPages > 1" justify="center">
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
</style>
