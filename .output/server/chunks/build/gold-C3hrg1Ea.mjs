import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
      currentLang: "en",
      goldPrice: null,
      lastUpdated: "",
      loading: false,
      error: null,
      showSuccessMessage: false,
      isOnline: true,
      priceInputMethod: "troyOz",
      customPrice: null,
      customApiUrl: "",
      priceSource: "api",
      defaultApiKey: "",
      apiCopied: false,
      // Converter state
      activeConverter: "gram",
      converterInput: 1,
      converterUnits: ["li", "hun", "chi", "gram", "damlung", "troyOz"],
      // Purchases
      showAddForm: false,
      purchases: [],
      editingIndex: null,
      editForm: {},
      newPurchase: {
        weight: "",
        unit: "chi",
        metal: "gold",
        price: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      },
      // Conversion constants
      TROY_OZ_TO_GRAM: 31.1035,
      DAMLUNG_TO_GRAM: 37.5,
      CHI_TO_GRAM: 3.75,
      HUN_TO_GRAM: 0.375,
      LI_TO_GRAM: 0.0375,
      // Translations
      translations: {
        en: {
          title: "Gold & Silver Tracker",
          currentPrice: "Current Prices",
          refreshNow: "Refresh Now",
          setPrice: "Set Price",
          loading: "Loading...",
          pricesUpdated: "Prices updated!",
          perTroyOz: "per Troy Oz",
          lastUpdated: "Last updated",
          priceByUnit: "Price by Unit",
          unitConverter: "Unit Converter",
          from: "From",
          myPurchases: "My Purchases",
          addPurchase: "+ Add Purchase",
          cancel: "Cancel",
          weight: "Weight",
          unit: "Unit",
          metal: "Metal",
          pricePaid: "Price Paid",
          date: "Date",
          accountNumber: "Account Number",
          referenceNumber: "Reference Number",
          save: "Save",
          paid: "Paid",
          current: "Current",
          gainLoss: "Gain/Loss",
          portfolioSummary: "Portfolio Summary",
          totalInvested: "Total Invested",
          currentValue: "Current Value",
          totalGainLoss: "Total Gain/Loss",
          exportCSV: "Export to CSV",
          enterWeight: "Enter weight",
          enterPrice: "Enter price",
          enterAccountNumber: "Optional",
          enterReferenceNumber: "Optional",
          gram: "Gram",
          li: "Li",
          hun: "Hun",
          chi: "Chi",
          damlung: "Damlung",
          troyOunce: "Troy Oz",
          troyOz: "Troy Oz",
          setPriceBy: "Set Price By",
          customPrice: "Custom Price",
          enterCustomPrice: "Enter price",
          customAPIUrl: "Custom API Key (Optional)",
          enterAPIUrl: "Paste your API key here (optional)",
          saveAPI: "Save API",
          paste: "Paste",
          pasteFromClipboard: "Paste from clipboard",
          clearAPI: "Clear API key",
          getAPIKey: "\u{1F511} Get Your Own Free Key",
          usingCustomAPI: "Using custom Gold API key",
          usingFreeAPI: "Using free API (no key needed)",
          freeAPIAvailable: "Want More Requests? Get Free API Key",
          copy: "Copy",
          copied: "Copied!",
          apiInstructions: "Copy this key and paste above, then click Save API. This gives you 100 free requests.",
          apiInstructionsNew: "Currently using free API (works without key). For 100+ requests/month, get your own free API key from goldapi.io above.",
          offlineWarning: "\u26A0\uFE0F You are offline. Data may be outdated.",
          fetchPriceFirst: "Please fetch prices first",
          gold: "Gold",
          silver: "Silver"
        },
        km: {
          title: "\u178F\u17B6\u1798\u178A\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3\u1798\u17B6\u179F \u1793\u17B7\u1784\u1794\u17D2\u179A\u17B6\u1780\u17CB",
          currentPrice: "\u178F\u1798\u17D2\u179B\u17C3\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
          refreshNow: "\u178F\u1798\u17D2\u179B\u17C3\u17A5\u17A1\u17BC\u179C\u1793\u17C1\u17C7",
          setPrice: "\u1780\u17C6\u178E\u178F\u17CB\u178F\u1798\u17D2\u179B\u17C3",
          loading: "\u1780\u17C6\u1796\u17BB\u1784\u1795\u17D2\u1791\u17BB\u1780...",
          pricesUpdated: "\u1794\u17B6\u1793\u1792\u17D2\u179C\u17BE\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1797\u17B6\u1796\u178F\u1798\u17D2\u179B\u17C3!",
          perTroyOz: "\u1780\u17D2\u1793\u17BB\u1784\u1798\u17BD\u1799\u178F\u17D2\u179A\u1799 \u17A2\u17C4\u1793",
          lastUpdated: "\u1794\u17B6\u1793\u1792\u17D2\u179C\u17BE\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1797\u17B6\u1796\u1785\u17BB\u1784\u1780\u17D2\u179A\u17C4\u1799",
          priceByUnit: "\u178F\u1798\u17D2\u179B\u17C3\u178F\u17B6\u1798\u17AF\u1780\u178F\u17B6",
          unitConverter: "\u1794\u1798\u17D2\u179B\u17C2\u1784\u17AF\u1780\u178F\u17B6",
          from: "\u1796\u17B8",
          myPurchases: "\u1780\u17B6\u179A\u1791\u17B7\u1789\u179A\u1794\u179F\u17CB\u1781\u17D2\u1789\u17BB\u17C6",
          addPurchase: "+ \u1794\u1793\u17D2\u1790\u17C2\u1798\u1780\u17B6\u179A\u1791\u17B7\u1789",
          cancel: "\u1794\u17C4\u17C7\u1794\u1784\u17CB",
          weight: "\u1791\u1798\u17D2\u1784\u1793\u17CB",
          unit: "\u17AF\u1780\u178F\u17B6",
          metal: "\u179B\u17C4\u17A0\u17C8",
          pricePaid: "\u178F\u1798\u17D2\u179B\u17C3\u1794\u17B6\u1793\u1794\u1784\u17CB",
          date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791",
          accountNumber: "\u179B\u17C1\u1781\u1782\u178E\u1793\u17B8",
          referenceNumber: "\u179B\u17C1\u1781\u1799\u17C4\u1784",
          save: "\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780",
          paid: "\u1794\u17B6\u1793\u1794\u1784\u17CB",
          current: "\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
          gainLoss: "\u1794\u17D2\u179A\u17B6\u1780\u17CB\u1785\u17C6\u178E\u17C1\u1789/\u1781\u17B6\u178F",
          portfolioSummary: "\u179F\u1784\u17D2\u1781\u17C1\u1794\u1795\u179B\u179C\u17B7\u1793\u17B7\u1799\u17C4\u1782",
          totalInvested: "\u179F\u179A\u17BB\u1794\u179C\u17B7\u1793\u17B7\u1799\u17C4\u1782",
          currentValue: "\u178F\u1798\u17D2\u179B\u17C3\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793",
          totalGainLoss: "\u179F\u179A\u17BB\u1794\u1785\u17C6\u178E\u17C1\u1789/\u1781\u17B6\u178F",
          exportCSV: "\u1793\u17B6\u17C6\u1785\u17C1\u1789\u1787\u17B6 CSV",
          enterWeight: "\u1794\u1789\u17D2\u1785\u17BC\u179B\u1791\u1798\u17D2\u1784\u1793\u17CB",
          enterPrice: "\u1794\u1789\u17D2\u1785\u17BC\u179B\u178F\u1798\u17D2\u179B\u17C3",
          enterAccountNumber: "\u179F\u17D2\u179A\u17C1\u1785\u1785\u17B7\u178F\u17D2\u178F",
          enterReferenceNumber: "\u179F\u17D2\u179A\u17C1\u1785\u1785\u17B7\u178F\u17D2\u178F",
          gram: "\u1780\u17D2\u179A\u17B6\u1798",
          li: "\u179B\u17B8",
          hun: "\u17A0\u17BB\u1793",
          chi: "\u1787\u17B8",
          damlung: "\u178A\u17C6\u17A1\u17B9\u1784",
          troyOunce: "\u178F\u17D2\u179A\u1799 \u17A2\u17C4\u1793",
          troyOz: "\u178F\u17D2\u179A\u1799 \u17A2\u17C4\u1793",
          setPriceBy: "\u1780\u17C6\u178E\u178F\u17CB\u178F\u1798\u17D2\u179B\u17C3\u178F\u17B6\u1798",
          customPrice: "\u178F\u1798\u17D2\u179B\u17C3\u1795\u17D2\u1791\u17B6\u179B\u17CB\u1781\u17D2\u179B\u17BD\u1793",
          enterCustomPrice: "\u1794\u1789\u17D2\u1785\u17BC\u179B\u178F\u1798\u17D2\u179B\u17C3",
          customAPIUrl: "\u1782\u1793\u17D2\u179B\u17B9\u17C7 API \u1795\u17D2\u1791\u17B6\u179B\u17CB\u1781\u17D2\u179B\u17BD\u1793 (\u179F\u17D2\u179A\u17C1\u1785\u1785\u17B7\u178F\u17D2\u178F)",
          enterAPIUrl: "\u1794\u17B7\u1791\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1782\u1793\u17D2\u179B\u17B9\u17C7 API \u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1793\u17C5\u1791\u17B8\u1793\u17C1\u17C7 (\u179F\u17D2\u179A\u17C1\u1785\u1785\u17B7\u178F\u17D2\u178F)",
          saveAPI: "\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780 API",
          paste: "\u1794\u17B7\u1791\u1797\u17D2\u1787\u17B6\u1794\u17CB",
          pasteFromClipboard: "\u1794\u17B7\u1791\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1796\u17B8\u1783\u17D2\u179B\u17B8\u1794\u1794\u178F",
          clearAPI: "\u179B\u17BB\u1794\u1782\u1793\u17D2\u179B\u17B9\u17C7 API",
          getAPIKey: "\u{1F511} \u1791\u1791\u17BD\u179B\u1794\u17B6\u1793\u1782\u1793\u17D2\u179B\u17B9\u17C7\u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780",
          usingCustomAPI: "\u1780\u17C6\u1796\u17BB\u1784\u1794\u17D2\u179A\u17BE\u1782\u1793\u17D2\u179B\u17B9\u17C7 Gold API \u1795\u17D2\u1791\u17B6\u179B\u17CB\u1781\u17D2\u179B\u17BD\u1793",
          usingFreeAPI: "\u1780\u17C6\u1796\u17BB\u1784\u1794\u17D2\u179A\u17BE API \u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3 (\u1798\u17B7\u1793\u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A\u1782\u1793\u17D2\u179B\u17B9\u17C7)",
          freeAPIAvailable: "\u1785\u1784\u17CB\u1794\u17B6\u1793\u179F\u17C6\u178E\u17BE\u1785\u17D2\u179A\u17BE\u1793\u1791\u17C0\u178F? \u1791\u1791\u17BD\u179B\u1782\u1793\u17D2\u179B\u17B9\u17C7 API \u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3",
          copy: "\u1785\u1798\u17D2\u179B\u1784",
          copied: "\u1794\u17B6\u1793\u1785\u1798\u17D2\u179B\u1784!",
          apiInstructions: "\u1785\u1798\u17D2\u179B\u1784\u1782\u1793\u17D2\u179B\u17B9\u17C7\u1793\u17C1\u17C7 \u1793\u17B7\u1784\u1794\u17B7\u1791\u1797\u17D2\u1787\u17B6\u1794\u17CB\u1781\u17B6\u1784\u179B\u17BE \u1794\u1793\u17D2\u1791\u17B6\u1794\u17CB\u1798\u1780\u1785\u17BB\u1785\u179A\u1780\u17D2\u179F\u17B6\u1791\u17BB\u1780 API\u17D4 \u179C\u17B6\u1795\u17D2\u178F\u179B\u17CB\u17B1\u17D2\u1799\u17A2\u17D2\u1793\u1780\u1793\u17BC\u179C\u179F\u17C6\u178E\u17BE 100 \u178A\u1784\u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3\u17D4",
          apiInstructionsNew: "\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793\u1780\u17C6\u1796\u17BB\u1784\u1794\u17D2\u179A\u17BE API \u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3 (\u178A\u17C6\u178E\u17BE\u179A\u1780\u17B6\u179A\u178A\u17C4\u1799\u1782\u17D2\u1798\u17B6\u1793\u1782\u1793\u17D2\u179B\u17B9\u17C7)\u17D4 \u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u179F\u17C6\u178E\u17BE 100+ \u1780\u17D2\u1793\u17BB\u1784\u1798\u17BD\u1799\u1781\u17C2 \u1791\u1791\u17BD\u179B\u1794\u17B6\u1793\u1782\u1793\u17D2\u179B\u17B9\u17C7 API \u17A5\u178F\u1782\u17B7\u178F\u1790\u17D2\u179B\u17C3\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u1796\u17B8 goldapi.io \u1781\u17B6\u1784\u179B\u17BE\u17D4",
          offlineWarning: "\u26A0\uFE0F \u17A2\u17D2\u1793\u1780\u179F\u17D2\u1790\u17B7\u178F\u1780\u17D2\u179A\u17C5\u1794\u178E\u17D2\u178F\u17B6\u1789\u17D4 \u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u17A2\u17B6\u1785\u1785\u17B6\u179F\u17CB\u17D4",
          fetchPriceFirst: "\u179F\u17BC\u1798\u1791\u17B6\u1789\u1799\u1780\u178F\u1798\u17D2\u179B\u17C3\u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793",
          gold: "\u1798\u17B6\u179F",
          silver: "\u1794\u17D2\u179A\u17B6\u1780\u17CB"
        }
      }
    };
  },
  computed: {
    t() {
      return this.translations[this.currentLang];
    },
    pricePerGram() {
      if (!this.goldPrice) return 0;
      return this.goldPrice / this.TROY_OZ_TO_GRAM;
    },
    pricePerDamlung() {
      return this.pricePerGram * this.DAMLUNG_TO_GRAM;
    },
    pricePerChi() {
      return this.pricePerGram * this.CHI_TO_GRAM;
    },
    pricePerHun() {
      return this.pricePerGram * this.HUN_TO_GRAM;
    },
    pricePerLi() {
      return this.pricePerGram * this.LI_TO_GRAM;
    },
    currentMetalPrice() {
      return this.goldPrice;
    },
    currentPricePerGram() {
      return this.pricePerGram;
    },
    currentPricePerDamlung() {
      return this.pricePerDamlung;
    },
    currentPricePerChi() {
      return this.pricePerChi;
    },
    totalInvested() {
      return this.purchases.reduce((sum, p) => sum + p.price, 0);
    },
    totalCurrentValue() {
      return this.purchases.reduce((sum, p) => sum + this.calculateCurrentValue(p), 0);
    },
    totalGainLoss() {
      return this.totalCurrentValue - this.totalInvested;
    }
  },
  mounted() {
    this.loadFromLocalStorage();
    this.fetchGoldPrice();
    this.setupNetworkListeners();
  },
  beforeDestroy() {
    this.removeNetworkListeners();
  },
  methods: {
    switchPriceMethod(method) {
      this.priceInputMethod = method;
      this.customPrice = null;
      this.goldPrice = null;
      this.saveToLocalStorage();
    },
    async pasteFromClipboard() {
      try {
        const text = await (void 0).clipboard.readText();
        if (text && text.trim()) {
          this.customApiUrl = text.trim();
          console.log("Pasted from clipboard:", text);
        } else {
          alert(this.currentLang === "en" ? "Clipboard is empty" : "\u1783\u17D2\u179B\u17B8\u1794\u1794\u178F\u1791\u1791\u17C1");
        }
      } catch (err) {
        console.error("Failed to read clipboard:", err);
        alert(this.currentLang === "en" ? "Unable to access clipboard. Please paste manually (Ctrl+V or Cmd+V)" : "\u1798\u17B7\u1793\u17A2\u17B6\u1785\u1785\u17BC\u179B\u1794\u17D2\u179A\u17BE\u1783\u17D2\u179B\u17B8\u1794\u1794\u178F\u17D4 \u179F\u17BC\u1798\u1794\u17B7\u1791\u1797\u17D2\u1787\u17B6\u1794\u17CB\u178A\u17C4\u1799\u178A\u17C3 (Ctrl+V \u17AC Cmd+V)");
      }
    },
    clearApiUrl() {
      this.customApiUrl = "";
      this.saveToLocalStorage();
      console.log("API key cleared");
    },
    setupNetworkListeners() {
      return;
    },
    removeNetworkListeners() {
      return;
    },
    handleOnline() {
      this.isOnline = true;
      this.fetchGoldPrice();
    },
    handleOffline() {
      this.isOnline = false;
    },
    toggleLanguage() {
      this.currentLang = this.currentLang === "en" ? "km" : "en";
      this.saveToLocalStorage();
    },
    updateGoldPriceFromCustom() {
      if (!this.customPrice || this.customPrice <= 0) {
        this.goldPrice = null;
        return;
      }
      if (this.priceInputMethod === "troyOz") {
        this.goldPrice = this.customPrice;
      } else if (this.priceInputMethod === "damlung") {
        const pricePerGram = this.customPrice / this.DAMLUNG_TO_GRAM;
        this.goldPrice = pricePerGram * this.TROY_OZ_TO_GRAM;
      } else if (this.priceInputMethod === "chi") {
        const pricePerGram = this.customPrice / this.CHI_TO_GRAM;
        this.goldPrice = pricePerGram * this.TROY_OZ_TO_GRAM;
      }
      this.lastUpdated = (/* @__PURE__ */ new Date()).toLocaleString() + " (custom)";
      this.saveToLocalStorage();
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 2e3);
    },
    saveCustomApi() {
      if (!this.customApiUrl || this.customApiUrl.trim() === "") {
        alert(this.currentLang === "en" ? "Please enter an API key first" : "\u179F\u17BC\u1798\u1794\u1789\u17D2\u1785\u17BC\u179B\u1782\u1793\u17D2\u179B\u17B9\u17C7 API \u1787\u17B6\u1798\u17BB\u1793\u179F\u17B7\u1793");
        return;
      }
      this.saveToLocalStorage();
      this.fetchGoldPrice();
    },
    getConverterAmountForUnit(unit) {
      if (this.activeConverter === unit) {
        return this.converterInput || 1;
      }
      return this.convertUnit(this.converterInput || 1, this.activeConverter, unit);
    },
    getPriceForConverterAmount(unit) {
      if (!this.goldPrice) return "0.00";
      const amount = parseFloat(this.getConverterAmountForUnit(unit));
      let pricePerUnit = 0;
      switch (unit) {
        case "li":
          pricePerUnit = this.pricePerLi;
          break;
        case "hun":
          pricePerUnit = this.pricePerHun;
          break;
        case "chi":
          pricePerUnit = this.pricePerChi;
          break;
        case "gram":
          pricePerUnit = this.pricePerGram;
          break;
        case "damlung":
          pricePerUnit = this.pricePerDamlung;
          break;
        case "troyOz":
          pricePerUnit = this.goldPrice;
          break;
      }
      return (pricePerUnit * amount).toFixed(2);
    },
    convertUnit(value, fromUnit, toUnit) {
      let grams = 0;
      switch (fromUnit) {
        case "li":
          grams = value * this.LI_TO_GRAM;
          break;
        case "hun":
          grams = value * this.HUN_TO_GRAM;
          break;
        case "chi":
          grams = value * this.CHI_TO_GRAM;
          break;
        case "gram":
          grams = value;
          break;
        case "damlung":
          grams = value * this.DAMLUNG_TO_GRAM;
          break;
        case "troyOz":
          grams = value * this.TROY_OZ_TO_GRAM;
          break;
      }
      let result = 0;
      switch (toUnit) {
        case "li":
          result = grams / this.LI_TO_GRAM;
          break;
        case "hun":
          result = grams / this.HUN_TO_GRAM;
          break;
        case "chi":
          result = grams / this.CHI_TO_GRAM;
          break;
        case "gram":
          result = grams;
          break;
        case "damlung":
          result = grams / this.DAMLUNG_TO_GRAM;
          break;
        case "troyOz":
          result = grams / this.TROY_OZ_TO_GRAM;
          break;
      }
      return result.toFixed(4);
    },
    async fetchGoldPrice() {
      this.loading = true;
      this.error = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15e3);
        let headers = {
          "Accept": "application/json"
        };
        let success = false;
        if (!success) {
          try {
            const response = await fetch("https://api.metals.live/v1/spot", {
              signal: controller.signal,
              headers,
              mode: "cors"
            });
            if (response.ok) {
              const data = await response.json();
              if (data && typeof data === "object") {
                let goldPrice = null;
                if (data.gold && typeof data.gold === "number") {
                  goldPrice = data.gold;
                } else if (data.gold && data.gold.price) {
                  goldPrice = data.gold.price;
                } else if (Array.isArray(data)) {
                  const goldData = data.find((m) => m && m.metal === "gold");
                  goldPrice = goldData == null ? void 0 : goldData.price;
                }
                if (goldPrice && !isNaN(goldPrice)) {
                  this.goldPrice = parseFloat(goldPrice);
                  this.lastUpdated = (/* @__PURE__ */ new Date()).toLocaleString();
                  this.saveToLocalStorage();
                  success = true;
                  console.log("\u2705 Got gold price from metals.live:", goldPrice);
                }
              }
            } else {
              console.warn("metals.live response not ok:", response.status);
            }
          } catch (err) {
            console.warn("metals.live failed:", err.message);
          }
        }
        if (!success) {
          try {
            let apiUrl = "https://www.goldapi.io/api/XAU/USD";
            let customHeaders = { ...headers };
            if (this.customApiUrl && this.customApiUrl.trim()) {
              const apiKey = this.customApiUrl.trim();
              customHeaders["x-access-token"] = apiKey;
            }
            const response = await fetch(apiUrl, {
              signal: controller.signal,
              headers: customHeaders,
              mode: "cors"
            });
            if (response.ok) {
              const data = await response.json();
              if (data && data.price) {
                this.goldPrice = parseFloat(data.price);
                this.lastUpdated = (/* @__PURE__ */ new Date()).toLocaleString();
                this.saveToLocalStorage();
                success = true;
                console.log("\u2705 Got gold price from goldapi.io:", data.price);
              }
            } else {
              console.warn("goldapi response not ok:", response.status);
            }
          } catch (err) {
            console.warn("goldapi failed:", err.message);
          }
        }
        if (!success) {
          try {
            const response = await fetch("https://api.metals.live/v1/gold/spot/usd", {
              signal: controller.signal,
              headers,
              mode: "cors"
            });
            if (response.ok) {
              const data = await response.json();
              if (data && data.price && !isNaN(data.price)) {
                this.goldPrice = parseFloat(data.price);
                this.lastUpdated = (/* @__PURE__ */ new Date()).toLocaleString();
                this.saveToLocalStorage();
                success = true;
                console.log("\u2705 Got gold price from metals.live alternative:", data.price);
              }
            }
          } catch (err) {
            console.warn("metals.live alternative failed:", err.message);
          }
        }
        clearTimeout(timeoutId);
        if (success) {
          this.showSuccessMessage = true;
          this.error = null;
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3e3);
        } else {
          const saved = this.safeGetLocalStorage("goldTrackerData");
          if (saved) {
            try {
              const data = JSON.parse(saved);
              if (data.goldPrice) {
                this.goldPrice = data.goldPrice;
                this.lastUpdated = data.lastUpdated + " (cached)";
                this.error = "Using cached price - unable to fetch live data";
                this.loading = false;
                return;
              }
            } catch (e) {
              console.error("Error loading cache:", e);
            }
          }
          this.error = "\u26A0\uFE0F Unable to fetch live prices. Check your internet or add a custom API key from goldapi.io";
        }
      } catch (err) {
        console.error("fetchGoldPrice error:", err);
        const saved = this.safeGetLocalStorage("goldTrackerData");
        if (saved) {
          try {
            const data = JSON.parse(saved);
            if (data.goldPrice) {
              this.goldPrice = data.goldPrice;
              this.lastUpdated = data.lastUpdated + " (cached)";
              this.error = "Using cached price - network error";
              this.loading = false;
              return;
            }
          } catch (e) {
            console.error("Error loading cache:", e);
          }
        }
        this.error = "\u274C Network error. Check your internet connection.";
      } finally {
        this.loading = false;
      }
    },
    addPurchase() {
      if (!this.newPurchase.weight || !this.newPurchase.price) {
        alert(this.currentLang === "en" ? "Please fill in weight and price" : "\u179F\u17BC\u1798\u1794\u17C6\u1796\u17C1\u1789\u1791\u1798\u17D2\u1784\u1793\u17CB \u1793\u17B7\u1784\u178F\u1798\u17D2\u179B\u17C3");
        return;
      }
      this.purchases.push({
        ...this.newPurchase,
        id: Date.now()
      });
      this.newPurchase = {
        weight: "",
        unit: "chi",
        metal: "gold",
        price: "",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      };
      this.showAddForm = false;
      this.saveToLocalStorage();
    },
    editPurchase(index) {
      this.editingIndex = index;
      this.editForm = { ...this.purchases[index] };
    },
    saveEdit() {
      if (!this.editForm.weight || !this.editForm.price) {
        alert(this.currentLang === "en" ? "Please fill in weight and price" : "\u179F\u17BC\u1798\u1794\u17C6\u1796\u17C1\u1789\u1791\u1798\u17D2\u1784\u1793\u17CB \u1793\u17B7\u1784\u178F\u1798\u17D2\u179B\u17C3");
        return;
      }
      this.purchases[this.editingIndex] = { ...this.editForm };
      this.editingIndex = null;
      this.editForm = {};
      this.saveToLocalStorage();
    },
    cancelEdit() {
      this.editingIndex = null;
      this.editForm = {};
    },
    deletePurchase(index) {
      if (confirm(this.currentLang === "en" ? "Delete this purchase?" : "\u179B\u17BB\u1794\u1780\u17B6\u179A\u1791\u17B7\u1789\u1793\u17C1\u17C7?")) {
        this.purchases.splice(index, 1);
        this.saveToLocalStorage();
      }
    },
    calculateCurrentValue(purchase) {
      if (!this.goldPrice) return 0;
      let grams = 0;
      switch (purchase.unit) {
        case "li":
          grams = purchase.weight * this.LI_TO_GRAM;
          break;
        case "hun":
          grams = purchase.weight * this.HUN_TO_GRAM;
          break;
        case "chi":
          grams = purchase.weight * this.CHI_TO_GRAM;
          break;
        case "gram":
          grams = purchase.weight;
          break;
        case "damlung":
          grams = purchase.weight * this.DAMLUNG_TO_GRAM;
          break;
        case "troyOz":
          grams = purchase.weight * this.TROY_OZ_TO_GRAM;
          break;
      }
      const pricePerGram = this.goldPrice / this.TROY_OZ_TO_GRAM;
      return pricePerGram * grams;
    },
    calculateGainLoss(purchase) {
      return this.calculateCurrentValue(purchase) - purchase.price;
    },
    getGainLossClass(purchase) {
      const gainLoss = this.calculateGainLoss(purchase);
      return gainLoss >= 0 ? "gain" : "loss";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    exportToCSV() {
      const headers = [
        this.t.date,
        this.t.weight,
        this.t.unit,
        this.t.pricePaid,
        this.t.currentValue,
        this.t.gainLoss,
        "Status"
      ];
      const rows = this.purchases.map((p) => {
        const currentValue = this.calculateCurrentValue(p);
        const gainLoss = currentValue - p.price;
        const status = gainLoss >= 0 ? "GAIN" : "LOSS";
        return [
          p.date,
          p.weight,
          this.t[p.unit] || p.unit,
          p.price.toFixed(2),
          currentValue.toFixed(2),
          gainLoss.toFixed(2),
          status
        ].map((cell) => {
          const str = String(cell);
          return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
        });
      });
      const summary = [
        "",
        "",
        "",
        this.totalInvested.toFixed(2),
        this.totalCurrentValue.toFixed(2),
        this.totalGainLoss.toFixed(2),
        this.totalGainLoss >= 0 ? "GAIN" : "LOSS"
      ];
      const csv = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
        "",
        ["TOTALS", "", "", ...summary.slice(3)].join(",")
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = (void 0).createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `gold-tracker-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      link.click();
    },
    safeGetLocalStorage(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn("localStorage not available:", e);
        return null;
      }
    },
    safeSetLocalStorage(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn("localStorage not available:", e);
      }
    },
    saveToLocalStorage() {
      const data = {
        currentLang: this.currentLang,
        goldPrice: this.goldPrice,
        lastUpdated: this.lastUpdated,
        purchases: this.purchases,
        priceInputMethod: this.priceInputMethod,
        customPrice: this.customPrice,
        customApiUrl: this.customApiUrl,
        priceSource: this.priceSource
      };
      this.safeSetLocalStorage("goldTrackerData", JSON.stringify(data));
    },
    loadFromLocalStorage() {
      const saved = this.safeGetLocalStorage("goldTrackerData");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.currentLang = data.currentLang || "en";
          this.goldPrice = data.goldPrice;
          this.lastUpdated = data.lastUpdated;
          this.purchases = data.purchases || [];
          this.priceInputMethod = data.priceInputMethod || "troyOz";
          this.customPrice = data.customPrice || null;
          this.customApiUrl = data.customApiUrl || "";
          this.priceSource = data.priceSource || "api";
        } catch (e) {
          console.error("Error loading from localStorage:", e);
        }
      }
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "gold-tracker" }, _attrs))} data-v-14e76d89><div class="header" data-v-14e76d89><h1 data-v-14e76d89>${ssrInterpolate($options.t.title)}</h1><div class="header-actions" data-v-14e76d89><button class="lang-btn" data-v-14e76d89>${ssrInterpolate($data.currentLang === "en" ? "\u1781\u17D2\u1798\u17C2\u179A" : "EN")}</button></div></div>`);
  if (!$data.isOnline) {
    _push(`<div class="network-warning" data-v-14e76d89>${ssrInterpolate($options.t.offlineWarning)}</div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="price-section" data-v-14e76d89><div class="price-source-toggle" data-v-14e76d89><button class="${ssrRenderClass(["source-btn", { active: $data.priceSource === "api" }])}" data-v-14e76d89> \u{1F310} API Prices </button><button class="${ssrRenderClass(["source-btn", { active: $data.priceSource === "custom" }])}" data-v-14e76d89> \u270F\uFE0F Custom Price </button></div><div class="price-header" data-v-14e76d89><h2 data-v-14e76d89>${ssrInterpolate($options.t.currentPrice)}</h2>`);
  if ($data.priceSource === "api") {
    _push(`<button${ssrIncludeBooleanAttr($data.loading) ? " disabled" : ""} class="refresh-btn" data-v-14e76d89>`);
    if (!$data.loading) {
      _push(`<span data-v-14e76d89>\u{1F504} ${ssrInterpolate($options.t.refreshNow)}</span>`);
    } else {
      _push(`<span class="loading-spinner" data-v-14e76d89>\u23F3 ${ssrInterpolate($options.t.loading)}</span>`);
    }
    _push(`</button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($data.loading) {
    _push(`<div class="loading-bar" data-v-14e76d89><div class="loading-progress" data-v-14e76d89></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.showSuccessMessage) {
    _push(`<div class="success-message" data-v-14e76d89> \u2705 ${ssrInterpolate($options.t.pricesUpdated)}</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.goldPrice) {
    _push(`<div class="price-cards" data-v-14e76d89><div class="price-card active" data-v-14e76d89><div class="card-label" data-v-14e76d89>\u{1F947} ${ssrInterpolate($options.t.gold)}</div><div class="price-main" data-v-14e76d89><span class="price-value" data-v-14e76d89>$${ssrInterpolate($data.goldPrice.toFixed(2))}</span><span class="price-unit" data-v-14e76d89>${ssrInterpolate($data.priceSource === "api" ? $options.t.perTroyOz : "per " + ($data.priceInputMethod === "troyOz" ? $options.t.troyOunce : $data.priceInputMethod === "damlung" ? $options.t.damlung : $options.t.chi))}</span></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.lastUpdated && $data.priceSource === "api") {
    _push(`<div class="price-meta" data-v-14e76d89><span class="last-updated" data-v-14e76d89>${ssrInterpolate($options.t.lastUpdated)}: ${ssrInterpolate($data.lastUpdated)}</span></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.error) {
    _push(`<div class="error-message" data-v-14e76d89><span class="error-icon" data-v-14e76d89>\u26A0\uFE0F</span><div class="error-content" data-v-14e76d89><span class="error-text" data-v-14e76d89>${ssrInterpolate($data.error)}</span><button class="error-retry-btn" data-v-14e76d89>Retry</button></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
  if ($data.priceSource === "custom") {
    _push(`<div class="price-method-section" data-v-14e76d89><h3 data-v-14e76d89>${ssrInterpolate($options.t.setPriceBy)}</h3><div class="price-method-toggle" data-v-14e76d89><button class="${ssrRenderClass(["method-btn", { active: $data.priceInputMethod === "troyOz" }])}" data-v-14e76d89>${ssrInterpolate($options.t.troyOunce)}</button><button class="${ssrRenderClass(["method-btn", { active: $data.priceInputMethod === "damlung" }])}" data-v-14e76d89>${ssrInterpolate($options.t.damlung)}</button><button class="${ssrRenderClass(["method-btn", { active: $data.priceInputMethod === "chi" }])}" data-v-14e76d89>${ssrInterpolate($options.t.chi)}</button></div><div class="custom-price-input" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.customPrice)} (${ssrInterpolate($data.priceInputMethod === "troyOz" ? $options.t.troyOunce : $data.priceInputMethod === "damlung" ? $options.t.damlung : $options.t.chi)}):</label><div class="price-input-row" data-v-14e76d89><input${ssrRenderAttr("value", $data.customPrice)} type="text" inputmode="decimal"${ssrRenderAttr("placeholder", $options.t.enterCustomPrice)} class="price-input" data-v-14e76d89></div>`);
    if ($data.customPrice) {
      _push(`<div class="price-update-indicator" data-v-14e76d89> \u2713 ${ssrInterpolate($options.t.pricesUpdated)}</div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
    if ($options.currentMetalPrice) {
      _push(`<div class="price-preview" data-v-14e76d89><div class="preview-header" data-v-14e76d89>\u{1F947} ${ssrInterpolate($options.t.gold)} ${ssrInterpolate($options.t.priceByUnit)}</div><div class="preview-item" data-v-14e76d89><span class="preview-label" data-v-14e76d89>${ssrInterpolate($options.t.troyOunce)}:</span><span class="preview-value" data-v-14e76d89>$${ssrInterpolate($options.currentMetalPrice ? $options.currentMetalPrice.toFixed(2) : "0.00")}</span></div><div class="preview-item" data-v-14e76d89><span class="preview-label" data-v-14e76d89>${ssrInterpolate($options.t.damlung)}:</span><span class="preview-value" data-v-14e76d89>$${ssrInterpolate($options.currentMetalPrice ? $options.currentPricePerDamlung.toFixed(2) : "0.00")}</span></div><div class="preview-item" data-v-14e76d89><span class="preview-label" data-v-14e76d89>${ssrInterpolate($options.t.chi)}:</span><span class="preview-value" data-v-14e76d89>$${ssrInterpolate($options.currentMetalPrice ? $options.currentPricePerChi.toFixed(2) : "0.00")}</span></div></div>`);
    } else {
      _push(`<!---->`);
    }
    _push(`</div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.priceSource === "api") {
    _push(`<div class="api-configuration-section" data-v-14e76d89><div class="api-section-header" data-v-14e76d89><h3 data-v-14e76d89>${ssrInterpolate($options.t.customAPIUrl)}</h3><p class="api-description" data-v-14e76d89>${ssrInterpolate($options.t.usingFreeAPI)}</p></div><div class="api-cta-card" data-v-14e76d89><div class="cta-icon" data-v-14e76d89>\u{1F511}</div><div class="cta-content" data-v-14e76d89><h4 data-v-14e76d89>${ssrInterpolate($options.t.getAPIKey)}</h4><p data-v-14e76d89>Get unlimited requests with your own free API key</p><a href="https://www.goldapi.io/" target="_blank" rel="noopener noreferrer" class="cta-link" data-v-14e76d89> Visit goldapi.io \u2192 </a></div></div><div class="api-input-section" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.enterAPIUrl)}</label><div class="api-input-row" data-v-14e76d89><input${ssrRenderAttr("value", $data.customApiUrl)} type="text"${ssrRenderAttr("placeholder", "Paste your API key here...")} class="api-input" data-v-14e76d89><button class="api-action-btn paste-btn"${ssrRenderAttr("title", $options.t.pasteFromClipboard)} data-v-14e76d89><span class="btn-icon" data-v-14e76d89>\u{1F4CB}</span><span class="btn-text" data-v-14e76d89>Paste</span></button></div>`);
    if ($data.customApiUrl) {
      _push(`<div class="api-status success" data-v-14e76d89><span class="status-icon" data-v-14e76d89>\u2713</span><span class="status-text" data-v-14e76d89>API key ready</span><button class="status-clear" data-v-14e76d89>Clear</button></div>`);
    } else {
      _push(`<div class="api-status default" data-v-14e76d89><span class="status-icon" data-v-14e76d89>\u25CB</span><span class="status-text" data-v-14e76d89>Using free API (no key needed)</span></div>`);
    }
    _push(`</div><div class="api-action-buttons" data-v-14e76d89><button${ssrIncludeBooleanAttr(!$data.customApiUrl) ? " disabled" : ""} class="api-save-btn" data-v-14e76d89>`);
    if (!$data.customApiUrl) {
      _push(`<span class="btn-disabled" data-v-14e76d89>No API key to save</span>`);
    } else {
      _push(`<span data-v-14e76d89>\u2713 Save API Key</span>`);
    }
    _push(`</button></div><div class="api-info-box" data-v-14e76d89><span class="info-icon" data-v-14e76d89>\u2139\uFE0F</span><p data-v-14e76d89>Your API key is saved locally on your device. Free tier gives you 100+ requests per month.</p></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="converter-section" data-v-14e76d89><h2 data-v-14e76d89>${ssrInterpolate($options.t.unitConverter)}</h2><div class="converter-tabs" data-v-14e76d89><!--[-->`);
  ssrRenderList($data.converterUnits, (unit) => {
    _push(`<button class="${ssrRenderClass(["tab-btn", { active: $data.activeConverter === unit }])}" data-v-14e76d89>${ssrInterpolate($options.t[unit] || unit)}</button>`);
  });
  _push(`<!--]--></div><div class="converter-content" data-v-14e76d89><div class="converter-input-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.from)}</label><input${ssrRenderAttr("value", $data.converterInput)} type="text" inputmode="decimal"${ssrRenderAttr("placeholder", "Enter " + ($options.t[$data.activeConverter] || $data.activeConverter))} class="converter-input" data-v-14e76d89></div><div class="conversion-results" data-v-14e76d89><!--[-->`);
  ssrRenderList($data.converterUnits.filter((u) => u !== $data.activeConverter), (unit) => {
    _push(`<div class="result-row" data-v-14e76d89><span class="result-label" data-v-14e76d89>${ssrInterpolate($options.t[unit])}:</span><span class="result-value" data-v-14e76d89>${ssrInterpolate($options.convertUnit($data.converterInput, $data.activeConverter, unit))}</span></div>`);
  });
  _push(`<!--]--></div></div></div><div class="price-by-unit" data-v-14e76d89><h2 data-v-14e76d89>${ssrInterpolate($options.t.priceByUnit)}</h2>`);
  if ($data.goldPrice) {
    _push(`<div class="unit-grid" data-v-14e76d89><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.li)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("li"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("li"))} (0.0375g)</span></div><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.hun)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("hun"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("hun"))} (0.375g)</span></div><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.chi)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("chi"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("chi"))} (3.75g)</span></div><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.gram)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("gram"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("gram"))} (1g)</span></div><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.damlung)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("damlung"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("damlung"))} (37.5g)</span></div><div class="unit-card" data-v-14e76d89><span class="unit-name" data-v-14e76d89>${ssrInterpolate($options.t.troyOunce)}</span><span class="unit-price" data-v-14e76d89>$${ssrInterpolate($options.getPriceForConverterAmount("troyOz"))}</span><span class="unit-weight" data-v-14e76d89>${ssrInterpolate($options.getConverterAmountForUnit("troyOz"))} (31.1g)</span></div></div>`);
  } else {
    _push(`<div class="no-price-message" data-v-14e76d89>${ssrInterpolate($options.t.fetchPriceFirst)}</div>`);
  }
  _push(`</div><div class="purchases-section" data-v-14e76d89><div class="purchases-header" data-v-14e76d89><h2 data-v-14e76d89>${ssrInterpolate($options.t.myPurchases)}</h2><button class="add-btn" data-v-14e76d89>${ssrInterpolate($data.showAddForm ? $options.t.cancel : $options.t.addPurchase)}</button></div>`);
  if ($data.showAddForm) {
    _push(`<div class="purchase-form" data-v-14e76d89><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.weight)}</label><input${ssrRenderAttr("value", $data.newPurchase.weight)} type="text" inputmode="decimal"${ssrRenderAttr("placeholder", $options.t.enterWeight)} data-v-14e76d89></div></div><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.unit)}</label><select data-v-14e76d89><option value="chi" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "chi") : ssrLooseEqual($data.newPurchase.unit, "chi")) ? " selected" : ""}>${ssrInterpolate($options.t.chi)}</option><option value="damlung" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "damlung") : ssrLooseEqual($data.newPurchase.unit, "damlung")) ? " selected" : ""}>${ssrInterpolate($options.t.damlung)}</option><option value="gram" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "gram") : ssrLooseEqual($data.newPurchase.unit, "gram")) ? " selected" : ""}>${ssrInterpolate($options.t.gram)}</option><option value="hun" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "hun") : ssrLooseEqual($data.newPurchase.unit, "hun")) ? " selected" : ""}>${ssrInterpolate($options.t.hun)}</option><option value="li" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "li") : ssrLooseEqual($data.newPurchase.unit, "li")) ? " selected" : ""}>${ssrInterpolate($options.t.li)}</option><option value="troyOz" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.newPurchase.unit) ? ssrLooseContain($data.newPurchase.unit, "troyOz") : ssrLooseEqual($data.newPurchase.unit, "troyOz")) ? " selected" : ""}>${ssrInterpolate($options.t.troyOunce)}</option></select></div><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.pricePaid)}</label><input${ssrRenderAttr("value", $data.newPurchase.price)} type="text" inputmode="decimal"${ssrRenderAttr("placeholder", $options.t.enterPrice)} data-v-14e76d89></div></div><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.date)}</label><input${ssrRenderAttr("value", $data.newPurchase.date)} type="date" data-v-14e76d89></div></div><button class="submit-btn" data-v-14e76d89>${ssrInterpolate($options.t.save)}</button></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.purchases.length > 0) {
    _push(`<div class="purchases-grid" data-v-14e76d89><!--[-->`);
    ssrRenderList($data.purchases, (purchase, index) => {
      _push(`<div class="purchase-card" data-v-14e76d89>`);
      if ($data.editingIndex !== index) {
        _push(`<div data-v-14e76d89><div class="card-header" data-v-14e76d89><span class="card-weight" data-v-14e76d89> \u{1F947} ${ssrInterpolate(purchase.weight)} ${ssrInterpolate($options.t[purchase.unit])}</span><div class="card-actions" data-v-14e76d89><button class="icon-btn" data-v-14e76d89>\u270F\uFE0F</button><button class="icon-btn" data-v-14e76d89>\u{1F5D1}\uFE0F</button></div></div><div class="card-detail" data-v-14e76d89><span class="detail-label" data-v-14e76d89>${ssrInterpolate($options.t.paid)}:</span><span class="detail-value" data-v-14e76d89>$${ssrInterpolate(purchase.price.toFixed(2))}</span></div><div class="card-detail" data-v-14e76d89><span class="detail-label" data-v-14e76d89>${ssrInterpolate($options.t.current)}:</span><span class="detail-value" data-v-14e76d89>$${ssrInterpolate($options.calculateCurrentValue(purchase).toFixed(2))}</span></div><div class="card-detail" data-v-14e76d89><span class="detail-label" data-v-14e76d89>${ssrInterpolate($options.t.gainLoss)}:</span><span class="${ssrRenderClass(["detail-value", $options.getGainLossClass(purchase)])}" data-v-14e76d89> $${ssrInterpolate($options.calculateGainLoss(purchase).toFixed(2))}</span></div><div class="card-date" data-v-14e76d89>${ssrInterpolate($options.formatDate(purchase.date))}</div></div>`);
      } else {
        _push(`<div class="edit-form" data-v-14e76d89><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.weight)}</label><input${ssrRenderAttr("value", $data.editForm.weight)} type="text" inputmode="decimal" data-v-14e76d89></div></div><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.unit)}</label><select data-v-14e76d89><option value="chi" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "chi") : ssrLooseEqual($data.editForm.unit, "chi")) ? " selected" : ""}>${ssrInterpolate($options.t.chi)}</option><option value="damlung" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "damlung") : ssrLooseEqual($data.editForm.unit, "damlung")) ? " selected" : ""}>${ssrInterpolate($options.t.damlung)}</option><option value="gram" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "gram") : ssrLooseEqual($data.editForm.unit, "gram")) ? " selected" : ""}>${ssrInterpolate($options.t.gram)}</option><option value="hun" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "hun") : ssrLooseEqual($data.editForm.unit, "hun")) ? " selected" : ""}>${ssrInterpolate($options.t.hun)}</option><option value="li" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "li") : ssrLooseEqual($data.editForm.unit, "li")) ? " selected" : ""}>${ssrInterpolate($options.t.li)}</option><option value="troyOz" data-v-14e76d89${ssrIncludeBooleanAttr(Array.isArray($data.editForm.unit) ? ssrLooseContain($data.editForm.unit, "troyOz") : ssrLooseEqual($data.editForm.unit, "troyOz")) ? " selected" : ""}>${ssrInterpolate($options.t.troyOunce)}</option></select></div><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.pricePaid)}</label><input${ssrRenderAttr("value", $data.editForm.price)} type="text" inputmode="decimal" data-v-14e76d89></div></div><div class="form-row" data-v-14e76d89><div class="form-group" data-v-14e76d89><label data-v-14e76d89>${ssrInterpolate($options.t.date)}</label><input${ssrRenderAttr("value", $data.editForm.date)} type="date" data-v-14e76d89></div></div><div class="edit-actions" data-v-14e76d89><button class="save-btn" data-v-14e76d89>${ssrInterpolate($options.t.save)}</button><button class="cancel-btn" data-v-14e76d89>${ssrInterpolate($options.t.cancel)}</button></div></div>`);
      }
      _push(`</div>`);
    });
    _push(`<!--]--></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.purchases.length > 0) {
    _push(`<div class="portfolio-summary" data-v-14e76d89><h3 data-v-14e76d89>${ssrInterpolate($options.t.portfolioSummary)}</h3><div class="summary-grid" data-v-14e76d89><div class="summary-item" data-v-14e76d89><span class="summary-label" data-v-14e76d89>${ssrInterpolate($options.t.totalInvested)}:</span><span class="summary-value" data-v-14e76d89>$${ssrInterpolate($options.totalInvested.toFixed(2))}</span></div><div class="summary-item" data-v-14e76d89><span class="summary-label" data-v-14e76d89>${ssrInterpolate($options.t.currentValue)}:</span><span class="summary-value" data-v-14e76d89>$${ssrInterpolate($options.totalCurrentValue.toFixed(2))}</span></div><div class="summary-item" data-v-14e76d89><span class="summary-label" data-v-14e76d89>${ssrInterpolate($options.t.totalGainLoss)}:</span><span class="${ssrRenderClass(["summary-value", $options.totalGainLoss >= 0 ? "gain" : "loss"])}" data-v-14e76d89> $${ssrInterpolate($options.totalGainLoss.toFixed(2))}</span></div></div><button class="export-btn" data-v-14e76d89>${ssrInterpolate($options.t.exportCSV)}</button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/gold.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const gold = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-14e76d89"]]);

export { gold as default };
//# sourceMappingURL=gold-C3hrg1Ea.mjs.map
