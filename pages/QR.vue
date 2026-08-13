<template>
  <div class="container">
    <div class="scanner-card">
      <div class="header">
        <div class="header-content">
          <h1 class="title">🇰🇭 KHQR Scanner</h1>
          <p class="subtitle">Decode and generate Cambodian payment QR codes</p>
        </div>
      </div>

      <div class="tab-navigation">
        <button @click="activeTab = 'decode'" :class="['tab-button', { active: activeTab === 'decode' }]">
          <span class="tab-icon">🔍</span>
          <span class="tab-text">Decode</span>
        </button>
        <button @click="activeTab = 'generate'" :class="['tab-button', { active: activeTab === 'generate' }]">
          <span class="tab-icon">✨</span>
          <span class="tab-text">Generate</span>
        </button>
        <button @click="activeTab = 'reference'" :class="['tab-button', { active: activeTab === 'reference' }]">
          <span class="tab-icon">📚</span>
          <span class="tab-text">Reference</span>
        </button>
      </div>

      <!-- Decode Tab -->
      <div v-show="activeTab === 'decode'" class="tab-content">
        <div class="input-area">
          <div class="sample-selector">
            <label class="sample-label">📋 Sample Data:</label>
            <select @change="loadSampleData" class="sample-select">
              <option value="">-- Select Sample --</option>
              <option v-for="sample in sampleDataOptions" :key="sample.name" :value="sample.data">
                {{ sample.name }}
              </option>
            </select>
          </div>

          <textarea v-model="manualQRInput" @paste="handlePaste" placeholder="Paste QR code data..."
            class="input-field"></textarea>

          <div class="action-buttons">
            <button @click="pasteFromClipboard" class="btn btn-primary paste-btn">
              📋 Paste from Clipboard
            </button>
            <button @click="clearData" class="btn btn-secondary">
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Results - TLV Tree Structure -->
      <div v-if="qrResult && activeTab === 'decode'" class="result-section">
        <!-- MCC Warning Alert -->
        <div v-if="!headerInfo.merchantCategoryTag" class="mcc-warning-alert">
          <span class="mcc-warning-icon">⚠️</span>
          <div class="mcc-warning-content">
            <span class="mcc-warning-title">Merchant Category Code (MCC) Not Found</span>
            <span class="mcc-warning-desc">Tag 52 is missing. Consider adding MCC in edit mode for complete merchant
              classification.</span>
          </div>
          <button @click="toggleEditMode" class="mcc-warning-btn">Add MCC</button>
        </div>

        <!-- Data Summary Card -->
        <div class="summary-card">
          <div class="summary-item">
            <span class="summary-label">Merchant:</span>
            <span class="summary-value">{{ headerInfo.merchantNameTag?.value || 'N/A' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Amount:</span>
            <span class="summary-value">{{ headerInfo.amountTag?.value ? headerInfo.amountTag.value + ' ' +
          (headerInfo.currencyTag?.value === '840' ? 'USD' : 'KHR') : 'N/A' }}</span>
          </div>
          <div class="summary-item"
            :class="{ 'mcc-present': headerInfo.merchantCategoryTag, 'mcc-missing': !headerInfo.merchantCategoryTag }">
            <span class="summary-label">Category (MCC):</span>
            <span class="summary-value">
              <span v-if="headerInfo.merchantCategoryTag" class="mcc-badge mcc-badge-present">
                ✓ {{ headerInfo.merchantCategoryTag.value }}
              </span>
              <span v-else class="mcc-badge mcc-badge-missing">
                ✗ Not Present
              </span>
            </span>
          </div>
          <div class="summary-item" :class="getTimestampStatusClass()">
            <span class="summary-label">Timestamp:</span>
            <span class="summary-value">
              <span v-if="headerInfo.timestampNested?.['01']" :class="getTimestampBadgeClass()">
                {{ getTimestampStatus() }}
              </span>
              <span v-else class="ts-badge ts-badge-none">
                ✗ Not Present
              </span>
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Data:</span>
            <span class="summary-value">{{ qrResult.length }} bytes / {{ Object.keys(parsedTLV).length }} tags</span>
          </div>
        </div>

        <div class="result-header">
          <h2>TLV Structure</h2>
          <div class="header-buttons">
            <button @click="toggleEditMode" class="copy-btn" :class="{ 'edit-active': editMode }">
              {{ editMode ? '❌ Cancel' : '✏️ Edit' }}
            </button>
            <button @click="copyToClipboard" class="copy-btn">
              📋 {{ copyText }}
            </button>
          </div>
        </div>

        <!-- Edit Panel -->
        <div class="edit-panel" v-if="editMode">
          <div class="edit-panel-header">
            <h3>Edit KHQR Data</h3>
            <span class="edit-info">Modify fields and update checksum</span>
          </div>

          <div class="edit-form-section">
            <div class="edit-field">
              <label>Merchant ID:</label>
              <input v-model="editMerchantID" type="text" class="edit-input" placeholder="e.g., MERCHANT123"
                maxlength="50">
              <span v-if="editMerchantID" class="edit-field-hint">{{ editMerchantID.length }} chars</span>
            </div>

            <div class="edit-field">
              <label>Currency:</label>
              <select v-model="editCurrency" class="edit-select">
                <option value="KHR">KHR (Cambodian Riel)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div class="edit-field">
              <label>Amount:</label>
              <input v-model="editAmount" type="text" class="edit-input" placeholder="e.g., 100.50"
                @input="validateAmount">
              <span v-if="editAmount && !isValidAmount()" class="edit-field-error">⚠️ Invalid amount format</span>
              <span v-else-if="editAmount" class="edit-field-hint">Valid amount</span>
            </div>

            <div class="edit-field">
              <label>Merchant Name:</label>
              <input v-model="editMerchantName" type="text" class="edit-input" placeholder="e.g., My Business"
                maxlength="50">
              <span v-if="editMerchantName" class="edit-field-hint">{{ editMerchantName.length }} chars</span>
            </div>

            <div class="edit-field">
              <label>Merchant City:</label>
              <input v-model="editMerchantCity" type="text" class="edit-input" placeholder="e.g., Phnom Penh"
                maxlength="50">
              <span v-if="editMerchantCity" class="edit-field-hint">{{ editMerchantCity.length }} chars</span>
            </div>

            <div class="edit-field">
              <label>Bank Name:</label>
              <select v-model="editBankName" class="edit-select">
                <option value="">-- Select Bank --</option>
                <option v-for="bank in cambodianBanks" :key="bank" :value="bank">{{ bank }}</option>
              </select>
            </div>

            <div class="edit-field">
              <label>Merchant Category Code (MCC):</label>
              <div class="mcc-selection">
                <input v-model="mccSearchInput" type="text" class="edit-input"
                  placeholder="Search MCC code or description...">
                <select v-model="editMCC" class="edit-select">
                  <option value="">-- Select Category --</option>
                  <option v-for="(desc, code) in filteredMCCForEdit" :key="code" :value="code">
                    {{ code }} - {{ desc }}
                  </option>
                </select>
              </div>
              <span v-if="editMCC" class="edit-field-hint">
                Selected: {{ editMCC }} - {{ merchantCategoryMap[editMCC] }}
              </span>
            </div>
          </div>

          <div class="edit-validation-summary">
            <div class="validation-item" :class="{ 'valid': editMerchantID, 'invalid': !editMerchantID }">
              <span class="validation-icon">{{ editMerchantID ? '✓' : '○' }}</span>
              <span>Merchant ID</span>
            </div>
            <div class="validation-item"
              :class="{ 'valid': editAmount && isValidAmount(), 'invalid': editAmount && !isValidAmount() }">
              <span class="validation-icon">{{ (editAmount && isValidAmount()) ? '✓' : '○' }}</span>
              <span>Amount</span>
            </div>
            <div class="validation-item" :class="{ 'valid': editMerchantName, 'invalid': !editMerchantName }">
              <span class="validation-icon">{{ editMerchantName ? '✓' : '○' }}</span>
              <span>Merchant Name</span>
            </div>
            <div class="validation-item" :class="{ 'valid': editMCC, 'invalid': !editMCC }">
              <span class="validation-icon">{{ editMCC ? '✓' : '○' }}</span>
              <span>MCC</span>
            </div>
          </div>

          <div class="edit-actions">
            <button @click="updateMerchantData" class="btn btn-primary edit-update-btn" :disabled="!canUpdate()">
              🔐 Update & Encrypt Checksum (CRC-16/IBM-3740)
            </button>
            <button @click="resetEditForm" class="btn btn-secondary edit-reset-btn">
              ↻ Reset Form
            </button>
            <button @click="toggleEditMode" class="btn btn-secondary edit-cancel-btn">
              ❌ Cancel
            </button>
          </div>
        </div>

        <div class="tlv-tree">
          <!-- Root tags -->
          <div class="tree-item" v-if="parsedTLV['00']">
            <span class="tree-tag">{{ parsedTLV['00'].tag }}</span>
            <span class="tree-length">{{ String(parsedTLV['00'].length).padStart(2, '0') }}</span>
            <span class="tree-data">{{ parsedTLV['00'].value }}</span>
            <span class="tree-meaning">= Version</span>
          </div>

          <div class="tree-item" v-if="parsedTLV['01']">
            <span class="tree-tag">{{ parsedTLV['01'].tag }}</span>
            <span class="tree-length">{{ String(parsedTLV['01'].length).padStart(2, '0') }}</span>
            <span class="tree-data">{{ parsedTLV['01'].value }}</span>
            <span class="tree-meaning">= {{ getInitiationMethodDescription(parsedTLV['01'].value) }}</span>
          </div>

          <!-- Tag 29: Remittance (nested) -->
          <div class="tree-item tree-parent" v-if="headerInfo.tag29">
            <span class="tree-tag">29</span>
            <span class="tree-length">{{ formatLength(headerInfo.tag29.length) }}</span>
            <span class="tree-meaning">= Remittance</span>

            <!-- Sub-layer for Tag 29 -->
            <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag29Nested).length > 0">
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['00']">
                <span class="tree-tag">00</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['00'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag29Nested['00'].value }}</span>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['01'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag29Nested['01'].value }}</span>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['02'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag29Nested['02'].value }}</span>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['10'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag29Nested['10'].value }}</span>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['11'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag29Nested['11'].value }}</span>
                <span class="tree-meaning">= Reference Number</span>
              </div>
            </div>
          </div>

          <!-- Tag 30: Merchant Info (nested) -->
          <div class="tree-item tree-parent" v-if="headerInfo.tag30">
            <span class="tree-tag">30</span>
            <span class="tree-length">{{ formatLength(headerInfo.tag30.length) }}</span>
            <span class="tree-meaning">= Merchant Info</span>

            <!-- Sub-layer for Tag 30 -->
            <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag30Nested).length > 0">
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['00']">
                <span class="tree-tag">00</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['00'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag30Nested['00'].value }}</span>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['01'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag30Nested['01'].value }}</span>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['02'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag30Nested['02'].value }}</span>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['10'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag30Nested['10'].value }}</span>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['11'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag30Nested['11'].value }}</span>
                <span class="tree-meaning">= Reference Number</span>
              </div>
            </div>
          </div>

          <!-- Tag 51: Bank Info (nested) -->
          <div class="tree-item tree-parent" v-if="headerInfo.bankInfoTag">
            <span class="tree-tag">51</span>
            <span class="tree-length">{{ formatLength(headerInfo.bankInfoTag.length) }}</span>
            <span class="tree-meaning">= Bank Info</span>

            <!-- Sub-layer for Tag 51 -->
            <div class="tree-sublayer" v-if="Object.keys(headerInfo.bankInfoNested).length > 0">
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['00']">
                <span class="tree-tag">00</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['00'].length) }}</span>
                <span class="tree-data">{{ headerInfo.bankInfoNested['00'].value }}</span>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['01'].length) }}</span>
                <span class="tree-data">{{ headerInfo.bankInfoNested['01'].value }}</span>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['02'].length) }}</span>
                <span class="tree-data">{{ headerInfo.bankInfoNested['02'].value }}</span>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['10'].length) }}</span>
                <span class="tree-data">{{ headerInfo.bankInfoNested['10'].value }}</span>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['11'].length) }}</span>
                <span class="tree-data">{{ headerInfo.bankInfoNested['11'].value }}</span>
                <span class="tree-meaning">= Reference Number</span>
              </div>
            </div>
          </div>

          <!-- Tag 52: Merchant Category -->
          <div class="tree-item" v-if="headerInfo.merchantCategoryTag"
            :class="{ 'mcc-tag-present': headerInfo.merchantCategoryTag }">
            <span class="tree-tag mcc-tag-highlight">52</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantCategoryTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.merchantCategoryTag.value }}</span>
            <span class="tree-meaning">= {{ getMerchantCategoryDescription(headerInfo.merchantCategoryTag.value)
              }}</span>
            <span class="mcc-indicator">✓ MCC Present</span>
          </div>

          <!-- Tag 53: Currency -->
          <div class="tree-item" v-if="headerInfo.currencyTag">
            <span class="tree-tag">53</span>
            <span class="tree-length">{{ formatLength(headerInfo.currencyTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.currencyTag.value }}</span>
            <span class="tree-meaning">= {{ getCurrencyDescription(headerInfo.currencyTag.value) }}</span>
          </div>

          <!-- Tag 54: Amount -->
          <div class="tree-item" v-if="headerInfo.amountTag">
            <span class="tree-tag">54</span>
            <span class="tree-length">{{ formatLength(headerInfo.amountTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.amountTag.value }}</span>
            <span class="tree-meaning">= Amount</span>
          </div>

          <!-- Tag 58: Country -->
          <div class="tree-item" v-if="headerInfo.countryTag">
            <span class="tree-tag">58</span>
            <span class="tree-length">{{ formatLength(headerInfo.countryTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.countryTag.value }}</span>
            <span class="tree-meaning">= {{ getCountryDescription(headerInfo.countryTag.value) }}</span>
          </div>

          <!-- Tag 59: Merchant Name -->
          <div class="tree-item" v-if="headerInfo.merchantNameTag">
            <span class="tree-tag">59</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantNameTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.merchantNameTag.value }}</span>
            <span class="tree-meaning">= Merchant Name</span>
          </div>

          <!-- Tag 60: Merchant City -->
          <div class="tree-item" v-if="headerInfo.merchantCityTag">
            <span class="tree-tag">60</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantCityTag.length) }}</span>
            <span class="tree-data">{{ headerInfo.merchantCityTag.value }}</span>
            <span class="tree-meaning">= Merchant City</span>
          </div>

          <!-- Tag 62: Additional Data (nested) -->
          <div class="tree-item tree-parent" v-if="parsedTLV['62']">
            <span class="tree-tag">62</span>
            <span class="tree-length">{{ formatLength(parsedTLV['62'].length) }}</span>
            <span class="tree-meaning">= Additional Data</span>

            <!-- Sub-layer for Tag 62 -->
            <div class="tree-sublayer" v-if="Object.keys(headerInfo.tag62Nested).length > 0">
              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['01'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag62Nested['01'].value }}</span>
                <span class="tree-meaning">= Bill Number</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['02'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag62Nested['02'].value }}</span>
                <span class="tree-meaning">= Mobile Number</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['03']">
                <span class="tree-tag">03</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['03'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag62Nested['03'].value }}</span>
                <span class="tree-meaning">= Store Label</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['07']">
                <span class="tree-tag">07</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['07'].length) }}</span>
                <span class="tree-data">{{ headerInfo.tag62Nested['07'].value }}</span>
                <span class="tree-meaning">= Terminal Number</span>
              </div>

              <!-- Display any other subtags not covered above -->
              <div class="tree-subitem-line" v-for="(subtagData, subtag) in headerInfo.tag62Nested"
                :key="'tag62-' + subtag" v-if="!['01', '02', '03', '07'].includes(subtag)">
                <span class="tree-tag">{{ subtag }}</span>
                <span class="tree-length">{{ formatLength(subtagData.length) }}</span>
                <span class="tree-data">{{ subtagData.value }}</span>
                <span class="tree-meaning">= Additional Info</span>
              </div>
            </div>
          </div>

          <!-- Tag 99: Timestamp (nested) -->
          <div class="tree-item tree-parent" v-if="headerInfo.timestampTag" :class="getTimestampStatusClass()">
            <span class="tree-tag" :class="getTimestampStatusClass()">99</span>
            <span class="tree-length">{{ formatLength(headerInfo.timestampTag.length) }}</span>
            <span class="tree-meaning">= Timestamp</span>
            <span class="ts-tree-indicator">{{ getTimestampStatus() }}</span>

            <!-- Sub-layer for Tag 99 -->
            <div class="tree-sublayer" v-if="Object.keys(headerInfo.timestampNested).length > 0">
              <div class="tree-subitem-line" v-if="headerInfo.timestampNested['00']">
                <span class="tree-tag">00</span>
                <span class="tree-length">{{ formatLength(headerInfo.timestampNested['00'].length) }}</span>
                <span class="tree-data">{{ headerInfo.timestampNested['00'].value }}</span>
                <span class="tree-meaning">= Create Time</span>
              </div>
              <div class="tree-subitem-conversion" v-if="headerInfo.timestampNested['00']"
                :class="{ 'timestamp-expired': isTimestampExpired(headerInfo.timestampNested['00'].value) }">
                <span class="tree-meaning">→ {{
          getTimestampReadableWithoutExpired(headerInfo.timestampNested['00'].value) }}</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.timestampNested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.timestampNested['01'].length) }}</span>
                <span class="tree-data">{{ headerInfo.timestampNested['01'].value }}</span>
                <span class="tree-meaning">= Expiry Time</span>
              </div>
              <div class="tree-subitem-conversion" v-if="headerInfo.timestampNested['01']"
                :class="{ 'timestamp-expired': isTimestampExpired(headerInfo.timestampNested['01'].value), 'timestamp-valid': !isTimestampExpired(headerInfo.timestampNested['01'].value) }">
                <span class="tree-meaning">→ {{
          getTimestampReadableWithoutExpired(headerInfo.timestampNested['01'].value) }}</span>
              </div>
            </div>
          </div>

          <!-- Tag 63: Checksum -->
          <div class="tree-item" v-if="parsedTLV['63']"
            :class="{ 'checksum-valid': validateChecksum(qrResult) === true }">
            <span class="tree-tag">{{ parsedTLV['63'].tag }}</span>
            <span class="tree-length">{{ formatLength(parsedTLV['63'].length) }}</span>
            <span class="tree-data">{{ parsedTLV['63'].value }}</span>
            <span class="tree-meaning">= Checksum (CRC-16/IBM-3740)</span>
            <a v-if="editMode" :href="getCRCCalculatorLink()" target="_blank" class="crc-link">
              🔗 Verify CRC
            </a>
          </div>
        </div>
      </div>

      <!-- Generate Tab -->
      <div v-show="activeTab === 'generate'" class="tab-content">
        <div class="input-area">
          <div class="live-preview-toggle">
            <label class="toggle-label">
              <input type="checkbox" v-model="livePreview" class="toggle-checkbox">
              <span class="toggle-switch"></span>
              <span class="toggle-text">Live Preview</span>
            </label>
          </div>

          <textarea v-model="qrDataToGenerate" placeholder="Enter KHQR data to generate QR code..." class="input-field"
            style="height: 150px;"></textarea>

          <div class="action-buttons">
            <button @click="generateQRCode" class="btn btn-primary" v-if="!livePreview">
              ✨ Generate QR
            </button>
            <button @click="downloadQRCode" v-if="generatedQRImage" class="btn btn-primary">
              ⬇️ Download
            </button>
            <button @click="clearGenerate" class="btn btn-secondary">
              Clear
            </button>
          </div>
        </div>

        <div v-if="generatedQRImage" class="generate-result">
          <h3 class="data-label">Generated QR Code</h3>
          <div class="qr-display-container">
            <img :src="generatedQRImage" alt="Generated QR Code" class="qr-image" />
          </div>

          <div class="download-options">
            <label class="download-label">Download Format:</label>
            <select v-model="downloadFormat" class="download-select">
              <option value="svg">🌐 SVG (Recommended)</option>
              <option value="png">🖼️ PNG</option>
              <option value="jpg">📷 JPG</option>
            </select>
            <button @click="downloadQRCode" class="btn btn-primary">
              ⬇️ Download
            </button>
          </div>

          <div class="qr-data-display">
            <h4 class="data-label" style="margin-top: 1rem;">Data</h4>
            <pre class="data-content">{{ qrDataToGenerate }}</pre>
          </div>
        </div>
      </div>

      <!-- Reference Tab -->
      <div v-show="activeTab === 'reference'" class="tab-content reference-tab">
        <div class="reference-container">
          <div class="reference-section">
            <h3 class="reference-title">🏦 Cambodian Banks (Tag 29/30/51)</h3>
            <div class="reference-grid">
              <div class="reference-item" v-for="bank in cambodianBanks" :key="bank">
                <span class="bank-name">{{ bank }}</span>
              </div>
            </div>
          </div>

          <div class="reference-section">
            <h3 class="reference-title">🏷️ KHQR Tag Definitions</h3>
            <div class="tag-definitions">
              <div class="tag-def">
                <span class="tag-code">00</span>
                <span class="tag-desc">Payload Format Indicator - KHQR version</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">29</span>
                <span class="tag-desc">Merchant Type - Remittance (bank account info)</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">30</span>
                <span class="tag-desc">Merchant Type - Merchant (business info)</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">51</span>
                <span class="tag-desc">Acquirer Merchant ID - Bank and merchant ID</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">52</span>
                <span class="tag-desc">Merchant Category Code - Business type</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">53</span>
                <span class="tag-desc">Currency Code - 840 (USD) or 116 (KHR)</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">54</span>
                <span class="tag-desc">Payment Amount - Transaction value</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">58</span>
                <span class="tag-desc">Country Code - KH (Cambodia)</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">59</span>
                <span class="tag-desc">Merchant Name - Business name</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">60</span>
                <span class="tag-desc">Merchant City - Business location</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">62</span>
                <span class="tag-desc">Additional Data - Extra info (UDF, Bill ID, etc)</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">63</span>
                <span class="tag-desc">CRC-16/IBM-3740 - Checksum for validation</span>
              </div>
              <div class="tag-def">
                <span class="tag-code">99</span>
                <span class="tag-desc">Timestamp - Transaction date/time</span>
              </div>
            </div>
          </div>

          <div class="reference-section">
            <h3 class="reference-title">💼 Merchant Category Codes (MCC)</h3>
            <div class="mcc-search">
              <input v-model="mccSearchFilter" type="text" placeholder="Search MCC by code or description..."
                class="mcc-search-input">
            </div>
            <div class="mcc-list">
              <div class="mcc-item" v-for="(desc, code) in filteredMCCMap" :key="code">
                <span class="mcc-code">{{ code }}</span>
                <span class="mcc-desc">{{ desc }}</span>
              </div>
            </div>
          </div>

          <div class="reference-section">
            <h3 class="reference-title">💱 Currency Codes</h3>
            <div class="currency-grid">
              <div class="currency-item">
                <span class="curr-code">840</span>
                <span class="curr-name">USD (US Dollar)</span>
              </div>
              <div class="currency-item">
                <span class="curr-code">116</span>
                <span class="curr-name">KHR (Cambodian Riel)</span>
              </div>
            </div>
          </div>
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
      },
      parsedTLV: {},
      manualQRInput: '00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6',
      copyText: 'Copy',
      activeTab: 'decode',
      generatedQRImage: null,
      qrDataToGenerate: '00020101021229530016cadikhppxxx@cadi011300100053357230212Canadia Bank52040000530384054031.05802KH5911SAT SOVANDY6010Phnom Penh993400131765174265143011317652606651436304F3F6',
      editMode: false,
      editMerchantID: '',
      editCurrency: 'KHR',
      editAmount: '',
      editMerchantName: '',
      editMerchantCity: '',
      editBankName: '',
      editMCC: '',
      mccSearchInput: '',
      downloadFormat: 'svg',
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
      copiedItemId: null,
      livePreview: true,
      mccSearchFilter: '',
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
        // 0700-0999: Agricultural services
        '0742': 'Veterinary Services',
        '0743': 'Wine Producers',
        '0744': 'Champagne Producers',
        '0763': 'Agricultural Co-operatives',
        '0780': 'Landscaping and Horticultural Services',
        // 1500-2999: Contracted services
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
        // 4000-4799: Transportation
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
        // 4800-4999: Utilities
        '4812': 'Telecommunication Equipment and Telephone Sales',
        '4814': 'Telecommunication Services',
        '4816': 'Computer Network/Information Services',
        '4821': 'Telegraph Services',
        '4829': 'Wire Transfers and Money Orders',
        '4899': 'Cable and Other Pay Television Services',
        '4900': 'Utilities - Electric, Gas, Water and Sanitary',
        // 5000-5599: Retail outlets
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
        // 5500-5599: Automobiles and vehicles
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
        // 5600-5699: Clothing outlets
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
        // 5700-5999: Miscellaneous outlets
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
        // 6000-7299: Service providers
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
        // 7800-7999: Amusement and entertainment
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
        // 8000-8999: Professional services and membership organizations
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
        // 9200-9402: Government services
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
    if (this.manualQRInput.trim()) {
      this.$nextTick(() => {
        this.decodeManualQR();
      });
    }

    if (this.qrDataToGenerate.trim()) {
      this.$nextTick(() => {
        this.generateQRCode();
      });
    }

    document.addEventListener('paste', this.handleGlobalPaste);
  },

  beforeDestroy() {
    document.removeEventListener('paste', this.handleGlobalPaste);
  },

  watch: {
    manualQRInput(newValue) {
      if (newValue.trim()) {
        this.decodeManualQR();
      }
    },

    qrDataToGenerate(newValue) {
      if (newValue.trim() && this.livePreview) {
        this.generateQRPreview();
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
      this.$nextTick(() => {
        if (this.manualQRInput.trim()) {
          const pastedData = this.manualQRInput.trim();
          this.processQRResult(pastedData);
          this.showNotification('✅ QR data pasted and decoded!', 'success');
        }
      });
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
      try {
        const clipboardData = event.clipboardData || window.clipboardData;
        const pastedText = clipboardData.getData('text');

        if (pastedText && pastedText.trim()) {
          if (pastedText.includes('00') && (pastedText.includes('29') || pastedText.includes('30') || pastedText.includes('51'))) {
            this.manualQRInput = pastedText.trim();
            this.$nextTick(() => {
              this.processQRResult(pastedText.trim());
              this.showNotification('✅ QR data pasted and decoded!', 'success');
            });
          }
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

        result[tag] = {
          tag,
          length,
          value,
        };
      }

      return result;
    },

    extractHeaderInfo(tlvData) {
      const info = {};

      if (tlvData['00']) {
        info.payloadIndicator = tlvData['00'];
      }

      if (tlvData['01']) {
        info.initiationMethod = tlvData['01'];
      }

      if (tlvData['30']) {
        info.merchantType = tlvData['30'];
      }

      return info;
    },

    clearData() {
      this.qrResult = '';
      this.headerInfo = {};
      this.parsedTLV = {};
      this.manualQRInput = '';
      this.copyText = 'Copy';
    },

    copyToClipboard() {
      navigator.clipboard.writeText(this.qrResult).then(() => {
        this.copyText = 'Copied!';
        setTimeout(() => {
          this.copyText = 'Copy';
        }, 2000);
      });
    },

    getMerchantCategoryDescription(code) {
      return this.merchantCategoryMap[code] || `Category: ${code}`;
    },

    getInitiationMethodDescription(code) {
      const methodMap = {
        '11': 'Static QR Code',
        '12': 'Dynamic QR Code',
      };
      return methodMap[code] || `Initiation Method: ${code}`;
    },

    toggleEditMode() {
      this.editMode = !this.editMode;
      if (this.editMode) {
        // Initialize all edit fields from current data
        this.editMerchantID = this.headerInfo.tag29Nested?.['01']?.value ||
          this.headerInfo.tag30Nested?.['01']?.value ||
          this.headerInfo.bankInfoNested?.['01']?.value || '';

        this.editCurrency = this.headerInfo.currencyTag?.value === '840' ? 'USD' : 'KHR';

        this.editAmount = this.headerInfo.amountTag?.value || '';

        this.editMerchantName = this.headerInfo.merchantNameTag?.value || '';

        this.editMerchantCity = this.headerInfo.merchantCityTag?.value || '';

        this.editBankName = this.headerInfo.tag29Nested?.['02']?.value ||
          this.headerInfo.tag30Nested?.['02']?.value ||
          this.headerInfo.bankInfoNested?.['02']?.value || '';

        this.editMCC = this.headerInfo.merchantCategoryTag?.value || '';

        this.mccSearchInput = '';
      } else {
        this.resetEditForm();
      }
    },

    updateMerchantData() {
      if (!this.qrResult || !this.canUpdate()) {
        this.showNotification('❌ Please fill in required fields', 'error');
        return;
      }

      try {
        let updatedResult = this.qrResult;

        // Update Merchant ID in Tag 29/30/51
        if (this.editMerchantID) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.tag29Nested?.['01'] ||
            this.headerInfo.tag30Nested?.['01'] ||
            this.headerInfo.bankInfoNested?.['01'],
            '01', this.editMerchantID);
        }

        // Update Currency (Tag 53)
        if (this.headerInfo.currencyTag) {
          const newCurrency = this.editCurrency === 'USD' ? '840' : '116';
          const oldTag53 = '53' + String(this.headerInfo.currencyTag.length).padStart(2, '0') + this.headerInfo.currencyTag.value;
          const newTag53 = '53' + '03' + newCurrency;
          updatedResult = updatedResult.replace(oldTag53, newTag53);
        }

        // Update Amount (Tag 54)
        if (this.editAmount && this.headerInfo.amountTag) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.amountTag, '54', this.editAmount, true);
        }

        // Update Merchant Name (Tag 59)
        if (this.editMerchantName && this.headerInfo.merchantNameTag) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.merchantNameTag, '59', this.editMerchantName, true);
        }

        // Update Merchant City (Tag 60)
        if (this.editMerchantCity && this.headerInfo.merchantCityTag) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.merchantCityTag, '60', this.editMerchantCity, true);
        }

        // Update Bank Name in Tag 29/30/51
        if (this.editBankName) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.tag29Nested?.['02'] ||
            this.headerInfo.tag30Nested?.['02'] ||
            this.headerInfo.bankInfoNested?.['02'],
            '02', this.editBankName);
        }

        // Update MCC (Tag 52)
        if (this.editMCC && this.headerInfo.merchantCategoryTag) {
          updatedResult = this.updateTag(updatedResult,
            this.headerInfo.merchantCategoryTag, '52', this.editMCC);
        }

        // Remove old checksum
        updatedResult = updatedResult.replace(/63\d{2}[A-F0-9a-f]{4}$/, '');

        // Calculate and add new checksum
        const newChecksum = this.calculateCRC16(updatedResult);
        updatedResult = updatedResult + '63' + '04' + newChecksum;

        this.manualQRInput = updatedResult;
        this.processQRResult(updatedResult);
        this.editMode = false;
        this.mccSearchInput = '';

        this.showNotification('✅ Data updated! Checksum encrypted with CRC-16/IBM-3740', 'success');
      } catch (error) {
        console.error('Update error:', error);
        this.showNotification('❌ Error updating QR data', 'error');
      }
    },

    updateTag(qrString, tagData, tagNumber, newValue, useFullTag = false) {
      if (!tagData) return qrString;

      if (useFullTag) {
        const oldTag = tagNumber + String(tagData.length).padStart(2, '0') + tagData.value;
        const newTag = tagNumber + String(newValue.length).padStart(2, '0') + newValue;
        return qrString.replace(oldTag, newTag);
      } else {
        const oldTag = tagNumber + String(tagData.length).padStart(2, '0') + tagData.value;
        const newTag = tagNumber + String(newValue.length).padStart(2, '0') + newValue;
        return qrString.replace(oldTag, newTag);
      }
    },

    isValidAmount() {
      if (!this.editAmount) return false;
      return /^\d+(\.\d{1,2})?$/.test(this.editAmount);
    },

    validateAmount() {
      // Only allow valid amount formats
      this.editAmount = this.editAmount.replace(/[^0-9.]/g, '');
      // Prevent multiple dots
      const parts = this.editAmount.split('.');
      if (parts.length > 2) {
        this.editAmount = parts[0] + '.' + parts[1];
      }
    },

    canUpdate() {
      return this.editMerchantID &&
        this.editMerchantName &&
        this.editAmount &&
        this.isValidAmount() &&
        this.editMCC;
    },

    resetEditForm() {
      this.editMerchantID = '';
      this.editCurrency = 'KHR';
      this.editAmount = '';
      this.editMerchantName = '';
      this.editMerchantCity = '';
      this.editBankName = '';
      this.editMCC = '';
      this.mccSearchInput = '';
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
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Bangkok'
        };
        return date.toLocaleString('en-US', options) + ' ICT';
      } catch {
        return '';
      }
    },

    isTimestampExpired(timestamp) {
      if (!timestamp) return false;

      let ms = parseInt(timestamp, 10);
      if (isNaN(ms)) return false;

      try {
        const date = new Date(ms);
        const now = new Date();
        return date < now;
      } catch {
        return false;
      }
    },

    formatLength(length) {
      return String(length).padStart(2, '0');
    },

    calculateCRC16(data) {
      let crc = 0x0000;

      for (let i = 0; i < data.length; i++) {
        const byte = data.charCodeAt(i);
        crc ^= (byte << 8);

        for (let j = 0; j < 8; j++) {
          crc <<= 1;
          if (crc & 0x10000) {
            crc ^= 0x1021;
          }
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
      let qrWithoutChecksum = this.qrResult;
      qrWithoutChecksum = qrWithoutChecksum.replace(/63\d{2}[A-Fa-f0-9]{4}$/, '');
      const encodedData = encodeURIComponent(qrWithoutChecksum);
      return `https://crccalc.com/?crc=${encodedData}&method=CRC-16/IBM-3740&datatype=ascii&outtype=hex`;
    },

    generateQRPreview() {
      if (this.livePreview && this.qrDataToGenerate.trim()) {
        this.generateQRCode();
      }
    },

    async generateQRCode() {
      if (!this.qrDataToGenerate.trim()) {
        alert('Please enter KHQR data to generate a QR code');
        return;
      }

      try {
        this.generatedQRImage = await QRCode.toDataURL(this.qrDataToGenerate.trim(), {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 300,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Failed to generate QR code. Please check the data format.');
      }
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
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        }, (err, url) => {
          if (err) {
            console.error('Error generating SVG:', err);
            return;
          }
          link.href = url;
          link.download = `khqr-${Date.now()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else if (this.downloadFormat === 'jpg') {
        link.href = this.generatedQRImage;
        link.download = `khqr-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        link.href = this.generatedQRImage;
        link.download = `khqr-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },

    clearGenerate() {
      this.qrDataToGenerate = '';
      this.generatedQRImage = null;
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
      if (!this.headerInfo.timestampNested?.['01']) {
        return '✗ Not Present';
      }

      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();

      if (isNaN(expiryTime)) {
        return '⚠️ Invalid';
      }

      if (expiryTime > now) {
        const timeDiff = expiryTime - now;
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(timeDiff);
        const formattedTime = this.formatTimeDifference(weeks, days, hours, minutes, seconds);
        return `✓ Valid (${formattedTime} left)`;
      } else {
        const timeDiff = now - expiryTime;
        const { weeks, days, hours, minutes, seconds } = this.calculateTimeDifference(timeDiff);
        const formattedTime = this.formatTimeDifference(weeks, days, hours, minutes, seconds);
        return `✗ Expired (${formattedTime} ago)`;
      }
    },

    getTimestampStatusClass() {
      if (!this.headerInfo.timestampNested?.['01']) {
        return 'ts-missing';
      }

      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();

      if (isNaN(expiryTime)) {
        return 'ts-invalid';
      }

      return expiryTime > now ? 'ts-valid' : 'ts-expired';
    },

    getTimestampBadgeClass() {
      if (!this.headerInfo.timestampNested?.['01']) {
        return 'ts-badge ts-badge-none';
      }

      const expiryTime = parseInt(this.headerInfo.timestampNested['01'].value, 10);
      const now = new Date().getTime();

      if (isNaN(expiryTime)) {
        return 'ts-badge ts-badge-invalid';
      }

      return expiryTime > now ? 'ts-badge ts-badge-valid' : 'ts-badge ts-badge-expired';
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
  width: 100vw;
  margin: 0;
  padding: 0;
}

.scanner-card {
  background: white;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border-radius: 0;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.1);
  margin: 0;
}

.header {
  background: linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%);
  border-bottom: 4px solid #0284c7;
  padding: 3rem 2.5rem;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(30, 64, 175, 0.3);
}

.header-content {
  max-width: 100%;
}

.title {
  font-size: 2.2rem;
  font-weight: 900;
  margin: 0;
  color: #ffffff;
  letter-spacing: -1px;
  text-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.8rem 0 0 0;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.tab-navigation {
  display: flex;
  gap: 0;
  padding: 0 2.5rem;
  background: linear-gradient(to right, #ffffff, #f8fafc);
  border-bottom: 3px solid #dbeafe;
  position: sticky;
  top: 6.2rem;
  z-index: 9;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.5rem 2.2rem;
  background: none;
  border: none;
  border-bottom: 4px solid transparent;
  color: #64748b;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.tab-button:hover {
  color: #1e40af;
  background: rgba(30, 64, 175, 0.04);
}

.tab-button.active {
  color: #0ea5e9;
  border-bottom-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.06);
}

.tab-icon {
  font-size: 1.1rem;
}

.tab-text {
  font-weight: 700;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-area {
  padding: 2.8rem 2.5rem;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-bottom: 3px solid #bae6fd;
}

.sample-selector {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2.2rem;
  padding: 1.8rem;
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 2px solid #7dd3fc;
  border-radius: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
}

.sample-selector:hover {
  border-color: #0284c7;
  background: linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);
  transform: translateY(-2px);
}

.sample-label {
  font-size: 0.95rem;
  font-weight: 900;
  color: #0c4a6e;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.sample-select {
  flex: 1;
  padding: 1.1rem;
  border: 2px solid #7dd3fc;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: #0c4a6e;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 800;
}

.sample-select:hover,
.sample-select:focus {
  border-color: #0284c7;
  outline: none;
  background: #f0f9ff;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.15);
}

.input-field {
  width: 100%;
  height: 120px;
  padding: 1.2rem;
  border: 2px solid #7dd3fc;
  border-radius: 12px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  transition: all 0.3s ease;
  color: #0c4a6e;
  background: linear-gradient(to bottom, #ffffff, #f0f9ff);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.input-field:hover {
  border-color: #06b6d4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.input-field:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.18);
}

.input-field::placeholder {
  color: #7dd3fc;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 1.2rem;
  margin-top: 1.5rem;
  width: 100%;
}

.action-buttons .btn {
  flex: 1;
}

.btn {
  padding: 1rem 2.2rem;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  color: #0c4a6e;
  letter-spacing: 0px;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.25);
}

.btn:active {
  transform: translateY(0);
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  font-weight: 800;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
  transform: translateY(-3px);
  box-shadow: 0 12px 20px rgba(14, 165, 233, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
  border: 2px solid #7dd3fc;
  font-weight: 800;
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  border-color: #0284c7;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
}

.paste-btn {
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  font-weight: 900;
  transition: all 0.3s ease;
}

.paste-btn:hover {
  background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
  box-shadow: 0 8px 16px rgba(14, 165, 233, 0.4);
  transform: translateY(-2px);
}

.result-section {
  padding: 2.8rem 2.5rem;
  padding-bottom: 220px;
  border-top: 3px solid #bae6fd;
  overflow-y: auto;
  background: linear-gradient(to bottom, #f0f9ff, #ffffff);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.2rem;
  padding-bottom: 1.4rem;
  border-bottom: 3px solid #7dd3fc;
}

.result-header h2 {
  font-size: 1.5rem;
  margin: 0;
  color: #0c4a6e;
  font-weight: 900;
  letter-spacing: -0.6px;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.copy-btn {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
  border: 2px solid #7dd3fc;
  padding: 0.75rem 1.2rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0px;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.15);
}

.copy-btn:hover {
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  color: white;
  border-color: #0284c7;
  box-shadow: 0 6px 12px rgba(14, 165, 233, 0.3);
  transform: translateY(-2px);
}

.edit-active {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  color: white !important;
  border-color: #dc2626 !important;
}

.edit-panel {
  background: linear-gradient(135deg, #ecf0ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 16px;
  padding: 2.4rem;
  margin-bottom: 2.2rem;
  animation: slideDown 0.4s ease;
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.2);
}

.edit-panel-header {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(14, 165, 233, 0.3);
}

.edit-panel-header h3 {
  font-size: 1.3rem;
  font-weight: 900;
  color: #0c4a6e;
  margin: 0;
}

.edit-info {
  font-size: 0.85rem;
  color: #0284c7;
  font-weight: 600;
}

.edit-form-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.edit-field {
  margin-bottom: 1.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.edit-field label {
  font-weight: 900;
  font-size: 0.9rem;
  color: #0c4a6e;
  letter-spacing: 0.2px;
}

.edit-field-hint {
  display: block;
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 600;
  margin-top: 0.3rem;
}

.edit-field-error {
  display: block;
  font-size: 0.75rem;
  color: #dc2626;
  font-weight: 600;
  margin-top: 0.3rem;
}

.mcc-selection {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.edit-validation-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #7dd3fc;
  border-radius: 12px;
  margin-bottom: 2rem;
  animation: slideUpIn 0.4s ease;
}

.validation-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 700;
}

.validation-item.valid {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
  border: 1px solid #22c55e;
}

.validation-item.invalid {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.validation-icon {
  font-size: 1rem;
  font-weight: 900;
}

.edit-input,
.edit-select {
  padding: 1rem;
  border: 2px solid #7dd3fc;
  border-radius: 10px;
  font-size: 15px;
  font-family: inherit;
  color: #0c4a6e;
  background: white;
  transition: all 0.3s ease;
  font-weight: 700;
}

.edit-input:hover,
.edit-select:hover {
  border-color: #06b6d4;
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.15);
}

.edit-input:focus,
.edit-select:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.2);
}

.edit-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(14, 165, 233, 0.2);
  flex-wrap: wrap;
}

.edit-update-btn {
  flex: 1;
  min-width: 200px;
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  font-weight: 900;
  font-size: 0.95rem;
  padding: 1.1rem 2.2rem;
  transition: all 0.3s ease;
}

.edit-update-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0369a1 0%, #0891b2 100%);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
  transform: translateY(-3px);
}

.edit-update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.edit-reset-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  font-weight: 900;
  padding: 0.85rem 1.5rem;
}

.edit-reset-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #ca8a04 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transform: translateY(-2px);
}

.edit-cancel-btn {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
  border: 2px solid #7dd3fc;
  font-weight: 900;
  padding: 0.85rem 1.5rem;
}

.edit-cancel-btn:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  border-color: #0284c7;
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.3rem;
  padding: 1.8rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 14px;
  margin-bottom: 2rem;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.18);
  animation: slideUpIn 0.5s ease;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.summary-label {
  font-size: 0.85rem;
  font-weight: 900;
  color: #0c4a6e;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.summary-value {
  font-size: 1rem;
  font-weight: 800;
  color: #0284c7;
  word-break: break-word;
}

/* MCC Highlight Styles */
.mcc-warning-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  margin-bottom: 2rem;
  animation: slideUpIn 0.4s ease;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.mcc-warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.mcc-warning-content {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.mcc-warning-title {
  font-weight: 900;
  color: #92400e;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.mcc-warning-desc {
  font-weight: 600;
  color: #b45309;
  font-size: 0.85rem;
}

.mcc-warning-btn {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 900;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.mcc-warning-btn:hover {
  background: linear-gradient(135deg, #d97706 0%, #ca8a04 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.mcc-present {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
  border-left: 4px solid #22c55e !important;
  padding-left: 1rem !important;
}

.mcc-missing {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
  border-left: 4px solid #ef4444 !important;
  padding-left: 1rem !important;
}

.mcc-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.mcc-badge-present {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  border: 2px solid #16a34a;
}

.mcc-badge-missing {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  border: 2px solid #dc2626;
}

/* Timestamp Styles */
.ts-valid {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
  border-left: 4px solid #22c55e !important;
  padding-left: 1rem !important;
}

.ts-expired {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
  border-left: 4px solid #ef4444 !important;
  padding-left: 1rem !important;
}

.ts-invalid {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
  border-left: 4px solid #f59e0b !important;
  padding-left: 1rem !important;
}

.ts-missing {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
  border-left: 4px solid #9ca3af !important;
  padding-left: 1rem !important;
}

.ts-badge {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

.ts-badge-valid {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  border: 2px solid #16a34a;
}

.ts-badge-expired {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  border: 2px solid #dc2626;
}

.ts-badge-invalid {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  border: 2px solid #d97706;
}

.ts-tree-indicator {
  margin-left: auto;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.ts-valid .ts-tree-indicator {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
}

.ts-expired .ts-tree-indicator {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.ts-invalid .ts-tree-indicator {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.timestamp-valid {
  background: #f0fdf4 !important;
  border-color: #86efac !important;
}

.timestamp-valid .tree-meaning {
  color: #16a34a !important;
  font-weight: 700;
}

.live-preview-toggle {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.4rem;
  background: linear-gradient(135deg, #ecf0ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.12);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.toggle-checkbox {
  display: none;
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  background: #d0d0d0;
  border-radius: 14px;
  transition: background-color 0.3s ease;
  border: 2px solid #7dd3fc;
}

.toggle-checkbox:checked+.toggle-switch {
  background: #06b6d4;
  border-color: #0284c7;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  transition: left 0.3s ease;
}

.toggle-checkbox:checked+.toggle-switch::after {
  left: 25px;
}

.toggle-text {
  font-weight: 800;
  color: #0c4a6e;
  font-size: 0.95rem;
}

.tlv-tree {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.8rem;
  line-height: 1.8;
  background: white;
  color: #000000;
}

.tree-item {
  padding: 0.6rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  border-left: 3px solid transparent;
  padding-left: 1rem;
  transition: all 0.3s ease;
  border-radius: 4px;
  cursor: pointer;
}

.tree-item:hover {
  background-color: #f0f9ff;
  border-left-color: #06b6d4;
  padding-left: 1.2rem;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.1);
}

.tree-tag {
  background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
  color: #0c4a6e;
  padding: 0.35rem 0.6rem;
  border: 2px solid #06b6d4;
  font-weight: 800;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.mcc-tag-highlight {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
  color: white !important;
  border: 2px solid #16a34a !important;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.4) !important;
}

.mcc-tag-present {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
}

.mcc-tag-present:hover {
  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%) !important;
}

.mcc-indicator {
  margin-left: auto;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 900;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(34, 197, 94, 0.3);
}

.tree-item:hover .tree-tag {
  background: linear-gradient(135deg, #7dd3fc 0%, #06b6d4 100%);
  color: white;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.tree-length {
  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%);
  color: #0c4a6e;
  padding: 0.35rem 0.6rem;
  border: 2px solid #3b82f6;
  font-weight: 800;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.tree-item:hover .tree-length {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  color: white;
  transform: scale(1.08);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.tree-data {
  background: linear-gradient(135deg, #86efac 0%, #4ade80 100%);
  color: #ffffff;
  padding: 0.35rem 0.6rem;
  border: 2px solid #22c55e;
  font-weight: 700;
  border-radius: 4px;
  word-break: break-all;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.tree-item:hover .tree-data {
  background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.tree-meaning {
  color: #0284c7;
  font-size: 0.8rem;
  font-weight: 700;
  font-style: italic;
  margin-left: 0.8rem;
}

.tree-sublayer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.8rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 0px;
  width: 100%;
  margin-left: 0.5rem;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tree-subitem-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border: 1px solid #000000;
  border-radius: 0px;
  width: 100%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.3s ease forwards;
}

.tree-subitem-line:hover {
  background: #f9f9f9;
  transform: translateX(3px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tree-subitem-conversion {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.4rem 0.5rem;
  font-size: 0.7rem;
  padding-left: 2.5rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 0px;
}

.tree-subitem-conversion .tree-meaning {
  color: #0066cc;
  font-style: normal;
  font-weight: 600;
  margin-left: 0;
}

.timestamp-expired {
  background: #fef2f2 !important;
  border-color: #ef4444 !important;
}

.timestamp-expired .tree-meaning {
  color: #ef4444 !important;
}

.crc-link {
  margin-left: auto;
  color: #0066cc;
  text-decoration: none;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border: 1px solid #0066cc;
  border-radius: 2px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.crc-link:hover {
  background: #0066cc;
  color: white;
}

.checksum-valid {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-left-color: #22c55e !important;
}

.generate-result {
  padding: 1.25rem 1.5rem;
  background: white;
  overflow-y: auto;
}

.qr-display-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
  background: white;
  border: 1px solid #000000;
  border-radius: 0px;
  margin: 1rem 0;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 0px;
  box-shadow: none;
}

.download-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border: 1px solid #000000;
  border-radius: 0px;
  margin-bottom: 1rem;
}

.download-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #000000;
  white-space: nowrap;
}

.download-select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #000000;
  border-radius: 0px;
  font-size: 14px;
  font-family: inherit;
  color: #000000;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.download-select:hover {
  border-color: #000000;
}

.download-select:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.qr-data-display {
  margin-top: 1rem;
}

.data-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #000000;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.data-content {
  background: white;
  border: 1px solid #000000;
  border-radius: 0px;
  padding: 0.75rem;
  margin: 0;
  font-size: 0.75rem;
  overflow-x: auto;
  word-break: break-all;
  color: #000000;
  font-family: 'Monaco', 'Courier New', monospace;
  line-height: 1.4;
  max-height: 200px;
  transition: background-color 0.2s ease;
}

.reference-tab {
  padding: 2.5rem 2rem;
}

.reference-container {
  max-width: 100%;
}

.reference-section {
  margin-bottom: 2.5rem;
  animation: slideUpIn 0.5s ease;
}

.reference-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: #0c4a6e;
  margin-bottom: 1.5rem;
  letter-spacing: -0.5px;
}

.reference-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.reference-item {
  background: linear-gradient(135deg, #ecf0ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.3s ease;
}

.reference-item:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

.bank-name {
  font-weight: 800;
  color: #0284c7;
  font-size: 0.95rem;
}

.tag-definitions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tag-def {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #0284c7;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.tag-def:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  transform: translateX(4px);
}

.tag-code {
  background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
  color: #0c4a6e;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 900;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: center;
}

.tag-desc {
  flex: 1;
  color: #0c4a6e;
  font-weight: 600;
  line-height: 1.5;
}

.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.currency-item {
  background: linear-gradient(135deg, #ecf0ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: center;
}

.curr-code {
  font-weight: 900;
  color: #0284c7;
  font-size: 1.1rem;
}

.curr-name {
  color: #0c4a6e;
  font-weight: 700;
  font-size: 0.9rem;
}

.notification {
  position: fixed;
  top: 30px;
  right: 30px;
  padding: 1.2rem 1.8rem;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.notification-success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border: 2px solid #22c55e;
}

.notification-info {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  color: #0c4a6e;
  border: 2px solid #06b6d4;
}

.notification-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 2px solid #ef4444;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUpIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* MCC Styles */
.mcc-search {
  margin-bottom: 1.5rem;
}

.mcc-search-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #7dd3fc;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  color: #0c4a6e;
  background: white;
  transition: all 0.3s ease;
  font-weight: 800;
}

.mcc-search-input:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.18);
}

.mcc-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  max-height: 500px;
  overflow-y: auto;
}

.mcc-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #7dd3fc;
  border-radius: 10px;
  align-items: center;
  transition: all 0.3s ease;
}

.mcc-item:hover {
  background: linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.2);
}

.mcc-code {
  font-weight: 900;
  color: #0284c7;
  text-align: center;
  font-size: 1rem;
  font-family: 'Monaco', 'Courier New', monospace;
}

.mcc-desc {
  color: #0c4a6e;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 1200px) {
  .tlv-tree {
    font-size: 0.75rem;
  }
}

@media (max-width: 768px) {
  * {
    touch-action: manipulation;
  }

  .header {
    padding: 1.5rem 1.2rem;
    border-bottom: 3px solid #0284c7;
  }

  .title {
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: -0.5px;
  }

  .subtitle {
    font-size: 0.8rem;
    margin-top: 0.4rem;
  }

  .tab-navigation {
    padding: 0 0.8rem;
    gap: 0;
    top: 5rem;
  }

  .tab-button {
    padding: 1rem 1rem;
    font-size: 0.85rem;
    gap: 0.4rem;
    flex: 1;
    justify-content: center;
  }

  .input-area {
    padding: 1.5rem 1.2rem;
  }

  .sample-selector {
    flex-direction: column;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .sample-label {
    font-size: 0.9rem;
    width: 100%;
  }

  .sample-select {
    width: 100%;
    padding: 0.9rem;
    font-size: 15px;
  }

  .input-field {
    height: 120px;
    padding: 1rem;
    font-size: 16px;
    margin-bottom: 1rem;
    border-radius: 10px;
  }

  .action-buttons {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .summary-card {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .summary-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(14, 165, 233, 0.1);
  }

  .summary-item:last-child {
    border-bottom: none;
  }

  .summary-label {
    font-size: 0.8rem;
  }

  .summary-value {
    font-size: 0.95rem;
  }

  .live-preview-toggle {
    padding: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .result-section {
    padding: 1.5rem 1.2rem;
    padding-bottom: 200px;
  }

  .result-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .result-header h2 {
    font-size: 1.3rem;
    width: 100%;
  }

  .header-buttons {
    width: 100%;
    display: flex;
    gap: 0.8rem;
  }

  .copy-btn {
    padding: 0.8rem 1rem;
    font-size: 0.8rem;
    border-radius: 8px;
    flex: 1;
  }

  .edit-panel {
    padding: 1.5rem 1.2rem;
    margin-bottom: 1.5rem;
  }

  .edit-field {
    margin-bottom: 1.5rem;
  }

  .edit-field label {
    font-size: 0.9rem;
  }

  .edit-input,
  .edit-select {
    padding: 0.9rem;
    font-size: 16px;
    border-radius: 8px;
  }

  .edit-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
    padding-top: 1.2rem;
  }

  .edit-update-btn,
  .edit-cancel-btn {
    width: 100%;
    padding: 1rem 1.2rem;
  }

  .tree-item {
    padding: 0.7rem 0;
    gap: 0.4rem;
  }

  .tree-tag,
  .tree-length,
  .tree-data {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
  }

  .tree-meaning {
    font-size: 0.7rem;
    margin-left: 0.4rem;
  }

  .mcc-list {
    max-height: 400px;
  }

  .mcc-item {
    grid-template-columns: 80px 1fr;
    gap: 0.8rem;
    padding: 0.8rem;
  }

  .mcc-code {
    font-size: 0.9rem;
  }

  .mcc-desc {
    font-size: 0.85rem;
  }

  .reference-tab {
    padding: 1.5rem 1.2rem;
  }

  .reference-grid,
  .currency-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.8rem;
  }

  .notification {
    right: 15px;
    top: 20px;
    padding: 1rem 1.2rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 1.2rem 1rem;
  }

  .title {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.75rem;
  }

  .tab-button {
    padding: 0.85rem 0.5rem;
    font-size: 0.75rem;
  }

  .input-area {
    padding: 1.2rem 1rem;
  }

  .sample-selector {
    padding: 1rem;
  }

  .input-field {
    height: 100px;
    padding: 0.9rem;
  }

  .btn {
    padding: 0.85rem 1rem;
    font-size: 0.85rem;
  }

  .summary-card {
    padding: 1rem;
    gap: 0.8rem;
  }

  .result-section {
    padding: 1.2rem 1rem;
  }

  .result-header h2 {
    font-size: 1.2rem;
  }

  .edit-panel {
    padding: 1.2rem 1rem;
  }

  .notification {
    right: 10px;
    top: 15px;
    padding: 0.9rem 1rem;
    font-size: 0.8rem;
  }
}
</style>