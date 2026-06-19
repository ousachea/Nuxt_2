import { ref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "Phone",
  __ssrInlineRender: true,
  setup(__props) {
    const phoneNumber = ref("");
    const matchedPrefix = ref(null);
    const invalidInput = ref(false);
    const carrier = ref("Unknown Carrier");
    const validPrefixes = /* @__PURE__ */ new Set();
    const carriers = {
      Cellcard: {
        color: "#FF9800",
        prefixes: [
          "11",
          "12",
          "17",
          "61",
          "76",
          "77",
          "78",
          "79",
          "85",
          "89",
          "92",
          "95",
          "99"
        ]
      },
      Smart: {
        color: "#00A859",
        prefixes: [
          "10",
          "15",
          "16",
          "69",
          "70",
          "81",
          "86",
          "87",
          "93",
          "96",
          "98"
        ]
      },
      Metfone: {
        color: "#E60012",
        prefixes: ["88", "97"]
      }
    };
    Object.values(carriers).forEach((carrierData) => {
      carrierData.prefixes.forEach((prefix) => validPrefixes.add(prefix));
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container" }, _attrs))} data-v-b981e690><div class="card" data-v-b981e690><h1 class="title" data-v-b981e690>Cambodia Carrier Checker</h1><div class="input-section" data-v-b981e690><input${ssrRenderAttr("value", phoneNumber.value)} placeholder="Enter prefix" class="${ssrRenderClass([{ error: invalidInput.value }, "input"])}" maxlength="3" type="text" inputmode="numeric" data-v-b981e690>`);
      if (phoneNumber.value) {
        _push(`<button class="clear-btn" data-v-b981e690> Clear </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (carrier.value !== "Unknown Carrier") {
        _push(`<div class="result" data-v-b981e690><p class="result-text" data-v-b981e690>${ssrInterpolate(carrier.value)}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="carriers" data-v-b981e690><!--[-->`);
      ssrRenderList(carriers, (carrierData, name) => {
        _push(`<div class="carrier" data-v-b981e690><h3 class="carrier-name" data-v-b981e690>${ssrInterpolate(name)}</h3><div class="prefixes" data-v-b981e690><!--[-->`);
        ssrRenderList(carrierData.prefixes, (prefix) => {
          _push(`<button class="${ssrRenderClass([{ active: matchedPrefix.value === prefix }, "prefix-btn"])}" data-v-b981e690> 0${ssrInterpolate(prefix)}</button>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Phone.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Phone = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b981e690"]]);

export { Phone as default };
//# sourceMappingURL=Phone-CEfyW8GV.mjs.map
