import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = {
  data() {
    return {
      artists: [],
      currentArtist: null,
      showAddForm: false,
      showAddWorkForm: false,
      showEditArtistForm: false,
      showEditWorkForm: false,
      lightboxImage: null,
      newArtist: {
        name: "",
        profileImage: ""
      },
      editArtist: {
        id: null,
        name: "",
        profileImage: ""
      },
      newWork: {
        title: "",
        code: "",
        link: "",
        coverImage: ""
      },
      editWork: {
        id: null,
        artistId: null,
        title: "",
        code: "",
        link: "",
        coverImage: ""
      }
    };
  },
  mounted() {
    this.loadArtists();
  },
  methods: {
    loadArtists() {
      const saved = localStorage.getItem("favoriteArtists");
      if (saved) {
        this.artists = JSON.parse(saved);
      }
    },
    saveArtists() {
      localStorage.setItem("favoriteArtists", JSON.stringify(this.artists));
    },
    addArtist() {
      const artist = {
        id: Date.now(),
        name: this.newArtist.name,
        profileImage: this.newArtist.profileImage,
        works: []
      };
      this.artists.push(artist);
      this.saveArtists();
      this.newArtist = { name: "", profileImage: "" };
      this.showAddForm = false;
    },
    deleteArtist(id) {
      if (confirm("Delete this artist and all their works?")) {
        this.artists = this.artists.filter((a) => a.id !== id);
        this.saveArtists();
      }
    },
    openAddWorkForm(artist) {
      this.currentArtist = artist;
      this.showAddWorkForm = true;
    },
    openEditArtistForm(artist) {
      this.editArtist = {
        id: artist.id,
        name: artist.name,
        profileImage: artist.profileImage
      };
      this.showEditArtistForm = true;
    },
    openEditWorkForm(artist, work) {
      this.editWork = {
        id: work.id,
        artistId: artist.id,
        title: work.title,
        code: work.code,
        link: work.link,
        coverImage: work.coverImage
      };
      this.showEditWorkForm = true;
    },
    updateArtist() {
      const index = this.artists.findIndex((a) => a.id === this.editArtist.id);
      if (index !== -1) {
        this.artists[index].name = this.editArtist.name;
        this.artists[index].profileImage = this.editArtist.profileImage;
        this.saveArtists();
      }
      this.showEditArtistForm = false;
      this.editArtist = { id: null, name: "", profileImage: "" };
    },
    updateWork() {
      const artist = this.artists.find((a) => a.id === this.editWork.artistId);
      if (artist) {
        const workIndex = artist.works.findIndex((w) => w.id === this.editWork.id);
        if (workIndex !== -1) {
          artist.works[workIndex] = {
            id: this.editWork.id,
            title: this.editWork.title,
            code: this.editWork.code,
            link: this.editWork.link,
            coverImage: this.editWork.coverImage
          };
          this.saveArtists();
        }
      }
      this.showEditWorkForm = false;
      this.editWork = { id: null, artistId: null, title: "", code: "", link: "", coverImage: "" };
    },
    openLightbox(src, title, artist, medium) {
      this.lightboxImage = {
        src,
        title,
        artist,
        medium
      };
    },
    closeLightbox() {
      this.lightboxImage = null;
    },
    addWork() {
      const work = {
        id: Date.now(),
        title: this.newWork.title,
        code: this.newWork.code,
        link: this.newWork.link,
        coverImage: this.newWork.coverImage
      };
      this.currentArtist.works.push(work);
      const index = this.artists.findIndex((a) => a.id === this.currentArtist.id);
      if (index !== -1) {
        this.artists[index] = this.currentArtist;
        this.saveArtists();
      }
      this.newWork = { title: "", code: "", link: "", coverImage: "" };
      this.showAddWorkForm = false;
      this.currentArtist = null;
    },
    deleteWork(artistId, workId) {
      if (confirm("Delete this work?")) {
        const artist = this.artists.find((a) => a.id === artistId);
        if (artist) {
          artist.works = artist.works.filter((w) => w.id !== workId);
          this.saveArtists();
        }
      }
    },
    exportData() {
      const dataStr = JSON.stringify(this.artists, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = (void 0).createElement("a");
      link.href = url;
      link.download = `artists-backup-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    triggerImport() {
      this.$refs.fileInput.click();
    },
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            if (confirm("This will replace all current data. Continue?")) {
              this.artists = imported;
              this.saveArtists();
              alert("Data imported successfully!");
            }
          } else {
            alert("Invalid file format");
          }
        } catch (error) {
          alert("Error reading file");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "app" }, _attrs))} data-v-39db548a><header class="header" data-v-39db548a><div class="header-content" data-v-39db548a><h1 data-v-39db548a>My Artists</h1><div class="header-actions" data-v-39db548a><button class="icon-btn" title="Export" data-v-39db548a><span data-v-39db548a>\u2193</span></button><button class="icon-btn" title="Import" data-v-39db548a><span data-v-39db548a>\u2191</span></button><input type="file" accept=".json" style="${ssrRenderStyle({ "display": "none" })}" data-v-39db548a><button class="btn-add" data-v-39db548a> + Add Artist </button></div></div></header>`);
  if ($data.showAddForm) {
    _push(`<div class="modal" data-v-39db548a><div class="modal-content" data-v-39db548a><h2 data-v-39db548a>Add Artist</h2><form data-v-39db548a><input${ssrRenderAttr("value", $data.newArtist.name)} type="text" placeholder="Artist name" required class="input" autofocus data-v-39db548a><input${ssrRenderAttr("value", $data.newArtist.profileImage)} type="url" placeholder="Profile image URL" required class="input" data-v-39db548a><div class="modal-actions" data-v-39db548a><button type="button" class="btn btn-secondary" data-v-39db548a> Cancel </button><button type="submit" class="btn btn-primary" data-v-39db548a> Add </button></div></form></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showEditArtistForm) {
    _push(`<div class="modal" data-v-39db548a><div class="modal-content" data-v-39db548a><h2 data-v-39db548a>Edit Artist</h2><form data-v-39db548a><input${ssrRenderAttr("value", $data.editArtist.name)} type="text" placeholder="Artist name" required class="input" autofocus data-v-39db548a><input${ssrRenderAttr("value", $data.editArtist.profileImage)} type="url" placeholder="Profile image URL" required class="input" data-v-39db548a><div class="modal-actions" data-v-39db548a><button type="button" class="btn btn-secondary" data-v-39db548a> Cancel </button><button type="submit" class="btn btn-primary" data-v-39db548a> Save </button></div></form></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showEditWorkForm) {
    _push(`<div class="modal" data-v-39db548a><div class="modal-content" data-v-39db548a><h2 data-v-39db548a>Edit Work</h2><form data-v-39db548a><input${ssrRenderAttr("value", $data.editWork.title)} type="text" placeholder="Work title" required class="input" autofocus data-v-39db548a><input${ssrRenderAttr("value", $data.editWork.code)} type="text" placeholder="Medium (e.g., Oil on canvas, Digital art)" required class="input" data-v-39db548a><input${ssrRenderAttr("value", $data.editWork.link)} type="url" placeholder="Link (optional)" class="input" data-v-39db548a><input${ssrRenderAttr("value", $data.editWork.coverImage)} type="url" placeholder="Cover image URL" required class="input" data-v-39db548a><div class="modal-actions" data-v-39db548a><button type="button" class="btn btn-secondary" data-v-39db548a> Cancel </button><button type="submit" class="btn btn-primary" data-v-39db548a> Save </button></div></form></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showAddWorkForm) {
    _push(`<div class="modal" data-v-39db548a><div class="modal-content" data-v-39db548a><h2 data-v-39db548a>Add Work</h2><p class="modal-subtitle" data-v-39db548a>for ${ssrInterpolate($data.currentArtist.name)}</p><form data-v-39db548a><input${ssrRenderAttr("value", $data.newWork.title)} type="text" placeholder="Work title" required class="input" autofocus data-v-39db548a><input${ssrRenderAttr("value", $data.newWork.code)} type="text" placeholder="Medium (e.g., Oil on canvas, Digital art)" required class="input" data-v-39db548a><input${ssrRenderAttr("value", $data.newWork.link)} type="url" placeholder="Link (optional)" class="input" data-v-39db548a><input${ssrRenderAttr("value", $data.newWork.coverImage)} type="url" placeholder="Cover image URL" required class="input" data-v-39db548a><div class="modal-actions" data-v-39db548a><button type="button" class="btn btn-secondary" data-v-39db548a> Cancel </button><button type="submit" class="btn btn-primary" data-v-39db548a> Add </button></div></form></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.lightboxImage) {
    _push(`<div class="lightbox" data-v-39db548a><button class="lightbox-close" data-v-39db548a>\xD7</button><div class="lightbox-content" data-v-39db548a><img${ssrRenderAttr("src", $data.lightboxImage.src)}${ssrRenderAttr("alt", $data.lightboxImage.alt)} class="lightbox-image" data-v-39db548a>`);
    if ($data.lightboxImage.title) {
      _push(`<div class="lightbox-info" data-v-39db548a><h3 data-v-39db548a>${ssrInterpolate($data.lightboxImage.title)}</h3>`);
      if ($data.lightboxImage.artist) {
        _push(`<p data-v-39db548a>${ssrInterpolate($data.lightboxImage.artist)}</p>`);
      } else {
        _push(`<!---->`);
      }
      if ($data.lightboxImage.medium) {
        _push(`<p class="lightbox-medium" data-v-39db548a>${ssrInterpolate($data.lightboxImage.medium)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div><div class="lightbox-hint" data-v-39db548a>Click anywhere to close</div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<main class="main" data-v-39db548a>`);
  if ($data.artists.length > 0) {
    _push(`<div class="artists-list" data-v-39db548a><!--[-->`);
    ssrRenderList($data.artists, (artist) => {
      _push(`<article class="artist-block" data-v-39db548a><div class="artist-header" data-v-39db548a><div class="artist-profile" data-v-39db548a><div class="artist-avatar-wrapper" data-v-39db548a>`);
      if (artist.profileImage) {
        _push(`<img${ssrRenderAttr("src", artist.profileImage)}${ssrRenderAttr("alt", artist.name)} class="artist-avatar" data-v-39db548a>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="avatar-zoom-hint" data-v-39db548a><span data-v-39db548a>\u{1F50D}</span></div></div><div class="artist-info" data-v-39db548a><h2 data-v-39db548a>${ssrInterpolate(artist.name)}</h2><p class="work-count" data-v-39db548a>${ssrInterpolate(artist.works.length)} ${ssrInterpolate(artist.works.length === 1 ? "work" : "works")}</p></div></div><div class="artist-controls" data-v-39db548a><button class="btn-icon-edit" title="Edit Artist" data-v-39db548a><span data-v-39db548a>\u270E</span></button><button class="btn btn-primary btn-icon" data-v-39db548a><span data-v-39db548a>+</span> Add Work </button><button class="btn-icon-only" title="Delete Artist" data-v-39db548a><span data-v-39db548a>\xD7</span></button></div></div>`);
      if (artist.works.length > 0) {
        _push(`<div class="works-grid" data-v-39db548a><!--[-->`);
        ssrRenderList(artist.works, (work) => {
          _push(`<div class="work-item" data-v-39db548a><div class="work-image-container" data-v-39db548a>`);
          if (work.coverImage) {
            _push(`<img${ssrRenderAttr("src", work.coverImage)}${ssrRenderAttr("alt", work.title)} class="work-image" data-v-39db548a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="work-actions" data-v-39db548a><button class="work-action-btn" title="Edit" data-v-39db548a> \u270E </button><button class="work-action-btn" title="Delete" data-v-39db548a> \xD7 </button></div><div class="image-zoom-hint" data-v-39db548a><span data-v-39db548a>\u{1F50D}</span></div></div><div class="work-details" data-v-39db548a><h3 data-v-39db548a>${ssrInterpolate(work.title)}</h3><p class="work-medium" data-v-39db548a>${ssrInterpolate(work.code)}</p>`);
          if (work.link) {
            _push(`<a${ssrRenderAttr("href", work.link)} target="_blank" class="work-link" data-v-39db548a> View \u2192 </a>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div class="empty-works" data-v-39db548a><p data-v-39db548a>No works yet</p><button class="btn btn-secondary btn-sm" data-v-39db548a> Add First Work </button></div>`);
      }
      _push(`</article>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<div class="empty" data-v-39db548a><div class="empty-content" data-v-39db548a><h2 data-v-39db548a>No Artists Yet</h2><p data-v-39db548a>Start by adding your first favorite artist</p><button class="btn btn-primary" data-v-39db548a> + Add Artist </button></div></div>`);
  }
  _push(`</main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/best.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const best = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-39db548a"]]);

export { best as default };
//# sourceMappingURL=best-CEJ9zuDU.mjs.map
