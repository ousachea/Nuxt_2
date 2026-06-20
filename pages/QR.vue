<template>
  <div class="container">
    <div class="scanner-card">

      <header class="header">
        <span class="title">🇰🇭 KHQR</span>
        <span class="header-sub">Studio</span>
        <div v-if="qrResult" class="nav-copy-field">
          <input readonly :value="qrResult" class="nav-copy-input" @click="$event.target.select()" />
          <button @click="copyToClipboard" class="nav-copy-btn">{{ copyText }}</button>
        </div>
        <button class="ref-trigger" @click="showRef = true">Reference</button>
      </header>

      <!-- Reference Popup -->
      <transition name="ref-fade">
        <div v-if="showRef" class="ref-overlay" @click.self="showRef = false">
          <div class="ref-drawer">
            <div class="ref-drawer-header">
              <span class="ref-drawer-title">Reference</span>
              <button class="ref-close" @click="showRef = false">✕</button>
            </div>
            <div class="ref-drawer-body">
              <div class="reference-section">
                <h3 class="reference-title">Banks</h3>
                <div class="reference-grid">
                  <div class="reference-item" v-for="bank in cambodianBanks" :key="bank">
                    <span class="bank-name">{{ bank }}</span>
                  </div>
                </div>
              </div>
              <div class="reference-section">
                <h3 class="reference-title">Tags</h3>
                <div class="tag-definitions">
                  <div class="tag-def"><span class="tag-code">00</span><span class="tag-desc">Payload Format Indicator</span></div>
                  <div class="tag-def"><span class="tag-code">29</span><span class="tag-desc">Remittance (personal)</span></div>
                  <div class="tag-def"><span class="tag-code">30</span><span class="tag-desc">Merchant Info (business)</span></div>
                  <div class="tag-def"><span class="tag-code">51</span><span class="tag-desc">Acquirer Merchant ID</span></div>
                  <div class="tag-def"><span class="tag-code">52</span><span class="tag-desc">MCC – Business type</span></div>
                  <div class="tag-def"><span class="tag-code">53</span><span class="tag-desc">Currency (840=USD, 116=KHR)</span></div>
                  <div class="tag-def"><span class="tag-code">54</span><span class="tag-desc">Payment Amount</span></div>
                  <div class="tag-def"><span class="tag-code">58</span><span class="tag-desc">Country Code (KH)</span></div>
                  <div class="tag-def"><span class="tag-code">59</span><span class="tag-desc">Merchant Name</span></div>
                  <div class="tag-def"><span class="tag-code">60</span><span class="tag-desc">Merchant City</span></div>
                  <div class="tag-def"><span class="tag-code">62</span><span class="tag-desc">Additional Data</span></div>
                  <div class="tag-def"><span class="tag-code">63</span><span class="tag-desc">CRC-16 Checksum</span></div>
                  <div class="tag-def"><span class="tag-code">99</span><span class="tag-desc">Timestamp</span></div>
                </div>
              </div>
              <div class="reference-section">
                <h3 class="reference-title">MCC Codes</h3>
                <div class="mcc-search">
                  <input v-model="mccSearchFilter" type="text" placeholder="Search MCC..." class="mcc-search-input">
                </div>
                <div class="mcc-list">
                  <div class="mcc-item" v-for="(desc, code) in filteredMCCMap" :key="code">
                    <span class="mcc-code">{{ code }}</span>
                    <span class="mcc-desc">{{ desc }}</span>
                  </div>
                </div>
              </div>
              <div class="reference-section">
                <h3 class="reference-title">Currencies</h3>
                <div class="currency-grid">
                  <div class="currency-item">
                    <span class="curr-code">840</span><span class="curr-name">USD</span>
                  </div>
                  <div class="currency-item">
                    <span class="curr-code">116</span><span class="curr-name">KHR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <div class="tab-content">
        <div class="builder-layout">

          <!-- Left Panel -->
          <aside class="builder-left">
            <div class="paste-mode">
              <div class="sample-selector">
                <label class="sample-label">Sample</label>
                <select @change="loadSampleData" class="sample-select">
                  <option value="">— Select —</option>
                  <option v-for="sample in sampleDataOptions" :key="sample.name" :value="sample.data">
                    {{ sample.name }}
                  </option>
                </select>
              </div>
              <textarea v-model="manualQRInput" @paste="handlePaste"
                placeholder="Paste KHQR string here..." class="input-field"></textarea>
              <div class="action-buttons">
                <button @click="pasteFromClipboard" class="btn btn-primary">Paste</button>
                <button @click="clearAll" class="btn btn-ghost">Clear</button>
              </div>
            </div>

          </aside>

          <!-- Right Panel -->
          <main class="builder-right">

            <div v-if="generatedQRImage" class="qr-output-section">
              <div class="qr-preview-box">
                <img :src="generatedQRImage" alt="QR Code" class="qr-preview-img" />
              </div>
              <div class="gen-dl">
                <select v-model="downloadFormat" class="gen-dl-select">
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                  <option value="jpg">JPG</option>
                </select>
                <button @click="downloadQRCode" class="btn btn-primary">↓ Image</button>
              </div>
            </div>
            <div v-else class="qr-placeholder">
              <div class="qr-placeholder-icon">⬜</div>
              <p>Build or paste a KHQR to preview</p>
            </div>

            <div v-if="qrResult" class="gen-raw">
              <div class="gen-raw-header">
                <span>KHQR String</span>
                <button @click="copyToClipboard" class="gen-copy-btn">{{ copyText }}</button>
              </div>
              <pre class="gen-raw-content">{{ qrResult }}</pre>
            </div>

            <div v-if="qrResult" class="result-section">
              <div v-if="!headerInfo.merchantCategoryTag" class="mcc-warning-alert">
                <span class="mcc-warning-icon">⚠️</span>
                <div class="mcc-warning-content">
                  <span class="mcc-warning-title">MCC Not Found</span>
                  <span class="mcc-warning-desc">Tag 52 is missing. Add MCC for complete merchant classification.</span>
                </div>
                <button @click="toggleEditMode" class="mcc-warning-btn">Add MCC</button>
              </div>

              <div class="summary-card">
                <div class="summary-item">
                  <span class="summary-label">Merchant</span>
                  <span class="summary-value">{{ headerInfo.merchantNameTag?.value || '—' }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Amount</span>
                  <span class="summary-value">{{ headerInfo.amountTag?.value ? headerInfo.amountTag.value + ' ' + (headerInfo.currencyTag?.value === '840' ? 'USD' : 'KHR') : '—' }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">MCC</span>
                  <span class="summary-value">
                    <span v-if="headerInfo.merchantCategoryTag" class="mcc-badge mcc-badge-present">✓ {{ headerInfo.merchantCategoryTag.value }}</span>
                    <span v-else class="mcc-badge mcc-badge-missing">✗ Missing</span>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Expiry</span>
                  <span class="summary-value">
                    <span v-if="headerInfo.timestampNested?.['01']" :class="getTimestampBadgeClass()">{{ getTimestampStatus() }}</span>
                    <span v-else class="ts-badge ts-badge-none">—</span>
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Size</span>
                  <span class="summary-value">{{ qrResult.length }} B · {{ Object.keys(parsedTLV).length }} tags</span>
                </div>
              </div>

              <div class="result-header">
                <h2>TLV Structure</h2>
                <div class="header-buttons">
                  <button v-if="editMode" @click="applyInlineEdits" class="copy-btn edit-apply-btn">✓ Apply</button>
                  <button @click="toggleEditMode" class="copy-btn" :class="{ 'edit-active': editMode }">
                    {{ editMode ? '✕ Cancel' : 'Edit' }}
                  </button>
                  <button v-if="!editMode" @click="copyToClipboard" class="copy-btn">{{ copyText }}</button>
                  <div v-if="!editMode" class="tlv-dl-group">
                    <select v-model="tlvDownloadFormat" class="tlv-dl-select">
                      <option value="json">JSON</option>
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                    </select>
                    <button @click="downloadTLV" class="copy-btn tlv-dl-btn">↓</button>
                  </div>
                </div>
              </div>

              <div class="tlv-tree">
                <div class="tree-item" v-if="parsedTLV['00']">
                  <span class="tree-tag">{{ parsedTLV['00'].tag }}</span>
                  <span class="tree-length">{{ String(parsedTLV['00'].length).padStart(2, '0') }}</span>
                  <span class="tree-data">{{ parsedTLV['00'].value }}</span>
                  <span class="tree-meaning">Version</span>
                </div>

                <div class="tree-item" v-if="parsedTLV['01']">
                  <span class="tree-tag">{{ parsedTLV['01'].tag }}</span>
                  <span class="tree-length">{{ String((parsedTLV['01'].value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input tree-edit-input--short" v-model="parsedTLV['01'].value">
                  <span v-else class="tree-data">{{ parsedTLV['01'].value }}</span>
                  <span class="tree-meaning">{{ getInitiationMethodDescription(parsedTLV['01'].value) }}</span>
                </div>

                <div class="tree-item tree-parent" v-if="headerInfo.tag29">
                  <span class="tree-tag">29</span>
                  <span class="tree-length">{{ formatLength(headerInfo.tag29.length) }}</span>
                  <span class="tree-meaning">Remittance</span>
                  <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag29Nested).length > 0">
                    <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['00']">
                      <span class="tree-tag">00</span><span class="tree-length">{{ String((headerInfo.tag29Nested['00'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag29Nested['00'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag29Nested['00'].value }}</span>
                      <span class="tree-meaning">Bakong ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['01']">
                      <span class="tree-tag">01</span><span class="tree-length">{{ String((headerInfo.tag29Nested['01'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag29Nested['01'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag29Nested['01'].value }}</span>
                      <span class="tree-meaning">Merchant ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['02']">
                      <span class="tree-tag">02</span><span class="tree-length">{{ String((headerInfo.tag29Nested['02'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag29Nested['02'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag29Nested['02'].value }}</span>
                      <span class="tree-meaning">Bank Name</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['10']">
                      <span class="tree-tag">10</span><span class="tree-length">{{ String((headerInfo.tag29Nested['10'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag29Nested['10'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag29Nested['10'].value }}</span>
                      <span class="tree-meaning">Account Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['11']">
                      <span class="tree-tag">11</span><span class="tree-length">{{ String((headerInfo.tag29Nested['11'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag29Nested['11'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag29Nested['11'].value }}</span>
                      <span class="tree-meaning">Reference Number</span>
                    </div>
                  </div>
                </div>

                <div class="tree-item tree-parent" v-if="headerInfo.tag30">
                  <span class="tree-tag">30</span>
                  <span class="tree-length">{{ formatLength(headerInfo.tag30.length) }}</span>
                  <span class="tree-meaning">Merchant Info</span>
                  <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag30Nested).length > 0">
                    <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['00']">
                      <span class="tree-tag">00</span><span class="tree-length">{{ String((headerInfo.tag30Nested['00'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag30Nested['00'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag30Nested['00'].value }}</span>
                      <span class="tree-meaning">Bakong ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['01']">
                      <span class="tree-tag">01</span><span class="tree-length">{{ String((headerInfo.tag30Nested['01'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag30Nested['01'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag30Nested['01'].value }}</span>
                      <span class="tree-meaning">Merchant ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['02']">
                      <span class="tree-tag">02</span><span class="tree-length">{{ String((headerInfo.tag30Nested['02'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag30Nested['02'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag30Nested['02'].value }}</span>
                      <span class="tree-meaning">Bank Name</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['10']">
                      <span class="tree-tag">10</span><span class="tree-length">{{ String((headerInfo.tag30Nested['10'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag30Nested['10'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag30Nested['10'].value }}</span>
                      <span class="tree-meaning">Account Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['11']">
                      <span class="tree-tag">11</span><span class="tree-length">{{ String((headerInfo.tag30Nested['11'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag30Nested['11'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag30Nested['11'].value }}</span>
                      <span class="tree-meaning">Reference Number</span>
                    </div>
                  </div>
                </div>

                <div class="tree-item tree-parent" v-if="headerInfo.bankInfoTag">
                  <span class="tree-tag">51</span>
                  <span class="tree-length">{{ formatLength(headerInfo.bankInfoTag.length) }}</span>
                  <span class="tree-meaning">Bank Info</span>
                  <div class="tree-sublayer" v-if="Object.keys(headerInfo.bankInfoNested).length > 0">
                    <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['00']">
                      <span class="tree-tag">00</span><span class="tree-length">{{ String((headerInfo.bankInfoNested['00'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.bankInfoNested['00'].value">
                      <span v-else class="tree-data">{{ headerInfo.bankInfoNested['00'].value }}</span>
                      <span class="tree-meaning">Bakong ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['01']">
                      <span class="tree-tag">01</span><span class="tree-length">{{ String((headerInfo.bankInfoNested['01'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.bankInfoNested['01'].value">
                      <span v-else class="tree-data">{{ headerInfo.bankInfoNested['01'].value }}</span>
                      <span class="tree-meaning">Merchant ID</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['02']">
                      <span class="tree-tag">02</span><span class="tree-length">{{ String((headerInfo.bankInfoNested['02'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.bankInfoNested['02'].value">
                      <span v-else class="tree-data">{{ headerInfo.bankInfoNested['02'].value }}</span>
                      <span class="tree-meaning">Bank Name</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['10']">
                      <span class="tree-tag">10</span><span class="tree-length">{{ String((headerInfo.bankInfoNested['10'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.bankInfoNested['10'].value">
                      <span v-else class="tree-data">{{ headerInfo.bankInfoNested['10'].value }}</span>
                      <span class="tree-meaning">Account Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['11']">
                      <span class="tree-tag">11</span><span class="tree-length">{{ String((headerInfo.bankInfoNested['11'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.bankInfoNested['11'].value">
                      <span v-else class="tree-data">{{ headerInfo.bankInfoNested['11'].value }}</span>
                      <span class="tree-meaning">Reference Number</span>
                    </div>
                  </div>
                </div>

                <div class="tree-item" v-if="headerInfo.merchantCategoryTag" :class="{ 'mcc-tag-present': headerInfo.merchantCategoryTag }">
                  <span class="tree-tag mcc-tag-highlight">52</span>
                  <span class="tree-length">{{ String((headerInfo.merchantCategoryTag.value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input tree-edit-input--short" v-model="headerInfo.merchantCategoryTag.value">
                  <span v-else class="tree-data">{{ headerInfo.merchantCategoryTag.value }}</span>
                  <span class="tree-meaning">{{ getMerchantCategoryDescription(headerInfo.merchantCategoryTag.value) }}</span>
                  <span class="mcc-indicator" v-if="!editMode">MCC ✓</span>
                </div>

                <div class="tree-item" v-if="headerInfo.currencyTag">
                  <span class="tree-tag">53</span>
                  <span class="tree-length">{{ String((headerInfo.currencyTag.value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input tree-edit-input--short" v-model="headerInfo.currencyTag.value">
                  <span v-else class="tree-data">{{ headerInfo.currencyTag.value }}</span>
                  <span class="tree-meaning">{{ getCurrencyDescription(headerInfo.currencyTag.value) }}</span>
                </div>

                <div class="tree-item" v-if="headerInfo.amountTag">
                  <span class="tree-tag">54</span>
                  <span class="tree-length">{{ String((headerInfo.amountTag.value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.amountTag.value">
                  <span v-else class="tree-data">{{ headerInfo.amountTag.value }}</span>
                  <span class="tree-meaning">Amount</span>
                </div>

                <div class="tree-item" v-if="headerInfo.countryTag">
                  <span class="tree-tag">58</span>
                  <span class="tree-length">{{ formatLength(headerInfo.countryTag.length) }}</span>
                  <span class="tree-data">{{ headerInfo.countryTag.value }}</span>
                  <span class="tree-meaning">{{ getCountryDescription(headerInfo.countryTag.value) }}</span>
                </div>

                <div class="tree-item" v-if="headerInfo.merchantNameTag">
                  <span class="tree-tag">59</span>
                  <span class="tree-length">{{ String((headerInfo.merchantNameTag.value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.merchantNameTag.value">
                  <span v-else class="tree-data">{{ headerInfo.merchantNameTag.value }}</span>
                  <span class="tree-meaning">Merchant Name</span>
                </div>

                <div class="tree-item" v-if="headerInfo.merchantCityTag">
                  <span class="tree-tag">60</span>
                  <span class="tree-length">{{ String((headerInfo.merchantCityTag.value||'').length).padStart(2,'0') }}</span>
                  <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.merchantCityTag.value">
                  <span v-else class="tree-data">{{ headerInfo.merchantCityTag.value }}</span>
                  <span class="tree-meaning">Merchant City</span>
                </div>

                <div class="tree-item tree-parent" v-if="parsedTLV['62']">
                  <span class="tree-tag">62</span>
                  <span class="tree-length">{{ formatLength(parsedTLV['62'].length) }}</span>
                  <span class="tree-meaning">Additional Data</span>
                  <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag62Nested).length > 0">
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['01']">
                      <span class="tree-tag">01</span><span class="tree-length">{{ String((headerInfo.tag62Nested['01'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['01'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['01'].value }}</span>
                      <span class="tree-meaning">Bill Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['02']">
                      <span class="tree-tag">02</span><span class="tree-length">{{ String((headerInfo.tag62Nested['02'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['02'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['02'].value }}</span>
                      <span class="tree-meaning">Mobile Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['03']">
                      <span class="tree-tag">03</span><span class="tree-length">{{ String((headerInfo.tag62Nested['03'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['03'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['03'].value }}</span>
                      <span class="tree-meaning">Store Label</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['04']">
                      <span class="tree-tag">04</span><span class="tree-length">{{ String((headerInfo.tag62Nested['04'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['04'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['04'].value }}</span>
                      <span class="tree-meaning">Loyalty Number</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['05']">
                      <span class="tree-tag">05</span><span class="tree-length">{{ String((headerInfo.tag62Nested['05'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['05'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['05'].value }}</span>
                      <span class="tree-meaning">Reference Label</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['06']">
                      <span class="tree-tag">06</span><span class="tree-length">{{ String((headerInfo.tag62Nested['06'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['06'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['06'].value }}</span>
                      <span class="tree-meaning">Customer Label</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['07']">
                      <span class="tree-tag">07</span><span class="tree-length">{{ String((headerInfo.tag62Nested['07'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['07'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['07'].value }}</span>
                      <span class="tree-meaning">Terminal Label</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['08']">
                      <span class="tree-tag">08</span><span class="tree-length">{{ String((headerInfo.tag62Nested['08'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['08'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['08'].value }}</span>
                      <span class="tree-meaning">Purpose of Transaction</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['09']">
                      <span class="tree-tag">09</span><span class="tree-length">{{ String((headerInfo.tag62Nested['09'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" class="tree-edit-input" v-model="headerInfo.tag62Nested['09'].value">
                      <span v-else class="tree-data">{{ headerInfo.tag62Nested['09'].value }}</span>
                      <span class="tree-meaning">Consumer Data Request</span>
                    </div>
                    <!-- Payment system specific templates (sub-tags 50–99) -->
                    <template v-for="(subtagData, subtag) in headerInfo.tag62Nested" :key="'tag62ps-' + subtag">
                      <div class="tree-subitem-line tree-subitem-parent" v-if="parseInt(subtag) >= 50 && parseInt(subtag) <= 99">
                        <span class="tree-tag">{{ subtag }}</span>
                        <span class="tree-length">{{ String((subtagData.value||'').length).padStart(2,'0') }}</span>
                        <span class="tree-meaning">Payment System Template</span>
                        <div class="tree-sublayer tree-sublayer--deep" v-if="headerInfo.tag62PaymentSystemNested[subtag]">
                          <div class="tree-subitem-line"
                            v-for="(ssd, sst) in headerInfo.tag62PaymentSystemNested[subtag]"
                            :key="'tag62pay-' + subtag + '-' + sst">
                            <span class="tree-tag">{{ sst }}</span>
                            <span class="tree-length">{{ String((ssd.value||'').length).padStart(2,'0') }}</span>
                            <span class="tree-data">{{ ssd.value }}</span>
                            <span class="tree-meaning">{{ getTag62PaymentSubtagMeaning(sst) }}</span>
                          </div>
                        </div>
                      </div>
                    </template>
                    <!-- Unknown sub-tags (not 01–09, not 50–99) -->
                    <template v-for="(subtagData, subtag) in headerInfo.tag62Nested" :key="'tag62unk-' + subtag">
                      <div class="tree-subitem-line" v-if="!['01','02','03','04','05','06','07','08','09'].includes(subtag) && !(parseInt(subtag) >= 50 && parseInt(subtag) <= 99)">
                        <span class="tree-tag">{{ subtag }}</span>
                        <span class="tree-length">{{ String((subtagData.value||'').length).padStart(2,'0') }}</span>
                        <input v-if="editMode" class="tree-edit-input" v-model="subtagData.value">
                        <span v-else class="tree-data">{{ subtagData.value }}</span>
                        <span class="tree-meaning">Additional Info</span>
                      </div>
                    </template>
                  </div>
                </div>

                <div class="tree-item tree-parent" v-if="headerInfo.timestampTag" :class="getTimestampStatusClass()">
                  <span class="tree-tag">99</span>
                  <span class="tree-length">{{ formatLength(headerInfo.timestampTag.length) }}</span>
                  <span class="tree-meaning">Timestamp</span>
                  <span class="ts-tree-indicator">{{ getTimestampStatus() }}</span>
                  <button v-if="editMode" class="ts-now-btn" @click="setTimestampNow">Now / +1d</button>
                  <div class="tree-sublayer" v-if="Object.keys(headerInfo.timestampNested).length > 0">
                    <div class="tree-subitem-line" v-if="headerInfo.timestampNested['00']">
                      <span class="tree-tag">00</span>
                      <span class="tree-length">{{ String((headerInfo.timestampNested['00'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" type="datetime-local"
                        class="tree-edit-input tree-edit-input--dt"
                        :value="msToDatetimeLocal(headerInfo.timestampNested['00'].value)"
                        @change="headerInfo.timestampNested['00'].value = String(datetimeLocalToMs($event.target.value))">
                      <span v-else class="tree-data">{{ headerInfo.timestampNested['00'].value }}</span>
                      <span class="tree-meaning">Create Time</span>
                    </div>
                    <div class="tree-subitem-conversion" v-if="headerInfo.timestampNested['00']"
                      :class="{ 'timestamp-expired': isTimestampExpired(headerInfo.timestampNested['00'].value) }">
                      <span class="tree-meaning">→ {{ getTimestampReadableWithoutExpired(headerInfo.timestampNested['00'].value) }}</span>
                    </div>
                    <div class="tree-subitem-line" v-if="headerInfo.timestampNested['01']">
                      <span class="tree-tag">01</span>
                      <span class="tree-length">{{ String((headerInfo.timestampNested['01'].value||'').length).padStart(2,'0') }}</span>
                      <input v-if="editMode" type="datetime-local"
                        class="tree-edit-input tree-edit-input--dt"
                        :value="msToDatetimeLocal(headerInfo.timestampNested['01'].value)"
                        @change="headerInfo.timestampNested['01'].value = String(datetimeLocalToMs($event.target.value))">
                      <span v-else class="tree-data">{{ headerInfo.timestampNested['01'].value }}</span>
                      <span class="tree-meaning">Expiry Time</span>
                    </div>
                    <div class="tree-subitem-conversion" v-if="headerInfo.timestampNested['01']"
                      :class="{ 'timestamp-expired': isTimestampExpired(headerInfo.timestampNested['01'].value), 'timestamp-valid': !isTimestampExpired(headerInfo.timestampNested['01'].value) }">
                      <span class="tree-meaning">→ {{ getTimestampReadableWithoutExpired(headerInfo.timestampNested['01'].value) }}</span>
                    </div>
                  </div>
                </div>

                <div class="tree-item" v-if="parsedTLV['63']" :class="{ 'checksum-valid': !editMode && validateChecksum(qrResult) === true }">
                  <span class="tree-tag">63</span>
                  <span class="tree-length">04</span>
                  <span v-if="editMode" class="tree-data crc-pending">— recalculated on apply</span>
                  <span v-else class="tree-data">{{ parsedTLV['63'].value }}</span>
                  <span class="tree-meaning">CRC-16/IBM-3740</span>
                </div>
              </div>
            </div>

          </main>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import QrScanner from 'qr-scanner';
import QRCode from 'qrcode';

export default {
  data() {
    return {
      qrResult: '',
      headerInfo: {
        bankInfoNested: {},
        timestampNested: {},
        tag29Nested: {},
        tag30Nested: {},
        tag62Nested: {},
        tag62PaymentSystemNested: {},
      },
      parsedTLV: {},
      manualQRInput: '00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6',
      copyText: 'Copy',
      generatedQRImage: null,
      qrDataToGenerate: '',
      editMode: false,
      originalQRResult: null,
      mccSearchInput: '',
      downloadFormat: 'svg',
      tlvDownloadFormat: 'json',
      cambodianBanks: [
        'ABA Bank',
        'Canadia Bank',
        'ACLEDA Bank',
        'Chip Mong Bank',
        'Phnom Penh Commercial Bank',
        'Wing Bank',
        'Metfone Bank',
        'Campu Bank',
        'Sabay Bank',
      ],
      mccSearchFilter: '',
      showRef: false,
      sampleDataOptions: [
        {
          name: 'Static Merchant',
          data: '00020101021130510016abaakhppxxx@abaa01151211209110909710208ABA Bank5204739253031165802KH5919Ousa Chea by O.CHEA6010PHNOM PENH624068360010PAYWAY@ABA01061894950208031956116304098B',
        },
        {
          name: 'Dynamic Merchant',
          data: '00020101021230510016abaakhppxxx@abaa01151211209110909710208ABA Bank52047392530384054049.995802KH5919Ousa Chea by O.CHEA6010PHNOM PENH626368590010PAYWAY@ABA01061894950208031956110619BD2F18438007825964Z9934001317651843800780113176518468007863046CBB',
        },
        {
          name: 'Static Remittance',
          data: '00020101021129810016cadikhppxxx@cadi010712814460212Canadia Bank10130010007018873111300100070281515204000053031165802KH5909Sok Sabay6010Phnom Penh62200816Pay to my friend6304290E',
        },
        {
          name: 'Dynamic Remittance',
          data: '00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6',
        },
      ],
      currencyCodeMap: {
        '840': 'US Dollar (USD)',
        '116': 'Cambodian Riel (KHR)',
        '978': 'Euro (EUR)',
        '036': 'Australian Dollar (AUD)',
        '826': 'British Pound (GBP)',
        '392': 'Japanese Yen (JPY)',
        '156': 'Chinese Yuan (CNY)',
        '360': 'Indonesian Rupiah (IDR)',
        '458': 'Malaysian Ringgit (MYR)',
        '608': 'Philippine Peso (PHP)',
        '702': 'Singapore Dollar (SGD)',
        '764': 'Thai Baht (THB)',
        '704': 'Vietnamese Dong (VND)',
      },
      merchantCategoryMap: {
        '0742': 'Veterinary Services',
        '0743': 'Wine Producers',
        '0744': 'Champagne Producers',
        '0763': 'Agricultural Co-operatives',
        '0780': 'Landscaping and Horticultural Services',
        '1520': 'General Contractors - Residential and Commercial',
        '1711': 'Heating, Plumbing and Air-Conditioning Contractors',
        '1731': 'Electrical Contractors',
        '1740': 'Masonry, Stonework, Tile Setting Contractors',
        '1750': 'Carpentry Contractors',
        '1761': 'Roofing, Siding and Sheet Metal Work Contractors',
        '1771': 'Concrete Work Contractors',
        '1799': 'Special Trade Contractors - Not Elsewhere Classified',
        '2741': 'Miscellaneous Publishing and Printing Services',
        '2791': 'Typesetting, Platemaking and Related Services',
        '2842': 'Specialty Cleaning, Polishing and Sanitation',
        '4011': 'Railroads',
        '4111': 'Local and Suburban Commuter Passenger Transportation',
        '4112': 'Passenger Railways',
        '4119': 'Ambulance Services',
        '4121': 'Taxi-cabs and Limousines',
        '4131': 'Bus Lines',
        '4214': 'Motor Freight Carriers and Trucking',
        '4215': 'Courier Services - Air and Ground',
        '4225': 'Public Warehousing and Storage',
        '4411': 'Steamships and Cruise Lines',
        '4457': 'Boat Rentals and Leasing',
        '4468': 'Marinas, Marine Service and Supplies',
        '4511': 'Airlines and Air Carriers',
        '4582': 'Airports, Flying Fields and Airport Terminals',
        '4722': 'Travel Agencies and Tour Operators',
        '4784': 'Tolls and Bridge Fees',
        '4789': 'Transportation Services - Not Elsewhere Classified',
        '4812': 'Telecommunication Equipment and Telephone Sales',
        '4814': 'Telecommunication Services',
        '4816': 'Computer Network/Information Services',
        '4821': 'Telegraph Services',
        '4829': 'Wire Transfers and Money Orders',
        '4899': 'Cable and Other Pay Television Services',
        '4900': 'Utilities - Electric, Gas, Water and Sanitary',
        '5013': 'Motor Vehicle Supplies and New Parts',
        '5021': 'Office and Commercial Furniture',
        '5039': 'Construction Materials - Not Elsewhere Classified',
        '5044': 'Office, Photographic, Photocopy Equipment',
        '5045': 'Computers, Computer Peripheral Equipment',
        '5046': 'Commercial Equipment - Not Elsewhere Classified',
        '5047': 'Dental/Laboratory/Medical/Ophthalmic Equipment',
        '5051': 'Metal Service Centres and Offices',
        '5065': 'Electrical Parts and Equipment',
        '5072': 'Hardware Equipment and Supplies',
        '5074': 'Plumbing and Heating Equipment and Supplies',
        '5085': 'Industrial Supplies - Not Elsewhere Classified',
        '5094': 'Precious Stones and Metals, Watches and Jewellery',
        '5099': 'Durable Goods - Not Elsewhere Classified',
        '5111': 'Stationery, Office Supplies and Printing Paper',
        '5122': 'Drugs, Drug Proprietors',
        '5131': 'Piece Goods, Notions and Other Dry Goods',
        '5137': 'Men\'s, Women\'s and Children\'s Uniforms',
        '5139': 'Commercial Footwear',
        '5169': 'Chemicals and Allied Products',
        '5172': 'Petroleum and Petroleum Products',
        '5192': 'Books, Periodicals and Newspapers',
        '5193': 'Florists\' Supplies, Nursery Stock and Flowers',
        '5198': 'Paints, Varnishes and Supplies',
        '5199': 'Non-durable Goods - Not Elsewhere Classified',
        '5200': 'Home Supply Warehouse Outlets',
        '5211': 'Lumber and Building Materials Outlets',
        '5231': 'Glass, Paint and Wallpaper Shops',
        '5251': 'Hardware Shops',
        '5261': 'Lawn and Garden Supplies Outlets',
        '5262': 'Ecommerce Site - Marketplace Operator',
        '5271': 'Mobile Home Dealers',
        '5300': 'Wholesale Clubs',
        '5309': 'Duty-free Shops',
        '5310': 'Discount Shops',
        '5311': 'Department Stores',
        '5331': 'Variety Stores',
        '5399': 'Miscellaneous General Merchandise',
        '5411': 'Groceries and Supermarkets',
        '5422': 'Freezer and Locker Meat Provisioners',
        '5441': 'Candy, Nut and Confectionery Shops',
        '5451': 'Dairies',
        '5462': 'Bakeries',
        '5499': 'Miscellaneous Food Shops',
        '5511': 'Car and Truck Dealers - New and Used',
        '5521': 'Car and Truck Dealers - Used Only',
        '5531': 'Auto and Home Supply Outlets',
        '5532': 'Automotive Tyre Outlets',
        '5533': 'Automotive Parts and Accessories Outlets',
        '5541': 'Service Stations - With or Without Ancillary Services',
        '5542': 'Automated Fuel Dispensers',
        '5551': 'Boat Dealers',
        '5552': 'Electrical Vehicle Charging',
        '5561': 'Camper, Recreational and Utility Trailer Dealers',
        '5571': 'Motorcycle Shops and Dealers',
        '5592': 'Motor Home Dealers',
        '5598': 'Snowmobile Dealers',
        '5599': 'Miscellaneous Automotive Dealers',
        '5611': 'Men\'s and Boys\' Clothing and Accessory Shops',
        '5621': 'Women\'s Ready-to-wear Shops',
        '5631': 'Women\'s Accessory and Specialty Shops',
        '5641': 'Children\'s and Infants\' Wear Shops',
        '5651': 'Family Clothing Shops',
        '5655': 'Sports and Riding Apparel Shops',
        '5661': 'Shoe Shops',
        '5681': 'Furriers and Fur Shops',
        '5691': 'Men\'s and Women\'s Clothing Shops',
        '5697': 'Tailors, Seamstresses, Mending and Alterations',
        '5698': 'Wig and Toupee Shops',
        '5699': 'Miscellaneous Apparel and Accessory Shops',
        '5712': 'Furniture, Home Furnishings and Equipment Shops',
        '5713': 'Floor Covering Services',
        '5714': 'Drapery, Window Covering and Upholstery Shops',
        '5715': 'Alcoholic Beverage Wholesalers',
        '5718': 'Fireplaces, Fireplace Screens and Accessories Shops',
        '5719': 'Miscellaneous Home Furnishing Specialty Shops',
        '5722': 'Household Appliance Shops',
        '5723': 'Gun and Ammunition Shops',
        '5732': 'Electronics Shops',
        '5733': 'Music Shops - Musical Instruments, Pianos and Sheet Music',
        '5734': 'Computer Software Outlets',
        '5735': 'Record Shops',
        '5811': 'Caterers',
        '5812': 'Eating Places and Restaurants',
        '5813': 'Drinking Places - Bars, Taverns, Night-clubs',
        '5814': 'Fast Food Restaurants',
        '5815': 'Digital Goods - Media: Books, Movies, Music',
        '5816': 'Digital Goods - Games',
        '5817': 'Digital Goods - Application (Excludes Games)',
        '5818': 'Large Digital Goods Merchant',
        '5912': 'Drug Stores and Pharmacies',
        '5921': 'Package Shops - Beer, Wine and Liquor',
        '5931': 'Used Merchandise and Second-hand Shops',
        '5932': 'Antique Shops - Sales, Repairs and Restoration',
        '5933': 'Pawn Shops',
        '5935': 'Wrecking and Salvage Yards',
        '5937': 'Antique Reproduction Shops',
        '5940': 'Bicycle Shops - Sales and Service',
        '5941': 'Sporting Goods Shops',
        '5942': 'Bookshops',
        '5943': 'Stationery, Office and School Supply Shops',
        '5944': 'Jewellery, Watch, Clock and Silverware Shops',
        '5945': 'Hobby, Toy and Game Shops',
        '5946': 'Camera and Photographic Supply Shops',
        '5947': 'Gift, Card, Novelty and Souvenir Shops',
        '5948': 'Luggage and Leather Goods Shops',
        '5949': 'Sewing, Needlework, Fabric and Piece Goods Shops',
        '5950': 'Glassware and Crystal Shops',
        '5960': 'Direct Marketing - Insurance Services',
        '5962': 'Telemarketing - Travel-related Arrangement Services',
        '5963': 'Door-to-door Sales',
        '5964': 'Direct Marketing - Catalogue Merchants',
        '5965': 'Direct Marketing - Combination Catalogue and Retail',
        '5966': 'Direct Marketing - Outbound Telemarketing Merchants',
        '5967': 'Direct Marketing - Inbound Telemarketing Merchants',
        '5968': 'Direct Marketing - Continuity/Subscription Merchants',
        '5969': 'Direct Marketing - Not Elsewhere Classified',
        '5970': 'Artist Supply and Craft Shops',
        '5971': 'Art Dealers and Galleries',
        '5972': 'Stamp and Coin Shops',
        '5973': 'Religious Goods and Shops',
        '5975': 'Hearing Aids - Sales, Service and Supplies',
        '5976': 'Orthopaedic Goods and Prosthetic Devices',
        '5977': 'Cosmetic Shops',
        '5978': 'Typewriter Outlets - Sales, Service and Rentals',
        '5983': 'Fuel Dealers - Fuel Oil, Wood, Coal',
        '5992': 'Florists',
        '5993': 'Cigar Shops and Stands',
        '5994': 'Newsagents and News-stands',
        '5995': 'Pet Shops, Pet Food and Supplies',
        '5996': 'Swimming Pools - Sales, Supplies and Services',
        '5997': 'Electric Razor Shops - Sales and Service',
        '5998': 'Tent and Awning Shops',
        '5999': 'Miscellaneous and Specialty Retail Outlets',
        '6010': 'Financial Institutions - Manual Cash Disbursements',
        '6011': 'Financial Institutions - Automated Cash Disbursements',
        '6012': 'Financial Institutions - Merchandise and Services',
        '6051': 'Non-financial Institutions - Foreign Currency',
        '6211': 'Securities - Brokers and Dealers',
        '6300': 'Insurance Sales, Underwriting and Premiums',
        '7011': 'Lodging - Hotels, Motels and Resorts',
        '7012': 'Timeshares',
        '7032': 'Sporting and Recreational Camps',
        '7033': 'Trailer Parks and Camp-sites',
        '7210': 'Laundry, Cleaning and Garment Services',
        '7211': 'Laundry Services - Family and Commercial',
        '7216': 'Dry Cleaners',
        '7217': 'Carpet and Upholstery Cleaning',
        '7221': 'Photographic Studios',
        '7230': 'Beauty and Barber Shops',
        '7251': 'Shoe Repair Shops, Shoe Shine Parlours',
        '7261': 'Funeral Services and Crematoriums',
        '7273': 'Dating and Escort Services',
        '7276': 'Tax Preparation Services',
        '7277': 'Counselling Services - Debt, Marriage and Personal',
        '7278': 'Buying and Shopping Services and Clubs',
        '7296': 'Clothing Rentals - Costumes, Uniforms',
        '7297': 'Massage Parlours',
        '7298': 'Health and Beauty Spas',
        '7299': 'Miscellaneous Personal Services',
        '7311': 'Advertising Services',
        '7321': 'Consumer Credit Reporting Agencies',
        '7322': 'Debt Collection Agencies',
        '7333': 'Commercial Photography, Art and Graphics',
        '7338': 'Quick Copy, Reproduction and Blueprinting Services',
        '7339': 'Stenographic and Secretarial Support Services',
        '7342': 'Exterminating and Disinfecting Services',
        '7349': 'Cleaning, Maintenance and Janitorial Services',
        '7361': 'Employment Agencies and Temporary Help Services',
        '7372': 'Computer Programming, Data Processing Services',
        '7375': 'Information Retrieval Services',
        '7379': 'Computer Maintenance and Repair Services',
        '7392': 'Money Transfer / Remittance - Management, Consulting',
        '7393': 'Detective Agencies, Protective Agencies and Security',
        '7394': 'Equipment, Tool, Furniture and Appliance Rentals',
        '7395': 'Photofinishing Laboratories and Photo Developing',
        '7399': 'Business Services - Not Elsewhere Classified',
        '7512': 'Automobile Rentals',
        '7513': 'Truck and Utility Trailer Rentals',
        '7519': 'Motor Home and Recreational Vehicle Rentals',
        '7523': 'Parking Lots and Garages',
        '7531': 'Automotive Body Repair Shops',
        '7534': 'Tyre Retreading and Repair Shops',
        '7535': 'Automotive Paint Shops',
        '7538': 'Automotive Service Shops - Non-dealer',
        '7542': 'Car Washes',
        '7549': 'Towing Services',
        '7622': 'Electronics Repair Shops',
        '7623': 'Air Conditioning and Refrigeration Repair',
        '7629': 'Electrical and Small Appliance Repair Shops',
        '7631': 'Watch, Clock and Jewellery Repair Shops',
        '7641': 'Furniture Reupholstery, Repair and Refinishing',
        '7692': 'Welding Services',
        '7699': 'Miscellaneous Repair Shops and Related Services',
        '7800': 'Government Owned Lotteries',
        '7801': 'Government Licensed Online Casinos',
        '7802': 'Government-licensed Horse/Dog Racing',
        '7829': 'Motion Picture and Video Tape Production',
        '7832': 'Motion Picture Theatres',
        '7841': 'Video Tape Rentals',
        '7911': 'Dance Halls, Studios and Schools',
        '7922': 'Theatrical Producers and Ticket Agencies',
        '7929': 'Bands, Orchestras and Miscellaneous Entertainers',
        '7932': 'Billiard and Pool Establishments',
        '7933': 'Bowling Alleys',
        '7941': 'Commercial Sports, Professional Sports Clubs',
        '7991': 'Tourist Attractions and Exhibits',
        '7992': 'Public Golf Courses',
        '7993': 'Video Amusement Game Supplies',
        '7994': 'Video Game Arcades and Establishments',
        '7995': 'Betting, Including Lottery Tickets, Casino Gaming',
        '7996': 'Amusement Parks, Circuses, Carnivals',
        '7997': 'Membership Clubs - Sports, Recreation, Athletic',
        '7998': 'Aquariums, Seaquariums and Dolphinariums',
        '7999': 'Recreation Services - Not Elsewhere Classified',
        '8011': 'Doctors and Physicians - Not Elsewhere Classified',
        '8021': 'Dentists and Orthodontists',
        '8031': 'Osteopaths',
        '8041': 'Chiropractors',
        '8042': 'Optometrists and Ophthalmologists',
        '8043': 'Opticians, Optical Goods and Eyeglasses',
        '8049': 'Podiatrists and Chiropodists',
        '8050': 'Nursing and Personal Care Facilities',
        '8062': 'Hospitals',
        '8071': 'Medical and Dental Laboratories',
        '8099': 'Medical Services and Health Practitioners',
        '8111': 'Legal Services and Attorneys',
        '8211': 'Elementary and Secondary Schools',
        '8220': 'Colleges, Universities, Professional Schools',
        '8241': 'Correspondence Schools',
        '8244': 'Business and Secretarial Schools',
        '8249': 'Trade and Vocational Schools',
        '8299': 'Schools and Educational Services',
        '8351': 'Child Care Services',
        '8398': 'Charitable and Social Service Organizations',
        '8641': 'Civic, Social and Fraternal Associations',
        '8651': 'Political Organizations',
        '8661': 'Religious Organizations',
        '8675': 'Automobile Associations',
        '8699': 'Membership Organizations - Not Elsewhere Classified',
        '8734': 'Testing Laboratories - Non-medical',
        '8911': 'Architectural, Engineering and Surveying Services',
        '8931': 'Accounting, Auditing and Bookkeeping Services',
        '8999': 'Professional Services - Not Elsewhere Classified',
        '9211': 'Court Costs, Including Alimony and Child Support',
        '9222': 'Fines',
        '9223': 'Bail and Bond Payments',
        '9311': 'Tax Payments',
        '9402': 'Postal Services - Government Only',
        '9399': 'Government Services - Not Elsewhere Classified',
      },
      countryCodeMap: {
        'KH': 'Cambodia',
        'US': 'United States',
        'GB': 'United Kingdom',
        'CN': 'China',
        'ID': 'Indonesia',
        'MY': 'Malaysia',
        'PH': 'Philippines',
        'SG': 'Singapore',
        'TH': 'Thailand',
        'VN': 'Vietnam',
        'JP': 'Japan',
        'KR': 'South Korea',
        'AU': 'Australia',
      },
    };
  },
  computed: {
    filteredMCCMap() {
      if (!this.mccSearchFilter.trim()) {
        return this.merchantCategoryMap;
      }
      const filter = this.mccSearchFilter.toLowerCase();
      const filtered = {};
      Object.entries(this.merchantCategoryMap).forEach(([code, desc]) => {
        if (code.includes(filter) || desc.toLowerCase().includes(filter)) {
          filtered[code] = desc;
        }
      });
      return filtered;
    },

    filteredMCCForEdit() {
      if (!this.mccSearchInput.trim()) {
        return this.merchantCategoryMap;
      }
      const filter = this.mccSearchInput.toLowerCase();
      const filtered = {};
      Object.entries(this.merchantCategoryMap).forEach(([code, desc]) => {
        if (code.includes(filter) || desc.toLowerCase().includes(filter)) {
          filtered[code] = desc;
        }
      });
      return filtered;
    },

  },
  mounted() {
    document.addEventListener('paste', this.handleGlobalPaste);
    if (this.manualQRInput.trim()) {
      this.decodeManualQR();
      this.generateQRFromString(this.manualQRInput.trim());
    }
  },

  beforeUnmount() {
    document.removeEventListener('paste', this.handleGlobalPaste);
  },

  watch: {
    manualQRInput(newValue) {
      if (newValue.trim()) {
        this.decodeManualQR();
        this.generateQRFromString(newValue.trim());
      }
    },

  },

  methods: {
    decodeManualQR() {
      if (this.manualQRInput.trim()) {
        this.processQRResult(this.manualQRInput.trim());
      }
    },

    handlePaste(event) {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData('text');
      if (text && text.trim()) {
        this.manualQRInput = text.trim();
      }
    },

    async pasteFromClipboard() {
      try {
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            this.manualQRInput = text.trim();
            this.$nextTick(() => {
              this.processQRResult(text.trim());
              this.showNotification('✅ QR data pasted from clipboard!', 'success');
            });
          } else {
            this.showNotification('❌ Clipboard is empty', 'error');
          }
        } else {
          this.showNotification('❌ Clipboard access not available', 'error');
        }
      } catch (error) {
        console.error('Clipboard error:', error);
        this.showNotification('❌ Failed to read clipboard', 'error');
      }
    },

    handleGlobalPaste(event) {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') return;
      try {
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');
        if (pastedText && pastedText.trim()) {
          this.manualQRInput = pastedText.trim();
        }
      } catch (error) {
        console.log('Paste error:', error);
      }
    },

    loadSampleData(event) {
      const data = event.target.value;
      if (data) {
        this.manualQRInput = data;
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
    },

    processQRResult(qrString) {
      this.qrResult = qrString;
      this.parsedTLV = this.parseTLVStructure(qrString);

      this.headerInfo.tag29Nested = {};
      this.headerInfo.tag30Nested = {};
      this.headerInfo.bankInfoNested = {};
      this.headerInfo.tag62Nested = {};
      this.headerInfo.timestampNested = {};

      const baseInfo = this.extractHeaderInfo(this.parsedTLV);
      this.headerInfo = { ...this.headerInfo, ...baseInfo };

      if (this.parsedTLV['29']) {
        this.headerInfo.tag29 = this.parsedTLV['29'];
        this.headerInfo.tag29Nested = this.parseTLVStructure(this.parsedTLV['29'].value);
      }

      if (this.parsedTLV['30']) {
        this.headerInfo.tag30 = this.parsedTLV['30'];
        this.headerInfo.tag30Nested = this.parseTLVStructure(this.parsedTLV['30'].value);
      }

      if (this.parsedTLV['51']) {
        this.headerInfo.bankInfoTag = this.parsedTLV['51'];
        this.headerInfo.bankInfoNested = this.parseTLVStructure(this.parsedTLV['51'].value);
      }

      if (this.parsedTLV['52']) this.headerInfo.merchantCategoryTag = this.parsedTLV['52'];
      if (this.parsedTLV['53']) this.headerInfo.currencyTag = this.parsedTLV['53'];
      if (this.parsedTLV['54']) this.headerInfo.amountTag = this.parsedTLV['54'];
      if (this.parsedTLV['58']) this.headerInfo.countryTag = this.parsedTLV['58'];
      if (this.parsedTLV['59']) this.headerInfo.merchantNameTag = this.parsedTLV['59'];
      if (this.parsedTLV['60']) this.headerInfo.merchantCityTag = this.parsedTLV['60'];

      if (this.parsedTLV['62']) {
        this.headerInfo.additionalDataTag = this.parsedTLV['62'];
        this.headerInfo.tag62Nested = this.parseTLVStructure(this.parsedTLV['62'].value);
        this.headerInfo.tag62PaymentSystemNested = {};
        for (const [st, data] of Object.entries(this.headerInfo.tag62Nested)) {
          const stNum = parseInt(st, 10);
          if (stNum >= 50 && stNum <= 99 && data.value) {
            this.headerInfo.tag62PaymentSystemNested[st] = this.parseTLVStructure(data.value);
          }
        }
      }

      if (this.parsedTLV['63']) this.headerInfo.encryptionTag = this.parsedTLV['63'];

      if (this.parsedTLV['99']) {
        this.headerInfo.timestampTag = this.parsedTLV['99'];
        this.headerInfo.timestampNested = this.parseTLVStructure(this.parsedTLV['99'].value);
      }
    },

    parseTLVStructure(dataString) {
      const result = {};
      let position = 0;

      while (position < dataString.length - 1) {
        if (position + 2 > dataString.length) break;
        const tag = dataString.substring(position, position + 2);
        position += 2;

        if (position + 2 > dataString.length) break;
        const lengthStr = dataString.substring(position, position + 2);
        const length = parseInt(lengthStr, 10);
        position += 2;

        if (isNaN(length) || length < 0) break;

        if (position + length > dataString.length) {
          let found = false;
          for (let i = position; i < Math.min(position + length + 10, dataString.length - 4); i++) {
            const nextTag = dataString.substring(i, i + 2);
            const nextLenStr = dataString.substring(i + 2, i + 4);
            const nextLen = parseInt(nextLenStr, 10);
            if (/^\d{2}$/.test(nextTag) && !isNaN(nextLen) && nextLen > 0 && nextLen < 255 &&
              i + 4 + nextLen <= dataString.length) {
              const truncatedLength = i - position;
              if (truncatedLength > 0) {
                const value = dataString.substring(position, position + truncatedLength);
                result[tag] = { tag, length, value };
              }
              position = i;
              found = true;
              break;
            }
          }
          if (!found) break;
          continue;
        }

        const value = dataString.substring(position, position + length);
        position += length;
        result[tag] = { tag, length, value };
      }

      return result;
    },

    extractHeaderInfo(tlvData) {
      const info = {};
      if (tlvData['00']) info.payloadIndicator = tlvData['00'];
      if (tlvData['01']) info.initiationMethod = tlvData['01'];
      if (tlvData['30']) info.merchantType = tlvData['30'];
      return info;
    },

    clearData() {
      this.qrResult = '';
      this.headerInfo = {
        bankInfoNested: {},
        timestampNested: {},
        tag29Nested: {},
        tag30Nested: {},
        tag62Nested: {},
        tag62PaymentSystemNested: {},
      };
      this.parsedTLV = {};
      this.manualQRInput = '';
      this.copyText = 'Copy';
    },

    clearAll() {
      this.clearData();
      this.generatedQRImage = null;
      this.qrDataToGenerate = '';
    },

    copyToClipboard() {
      navigator.clipboard.writeText(this.qrResult).then(() => {
        this.copyText = 'Copied!';
        setTimeout(() => { this.copyText = 'Copy'; }, 2000);
      });
    },

    getMerchantCategoryDescription(code) {
      return this.merchantCategoryMap[code] || `Category: ${code}`;
    },

    getInitiationMethodDescription(code) {
      const methodMap = { '11': 'Static QR Code', '12': 'Dynamic QR Code' };
      return methodMap[code] || `Initiation Method: ${code}`;
    },

    toggleEditMode() {
      if (!this.editMode) {
        this.originalQRResult = this.qrResult;
        this.editMode = true;
      } else {
        if (this.originalQRResult) {
          this.processQRResult(this.originalQRResult);
          this.generateQRFromString(this.originalQRResult);
        }
        this.editMode = false;
        this.originalQRResult = null;
      }
    },

    rebuildKHQR() {
      const enc = (tag, value) => {
        if (value == null || value === '') return '';
        return tag + String(value.length).padStart(2, '0') + value;
      };
      const encNested = (tag, nestedObj) => {
        let inner = '';
        const sorted = Object.entries(nestedObj).sort(([a], [b]) => a.localeCompare(b));
        for (const [st, data] of sorted) {
          if (data && data.value) inner += enc(st, data.value);
        }
        return inner ? tag + String(inner.length).padStart(2, '0') + inner : '';
      };
      const p = this.parsedTLV;
      const h = this.headerInfo;
      let qr = '';
      if (p['00']) qr += enc('00', p['00'].value);
      if (p['01']) qr += enc('01', p['01'].value);
      if (h.tag29 && Object.keys(h.tag29Nested).length) qr += encNested('29', h.tag29Nested);
      if (h.tag30 && Object.keys(h.tag30Nested).length) qr += encNested('30', h.tag30Nested);
      if (h.bankInfoTag && Object.keys(h.bankInfoNested).length) qr += encNested('51', h.bankInfoNested);
      if (h.merchantCategoryTag) qr += enc('52', h.merchantCategoryTag.value);
      if (h.currencyTag) qr += enc('53', h.currencyTag.value);
      if (h.amountTag) qr += enc('54', h.amountTag.value);
      if (h.countryTag) qr += enc('58', h.countryTag.value);
      if (h.merchantNameTag) qr += enc('59', h.merchantNameTag.value);
      if (h.merchantCityTag) qr += enc('60', h.merchantCityTag.value);
      if (p['62'] && Object.keys(h.tag62Nested).length) qr += encNested('62', h.tag62Nested);
      if (h.timestampTag && Object.keys(h.timestampNested).length) qr += encNested('99', h.timestampNested);
      qr += '6304' + this.calculateCRC16(qr);
      return qr;
    },

    applyInlineEdits() {
      try {
        const rebuilt = this.rebuildKHQR();
        this.editMode = false;
        this.originalQRResult = null;
        this.manualQRInput = rebuilt;
        this.processQRResult(rebuilt);
        this.generateQRFromString(rebuilt);
        this.showNotification('✅ TLV updated · CRC recalculated', 'success');
      } catch (e) {
        this.showNotification('❌ Error rebuilding QR string', 'error');
      }
    },

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },

    getCurrencyDescription(code) {
      const codeStr = String(code).padStart(3, '0');
      return this.currencyCodeMap[codeStr] || `Currency Code: ${code}`;
    },

    getCountryDescription(code) {
      return this.countryCodeMap[code] || `Country: ${code}`;
    },

    getTimestampReadableWithoutExpired(timestamp) {
      if (!timestamp) return '';
      let ms = parseInt(timestamp, 10);
      if (isNaN(ms)) return '';
      try {
        const date = new Date(ms);
        const options = {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZone: 'Asia/Bangkok',
        };
        return date.toLocaleString('en-US', options) + ' ICT';
      } catch { return ''; }
    },

    isTimestampExpired(timestamp) {
      if (!timestamp) return false;
      let ms = parseInt(timestamp, 10);
      if (isNaN(ms)) return false;
      try {
        return new Date(ms) < new Date();
      } catch { return false; }
    },

    formatLength(length) {
      return String(length).padStart(2, '0');
    },

    setTimestampNow() {
      const now = Date.now();
      const tomorrow = now + 24 * 60 * 60 * 1000;
      if (this.headerInfo.timestampNested['00']) {
        this.headerInfo.timestampNested['00'].value = String(now);
      }
      if (this.headerInfo.timestampNested['01']) {
        this.headerInfo.timestampNested['01'].value = String(tomorrow);
      }
    },

    msToDatetimeLocal(ms) {
      if (!ms) return '';
      const d = new Date(parseInt(ms, 10));
      if (isNaN(d.getTime())) return '';
      const p = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
    },

    datetimeLocalToMs(str) {
      if (!str) return '';
      const ms = new Date(str).getTime();
      return isNaN(ms) ? '' : String(ms);
    },

    calculateCRC16(data) {
      let crc = 0x0000;
      for (let i = 0; i < data.length; i++) {
        const byte = data.charCodeAt(i);
        crc ^= (byte << 8);
        for (let j = 0; j < 8; j++) {
          crc <<= 1;
          if (crc & 0x10000) crc ^= 0x1021;
          crc &= 0xFFFF;
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0');
    },

    validateChecksum(qrData) {
      const checksumMatch = qrData.match(/63\d{2}([A-Fa-f0-9]{4})$/);
      if (!checksumMatch) return null;
      const providedChecksum = checksumMatch[1].toUpperCase();
      const dataWithoutChecksum = qrData.replace(/63\d{2}[A-Fa-f0-9]{4}$/, '');
      const calculatedChecksum = this.calculateCRC16(dataWithoutChecksum);
      return providedChecksum === calculatedChecksum;
    },

    getCRCCalculatorLink() {
      let qrWithoutChecksum = this.qrResult.replace(/63\d{2}[A-Fa-f0-9]{4}$/, '');
      const encodedData = encodeURIComponent(qrWithoutChecksum);
      return `https://crccalc.com/?crc=${encodedData}&method=CRC-16/IBM-3740&datatype=ascii&outtype=hex`;
    },

    downloadQRCode() {
      if (!this.generatedQRImage) return;
      const link = document.createElement('a');
      if (this.downloadFormat === 'svg') {
        QRCode.toString(this.qrDataToGenerate.trim(), {
          errorCorrectionLevel: 'H',
          type: 'image/svg+xml',
          quality: 0.95,
          margin: 1,
          width: 300,
          color: { dark: '#000000', light: '#FFFFFF' },
        }, (err, url) => {
          if (err) { console.error('Error generating SVG:', err); return; }
          link.href = url;
          link.download = `khqr-${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        link.href = this.generatedQRImage;
        link.download = `khqr-${Date.now()}.${this.downloadFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    async generateQRFromString(str) {
      if (!str) return;
      try {
        this.qrDataToGenerate = str;
        this.generatedQRImage = await QRCode.toDataURL(str, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 300,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
      } catch (e) {
        console.error('QR generation error:', e);
      }
    },

    calculateTimeDifference(timeDiff) {
      const totalSeconds = Math.floor(timeDiff / 1000);
      const weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
      const remainingAfterWeeks = totalSeconds % (7 * 24 * 60 * 60);
      const days = Math.floor(remainingAfterWeeks / (24 * 60 * 60));
      const remainingAfterDays = remainingAfterWeeks % (24 * 60 * 60);
      const hours = Math.floor(remainingAfterDays / (60 * 60));
      const remainingAfterHours = remainingAfterDays % (60 * 60);
      const minutes = Math.floor(remainingAfterHours / 60);
      const seconds = remainingAfterHours % 60;
      return { weeks, days, hours, minutes, seconds };
    },

    formatTimeDifference(weeks, days, hours, minutes, seconds) {
      const parts = [];
      if (weeks > 0) parts.push(`${weeks}w`);
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
      return parts.join(' ');
    },

    getTimestampStatus() {
      if (!this.headerInfo.timestampNested?.['01']) return '✗ Not Present';
      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();
      if (isNaN(expiryTime)) return '⚠️ Invalid';
      if (expiryTime > now) {
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(expiryTime - now);
        return `✓ Valid (${this.formatTimeDifference(weeks, days, hours, minutes, seconds)} left)`;
      } else {
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(now - expiryTime);
        return `✗ Expired (${this.formatTimeDifference(weeks, days, hours, minutes, seconds)} ago)`;
      }
    },

    getTimestampStatusClass() {
      if (!this.headerInfo.timestampNested?.['01']) return 'ts-missing';
      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();
      if (isNaN(expiryTime)) return 'ts-invalid';
      return expiryTime > now ? 'ts-valid' : 'ts-expired';
    },

    downloadTLV() {
      if (this.tlvDownloadFormat === 'json') {
        this.downloadTLVStructure();
      } else {
        this.downloadTLVImage(this.tlvDownloadFormat);
      }
    },

    buildTLVLines() {
      const lines = [];
      const add = (tag, len, value, meaning, indent) =>
        lines.push({ tag, len: String(len).padStart(2, '0'), value: value || '', meaning, indent: indent || 0 });
      const addNested = (nested, meanings, indent) => {
        for (const [st, data] of Object.entries(nested)) {
          add(st, (data.value || '').length, data.value, meanings[st] || '', indent);
        }
      };
      const p = this.parsedTLV;
      const h = this.headerInfo;
      const bankMeanings = { '00': 'Bakong ID', '01': 'Merchant ID', '02': 'Bank Name', '10': 'Account Number', '11': 'Reference Number' };
      if (p['00']) add('00', p['00'].value.length, p['00'].value, 'Payload Format Indicator');
      if (p['01']) add('01', p['01'].value.length, p['01'].value, 'Initiation Method');
      if (h.tag29) { add('29', h.tag29.length, '', 'Remittance'); addNested(h.tag29Nested, bankMeanings, 1); }
      if (h.tag30) { add('30', h.tag30.length, '', 'Merchant Info'); addNested(h.tag30Nested, bankMeanings, 1); }
      if (h.bankInfoTag) { add('51', h.bankInfoTag.length, '', 'Bank Info'); addNested(h.bankInfoNested, bankMeanings, 1); }
      if (h.merchantCategoryTag) add('52', h.merchantCategoryTag.value.length, h.merchantCategoryTag.value, 'MCC');
      if (h.currencyTag) add('53', h.currencyTag.value.length, h.currencyTag.value, 'Currency');
      if (h.amountTag) add('54', h.amountTag.value.length, h.amountTag.value, 'Amount');
      if (h.countryTag) add('58', h.countryTag.value.length, h.countryTag.value, 'Country Code');
      if (h.merchantNameTag) add('59', h.merchantNameTag.value.length, h.merchantNameTag.value, 'Merchant Name');
      if (h.merchantCityTag) add('60', h.merchantCityTag.value.length, h.merchantCityTag.value, 'Merchant City');
      if (p['62']) {
        add('62', p['62'].length, '', 'Additional Data');
        const t62m = { '01': 'Bill Number', '02': 'Mobile Number', '03': 'Store Label', '04': 'Loyalty Number', '05': 'Reference Label', '06': 'Customer Label', '07': 'Terminal Label', '08': 'Purpose of Transaction', '09': 'Consumer Data Request' };
        for (const [st, data] of Object.entries(h.tag62Nested)) {
          const n = parseInt(st, 10);
          if (n >= 50 && n <= 99) {
            add(st, (data.value || '').length, '', 'Payment System Template', 1);
            if (h.tag62PaymentSystemNested[st]) {
              addNested(h.tag62PaymentSystemNested[st], { '00': 'App ID', '01': 'Bill Number', '02': 'Terminal ID', '06': 'Reference' }, 2);
            }
          } else {
            add(st, (data.value || '').length, data.value, t62m[st] || 'Additional Info', 1);
          }
        }
      }
      if (h.timestampTag) { add('99', h.timestampTag.length, '', 'Timestamp'); addNested(h.timestampNested, { '00': 'Create Time', '01': 'Expiry Time' }, 1); }
      if (p['63']) add('63', 4, p['63'].value, 'CRC-16');
      return lines;
    },

    downloadTLVImage(format) {
      const lines = this.buildTLVLines();
      const DPR = 2;
      const W = 680;
      const PAD_X = 12;
      const ROW_H = 28;
      const SUB_ROW_H = 22;
      const INDENT_W = 20;
      const PILL_H = 16;

      const totalH = 8 + lines.reduce((s, l) => s + (l.indent === 0 ? ROW_H : SUB_ROW_H), 0) + 8;

      const canvas = document.createElement('canvas');
      canvas.width = W * DPR;
      canvas.height = totalH * DPR;
      const ctx = canvas.getContext('2d');
      ctx.scale(DPR, DPR);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, totalH);

      const pill = (x, y, w, h, r, bg) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = bg;
        ctx.fill();
      };

      const truncate = (ctx, text, maxW) => {
        if (!text) return '';
        let t = text;
        while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -1);
        return t === text ? text : t.slice(0, -1) + '…';
      };

      let y = 8;
      lines.forEach((line, idx) => {
        const rowH = line.indent === 0 ? ROW_H : SUB_ROW_H;
        const isTop = line.indent === 0;

        // Row bottom border (matches border-bottom: 1px solid #f8fafc)
        if (idx < lines.length - 1) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, y + rowH - 1, W, 1);
        }

        // Left bars — one 2px bar per indent level
        for (let d = 1; d <= line.indent; d++) {
          const barX = PAD_X + (d - 1) * INDENT_W + 8;
          ctx.fillStyle = d === 1 ? '#e2e8f0' : '#cbd5e1';
          ctx.fillRect(barX, y, 2, rowH);
        }

        const indentOffset = line.indent > 0 ? PAD_X + line.indent * INDENT_W + 10 : PAD_X + 6;
        const midY = y + rowH / 2;
        const pillY = midY - PILL_H / 2;
        let x = indentOffset;

        // Tag pill — #f1f5f9 bg, #334155 text
        const TAG_W = 30;
        pill(x, pillY, TAG_W, PILL_H, 3, '#f1f5f9');
        ctx.font = `bold ${isTop ? 11 : 10}px "Monaco","Courier New",monospace`;
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'center';
        ctx.fillText(line.tag, x + TAG_W / 2, pillY + 11);
        ctx.textAlign = 'left';
        x += TAG_W + 4;

        // Length pill — #f8fafc bg, #94a3b8 text
        const LEN_W = 26;
        pill(x, pillY, LEN_W, PILL_H, 3, '#f8fafc');
        ctx.font = `${isTop ? 10 : 9}px "Monaco","Courier New",monospace`;
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText(line.len, x + LEN_W / 2, pillY + 11);
        ctx.textAlign = 'left';
        x += LEN_W + 6;

        // Value — #0f172a, monospace
        const maxValW = W - x - 160;
        if (line.value) {
          ctx.font = `${isTop ? 11 : 10}px "Monaco","Courier New",monospace`;
          ctx.fillStyle = '#0f172a';
          const valText = truncate(ctx, line.value, maxValW);
          ctx.fillText(valText, x, midY + 4);
          x += Math.min(ctx.measureText(line.value).width, maxValW) + 10;
        }

        // Meaning — italic, #94a3b8
        if (line.meaning) {
          ctx.font = `italic ${isTop ? 10 : 9}px sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(line.meaning, x, midY + 4);
        }

        y += rowH;
      });

      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `khqr-tlv-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    downloadTLVStructure() {
      const buildTree = (nested) => {
        const out = {};
        for (const [tag, data] of Object.entries(nested)) {
          out[tag] = { length: data.length ?? (data.value || '').length, value: data.value };
        }
        return out;
      };
      const h = this.headerInfo;
      const export_ = {
        khqrString: this.qrResult,
        tags: {
          ...(this.parsedTLV['00'] && { '00': { value: this.parsedTLV['00'].value, meaning: 'Payload Format Indicator' } }),
          ...(this.parsedTLV['01'] && { '01': { value: this.parsedTLV['01'].value, meaning: 'Initiation Method' } }),
          ...(h.tag29 && { '29': { meaning: 'Remittance', subtags: buildTree(h.tag29Nested) } }),
          ...(h.tag30 && { '30': { meaning: 'Merchant Info', subtags: buildTree(h.tag30Nested) } }),
          ...(h.bankInfoTag && { '51': { meaning: 'Bank Info', subtags: buildTree(h.bankInfoNested) } }),
          ...(h.merchantCategoryTag && { '52': { value: h.merchantCategoryTag.value, meaning: 'MCC' } }),
          ...(h.currencyTag && { '53': { value: h.currencyTag.value, meaning: 'Currency' } }),
          ...(h.amountTag && { '54': { value: h.amountTag.value, meaning: 'Amount' } }),
          ...(h.countryTag && { '58': { value: h.countryTag.value, meaning: 'Country Code' } }),
          ...(h.merchantNameTag && { '59': { value: h.merchantNameTag.value, meaning: 'Merchant Name' } }),
          ...(h.merchantCityTag && { '60': { value: h.merchantCityTag.value, meaning: 'Merchant City' } }),
          ...(this.parsedTLV['62'] && {
            '62': {
              meaning: 'Additional Data',
              subtags: {
                ...buildTree(h.tag62Nested),
                ...Object.fromEntries(
                  Object.entries(h.tag62PaymentSystemNested).map(([st, nested]) => [
                    st, { meaning: 'Payment System Template', subtags: buildTree(nested) },
                  ])
                ),
              },
            },
          }),
          ...(h.timestampTag && { '99': { meaning: 'Timestamp', subtags: buildTree(h.timestampNested) } }),
          ...(this.parsedTLV['63'] && { '63': { value: this.parsedTLV['63'].value, meaning: 'CRC-16' } }),
        },
      };
      const blob = new Blob([JSON.stringify(export_, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `khqr-tlv-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    getTag62PaymentSubtagMeaning(st) {
      const map = { '00': 'App ID', '01': 'Bill Number', '02': 'Terminal ID', '03': 'Store Label', '04': 'Loyalty', '05': 'Reference Label', '06': 'Reference' };
      return map[st] || `Field ${st}`;
    },

    getTimestampBadgeClass() {
      if (!this.headerInfo.timestampNested?.['01']) return 'ts-badge ts-badge-none';
      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();
      if (isNaN(expiryTime)) return 'ts-badge ts-badge-invalid';
      return expiryTime > now ? 'ts-badge ts-badge-valid' : 'ts-badge ts-badge-expired';
    },
  },
};
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ── App Shell ───────────────────────────────────── */
.container {
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  width: 100vw;
}

.scanner-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
}

/* ── Header ──────────────────────────────────────── */
.header {
  height: 48px;
  background: #0f172a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.2px;
}

.header-sub {
  font-size: 0.78rem;
  font-weight: 500;
  color: #475569;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* ── Layout ──────────────────────────────────────── */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.builder-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: calc(100vh - 48px);
  flex: 1;
}

/* ── Left Panel ──────────────────────────────────── */
.builder-left {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* ── Paste Mode ──────────────────────────────────── */
.paste-mode {
  padding: 1.125rem;
  flex: 1;
  overflow-y: auto;
}

.sample-selector {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.75rem;
}

.sample-label {
  font-size: 0.67rem;
  font-weight: 700;
  color: #94a3b8;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sample-select {
  flex: 1;
  padding: 0.45rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.78rem;
  font-family: inherit;
  color: #334155;
  background: #ffffff;
  cursor: pointer;
}

.sample-select:focus {
  outline: none;
  border-color: #2563eb;
}

.input-field {
  width: 100%;
  height: 140px;
  padding: 0.65rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.72rem;
  resize: vertical;
  color: #334155;
  background: #ffffff;
  transition: border-color 0.12s;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.input-field:focus {
  outline: none;
  border-color: #2563eb;
}

.input-field::placeholder {
  color: #cbd5e1;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-buttons .btn {
  flex: 1;
}

/* ── Buttons ─────────────────────────────────────── */
.btn {
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  font-family: inherit;
  letter-spacing: 0.1px;
  white-space: nowrap;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border-color: #e2e8f0;
}

.btn-ghost:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

/* ── Nav Copy Field ──────────────────────────────── */
.nav-copy-field {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0 0.75rem;
}

.nav-copy-input {
  flex: 1;
  padding: 0.3rem 0.55rem;
  border: 1px solid #334155;
  border-right: none;
  border-radius: 5px 0 0 5px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.63rem;
  color: #cbd5e1;
  background: #1e293b;
  cursor: text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.nav-copy-input:focus {
  outline: none;
  border-color: #475569;
  background: #0f172a;
  color: #f1f5f9;
}

.nav-copy-btn {
  padding: 0.3rem 0.6rem;
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #334155;
  border-radius: 0 5px 5px 0;
  font-size: 0.68rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;
  font-family: inherit;
  flex-shrink: 0;
}

.nav-copy-btn:hover {
  background: #475569;
  border-color: #475569;
}

/* ── Right Panel ─────────────────────────────────── */
.builder-right {
  overflow-y: auto;
  padding: 1.125rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  background: #f8fafc;
  min-height: 0;
}

/* ── QR Preview ──────────────────────────────────── */
.qr-output-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.qr-preview-box {
  display: flex;
  justify-content: center;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.qr-preview-img {
  max-width: 200px;
  height: auto;
}

.qr-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1.25rem;
  background: #ffffff;
  border: 1.5px dashed #e2e8f0;
  border-radius: 10px;
}

.qr-placeholder-icon {
  font-size: 2rem;
  opacity: 0.15;
}

.qr-placeholder p {
  color: #94a3b8;
  font-size: 0.78rem;
  margin: 0;
}

.gen-dl {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.gen-dl-select {
  padding: 0.42rem 0.6rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.78rem;
  font-family: inherit;
  background: #ffffff;
  color: #334155;
  cursor: pointer;
}

/* ── Raw KHQR String ─────────────────────────────── */
.gen-raw {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.gen-raw-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.65rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.gen-raw-header span {
  font-size: 0.65rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gen-copy-btn {
  padding: 0.18rem 0.45rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
  font-family: inherit;
}

.gen-copy-btn:hover {
  background: #1d4ed8;
}

.gen-raw-content {
  padding: 0.6rem 0.65rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.63rem;
  word-break: break-all;
  white-space: pre-wrap;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* ── Summary Card ────────────────────────────────── */
.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1px;
  background: #e2e8f0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.65rem 0.75rem;
  background: #ffffff;
}

.summary-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #0f172a;
  word-break: break-word;
}

/* ── MCC Warning ─────────────────────────────────── */
.mcc-warning-alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.875rem;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 7px;
}

.mcc-warning-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

.mcc-warning-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.mcc-warning-title {
  font-weight: 600;
  color: #854d0e;
  font-size: 0.78rem;
}

.mcc-warning-desc {
  color: #92400e;
  font-size: 0.7rem;
}

.mcc-warning-btn {
  padding: 0.3rem 0.65rem;
  background: #ca8a04;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  font-size: 0.72rem;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;
}

.mcc-warning-btn:hover {
  background: #a16207;
}

/* ── Badges ──────────────────────────────────────── */
.mcc-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.mcc-badge-present {
  background: #dcfce7;
  color: #16a34a;
}

.mcc-badge-missing {
  background: #fee2e2;
  color: #dc2626;
}

.ts-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.45rem;
  border-radius: 4px;
  font-size: 0.72rem;
  font-weight: 600;
}

.ts-badge-valid {
  background: #dcfce7;
  color: #16a34a;
}

.ts-badge-expired {
  background: #fee2e2;
  color: #dc2626;
}

.ts-badge-invalid {
  background: #fef3c7;
  color: #d97706;
}

.ts-badge-none {
  background: #f1f5f9;
  color: #94a3b8;
}

/* ── Result Section ──────────────────────────────── */
.result-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h2 {
  font-size: 0.67rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.header-buttons {
  display: flex;
  gap: 0.375rem;
}

.copy-btn {
  background: #ffffff;
  color: #374151;
  border: 1px solid #e2e8f0;
  padding: 0.3rem 0.65rem;
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  font-family: inherit;
}

.copy-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.tlv-dl-group {
  display: flex;
  align-items: center;
}

.tlv-dl-select {
  padding: 0.28rem 0.4rem;
  border: 1px solid #e2e8f0;
  border-right: none;
  border-radius: 5px 0 0 5px;
  font-size: 0.68rem;
  font-family: inherit;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

.tlv-dl-btn {
  border-radius: 0 5px 5px 0 !important;
  border-left: none !important;
  padding: 0.3rem 0.5rem !important;
}

.edit-active {
  background: #fee2e2 !important;
  color: #dc2626 !important;
  border-color: #fca5a5 !important;
}

.edit-apply-btn {
  background: #2563eb !important;
  color: #ffffff !important;
  border-color: #2563eb !important;
}

.edit-apply-btn:hover {
  background: #1d4ed8 !important;
}

/* ── TLV Tree ────────────────────────────────────── */
.tlv-tree {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.72rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.tree-item {
  padding: 0.375rem 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.1s;
}

.tree-item:last-child {
  border-bottom: none;
}

.tree-item:hover {
  background: #f8fafc;
}

.tree-tag {
  background: #f1f5f9;
  color: #334155;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-weight: 700;
  font-size: 0.68rem;
  min-width: 26px;
  text-align: center;
  letter-spacing: 0.3px;
}

.tree-length {
  background: #f8fafc;
  color: #94a3b8;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  font-size: 0.65rem;
  min-width: 22px;
  text-align: center;
}

.tree-data {
  color: #0f172a;
  font-size: 0.7rem;
  word-break: break-all;
  font-weight: 500;
}

.tree-meaning {
  color: #94a3b8;
  font-size: 0.67rem;
  font-style: italic;
  margin-left: 0.2rem;
}

/* TLV status */
.mcc-tag-highlight {
  background: #dcfce7 !important;
  color: #16a34a !important;
}

.mcc-indicator {
  margin-left: auto;
  background: #dcfce7;
  color: #16a34a;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.62rem;
  font-weight: 700;
  white-space: nowrap;
}

.checksum-valid {
  background: #f0fdf4;
}

.ts-valid {
  border-left: 2px solid #16a34a;
}

.ts-expired {
  border-left: 2px solid #dc2626;
}

.ts-invalid {
  border-left: 2px solid #d97706;
}

.ts-missing {
  border-left: 2px solid #e2e8f0;
}

.ts-tree-indicator {
  margin-left: auto;
  font-size: 0.62rem;
  font-weight: 600;
  font-style: normal;
}

.ts-valid .ts-tree-indicator { color: #16a34a; }
.ts-expired .ts-tree-indicator { color: #dc2626; }
.ts-invalid .ts-tree-indicator { color: #d97706; }

/* Sublayer */
.tree-sublayer {
  width: 100%;
  margin-top: 0.35rem;
  margin-left: 0.75rem;
  border-left: 2px solid #e2e8f0;
  padding-left: 0.625rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tree-subitem-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  padding: 0.25rem 0;
}

.tree-subitem-parent {
  flex-wrap: wrap;
  align-items: center;
}

.tree-subitem-parent .tree-sublayer--deep {
  width: 100%;
}

.tree-sublayer--deep {
  margin-left: 0.5rem;
  border-left-color: #cbd5e1;
}

.tree-subitem-conversion {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.15rem 0;
  padding-left: 1.25rem;
}

.tree-subitem-conversion .tree-meaning {
  font-style: normal;
  margin: 0;
  color: #64748b;
}

.timestamp-expired .tree-meaning { color: #dc2626; }
.timestamp-valid .tree-meaning { color: #16a34a; }

.crc-pending {
  color: #94a3b8 !important;
  font-style: italic;
}

.crc-link {
  margin-left: auto;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border: 1px solid #bfdbfe;
  border-radius: 3px;
  transition: all 0.12s;
}

.crc-link:hover {
  background: #2563eb;
  color: #ffffff;
}

.tree-edit-input {
  display: inline-block;
  min-width: 80px;
  max-width: 240px;
  padding: 0.1rem 0.3rem;
  border: 1px solid #bfdbfe;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.7rem;
  color: #0f172a;
  background: #eff6ff;
  outline: none;
}

.tree-edit-input:focus {
  border-color: #2563eb;
}

.tree-edit-input--short {
  min-width: 40px;
  max-width: 70px;
}

.tree-edit-input--dt {
  min-width: 180px;
  max-width: 200px;
  cursor: pointer;
}

.ts-now-btn {
  margin-left: auto;
  padding: 0.18rem 0.55rem;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s;
}

.ts-now-btn:hover {
  background: #dbeafe;
  border-color: #93c5fd;
}

/* ── Reference Trigger ───────────────────────────── */
.ref-trigger {
  margin-left: auto;
  padding: 0.28rem 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  font-family: inherit;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.ref-trigger:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #e2e8f0;
}

/* ── Reference Overlay / Drawer ──────────────────── */
.ref-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.ref-drawer {
  width: 420px;
  max-width: 92vw;
  background: #ffffff;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(15, 23, 42, 0.12);
}

.ref-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.125rem;
  height: 48px;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  background: #0f172a;
}

.ref-drawer-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ref-close {
  background: none;
  border: none;
  color: #475569;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  transition: background 0.1s, color 0.1s;
  font-family: inherit;
}

.ref-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.ref-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Transition ──────────────────────────────────── */
.ref-fade-enter-active,
.ref-fade-leave-active {
  transition: opacity 0.18s ease;
}

.ref-fade-enter-active .ref-drawer,
.ref-fade-leave-active .ref-drawer {
  transition: transform 0.18s ease;
}

.ref-fade-enter-from,
.ref-fade-leave-to {
  opacity: 0;
}

.ref-fade-enter-from .ref-drawer,
.ref-fade-leave-to .ref-drawer {
  transform: translateX(100%);
}

.reference-section {
  flex: 1;
  min-width: 200px;
}

.reference-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reference-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.reference-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  padding: 0.25rem 0.55rem;
}

.bank-name {
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.tag-definitions {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tag-def {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.2rem 0.35rem;
  border-radius: 4px;
}

.tag-def:hover {
  background: #f8fafc;
}

.tag-code {
  background: #f1f5f9;
  color: #334155;
  padding: 0.08rem 0.35rem;
  border-radius: 3px;
  font-weight: 700;
  font-size: 0.68rem;
  font-family: monospace;
  min-width: 28px;
  text-align: center;
}

.tag-desc {
  color: #64748b;
  font-size: 0.72rem;
}

.currency-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.currency-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.4rem 0.65rem;
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.curr-code {
  font-weight: 700;
  color: #2563eb;
  font-size: 0.78rem;
  font-family: monospace;
}

.curr-name {
  color: #64748b;
  font-size: 0.75rem;
}

.mcc-search {
  margin-bottom: 0.5rem;
}

.mcc-search-input {
  width: 100%;
  padding: 0.4rem 0.55rem;
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  font-size: 0.75rem;
  font-family: inherit;
  color: #374151;
  background: #ffffff;
}

.mcc-search-input:focus {
  outline: none;
  border-color: #2563eb;
}

.mcc-list {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  max-height: 220px;
  overflow-y: auto;
}

.mcc-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.22rem 0.35rem;
  border-radius: 3px;
}

.mcc-item:hover {
  background: #f8fafc;
}

.mcc-code {
  font-weight: 700;
  color: #2563eb;
  font-size: 0.68rem;
  font-family: monospace;
  min-width: 34px;
  flex-shrink: 0;
}

.mcc-desc {
  color: #64748b;
  font-size: 0.68rem;
}

/* ── Notifications ───────────────────────────────── */
.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  padding: 0.65rem 0.9rem;
  border-radius: 7px;
  font-weight: 600;
  font-size: 0.78rem;
  z-index: 9999;
  animation: slideIn 0.2s ease;
  transition: opacity 0.2s ease;
}

.notification-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #86efac;
}

.notification-info {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.notification-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* ── Animations ──────────────────────────────────── */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 960px) {
  .builder-layout {
    grid-template-columns: 260px 1fr;
  }
}

@media (max-width: 720px) {
  .builder-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .builder-left {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 55vh;
  }

  .builder-right {
    max-height: 65vh;
  }

  .ref-drawer {
    width: 100vw;
    max-width: 100vw;
  }
}
</style>
