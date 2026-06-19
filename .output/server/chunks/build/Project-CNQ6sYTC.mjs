import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate } from 'vue/server-renderer';
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
  name: "TogglePage",
  data() {
    return {
      cheap: false,
      fast: false,
      highQuality: false,
      showAlert: false,
      showCopySuccess: false
    };
  },
  computed: {
    selectedCount() {
      return [this.cheap, this.fast, this.highQuality].filter(Boolean).length;
    },
    getSelectionMessage() {
      if (this.cheap && this.fast) {
        return "Lower costs and faster delivery, but expect compromises in quality and refinement.";
      }
      if (this.cheap && this.highQuality) {
        return "Affordable excellence takes patience. Budget-friendly quality requires extended timelines.";
      }
      if (this.fast && this.highQuality) {
        return "Premium results delivered quickly come at a premium price. Speed and quality cost more.";
      }
      return "";
    },
    getResultIcon() {
      if (this.cheap && this.fast) return "\u{1F3C3}\u200D\u2642\uFE0F";
      if (this.cheap && this.highQuality) return "\u23F3";
      if (this.fast && this.highQuality) return "\u{1F48E}";
      return "\u{1F3AF}";
    }
  },
  methods: {
    handleToggle(toggleName) {
      if (this.selectedCount > 2) {
        this.showAlert = true;
        setTimeout(() => {
          this.showAlert = false;
        }, 4e3);
        this.$nextTick(() => {
          this[toggleName] = false;
        });
      }
    },
    async copyResult() {
      const selectedOptions = [];
      if (this.cheap) selectedOptions.push("Budget-Friendly");
      if (this.fast) selectedOptions.push("Quick Delivery");
      if (this.highQuality) selectedOptions.push("Premium Quality");
      const textToCopy = `My Project Priorities:
\u2022 ${selectedOptions.join(" & ")}

Trade-off: ${this.getSelectionMessage}`;
      try {
        await (void 0).clipboard.writeText(textToCopy);
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 2e3);
      } catch (err) {
        const textArea = (void 0).createElement("textarea");
        textArea.value = textToCopy;
        (void 0).body.appendChild(textArea);
        textArea.select();
        (void 0).execCommand("copy");
        (void 0).body.removeChild(textArea);
        this.showCopySuccess = true;
        setTimeout(() => {
          this.showCopySuccess = false;
        }, 2e3);
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "toggle-container" }, _attrs))} data-v-95e91417><div class="card" data-v-95e91417><div class="header" data-v-95e91417><div class="icon-badge" data-v-95e91417>\u{1F3AF}</div><h1 class="title" data-v-95e91417>The Project Triangle</h1><p class="subtitle" data-v-95e91417>Pick any two. You can&#39;t have all three.</p></div><div class="toggles" data-v-95e91417><div class="${ssrRenderClass([{ active: $data.cheap }, "toggle-item"])}" data-v-95e91417><label class="toggle-label" data-v-95e91417><div class="toggle-info" data-v-95e91417><span class="toggle-icon" data-v-95e91417>\u{1F4B0}</span><div class="toggle-content" data-v-95e91417><span class="toggle-title" data-v-95e91417>Budget-Friendly</span><span class="toggle-description" data-v-95e91417>Keep costs low</span></div></div><div class="toggle-switch" data-v-95e91417><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.cheap) ? ssrLooseContain($data.cheap, null) : $data.cheap) ? " checked" : ""} data-v-95e91417><span class="slider" data-v-95e91417></span></div></label></div><div class="${ssrRenderClass([{ active: $data.fast }, "toggle-item"])}" data-v-95e91417><label class="toggle-label" data-v-95e91417><div class="toggle-info" data-v-95e91417><span class="toggle-icon" data-v-95e91417>\u26A1</span><div class="toggle-content" data-v-95e91417><span class="toggle-title" data-v-95e91417>Quick Delivery</span><span class="toggle-description" data-v-95e91417>Done rapidly</span></div></div><div class="toggle-switch" data-v-95e91417><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.fast) ? ssrLooseContain($data.fast, null) : $data.fast) ? " checked" : ""} data-v-95e91417><span class="slider" data-v-95e91417></span></div></label></div><div class="${ssrRenderClass([{ active: $data.highQuality }, "toggle-item"])}" data-v-95e91417><label class="toggle-label" data-v-95e91417><div class="toggle-info" data-v-95e91417><span class="toggle-icon" data-v-95e91417>\u2728</span><div class="toggle-content" data-v-95e91417><span class="toggle-title" data-v-95e91417>Premium Quality</span><span class="toggle-description" data-v-95e91417>Exceptional results</span></div></div><div class="toggle-switch" data-v-95e91417><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray($data.highQuality) ? ssrLooseContain($data.highQuality, null) : $data.highQuality) ? " checked" : ""} data-v-95e91417><span class="slider" data-v-95e91417></span></div></label></div></div>`);
  if ($options.selectedCount > 2 || $data.showAlert) {
    _push(`<div class="warning" data-v-95e91417><span class="warning-icon" data-v-95e91417>\u26A0\uFE0F</span><span data-v-95e91417>You can only choose two priorities</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showAlert) {
    _push(`<div class="custom-alert" data-v-95e91417><div class="alert-content" data-v-95e91417><span class="alert-icon" data-v-95e91417>\u{1F3AF}</span><div class="alert-text" data-v-95e91417><strong data-v-95e91417>Nice try!</strong><p data-v-95e91417>But the Project Triangle law says you can only pick 2 out of 3. Something has to give! </p></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.selectedCount === 2) {
    _push(`<div class="result" data-v-95e91417><div class="result-icon" data-v-95e91417>${ssrInterpolate($options.getResultIcon)}</div><h3 data-v-95e91417>Your Trade-off</h3><p data-v-95e91417>${ssrInterpolate($options.getSelectionMessage)}</p><button class="copy-button" data-v-95e91417><span class="copy-icon" data-v-95e91417>\u{1F4CB}</span> Copy Result </button>`);
    if ($data.showCopySuccess) {
      _push(`<div class="copy-success" data-v-95e91417> \u2713 Copied to clipboard! </div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.selectedCount === 0) {
    _push(`<div class="empty-state" data-v-95e91417><p data-v-95e91417>Select your two priorities to see the trade-off</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Project.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Project = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-95e91417"]]);

export { Project as default };
//# sourceMappingURL=Project-CNQ6sYTC.mjs.map
