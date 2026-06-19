<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-inner">
        <h1 class="title">Ousa's Tool</h1>

        <!-- Search -->
        <div class="search">
          <input v-model="searchQuery" type="text" placeholder="Search..." class="search-input" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="search-clear">
            ×
          </button>
        </div>
      </div>
    </header>

    <!-- Grid -->
    <main class="main">
      <div class="container">
        <div class="grid">
          <NuxtLink v-for="page in filteredPages" :key="page.route" :to="page.route" class="card"
            exact-active-class="card-active">
            <div class="card-icon">{{ page.icon || '📄' }}</div>
            <span class="card-name">{{ page.name }}</span>
          </NuxtLink>
        </div>

        <!-- Empty -->
        <div v-if="filteredPages.length === 0" class="empty">
          <p>No pages found</p>
          <button @click="searchQuery = ''" class="empty-btn">Clear</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'PagesDashboard',

  data() {
    return {
      searchQuery: '',
      pages: [
        { name: 'Home', route: '/', icon: '🏠' },
        { name: 'Best', route: '/best', icon: '🌟' },
        { name: 'Compressor', route: '/compressor', icon: '🗜️' },
        { name: 'Gold', route: '/gold', icon: '💰' },
        { name: 'MPG', route: '/mpg', icon: '⛽' },
        { name: 'Phone', route: '/phone', icon: '📱' },
        { name: 'Project', route: '/project', icon: '📊' },
        { name: 'KHQR', route: '/qr', icon: '🔲' },
        { name: 'Sort', route: '/sort', icon: '💬' },
        { name: 'Text Converter', route: '/text-converter', icon: '📝' },
      ],
    };
  },

  computed: {
    filteredPages() {
      if (!this.searchQuery.trim()) {
        return this.pages;
      }
      const query = this.searchQuery.toLowerCase();
      return this.pages.filter(page =>
        page.name.toLowerCase().includes(query)
      );
    },
  },
};
</script>

<style scoped>
/* Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Layout */
.dashboard {
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Header */
.header {
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 24px 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  letter-spacing: -0.5px;
}

/* Search */
.search {
  position: relative;
  max-width: 300px;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: #fafafa;
  color: #000;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #000;
  background: white;
}

.search-input::placeholder {
  color: #999;
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.search-clear:hover {
  background: #f0f0f0;
  color: #000;
}

/* Main */
.main {
  padding: 48px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

/* Card */
.card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 32px 24px;
  text-decoration: none;
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  transition: all 0.2s;
  cursor: pointer;
}

.card:hover {
  border-color: #000;
  transform: translateY(-2px);
}

.card-icon {
  font-size: 40px;
  line-height: 1;
}

.card-name {
  font-size: 15px;
  font-weight: 500;
}

/* Active State */
.card-active {
  background: #000;
  color: white;
  border-color: #000;
}

/* Empty State */
.empty {
  text-align: center;
  padding: 80px 24px;
}

.empty p {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
}

.empty-btn {
  background: #000;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-btn:hover {
  background: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 20px 0;
  }

  .header-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .title {
    font-size: 20px;
  }

  .search {
    max-width: none;
  }

  .search-input {
    font-size: 16px;
    /* Prevents iOS zoom */
  }

  .main {
    padding: 32px 0;
  }

  .container {
    padding: 0 16px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .card {
    padding: 24px 16px;
    gap: 12px;
  }

  .card-icon {
    font-size: 32px;
  }

  .card-name {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>