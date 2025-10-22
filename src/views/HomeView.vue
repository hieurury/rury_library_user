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
    useMessage
}                       from 'naive-ui';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Search           from '../components/Search.vue';

const router = useRouter();
const message = useMessage();

// Banner carousel data
const banners = [
  { id: 1, image: '/banner/banner1.png', title: 'Khám phá tri thức' },
  { id: 2, image: '/banner/banner2.png', title: 'Thư viện số hiện đại' },
  { id: 3, image: '/banner/banner3.png', title: 'Đọc sách mọi lúc mọi nơi' }
];

// Top 3 categories with most borrows
const topBorrowCategories = [
  { id: 1, name: 'Tâm lý học', image: '/books/tam-li-hoc.png', borrowCount: 1250, icon: 'fa-brain' },
  { id: 2, name: 'Truyện ngắn', image: '/books/truyen-ngan.png', borrowCount: 980, icon: 'fa-book' },
  { id: 3, name: 'Truyện tranh', image: '/books/truyen-tranh.png', borrowCount: 856, icon: 'fa-image' }
];

// Top 6 categories with most books
const topBookCategories = [
  { id: 1, name: 'Văn học Việt Nam', bookCount: 450, color: '#FF6B6B', icon: 'fa-feather' },
  { id: 2, name: 'Văn học nước ngoài', bookCount: 380, color: '#4ECDC4', icon: 'fa-globe' },
  { id: 3, name: 'Khoa học công nghệ', bookCount: 320, color: '#45B7D1', icon: 'fa-laptop-code' },
  { id: 4, name: 'Kinh tế - Quản lý', bookCount: 290, color: '#FFA07A', icon: 'fa-chart-line' },
  { id: 5, name: 'Thiếu nhi', bookCount: 275, color: '#98D8C8', icon: 'fa-child' },
  { id: 6, name: 'Lịch sử - Địa lý', bookCount: 240, color: '#F7DC6F', icon: 'fa-map-marked-alt' }
];

// Popular books by genre (4 genres, 5 books each)
const popularBooksByGenre = [
  {
    genre: 'Văn học',
    books: [
      { id: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', cover: '/books/dac-nhan-tam.webp', rating: 4.8 },
      { id: 2, title: 'Mắt biếc', author: 'Nguyễn Nhật Ánh', cover: '/books/mat-biec.jpg', rating: 4.7 },
      { id: 3, title: 'Nhà Giả Kim', author: 'Paulo Coelho', cover: '/books/dac-nhan-tam.webp', rating: 4.9 },
      { id: 4, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn', cover: '/books/mat-biec.jpg', rating: 4.6 },
      { id: 5, title: 'Cà Phê Cùng Tony', author: 'Tony Buổi Sáng', cover: '/books/dac-nhan-tam.webp', rating: 4.5 }
    ]
  },
  {
    genre: 'Kỹ năng sống',
    books: [
      { id: 6, title: 'Tâm lý học tính cách', author: 'Nhiều tác giả', cover: '/books/tam-li-hoc.png', rating: 4.7 },
      { id: 7, title: 'Nghệ thuật giao tiếp', author: 'Leil Lowndes', cover: '/books/tam-li-hoc.webp', rating: 4.6 },
      { id: 8, title: 'Thói quen nguyên tử', author: 'James Clear', cover: '/books/tam-li-hoc.png', rating: 4.9 },
      { id: 9, title: 'Đừng bao giờ đi ăn một mình', author: 'Keith Ferrazzi', cover: '/books/tam-li-hoc.webp', rating: 4.5 },
      { id: 10, title: 'Sức mạnh của tư duy tích cực', author: 'Norman Vincent Peale', cover: '/books/tam-li-hoc.png', rating: 4.7 }
    ]
  },
  {
    genre: 'Khoa học viễn tưởng',
    books: [
      { id: 11, title: 'Harry Potter', author: 'J.K. Rowling', cover: '/books/harryposter.webp', rating: 4.9 },
      { id: 12, title: 'The Hunger Games', author: 'Suzanne Collins', cover: '/books/harryposter.webp', rating: 4.7 },
      { id: 13, title: 'Divergent', author: 'Veronica Roth', cover: '/books/harryposter.webp', rating: 4.6 },
      { id: 14, title: 'The Maze Runner', author: 'James Dashner', cover: '/books/harryposter.webp', rating: 4.5 },
      { id: 15, title: 'Percy Jackson', author: 'Rick Riordan', cover: '/books/harryposter.webp', rating: 4.8 }
    ]
  },
  {
    genre: 'Truyện tranh',
    books: [
      { id: 16, title: 'Doraemon', author: 'Fujiko F. Fujio', cover: '/books/truyen-tranh.png', rating: 4.8 },
      { id: 17, title: 'Conan', author: 'Aoyama Gosho', cover: '/books/truyen-tranh.png', rating: 4.9 },
      { id: 18, title: 'One Piece', author: 'Eiichiro Oda', cover: '/books/truyen-tranh.png', rating: 4.9 },
      { id: 19, title: 'Dragon Ball', author: 'Akira Toriyama', cover: '/books/truyen-tranh.png', rating: 4.8 },
      { id: 20, title: 'Naruto', author: 'Masashi Kishimoto', cover: '/books/truyen-tranh.png', rating: 4.7 }
    ]
  }
];

// Library services
const services = [
  {
    id: 1,
    title: 'Kho sách đa dạng',
    description: 'Hơn 10,000+ đầu sách từ nhiều lĩnh vực khác nhau',
    icon: 'fa-books',
    image: '/banner/banner1.png'
  },
  {
    id: 2,
    title: 'Không gian hiện đại',
    description: 'Thiết kế thoáng mát, yên tĩnh, phù hợp cho việc học tập',
    icon: 'fa-building',
    image: '/banner/banner2.png'
  },
  {
    id: 3,
    title: 'Dịch vụ tận tâm',
    description: 'Đội ngũ thủ thư chuyên nghiệp, nhiệt tình hỗ trợ',
    icon: 'fa-headset',
    image: '/banner/banner3.png'
  },
  {
    id: 4,
    title: 'Công nghệ số',
    description: 'Tra cứu và mượn sách trực tuyến dễ dàng',
    icon: 'fa-mobile-alt',
    image: '/banner/banner4.png'
  }
];

// Statistics
const statistics = [
  { label: 'Đầu sách', value: 10000, suffix: '+', color: '#FF6B6B' },
  { label: 'Độc giả', value: 5000, suffix: '+', color: '#4ECDC4' },
  { label: 'Lượt mượn/tháng', value: 3000, suffix: '+', color: '#45B7D1' },
  { label: 'Đánh giá 5 sao', value: 98, suffix: '%', color: '#FFA07A' }
];

// Contact form
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  message: ''
});

const contactFormRef = ref(null);

const contactRules = {
  name: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    { pattern: /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-4|6-9])[0-9]{7}$/, message: 'Số điện thoại không hợp lệ', trigger: 'blur' }
  ],
  message: [{ required: true, message: 'Vui lòng nhập nội dung', trigger: 'blur' }]
};

const submitContact = () => {
  contactFormRef.value?.validate((errors) => {
    if (!errors) {
      message.success('Cảm ơn bạn đã gửi góp ý! Chúng tôi sẽ liên hệ sớm nhất.');
      contactForm.value = { name: '', email: '', phone: '', message: '' };
    } else {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  });
};

// Scroll animation observer
const observeElements = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
};

onMounted(() => {
  observeElements();
});
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
        <NSpace vertical justify="center" align="center" class="py-12 w-full min-h-screen">
          <h1 class="text-3xl uppercase font-semibold my-4">Top thể loại được yêu thích nhất</h1>
          <NGrid cols="3" x-gap="12" y-gap="12" class="w-full px-8">
            <NGi span="1">
              <NCard hoverable class="p-4 min-w-sm">
                <NSpace vertical align="center" class="w-full">
                  <NIcon size="64" class="text-blue-500">
                    <i class="fa-solid fa-brain"></i>
                  </NIcon>
                  <h2 class="text-xl font-semibold">Tâm lý học</h2>
                  <NTag type="info" size="large">1250 lượt mượn</NTag>
                </NSpace>
              </NCard>
            </NGi>
            <NGi span="1">
              <NCard hoverable class="p-4 min-w-sm">
                <NSpace vertical align="center" class="w-full">
                  <NIcon size="64" class="text-green-500">
                    <i class="fa-solid fa-book"></i>
                  </NIcon>
                  <h2 class="text-xl font-semibold">Truyện ngắn</h2>
                  <NTag type="info" size="large">980 lượt mượn</NTag>
                </NSpace>
              </NCard>
            </NGi>
            <NGi span="1">
              <NCard hoverable class="p-4 min-w-sm">
                <NSpace vertical align="center" class="w-full">
                  <NIcon size="64" class="text-red-500">
                    <i class="fa-solid fa-image"></i>
                  </NIcon>
                  <h2 class="text-xl font-semibold">Truyện tranh</h2>
                  <NTag type="info" size="large">856 lượt mượn</NTag>
                </NSpace>
              </NCard>
            </NGi>
          </NGrid>
        </NSpace>
        <NSpace vertical justify="center" align="center" class="py-12 w-full min-h-screen">
          <h1 class="text-3xl uppercase font-semibold my-4">Top sách mượn nhiều nhất</h1>
          <NGrid cols="8" x-gap="12" y-gap="12" class="w-full px-8">
            <NGi span="1">
              <NCard hoverable class="p-4 min-w-sm">
                <NImage 
                  src="/books/dac-nhan-tam.webp" 
                  alt="Đắc Nhân Tâm" 
                  class="mb-4 object-cover"
                  width="100px"
                />
                <NSpace vertical align="center" class="w-full">
                  <h2 class="text-xl font-semibold">Đắc Nhân Tâm</h2>
                  <NTag type="info" size="large">1500 lượt mượn</NTag>
                </NSpace>
              </NCard>
            </NGi>
          </NGrid>
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
</style>