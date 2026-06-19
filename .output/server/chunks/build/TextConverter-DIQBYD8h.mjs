import { ref, watch, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = (() => {
  console.error(intervalError);
});
const _sfc_main = {
  __name: "TextConverter",
  __ssrInlineRender: true,
  setup(__props) {
    const inputText = ref("");
    const outputText = ref("");
    const showCopyAlert = ref(false);
    const matrixEffectActive = ref(false);
    ref(null);
    const matrixRain = ref(null);
    let matrixInterval = null;
    const setupMatrixRain = () => {
      if (!matrixRain.value) return;
      const canvas = (void 0).createElement("canvas");
      matrixRain.value.innerHTML = "";
      matrixRain.value.appendChild(canvas);
      canvas.getContext("2d");
      canvas.width = matrixRain.value.offsetWidth;
      canvas.height = matrixRain.value.offsetHeight;
      const columns = Math.floor(canvas.width / 20);
      for (let i = 0; i < columns; i++) {
        Math.floor(Math.random() * canvas.height);
      }
      matrixInterval = setInterval();
    };
    watch(outputText, (newValue) => {
      if (!newValue && matrixRain.value) {
        setupMatrixRain();
      } else if (newValue) {
        clearInterval(matrixInterval);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "terminal-container" }, _attrs))} data-v-6ed4beed><h1 class="terminal-header" data-v-6ed4beed>[ TEXT CASE CONVERTER ]</h1><div class="content-wrapper" data-v-6ed4beed><div class="input-container" data-v-6ed4beed><div class="window-header" data-v-6ed4beed><div class="window-control close" data-v-6ed4beed></div><div class="window-control minimize" data-v-6ed4beed></div><div class="window-control maximize" data-v-6ed4beed></div><div class="window-title" data-v-6ed4beed>INPUT.TXT</div></div><div class="textarea-wrapper" data-v-6ed4beed><textarea class="terminal-textarea" placeholder="Paste your text here..." data-v-6ed4beed>${ssrInterpolate(inputText.value)}</textarea></div><div class="status-bar" data-v-6ed4beed><div class="char-count" data-v-6ed4beed>CHARS: ${ssrInterpolate(inputText.value.length)}</div><button class="terminal-button" data-v-6ed4beed>CLEAR</button></div></div><div class="convert-section" data-v-6ed4beed><div class="section-header" data-v-6ed4beed><span data-v-6ed4beed>CONVERT TO:</span></div><div class="button-grid" data-v-6ed4beed><button class="option-button" data-v-6ed4beed>&gt; Sentence case</button><button class="option-button" data-v-6ed4beed>&gt; Title Case</button><button class="option-button" data-v-6ed4beed>&gt; Capitalized Case</button><button class="option-button" data-v-6ed4beed>&gt; lower case</button></div><div class="button-grid" data-v-6ed4beed><button class="option-button" data-v-6ed4beed>&gt; UPPER CASE</button><button class="option-button" data-v-6ed4beed>altErNaTiNg caSe</button></div><div class="inverse-button-container" data-v-6ed4beed><button class="option-button inverse-button" data-v-6ed4beed>&gt; InVeRsE CaSe</button></div></div><div class="output-header" data-v-6ed4beed><span data-v-6ed4beed>OUTPUT</span><button class="terminal-button" data-v-6ed4beed>COPY</button></div><div class="output-container" data-v-6ed4beed>`);
      if (showCopyAlert.value) {
        _push(`<div class="copy-alert" data-v-6ed4beed>Text copied to clipboard!</div>`);
      } else {
        _push(`<!---->`);
      }
      if (outputText.value) {
        _push(`<pre class="${ssrRenderClass([{ "matrix-effect": matrixEffectActive.value }, "output-text"])}" data-v-6ed4beed>${ssrInterpolate(outputText.value)}</pre>`);
      } else {
        _push(`<div class="matrix-rain" data-v-6ed4beed></div>`);
      }
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/TextConverter.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const TextConverter = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6ed4beed"]]);

export { TextConverter as default };
//# sourceMappingURL=TextConverter-DIQBYD8h.mjs.map
