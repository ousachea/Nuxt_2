import { _ as __nuxt_component_0 } from './nuxt-link-BwowhboU.mjs';
import { mergeProps, withCtx, openBlock, createBlock, toDisplayString, createCommentVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
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

const _sfc_main$1 = {
  name: "FloatingNavButton",
  props: {
    menuItems: {
      type: Array,
      default: () => [
        { label: "Home", path: "/", icon: "\u{1F3E0}" },
        { label: "Compressor", path: "/compressor", icon: "\u{1F504}" },
        { label: "Compressor V2", path: "/compressorv2", icon: "\u{1F504}" },
        { label: "Gold", path: "/gold", icon: "\u2728" },
        { label: "MPG", path: "/MPG", icon: "\u{1F697}" },
        { label: "Phone", path: "/Phone", icon: "\u{1F4F1}" },
        { label: "Webflow inspector", path: "/webflowinspector", icon: "\u{1F50D}" },
        { label: "Text Converter", path: "/TextConverter", icon: "\u{1F4DD}" },
        { label: "Silver", path: "/Silver", icon: "\u{1F4DD}" },
        { label: "Food", path: "/food", icon: "\u{1F35D}" }
      ]
    }
  },
  data() {
    return {
      menuOpen: false
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    }
  },
  watch: {
    "$route"() {
      this.closeMenu();
    }
  },
  mounted() {
    (void 0).addEventListener("click", (e) => {
      if (!this.$el.contains(e.target)) {
        this.closeMenu();
      }
    });
  },
  beforeUnmount() {
    (void 0).removeEventListener("click", this.closeMenu);
  }
};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtLink = __nuxt_component_0;
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "floating-menu-container" }, _attrs))} data-v-7f343eb4><button class="${ssrRenderClass([{ "is-open": $data.menuOpen }, "floating-menu-button"])}" data-v-7f343eb4><span class="${ssrRenderClass([{ "open": $data.menuOpen }, "menu-icon"])}" data-v-7f343eb4><span data-v-7f343eb4></span><span data-v-7f343eb4></span><span data-v-7f343eb4></span></span></button>`);
  if ($data.menuOpen) {
    _push(`<div class="floating-menu" data-v-7f343eb4><!--[-->`);
    ssrRenderList($props.menuItems, (item, index) => {
      _push(ssrRenderComponent(_component_NuxtLink, {
        key: index,
        to: item.path,
        class: "floating-menu-item",
        onClick: $options.closeMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (item.icon) {
              _push2(`<span class="menu-item-icon" data-v-7f343eb4${_scopeId}>${ssrInterpolate(item.icon)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(` ${ssrInterpolate(item.label)}`);
          } else {
            return [
              item.icon ? (openBlock(), createBlock("span", {
                key: 0,
                class: "menu-item-icon"
              }, toDisplayString(item.icon), 1)) : createCommentVNode("", true),
              createTextVNode(" " + toDisplayString(item.label), 1)
            ];
          }
        }),
        _: 2
      }, _parent));
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PageSwitcher.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const PageSwitcher = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender$1], ["__scopeId", "data-v-7f343eb4"]]);
const CONVERSION_FACTOR = 235.215;
const MPG_LIMITS = { min: 1, max: 150 };
const L100KM_LIMITS = { min: 1.5, max: 50 };
const VEHICLE_PRESETS = [
  { name: "Compact", icon: "\u{1F697}", mpg: 32, l100km: 7.4, description: "Small efficient car" },
  { name: "Sedan", icon: "\u{1F699}", mpg: 28, l100km: 8.4, description: "Mid-size sedan" },
  { name: "SUV", icon: "\u{1F690}", mpg: 22, l100km: 10.7, description: "Sport utility vehicle" },
  { name: "Sport Car", icon: "\u{1F3CE}\uFE0F", mpg: 20, l100km: 11.8, description: "High-performance sports car" },
  { name: "Truck", icon: "\u{1F6FB}", mpg: 18, l100km: 13.1, description: "Pickup truck" },
  { name: "Hybrid", icon: "\u{1F50B}", mpg: 45, l100km: 5.2, description: "Hybrid vehicle" }
];
const _sfc_main = {
  components: {
    PageSwitcher
  },
  data() {
    return {
      conversionMode: "mpg-to-l100km",
      inputValue: 25,
      isCalculating: false,
      calculationHistory: [],
      debounceTimer: null
    };
  },
  computed: {
    vehiclePresets() {
      return VEHICLE_PRESETS;
    },
    inputId() {
      return `${this.conversionMode}-input`;
    },
    inputHelpId() {
      return `${this.conversionMode}-help`;
    },
    inputLimits() {
      return this.conversionMode === "mpg-to-l100km" ? MPG_LIMITS : L100KM_LIMITS;
    },
    inputStep() {
      return this.conversionMode === "mpg-to-l100km" ? "1" : "0.1";
    },
    inputUnit() {
      return this.conversionMode === "mpg-to-l100km" ? "MPG" : "L/100km";
    },
    outputUnit() {
      return this.conversionMode === "mpg-to-l100km" ? "L/100km" : "MPG";
    },
    inputPlaceholder() {
      return this.conversionMode === "mpg-to-l100km" ? "Enter MPG (e.g., 25)" : "Enter L/100km (e.g., 8.5)";
    },
    inputHelpText() {
      const range = this.conversionMode === "mpg-to-l100km" ? "Typical range: 15-50 MPG" : "Typical range: 4-15 L/100km";
      return `${range} \u2022 Lower L/100km = better efficiency`;
    },
    infoText() {
      return this.conversionMode === "mpg-to-l100km" ? "Lower L/100km values indicate better fuel efficiency" : "Higher MPG values indicate better fuel efficiency";
    },
    showWarning() {
      const value = parseFloat(this.inputValue);
      if (isNaN(value)) return false;
      if (this.conversionMode === "mpg-to-l100km") {
        return value > 60 || value < 10;
      } else {
        return value > 20 || value < 3;
      }
    },
    showError() {
      const value = parseFloat(this.inputValue);
      if (isNaN(value)) return true;
      return value < this.inputLimits.min || value > this.inputLimits.max;
    },
    feedbackMessage() {
      if (this.showError) {
        return `Value must be between ${this.inputLimits.min} and ${this.inputLimits.max}`;
      }
      if (this.showWarning) {
        return this.conversionMode === "mpg-to-l100km" ? "This is unusually high/low for typical vehicles" : "This represents unusually high/low fuel consumption";
      }
      return "";
    },
    hasValidResult() {
      const value = parseFloat(this.inputValue);
      return !isNaN(value) && value >= this.inputLimits.min && value <= this.inputLimits.max;
    },
    displayResult() {
      if (!this.hasValidResult) return "-";
      const inputVal = parseFloat(this.inputValue);
      let result;
      if (this.conversionMode === "mpg-to-l100km") {
        result = CONVERSION_FACTOR / inputVal;
      } else {
        result = CONVERSION_FACTOR / inputVal;
      }
      return result < 10 ? result.toFixed(1) : result.toFixed(0);
    },
    kmPerLiter() {
      if (!this.hasValidResult) return "-";
      const inputVal = parseFloat(this.inputValue);
      let l100km;
      if (this.conversionMode === "mpg-to-l100km") {
        l100km = CONVERSION_FACTOR / inputVal;
      } else {
        l100km = inputVal;
      }
      const kmL = 100 / l100km;
      return kmL.toFixed(1);
    },
    showAdditionalConversions() {
      return this.hasValidResult;
    },
    showComparison() {
      return this.hasValidResult;
    },
    comparisonText() {
      if (!this.hasValidResult) return "";
      const inputVal = parseFloat(this.inputValue);
      let l100km = this.conversionMode === "mpg-to-l100km" ? CONVERSION_FACTOR / inputVal : inputVal;
      if (l100km <= 4) return "Excellent - Better than most hybrids";
      if (l100km <= 6) return "Great - Hybrid vehicle range";
      if (l100km <= 8) return "Good - Compact car range";
      if (l100km <= 12) return "Average - Mid-size vehicle range";
      return "High consumption - Large vehicle/truck range";
    },
    efficiencyText() {
      if (!this.hasValidResult) return "Enter value";
      const inputVal = parseFloat(this.inputValue);
      let l100km = this.conversionMode === "mpg-to-l100km" ? CONVERSION_FACTOR / inputVal : inputVal;
      if (l100km <= 4) return "Excellent";
      if (l100km <= 6) return "Great";
      if (l100km <= 8) return "Good";
      if (l100km <= 12) return "Average";
      return "Poor";
    },
    efficiencyClass() {
      if (!this.hasValidResult) return "neutral";
      const inputVal = parseFloat(this.inputValue);
      let l100km = this.conversionMode === "mpg-to-l100km" ? CONVERSION_FACTOR / inputVal : inputVal;
      if (l100km <= 4) return "excellent";
      if (l100km <= 6) return "great";
      if (l100km <= 8) return "good";
      if (l100km <= 12) return "average";
      return "poor";
    }
  },
  methods: {
    applyPreset(preset) {
      if (this.conversionMode === "mpg-to-l100km") {
        this.inputValue = preset.mpg;
      } else {
        this.inputValue = preset.l100km;
      }
      this.validateInput();
    },
    debouncedValidateInput() {
      this.isCalculating = true;
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.validateInput();
        this.isCalculating = false;
      }, 300);
    },
    validateInput() {
      const value = parseFloat(this.inputValue);
      if (isNaN(value)) {
        return;
      }
      if (value < this.inputLimits.min) {
        this.inputValue = this.inputLimits.min;
      } else if (value > this.inputLimits.max) {
        this.inputValue = this.inputLimits.max;
      }
    },
    shareResult() {
      if (!this.hasValidResult) return;
      const shareText = `\u{1F697} Fuel Efficiency: ${this.inputValue} ${this.inputUnit} = ${this.displayResult} ${this.outputUnit}`;
      if ((void 0).share) {
        (void 0).share({
          title: "Fuel Efficiency Conversion",
          text: shareText,
          url: (void 0).location.href
        });
      } else {
        (void 0).clipboard.writeText(shareText).then(() => {
          alert("Result copied to clipboard!");
        });
      }
    },
    saveToHistory() {
      if (!this.hasValidResult) return;
      const historyItem = {
        input: this.inputValue,
        inputUnit: this.inputUnit,
        result: this.displayResult,
        outputUnit: this.outputUnit,
        mode: this.conversionMode,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
      };
      this.calculationHistory = this.calculationHistory.filter(
        (item) => !(item.input === historyItem.input && item.mode === historyItem.mode)
      );
      this.calculationHistory.unshift(historyItem);
      this.calculationHistory = this.calculationHistory.slice(0, 10);
      try {
        localStorage.setItem("fuelConverterHistory", JSON.stringify(this.calculationHistory));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
    },
    loadFromHistory(item) {
      this.conversionMode = item.mode;
      this.inputValue = item.input;
    },
    clearInput() {
      this.inputValue = "";
    },
    loadHistory() {
      try {
        const saved = localStorage.getItem("fuelConverterHistory");
        if (saved) {
          this.calculationHistory = JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Could not load from localStorage:", e);
      }
    }
  },
  mounted() {
    this.loadHistory();
  },
  beforeUnmount() {
    clearTimeout(this.debounceTimer);
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "converter-container" }, _attrs))} data-v-70782129><div class="converter-card" data-v-70782129><h2 class="converter-title" data-v-70782129>Fuel Efficiency Converter</h2><p class="converter-description" data-v-70782129>Convert between MPG and L/100km with smart insights</p><div class="mode-toggle" data-v-70782129><button class="${ssrRenderClass([{ active: $data.conversionMode === "mpg-to-l100km" }, "toggle-btn"])}" data-v-70782129> MPG \u2192 L/100km </button><button class="${ssrRenderClass([{ active: $data.conversionMode === "l100km-to-mpg" }, "toggle-btn"])}" data-v-70782129> L/100km \u2192 MPG </button></div><div class="presets-container" data-v-70782129><p class="presets-label" data-v-70782129>Quick Select:</p><div class="preset-buttons" data-v-70782129><!--[-->`);
  ssrRenderList($options.vehiclePresets, (preset) => {
    _push(`<button class="preset-btn"${ssrRenderAttr("title", preset.description)} data-v-70782129>${ssrInterpolate(preset.icon)} ${ssrInterpolate(preset.name)}</button>`);
  });
  _push(`<!--]--></div></div><div class="input-container" data-v-70782129><label${ssrRenderAttr("for", $options.inputId)} class="input-label" data-v-70782129>${ssrInterpolate($data.conversionMode === "mpg-to-l100km" ? "Miles Per Gallon" : "Liters per 100 kilometers")}</label><div class="input-field" data-v-70782129><input${ssrRenderAttr("id", $options.inputId)} type="number"${ssrRenderAttr("value", $data.inputValue)}${ssrRenderAttr("min", $options.inputLimits.min)}${ssrRenderAttr("max", $options.inputLimits.max)}${ssrRenderAttr("step", $options.inputStep)}${ssrRenderAttr("placeholder", $options.inputPlaceholder)} class="${ssrRenderClass([{ "warning": $options.showWarning, "error": $options.showError }, "efficiency-input"])}"${ssrRenderAttr("aria-describedby", $options.inputHelpId)} data-v-70782129><span class="input-unit" data-v-70782129>${ssrInterpolate($options.inputUnit)}</span></div>`);
  if ($options.showWarning || $options.showError) {
    _push(`<div class="input-feedback" data-v-70782129><span class="feedback-icon" data-v-70782129>${ssrInterpolate($options.showError ? "\u26A0\uFE0F" : "\u{1F4A1}")}</span><span class="feedback-text" data-v-70782129>${ssrInterpolate($options.feedbackMessage)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<p${ssrRenderAttr("id", $options.inputHelpId)} class="input-help" data-v-70782129>${ssrInterpolate($options.inputHelpText)}</p></div><div class="divider" data-v-70782129></div><div class="result-container" data-v-70782129><div class="${ssrRenderClass([$options.efficiencyClass, "efficiency-badge"])}" role="status"${ssrRenderAttr("aria-label", `Efficiency rating: ${$options.efficiencyText}`)} data-v-70782129>${ssrInterpolate($options.efficiencyText)}</div><div class="${ssrRenderClass([{ "calculating": $data.isCalculating }, "result-value"])}" data-v-70782129><span class="value"${ssrRenderAttr("aria-label", `Result: ${$options.displayResult}`)} data-v-70782129>${ssrInterpolate($options.displayResult)}</span><span class="unit" data-v-70782129>${ssrInterpolate($options.outputUnit)}</span></div>`);
  if ($options.showAdditionalConversions) {
    _push(`<div class="additional-conversions" data-v-70782129><div class="conversion-item" data-v-70782129><span class="conversion-label" data-v-70782129>km/L:</span><span class="conversion-value" data-v-70782129>${ssrInterpolate($options.kmPerLiter)}</span></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.showComparison) {
    _push(`<div class="comparison-section" data-v-70782129><h4 class="comparison-title" data-v-70782129>Vehicle Comparison</h4><div class="comparison-item" data-v-70782129><span class="comparison-icon" data-v-70782129>\u{1F697}</span><span class="comparison-text" data-v-70782129>${ssrInterpolate($options.comparisonText)}</span></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="info-section" data-v-70782129><p class="info-text" data-v-70782129><span class="info-icon" data-v-70782129>\u2139\uFE0F</span> ${ssrInterpolate($options.infoText)}</p></div></div><div class="action-buttons" data-v-70782129><button class="action-btn share-btn"${ssrIncludeBooleanAttr(!$options.hasValidResult) ? " disabled" : ""} data-v-70782129> \u{1F4E4} Share </button><button class="action-btn save-btn"${ssrIncludeBooleanAttr(!$options.hasValidResult) ? " disabled" : ""} data-v-70782129> \u{1F4BE} Save </button><button class="action-btn clear-btn" data-v-70782129> \u{1F5D1}\uFE0F Clear </button></div>`);
  if ($data.calculationHistory.length > 0) {
    _push(`<div class="history-section" data-v-70782129><h4 class="history-title" data-v-70782129>Recent Calculations</h4><div class="history-list" data-v-70782129><!--[-->`);
    ssrRenderList($data.calculationHistory.slice(0, 3), (item, index) => {
      _push(`<div class="history-item" data-v-70782129><span class="history-input" data-v-70782129>${ssrInterpolate(item.input)} ${ssrInterpolate(item.inputUnit)}</span><span class="history-arrow" data-v-70782129>\u2192</span><span class="history-result" data-v-70782129>${ssrInterpolate(item.result)} ${ssrInterpolate(item.outputUnit)}</span></div>`);
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/MPG.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const MPG = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-70782129"]]);

export { MPG as default };
//# sourceMappingURL=MPG-BPhrwalX.mjs.map
