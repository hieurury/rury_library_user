<script setup>
import { ref } from 'vue';
import { NButton, NIcon } from 'naive-ui';

const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // TODO: Implement search logic here
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};
</script>

<template>
  <div class="search-container">
    <div class="search-wrapper">
      <div class="search-icon-left">
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <input 
        v-model="searchQuery"
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
      >
        <template #icon>
          <NIcon><i class="fa-solid fa-search"></i></NIcon>
        </template>
        Tìm kiếm
      </NButton>
    </div>
  </div>
</template>

<style scoped>
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

@media (max-width: 480px) {
  .search-button span {
    display: none;
  }
  
  .search-button {
    padding: 0 16px;
  }
}
</style>