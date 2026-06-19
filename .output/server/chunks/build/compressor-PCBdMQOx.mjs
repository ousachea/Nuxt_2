import { mergeProps, useSSRContext } from 'vue';
import { _ as _export_sfc } from './server.mjs';
import { ssrRenderAttrs, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrRenderStyle } from 'vue/server-renderer';
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
  name: "CompressorPage",
  data() {
    return {
      files: [],
      isDragOver: false,
      isProcessing: false,
      quality: 80,
      progress: 0,
      error: null,
      totalProcessed: 0,
      totalSaved: 0,
      compressionMode: "adaptive",
      resizeMode: "2000px",
      maxConcurrent: 2,
      activeCompressions: 0,
      compressionQueue: [],
      fileIdCounter: 0
    };
  },
  computed: {
    compressedCount() {
      return this.files.filter((f) => f.status === "compressed").length;
    },
    avgReduction() {
      const compressed = this.files.filter((f) => f.status === "compressed");
      if (compressed.length === 0) return 0;
      const totalOriginal = compressed.reduce((sum, f) => sum + f.size, 0);
      const totalCompressed = compressed.reduce((sum, f) => sum + (f.compressedSize || f.size), 0);
      return totalOriginal > 0 ? Math.round((totalOriginal - totalCompressed) / totalOriginal * 100) : 0;
    }
  },
  methods: {
    // FILE HANDLING
    handleDrop(e) {
      this.isDragOver = false;
      const droppedFiles = Array.from(e.dataTransfer.files);
      this.addFiles(droppedFiles);
    },
    handleFileSelect(e) {
      const selectedFiles = Array.from(e.target.files);
      this.addFiles(selectedFiles);
      e.target.value = "";
    },
    async addFiles(newFiles) {
      const validFiles = newFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isPDF = file.type === "application/pdf";
        if (!isImage && !isPDF) {
          this.showError("Invalid", `${file.name} is not an image or PDF`);
          return false;
        }
        if (file.size > 500 * 1024 * 1024) {
          this.showError("Too large", `${file.name} exceeds 500MB`);
          return false;
        }
        return true;
      });
      for (const file of validFiles) {
        try {
          const isPDF = file.type === "application/pdf";
          let metadata = null;
          let thumbnail = null;
          if (isPDF) {
            metadata = {
              width: 0,
              height: 0,
              megapixels: 0,
              estimatedMemory: file.size / (1024 * 1024),
              isPDF: true
            };
            thumbnail = null;
          } else {
            metadata = await this.getImageMetadata(file);
            thumbnail = await this.generateThumbnail(file);
          }
          const fileObj = {
            id: `file_${this.fileIdCounter++}_${Date.now()}`,
            name: file.name,
            size: file.size,
            file,
            status: "pending",
            compressedSize: null,
            compressedBlob: null,
            previewUrl: thumbnail,
            metadata,
            isPDF
          };
          this.files.unshift(fileObj);
        } catch (error) {
          console.error("Error adding file:", error);
          this.showError("Error", `Failed to add ${file.name}`);
        }
      }
    },
    removeFile(index) {
      const file = this.files[index];
      this.cleanupFileBlobs(file);
      this.files.splice(index, 1);
    },
    cleanupFileBlobs(file) {
      if (file.previewUrl && file.previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(file.previewUrl);
        } catch (e) {
          console.warn("Failed to revoke preview URL:", e);
        }
      }
      if (file.compressedBlob && typeof file.compressedBlob === "object") {
        try {
          const url = URL.createObjectURL(file.compressedBlob);
          URL.revokeObjectURL(url);
        } catch (e) {
        }
      }
    },
    // 100MP+ IMAGE HANDLING
    async getImageMetadata(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const timeout = setTimeout(() => {
          reader.abort();
          reject(new Error("Metadata timeout"));
        }, 1e4);
        reader.onload = (event) => {
          clearTimeout(timeout);
          const img = new Image();
          const imgTimeout = setTimeout(() => {
            img.src = "";
            reject(new Error("Image load timeout"));
          }, 1e4);
          img.onload = () => {
            clearTimeout(imgTimeout);
            const megapixels = img.naturalWidth * img.naturalHeight / 1e6;
            resolve({
              width: img.naturalWidth,
              height: img.naturalHeight,
              megapixels,
              estimatedMemory: img.naturalWidth * img.naturalHeight * 4 / (1024 * 1024)
            });
            img.src = "";
          };
          img.onerror = () => {
            clearTimeout(imgTimeout);
            reject(new Error("Failed to load image"));
          };
          img.src = event.target.result;
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("FileReader failed"));
        };
        reader.readAsDataURL(file);
      });
    },
    async generateThumbnail(file, maxSize = 150) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        const timeout = setTimeout(() => {
          reader.abort();
          resolve(null);
        }, 5e3);
        reader.onload = (event) => {
          clearTimeout(timeout);
          const img = new Image();
          const imgTimeout = setTimeout(() => {
            img.src = "";
            resolve(null);
          }, 5e3);
          img.onload = () => {
            clearTimeout(imgTimeout);
            try {
              let { width, height } = img;
              const scale = Math.min(maxSize / width, maxSize / height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
              const canvas = (void 0).createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d", { alpha: false });
              ctx.drawImage(img, 0, 0, width, height);
              const thumbnail = canvas.toDataURL("image/webp", 0.6);
              canvas.width = canvas.height = 0;
              img.src = "";
              resolve(thumbnail);
            } catch (error) {
              console.error("Thumbnail error:", error);
              resolve(null);
            }
          };
          img.onerror = () => {
            clearTimeout(imgTimeout);
            resolve(null);
          };
          img.src = event.target.result;
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    },
    // COMPRESSION
    getAdaptiveQuality(megapixels) {
      if (megapixels > 100) return 65;
      if (megapixels > 50) return 70;
      if (megapixels > 30) return 75;
      if (megapixels > 20) return 80;
      return 85;
    },
    getResizeDimensions(width, height) {
      if (this.resizeMode === "original") {
        return { width, height };
      }
      const maxSize = this.resizeMode === "2000px" ? 2e3 : 1e3;
      const maxDimension = Math.max(width, height);
      if (maxDimension <= maxSize) {
        return { width, height };
      }
      const scale = maxSize / maxDimension;
      return {
        width: Math.round(width * scale),
        height: Math.round(height * scale)
      };
    },
    async compressPDF(fileObj) {
      try {
        const { PDFDocument } = await import('pdf-lib');
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, {
          ignoreEncryption: true,
          updateMetadata: false
        });
        pdfDoc.setTitle("");
        pdfDoc.setAuthor("");
        pdfDoc.setSubject("");
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer("");
        pdfDoc.setCreator("");
        const compressedPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 50
        });
        return new Blob([compressedPdfBytes], { type: "application/pdf" });
      } catch (error) {
        console.error("PDF compression error:", error);
        throw error;
      }
    },
    async compressAll() {
      if (this.files.length === 0 || this.isProcessing) return;
      this.isProcessing = true;
      this.progress = 0;
      this.totalProcessed = 0;
      this.totalSaved = 0;
      const uncompressed = this.files.filter((f) => f.status === "pending");
      this.compressionQueue = [...uncompressed];
      this.activeCompressions = 0;
      const totalFiles = this.compressionQueue.length;
      try {
        while (this.compressionQueue.length > 0 || this.activeCompressions > 0) {
          while (this.activeCompressions < this.maxConcurrent && this.compressionQueue.length > 0) {
            const fileObj = this.compressionQueue.shift();
            this.activeCompressions++;
            this.compressSingle(fileObj).then(() => {
              this.activeCompressions--;
              this.totalProcessed++;
              this.updateProgress(totalFiles);
            }).catch((error) => {
              console.error("Compression failed:", error);
              this.activeCompressions--;
              this.totalProcessed++;
              this.updateProgress(totalFiles);
            });
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("Compression queue error:", error);
        this.showError("Error", "Compression failed");
      } finally {
        this.isProcessing = false;
        this.progress = 100;
      }
    },
    async compressSingle(fileObj) {
      if (!fileObj || !fileObj.file || fileObj.status !== "pending") {
        return;
      }
      this.$set(fileObj, "status", "processing");
      try {
        if (fileObj.isPDF) {
          const compressedBlob2 = await this.compressPDF(fileObj);
          if (compressedBlob2 && compressedBlob2.size > 0) {
            this.$set(fileObj, "compressedBlob", compressedBlob2);
            this.$set(fileObj, "compressedSize", compressedBlob2.size);
            this.$set(fileObj, "status", "compressed");
            this.totalSaved += Math.max(0, fileObj.size - compressedBlob2.size);
          } else {
            this.$set(fileObj, "status", "error");
          }
          return;
        }
        const qualityToUse = this.compressionMode === "adaptive" ? this.getAdaptiveQuality(fileObj.metadata.megapixels) : this.quality;
        let compressedBlob;
        if (fileObj.metadata.megapixels > 30) {
          compressedBlob = await this.compressImageTiled(fileObj, qualityToUse);
        } else {
          compressedBlob = await this.compressImageStandard(fileObj, qualityToUse);
        }
        if (compressedBlob && compressedBlob.size > 0) {
          this.$set(fileObj, "compressedBlob", compressedBlob);
          this.$set(fileObj, "compressedSize", compressedBlob.size);
          this.$set(fileObj, "status", "compressed");
          this.totalSaved += Math.max(0, fileObj.size - compressedBlob.size);
        } else {
          this.$set(fileObj, "status", "error");
        }
      } catch (error) {
        console.error("Compression error:", error);
        this.$set(fileObj, "status", "error");
      }
    },
    // TILED COMPRESSION for 100MP+
    async compressImageTiled(fileObj, quality) {
      return new Promise((resolve, reject) => {
        const TILE_SIZE = 1024;
        const reader = new FileReader();
        const timeout = setTimeout(() => {
          reader.abort();
          reject(new Error("Tiled compression timeout"));
        }, 6e4);
        reader.onload = (event) => {
          clearTimeout(timeout);
          const img = new Image();
          const imgTimeout = setTimeout(() => {
            img.src = "";
            reject(new Error("Image load timeout"));
          }, 3e4);
          img.onload = () => {
            clearTimeout(imgTimeout);
            try {
              const { width, height } = this.getResizeDimensions(img.naturalWidth, img.naturalHeight);
              const outputCanvas = (void 0).createElement("canvas");
              outputCanvas.width = width;
              outputCanvas.height = height;
              const outputCtx = outputCanvas.getContext("2d", { alpha: false });
              const tilesX = Math.ceil(width / TILE_SIZE);
              const tilesY = Math.ceil(height / TILE_SIZE);
              const totalTiles = tilesX * tilesY;
              let completed = 0;
              const processNextTile = () => {
                if (completed >= totalTiles) {
                  outputCanvas.toBlob(
                    (blob) => {
                      outputCanvas.width = outputCanvas.height = 0;
                      img.src = "";
                      if (blob) {
                        resolve(blob);
                      } else {
                        reject(new Error("Failed to create blob"));
                      }
                    },
                    "image/jpeg",
                    quality / 100
                  );
                  return;
                }
                try {
                  const tileY = Math.floor(completed / tilesX);
                  const tileX = completed % tilesX;
                  const x = tileX * TILE_SIZE;
                  const y = tileY * TILE_SIZE;
                  const w = Math.min(TILE_SIZE, width - x);
                  const h = Math.min(TILE_SIZE, height - y);
                  const tileCanvas = (void 0).createElement("canvas");
                  tileCanvas.width = w;
                  tileCanvas.height = h;
                  const tileCtx = tileCanvas.getContext("2d", { alpha: false });
                  const scaleX = img.naturalWidth / width;
                  const scaleY = img.naturalHeight / height;
                  const sx = x * scaleX;
                  const sy = y * scaleY;
                  const sw = w * scaleX;
                  const sh = h * scaleY;
                  tileCtx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
                  const imageData = tileCtx.getImageData(0, 0, w, h);
                  outputCtx.putImageData(imageData, x, y);
                  tileCanvas.width = tileCanvas.height = 0;
                  completed++;
                  setTimeout(processNextTile, 0);
                } catch (error) {
                  reject(error);
                }
              };
              processNextTile();
            } catch (error) {
              reject(error);
            }
          };
          img.onerror = () => {
            clearTimeout(imgTimeout);
            reject(new Error("Image load failed"));
          };
          img.src = event.target.result;
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("FileReader failed"));
        };
        reader.readAsDataURL(fileObj.file);
      });
    },
    // Standard compression for smaller images
    async compressImageStandard(fileObj, quality) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const timeout = setTimeout(() => {
          reader.abort();
          reject(new Error("Standard compression timeout"));
        }, 3e4);
        reader.onload = (event) => {
          clearTimeout(timeout);
          const img = new Image();
          const imgTimeout = setTimeout(() => {
            img.src = "";
            reject(new Error("Image load timeout"));
          }, 15e3);
          img.onload = () => {
            clearTimeout(imgTimeout);
            try {
              const { width, height } = this.getResizeDimensions(img.naturalWidth, img.naturalHeight);
              const canvas = (void 0).createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d", { alpha: false });
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob(
                (blob) => {
                  canvas.width = canvas.height = 0;
                  img.src = "";
                  if (blob) {
                    resolve(blob);
                  } else {
                    reject(new Error("Failed to create blob"));
                  }
                },
                "image/jpeg",
                quality / 100
              );
            } catch (error) {
              reject(error);
            }
          };
          img.onerror = () => {
            clearTimeout(imgTimeout);
            reject(new Error("Image load failed"));
          };
          img.src = event.target.result;
        };
        reader.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("FileReader failed"));
        };
        reader.readAsDataURL(fileObj.file);
      });
    },
    updateProgress(totalFiles) {
      if (totalFiles > 0) {
        this.progress = this.totalProcessed / totalFiles * 100;
      } else {
        this.progress = 0;
      }
    },
    // DOWNLOAD
    downloadFile(file) {
      if (!file.compressedBlob) return;
      try {
        const url = URL.createObjectURL(file.compressedBlob);
        const a = (void 0).createElement("a");
        a.href = url;
        const originalName = file.name.replace(/\.[^/.]+$/, "");
        const extension = file.name.split(".").pop();
        a.download = `ousa_compressed_${originalName}.${extension}`;
        (void 0).body.appendChild(a);
        a.click();
        (void 0).body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("Download error:", error);
        this.showError("Download failed", "Could not download file");
      }
    },
    downloadAll() {
      const compressedFiles = this.files.filter((f) => f.status === "compressed");
      if (compressedFiles.length === 0) {
        this.showError("No files", "Compress files first");
        return;
      }
      compressedFiles.forEach((file, index) => {
        setTimeout(() => this.downloadFile(file), index * 500);
      });
    },
    async downloadAsZip() {
      const compressedFiles = this.files.filter((f) => f.status === "compressed");
      if (compressedFiles.length === 0) {
        this.showError("No files", "Compress files first");
        return;
      }
      try {
        const JSZip = await import('jszip');
        const zip = new JSZip.default();
        compressedFiles.forEach((file) => {
          if (file.compressedBlob) {
            const originalName = file.name.replace(/\.[^/.]+$/, "");
            const extension = file.name.split(".").pop();
            zip.file(`ousa_compressed_${originalName}.${extension}`, file.compressedBlob);
          }
        });
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(zipBlob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = `ousa_compressed_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.zip`;
        (void 0).body.appendChild(a);
        a.click();
        (void 0).body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (error) {
        console.error("ZIP error:", error);
        this.showError("Download failed", "Could not create ZIP");
      }
    },
    clearSession() {
      this.files.forEach((file) => this.cleanupFileBlobs(file));
      this.files = [];
      this.progress = 0;
      this.totalProcessed = 0;
      this.totalSaved = 0;
      this.compressionQueue = [];
      this.activeCompressions = 0;
      this.isProcessing = false;
    },
    // UTILITIES
    getStatusText(status) {
      const map = {
        pending: "Ready",
        processing: "Processing...",
        compressed: "Complete",
        error: "Failed"
      };
      return map[status] || "Ready";
    },
    truncateFileName(fileName, maxLength = 25) {
      if (fileName.length <= maxLength) return fileName;
      const ext = fileName.split(".").pop();
      const name = fileName.substring(0, fileName.lastIndexOf("."));
      return name.substring(0, maxLength - ext.length - 4) + "..." + ext;
    },
    formatSize(bytes) {
      if (!bytes || bytes === 0) return "0 B";
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return Math.round(bytes / Math.pow(1024, i) * 10) / 10 + " " + sizes[i];
    },
    showError(title, message) {
      this.error = { title, message };
      setTimeout(() => {
        this.error = null;
      }, 5e3);
    }
  },
  beforeDestroy() {
    this.files.forEach((file) => this.cleanupFileBlobs(file));
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "compressor-container" }, _attrs))} data-v-88aae8fb><div class="header" data-v-88aae8fb><div class="header-content" data-v-88aae8fb><div class="header-text" data-v-88aae8fb><h1 data-v-88aae8fb>\u2728 Smart Compress 100MP+</h1><p data-v-88aae8fb>Optimized for ultra-high resolution images &amp; PDFs</p></div>`);
  if ($data.files.length > 0) {
    _push(`<button class="clear-session-btn" data-v-88aae8fb><span data-v-88aae8fb>\u{1F5D1}\uFE0F</span><span data-v-88aae8fb>Clear All</span></button>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="main-content" data-v-88aae8fb><div class="left-panel" data-v-88aae8fb><div class="upload-section" data-v-88aae8fb><div class="${ssrRenderClass([{ dragover: $data.isDragOver }, "drop-zone"])}" data-v-88aae8fb><div class="drop-icon" data-v-88aae8fb>\u{1F4F8}</div><div class="drop-text" data-v-88aae8fb>Drop images or PDFs here</div><div class="drop-subtext" data-v-88aae8fb>JPG, PNG, PDF \u2022 Up to 100MP/500MB each</div><div class="upload-actions" data-v-88aae8fb><button class="btn btn-primary" data-v-88aae8fb><span data-v-88aae8fb>\u{1F4C1}</span><span data-v-88aae8fb>Browse Files</span></button></div></div><input type="file" class="file-input" accept="image/*,application/pdf" multiple data-v-88aae8fb></div><div class="settings-panel" data-v-88aae8fb><div class="settings-title" data-v-88aae8fb>Compression Settings</div><div class="setting-item" data-v-88aae8fb><div class="setting-label" data-v-88aae8fb>Mode</div><div class="setting-control" data-v-88aae8fb><label class="radio-label" data-v-88aae8fb><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.compressionMode, "adaptive")) ? " checked" : ""} type="radio" value="adaptive" data-v-88aae8fb><span data-v-88aae8fb>Adaptive (Smart)</span></label><label class="radio-label" data-v-88aae8fb><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.compressionMode, "manual")) ? " checked" : ""} type="radio" value="manual" data-v-88aae8fb><span data-v-88aae8fb>Manual</span></label></div></div>`);
  if ($data.compressionMode === "manual") {
    _push(`<div class="setting-item" data-v-88aae8fb><div class="setting-label" data-v-88aae8fb>Quality</div><div class="setting-control" data-v-88aae8fb><input${ssrRenderAttr("value", $data.quality)} type="range" class="quality-slider" min="10" max="100" data-v-88aae8fb><div class="quality-value" data-v-88aae8fb>${ssrInterpolate($data.quality)}%</div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.compressionMode === "adaptive") {
    _push(`<div class="adaptive-info" data-v-88aae8fb><p data-v-88aae8fb>\u{1F916} Auto quality based on image resolution</p></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`<div class="setting-item" data-v-88aae8fb><div class="setting-label" data-v-88aae8fb>Size</div><div class="setting-control setting-control-column" data-v-88aae8fb><label class="radio-label" data-v-88aae8fb><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.resizeMode, "original")) ? " checked" : ""} type="radio" value="original" data-v-88aae8fb><span data-v-88aae8fb>Original</span></label><label class="radio-label" data-v-88aae8fb><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.resizeMode, "2000px")) ? " checked" : ""} type="radio" value="2000px" data-v-88aae8fb><span data-v-88aae8fb>2000px max</span></label><label class="radio-label" data-v-88aae8fb><input${ssrIncludeBooleanAttr(ssrLooseEqual($data.resizeMode, "1000px")) ? " checked" : ""} type="radio" value="1000px" data-v-88aae8fb><span data-v-88aae8fb>1000px max</span></label></div></div><div class="dimensions-info" data-v-88aae8fb><div class="info-item" data-v-88aae8fb>\u{1F4CF} ${ssrInterpolate($data.resizeMode === "original" ? "Original dimensions preserved" : "Images resized to fit " + $data.resizeMode + " max")}</div><div class="info-item" data-v-88aae8fb>\u{1F4BE} Optimized for 100MP+</div></div></div></div><div class="right-panel" data-v-88aae8fb>`);
  if ($data.files.length === 0) {
    _push(`<div class="empty-state" data-v-88aae8fb><div class="empty-state-icon" data-v-88aae8fb>\u{1F4F8}</div><div class="empty-state-title" data-v-88aae8fb>Ready for 100MP images &amp; PDFs</div><div class="empty-state-description" data-v-88aae8fb> This compressor handles ultra-high resolution images and PDF documents efficiently </div><div class="empty-state-features" data-v-88aae8fb><div class="feature-item" data-v-88aae8fb>\u26A1 Streaming compression</div><div class="feature-item" data-v-88aae8fb>\u{1F9E0} Smart memory management</div><div class="feature-item" data-v-88aae8fb>\u{1F3AF} Adaptive quality</div><div class="feature-item" data-v-88aae8fb>\u23F1\uFE0F Progress tracking</div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($data.files.length > 0) {
    _push(`<div class="file-list show" data-v-88aae8fb><div class="file-list-header" data-v-88aae8fb><div class="file-list-title" data-v-88aae8fb>Selected Images</div><div class="file-count" data-v-88aae8fb>${ssrInterpolate($data.files.length)} file${ssrInterpolate($data.files.length !== 1 ? "s" : "")}</div></div><div class="file-items-container" data-v-88aae8fb><!--[-->`);
    ssrRenderList($data.files, (file, index) => {
      _push(`<div class="${ssrRenderClass([file.status, "file-item"])}" data-v-88aae8fb><div class="file-preview" data-v-88aae8fb>`);
      if (file.previewUrl) {
        _push(`<img${ssrRenderAttr("src", file.previewUrl)}${ssrRenderAttr("alt", file.name)} class="preview-image" data-v-88aae8fb>`);
      } else if (file.isPDF) {
        _push(`<span class="file-type-icon" data-v-88aae8fb>\u{1F4C4}</span>`);
      } else {
        _push(`<span data-v-88aae8fb>\u{1F5BC}\uFE0F</span>`);
      }
      _push(`</div><div class="file-info" data-v-88aae8fb><div class="file-name"${ssrRenderAttr("title", file.name)} data-v-88aae8fb>${ssrInterpolate($options.truncateFileName(file.name))}</div><div class="file-meta" data-v-88aae8fb><div class="file-size" data-v-88aae8fb>${ssrInterpolate($options.formatSize(file.size))} `);
      if (file.compressedSize) {
        _push(`<span data-v-88aae8fb> \u2192 ${ssrInterpolate($options.formatSize(file.compressedSize))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (file.metadata && !file.isPDF) {
        _push(`<div class="file-metadata" data-v-88aae8fb><span class="megapixels" data-v-88aae8fb>${ssrInterpolate(file.metadata.megapixels.toFixed(1))}MP</span><span class="dimensions" data-v-88aae8fb>${ssrInterpolate(file.metadata.width)}\xD7${ssrInterpolate(file.metadata.height)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (file.isPDF) {
        _push(`<div class="file-metadata" data-v-88aae8fb><span class="file-type-badge" data-v-88aae8fb>PDF</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (file.status === "processing") {
        _push(`<div class="processing-info" data-v-88aae8fb><span class="status-dot" data-v-88aae8fb></span> Processing... </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="file-actions" data-v-88aae8fb>`);
      if (file.status === "compressed") {
        _push(`<button class="btn btn-secondary" title="Download" data-v-88aae8fb> \u2B07 </button>`);
      } else {
        _push(`<button class="btn btn-secondary" title="Remove" data-v-88aae8fb> \u{1F5D1}\uFE0F </button>`);
      }
      _push(`</div><div class="${ssrRenderClass([file.status, "file-status"])}" data-v-88aae8fb>${ssrInterpolate($options.getStatusText(file.status))}</div></div>`);
    });
    _push(`<!--]--></div></div>`);
  } else {
    _push(`<!---->`);
  }
  if ($options.compressedCount > 0) {
    _push(`<div class="download-options show" data-v-88aae8fb><div class="download-header" data-v-88aae8fb><div class="download-title" data-v-88aae8fb>\u{1F389} Complete!</div><div class="download-summary" data-v-88aae8fb>${ssrInterpolate($options.compressedCount)} images ready</div><div class="space-saved" data-v-88aae8fb>Saved ${ssrInterpolate($options.formatSize($data.totalSaved))}</div></div><div class="download-actions-grid" data-v-88aae8fb><div class="download-option" data-v-88aae8fb><div class="download-option-icon" data-v-88aae8fb>\u{1F4E6}</div><div class="download-option-title" data-v-88aae8fb>ZIP Archive</div></div><div class="download-option" data-v-88aae8fb><div class="download-option-icon" data-v-88aae8fb>\u2B07</div><div class="download-option-title" data-v-88aae8fb>Download All</div></div></div></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div></div><div class="action-bar" data-v-88aae8fb><button class="main-action"${ssrIncludeBooleanAttr($data.files.length === 0 || $data.isProcessing) ? " disabled" : ""} data-v-88aae8fb><span class="${ssrRenderClass([{ "processing": $data.isProcessing }, "action-icon"])}" data-v-88aae8fb>\u26A1</span><span data-v-88aae8fb>${ssrInterpolate($data.isProcessing ? `Compressing (${Math.round($data.progress)}%)` : "Compress Images")}</span></button></div><div class="global-progress" data-v-88aae8fb><div class="global-progress-fill" style="${ssrRenderStyle({ width: $data.progress + "%" })}" data-v-88aae8fb></div></div><div class="stats-footer" data-v-88aae8fb><div class="stat-item" data-v-88aae8fb><div class="stat-label" data-v-88aae8fb>Files</div><div class="stat-number" data-v-88aae8fb>${ssrInterpolate($data.totalProcessed)}</div></div><div class="stat-item" data-v-88aae8fb><div class="stat-label" data-v-88aae8fb>Saved</div><div class="stat-number" data-v-88aae8fb>${ssrInterpolate($options.formatSize($data.totalSaved))}</div></div><div class="stat-item" data-v-88aae8fb><div class="stat-label" data-v-88aae8fb>Reduction</div><div class="stat-number" data-v-88aae8fb>${ssrInterpolate($options.avgReduction)}%</div></div></div>`);
  if ($data.error) {
    _push(`<div class="error-message show" data-v-88aae8fb><div class="error-content" data-v-88aae8fb><div class="error-title" data-v-88aae8fb>${ssrInterpolate($data.error.title)}</div><div class="error-desc" data-v-88aae8fb>${ssrInterpolate($data.error.message)}</div></div><button class="btn btn-secondary" data-v-88aae8fb>Dismiss</button></div>`);
  } else {
    _push(`<!---->`);
  }
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/compressor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const compressor = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender], ["__scopeId", "data-v-88aae8fb"]]);

export { compressor as default };
//# sourceMappingURL=compressor-PCBdMQOx.mjs.map
