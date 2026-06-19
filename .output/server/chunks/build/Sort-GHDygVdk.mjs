import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
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
  name: "BubbleSortPage",
  data() {
    return {
      array: [],
      arraySize: 20,
      speed: 350,
      isSorting: false,
      comparisons: 0,
      swaps: 0,
      comparingIndices: [],
      sortedIndices: [],
      status: "Ready",
      sortDelay: 200,
      audioContext: null,
      soundEnabled: true,
      sortType: "bubble",
      colors: [
        "#FF0000",
        // Red
        "#FF7F00",
        // Orange
        "#FFFF00",
        // Yellow
        "#00FF00",
        // Green
        "#0000FF",
        // Blue
        "#4B0082",
        // Indigo
        "#9400D3"
        // Violet
      ],
      stopRequested: false
    };
  },
  computed: {
    statusClass() {
      if (this.status === "Sorted") return "status-success";
      if (this.status === "Sorting...") return "status-sorting";
      return "status-ready";
    },
    algorithmName() {
      const names = {
        bubble: "Bubble Sort",
        selection: "Selection Sort",
        insertion: "Insertion Sort",
        quick: "Quick Sort",
        merge: "Merge Sort",
        heap: "Heap Sort",
        shell: "Shell Sort",
        cocktail: "Cocktail Shaker Sort",
        gnome: "Gnome Sort",
        comb: "Comb Sort"
      };
      return names[this.sortType];
    },
    algorithmSpeed() {
      const speeds = {
        bubble: "\u2B50\u2606\u2606\u2606\u2606 Slow (O(n\xB2))",
        selection: "\u2B50\u2606\u2606\u2606\u2606 Slow (O(n\xB2))",
        insertion: "\u2B50\u2606\u2606\u2606\u2606 Slow (O(n\xB2))",
        quick: "\u2B50\u2B50\u2B50\u2B50\u2606 Very Fast (O(n log n))",
        merge: "\u2B50\u2B50\u2B50\u2B50\u2606 Very Fast (O(n log n))",
        heap: "\u2B50\u2B50\u2B50\u2B50\u2606 Very Fast (O(n log n))",
        shell: "\u2B50\u2B50\u2B50\u2606\u2606 Fast (O(n log n))",
        cocktail: "\u2B50\u2606\u2606\u2606\u2606 Slow (O(n\xB2))",
        gnome: "\u2B50\u2606\u2606\u2606\u2606 Very Slow (O(n\xB2))",
        comb: "\u2B50\u2B50\u2B50\u2606\u2606 Fast (O(n log n))"
      };
      return speeds[this.sortType];
    }
  },
  mounted() {
    this.initializeArray();
    this.initializeAudio();
  },
  methods: {
    initializeAudio() {
      if (!this.audioContext) {
        this.audioContext = new ((void 0).AudioContext || (void 0).webkitAudioContext)();
      }
    },
    playCompareSound() {
      this.playChime(700, 0.1, "sine");
    },
    playSwapSound() {
      this.playChime(500, 0.12, "sine");
    },
    playSortCompleteSound() {
      const frequencies = [523.25, 659.25, 783.99, 1046.5];
      this.audioContext.currentTime;
      frequencies.forEach((freq, index) => {
        setTimeout(
          () => {
            this.playChime(freq, 0.4, "sine");
          },
          index * 100
        );
      });
    },
    playChime(frequency, duration, type = "sine") {
      if (!this.soundEnabled || !this.audioContext) return;
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.frequency.value = frequency;
      osc.type = type;
      filter.type = "lowpass";
      filter.frequency.value = 2e3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.05, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.start(now);
      osc.stop(now + duration);
    },
    initializeArray() {
      this.array = [];
      const colorIndices = [];
      for (let i = 0; i < this.arraySize; i++) {
        colorIndices.push(i);
      }
      for (let i = colorIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [colorIndices[i], colorIndices[j]] = [colorIndices[j], colorIndices[i]];
      }
      for (let i = 0; i < this.arraySize; i++) {
        const value = Math.floor(Math.random() * 100) + 1;
        const colorIndex = colorIndices[i] % this.colors.length;
        const color = this.colors[colorIndex];
        this.array.push({ value, color, id: Math.random() });
      }
      this.resetStats();
    },
    resetSort() {
      this.isSorting = false;
      this.initializeArray();
      this.comparingIndices = [];
      this.sortedIndices = [];
      this.status = "Ready";
    },
    resetStats() {
      this.comparisons = 0;
      this.swaps = 0;
    },
    updateSpeed() {
      this.sortDelay = 510 - this.speed;
    },
    getBarStyle(item, index) {
      const maxValue = Math.max(...this.array.map((a) => a.value));
      const heightPercent = item.value / maxValue * 100;
      return {
        height: `${heightPercent}%`,
        backgroundColor: item.color
      };
    },
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    async startSort() {
      if (this.isSorting) return;
      this.isSorting = true;
      this.stopRequested = false;
      this.status = "Sorting...";
      this.resetStats();
      this.sortedIndices = [];
      switch (this.sortType) {
        case "bubble":
          await this.bubbleSort();
          break;
        case "selection":
          await this.selectionSort();
          break;
        case "insertion":
          await this.insertionSort();
          break;
        case "quick":
          await this.quickSort();
          break;
        case "merge":
          await this.mergeSort();
          break;
        case "heap":
          await this.heapSort();
          break;
        case "shell":
          await this.shellSort();
          break;
        case "cocktail":
          await this.cocktailSort();
          break;
        case "gnome":
          await this.gnomeSort();
          break;
        case "comb":
          await this.combSort();
          break;
      }
      this.comparingIndices = [];
      this.isSorting = false;
      if (!this.stopRequested) {
        this.status = "Sorted";
        this.playSortCompleteSound();
      } else {
        this.status = "Stopped";
      }
    },
    stopSort() {
      this.stopRequested = true;
    },
    async bubbleSort() {
      const n = this.array.length;
      for (let i = 0; i < n; i++) {
        if (this.stopRequested) break;
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
          if (this.stopRequested) break;
          this.comparingIndices = [j, j + 1];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[j].value > this.array[j + 1].value) {
            const temp = this.array[j];
            this.array[j] = this.array[j + 1];
            this.array[j + 1] = temp;
            this.swaps++;
            swapped = true;
            this.playSwapSound();
          }
          this.array = [...this.array];
        }
        this.sortedIndices.push(n - i - 1);
        if (!swapped) break;
      }
      if (!this.stopRequested) {
        for (let i = 0; i < n; i++) {
          if (!this.sortedIndices.includes(i)) {
            this.sortedIndices.push(i);
          }
        }
      }
    },
    async selectionSort() {
      const n = this.array.length;
      for (let i = 0; i < n - 1; i++) {
        if (this.stopRequested) break;
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
          if (this.stopRequested) break;
          this.comparingIndices = [minIndex, j];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[j].value < this.array[minIndex].value) {
            minIndex = j;
          }
        }
        if (minIndex !== i) {
          const temp = this.array[i];
          this.array[i] = this.array[minIndex];
          this.array[minIndex] = temp;
          this.swaps++;
          this.playSwapSound();
        }
        this.array = [...this.array];
        this.sortedIndices.push(i);
      }
      if (!this.stopRequested) {
        this.sortedIndices.push(n - 1);
      }
    },
    async insertionSort() {
      const n = this.array.length;
      for (let i = 1; i < n; i++) {
        if (this.stopRequested) break;
        let key = this.array[i];
        let j = i - 1;
        while (j >= 0) {
          if (this.stopRequested) break;
          this.comparingIndices = [j, i];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[j].value > key.value) {
            this.array[j + 1] = this.array[j];
            this.swaps++;
            this.playSwapSound();
            j--;
          } else {
            break;
          }
          this.array = [...this.array];
        }
        this.array[j + 1] = key;
        this.array = [...this.array];
        this.sortedIndices.push(i);
      }
    },
    async quickSort() {
      await this.quickSortHelper(0, this.array.length - 1);
      for (let i = 0; i < this.array.length; i++) {
        if (!this.sortedIndices.includes(i)) {
          this.sortedIndices.push(i);
        }
      }
    },
    async quickSortHelper(low, high) {
      if (this.stopRequested) return;
      if (low < high) {
        const pi = await this.partition(low, high);
        await this.quickSortHelper(low, pi - 1);
        await this.quickSortHelper(pi + 1, high);
      } else if (low === high) {
        this.sortedIndices.push(low);
      }
    },
    async partition(low, high) {
      const pivot = this.array[high].value;
      let i = low - 1;
      for (let j = low; j < high; j++) {
        this.comparingIndices = [j, high];
        this.comparisons++;
        this.playCompareSound();
        await this.sleep(this.sortDelay);
        if (this.array[j].value < pivot) {
          i++;
          const temp2 = this.array[i];
          this.array[i] = this.array[j];
          this.array[j] = temp2;
          this.swaps++;
          this.playSwapSound();
          this.array = [...this.array];
        }
      }
      const temp = this.array[i + 1];
      this.array[i + 1] = this.array[high];
      this.array[high] = temp;
      this.swaps++;
      this.playSwapSound();
      this.array = [...this.array];
      return i + 1;
    },
    async mergeSort() {
      await this.mergeSortHelper(0, this.array.length - 1);
      for (let i = 0; i < this.array.length; i++) {
        if (!this.sortedIndices.includes(i)) {
          this.sortedIndices.push(i);
        }
      }
    },
    async mergeSortHelper(left, right) {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);
        await this.mergeSortHelper(left, mid);
        await this.mergeSortHelper(mid + 1, right);
        await this.merge(left, mid, right);
      }
    },
    async merge(left, mid, right) {
      const leftArr = this.array.slice(left, mid + 1);
      const rightArr = this.array.slice(mid + 1, right + 1);
      let i = 0, j = 0, k = left;
      while (i < leftArr.length && j < rightArr.length) {
        this.comparingIndices = [left + i, mid + 1 + j];
        this.comparisons++;
        this.playCompareSound();
        await this.sleep(this.sortDelay);
        if (leftArr[i].value <= rightArr[j].value) {
          this.array[k] = leftArr[i];
          i++;
        } else {
          this.array[k] = rightArr[j];
          j++;
        }
        this.swaps++;
        this.playSwapSound();
        this.array = [...this.array];
        k++;
      }
      while (i < leftArr.length) {
        this.array[k] = leftArr[i];
        this.swaps++;
        this.playSwapSound();
        i++;
        k++;
        this.array = [...this.array];
      }
      while (j < rightArr.length) {
        this.array[k] = rightArr[j];
        this.swaps++;
        this.playSwapSound();
        j++;
        k++;
        this.array = [...this.array];
      }
    },
    async heapSort() {
      const n = this.array.length;
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await this.heapify(n, i);
      }
      for (let i = n - 1; i > 0; i--) {
        this.comparingIndices = [0, i];
        const temp = this.array[0];
        this.array[0] = this.array[i];
        this.array[i] = temp;
        this.swaps++;
        this.playSwapSound();
        this.array = [...this.array];
        this.sortedIndices.push(i);
        await this.heapify(i, 0);
      }
      this.sortedIndices.push(0);
    },
    async heapify(n, i) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n) {
        this.comparingIndices = [largest, left];
        this.comparisons++;
        this.playCompareSound();
        await this.sleep(this.sortDelay);
        if (this.array[left].value > this.array[largest].value) {
          largest = left;
        }
      }
      if (right < n) {
        this.comparingIndices = [largest, right];
        this.comparisons++;
        this.playCompareSound();
        await this.sleep(this.sortDelay);
        if (this.array[right].value > this.array[largest].value) {
          largest = right;
        }
      }
      if (largest !== i) {
        const temp = this.array[i];
        this.array[i] = this.array[largest];
        this.array[largest] = temp;
        this.swaps++;
        this.playSwapSound();
        this.array = [...this.array];
        await this.heapify(n, largest);
      }
    },
    async shellSort() {
      const n = this.array.length;
      let gap = Math.floor(n / 2);
      while (gap > 0) {
        for (let i = gap; i < n; i++) {
          const temp = this.array[i];
          let j = i;
          while (j >= gap) {
            this.comparingIndices = [j - gap, j];
            this.comparisons++;
            this.playCompareSound();
            await this.sleep(this.sortDelay);
            if (this.array[j - gap].value > temp.value) {
              this.array[j] = this.array[j - gap];
              this.swaps++;
              this.playSwapSound();
              j -= gap;
            } else {
              break;
            }
            this.array = [...this.array];
          }
          this.array[j] = temp;
          this.array = [...this.array];
        }
        gap = Math.floor(gap / 2);
      }
      for (let i = 0; i < n; i++) {
        this.sortedIndices.push(i);
      }
    },
    async cocktailSort() {
      let left = 0;
      let right = this.array.length - 1;
      let swapped = true;
      while (swapped && left < right) {
        if (this.stopRequested) break;
        swapped = false;
        for (let i = left; i < right; i++) {
          if (this.stopRequested) break;
          this.comparingIndices = [i, i + 1];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[i].value > this.array[i + 1].value) {
            const temp = this.array[i];
            this.array[i] = this.array[i + 1];
            this.array[i + 1] = temp;
            this.swaps++;
            this.playSwapSound();
            swapped = true;
          }
          this.array = [...this.array];
        }
        right--;
        if (!swapped) break;
        for (let i = right; i > left; i--) {
          if (this.stopRequested) break;
          this.comparingIndices = [i - 1, i];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[i - 1].value > this.array[i].value) {
            const temp = this.array[i - 1];
            this.array[i - 1] = this.array[i];
            this.array[i] = temp;
            this.swaps++;
            this.playSwapSound();
            swapped = true;
          }
          this.array = [...this.array];
        }
        left++;
      }
      if (!this.stopRequested) {
        for (let i = 0; i < this.array.length; i++) {
          if (!this.sortedIndices.includes(i)) {
            this.sortedIndices.push(i);
          }
        }
      }
    },
    async gnomeSort() {
      let pos = 0;
      const n = this.array.length;
      while (pos < n) {
        if (pos === 0 || this.array[pos].value >= this.array[pos - 1].value) {
          pos++;
        } else {
          this.comparingIndices = [pos - 1, pos];
          this.comparisons++;
          this.playCompareSound();
          const temp = this.array[pos];
          this.array[pos] = this.array[pos - 1];
          this.array[pos - 1] = temp;
          this.swaps++;
          this.playSwapSound();
          this.array = [...this.array];
          await this.sleep(this.sortDelay);
          pos--;
        }
      }
      for (let i = 0; i < n; i++) {
        this.sortedIndices.push(i);
      }
    },
    async combSort() {
      let gap = this.array.length;
      let swapped = true;
      while (gap > 1 || swapped) {
        gap = Math.floor(gap / 1.3);
        if (gap < 1) gap = 1;
        swapped = false;
        for (let i = 0; i < this.array.length - gap; i++) {
          this.comparingIndices = [i, i + gap];
          this.comparisons++;
          this.playCompareSound();
          await this.sleep(this.sortDelay);
          if (this.array[i].value > this.array[i + gap].value) {
            const temp = this.array[i];
            this.array[i] = this.array[i + gap];
            this.array[i + gap] = temp;
            this.swaps++;
            this.playSwapSound();
            swapped = true;
          }
          this.array = [...this.array];
        }
      }
      for (let i = 0; i < this.array.length; i++) {
        this.sortedIndices.push(i);
      }
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "bubble-sort-container" }, _attrs))} data-v-1f70c567><div class="header" data-v-1f70c567><h1 class="title" data-v-1f70c567>${ssrInterpolate($options.algorithmName)} Visualizer</h1><p class="subtitle" data-v-1f70c567>Watch the algorithm in motion</p></div><div class="controls-panel" data-v-1f70c567><div class="control-group" data-v-1f70c567><label for="array-size" class="label" data-v-1f70c567>Array Size</label><input id="array-size"${ssrRenderAttr("value", $data.arraySize)} type="range" min="5" max="100" class="slider" data-v-1f70c567><span class="value-display" data-v-1f70c567>${ssrInterpolate($data.arraySize)}</span></div><div class="control-group" data-v-1f70c567><label for="speed" class="label" data-v-1f70c567>Speed</label><input id="speed"${ssrRenderAttr("value", $data.speed)} type="range" min="2" max="500" class="slider" data-v-1f70c567><span class="value-display" data-v-1f70c567>${ssrInterpolate(510 - $data.speed)}ms</span></div><div class="control-group" data-v-1f70c567><label for="sort-type" class="label" data-v-1f70c567>Sort Algorithm</label><select id="sort-type" class="select"${ssrIncludeBooleanAttr($data.isSorting) ? " disabled" : ""} data-v-1f70c567><option value="bubble" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "bubble") : ssrLooseEqual($data.sortType, "bubble")) ? " selected" : ""}>Bubble Sort - \u2B50\u2606\u2606\u2606\u2606 Slow</option><option value="selection" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "selection") : ssrLooseEqual($data.sortType, "selection")) ? " selected" : ""}>Selection Sort - \u2B50\u2606\u2606\u2606\u2606 Slow</option><option value="insertion" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "insertion") : ssrLooseEqual($data.sortType, "insertion")) ? " selected" : ""}>Insertion Sort - \u2B50\u2606\u2606\u2606\u2606 Slow</option><option value="quick" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "quick") : ssrLooseEqual($data.sortType, "quick")) ? " selected" : ""}>Quick Sort - \u2B50\u2B50\u2B50\u2B50\u2606 Very Fast</option><option value="merge" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "merge") : ssrLooseEqual($data.sortType, "merge")) ? " selected" : ""}>Merge Sort - \u2B50\u2B50\u2B50\u2B50\u2606 Very Fast</option><option value="heap" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "heap") : ssrLooseEqual($data.sortType, "heap")) ? " selected" : ""}>Heap Sort - \u2B50\u2B50\u2B50\u2B50\u2606 Very Fast</option><option value="shell" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "shell") : ssrLooseEqual($data.sortType, "shell")) ? " selected" : ""}>Shell Sort - \u2B50\u2B50\u2B50\u2606\u2606 Fast</option><option value="cocktail" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "cocktail") : ssrLooseEqual($data.sortType, "cocktail")) ? " selected" : ""}>Cocktail Shaker - \u2B50\u2606\u2606\u2606\u2606 Slow</option><option value="gnome" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "gnome") : ssrLooseEqual($data.sortType, "gnome")) ? " selected" : ""}>Gnome Sort - \u2B50\u2606\u2606\u2606\u2606 Very Slow</option><option value="comb" data-v-1f70c567${ssrIncludeBooleanAttr(Array.isArray($data.sortType) ? ssrLooseContain($data.sortType, "comb") : ssrLooseEqual($data.sortType, "comb")) ? " selected" : ""}>Comb Sort - \u2B50\u2B50\u2B50\u2606\u2606 Fast</option></select></div><div class="button-group" data-v-1f70c567>`);
  if (!$data.isSorting) {
    _push(`<button class="${ssrRenderClass(["btn", "btn-start"])}" data-v-1f70c567> Start Sort </button>`);
  } else {
    _push(`<button class="${ssrRenderClass(["btn", "btn-stop"])}" data-v-1f70c567> Stop </button>`);
  }
  _push(`<button class="${ssrRenderClass(["btn", "btn-reset"])}"${ssrIncludeBooleanAttr($data.isSorting) ? " disabled" : ""} data-v-1f70c567> Reset </button><button class="${ssrRenderClass(["btn", "btn-sound", { "btn-sound-off": !$data.soundEnabled }])}"${ssrIncludeBooleanAttr($data.isSorting) ? " disabled" : ""} title="Toggle sound effects" data-v-1f70c567>${ssrInterpolate($data.soundEnabled ? "\u{1F50A} Sound" : "\u{1F507} Mute")}</button></div></div><div class="visualization-wrapper" data-v-1f70c567><div class="bars-container" data-v-1f70c567><!--[-->`);
  ssrRenderList($data.array, (item, index) => {
    _push(`<div class="bar-wrapper" data-v-1f70c567><div style="${ssrRenderStyle($options.getBarStyle(item, index))}" class="${ssrRenderClass([{
      "bar-comparing": $data.comparingIndices.includes(index),
      "bar-sorted": $data.sortedIndices.includes(index)
    }, "bar"])}" data-v-1f70c567><span class="bar-label" data-v-1f70c567>${ssrInterpolate(item.value)}</span></div></div>`);
  });
  _push(`<!--]--></div></div><div class="stats" data-v-1f70c567><div class="stat-item" data-v-1f70c567><span class="stat-label" data-v-1f70c567>Comparisons:</span><span class="stat-value" data-v-1f70c567>${ssrInterpolate($data.comparisons)}</span></div><div class="stat-item" data-v-1f70c567><span class="stat-label" data-v-1f70c567>Swaps:</span><span class="stat-value" data-v-1f70c567>${ssrInterpolate($data.swaps)}</span></div><div class="stat-item" data-v-1f70c567><span class="stat-label" data-v-1f70c567>Status:</span><span class="${ssrRenderClass([$options.statusClass, "stat-value"])}" data-v-1f70c567>${ssrInterpolate($data.status)}</span></div></div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/Sort.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Sort = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-1f70c567"]]);

export { Sort as default };
//# sourceMappingURL=Sort-GHDygVdk.mjs.map
