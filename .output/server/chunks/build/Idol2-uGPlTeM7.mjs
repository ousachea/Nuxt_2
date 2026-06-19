import { n as normalizeArtists, D as DEFAULT_ARTISTS } from './artistHelpers-DBqsNMC5.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderStyle, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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

var codeCache = /* @__PURE__ */ new Map();
var parseCode = function(code) {
  if (!code) return null;
  if (codeCache.has(code)) return codeCache.get(code);
  var clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  var m = clean.match(/^([A-Z]+)(\d+)$/);
  var r = m ? { full: clean, prefix: m[1].toLowerCase(), number: m[2], rawNumber: parseInt(m[2], 10) } : { full: clean, prefix: clean.toLowerCase(), number: "001", rawNumber: 1 };
  codeCache.set(code, r);
  return r;
};
var ALL_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
var EXTERNAL_LINKS = [
  { key: "njav", label: "NJAV" },
  { key: "missav", label: "MissAV" },
  { key: "24av", label: "24AV" },
  { key: "24av-uncensor", label: "24AV UC" }
];
const _sfc_main = {
  name: "WorksTracker",
  data: function() {
    return {
      currentView: "artists",
      viewTransition: "slide-right",
      activeTab: "",
      searchQuery: "",
      artistSortBy: "nameAsc",
      workSortBy: "default",
      viewFilter: "all",
      artists: normalizeArtists(JSON.parse(JSON.stringify(DEFAULT_ARTISTS))),
      currentWork: null,
      currentWorkList: [],
      currentWorkIndex: 0,
      currentArtistList: [],
      currentArtistIndex: 0,
      customImages: {},
      viewedArtists: [],
      viewedWorks: [],
      showAddWorkModal: false,
      showUploadModal: false,
      showAddArtistModal: false,
      showMenu: false,
      newWork: { artist: "", code: "", type: "mainWorks" },
      newArtistName: "",
      uploadingWork: null,
      customImageUrl: "",
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
      detailTouchStartX: 0,
      detailTouchStartY: 0,
      //  NEW: App-level swipe tracking (for works->artists)
      appTouchStartX: 0,
      appTouchStartY: 0,
      handleTouchStart: null,
      handleTouchEnd: null,
      allLetters: ALL_LETTERS,
      externalLinks: EXTERNAL_LINKS,
      //  NEW: Gallery failure tracking
      galleryFailed: [],
      galleryLoadedCount: 0,
      //  NEW: Search shortcut hint
      showShortcutHint: false,
      shortcutHintTimer: null
    };
  },
  computed: {
    totalCount: function() {
      return this.artists.reduce(function(s, a) {
        return s + (a.mainWorks && a.mainWorks.length || 0) + (a.compilations && a.compilations.length || 0);
      }, 0);
    },
    currentArtist: function() {
      var tab = this.activeTab;
      return this.artists.find(function(a) {
        return a.name === tab;
      });
    },
    sortedArtists: function() {
      var self = this;
      var arr = this.artists.slice();
      var sorts = {
        nameAsc: function(a, b) {
          return a.name.localeCompare(b.name);
        },
        nameDesc: function(a, b) {
          return b.name.localeCompare(a.name);
        },
        mostWorks: function(a, b) {
          return self.getArtistWorkCount(b) - self.getArtistWorkCount(a);
        },
        leastWorks: function(a, b) {
          return self.getArtistWorkCount(a) - self.getArtistWorkCount(b);
        }
      };
      return arr.sort(sorts[this.artistSortBy] || sorts.nameAsc);
    },
    filteredArtists: function() {
      var self = this;
      var list = this.sortedArtists;
      if (this.searchQuery.trim()) {
        var q = this.searchQuery.toLowerCase();
        list = list.filter(function(a) {
          return a.name.toLowerCase().indexOf(q) !== -1;
        });
      }
      if (this.viewFilter === "unviewed") {
        list = list.filter(function(a) {
          return self.viewedArtists.indexOf(a.name) === -1;
        });
      } else if (this.viewFilter === "viewed") {
        list = list.filter(function(a) {
          return self.viewedArtists.indexOf(a.name) !== -1;
        });
      }
      return list;
    },
    groupedArtists: function() {
      var g = {};
      this.filteredArtists.forEach(function(a) {
        var l = a.name.charAt(0).toUpperCase();
        if (!g[l]) g[l] = [];
        g[l].push(a);
      });
      return g;
    },
    alphabeticalGroups: function() {
      return Object.keys(this.groupedArtists).sort();
    },
    filteredMainWorks: function() {
      if (!(this.currentArtist && this.currentArtist.mainWorks)) return [];
      var list = this.currentArtist.mainWorks.slice();
      list = this.applySortAndFilter(list);
      return list;
    },
    filteredCompilations: function() {
      if (!(this.currentArtist && this.currentArtist.compilations)) return [];
      var list = this.currentArtist.compilations.slice();
      list = this.applySortAndFilter(list);
      return list;
    },
    workSections: function() {
      return [
        { key: "main", label: "Main Works", items: this.filteredMainWorks },
        { key: "comp", label: "Compilations", items: this.filteredCompilations }
      ];
    },
    //  NEW: True when all 20 gallery slots have failed
    galleryAllFailed: function() {
      return this.galleryFailed.length >= 20;
    }
  },
  watch: {
    artists: { handler: function(v) {
    }, deep: true },
    customImages: { handler: function(v) {
      this.saveCustomImagesToDB(v);
    }, deep: true },
    viewedArtists: { handler: function(v) {
    }, deep: true },
    viewedWorks: { handler: function(v) {
    }, deep: true },
    artistSortBy: { handler: function(v) {
    } },
    //  NEW: Reset gallery tracking when work changes
    currentWork: function() {
      this.galleryFailed = [];
      this.galleryLoadedCount = 0;
    }
  },
  mounted: function() {
  },
  //  NEW: Clean up keyboard listener on destroy
  beforeDestroy: function() {
    if (this._keydownHandler) {
      (void 0).removeEventListener("keydown", this._keydownHandler);
    }
  },
  methods: {
    applySortAndFilter: function(list) {
      var self = this;
      if (this.searchQuery.trim()) {
        var q = this.searchQuery.toLowerCase();
        list = list.filter(function(w) {
          return w.code.toLowerCase().indexOf(q) !== -1;
        });
      }
      if (this.viewFilter === "unviewed") {
        list = list.filter(function(w) {
          return self.viewedWorks.indexOf(w.code) === -1;
        });
      } else if (this.viewFilter === "viewed") {
        list = list.filter(function(w) {
          return self.viewedWorks.indexOf(w.code) !== -1;
        });
      }
      if (this.workSortBy === "codeAsc") list.sort(function(a, b) {
        return a.code.localeCompare(b.code);
      });
      else if (this.workSortBy === "codeDesc") list.sort(function(a, b) {
        return b.code.localeCompare(a.code);
      });
      else if (this.workSortBy === "newest") list.sort(function(a, b) {
        return (b.addedAt || 0) - (a.addedAt || 0);
      });
      else if (this.workSortBy === "unviewed") list.sort(function(a, b) {
        var av = self.viewedWorks.indexOf(a.code) !== -1 ? 1 : 0;
        var bv = self.viewedWorks.indexOf(b.code) !== -1 ? 1 : 0;
        return av - bv;
      });
      return list;
    },
    initializeApp: function() {
      var self = this;
      this.imageDB.init().then(function(ok) {
        if (ok) {
          return self.imageDB.getAll().then(function(imgs) {
            self.customImages = imgs || {};
          });
        } else {
          self.useLocalStorageFallback = true;
          var s = localStorage.getItem("customImages");
          if (s) self.customImages = JSON.parse(s);
        }
      }).catch(function() {
        self.useLocalStorageFallback = true;
        try {
          var s = localStorage.getItem("customImages");
          if (s) self.customImages = JSON.parse(s);
        } catch (e2) {
        }
      }).then(function() {
        self.customImagesLoaded = true;
        var loads = [
          ["artists", function(v) {
            var p = JSON.parse(v);
            if (Array.isArray(p) && p.length) self.artists = normalizeArtists(p);
          }],
          ["viewedArtists", function(v) {
            self.viewedArtists = JSON.parse(v);
          }],
          ["viewedWorks", function(v) {
            self.viewedWorks = JSON.parse(v);
          }],
          ["artistSortBy", function(v) {
            self.artistSortBy = v;
          }]
        ];
        loads.forEach(function(pair) {
          try {
            var v = localStorage.getItem(pair[0]);
            if (v) pair[1](v);
          } catch (e) {
          }
        });
      });
    },
    setupKeyboardShortcuts: function() {
      var self = this;
      this._keydownHandler = function(e) {
        var tag = (void 0).activeElement && (void 0).activeElement.tagName;
        var isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
        if (e.key === "/" && !isInput) {
          e.preventDefault();
          if (self.$refs.searchInput) {
            self.$refs.searchInput.focus();
            self.$refs.searchInput.select();
            self.showShortcutHint = false;
          }
          return;
        }
        if (e.key === "Escape") {
          if (self.showMenu) {
            self.showMenu = false;
            return;
          }
          if (self.lightbox.show) self.closeLightbox();
          else if (self.showAddWorkModal) self.closeAddWorkModal();
          else if (self.showAddArtistModal) {
            self.showAddArtistModal = false;
          } else if (self.showUploadModal) self.closeUploadModal();
          else if (self.currentView === "detail") self.backToWorks();
          else if (self.currentView === "works") self.backToArtists();
        }
        if (self.lightbox.show) {
          if (e.key === "ArrowLeft") self.prevImage();
          if (e.key === "ArrowRight") self.nextImage();
        }
        if (self.currentView === "detail" && !self.lightbox.show) {
          if (e.key === "ArrowLeft" && self.canNavigateWork(-1)) self.navigateWork(-1);
          if (e.key === "ArrowRight" && self.canNavigateWork(1)) self.navigateWork(1);
        }
      };
      (void 0).addEventListener("keydown", this._keydownHandler);
      setTimeout(function() {
        if (self.currentView === "artists") {
          self.showShortcutHint = true;
          setTimeout(function() {
            self.showShortcutHint = false;
          }, 3e3);
        }
      }, 1500);
    },
    onImgLoad: function(e) {
      e.target.classList.add("loaded");
    },
    onImgError: function(e) {
      e.target.style.display = "none";
    },
    //  NEW: Gallery-specific image handlers that track failures
    onGalleryImgLoad: function(e, index) {
      e.target.classList.add("loaded");
      this.galleryLoadedCount++;
    },
    onGalleryImgError: function(e, index) {
      e.target.style.display = "none";
      var thumb = e.target.parentElement;
      if (thumb) {
        var skeleton = thumb.querySelector(".skeleton");
        if (skeleton) skeleton.style.display = "none";
      }
      if (this.galleryFailed.indexOf(index) === -1) this.galleryFailed.push(index);
    },
    handleSearch: function() {
    },
    goBack: function() {
      this.viewTransition = "slide-left";
      this.currentView === "detail" ? this.backToWorks() : this.backToArtists();
    },
    getArtistWorkCount: function(a) {
      return (a.mainWorks && a.mainWorks.length || 0) + (a.compilations && a.compilations.length || 0);
    },
    //  NEW: Returns number of viewed works for an artist
    getArtistViewedCount: function(artist) {
      if (!artist) return 0;
      var all = (artist.mainWorks || []).concat(artist.compilations || []);
      var self = this;
      return all.filter(function(w) {
        return self.viewedWorks.indexOf(w.code) !== -1;
      }).length;
    },
    getArtistProgress: function(artist) {
      if (!artist) return 0;
      var total = this.getArtistWorkCount(artist);
      if (total === 0) return 0;
      var seen = this.getArtistViewedCount(artist);
      return Math.round(seen / total * 100);
    },
    getProgressiveImage: function(artist) {
      var cw = this.getCoverWork(artist);
      return cw ? this.getProgressiveWorkImage(cw) : { full: null };
    },
    getProgressiveWorkImage: function(work) {
      if (!work) return { full: null };
      if (this.customImages[work.code]) return { full: this.customImages[work.code] };
      var p = parseCode(work.code);
      if (!p) return { full: null };
      var id = p.prefix + ("00000" + p.number).slice(-5);
      if (id.length < 3) return { full: null };
      return { thumb: "https://pics.dmm.co.jp/digital/video/" + id + "/" + id + "ps.jpg", full: "https://pics.dmm.co.jp/digital/video/" + id + "/" + id + "pl.jpg" };
    },
    getImageUrl: function(code, quality) {
      if (!quality) quality = "pl";
      if (quality === "pl" && this.customImages[code]) return this.customImages[code];
      var p = parseCode(code);
      if (!p) return null;
      var id = p.prefix + ("00000" + p.number).slice(-5);
      if (id.length < 3) return null;
      if (quality !== "pl") {
        var n = quality.split("-")[1] || "1";
        return "https://pics.dmm.co.jp/digital/video/" + id + "/" + id + "jp-" + n + ".jpg";
      }
      return "https://pics.dmm.co.jp/digital/video/" + id + "/" + id + "pl.jpg";
    },
    hasCustomImage: function(code) {
      return !!this.customImages[code];
    },
    getCoverWork: function(artist) {
      if (artist.cover) {
        var all = (artist.mainWorks || []).concat(artist.compilations || []);
        var f = all.find(function(w) {
          return w.code === artist.cover;
        });
        if (f) return f;
      }
      return artist.mainWorks && artist.mainWorks[0] || artist.compilations && artist.compilations[0] || null;
    },
    scrollToLetter: function(letter) {
      var ref = this.$refs["group-" + letter];
      if (ref && ref[0]) {
        ref[0].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    selectArtist: function(name) {
      this.viewTransition = "slide-right";
      this.saveScrollPosition("artists");
      if (this.viewedArtists.indexOf(name) === -1) this.viewedArtists.push(name);
      this.currentArtistList = this.filteredArtists;
      this.currentArtistIndex = this.currentArtistList.findIndex(function(a) {
        return a.name === name;
      });
      this.activeTab = name;
      this.currentView = "works";
      this.searchQuery = "";
      this.workSortBy = "default";
      this.viewFilter = "all";
      this.$nextTick(function() {
        (void 0).scrollTo({ top: 0, behavior: "instant" });
      });
    },
    backToArtists: function() {
      var self = this;
      this.viewTransition = "slide-left";
      this.currentView = "artists";
      this.activeTab = "";
      this.searchQuery = "";
      this.viewFilter = "all";
      this.$nextTick(function() {
        self.restoreScrollPosition("artists");
      });
    },
    openWorkView: function(work) {
      this.viewTransition = "slide-right";
      this.saveScrollPosition("works");
      if (this.viewedWorks.indexOf(work.code) === -1) this.viewedWorks.push(work.code);
      var isMain = this.currentArtist.mainWorks && this.currentArtist.mainWorks.find(function(w) {
        return w.code === work.code;
      });
      this.currentWorkList = isMain ? this.filteredMainWorks : this.filteredCompilations;
      this.currentWorkIndex = this.currentWorkList.findIndex(function(w) {
        return w.code === work.code;
      });
      this.currentWork = work;
      this.currentView = "detail";
      this.$nextTick(function() {
        (void 0).scrollTo({ top: 0, behavior: "instant" });
      });
    },
    backToWorks: function() {
      var self = this;
      this.viewTransition = "slide-left";
      this.currentView = "works";
      this.currentWork = null;
      this.$nextTick(function() {
        self.restoreScrollPosition("works");
      });
    },
    saveScrollPosition: function(v) {
    },
    restoreScrollPosition: function(v) {
      this.scrollPositions[v] || 0;
    },
    navigateWork: function(dir) {
      var i = this.currentWorkIndex + dir;
      if (i >= 0 && i < this.currentWorkList.length) {
        this.currentWorkIndex = i;
        this.currentWork = this.currentWorkList[i];
        if (this.viewedWorks.indexOf(this.currentWork.code) === -1) this.viewedWorks.push(this.currentWork.code);
        (void 0).scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    canNavigateWork: function(dir) {
      var i = this.currentWorkIndex + dir;
      return i >= 0 && i < this.currentWorkList.length;
    },
    // Detail-level swipe (navigate works left/right)
    onDetailTouchStart: function(e) {
      this.detailTouchStartX = e.changedTouches[0].screenX;
      this.detailTouchStartY = e.changedTouches[0].screenY;
    },
    onDetailTouchEnd: function(e) {
      var dx = e.changedTouches[0].screenX - this.detailTouchStartX;
      var dy = e.changedTouches[0].screenY - this.detailTouchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
        if (dx > 0 && this.canNavigateWork(-1)) this.navigateWork(-1);
        else if (dx < 0 && this.canNavigateWork(1)) this.navigateWork(1);
      }
    },
    //  NEW: App-level swipe - works view swipe right -> back to artists
    onAppTouchStart: function(e) {
      this.appTouchStartX = e.changedTouches[0].screenX;
      this.appTouchStartY = e.changedTouches[0].screenY;
    },
    onAppTouchEnd: function(e) {
      if (this.currentView !== "works") return;
      if (this.showAddWorkModal || this.showUploadModal || this.showAddArtistModal || this.lightbox.show) return;
      var dx = e.changedTouches[0].screenX - this.appTouchStartX;
      var dy = e.changedTouches[0].screenY - this.appTouchStartY;
      if (dx > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        this.goBack();
      }
    },
    isCoverWork: function(name, code) {
      var a = this.artists.find(function(x) {
        return x.name === name;
      });
      return a && a.cover === code;
    },
    setCoverWork: function(name, code) {
      var a = this.artists.find(function(x) {
        return x.name === name;
      });
      if (a) {
        a.cover = code;
        this.artists = this.artists.slice();
      }
      this.showToast("Cover updated");
    },
    openAddArtistModal: function() {
      this.newArtistName = "";
      this.showAddArtistModal = true;
    },
    addNewArtist: function() {
      var name = this.newArtistName.trim();
      if (!name) return this.showToast("Name required", "error");
      if (this.artists.find(function(a) {
        return a.name.toLowerCase() === name.toLowerCase();
      })) return this.showToast("Artist exists", "error");
      this.artists.push({ name, mainWorks: [], compilations: [], cover: "" });
      this.artists = this.artists.slice();
      this.showAddArtistModal = false;
      this.showToast("Added " + name);
    },
    openAddWorkModal: function() {
      this.newWork = { artist: this.activeTab || "", code: "", type: "mainWorks" };
      this.showAddWorkModal = true;
    },
    closeAddWorkModal: function() {
      this.showAddWorkModal = false;
    },
    addNewWork: function() {
      if (!this.newWork.artist || !this.newWork.code) return this.showToast("Required fields", "error");
      var code = this.newWork.code.toUpperCase();
      var exists = this.artists.some(function(a) {
        return (a.mainWorks || []).some(function(w) {
          return w.code === code;
        }) || (a.compilations || []).some(function(w) {
          return w.code === code;
        });
      });
      if (exists) return this.showToast("Code exists", "error");
      var self = this;
      var artist = this.artists.find(function(a) {
        return a.name === self.newWork.artist;
      });
      if (!artist) return this.showToast("Artist not found", "error");
      if (!artist[this.newWork.type]) artist[this.newWork.type] = [];
      artist[this.newWork.type].push({ code, addedAt: Date.now() });
      this.artists = this.artists.slice();
      this.closeAddWorkModal();
      this.showToast("Added " + code);
    },
    openUploadModal: function(code) {
      this.uploadingWork = code;
      this.customImageUrl = this.customImages[code] || "";
      this.showUploadModal = true;
    },
    closeUploadModal: function() {
      this.showUploadModal = false;
      this.uploadingWork = null;
      this.customImageUrl = "";
    },
    handleCustomImageUrl: function() {
      var self = this;
      var url = this.customImageUrl.trim();
      if (!url) {
        var n = Object.assign({}, this.customImages);
        delete n[this.uploadingWork];
        this.customImages = n;
        this.showToast("Image removed");
        this.closeUploadModal();
        return;
      }
      if (url.indexOf("http://") !== 0 && url.indexOf("https://") !== 0) return this.showToast("Must start with http(s)://", "error");
      var img = new Image();
      var to = setTimeout(function() {
        self.showToast("Timeout", "error");
      }, 1e4);
      img.onload = function() {
        clearTimeout(to);
        var c = Object.assign({}, self.customImages);
        c[self.uploadingWork] = url;
        self.customImages = c;
        self.showToast("Image added");
        self.closeUploadModal();
      };
      img.onerror = function() {
        clearTimeout(to);
        self.showToast("Load failed", "error");
      };
      img.src = url;
    },
    openLightbox: function(work, startIndex) {
      if (startIndex === void 0) startIndex = 0;
      var imgs = [this.getImageUrl(work.code)];
      for (var i = 1; i <= 20; i++) imgs.push(this.getImageUrl(work.code, "jp-" + i));
      this.lightbox = { show: true, images: imgs, currentIndex: startIndex, code: work.code };
    },
    closeLightbox: function() {
      this.lightbox.show = false;
    },
    setupSwipeGestures: function() {
      var self = this;
      var el = (void 0).querySelector(".lb");
      if (!el) return;
      this.handleTouchStart = function(e) {
        self.touchStartX = e.changedTouches[0].screenX;
        self.touchStartY = e.changedTouches[0].screenY;
      };
      this.handleTouchEnd = function(e) {
        self.touchEndX = e.changedTouches[0].screenX;
        self.touchEndY = e.changedTouches[0].screenY;
        self.handleSwipe();
      };
      el.addEventListener("touchstart", this.handleTouchStart, { passive: true });
      el.addEventListener("touchend", this.handleTouchEnd, { passive: true });
    },
    cleanupSwipeGestures: function() {
      var el = (void 0).querySelector(".lb");
      if (!el) return;
      if (this.handleTouchStart) el.removeEventListener("touchstart", this.handleTouchStart);
      if (this.handleTouchEnd) el.removeEventListener("touchend", this.handleTouchEnd);
    },
    handleSwipe: function() {
      var dx = this.touchEndX - this.touchStartX;
      var dy = this.touchEndY - this.touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        dx > 0 ? this.prevImage() : this.nextImage();
      }
    },
    nextImage: function() {
      if (this.lightbox.currentIndex < this.lightbox.images.length - 1) this.lightbox.currentIndex++;
    },
    prevImage: function() {
      if (this.lightbox.currentIndex > 0) this.lightbox.currentIndex--;
    },
    preloadAllGallery: function() {
      var self = this;
      if (!this.currentWork) return;
      this.isPreloading = true;
      var promises = [];
      for (var i = 1; i <= 20; i++) {
        (function(idx) {
          promises.push(new Promise(function(res) {
            var img = new Image();
            img.onload = img.onerror = res;
            img.src = self.getImageUrl(self.currentWork.code, "jp-" + idx);
          }));
        })(i);
      }
      Promise.all(promises).then(function() {
        self.isPreloading = false;
        self.showToast("Gallery loaded");
      });
    },
    copyToClipboard: function(code) {
      var self = this;
      (void 0).clipboard.writeText(code).then(function() {
        self.showToast("Copied: " + code);
      }).catch(function() {
        self.showToast("Copy failed", "error");
      });
    },
    openExternalLink: function(code, type) {
      var c = code.toLowerCase();
      var urls = { missav: "https://missav.ws/en/" + c, "24av": "https://24av.net/en/v/" + c, "24av-uncensor": "https://24av.net/en/uncensored/" + c, njav: "https://www.njav.com/en/xvideos/" + c };
      (void 0).open(urls[type] || urls.njav, "_blank", "noopener,noreferrer");
    },
    clearViewHistory: function() {
      if (!confirm("Clear all viewing history?")) return;
      this.viewedArtists = [];
      this.viewedWorks = [];
      localStorage.removeItem("viewedArtists");
      localStorage.removeItem("viewedWorks");
      this.showToast("History cleared");
    },
    showToast: function(msg, type) {
      var self = this;
      this.toast = { show: true, message: msg, type: type || "success" };
      setTimeout(function() {
        self.toast.show = false;
      }, 2500);
    },
    saveCustomImagesToDB: function(images) {
      if (!this.customImagesLoaded) return;
      var self = this;
      if (this.useLocalStorageFallback) {
        try {
          localStorage.setItem("customImages", JSON.stringify(images));
        } catch (e) {
        }
      } else {
        this.imageDB.clear().then(function() {
          var keys = Object.keys(images);
          var chain = Promise.resolve();
          keys.forEach(function(code) {
            chain = chain.then(function() {
              return self.imageDB.set(code, images[code]);
            });
          });
          return chain;
        }).catch(function() {
        });
      }
    },
    exportData: function() {
      try {
        var self = this;
        var arr = this.artists.map(function(a2) {
          return { name: a2.name, cover: a2.cover || "", compilations: (a2.compilations || []).map(function(w) {
            return w.code;
          }).sort(), mainWorks: (a2.mainWorks || []).map(function(w) {
            return w.code;
          }).sort() };
        }).sort(function(a2, b) {
          return a2.name.localeCompare(b.name);
        });
        var s = "export const DEFAULT_ARTISTS = [\n";
        arr.forEach(function(a2, i) {
          s += "  {\n    name: '" + a2.name + "',\n    cover: '" + a2.cover + "',\n    url: '" + a2.url + "',\n";
          s += "    compilations: [" + a2.compilations.map(function(c) {
            return "'" + c + "'";
          }).join(", ") + "],\n";
          s += "    mainWorks: [" + a2.mainWorks.map(function(w) {
            return "'" + w + "'";
          }).join(", ") + "]\n";
          s += "  }" + (i < arr.length - 1 ? "," : "") + "\n";
        });
        s += "]";
        var blob = new Blob([s], { type: "text/javascript" });
        var url = URL.createObjectURL(blob);
        var a = (void 0).createElement("a");
        a.href = url;
        a.download = "artists-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0] + ".js";
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Exported");
      } catch (e) {
        this.showToast("Export failed", "error");
      }
    },
    triggerImport: function() {
      this.$refs.fileInput.click();
    },
    importData: function(event) {
      var self = this;
      try {
        var file = event.target.files && event.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
          var data = JSON.parse(e.target.result);
          if (!data.artists || !Array.isArray(data.artists)) return self.showToast("Invalid format", "error");
          self.artists = normalizeArtists(data.artists);
          self.customImages = data.customImages || {};
          localStorage.setItem("artists", JSON.stringify(self.artists));
          self.showToast("Imported");
        };
        reader.readAsText(file);
        event.target.value = "";
      } catch (e) {
        this.showToast("Import failed", "error");
      }
    },
    hardRefresh: function() {
      if (!confirm("Reset everything? Cannot be undone.")) return;
      var self = this;
      ["artists", "viewedArtists", "viewedWorks", "artistSortBy", "customImages"].forEach(function(k) {
        localStorage.removeItem(k);
      });
      var p = this.imageDB ? this.imageDB.clear() : Promise.resolve();
      p.then(function() {
        self.artists = normalizeArtists(JSON.parse(JSON.stringify(DEFAULT_ARTISTS)));
        self.currentView = "artists";
        self.activeTab = "";
        self.customImages = {};
        self.viewedArtists = [];
        self.viewedWorks = [];
        self.artistSortBy = "nameAsc";
        localStorage.setItem("artists", JSON.stringify(self.artists));
        self.showToast("Reset complete");
      });
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "app" }, _attrs))} data-v-3d7499de><header class="bar" data-v-3d7499de><div class="bar-left" data-v-3d7499de>`);
  if (_ctx.currentView !== "artists") {
    _push(`<button class="btn-back" data-v-3d7499de><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><path d="M19 12H5M12 19l-7-7 7-7" data-v-3d7499de></path></svg></button>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.currentView === "artists") {
    _push(`<div class="stats" data-v-3d7499de><span class="stat" data-v-3d7499de><b data-v-3d7499de>${ssrInterpolate(_ctx.artists.length)}</b> artists</span><span class="stat-sep" data-v-3d7499de>/</span><span class="stat" data-v-3d7499de><b data-v-3d7499de>${ssrInterpolate($options.totalCount)}</b> works</span><span class="stat-sep" data-v-3d7499de>/</span><span class="stat" data-v-3d7499de><b data-v-3d7499de>${ssrInterpolate(_ctx.viewedWorks.length)}</b> viewed</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.currentView === "works" && $options.currentArtist) {
    _push(`<div class="bar-artist" data-v-3d7499de><div class="bar-avatar" data-v-3d7499de>`);
    if ($options.getProgressiveImage($options.currentArtist).full) {
      _push(`<img${ssrRenderAttr("src", $options.getProgressiveImage($options.currentArtist).full)} data-v-3d7499de>`);
    } else {
      _push(`<span data-v-3d7499de>${ssrInterpolate($options.currentArtist.name.charAt(0))}</span>`);
    }
    _push(`</div><span class="bar-title" data-v-3d7499de>${ssrInterpolate($options.currentArtist.name)}</span><span class="bar-work-badge" data-v-3d7499de><span class="bar-viewed-count" data-v-3d7499de>${ssrInterpolate($options.getArtistViewedCount($options.currentArtist))}</span><span class="bar-total-sep" data-v-3d7499de>/</span><span class="bar-total-count" data-v-3d7499de>${ssrInterpolate($options.getArtistWorkCount($options.currentArtist))}</span></span></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.currentView === "detail" && $options.currentArtist) {
    _push(`<div class="bar-artist" data-v-3d7499de><div class="bar-avatar" data-v-3d7499de>`);
    if ($options.getProgressiveImage($options.currentArtist).full) {
      _push(`<img${ssrRenderAttr("src", $options.getProgressiveImage($options.currentArtist).full)} data-v-3d7499de>`);
    } else {
      _push(`<span data-v-3d7499de>${ssrInterpolate($options.currentArtist.name.charAt(0))}</span>`);
    }
    _push(`</div><span class="bar-title bar-title-dim" data-v-3d7499de>${ssrInterpolate($options.currentArtist.name)}</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="${ssrRenderStyle({ "color": "var(--ink3)", "flex-shrink": "0" })}" data-v-3d7499de><path d="M9 18l6-6-6-6" data-v-3d7499de></path></svg>`);
    if (_ctx.currentWork) {
      _push(`<span class="bar-title mono" data-v-3d7499de>${ssrInterpolate(_ctx.currentWork.code)}</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div><div class="bar-right" data-v-3d7499de><div class="search-box" data-v-3d7499de><svg class="search-ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><circle cx="11" cy="11" r="7" data-v-3d7499de></circle><path d="M21 21l-4.35-4.35" data-v-3d7499de></path></svg><input${ssrRenderAttr("value", _ctx.searchQuery)} type="text"${ssrRenderAttr("placeholder", _ctx.currentView === "works" ? "Filter works..." : "Search...")} data-v-3d7499de>`);
  if (_ctx.searchQuery) {
    _push(`<button class="search-x" data-v-3d7499de>\xD7</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if (_ctx.currentView === "works" || _ctx.currentView === "artists") {
    _push(`<button class="${ssrRenderClass([{ active: _ctx.viewFilter !== "all" }, "btn-filter"])}" data-v-3d7499de>${ssrInterpolate(_ctx.viewFilter === "all" ? "All" : _ctx.viewFilter === "unviewed" ? "New" : "Seen")}</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="menu-wrap" data-v-3d7499de><button class="btn-menu" data-v-3d7499de><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><circle cx="12" cy="5" r="1.5" data-v-3d7499de></circle><circle cx="12" cy="12" r="1.5" data-v-3d7499de></circle><circle cx="12" cy="19" r="1.5" data-v-3d7499de></circle></svg></button>`);
  if (_ctx.showMenu) {
    _push(`<div class="menu-drop" data-v-3d7499de><button data-v-3d7499de>Add artist</button><button data-v-3d7499de>Export data</button><button data-v-3d7499de>Import data</button><button data-v-3d7499de>Clear history</button><button class="menu-danger" data-v-3d7499de>Reset all</button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></header>`);
  if (_ctx.showMenu) {
    _push(`<div class="menu-backdrop" data-v-3d7499de></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<input type="file" accept=".json" hidden data-v-3d7499de>`);
  if (_ctx.currentView === "artists") {
    _push(`<main class="page" data-v-3d7499de>`);
    if ($options.alphabeticalGroups.length > 3) {
      _push(`<div class="alpha-rail" data-v-3d7499de><!--[-->`);
      ssrRenderList(_ctx.allLetters, (letter) => {
        _push(`<button class="${ssrRenderClass({ active: $options.alphabeticalGroups.indexOf(letter) !== -1 })}"${ssrIncludeBooleanAttr($options.alphabeticalGroups.indexOf(letter) === -1) ? " disabled" : ""} data-v-3d7499de>${ssrInterpolate(letter)}</button>`);
      });
      _push(`<!--]--></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<!--[-->`);
    ssrRenderList($options.alphabeticalGroups, (letter) => {
      _push(`<div class="group" data-v-3d7499de><div class="group-head" data-v-3d7499de><span class="letter" data-v-3d7499de>${ssrInterpolate(letter)}</span><span class="group-n" data-v-3d7499de>${ssrInterpolate($options.groupedArtists[letter].length)}</span></div><div class="grid-artists" data-v-3d7499de><!--[-->`);
      ssrRenderList($options.groupedArtists[letter], (artist) => {
        _push(`<div class="${ssrRenderClass([{ dim: _ctx.viewedArtists.indexOf(artist.name) !== -1 && _ctx.viewFilter === "all" }, "a-card"])}" data-v-3d7499de><div class="a-img" data-v-3d7499de><div class="skeleton" data-v-3d7499de></div>`);
        if ($options.getProgressiveImage(artist).full) {
          _push(`<img${ssrRenderAttr("src", $options.getProgressiveImage(artist).full)}${ssrRenderAttr("alt", artist.name)} loading="lazy" class="fade-img" data-v-3d7499de>`);
        } else {
          _push(`<div class="a-ph" data-v-3d7499de>${ssrInterpolate(artist.name.charAt(0))}</div>`);
        }
        _push(`<div class="a-overlay" data-v-3d7499de><span class="a-name" data-v-3d7499de>${ssrInterpolate(artist.name)}</span><span class="a-count" data-v-3d7499de>${ssrInterpolate($options.getArtistWorkCount(artist))}</span></div>`);
        if ($options.getArtistWorkCount(artist) > 0) {
          _push(`<div class="progress-bar" data-v-3d7499de><div class="progress-fill" style="${ssrRenderStyle({ width: $options.getArtistProgress(artist) + "%" })}" data-v-3d7499de></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (_ctx.viewedArtists.indexOf(artist.name) !== -1) {
          _push(`<span class="badge-check" data-v-3d7499de><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-v-3d7499de><polyline points="20 6 9 17 4 12" data-v-3d7499de></polyline></svg></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div></div>`);
    });
    _push(`<!--]-->`);
    if ($options.filteredArtists.length === 0) {
      _push(`<div class="empty" data-v-3d7499de><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="${ssrRenderStyle({ "opacity": ".3" })}" data-v-3d7499de><circle cx="11" cy="11" r="8" data-v-3d7499de></circle><path d="M21 21l-4.35-4.35" data-v-3d7499de></path><path d="M8 11h6" data-v-3d7499de></path></svg><p data-v-3d7499de>No artists found</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</main>`);
  } else if (_ctx.currentView === "works") {
    _push(`<main class="page" data-v-3d7499de><div class="works-top" data-v-3d7499de><div class="works-info" data-v-3d7499de><div class="chips" data-v-3d7499de>`);
    if ($options.currentArtist && $options.currentArtist.mainWorks && $options.currentArtist.mainWorks.length) {
      _push(`<span class="chip" data-v-3d7499de>${ssrInterpolate($options.currentArtist.mainWorks.length)} main</span>`);
    } else {
      _push(`<!---->`);
    }
    if ($options.currentArtist && $options.currentArtist.compilations && $options.currentArtist.compilations.length) {
      _push(`<span class="chip" data-v-3d7499de>${ssrInterpolate($options.currentArtist.compilations.length)} comp</span>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<span class="chip chip-progress" data-v-3d7499de>${ssrInterpolate($options.getArtistProgress($options.currentArtist))}% viewed</span></div></div><div class="works-actions" data-v-3d7499de><select class="sort-select" data-v-3d7499de><option value="default" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.workSortBy) ? ssrLooseContain(_ctx.workSortBy, "default") : ssrLooseEqual(_ctx.workSortBy, "default")) ? " selected" : ""}>Default</option><option value="codeAsc" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.workSortBy) ? ssrLooseContain(_ctx.workSortBy, "codeAsc") : ssrLooseEqual(_ctx.workSortBy, "codeAsc")) ? " selected" : ""}>Code A-Z</option><option value="codeDesc" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.workSortBy) ? ssrLooseContain(_ctx.workSortBy, "codeDesc") : ssrLooseEqual(_ctx.workSortBy, "codeDesc")) ? " selected" : ""}>Code Z-A</option><option value="newest" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.workSortBy) ? ssrLooseContain(_ctx.workSortBy, "newest") : ssrLooseEqual(_ctx.workSortBy, "newest")) ? " selected" : ""}>Newest</option><option value="unviewed" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.workSortBy) ? ssrLooseContain(_ctx.workSortBy, "unviewed") : ssrLooseEqual(_ctx.workSortBy, "unviewed")) ? " selected" : ""}>Unviewed first</option></select><button class="btn-add" data-v-3d7499de>+ Add</button></div></div><!--[-->`);
    ssrRenderList($options.workSections, (section) => {
      _push(`<div data-v-3d7499de>`);
      if (section.items.length) {
        _push(`<div class="w-section" data-v-3d7499de><div class="w-head" data-v-3d7499de><span class="w-label" data-v-3d7499de>${ssrInterpolate(section.label)}</span><span class="w-n" data-v-3d7499de>${ssrInterpolate(section.items.length)}</span></div><div class="grid-works" data-v-3d7499de><!--[-->`);
        ssrRenderList(section.items, (work) => {
          _push(`<div class="${ssrRenderClass([{ dim: _ctx.viewedWorks.indexOf(work.code) !== -1 && _ctx.viewFilter === "all" }, "w-card"])}" data-v-3d7499de><div class="w-img" data-v-3d7499de><div class="skeleton" data-v-3d7499de></div><img${ssrRenderAttr("src", $options.getProgressiveWorkImage(work).full)}${ssrRenderAttr("alt", work.code)} loading="lazy" class="fade-img" data-v-3d7499de>`);
          if ($options.isCoverWork($options.currentArtist.name, work.code)) {
            _push(`<span class="badge-star" data-v-3d7499de>*</span>`);
          } else {
            _push(`<!---->`);
          }
          if (_ctx.viewedWorks.indexOf(work.code) !== -1) {
            _push(`<span class="badge-check tl" data-v-3d7499de><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-v-3d7499de><polyline points="20 6 9 17 4 12" data-v-3d7499de></polyline></svg></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><span class="w-code" data-v-3d7499de>${ssrInterpolate(work.code)}</span></div>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    });
    _push(`<!--]-->`);
    if ($options.filteredMainWorks.length === 0 && $options.filteredCompilations.length === 0) {
      _push(`<div class="empty" data-v-3d7499de><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="${ssrRenderStyle({ "opacity": ".3" })}" data-v-3d7499de><rect x="3" y="3" width="18" height="18" rx="2" data-v-3d7499de></rect><path d="M9 9l6 6M15 9l-6 6" data-v-3d7499de></path></svg><p data-v-3d7499de>${ssrInterpolate(_ctx.searchQuery || _ctx.viewFilter !== "all" ? "No matches" : "No works yet")}</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</main>`);
  } else if (_ctx.currentView === "detail") {
    _push(`<main class="page" data-v-3d7499de><div class="detail" data-v-3d7499de><div class="detail-left" data-v-3d7499de><div class="big-img" data-v-3d7499de><div class="skeleton" data-v-3d7499de></div><img${ssrRenderAttr("src", $options.getProgressiveWorkImage(_ctx.currentWork).full)}${ssrRenderAttr("alt", _ctx.currentWork.code)} class="fade-img" data-v-3d7499de></div><div class="actions" data-v-3d7499de><div class="act-group" data-v-3d7499de><button class="${ssrRenderClass([{ on: $options.isCoverWork($options.currentArtist.name, _ctx.currentWork.code) }, "act"])}" data-v-3d7499de><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" data-v-3d7499de></polygon></svg> ${ssrInterpolate($options.isCoverWork($options.currentArtist.name, _ctx.currentWork.code) ? "Cover" : "Set cover")}</button><button class="act" data-v-3d7499de><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><rect x="3" y="3" width="18" height="18" rx="2" data-v-3d7499de></rect><circle cx="8.5" cy="8.5" r="1.5" data-v-3d7499de></circle><polyline points="21 15 16 10 5 21" data-v-3d7499de></polyline></svg> ${ssrInterpolate($options.hasCustomImage(_ctx.currentWork.code) ? "Update img" : "Add image")}</button></div><div class="act-group" data-v-3d7499de><button class="act act-copy" data-v-3d7499de><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><rect x="9" y="9" width="13" height="13" rx="2" data-v-3d7499de></rect><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" data-v-3d7499de></path></svg> Copy code </button></div></div></div><div class="detail-right" data-v-3d7499de><h1 class="d-code" data-v-3d7499de>${ssrInterpolate(_ctx.currentWork.code)}</h1><div class="detail-section" data-v-3d7499de><div class="section-header" data-v-3d7499de><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><circle cx="12" cy="12" r="10" data-v-3d7499de></circle><polygon points="10 8 16 12 10 16 10 8" data-v-3d7499de></polygon></svg> Watch on </div><div class="link-grid" data-v-3d7499de><!--[-->`);
    ssrRenderList(_ctx.externalLinks, (link) => {
      _push(`<button class="link-btn" data-v-3d7499de><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" data-v-3d7499de></path><polyline points="15 3 21 3 21 9" data-v-3d7499de></polyline><line x1="10" y1="14" x2="21" y2="3" data-v-3d7499de></line></svg> ${ssrInterpolate(link.label)}</button>`);
    });
    _push(`<!--]--></div></div>`);
    if (_ctx.currentWorkList.length > 1) {
      _push(`<div class="nav-row" data-v-3d7499de><button${ssrIncludeBooleanAttr(!$options.canNavigateWork(-1)) ? " disabled" : ""} class="nav-btn" data-v-3d7499de><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><path d="M15 18l-6-6 6-6" data-v-3d7499de></path></svg></button><span class="nav-pos" data-v-3d7499de>${ssrInterpolate(_ctx.currentWorkIndex + 1)} <small data-v-3d7499de>of ${ssrInterpolate(_ctx.currentWorkList.length)}</small></span><button${ssrIncludeBooleanAttr(!$options.canNavigateWork(1)) ? " disabled" : ""} class="nav-btn" data-v-3d7499de><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><path d="M9 18l6-6-6-6" data-v-3d7499de></path></svg></button></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="detail-section" data-v-3d7499de><div class="section-header" data-v-3d7499de><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" data-v-3d7499de><rect x="3" y="3" width="18" height="18" rx="2" data-v-3d7499de></rect><circle cx="8.5" cy="8.5" r="1.5" data-v-3d7499de></circle><polyline points="21 15 16 10 5 21" data-v-3d7499de></polyline></svg> Gallery <button class="btn-sm"${ssrIncludeBooleanAttr(_ctx.isPreloading) ? " disabled" : ""} data-v-3d7499de>${ssrInterpolate(_ctx.isPreloading ? "..." : "Load all")}</button></div>`);
    if (!$options.galleryAllFailed) {
      _push(`<div class="gallery" data-v-3d7499de><!--[-->`);
      ssrRenderList(20, (i) => {
        _push(`<div class="thumb" style="${ssrRenderStyle(_ctx.galleryFailed.indexOf(i) === -1 ? null : { display: "none" })}" data-v-3d7499de><div class="skeleton" data-v-3d7499de></div><img${ssrRenderAttr("src", $options.getImageUrl(_ctx.currentWork.code, "jp-" + i))}${ssrRenderAttr("alt", _ctx.currentWork.code + " " + i)} loading="lazy" class="fade-img" data-v-3d7499de><span class="t-n" data-v-3d7499de>${ssrInterpolate(i)}</span></div>`);
      });
      _push(`<!--]--></div>`);
    } else {
      _push(`<!---->`);
    }
    if ($options.galleryAllFailed) {
      _push(`<div class="gallery-empty" data-v-3d7499de><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="${ssrRenderStyle({ "opacity": ".3" })}" data-v-3d7499de><rect x="3" y="3" width="18" height="18" rx="2" data-v-3d7499de></rect><circle cx="8.5" cy="8.5" r="1.5" data-v-3d7499de></circle><polyline points="21 15 16 10 5 21" data-v-3d7499de></polyline></svg><p data-v-3d7499de>No gallery images available</p></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div></div></div></main>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.showAddWorkModal) {
    _push(`<div class="overlay" data-v-3d7499de><div class="modal" data-v-3d7499de><div class="m-head" data-v-3d7499de><h3 data-v-3d7499de>Add work</h3><button class="m-x" data-v-3d7499de>\xD7</button></div><div class="m-body" data-v-3d7499de><label class="field" data-v-3d7499de><span data-v-3d7499de>Artist</span><select data-v-3d7499de><option value="" data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.newWork.artist) ? ssrLooseContain(_ctx.newWork.artist, "") : ssrLooseEqual(_ctx.newWork.artist, "")) ? " selected" : ""}>Select...</option><!--[-->`);
    ssrRenderList(_ctx.artists, (a) => {
      _push(`<option${ssrRenderAttr("value", a.name)} data-v-3d7499de${ssrIncludeBooleanAttr(Array.isArray(_ctx.newWork.artist) ? ssrLooseContain(_ctx.newWork.artist, a.name) : ssrLooseEqual(_ctx.newWork.artist, a.name)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
    });
    _push(`<!--]--></select></label><label class="field" data-v-3d7499de><span data-v-3d7499de>Code</span><input${ssrRenderAttr("value", _ctx.newWork.code)} placeholder="e.g. ABC-123" data-v-3d7499de></label><div class="radios" data-v-3d7499de><label class="radio" data-v-3d7499de><input${ssrIncludeBooleanAttr(ssrLooseEqual(_ctx.newWork.type, "mainWorks")) ? " checked" : ""} type="radio" value="mainWorks" data-v-3d7499de><span data-v-3d7499de>Main</span></label><label class="radio" data-v-3d7499de><input${ssrIncludeBooleanAttr(ssrLooseEqual(_ctx.newWork.type, "compilations")) ? " checked" : ""} type="radio" value="compilations" data-v-3d7499de><span data-v-3d7499de>Compilation</span></label></div></div><div class="m-foot" data-v-3d7499de><button class="btn-flat" data-v-3d7499de>Cancel</button><button class="btn-fill" data-v-3d7499de>Add</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.showAddArtistModal) {
    _push(`<div class="overlay" data-v-3d7499de><div class="modal" data-v-3d7499de><div class="m-head" data-v-3d7499de><h3 data-v-3d7499de>Add artist</h3><button class="m-x" data-v-3d7499de>\xD7</button></div><div class="m-body" data-v-3d7499de><label class="field" data-v-3d7499de><span data-v-3d7499de>Name</span><input${ssrRenderAttr("value", _ctx.newArtistName)} placeholder="Artist name" data-v-3d7499de></label></div><div class="m-foot" data-v-3d7499de><button class="btn-flat" data-v-3d7499de>Cancel</button><button class="btn-fill" data-v-3d7499de>Add</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.showUploadModal) {
    _push(`<div class="overlay" data-v-3d7499de><div class="modal" data-v-3d7499de><div class="m-head" data-v-3d7499de><h3 data-v-3d7499de>Custom image</h3><button class="m-x" data-v-3d7499de>\xD7</button></div><div class="m-body" data-v-3d7499de><p class="m-sub" data-v-3d7499de>${ssrInterpolate(_ctx.uploadingWork)}</p><label class="field" data-v-3d7499de><span data-v-3d7499de>Image URL</span><input${ssrRenderAttr("value", _ctx.customImageUrl)} placeholder="https://..." data-v-3d7499de></label><p class="hint" data-v-3d7499de>Leave empty to remove</p></div><div class="m-foot" data-v-3d7499de><button class="btn-flat" data-v-3d7499de>Cancel</button><button class="btn-fill" data-v-3d7499de>${ssrInterpolate(_ctx.customImageUrl.trim() ? "Save" : "Remove")}</button></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.lightbox.show) {
    _push(`<div class="lb" data-v-3d7499de><button class="lb-close" data-v-3d7499de>\xD7</button>`);
    if (_ctx.lightbox.images.length > 1) {
      _push(`<button class="lb-arr left"${ssrIncludeBooleanAttr(_ctx.lightbox.currentIndex === 0) ? " disabled" : ""} data-v-3d7499de>&lt;</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<div class="lb-main" data-v-3d7499de><img${ssrRenderAttr("src", _ctx.lightbox.images[_ctx.lightbox.currentIndex])}${ssrRenderAttr("alt", _ctx.lightbox.code)} data-v-3d7499de></div>`);
    if (_ctx.lightbox.images.length > 1) {
      _push(`<button class="lb-arr right"${ssrIncludeBooleanAttr(_ctx.lightbox.currentIndex === _ctx.lightbox.images.length - 1) ? " disabled" : ""} data-v-3d7499de>&gt;</button>`);
    } else {
      _push(`<!---->`);
    }
    _push(`<span class="lb-count" data-v-3d7499de>${ssrInterpolate(_ctx.lightbox.currentIndex + 1)} / ${ssrInterpolate(_ctx.lightbox.images.length)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if (_ctx.toast.show) {
    _push(`<div class="${ssrRenderClass([_ctx.toast.type, "toast"])}" data-v-3d7499de>${ssrInterpolate(_ctx.toast.message)}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="${ssrRenderClass([{ visible: _ctx.showShortcutHint }, "shortcut-hint"])}" data-v-3d7499de><kbd data-v-3d7499de>/</kbd> to search </div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Idol2.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Idol2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-3d7499de"]]);

export { Idol2 as default };
//# sourceMappingURL=Idol2-uGPlTeM7.mjs.map
