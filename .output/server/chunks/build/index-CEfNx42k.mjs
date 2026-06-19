import { _ as __nuxt_component_0 } from './nuxt-link-BwowhboU.mjs';
import { mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  name: "PagesDashboard",
  data() {
    return {
      searchQuery: "",
      pages: [
        { name: "Home", route: "/", icon: "\u{1F3E0}" },
        { name: "Best", route: "/best", icon: "\u{1F31F}" },
        { name: "Compressor", route: "/compressor", icon: "\u{1F5DC}\uFE0F" },
        { name: "Gold", route: "/gold", icon: "\u{1F4B0}" },
        { name: "MPG", route: "/mpg", icon: "\u26FD" },
        { name: "Phone", route: "/phone", icon: "\u{1F4F1}" },
        { name: "Project", route: "/project", icon: "\u{1F4CA}" },
        { name: "KHQR", route: "/qr", icon: "\u{1F532}" },
        { name: "Sort", route: "/sort", icon: "\u{1F4AC}" },
        { name: "Text Converter", route: "/text-converter", icon: "\u{1F4DD}" }
      ]
    };
  },
  computed: {
    filteredPages() {
      if (!this.searchQuery.trim()) {
        return this.pages;
      }
      const query = this.searchQuery.toLowerCase();
      return this.pages.filter(
        (page) => page.name.toLowerCase().includes(query)
      );
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard" }, _attrs))} data-v-6b4147a0><header class="header" data-v-6b4147a0><div class="header-inner" data-v-6b4147a0><h1 class="title" data-v-6b4147a0>Ousa&#39;s Tool</h1><div class="search" data-v-6b4147a0><input${ssrRenderAttr("value", $data.searchQuery)} type="text" placeholder="Search..." class="search-input" data-v-6b4147a0>`);
  if ($data.searchQuery) {
    _push(`<button class="search-clear" data-v-6b4147a0> \xD7 </button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div></header><main class="main" data-v-6b4147a0><div class="container" data-v-6b4147a0><div class="grid" data-v-6b4147a0><!--[-->`);
  ssrRenderList($options.filteredPages, (page) => {
    _push(ssrRenderComponent(_component_NuxtLink, {
      key: page.route,
      to: page.route,
      class: "card",
      "exact-active-class": "card-active"
    }, {
      default: withCtx((_, _push2, _parent2, _scopeId) => {
        if (_push2) {
          _push2(`<div class="card-icon" data-v-6b4147a0${_scopeId}>${ssrInterpolate(page.icon || "\u{1F4C4}")}</div><span class="card-name" data-v-6b4147a0${_scopeId}>${ssrInterpolate(page.name)}</span>`);
        } else {
          return [
            createVNode("div", { class: "card-icon" }, toDisplayString(page.icon || "\u{1F4C4}"), 1),
            createVNode("span", { class: "card-name" }, toDisplayString(page.name), 1)
          ];
        }
      }),
      _: 2
    }, _parent));
  });
  _push(`<!--]--></div>`);
  if ($options.filteredPages.length === 0) {
    _push(`<div class="empty" data-v-6b4147a0><p data-v-6b4147a0>No pages found</p><button class="empty-btn" data-v-6b4147a0>Clear</button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></main></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-6b4147a0"]]);

export { index as default };
//# sourceMappingURL=index-CEfNx42k.mjs.map
