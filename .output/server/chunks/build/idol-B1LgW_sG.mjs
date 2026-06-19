import { n as normalizeArtists, D as DEFAULT_ARTISTS } from './artistHelpers-DBqsNMC5.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'vue-router';
import '@iconify/vue';

const codeParseCache = /* @__PURE__ */ new Map();
const parseWorkCode = (code) => {
  if (!code) return null;
  if (codeParseCache.has(code)) return codeParseCache.get(code);
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const match = clean.match(/^([A-Z]+)(\d+)$/);
  const parsed = match ? { full: clean, prefix: match[1].toLowerCase(), number: match[2], rawNumber: parseInt(match[2], 10) } : { full: clean, prefix: clean.toLowerCase(), number: "001", rawNumber: 1 };
  codeParseCache.set(code, parsed);
  return parsed;
};
const _sfc_main = {
  name: "WorksImproved",
  data() {
    return {
      currentView: "artists",
      activeTab: "",
      searchQuery: "",
      workSearchQuery: "",
      artistSortBy: "nameAsc",
      artists: normalizeArtists(JSON.parse(JSON.stringify(DEFAULT_ARTISTS))),
      currentWork: null,
      currentWorkList: [],
      currentWorkIndex: 0,
      currentArtistList: [],
      currentArtistIndex: 0,
      customImages: {},
      artistPhotos: {},
      viewedArtists: [],
      viewedWorks: [],
      showAddWorkModal: false,
      showUploadModal: false,
      showArtistPhotoModal: false,
      newWork: { artist: "", code: "", type: "mainWorks" },
      uploadingWork: null,
      customImageUrl: "",
      editingArtistName: "",
      artistPhotoUrl: "",
      lightbox: { show: false, images: [], currentIndex: 0, code: "" },
      toast: { show: false, message: "", type: "success" },
      isPreloading: false,
      imageDB: null,
      useLocalStorageFallback: false,
      customImagesLoaded: false,
      scrollPositions: {},
      touchStartX: 0,
      touchEndX: 0,
      touchStartY: 0,
      touchEndY: 0,
      handleTouchStart: null,
      handleTouchEnd: null,
      sortOptions: [
        { label: "Name A\u2192Z", value: "nameAsc" },
        { label: "Name Z\u2192A", value: "nameDesc" },
        { label: "Most Works", value: "mostWorks" },
        { label: "Least Works", value: "leastWorks" }
      ]
    };
  },
  computed: {
    totalCount() {
      return this.artists.reduce((sum, a) => {
        var _a, _b;
        return sum + (((_a = a.mainWorks) == null ? void 0 : _a.length) || 0) + (((_b = a.compilations) == null ? void 0 : _b.length) || 0);
      }, 0);
    },
    currentArtist() {
      return this.artists.find((a) => a.name === this.activeTab);
    },
    sortedArtists() {
      const artists = [...this.artists];
      switch (this.artistSortBy) {
        case "nameAsc":
          return artists.sort((a, b) => a.name.localeCompare(b.name));
        case "nameDesc":
          return artists.sort((a, b) => b.name.localeCompare(a.name));
        case "mostWorks":
          return artists.sort((a, b) => this.getArtistWorkCount(b) - this.getArtistWorkCount(a));
        case "leastWorks":
          return artists.sort((a, b) => this.getArtistWorkCount(a) - this.getArtistWorkCount(b));
        default:
          return artists.sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    filteredArtists() {
      if (!this.searchQuery.trim()) return this.sortedArtists;
      const query = this.searchQuery.toLowerCase();
      return this.sortedArtists.filter(
        (artist) => artist.name.toLowerCase().includes(query)
      );
    },
    groupedArtists() {
      const groups = {};
      this.filteredArtists.forEach((artist) => {
        const firstLetter = artist.name.charAt(0).toUpperCase();
        if (!groups[firstLetter]) {
          groups[firstLetter] = [];
        }
        groups[firstLetter].push(artist);
      });
      return groups;
    },
    alphabeticalGroups() {
      return Object.keys(this.groupedArtists).sort();
    },
    filteredMainWorks() {
      var _a;
      if (!((_a = this.currentArtist) == null ? void 0 : _a.mainWorks)) return [];
      if (!this.searchQuery.trim()) return this.currentArtist.mainWorks;
      const query = this.searchQuery.toLowerCase();
      return this.currentArtist.mainWorks.filter(
        (work) => work.code.toLowerCase().includes(query)
      );
    },
    filteredCompilations() {
      var _a;
      if (!((_a = this.currentArtist) == null ? void 0 : _a.compilations)) return [];
      if (!this.searchQuery.trim()) return this.currentArtist.compilations;
      const query = this.searchQuery.toLowerCase();
      return this.currentArtist.compilations.filter(
        (work) => work.code.toLowerCase().includes(query)
      );
    }
  },
  watch: {
    artists: {
      handler(v) {
      },
      deep: true
    },
    customImages: {
      handler(v) {
        this.saveCustomImagesToDB(v);
      },
      deep: true
    },
    artistPhotos: {
      handler(v) {
      },
      deep: true
    },
    viewedArtists: {
      handler(v) {
      },
      deep: true
    },
    viewedWorks: {
      handler(v) {
      },
      deep: true
    },
    artistSortBy: {
      handler(v) {
      }
    },
    currentView(newView) {
      if (newView === "works") {
        this.$nextTick(() => {
          this.workSearchQuery = "";
        });
      }
    }
  },
  mounted() {
  },
  methods: {
    async initializeApp() {
      try {
        const dbInitialized = await this.imageDB.init();
        if (dbInitialized) {
          const dbImages = await this.imageDB.getAll();
          this.customImages = dbImages || {};
        } else {
          this.useLocalStorageFallback = true;
          const savedCustomImages = localStorage.getItem("customImages");
          if (savedCustomImages) this.customImages = JSON.parse(savedCustomImages);
        }
        this.customImagesLoaded = true;
      } catch (e) {
        console.warn("Failed to initialize image storage:", e);
        this.useLocalStorageFallback = true;
        try {
          const savedCustomImages = localStorage.getItem("customImages");
          if (savedCustomImages) this.customImages = JSON.parse(savedCustomImages);
        } catch (e2) {
          console.warn("localStorage fallback also failed:", e2);
        }
        this.customImagesLoaded = true;
      }
      try {
        const saved = localStorage.getItem("artists");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.artists = normalizeArtists(parsed);
          }
        }
      } catch (e) {
        console.warn("Failed to load artists:", e);
      }
      try {
        const saved = localStorage.getItem("artistPhotos");
        if (saved) this.artistPhotos = JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load artist photos:", e);
      }
      try {
        const savedViewedArtists = localStorage.getItem("viewedArtists");
        if (savedViewedArtists) this.viewedArtists = JSON.parse(savedViewedArtists);
      } catch (e) {
        console.warn("Failed to load viewed artists:", e);
      }
      try {
        const savedViewedWorks = localStorage.getItem("viewedWorks");
        if (savedViewedWorks) this.viewedWorks = JSON.parse(savedViewedWorks);
      } catch (e) {
        console.warn("Failed to load viewed works:", e);
      }
      try {
        const savedArtistSort = localStorage.getItem("artistSortBy");
        if (savedArtistSort) this.artistSortBy = savedArtistSort;
      } catch (e) {
        console.warn("Failed to load artist sort preference:", e);
      }
    },
    setupKeyboardShortcuts() {
      (void 0).addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.lightbox.show) this.closeLightbox();
          else if (this.showAddWorkModal) this.closeAddWorkModal();
          else if (this.showUploadModal) this.closeUploadModal();
          else if (this.showArtistPhotoModal) this.closeArtistPhotoModal();
          else if (this.currentView === "detail") this.backToWorks();
          else if (this.currentView === "works") this.backToArtists();
        }
        if (this.lightbox.show) {
          if (e.key === "ArrowLeft") this.prevImage();
          if (e.key === "ArrowRight") this.nextImage();
        }
        if (this.currentView === "detail" && !this.lightbox.show) {
          if (e.key === "ArrowLeft" && this.canNavigateWork(-1)) this.navigateWork(-1);
          if (e.key === "ArrowRight" && this.canNavigateWork(1)) this.navigateWork(1);
        }
      });
    },
    handleSearch() {
    },
    goBack() {
      if (this.currentView === "detail") {
        this.backToWorks();
      } else if (this.currentView === "works") {
        this.backToArtists();
      }
    },
    resetToHome() {
      this.currentView = "artists";
      this.activeTab = "";
      this.searchQuery = "";
      this.workSearchQuery = "";
      (void 0).scrollTo({ top: 0, behavior: "smooth" });
    },
    getArtistWorkCount(artist) {
      var _a, _b;
      return (((_a = artist.mainWorks) == null ? void 0 : _a.length) || 0) + (((_b = artist.compilations) == null ? void 0 : _b.length) || 0);
    },
    getProgressiveImage(artist) {
      if (this.artistPhotos[artist.name]) {
        return { full: this.artistPhotos[artist.name], thumb: null };
      }
      const coverWork = this.getCoverWork(artist);
      if (!coverWork) {
        return { full: null, thumb: null };
      }
      return this.getProgressiveWorkImage(coverWork);
    },
    getProgressiveWorkImage(work) {
      if (!work) return { full: null, thumb: null };
      if (this.customImages[work.code]) {
        return { full: this.customImages[work.code], thumb: null };
      }
      const parsed = parseWorkCode(work.code);
      if (!parsed) return { full: null, thumb: null };
      const paddedNum = parsed.number.padStart(5, "0");
      const dmmId = `${parsed.prefix}${paddedNum}`;
      if (dmmId.length < 3) return { full: null, thumb: null };
      return {
        thumb: `https://pics.dmm.co.jp/digital/video/${dmmId}/${dmmId}ps.jpg`,
        full: `https://pics.dmm.co.jp/digital/video/${dmmId}/${dmmId}pl.jpg`
      };
    },
    getImageUrl(code, quality = "pl") {
      if (quality === "pl" && this.customImages[code]) return this.customImages[code];
      const parsed = parseWorkCode(code);
      if (!parsed) return null;
      const paddedNum = parsed.number.padStart(5, "0");
      const dmmId = `${parsed.prefix}${paddedNum}`;
      if (dmmId.length < 3) return null;
      if (quality !== "pl") {
        const qNum = quality.split("-")[1] || "1";
        return `https://pics.dmm.co.jp/digital/video/${dmmId}/${dmmId}jp-${qNum}.jpg`;
      }
      return `https://pics.dmm.co.jp/digital/video/${dmmId}/${dmmId}pl.jpg`;
    },
    hasCustomImage(code) {
      return !!this.customImages[code];
    },
    getCoverWork(artist) {
      var _a, _b;
      if (artist.cover) {
        const allWorks = [...artist.mainWorks || [], ...artist.compilations || []];
        const coverWork = allWorks.find((w) => w.code === artist.cover);
        if (coverWork) return coverWork;
      }
      if (((_a = artist.mainWorks) == null ? void 0 : _a.length) > 0) {
        return artist.mainWorks[0];
      }
      if (((_b = artist.compilations) == null ? void 0 : _b.length) > 0) {
        return artist.compilations[0];
      }
      return null;
    },
    selectArtist(name) {
      this.saveScrollPosition("artists");
      if (!this.viewedArtists.includes(name)) {
        this.viewedArtists.push(name);
      }
      this.currentArtistList = this.filteredArtists;
      this.currentArtistIndex = this.currentArtistList.findIndex((a) => a.name === name);
      this.activeTab = name;
      this.currentView = "works";
      this.workSearchQuery = "";
      this.searchQuery = "";
      this.$nextTick(() => {
        (void 0).scrollTo({ top: 0, behavior: "instant" });
      });
    },
    backToArtists() {
      this.currentView = "artists";
      this.activeTab = "";
      this.searchQuery = "";
      this.$nextTick(() => {
        this.restoreScrollPosition("artists");
      });
    },
    openWorkView(work) {
      this.saveScrollPosition("works");
      if (!this.viewedWorks.includes(work.code)) {
        this.viewedWorks.push(work.code);
      }
      const isMain = this.currentArtist.mainWorks.find((w) => w.code === work.code);
      this.currentWorkList = isMain ? this.filteredMainWorks : this.filteredCompilations;
      this.currentWorkIndex = this.currentWorkList.findIndex((w) => w.code === work.code);
      this.currentWork = work;
      this.currentView = "detail";
      this.$nextTick(() => {
        (void 0).scrollTo({ top: 0, behavior: "instant" });
      });
    },
    backToWorks() {
      this.currentView = "works";
      this.currentWork = null;
      this.$nextTick(() => {
        this.restoreScrollPosition("works");
      });
    },
    saveScrollPosition(view) {
    },
    restoreScrollPosition(view) {
    },
    navigateWork(direction) {
      const newIndex = this.currentWorkIndex + direction;
      if (newIndex >= 0 && newIndex < this.currentWorkList.length) {
        this.currentWorkIndex = newIndex;
        this.currentWork = this.currentWorkList[newIndex];
        if (!this.viewedWorks.includes(this.currentWork.code)) {
          this.viewedWorks.push(this.currentWork.code);
        }
        (void 0).scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    canNavigateWork(direction) {
      const newIndex = this.currentWorkIndex + direction;
      return newIndex >= 0 && newIndex < this.currentWorkList.length;
    },
    isCoverWork(artistName, workCode) {
      const artist = this.artists.find((a) => a.name === artistName);
      return (artist == null ? void 0 : artist.cover) === workCode;
    },
    setCoverWork(artistName, workCode) {
      const artist = this.artists.find((a) => a.name === artistName);
      if (artist) {
        artist.cover = workCode;
        this.artists = [...this.artists];
      }
      this.showToast("Cover updated", "success");
    },
    openAddWorkModal() {
      this.newWork = { artist: this.activeTab || "", code: "", type: "mainWorks" };
      this.showAddWorkModal = true;
    },
    closeAddWorkModal() {
      this.showAddWorkModal = false;
    },
    async addNewWork() {
      if (!this.newWork.artist || !this.newWork.code) return this.showToast("Required fields", "error");
      const code = this.newWork.code.toUpperCase();
      if (this.artists.some((a) => {
        var _a, _b;
        return ((_a = a.mainWorks) == null ? void 0 : _a.some((w) => w.code === code)) || ((_b = a.compilations) == null ? void 0 : _b.some((w) => w.code === code));
      })) {
        return this.showToast("Code exists", "error");
      }
      const artist = this.artists.find((a) => a.name === this.newWork.artist);
      if (!artist) return this.showToast("Artist not found", "error");
      if (!artist[this.newWork.type]) artist[this.newWork.type] = [];
      artist[this.newWork.type].push({
        code,
        addedAt: Date.now()
      });
      this.artists = [...this.artists];
      this.closeAddWorkModal();
      this.showToast(`Added ${code}`, "success");
    },
    openUploadModal(code) {
      this.uploadingWork = code;
      this.customImageUrl = this.customImages[code] || "";
      this.showUploadModal = true;
    },
    closeUploadModal() {
      this.showUploadModal = false;
      this.uploadingWork = null;
      this.customImageUrl = "";
    },
    async handleCustomImageUrl() {
      const url = this.customImageUrl.trim();
      if (!url) {
        const newCustomImages = { ...this.customImages };
        delete newCustomImages[this.uploadingWork];
        this.customImages = newCustomImages;
        this.showToast("Image removed", "success");
        this.closeUploadModal();
        return;
      }
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return this.showToast("Must start with http:// or https://", "error");
      }
      const img = new Image();
      const timeout = setTimeout(() => {
        this.showToast("Load timeout", "error");
      }, 1e4);
      img.onload = () => {
        clearTimeout(timeout);
        this.customImages = { ...this.customImages, [this.uploadingWork]: url };
        this.showToast("Image added", "success");
        this.closeUploadModal();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        this.showToast("Failed to load image", "error");
      };
      img.src = url;
    },
    openArtistPhotoModal(artistName) {
      this.editingArtistName = artistName;
      this.artistPhotoUrl = this.artistPhotos[artistName] || "";
      this.showArtistPhotoModal = true;
    },
    closeArtistPhotoModal() {
      this.showArtistPhotoModal = false;
      this.editingArtistName = "";
      this.artistPhotoUrl = "";
    },
    updateArtistPhoto() {
      const url = this.artistPhotoUrl.trim();
      if (!url) {
        const newPhotos = { ...this.artistPhotos };
        delete newPhotos[this.editingArtistName];
        this.artistPhotos = newPhotos;
        localStorage.setItem("artistPhotos", JSON.stringify(this.artistPhotos));
        this.showToast("Photo removed", "success");
        this.closeArtistPhotoModal();
        return;
      }
      const img = new Image();
      const timeout = setTimeout(() => {
        this.showToast("Load timeout", "error");
      }, 1e4);
      img.onload = () => {
        clearTimeout(timeout);
        this.artistPhotos = { ...this.artistPhotos, [this.editingArtistName]: url };
        localStorage.setItem("artistPhotos", JSON.stringify(this.artistPhotos));
        this.showToast("Photo updated", "success");
        this.closeArtistPhotoModal();
      };
      img.onerror = () => {
        clearTimeout(timeout);
        this.showToast("Photo load failed", "error");
      };
      img.src = url;
    },
    openLightbox(work, startIndex = 0) {
      const images = [this.getImageUrl(work.code)];
      for (let i = 1; i <= 20; i++) {
        images.push(this.getImageUrl(work.code, `jp-${i}`));
      }
      this.lightbox = { show: true, images, currentIndex: startIndex, code: work.code };
    },
    closeLightbox() {
      this.lightbox.show = false;
    },
    setupSwipeGestures() {
      return;
    },
    cleanupSwipeGestures() {
      return;
    },
    handleSwipe() {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;
      const minSwipeDistance = 50;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0) {
            this.prevImage();
          } else {
            this.nextImage();
          }
        }
      }
    },
    nextImage() {
      if (this.lightbox.currentIndex < this.lightbox.images.length - 1) {
        this.lightbox.currentIndex++;
      }
    },
    prevImage() {
      if (this.lightbox.currentIndex > 0) {
        this.lightbox.currentIndex--;
      }
    },
    async preloadAllGallery() {
      if (!this.currentWork) return;
      this.isPreloading = true;
      const promises = [];
      for (let i = 1; i <= 20; i++) {
        const img = new Image();
        const url = this.getImageUrl(this.currentWork.code, `jp-${i}`);
        const promise = new Promise((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        });
        promises.push(promise);
      }
      await Promise.all(promises);
      this.isPreloading = false;
      this.showToast("Gallery loaded", "success");
    },
    copyToClipboard(code) {
      (void 0).clipboard.writeText(code).then(() => {
        this.showToast(`Copied: ${code}`, "success");
      }).catch(() => {
        this.showToast("Copy failed", "error");
      });
    },
    openExternalLink(code, type = "njav") {
      if (!code) return;
      const formattedCode = code.toLowerCase().replace(/-/g, "-");
      let url;
      if (type === "missav") {
        url = `https://missav.ws/en/${formattedCode}`;
      } else if (type === "24av") {
        url = `https://24av.net/en/v/${formattedCode}`;
      } else if (type === "24av-uncensor") {
        url = `https://24av.net/en/uncensored/${formattedCode}`;
      } else {
        url = `https://www.njav.com/en/xvideos/${formattedCode}`;
      }
      (void 0).open(url, "_blank", "noopener,noreferrer");
    },
    clearViewHistory() {
      if (confirm("Clear all viewing history?")) {
        this.viewedArtists = [];
        this.viewedWorks = [];
        localStorage.removeItem("viewedArtists");
        localStorage.removeItem("viewedWorks");
        this.showToast("History cleared", "success");
      }
    },
    showToast(msg, type = "success") {
      this.toast = { show: true, message: msg, type };
      setTimeout(() => this.toast.show = false, 3e3);
    },
    async saveCustomImagesToDB(images) {
      if (!this.customImagesLoaded) return;
      if (this.useLocalStorageFallback) {
        try {
          localStorage.setItem("customImages", JSON.stringify(images));
        } catch (e) {
          console.warn("Failed to save custom images to localStorage:", e);
        }
      } else {
        try {
          await this.imageDB.clear();
          for (const [code, data] of Object.entries(images)) {
            await this.imageDB.set(code, data);
          }
        } catch (e) {
          console.warn("Failed to save custom images to IndexedDB:", e);
        }
      }
    },
    exportData() {
      try {
        const transformedArtists = this.artists.map((artist) => ({
          name: artist.name,
          cover: artist.cover || "",
          url: this.artistPhotos[artist.name] || "",
          compilations: (artist.compilations || []).map((w) => w.code).sort((a2, b) => a2.localeCompare(b)),
          mainWorks: (artist.mainWorks || []).map((w) => w.code).sort((a2, b) => a2.localeCompare(b))
        })).sort((a2, b) => a2.name.localeCompare(b.name));
        let exportString = "export const DEFAULT_ARTISTS = [\n";
        transformedArtists.forEach((artist, index) => {
          exportString += "  {\n";
          exportString += `    name: '${artist.name}',
`;
          exportString += `    cover: '${artist.cover}',
`;
          exportString += `    url: '${artist.url}',
`;
          if (artist.compilations.length > 0) {
            exportString += `    compilations: [${artist.compilations.map((c) => `'${c}'`).join(", ")}],
`;
          } else {
            exportString += `    compilations: [],
`;
          }
          if (artist.mainWorks.length > 0) {
            exportString += `    mainWorks: [${artist.mainWorks.map((w) => `'${w}'`).join(", ")}]
`;
          } else {
            exportString += `    mainWorks: []
`;
          }
          exportString += "  }";
          if (index < transformedArtists.length - 1) {
            exportString += ",";
          }
          exportString += "\n";
        });
        exportString += "]";
        const blob = new Blob([exportString], { type: "text/javascript" });
        const url = URL.createObjectURL(blob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = `artists-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.js`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Exported as .js", "success");
      } catch (e) {
        console.error("Export error:", e);
        this.showToast("Export failed", "error");
      }
    },
    triggerImport() {
      this.$refs.fileInput.click();
    },
    importData(event) {
      var _a;
      try {
        const file = (_a = event.target.files) == null ? void 0 : _a[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          const data = JSON.parse(content);
          if (!data.artists || !Array.isArray(data.artists)) {
            this.showToast("Invalid format", "error");
            return;
          }
          this.artists = normalizeArtists(data.artists);
          this.customImages = data.customImages || {};
          this.artistPhotos = data.artistPhotos || {};
          localStorage.setItem("artists", JSON.stringify(this.artists));
          this.showToast("Imported", "success");
        };
        reader.readAsText(file);
        event.target.value = "";
      } catch (e) {
        this.showToast("Import failed", "error");
      }
    },
    async hardRefresh() {
      if (!confirm("Reset everything? Cannot be undone.")) return;
      try {
        this.showToast("Refreshing...", "info");
        localStorage.removeItem("artists");
        localStorage.removeItem("artistPhotos");
        localStorage.removeItem("viewedArtists");
        localStorage.removeItem("viewedWorks");
        localStorage.removeItem("artistSortBy");
        localStorage.removeItem("customImages");
        if (this.imageDB) {
          await this.imageDB.clear();
        }
        this.artists = normalizeArtists(JSON.parse(JSON.stringify(DEFAULT_ARTISTS)));
        this.currentView = "artists";
        this.activeTab = "";
        this.artistPhotos = {};
        this.customImages = {};
        this.viewedArtists = [];
        this.viewedWorks = [];
        this.artistSortBy = "nameAsc";
        localStorage.setItem("artists", JSON.stringify(this.artists));
        this.showToast("Reset complete", "success");
      } catch (e) {
        this.showToast("Reset failed", "error");
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  var _a, _b, _c, _d, _e;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "works-app" }, _attrs))} data-v-3508fb8c><header class="top-bar" data-v-3508fb8c><div class="top-left" data-v-3508fb8c>`);
  if ($data.currentView !== "artists") {
    _push(`<button class="back-btn" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><path d="M19 12H5M12 19l-7-7 7-7" data-v-3508fb8c></path></svg><span class="back-text" data-v-3508fb8c>Back</span></button>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.currentView === "artists") {
    _push(`<div class="header-stats" data-v-3508fb8c><div class="header-stat" data-v-3508fb8c><span class="stat-num" data-v-3508fb8c>${ssrInterpolate($data.artists.length)}</span><span class="stat-lbl" data-v-3508fb8c>Artists</span></div><div class="header-divider" data-v-3508fb8c></div><div class="header-stat" data-v-3508fb8c><span class="stat-num" data-v-3508fb8c>${ssrInterpolate($options.totalCount)}</span><span class="stat-lbl" data-v-3508fb8c>Works</span></div><div class="header-divider" data-v-3508fb8c></div><div class="header-stat" data-v-3508fb8c><span class="stat-num" data-v-3508fb8c>${ssrInterpolate($data.viewedWorks.length)}</span><span class="stat-lbl" data-v-3508fb8c>Viewed</span></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="top-right" data-v-3508fb8c><div class="search-wrapper" data-v-3508fb8c><svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><circle cx="11" cy="11" r="8" data-v-3508fb8c></circle><path d="M21 21l-4.35-4.35" data-v-3508fb8c></path></svg><input${ssrRenderAttr("value", $data.searchQuery)} type="text"${ssrRenderAttr("placeholder", $data.currentView === "works" ? "Filter works..." : "Search artists...")} class="search-input" data-v-3508fb8c>`);
  if ($data.searchQuery) {
    _push(`<button class="search-clear" data-v-3508fb8c>\xD7</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="action-buttons" data-v-3508fb8c><button class="action-btn" title="Export Data" data-v-3508fb8c><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" data-v-3508fb8c></path></svg><span class="action-text" data-v-3508fb8c>Export</span></button><button class="action-btn" title="Import Data" data-v-3508fb8c><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" data-v-3508fb8c></path></svg><span class="action-text" data-v-3508fb8c>Import</span></button><button class="action-btn" title="Clear History" data-v-3508fb8c><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" data-v-3508fb8c></path></svg><span class="action-text" data-v-3508fb8c>Clear</span></button><button class="action-btn danger" title="Reset All Data" data-v-3508fb8c><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M3 12l2.26 2.26A9.75 9.75 0 0012 21a9 9 0 009-9" data-v-3508fb8c></path></svg><span class="action-text" data-v-3508fb8c>Reset</span></button></div></div></header><input type="file" accept=".json" hidden data-v-3508fb8c>`);
  if ($data.currentView === "artists") {
    _push(`<main class="content artists-view" data-v-3508fb8c><!--[-->`);
    ssrRenderList($options.alphabeticalGroups, (letter) => {
      _push(`<div class="artist-section" data-v-3508fb8c><div class="section-header" data-v-3508fb8c><h2 class="section-letter" data-v-3508fb8c>${ssrInterpolate(letter)}</h2><span class="section-count" data-v-3508fb8c>${ssrInterpolate($options.groupedArtists[letter].length)}</span></div><div class="artist-grid" data-v-3508fb8c><!--[-->`);
      ssrRenderList($options.groupedArtists[letter], (artist) => {
        _push(`<div class="${ssrRenderClass([{ viewed: $data.viewedArtists.includes(artist.name) }, "artist-card"])}" data-v-3508fb8c><div class="card-image" data-v-3508fb8c>`);
        if ($options.getProgressiveImage(artist).full) {
          _push(`<img${ssrRenderAttr("src", $options.getProgressiveImage(artist).full)}${ssrRenderAttr("alt", artist.name)} loading="lazy" data-v-3508fb8c>`);
        } else {
          _push(`<div class="image-placeholder" data-v-3508fb8c>${ssrInterpolate(artist.name.charAt(0))}</div>`);
        }
        if ($data.viewedArtists.includes(artist.name)) {
          _push(`<div class="viewed-badge" data-v-3508fb8c><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-v-3508fb8c><polyline points="20 6 9 17 4 12" data-v-3508fb8c></polyline></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="card-content" data-v-3508fb8c><h3 class="card-title" data-v-3508fb8c>${ssrInterpolate(artist.name)}</h3><div class="card-meta" data-v-3508fb8c>`);
        if ($options.getArtistWorkCount(artist)) {
          _push(`<span class="meta-badge" data-v-3508fb8c>${ssrInterpolate($options.getArtistWorkCount(artist))} works </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><button class="card-edit" data-v-3508fb8c><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" data-v-3508fb8c></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" data-v-3508fb8c></path></svg></button></div>`);
      });
      _push(`<!--]--></div></div>`);
    });
    _push(`<!--]-->`);
    if ($options.filteredArtists.length === 0) {
      _push(`<div class="empty-state" data-v-3508fb8c><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-3508fb8c><circle cx="11" cy="11" r="8" data-v-3508fb8c></circle><path d="M21 21l-4.35-4.35" data-v-3508fb8c></path></svg><p class="empty-title" data-v-3508fb8c>No artists found</p><p class="empty-text" data-v-3508fb8c>Try adjusting your search</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</main>`);
  } else if ($data.currentView === "works") {
    _push(`<main class="content works-view" data-v-3508fb8c><div class="works-header" data-v-3508fb8c><div class="header-info" data-v-3508fb8c><h1 class="works-title" data-v-3508fb8c>${ssrInterpolate((_a = $options.currentArtist) == null ? void 0 : _a.name)}</h1><div class="works-stats" data-v-3508fb8c>`);
    if ((_c = (_b = $options.currentArtist) == null ? void 0 : _b.mainWorks) == null ? void 0 : _c.length) {
      _push(`<span class="stat-chip main" data-v-3508fb8c>${ssrInterpolate($options.currentArtist.mainWorks.length)} Main </span>`);
    } else {
      _push(`<!---->`);
    }
    if ((_e = (_d = $options.currentArtist) == null ? void 0 : _d.compilations) == null ? void 0 : _e.length) {
      _push(`<span class="stat-chip comp" data-v-3508fb8c>${ssrInterpolate($options.currentArtist.compilations.length)} Compilations </span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div><button class="add-work-btn" data-v-3508fb8c><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><line x1="12" y1="5" x2="12" y2="19" data-v-3508fb8c></line><line x1="5" y1="12" x2="19" y2="12" data-v-3508fb8c></line></svg><span data-v-3508fb8c>Add Work</span></button></div>`);
    if ($options.filteredMainWorks.length) {
      _push(`<div class="works-section" data-v-3508fb8c><div class="section-title" data-v-3508fb8c><h3 data-v-3508fb8c>Main Works</h3><span class="title-count" data-v-3508fb8c>${ssrInterpolate($options.filteredMainWorks.length)}</span></div><div class="works-grid" data-v-3508fb8c><!--[-->`);
      ssrRenderList($options.filteredMainWorks, (work) => {
        _push(`<div class="${ssrRenderClass([{ viewed: $data.viewedWorks.includes(work.code) }, "work-card"])}" data-v-3508fb8c><div class="work-image" data-v-3508fb8c><img${ssrRenderAttr("src", $options.getProgressiveWorkImage(work).full)}${ssrRenderAttr("alt", work.code)} loading="lazy" data-v-3508fb8c>`);
        if ($options.isCoverWork($options.currentArtist.name, work.code)) {
          _push(`<div class="cover-star" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" data-v-3508fb8c><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-v-3508fb8c></polygon></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.viewedWorks.includes(work.code)) {
          _push(`<div class="viewed-overlay" data-v-3508fb8c><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-v-3508fb8c><polyline points="20 6 9 17 4 12" data-v-3508fb8c></polyline></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="work-info" data-v-3508fb8c><div class="work-code" data-v-3508fb8c>${ssrInterpolate(work.code)}</div><span class="work-type main" data-v-3508fb8c>Main</span></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($options.filteredCompilations.length) {
      _push(`<div class="works-section" data-v-3508fb8c><div class="section-title" data-v-3508fb8c><h3 data-v-3508fb8c>Compilations</h3><span class="title-count" data-v-3508fb8c>${ssrInterpolate($options.filteredCompilations.length)}</span></div><div class="works-grid" data-v-3508fb8c><!--[-->`);
      ssrRenderList($options.filteredCompilations, (work) => {
        _push(`<div class="${ssrRenderClass([{ viewed: $data.viewedWorks.includes(work.code) }, "work-card"])}" data-v-3508fb8c><div class="work-image" data-v-3508fb8c><img${ssrRenderAttr("src", $options.getProgressiveWorkImage(work).full)}${ssrRenderAttr("alt", work.code)} loading="lazy" data-v-3508fb8c>`);
        if ($options.isCoverWork($options.currentArtist.name, work.code)) {
          _push(`<div class="cover-star" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" data-v-3508fb8c><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-v-3508fb8c></polygon></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        if ($data.viewedWorks.includes(work.code)) {
          _push(`<div class="viewed-overlay" data-v-3508fb8c><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-v-3508fb8c><polyline points="20 6 9 17 4 12" data-v-3508fb8c></polyline></svg></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="work-info" data-v-3508fb8c><div class="work-code" data-v-3508fb8c>${ssrInterpolate(work.code)}</div><span class="work-type comp" data-v-3508fb8c>Compilation</span></div></div>`);
      });
      _push(`<!--]--></div></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($options.filteredMainWorks.length === 0 && $options.filteredCompilations.length === 0) {
      _push(`<div class="empty-state" data-v-3508fb8c><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-v-3508fb8c><rect x="3" y="3" width="18" height="18" rx="2" data-v-3508fb8c></rect><line x1="9" y1="9" x2="15" y2="15" data-v-3508fb8c></line><line x1="15" y1="9" x2="9" y2="15" data-v-3508fb8c></line></svg><p class="empty-title" data-v-3508fb8c>No works found</p><p class="empty-text" data-v-3508fb8c>${ssrInterpolate($data.workSearchQuery ? "Try adjusting your search" : "Add your first work")}</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</main>`);
  } else if ($data.currentView === "detail") {
    _push(`<main class="content detail-view" data-v-3508fb8c><div class="detail-container" data-v-3508fb8c><div class="detail-main" data-v-3508fb8c><div class="main-image" data-v-3508fb8c><img${ssrRenderAttr("src", $options.getProgressiveWorkImage($data.currentWork).full)}${ssrRenderAttr("alt", $data.currentWork.code)} data-v-3508fb8c><div class="image-overlay" data-v-3508fb8c><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><polyline points="15 3 21 3 21 9" data-v-3508fb8c></polyline><polyline points="9 21 3 21 3 15" data-v-3508fb8c></polyline><line x1="21" y1="3" x2="14" y2="10" data-v-3508fb8c></line><line x1="3" y1="21" x2="10" y2="14" data-v-3508fb8c></line></svg></div></div><div class="quick-actions" data-v-3508fb8c><button class="${ssrRenderClass([{ active: $options.isCoverWork($options.currentArtist.name, $data.currentWork.code) }, "action-chip"])}" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" data-v-3508fb8c><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-v-3508fb8c></polygon></svg> ${ssrInterpolate($options.isCoverWork($options.currentArtist.name, $data.currentWork.code) ? "Cover" : "Set Cover")}</button><button class="action-chip" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><rect x="3" y="3" width="18" height="18" rx="2" ry="2" data-v-3508fb8c></rect><circle cx="8.5" cy="8.5" r="1.5" data-v-3508fb8c></circle><polyline points="21 15 16 10 5 21" data-v-3508fb8c></polyline></svg> ${ssrInterpolate($options.hasCustomImage($data.currentWork.code) ? "Update" : "Add Image")}</button><button class="action-chip" data-v-3508fb8c><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><rect x="9" y="9" width="13" height="13" rx="2" ry="2" data-v-3508fb8c></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" data-v-3508fb8c></path></svg> Copy Code </button></div></div><div class="detail-sidebar" data-v-3508fb8c><div class="detail-code" data-v-3508fb8c><h1 data-v-3508fb8c>${ssrInterpolate($data.currentWork.code)}</h1></div><div class="external-links" data-v-3508fb8c><h4 data-v-3508fb8c>Watch On</h4><div class="link-group" data-v-3508fb8c><button class="link-btn njav" data-v-3508fb8c> NJAV </button><button class="link-btn missav" data-v-3508fb8c> MissAV </button><button class="link-btn av24" data-v-3508fb8c> 24AV </button><button class="link-btn av24-uncensor" data-v-3508fb8c> 24AV Uncensor </button></div></div>`);
    if ($data.currentWorkList.length > 1) {
      _push(`<div class="detail-nav" data-v-3508fb8c><button${ssrIncludeBooleanAttr(!$options.canNavigateWork(-1)) ? " disabled" : ""} class="nav-arrow" data-v-3508fb8c><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><polyline points="15 18 9 12 15 6" data-v-3508fb8c></polyline></svg></button><div class="nav-info" data-v-3508fb8c><span class="nav-current" data-v-3508fb8c>${ssrInterpolate($data.currentWorkIndex + 1)}</span><span class="nav-separator" data-v-3508fb8c>/</span><span class="nav-total" data-v-3508fb8c>${ssrInterpolate($data.currentWorkList.length)}</span></div><button${ssrIncludeBooleanAttr(!$options.canNavigateWork(1)) ? " disabled" : ""} class="nav-arrow" data-v-3508fb8c><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><polyline points="9 18 15 12 9 6" data-v-3508fb8c></polyline></svg></button></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="gallery-section" data-v-3508fb8c><div class="gallery-header" data-v-3508fb8c><h4 data-v-3508fb8c>Gallery</h4><button class="preload-btn"${ssrIncludeBooleanAttr($data.isPreloading) ? " disabled" : ""} data-v-3508fb8c>${ssrInterpolate($data.isPreloading ? "Loading..." : "Load All")}</button></div><div class="gallery-grid" data-v-3508fb8c><!--[-->`);
    ssrRenderList(20, (i) => {
      _push(`<div class="gallery-thumb" data-v-3508fb8c><img${ssrRenderAttr("src", $options.getImageUrl($data.currentWork.code, `jp-${i}`))}${ssrRenderAttr("alt", `${$data.currentWork.code} ${i}`)} loading="lazy" data-v-3508fb8c><span class="thumb-label" data-v-3508fb8c>${ssrInterpolate(i)}</span></div>`);
    });
    _push(`<!--]--></div></div></div></div></main>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showAddWorkModal) {
    _push(`<div class="modal-overlay" data-v-3508fb8c><div class="modal-card" data-v-3508fb8c><div class="modal-header" data-v-3508fb8c><h3 data-v-3508fb8c>Add New Work</h3><button class="modal-close" data-v-3508fb8c>\xD7</button></div><div class="modal-body" data-v-3508fb8c><div class="form-group" data-v-3508fb8c><label data-v-3508fb8c>Artist</label><select class="form-control" data-v-3508fb8c><option value="" data-v-3508fb8c${ssrIncludeBooleanAttr(Array.isArray($data.newWork.artist) ? ssrLooseContain($data.newWork.artist, "") : ssrLooseEqual($data.newWork.artist, "")) ? " selected" : ""}>Select artist...</option><!--[-->`);
    ssrRenderList($data.artists, (a) => {
      _push(`<option${ssrRenderAttr("value", a.name)} data-v-3508fb8c${ssrIncludeBooleanAttr(Array.isArray($data.newWork.artist) ? ssrLooseContain($data.newWork.artist, a.name) : ssrLooseEqual($data.newWork.artist, a.name)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
    });
    _push(`<!--]--></select></div><div class="form-group" data-v-3508fb8c><label data-v-3508fb8c>Work Code</label><input${ssrRenderAttr("value", $data.newWork.code)} placeholder="e.g. ABC-123" class="form-control" data-v-3508fb8c></div><div class="form-group" data-v-3508fb8c><label data-v-3508fb8c>Type</label><div class="radio-group" data-v-3508fb8c><label class="radio-label" data-v-3508fb8c><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.newWork.type, "mainWorks")) ? " checked" : ""} type="radio" value="mainWorks" data-v-3508fb8c><span data-v-3508fb8c>Main Work</span></label><label class="radio-label" data-v-3508fb8c><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.newWork.type, "compilations")) ? " checked" : ""} type="radio" value="compilations" data-v-3508fb8c><span data-v-3508fb8c>Compilation</span></label></div></div></div><div class="modal-footer" data-v-3508fb8c><button class="btn-secondary" data-v-3508fb8c>Cancel</button><button class="btn-primary" data-v-3508fb8c>Add Work</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showUploadModal) {
    _push(`<div class="modal-overlay" data-v-3508fb8c><div class="modal-card" data-v-3508fb8c><div class="modal-header" data-v-3508fb8c><h3 data-v-3508fb8c>Custom Image</h3><button class="modal-close" data-v-3508fb8c>\xD7</button></div><div class="modal-body" data-v-3508fb8c><p class="modal-subtitle" data-v-3508fb8c>${ssrInterpolate($data.uploadingWork)}</p><div class="form-group" data-v-3508fb8c><label data-v-3508fb8c>Image URL</label><input${ssrRenderAttr("value", $data.customImageUrl)} placeholder="https://example.com/image.jpg" class="form-control" data-v-3508fb8c><p class="form-hint" data-v-3508fb8c>Leave empty to remove custom image</p></div></div><div class="modal-footer" data-v-3508fb8c><button class="btn-secondary" data-v-3508fb8c>Cancel</button><button class="btn-primary" data-v-3508fb8c>${ssrInterpolate($data.customImageUrl.trim() ? "Save" : "Remove")}</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showArtistPhotoModal) {
    _push(`<div class="modal-overlay" data-v-3508fb8c><div class="modal-card" data-v-3508fb8c><div class="modal-header" data-v-3508fb8c><h3 data-v-3508fb8c>Artist Photo</h3><button class="modal-close" data-v-3508fb8c>\xD7</button></div><div class="modal-body" data-v-3508fb8c><p class="modal-subtitle" data-v-3508fb8c>${ssrInterpolate($data.editingArtistName)}</p><div class="form-group" data-v-3508fb8c><label data-v-3508fb8c>Photo URL</label><input${ssrRenderAttr("value", $data.artistPhotoUrl)} placeholder="https://example.com/photo.jpg" class="form-control" data-v-3508fb8c><p class="form-hint" data-v-3508fb8c>Leave empty to remove photo</p></div></div><div class="modal-footer" data-v-3508fb8c><button class="btn-secondary" data-v-3508fb8c>Cancel</button><button class="btn-primary" data-v-3508fb8c>${ssrInterpolate($data.artistPhotoUrl.trim() ? "Save" : "Remove")}</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.lightbox.show) {
    _push(`<div class="lightbox" data-v-3508fb8c><button class="lightbox-close" data-v-3508fb8c><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-v-3508fb8c><line x1="18" y1="6" x2="6" y2="18" data-v-3508fb8c></line><line x1="6" y1="6" x2="18" y2="18" data-v-3508fb8c></line></svg></button>`);
    if ($data.lightbox.images.length > 1) {
      _push(`<button class="lightbox-arrow prev"${ssrIncludeBooleanAttr($data.lightbox.currentIndex === 0) ? " disabled" : ""} data-v-3508fb8c><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><polyline points="15 18 9 12 15 6" data-v-3508fb8c></polyline></svg></button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="lightbox-content" data-v-3508fb8c><img${ssrRenderAttr("src", $data.lightbox.images[$data.lightbox.currentIndex])}${ssrRenderAttr("alt", $data.lightbox.code)} data-v-3508fb8c></div>`);
    if ($data.lightbox.images.length > 1) {
      _push(`<button class="lightbox-arrow next"${ssrIncludeBooleanAttr($data.lightbox.currentIndex === $data.lightbox.images.length - 1) ? " disabled" : ""} data-v-3508fb8c><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><polyline points="9 18 15 12 9 6" data-v-3508fb8c></polyline></svg></button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="lightbox-counter" data-v-3508fb8c>${ssrInterpolate($data.lightbox.currentIndex + 1)} / ${ssrInterpolate($data.lightbox.images.length)}</div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.toast.show) {
    _push(`<div class="${ssrRenderClass([`toast-${$data.toast.type}`, "toast"])}" data-v-3508fb8c>`);
    if ($data.toast.type === "success") {
      _push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><polyline points="20 6 9 17 4 12" data-v-3508fb8c></polyline></svg>`);
    } else if ($data.toast.type === "error") {
      _push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3508fb8c><circle cx="12" cy="12" r="10" data-v-3508fb8c></circle><line x1="12" y1="8" x2="12" y2="12" data-v-3508fb8c></line><line x1="12" y1="16" x2="12.01" y2="16" data-v-3508fb8c></line></svg>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<span data-v-3508fb8c>${ssrInterpolate($data.toast.message)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/idol.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const idol = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-3508fb8c"]]);

export { idol as default };
//# sourceMappingURL=idol-B1LgW_sG.mjs.map
