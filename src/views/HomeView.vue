<script setup>
import { 
    NSpace, 
    NCarousel, 
    NButton,
    NIcon,
    NCard,
    NGrid,
    NGi,
    NTag,
    NEllipsis,
    NInput,
    NForm,
    NFormItem,
    NDivider,
    NStatistic,
    NImage,
    useMessage,
    NThing,
    NText,
    NBadge
}                       from 'naive-ui';
import { ref, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import Search           from '../components/Search.vue';
import FavoriteButton   from '../components/FavoriteButton.vue';
import {
  getCategories,
  getTopCategories
}                       from '../services/apiCategories.js';
import {
  getTopBooks,
  getAllBooks  // ← THÊM: Import getAllBooks
}                       from '../services/apiBook.js';
const API_BASE = import.meta.env.VITE_API_BASE;
const router = useRouter();
const message = useMessage();
const allCategories = ref([]);
const topCategories = ref([]);
const topBooks = ref([]);
const allBooks = ref([]); // ← THÊM: Tất cả sách (không cần lượt mượn)
const loadingBooks = ref(false);
const loadingCategories = ref(false);
const loadingTopCategories = ref(false);
const loadingAllBooks = ref(false); // ← THÊM: Loading cho all books



onMounted(async () => {
  console.log('HomeView mounted, API_BASE:', API_BASE);
  await getAllCategories();
  await getAllTopCategories();
  await getAllTopBooks();
  await loadAllBooks(); // ← THÊM: Load tất cả sách
});

const getAllCategories = async () => {
  loadingCategories.value = true;
  try {
    const response =  await getCategories();
    // response = { status, message, data: [...categories] }
    console.log('Categories response:', response);
    if (response && response.data && Array.isArray(response.data)) {
      allCategories.value = response.data;
      console.log('All Categories loaded:', allCategories.value.length);
    } else {
      console.warn('Invalid categories response format:', response);
      allCategories.value = [];
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    message.error('Không thể tải danh mục thể loại.');
    allCategories.value = [];
  } finally {
    loadingCategories.value = false;
  }
}
const getAllTopCategories = async () => {
  loadingTopCategories.value = true;
  try {
    const response =  await getTopCategories();
    console.log('Top Categories response:', response);
    if (response && response.data && Array.isArray(response.data)) {
      topCategories.value = response.data;
      console.log('Top Categories loaded:', topCategories.value.length);
    } else {
      console.warn('Invalid top categories response format:', response);
      topCategories.value = [];
    }
  } catch (error) {
    console.error('Error loading top categories:', error);
    message.error('Không thể tải top thể loại.');
    topCategories.value = [];
  } finally {
    loadingTopCategories.value = false;
  }
}

const getAllTopBooks = async () => {
  loadingBooks.value = true;
  try {
    const response = await getTopBooks();
    console.log('Top Books response:', response);
    if (response && response.data && Array.isArray(response.data)) {
      topBooks.value = response.data;
      console.log('Top Books loaded:', topBooks.value.length);
    } else {
      console.warn('Invalid top books response format:', response);
      topBooks.value = [];
    }
  } catch (error) {
    console.error('Error loading top books:', error);
    message.error('Không thể tải top sách.');
    topBooks.value = [];
  } finally {
    loadingBooks.value = false;
  }
}

// ← THÊM: Hàm load tất cả sách
const loadAllBooks = async () => {
  loadingAllBooks.value = true;
  try {
    const response = await getAllBooks();
    console.log('All Books response:', response);
    if (response && response.data && Array.isArray(response.data)) {
      allBooks.value = response.data;
      console.log('All Books loaded:', allBooks.value.length);
    } else {
      console.warn('Invalid all books response format:', response);
      allBooks.value = [];
    }
  } catch (error) {
    console.error('Error loading all books:', error);
    allBooks.value = [];
  } finally {
    loadingAllBooks.value = false;
  }
}

const formatPrice = (price) => {
  if(!price || isNaN(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// ← SỬA: Dùng allBooks thay vì topBooks
// Lấy sách theo thể loại từ dữ liệu đã có
const getBooksByCategory = (categoryId) => {
  if (!allBooks.value || !Array.isArray(allBooks.value) || allBooks.value.length === 0) {
    console.log('No books available');
    return [];
  }
  
  const books = allBooks.value.filter(book => {
    return book.THELOAI && Array.isArray(book.THELOAI) && book.THELOAI.some(tl => tl.MaLoai === categoryId);
  }).slice(0, 4); // Lấy tối đa 4 cuốn
  
  console.log(`Books for category ${categoryId}:`, books.length);
  return books;
}

// Lấy 4 thể loại đầu tiên có sách
const getFeaturedCategories = () => {
  if (!allCategories.value || !Array.isArray(allCategories.value) || allCategories.value.length === 0) {
    console.log('No categories available');
    return [];
  }
  
  // Lọc các thể loại có sách
  const categoriesWithBooks = allCategories.value.filter(category => {
    const booksInCategory = getBooksByCategory(category.MaLoai);
    return booksInCategory.length > 0;
  });
  
  console.log('Featured categories:', categoriesWithBooks.length);
  return categoriesWithBooks.slice(0, 4);
}

</script>


<template>
    <NSpace vertical class="min-h-screen flex dark:bg-gray-800">
        <NSpace class="relative" justify="center" align="center" >
            <n-carousel class="" show-arrow autoplay>
                <img
                class="carousel-img lg:h-[80vh] h-[30vh]"
                src="/banner/banner1.png"
                >
                <img
                class="carousel-img lg:h-[80vh] h-[30vh]"
                src="/banner/banner2.png"
                >
                <img
                class="carousel-img lg:h-[80vh] h-[30vh]"
                src="/banner/banner3.png"
                >
                <template #arrow="{ prev, next }">
                <div class="custom-arrow">
                    <button type="button" class="custom-arrow--left" @click="prev">
                    <n-icon>
                        <i class="fa-solid fa-arrow-left"></i>
                    </n-icon>
                    </button>
                    <button type="button" class="custom-arrow--right" @click="next">
                    <n-icon>
                        <i class="fa-solid fa-arrow-right"></i>
                    </n-icon>
                    </button>
                </div>
                </template>
                <template #dots="{ total, currentIndex, to }">
                <ul class="custom-dots">
                    <li
                    v-for="index of total"
                    :key="index"
                    :class="{ ['is-active']: currentIndex === index - 1 }"
                    @click="to(index - 1)"
                    />
                </ul>
                </template>
            </n-carousel>
            <div class="flex justify-between items-center absolute inset-x-0 -bottom-8 flex-1 px-[10%]">
                <Search />
            </div>
        </NSpace>
        <!-- top categories -->
        <NSpace 
          v-if="!loadingTopCategories && topCategories && topCategories.length > 0"
          vertical 
          justify="center" 
          align="center" 
          class="py-12 w-full min-h-screen"
        >
          <h1 class="text-3xl uppercase font-semibold my-4">Top thể loại được yêu thích nhất</h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">Dựa trên số lượt mượn sách</p>
          
          <NGrid cols="3" x-gap="24" y-gap="24" class="w-full px-8 max-w-6xl">
            <NGi v-for="(category, index) in topCategories" :key="category.MaLoai" span="1">
              <NCard 
                hoverable 
                class="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                :style="{ borderTop: `4px solid ${category.Color || '#18a058'}` }"
              >
                <!-- Badge số thứ hạng -->
                <div 
                  class="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  :style="{ 
                    background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                index === 1 ? 'linear-gradient(135deg, #C0C0C0, #808080)' : 
                                'linear-gradient(135deg, #CD7F32, #8B4513)'
                  }"
                >
                  {{ index + 1 }}
                </div>

                <NSpace vertical align="center" class="w-full pt-2">
                  <!-- Icon thể loại -->
                  <div 
                    class="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-md"
                    :style="{ backgroundColor: category.Color || '#18a058' }"
                  >
                    <NImage 
                      v-if="category.Icon"
                      :src="`${API_BASE}${category.Icon}`"
                      :alt="category.TenLoai"
                      class="w-16 h-16 object-contain"
                    />
                    <NIcon v-else size="48" color="white">
                      <i class="fa-solid fa-book"></i>
                    </NIcon>
                  </div>

                  <!-- Tên thể loại -->
                  <h2 class="text-2xl font-bold text-center">{{ category.TenLoai }}</h2>
                  
                  <!-- Mô tả -->
                  <NEllipsis 
                    v-if="category.MoTa" 
                    :line-clamp="2" 
                    class="text-gray-500 dark:text-gray-400 text-center text-sm px-4"
                  >
                    {{ category.MoTa }}
                  </NEllipsis>

                  <NDivider class="my-3" />

                  <!-- Số lượt mượn -->
                  <NSpace align="center" class="w-full" justify="center">
                    <NIcon size="20" :color="category.Color || '#18a058'">
                      <i class="fa-solid fa-heart"></i>
                    </NIcon>
                    <NStatistic>
                      <template #label>
                        <span class="text-sm text-gray-500 dark:text-gray-400">Lượt mượn</span>
                      </template>
                      <template #default>
                        <span class="text-2xl font-bold" :style="{ color: category.Color || '#18a058' }">
                          {{ category.BorrowCount || 0 }}
                        </span>
                      </template>
                    </NStatistic>
                  </NSpace>
                </NSpace>
              </NCard>
            </NGi>
          </NGrid>
        </NSpace>
        <!-- top books -->
        <NSpace 
          v-if="!loadingBooks && topBooks && topBooks.length > 0"
          vertical 
          justify="center" 
          align="center" 
          class="py-12 w-full min-h-screen bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900"
        >
          <h1 class="text-3xl uppercase font-semibold my-4">Top sách mượn nhiều nhất</h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">6 đầu sách được độc giả yêu thích</p>
          
          <NGrid cols="3" x-gap="24" y-gap="24" class="w-full px-8 max-w-7xl">
            <!-- Book cards -->
            <NGi v-for="book in topBooks" :key="book.MASACH" span="1">
              <NBadge processing>
                  <template #value>
                    <NIcon>
                      <i class="fa-solid fa-fire"></i>
                    </NIcon>
                    <span class="ml-0.5">{{ book.BorrowCount || 0 }}</span>
                  </template>
                <NThing hoverable class="shadow rounded-md">
                  <template #description>
                    <NGrid cols="3">
                      <NGi span="1">
                        <NSpace align="center" class="h-full">
                          <NImage 
                            :src="`${API_BASE}${book.HINHANH}`" 
                            :alt="book.TENSACH" 
                            :preview-src="`${API_BASE}${book.HINHANH}`"
                          />
                        </NSpace>
                      </NGi>
                      <NGi span="2">
                        <NSpace vertical class="p-4">
                          <NEllipsis :line-clamp="1">
                            <h3 class="text-lg uppercase font-semibold mb-2">{{ book.TENSACH }}</h3>
                          </NEllipsis>
                          <NEllipsis :line-clamp="2">
                            <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">{{ book.MOTA }}</p>
                          </NEllipsis>
                          <NSpace>
                            <NTag v-for="category in book.THELOAI" :color="{color: category.Color}" size="small">{{ category.TenLoai }}</NTag>
                          </NSpace>
                          <NSpace justify="space-between" align="center">
                            <NTag type="warning">{{ formatPrice(book.DONGIA || book.GIABAN || 0) }}/quyển</NTag>
                          </NSpace>
                        </NSpace>
                      </NGi>
                    </NGrid>
                  </template>
                </NThing>
              </NBadge>
            </NGi>
          </NGrid>
        </NSpace>

        <!-- Sách theo loại -->
        <NSpace 
          vertical 
          justify="center" 
          align="center" 
          class="py-16 w-full min-h-screen bg-white dark:bg-gray-800"
        >
          <h1 class="text-3xl uppercase font-semibold my-4">Khám phá sách theo thể loại</h1>
          <p class="text-gray-500 dark:text-gray-400 mb-8">Tuyển chọn sách hay theo từng thể loại</p>

          <NSpace vertical size="large" class="w-full px-8 max-w-7xl">
            <!-- Lặp qua 4 thể loại -->
            <div 
              v-for="category in getFeaturedCategories()" 
              :key="category.MaLoai"
              class="category-section"
            >
              <!-- Header thể loại -->
              <NCard 
                class="mb-4"
                :style="{ 
                  borderLeft: `6px solid ${category.Color || '#18a058'}`,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                }"
              >
                <NSpace justify="space-between" align="center">
                  <NSpace align="center">
                    <!-- Icon thể loại -->
                    <div 
                      class="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
                      :style="{ backgroundColor: category.Color || '#18a058' }"
                    >
                      <NImage 
                        v-if="category.Icon"
                        :src="`${API_BASE}${category.Icon}`"
                        :alt="category.TenLoai"
                        width="32"
                        class="object-contain"
                      />
                      <NIcon v-else size="24" color="white">
                        <i class="fa-solid fa-book"></i>
                      </NIcon>
                    </div>
                    
                    <!-- Tên thể loại -->
                    <div>
                      <h2 class="text-2xl font-bold" :style="{ color: category.Color || '#18a058' }">
                        {{ category.TenLoai }}
                      </h2>
                      <p v-if="category.MoTa" class="text-sm text-gray-500 dark:text-gray-400">
                        {{ category.MoTa }}
                      </p>
                    </div>
                  </NSpace>

                  <!-- Nút xem tất cả -->
                  <NButton 
                    text 
                    type="primary"
                    @click="router.push(`/category/${category.MaLoai}`)"
                  >
                    Xem tất cả
                    <template #icon>
                      <NIcon>
                        <i class="fa-solid fa-arrow-right"></i>
                      </NIcon>
                    </template>
                  </NButton>
                </NSpace>
              </NCard>

              <!-- Grid sách 1x4 -->
              <NGrid cols="4" x-gap="16" y-gap="16">
                <NGi 
                  v-for="book in getBooksByCategory(category.MaLoai)" 
                  :key="book.MASACH" 
                  span="1"
                >
                  <NCard 
                    hoverable 
                    class="h-full group bg-white dark:bg-gray-800 shadow-md rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all hover:shadow-xl"
                    @click="router.push(`/book/${book.MASACH}`)"
                  >
                    <NGrid :cols="5" x-gap="8" y-gap="8">
                      <!-- Book Image - 2 cột -->
                      <NGi span="2" class="relative">
                        <div 
                          :style="`background-image: url(${API_BASE}${book.HINHANH});`" 
                          class="bg-no-repeat bg-center bg-contain min-h-[140px] rounded-md"
                        ></div>
                      </NGi>
                      
                      <!-- Book Info - 3 cột -->
                      <NGi span="3">
                        <NThing>
                          <template #description>
                            <!-- Title -->
                            <NEllipsis :line-clamp="2" class="mb-1">
                              <h3 class="text-sm font-semibold">{{ book.TENSACH }}</h3>
                            </NEllipsis>
                            
                            <!-- Author -->
                            <NText class="text-xs text-gray-500 dark:text-gray-400 block mb-2">
                              <i class="fa-solid fa-user mr-1"></i>
                              {{ book.TACGIA }}
                            </NText>
                            
                            <!-- Description -->
                            <NEllipsis :line-clamp="2" class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {{ book.MOTA }}
                            </NEllipsis>
                            
                            <!-- Price -->
                            <NTag type="warning" size="small">
                              <i class="fa-solid fa-tag mr-1"></i>
                              {{ formatPrice(book.DONGIA || book.GIABAN || 0) }}
                            </NTag>
                            
                            <!-- Action Buttons -->
                            <NDivider class="!my-2" />
                            <NSpace :size="4">
                              <FavoriteButton :book-id="book.MASACH" size="tiny" circle />
                            </NSpace>
                          </template>
                        </NThing>
                      </NGi>
                    </NGrid>
                  </NCard>
                </NGi>

                <!-- Empty slots nếu ít hơn 4 sách -->
                <!-- <NGi 
                  v-for="n in (4 - getBooksByCategory(category.MaLoai).length)" 
                  :key="`empty-${n}`" 
                  span="1"
                >
                  <NCard class="h-full bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <NSpace vertical align="center" justify="center" class="h-full min-h-[160px]">
                      <NIcon size="32" color="#ccc">
                        <i class="fa-solid fa-book"></i>
                      </NIcon>
                      <NText class="text-xs text-gray-400">Đang cập nhật</NText>
                    </NSpace>
                  </NCard>
                </NGi> -->
              </NGrid>
            </div>
          </NSpace>
        </NSpace>
    </NSpace>
</template>
<style scoped>

.carousel-img {
  width: 100%;
  object-fit: cover;
}

.custom-arrow {
  display: flex;
  position: absolute;
  bottom: 25px;
  right: 10px;
}

.custom-arrow button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-right: 12px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-width: 0;
  border-radius: 8px;
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-arrow button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.custom-arrow button:active {
  transform: scale(0.95);
  transform-origin: center;
}

.custom-dots {
  display: flex;
  margin: 0;
  padding: 0;
  position: absolute;
  bottom: 20px;
  left: 20px;
}

.custom-dots li {
  display: inline-block;
  width: 12px;
  height: 4px;
  margin: 0 3px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.4);
  transition:
    width 0.3s,
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.custom-dots li.is-active {
  width: 40px;
  background: #fff;
}

.category-section {
  margin-bottom: 3rem;
}

.category-section:last-child {
  margin-bottom: 0;
}

</style>