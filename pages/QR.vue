<template>
  <div class="container">
    <div class="scanner-card">
      <div class="sticky-head">
        <div class="header">
          <div class="shell">
            <div class="header-content">
              <h1 class="title">KHQR Scanner</h1>
              <p class="subtitle">Decode and generate Cambodian payment QR codes</p>
            </div>
          </div>
        </div>

        <div class="tab-navigation">
          <div class="shell tab-shell">
            <button @click="activeTab = 'decode'" :class="['tab-button', { active: activeTab === 'decode' }]">
              <Icon name="lucide:scan-line" class="tab-icon" aria-hidden="true" />
              <span class="tab-text">Decode</span>
            </button>
            <button @click="activeTab = 'generate'" :class="['tab-button', { active: activeTab === 'generate' }]">
              <Icon name="lucide:qr-code" class="tab-icon" aria-hidden="true" />
              <span class="tab-text">Generate</span>
            </button>
            <button @click="activeTab = 'reference'" :class="['tab-button', { active: activeTab === 'reference' }]">
              <Icon name="lucide:book-open" class="tab-icon" aria-hidden="true" />
              <span class="tab-text">Reference</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Decode Tab -->
      <Transition name="tab">
      <div v-if="activeTab === 'decode'" class="tab-content">
        <div class="input-area">
          <div class="shell">
            <div class="sample-selector">
              <label class="sample-label" for="sample-select">
                <Icon name="lucide:list" aria-hidden="true" />
                Sample data
              </label>
              <select id="sample-select" @change="loadSampleData" class="sample-select">
                <option value="">Select a sample…</option>
                <option v-for="sample in sampleDataOptions" :key="sample.name" :value="sample.data">
                  {{ sample.name }}
                </option>
              </select>
            </div>

            <!-- Image / camera input. `qr-scanner` was a dead import before. -->
            <div class="scan-zone" :class="{ 'is-dragging': dragOver, 'is-busy': scanBusy }"
              @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false" @drop.prevent="onDrop">
              <Icon name="lucide:image-down" class="scan-zone-icon" aria-hidden="true" />
              <p class="scan-zone-text">
                <strong>Drop a QR image here</strong>, paste a screenshot, or
              </p>
              <div class="scan-zone-actions">
                <label class="btn btn-secondary scan-file-btn">
                  <Icon name="lucide:folder-open" aria-hidden="true" />
                  Choose image
                  <input type="file" accept="image/*" class="visually-hidden" @change="onFilePicked">
                </label>
                <button @click="toggleCamera" class="btn btn-secondary">
                  <Icon :name="cameraOn ? 'lucide:camera-off' : 'lucide:camera'" aria-hidden="true" />
                  {{ cameraOn ? 'Stop camera' : 'Use camera' }}
                </button>
              </div>
              <p v-if="scanBusy" class="scan-zone-status">Reading image…</p>
              <p v-if="cameraError" class="scan-zone-error">{{ cameraError }}</p>
            </div>

            <div v-show="cameraOn" class="camera-wrap">
              <video ref="video" class="camera-video" muted playsinline></video>
            </div>

            <label class="field-label" for="qr-payload">Or paste the payload directly</label>
            <textarea id="qr-payload" v-model="manualQRInput" @paste="handlePaste" placeholder="00020101…"
              class="input-field"></textarea>

            <div class="action-buttons">
              <button @click="pasteFromClipboard" class="btn btn-primary paste-btn">
                <Icon name="lucide:clipboard" aria-hidden="true" />
                Paste from clipboard
              </button>
              <button @click="clearData" class="btn btn-secondary">
                Clear
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state: before this, the tab was an input box above a void. -->
        <div v-if="!qrResult" class="empty-state">
          <div class="shell empty-state-inner">
            <Icon name="lucide:scan-line" class="empty-state-icon" aria-hidden="true" />
            <h2 class="empty-state-title">No QR data yet</h2>
            <p class="empty-state-body">
              Paste a KHQR payload above, or pick one of the samples, to see its
              tag-length-value structure broken down and its checksum verified.
            </p>
          </div>
        </div>
      </div>
      </Transition>

      <!-- Results - TLV Tree Structure -->
      <div v-if="qrResult && activeTab === 'decode'" class="result-section shell">
        <!-- Checksum verdict. This is the single most important question about
             a payment QR, and it used to be a faint tint on one row. -->
        <div v-if="checksumInfo()" class="verdict" :class="'verdict-' + checksumInfo().state">
          <Icon
            :name="checksumInfo().state === 'valid' ? 'lucide:shield-check' : checksumInfo().state === 'invalid' ? 'lucide:shield-alert' : 'lucide:shield-question'"
            class="verdict-icon" aria-hidden="true" />
          <div class="verdict-content">
            <span class="verdict-title">
              {{ checksumInfo().state === 'valid' ? 'Checksum valid' : checksumInfo().state === 'invalid' ? 'Checksum does not match' : 'No checksum present' }}
            </span>
            <span class="verdict-desc" v-if="checksumInfo().state === 'invalid'">
              Payload carries <code>{{ checksumInfo().provided }}</code> but the data computes to
              <code>{{ checksumInfo().expected }}</code>. A bank app will reject this code.
            </span>
            <span class="verdict-desc" v-else-if="checksumInfo().state === 'valid'">
              CRC-16/IBM-3740 over the payload matches tag 63.
            </span>
            <span class="verdict-desc" v-else>
              Tag 63 is missing, so this payload cannot be verified.
            </span>
          </div>
          <button @click="copyShareLink" class="verdict-btn">
            <Icon name="lucide:link" aria-hidden="true" />
            Share
          </button>
        </div>

        <!-- Parser diagnostics. Malformed input used to fail silently. -->
        <div v-if="parseIssues.length" class="issues" role="alert">
          <div v-for="(issue, i) in parseIssues" :key="i" class="issue" :class="'issue-' + issue.level">
            <Icon :name="issue.level === 'error' ? 'lucide:circle-x' : 'lucide:triangle-alert'" aria-hidden="true" />
            <span>{{ issue.message }}</span>
          </div>
        </div>

        <!-- MCC Warning Alert -->
        <div v-if="!headerInfo.merchantCategoryTag" class="mcc-warning-alert">
          <Icon name="lucide:triangle-alert" class="mcc-warning-icon" aria-hidden="true" />
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
                <Icon name="lucide:check" aria-hidden="true" />
                {{ headerInfo.merchantCategoryTag.value }}
              </span>
              <span v-else class="mcc-badge mcc-badge-missing">
                <Icon name="lucide:x" aria-hidden="true" />
                Not present
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
                <Icon name="lucide:x" aria-hidden="true" />
                Not present
              </span>
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Data:</span>
            <span class="summary-value">{{ qrResult.length }} bytes / {{ Object.keys(parsedTLV).length }} tags</span>
          </div>
        </div>

        <div class="result-header">
          <h2>TLV structure</h2>
          <div class="header-buttons">
            <button @click="toggleEditMode" class="copy-btn" :class="{ 'edit-active': editMode }">
              <Icon :name="editMode ? 'lucide:x' : 'lucide:pencil'" aria-hidden="true" />
              {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
            <button @click="showAsQR" class="copy-btn">
              <Icon name="lucide:qr-code" aria-hidden="true" />
              Show as QR
            </button>
            <button @click="copyToClipboard" class="copy-btn">
              <Icon name="lucide:copy" aria-hidden="true" />
              {{ copyText }}
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
              <span v-if="editAmount && !isValidAmount()" class="edit-field-error"><Icon name="lucide:triangle-alert" aria-hidden="true" />Invalid amount format</span>
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
              <Icon :name="editMerchantID ? 'lucide:check' : 'lucide:circle'" class="validation-icon" aria-hidden="true" />
              <span>Merchant ID</span>
            </div>
            <div class="validation-item"
              :class="{ 'valid': editAmount && isValidAmount(), 'invalid': editAmount && !isValidAmount() }">
              <Icon :name="(editAmount && isValidAmount()) ? 'lucide:check' : 'lucide:circle'" class="validation-icon" aria-hidden="true" />
              <span>Amount</span>
            </div>
            <div class="validation-item" :class="{ 'valid': editMerchantName, 'invalid': !editMerchantName }">
              <Icon :name="editMerchantName ? 'lucide:check' : 'lucide:circle'" class="validation-icon" aria-hidden="true" />
              <span>Merchant Name</span>
            </div>
            <div class="validation-item" :class="{ 'valid': editMCC, 'invalid': !editMCC }">
              <Icon :name="editMCC ? 'lucide:check' : 'lucide:circle'" class="validation-icon" aria-hidden="true" />
              <span>MCC</span>
            </div>
          </div>

          <div class="edit-actions">
            <button @click="updateMerchantData" class="btn btn-primary edit-update-btn" :disabled="!canUpdate()">
              <Icon name="lucide:shield-check" aria-hidden="true" />
              Update &amp; recompute checksum (CRC-16/IBM-3740)
            </button>
            <button @click="resetEditForm" class="btn btn-secondary edit-reset-btn">
              ↻ Reset Form
            </button>
            <button @click="toggleEditMode" class="btn btn-secondary edit-cancel-btn">
              <Icon name="lucide:x" aria-hidden="true" />
              Cancel
            </button>
          </div>
        </div>

        <div class="tlv-tree" :key="treeAnimKey">
          <!-- Root tags -->
          <div class="tree-item" v-if="parsedTLV['00']">
            <span class="tree-tag">{{ parsedTLV['00'].tag }}</span>
            <span class="tree-length">{{ String(parsedTLV['00'].length).padStart(2, '0') }}</span>
            <template v-if="editMode && inlineTag === '00'">
              <input v-model="inlineValue" :ref="'inline-00'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === parsedTLV['00'].value }" @click="copyValue(parsedTLV['00'].value, parsedTLV['00'].value)" :title="copiedItemId === parsedTLV['00'].value ? 'Copied' : 'Click to copy'">{{ parsedTLV['00'].value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('00', parsedTLV['00'].value)" :title="'Edit tag 00'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= Version</span>
          </div>

          <div class="tree-item" v-if="parsedTLV['01']">
            <span class="tree-tag">{{ parsedTLV['01'].tag }}</span>
            <span class="tree-length">{{ String(parsedTLV['01'].length).padStart(2, '0') }}</span>
            <template v-if="editMode && inlineTag === '01'">
              <input v-model="inlineValue" :ref="'inline-01'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === parsedTLV['01'].value }" @click="copyValue(parsedTLV['01'].value, parsedTLV['01'].value)" :title="copiedItemId === parsedTLV['01'].value ? 'Copied' : 'Click to copy'">{{ parsedTLV['01'].value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('01', parsedTLV['01'].value)" :title="'Edit tag 01'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag29Nested['00'].value }" @click="copyValue(headerInfo.tag29Nested['00'].value, headerInfo.tag29Nested['00'].value)" :title="copiedItemId === headerInfo.tag29Nested['00'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag29Nested['00'].value }}</button>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['01'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag29Nested['01'].value }" @click="copyValue(headerInfo.tag29Nested['01'].value, headerInfo.tag29Nested['01'].value)" :title="copiedItemId === headerInfo.tag29Nested['01'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag29Nested['01'].value }}</button>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['02'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag29Nested['02'].value }" @click="copyValue(headerInfo.tag29Nested['02'].value, headerInfo.tag29Nested['02'].value)" :title="copiedItemId === headerInfo.tag29Nested['02'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag29Nested['02'].value }}</button>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['10'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag29Nested['10'].value }" @click="copyValue(headerInfo.tag29Nested['10'].value, headerInfo.tag29Nested['10'].value)" :title="copiedItemId === headerInfo.tag29Nested['10'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag29Nested['10'].value }}</button>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag29Nested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag29Nested['11'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag29Nested['11'].value }" @click="copyValue(headerInfo.tag29Nested['11'].value, headerInfo.tag29Nested['11'].value)" :title="copiedItemId === headerInfo.tag29Nested['11'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag29Nested['11'].value }}</button>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag30Nested['00'].value }" @click="copyValue(headerInfo.tag30Nested['00'].value, headerInfo.tag30Nested['00'].value)" :title="copiedItemId === headerInfo.tag30Nested['00'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag30Nested['00'].value }}</button>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['01'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag30Nested['01'].value }" @click="copyValue(headerInfo.tag30Nested['01'].value, headerInfo.tag30Nested['01'].value)" :title="copiedItemId === headerInfo.tag30Nested['01'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag30Nested['01'].value }}</button>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['02'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag30Nested['02'].value }" @click="copyValue(headerInfo.tag30Nested['02'].value, headerInfo.tag30Nested['02'].value)" :title="copiedItemId === headerInfo.tag30Nested['02'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag30Nested['02'].value }}</button>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['10'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag30Nested['10'].value }" @click="copyValue(headerInfo.tag30Nested['10'].value, headerInfo.tag30Nested['10'].value)" :title="copiedItemId === headerInfo.tag30Nested['10'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag30Nested['10'].value }}</button>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.tag30Nested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag30Nested['11'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag30Nested['11'].value }" @click="copyValue(headerInfo.tag30Nested['11'].value, headerInfo.tag30Nested['11'].value)" :title="copiedItemId === headerInfo.tag30Nested['11'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag30Nested['11'].value }}</button>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.bankInfoNested['00'].value }" @click="copyValue(headerInfo.bankInfoNested['00'].value, headerInfo.bankInfoNested['00'].value)" :title="copiedItemId === headerInfo.bankInfoNested['00'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.bankInfoNested['00'].value }}</button>
                <span class="tree-meaning">= Bakong ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['01']">
                <span class="tree-tag">01</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['01'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.bankInfoNested['01'].value }" @click="copyValue(headerInfo.bankInfoNested['01'].value, headerInfo.bankInfoNested['01'].value)" :title="copiedItemId === headerInfo.bankInfoNested['01'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.bankInfoNested['01'].value }}</button>
                <span class="tree-meaning">= Merchant ID</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['02'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.bankInfoNested['02'].value }" @click="copyValue(headerInfo.bankInfoNested['02'].value, headerInfo.bankInfoNested['02'].value)" :title="copiedItemId === headerInfo.bankInfoNested['02'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.bankInfoNested['02'].value }}</button>
                <span class="tree-meaning">= Bank Name</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['10']">
                <span class="tree-tag">10</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['10'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.bankInfoNested['10'].value }" @click="copyValue(headerInfo.bankInfoNested['10'].value, headerInfo.bankInfoNested['10'].value)" :title="copiedItemId === headerInfo.bankInfoNested['10'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.bankInfoNested['10'].value }}</button>
                <span class="tree-meaning">= Account Number</span>
              </div>
              <div class="tree-subitem-line" v-if="headerInfo.bankInfoNested['11']">
                <span class="tree-tag">11</span>
                <span class="tree-length">{{ formatLength(headerInfo.bankInfoNested['11'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.bankInfoNested['11'].value }" @click="copyValue(headerInfo.bankInfoNested['11'].value, headerInfo.bankInfoNested['11'].value)" :title="copiedItemId === headerInfo.bankInfoNested['11'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.bankInfoNested['11'].value }}</button>
                <span class="tree-meaning">= Reference Number</span>
              </div>
            </div>
          </div>

          <!-- Tag 52: Merchant Category -->
          <div class="tree-item" v-if="headerInfo.merchantCategoryTag"
            :class="{ 'mcc-tag-present': headerInfo.merchantCategoryTag }">
            <span class="tree-tag mcc-tag-highlight">52</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantCategoryTag.length) }}</span>
            <template v-if="editMode && inlineTag === '52'">
              <input v-model="inlineValue" :ref="'inline-52'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.merchantCategoryTag.value }" @click="copyValue(headerInfo.merchantCategoryTag.value, headerInfo.merchantCategoryTag.value)" :title="copiedItemId === headerInfo.merchantCategoryTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.merchantCategoryTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('52', headerInfo.merchantCategoryTag.value)" :title="'Edit tag 52'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= {{ getMerchantCategoryDescription(headerInfo.merchantCategoryTag.value)
              }}</span>
            <span class="mcc-indicator"><Icon name="lucide:check" aria-hidden="true" />MCC present</span>
          </div>

          <!-- Tag 53: Currency -->
          <div class="tree-item" v-if="headerInfo.currencyTag">
            <span class="tree-tag">53</span>
            <span class="tree-length">{{ formatLength(headerInfo.currencyTag.length) }}</span>
            <template v-if="editMode && inlineTag === '53'">
              <input v-model="inlineValue" :ref="'inline-53'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.currencyTag.value }" @click="copyValue(headerInfo.currencyTag.value, headerInfo.currencyTag.value)" :title="copiedItemId === headerInfo.currencyTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.currencyTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('53', headerInfo.currencyTag.value)" :title="'Edit tag 53'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= {{ getCurrencyDescription(headerInfo.currencyTag.value) }}</span>
          </div>

          <!-- Tag 54: Amount -->
          <div class="tree-item" v-if="headerInfo.amountTag">
            <span class="tree-tag">54</span>
            <span class="tree-length">{{ formatLength(headerInfo.amountTag.length) }}</span>
            <template v-if="editMode && inlineTag === '54'">
              <input v-model="inlineValue" :ref="'inline-54'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.amountTag.value }" @click="copyValue(headerInfo.amountTag.value, headerInfo.amountTag.value)" :title="copiedItemId === headerInfo.amountTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.amountTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('54', headerInfo.amountTag.value)" :title="'Edit tag 54'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= Amount</span>
          </div>

          <!-- Tag 58: Country -->
          <div class="tree-item" v-if="headerInfo.countryTag">
            <span class="tree-tag">58</span>
            <span class="tree-length">{{ formatLength(headerInfo.countryTag.length) }}</span>
            <template v-if="editMode && inlineTag === '58'">
              <input v-model="inlineValue" :ref="'inline-58'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.countryTag.value }" @click="copyValue(headerInfo.countryTag.value, headerInfo.countryTag.value)" :title="copiedItemId === headerInfo.countryTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.countryTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('58', headerInfo.countryTag.value)" :title="'Edit tag 58'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= {{ getCountryDescription(headerInfo.countryTag.value) }}</span>
          </div>

          <!-- Tag 59: Merchant Name -->
          <div class="tree-item" v-if="headerInfo.merchantNameTag">
            <span class="tree-tag">59</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantNameTag.length) }}</span>
            <template v-if="editMode && inlineTag === '59'">
              <input v-model="inlineValue" :ref="'inline-59'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.merchantNameTag.value }" @click="copyValue(headerInfo.merchantNameTag.value, headerInfo.merchantNameTag.value)" :title="copiedItemId === headerInfo.merchantNameTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.merchantNameTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('59', headerInfo.merchantNameTag.value)" :title="'Edit tag 59'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
            <span class="tree-meaning">= Merchant Name</span>
          </div>

          <!-- Tag 60: Merchant City -->
          <div class="tree-item" v-if="headerInfo.merchantCityTag">
            <span class="tree-tag">60</span>
            <span class="tree-length">{{ formatLength(headerInfo.merchantCityTag.length) }}</span>
            <template v-if="editMode && inlineTag === '60'">
              <input v-model="inlineValue" :ref="'inline-60'" class="inline-input"
                @keyup.enter="commitInlineEdit" @keyup.esc="cancelInlineEdit" maxlength="99">
              <button type="button" class="inline-ok" @click="commitInlineEdit" title="Save">
                <Icon name="lucide:check" aria-hidden="true" />
              </button>
              <button type="button" class="inline-cancel" @click="cancelInlineEdit" title="Cancel">
                <Icon name="lucide:x" aria-hidden="true" />
              </button>
            </template>
            <template v-else>
              <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.merchantCityTag.value }" @click="copyValue(headerInfo.merchantCityTag.value, headerInfo.merchantCityTag.value)" :title="copiedItemId === headerInfo.merchantCityTag.value ? 'Copied' : 'Click to copy'">{{ headerInfo.merchantCityTag.value }}</button>
              <button v-if="editMode" type="button" class="inline-edit-btn"
                @click="startInlineEdit('60', headerInfo.merchantCityTag.value)" :title="'Edit tag 60'">
                <Icon name="lucide:pencil" aria-hidden="true" />
              </button>
            </template>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag62Nested['01'].value }" @click="copyValue(headerInfo.tag62Nested['01'].value, headerInfo.tag62Nested['01'].value)" :title="copiedItemId === headerInfo.tag62Nested['01'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag62Nested['01'].value }}</button>
                <span class="tree-meaning">= Bill Number</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['02']">
                <span class="tree-tag">02</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['02'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag62Nested['02'].value }" @click="copyValue(headerInfo.tag62Nested['02'].value, headerInfo.tag62Nested['02'].value)" :title="copiedItemId === headerInfo.tag62Nested['02'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag62Nested['02'].value }}</button>
                <span class="tree-meaning">= Mobile Number</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['03']">
                <span class="tree-tag">03</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['03'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag62Nested['03'].value }" @click="copyValue(headerInfo.tag62Nested['03'].value, headerInfo.tag62Nested['03'].value)" :title="copiedItemId === headerInfo.tag62Nested['03'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag62Nested['03'].value }}</button>
                <span class="tree-meaning">= Store Label</span>
              </div>

              <div class="tree-subitem-line" v-if="headerInfo.tag62Nested['07']">
                <span class="tree-tag">07</span>
                <span class="tree-length">{{ formatLength(headerInfo.tag62Nested['07'].length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.tag62Nested['07'].value }" @click="copyValue(headerInfo.tag62Nested['07'].value, headerInfo.tag62Nested['07'].value)" :title="copiedItemId === headerInfo.tag62Nested['07'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.tag62Nested['07'].value }}</button>
                <span class="tree-meaning">= Terminal Number</span>
              </div>

              <!-- Display any other subtags not covered above -->
              <div class="tree-subitem-line" v-for="(subtagData, subtag) in headerInfo.tag62Nested"
                :key="'tag62-' + subtag" v-if="!['01', '02', '03', '07'].includes(subtag)">
                <span class="tree-tag">{{ subtag }}</span>
                <span class="tree-length">{{ formatLength(subtagData.length) }}</span>
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === subtagData.value }" @click="copyValue(subtagData.value, subtagData.value)" :title="copiedItemId === subtagData.value ? 'Copied' : 'Click to copy'">{{ subtagData.value }}</button>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.timestampNested['00'].value }" @click="copyValue(headerInfo.timestampNested['00'].value, headerInfo.timestampNested['00'].value)" :title="copiedItemId === headerInfo.timestampNested['00'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.timestampNested['00'].value }}</button>
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
                <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === headerInfo.timestampNested['01'].value }" @click="copyValue(headerInfo.timestampNested['01'].value, headerInfo.timestampNested['01'].value)" :title="copiedItemId === headerInfo.timestampNested['01'].value ? 'Copied' : 'Click to copy'">{{ headerInfo.timestampNested['01'].value }}</button>
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
            <button type="button" class="tree-data" :class="{ 'is-copied': copiedItemId === parsedTLV['63'].value }" @click="copyValue(parsedTLV['63'].value, parsedTLV['63'].value)" :title="copiedItemId === parsedTLV['63'].value ? 'Copied' : 'Click to copy'">{{ parsedTLV['63'].value }}</button>
            <span class="tree-meaning">= Checksum (CRC-16/IBM-3740)</span>
            <a v-if="editMode" :href="getCRCCalculatorLink()" target="_blank" class="crc-link">
              <Icon name="lucide:external-link" aria-hidden="true" />
              Verify CRC
            </a>
          </div>
        </div>
      </div>

      <!-- Generate Tab -->
      <Transition name="tab">
      <div v-if="activeTab === 'generate'" class="tab-content">
        <div class="input-area">
          <div class="shell">
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
              <Icon name="lucide:qr-code" aria-hidden="true" />
              Generate QR
            </button>
            <button @click="downloadQRCode" v-if="generatedQRImage" class="btn btn-primary">
              <Icon name="lucide:download" aria-hidden="true" />
              Download
            </button>
            <button @click="clearGenerate" class="btn btn-secondary">
              Clear
            </button>
          </div>
          </div>
        </div>

        <div v-if="generatedQRImage" class="generate-result shell">
          <div class="generate-head">
            <h3 class="data-label">Generated QR code</h3>
            <button @click="decodeGenerated" class="copy-btn">
              <Icon name="lucide:scan-line" aria-hidden="true" />
              Decode this
            </button>
          </div>
          <div class="qr-display-container">
            <img :src="generatedQRImage" alt="Generated QR Code" class="qr-image" />
          </div>

          <div class="download-options">
            <label class="download-label">Download Format:</label>
            <select v-model="downloadFormat" class="download-select">
              <option value="svg">SVG (recommended)</option>
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
            <button @click="downloadQRCode" class="btn btn-primary">
              <Icon name="lucide:download" aria-hidden="true" />
              Download
            </button>
          </div>

          <div class="qr-data-display">
            <h4 class="data-label" style="margin-top: 1rem;">Data</h4>
            <pre class="data-content">{{ qrDataToGenerate }}</pre>
          </div>
        </div>
      </div>
      </Transition>

      <!-- Reference Tab -->
      <Transition name="tab">
      <div v-if="activeTab === 'reference'" class="tab-content reference-tab">
        <div class="reference-container shell">
          <div class="reference-section">
            <h3 class="reference-title"><Icon name="lucide:landmark" aria-hidden="true" />Cambodian banks (tag 29/30/51)</h3>
            <div class="reference-grid">
              <div class="reference-item" v-for="bank in cambodianBanks" :key="bank">
                <span class="bank-name">{{ bank }}</span>
              </div>
            </div>
          </div>

          <div class="reference-section">
            <h3 class="reference-title"><Icon name="lucide:tag" aria-hidden="true" />KHQR tag definitions</h3>
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
            <h3 class="reference-title"><Icon name="lucide:briefcase" aria-hidden="true" />Merchant category codes (MCC)</h3>
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
            <h3 class="reference-title"><Icon name="lucide:arrow-right-left" aria-hidden="true" />Currency codes</h3>
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
      </Transition>

    </div>

    <!-- Toasts render here so scoped styles apply and AT is notified. -->
    <TransitionGroup name="toast" tag="div" class="toast-host" role="status" aria-live="polite">
      <div v-for="toast in toasts" :key="toast.id" class="notification" :class="'notification-' + toast.type">
        {{ toast.message }}
      </div>
    </TransitionGroup>
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
      // Toasts live in the template so scoped styles and aria-live apply.
      toasts: [],
      toastSeq: 0,
      // Parser diagnostics surfaced to the user instead of failing silently.
      parseIssues: [],
      // Ticks once a second so timestamp countdowns stay live.
      now: Date.now(),
      clockTimer: null,
      // Image / camera scanning.
      scanBusy: false,
      dragOver: false,
      cameraOn: false,
      cameraError: null,
      qrScanner: null,
      // Inline tag editing in the TLV tree.
      inlineTag: null,
      inlineValue: '',
      // Bumped only by explicit load actions (paste, sample, scan, share link).
      // Typing in the textarea re-decodes on every keystroke, so keying the
      // tree's entrance on the decode itself would replay it per character.
      treeAnimKey: 0,
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
    // A payload in the URL wins over the built-in default so links are shareable.
    const fromUrl = new URLSearchParams(window.location.search).get('d');
    if (fromUrl && fromUrl.trim()) {
      this.treeAnimKey++;
      this.manualQRInput = fromUrl.trim();
    }

    // Timestamp countdowns are rendered from `now`; without this they froze at
    // whatever the value was on first render.
    this.clockTimer = setInterval(() => {
      this.now = Date.now();
    }, 1000);

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

  // Was `beforeDestroy`, which is a Vue 2 hook and never fires under Vue 3 —
  // the paste listener leaked and kept firing against a torn-down component.
  beforeUnmount() {
    document.removeEventListener('paste', this.handleGlobalPaste);
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.stopCamera();
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
    // ------------------------------------------------------- URL state ----
    syncUrl(payload) {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      if (payload) url.searchParams.set('d', payload);
      else url.searchParams.delete('d');
      window.history.replaceState({}, '', url);
    },

    async copyShareLink() {
      try {
        await navigator.clipboard.writeText(window.location.href);
        this.showNotification('Share link copied', 'success');
      } catch {
        this.showNotification('Could not copy the link', 'error');
      }
    },

    // ------------------------------------------------ image / camera scan --
    // `qr-scanner` was imported but never called, so the page could only ever
    // accept a payload that had already been decoded somewhere else.
    async scanImageFile(file) {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        this.showNotification('That file is not an image', 'error');
        return;
      }
      this.scanBusy = true;
      try {
        const result = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
        const text = (result && result.data ? result.data : result || '').trim();
        if (!text) throw new Error('empty');
        this.treeAnimKey++;
        this.manualQRInput = text;
        this.activeTab = 'decode';
        this.showNotification('QR code read from image', 'success');
      } catch (error) {
        console.error('Image scan failed:', error);
        this.showNotification('No QR code found in that image', 'error');
      } finally {
        this.scanBusy = false;
      }
    },

    onFilePicked(event) {
      const file = event.target.files && event.target.files[0];
      this.scanImageFile(file);
      event.target.value = '';
    },

    onDrop(event) {
      this.dragOver = false;
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      this.scanImageFile(file);
    },

    async toggleCamera() {
      if (this.cameraOn) {
        this.stopCamera();
        return;
      }
      this.cameraError = null;
      this.cameraOn = true;
      await this.$nextTick();
      try {
        this.qrScanner = new QrScanner(
          this.$refs.video,
          (result) => {
            const text = (result && result.data ? result.data : result || '').trim();
            if (!text) return;
            this.treeAnimKey++;
            this.manualQRInput = text;
            this.stopCamera();
            this.showNotification('QR code scanned', 'success');
          },
          { highlightScanRegion: true, highlightCodeOutline: true, maxScansPerSecond: 5 },
        );
        await this.qrScanner.start();
      } catch (error) {
        console.error('Camera failed:', error);
        this.cameraError = 'Camera unavailable. Check browser permissions, or use an image instead.';
        this.stopCamera();
      }
    },

    stopCamera() {
      if (this.qrScanner) {
        this.qrScanner.stop();
        this.qrScanner.destroy();
        this.qrScanner = null;
      }
      this.cameraOn = false;
    },

    // ------------------------------------------------ decode <-> generate --
    showAsQR() {
      this.qrDataToGenerate = this.qrResult;
      this.activeTab = 'generate';
      this.generateQRCode();
      this.showNotification('Rendered from the decoded payload', 'info');
    },

    decodeGenerated() {
      this.treeAnimKey++;
      this.manualQRInput = this.qrDataToGenerate;
      this.activeTab = 'decode';
      this.showNotification('Decoding the generated payload', 'info');
    },

    // --------------------------------------------------- granular copying --
    async copyValue(text, id) {
      try {
        await navigator.clipboard.writeText(text);
        this.copiedItemId = id;
        setTimeout(() => {
          if (this.copiedItemId === id) this.copiedItemId = null;
        }, 1600);
      } catch {
        this.showNotification('Could not copy that value', 'error');
      }
    },

    // ------------------------------------------------- inline tag editing --
    startInlineEdit(tag, value) {
      this.inlineTag = tag;
      this.inlineValue = value;
      this.$nextTick(() => {
        const el = this.$refs['inline-' + tag];
        const input = Array.isArray(el) ? el[0] : el;
        if (input) input.focus();
      });
    },

    cancelInlineEdit() {
      this.inlineTag = null;
      this.inlineValue = '';
    },

    // Rebuilds the payload from the parsed tags, so the length header of the
    // edited tag is recomputed and the CRC is taken over the new bytes.
    commitInlineEdit() {
      const tag = this.inlineTag;
      if (!tag) return;
      const value = this.inlineValue;

      if (value.length > 99) {
        this.showNotification('A single tag value cannot exceed 99 characters', 'error');
        return;
      }

      let rebuilt = '';
      for (const key of Object.keys(this.parsedTLV)) {
        if (key === '63') continue;
        const entry = this.parsedTLV[key];
        const v = key === tag ? value : entry.value;
        rebuilt += key + String(v.length).padStart(2, '0') + v;
      }
      rebuilt += '6304' + this.calculateCRC16(rebuilt + '6304');

      this.cancelInlineEdit();
      this.manualQRInput = rebuilt;
      this.showNotification(`Tag ${tag} updated and checksum recomputed`, 'success');
    },

    isNestedTag(tag) {
      return ['29', '30', '51', '62', '99'].includes(tag);
    },

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
            this.treeAnimKey++;
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

        // A pasted screenshot is at least as common as a pasted payload string.
        const items = clipboardData.items ? Array.from(clipboardData.items) : [];
        const imageItem = items.find((i) => i.type && i.type.startsWith('image/'));
        if (imageItem) {
          const file = imageItem.getAsFile();
          if (file) {
            event.preventDefault();
            this.scanImageFile(file);
            return;
          }
        }

        const pastedText = clipboardData.getData('text');

        if (pastedText && pastedText.trim()) {
          if (pastedText.includes('00') && (pastedText.includes('29') || pastedText.includes('30') || pastedText.includes('51'))) {
            this.treeAnimKey++;
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
        this.treeAnimKey++;
        this.manualQRInput = data;
        this.$nextTick(() => {
          event.target.value = '';
        });
      }
    },

    processQRResult(qrString) {
      const issues = [];
      this.qrResult = qrString;
      this.parsedTLV = this.parseTLVStructure(qrString, issues);

      if (!Object.keys(this.parsedTLV).length) {
        issues.unshift({
          level: 'error',
          message: 'No TLV tags could be read. This does not look like a KHQR payload.',
        });
      } else if (!this.parsedTLV['00']) {
        issues.unshift({
          level: 'warn',
          message: 'Tag 00 (Payload Format Indicator) is missing — a valid KHQR always starts with it.',
        });
      }
      this.parseIssues = issues;
      this.syncUrl(qrString);

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

    parseTLVStructure(dataString, issues = null) {
      const result = {};
      let position = 0;
      const note = (level, message) => {
        if (issues) issues.push({ level, message });
      };

      while (position < dataString.length - 1) {
        if (position + 2 > dataString.length) {
          note('error', `Trailing byte at offset ${position} — expected a 2-digit tag.`);
          break;
        }
        const tag = dataString.substring(position, position + 2);
        position += 2;

        if (!/^\d{2}$/.test(tag)) {
          note('error', `Offset ${position - 2}: "${tag}" is not a valid 2-digit tag. Parsing stopped.`);
          break;
        }

        if (position + 2 > dataString.length) {
          note('error', `Tag ${tag} at offset ${position - 2} has no length field.`);
          break;
        }
        const lengthStr = dataString.substring(position, position + 2);
        const length = parseInt(lengthStr, 10);
        position += 2;

        if (isNaN(length) || length < 0) {
          note('error', `Tag ${tag}: length "${lengthStr}" is not a number. Parsing stopped.`);
          break;
        }

        if (position + length > dataString.length) {
          note('warn', `Tag ${tag} declares length ${length} but only ${dataString.length - position} bytes remain — attempting recovery.`);
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
          if (!found) {
            note('error', `Could not recover after tag ${tag}; the remainder of the payload was discarded.`);
            break;
          }
          note('warn', `Recovered by resynchronising at offset ${position} — values near tag ${tag} may be wrong.`);
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
      this.parseIssues = [];
      this.cancelInlineEdit();
      this.syncUrl('');
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

        // Calculate and add new checksum. The CRC covers the "6304" header
        // itself, so it must be appended before the digest is taken.
        const newChecksum = this.calculateCRC16(updatedResult + '6304');
        updatedResult = updatedResult + '6304' + newChecksum;

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

    // Rendered from the template rather than document.createElement: scoped
    // styles only match elements carrying the component's data-v attribute, so
    // the hand-built node was never styled — and never announced either.
    showNotification(message, type = 'info') {
      const id = ++this.toastSeq;
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3600);
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

    // CRC-16/IBM-3740 (a.k.a. CCITT-FALSE): poly 0x1021, init 0xFFFF, no
    // reflection, xorout 0x0000. This previously initialised to 0x0000, which
    // is CRC-16/XMODEM — a different algorithm that never matches a real KHQR.
    calculateCRC16(data) {
      let crc = 0xFFFF;

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
      // EMVCo computes the CRC over everything up to AND INCLUDING the "6304"
      // tag+length header. The previous code stripped "6304" as well, so even a
      // correct CRC routine would have disagreed with every real payload.
      const dataThroughTag63 = qrData.slice(0, -4);

      return providedChecksum === this.calculateCRC16(dataThroughTag63);
    },

    checksumInfo() {
      if (!this.qrResult) return null;
      const match = this.qrResult.match(/63\d{2}([A-Fa-f0-9]{4})$/);
      if (!match) {
        return { state: 'missing', provided: null, expected: null };
      }
      const provided = match[1].toUpperCase();
      const expected = this.calculateCRC16(this.qrResult.slice(0, -4));
      return {
        state: provided === expected ? 'valid' : 'invalid',
        provided,
        expected,
      };
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
        this.showNotification('Enter KHQR data to generate a QR code', 'error');
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
        this.showNotification('Could not generate a QR code from that data', 'error');
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
      const now = this.now;

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
/* ============================================================================
   KHQR Scanner — "inspector" visual language.

   One system, applied everywhere: flat surfaces, hairline borders, tight
   corners, monospace for payload data, and a single accent colour used only
   where something is genuinely interactive or genuinely wrong.

   Scales below replace what were ~30 ad-hoc hex values, 29 distinct rem
   spacings, and 69 gradients.
   ========================================================================= */

.container {
  /* -- Neutral ramp ------------------------------------------------------ */
  --n0: #ffffff;
  --n25: #fcfcfd;
  --n50: #f8fafc;
  --n100: #f1f5f9;
  --n200: #e2e8f0;
  --n300: #cbd5e1;
  --n400: #94a3b8;
  --n500: #64748b;
  --n600: #475569;
  --n700: #334155;
  --n800: #1e293b;
  --n900: #0f172a;

  /* -- Single accent ----------------------------------------------------- */
  --a50: #eff6ff;
  --a100: #dbeafe;
  --a200: #bfdbfe;
  --a500: #3b82f6;
  --a600: #2563eb;
  --a700: #1d4ed8;

  /* -- Semantic (used only for state, never decoration) ------------------ */
  --ok-bg: #f0fdf4;
  --ok-bd: #bbf7d0;
  --ok-fg: #15803d;
  --warn-bg: #fffbeb;
  --warn-bd: #fde68a;
  --warn-fg: #b45309;
  --err-bg: #fef2f2;
  --err-bd: #fecaca;
  --err-fg: #b91c1c;

  /* -- Surfaces / text (remapped wholesale for dark mode) ---------------- */
  --bg: var(--n50);
  --surface: var(--n0);
  --surface-2: var(--n50);
  --surface-3: var(--n100);
  --border: var(--n200);
  --border-strong: var(--n300);
  --text: var(--n900);
  --text-muted: var(--n600);
  --text-subtle: var(--n500);
  --accent: var(--a600);
  --accent-weak: var(--a50);
  --accent-border: var(--a200);

  /* -- 4px spacing scale ------------------------------------------------- */
  --s1: 4px;
  --s2: 8px;
  --s3: 12px;
  --s4: 16px;
  --s5: 20px;
  --s6: 24px;
  --s8: 32px;
  --s10: 40px;
  --s12: 48px;
  --s16: 64px;

  /* -- Radii: tight, three steps ----------------------------------------- */
  --r-sm: 3px;
  --r-md: 4px;
  --r-lg: 6px;

  /* -- Type -------------------------------------------------------------- */
  --fw-normal: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Monaco, 'Courier New', monospace;

  /* -- Motion ------------------------------------------------------------ */
  --dur-fast: 120ms;
  --dur-base: 180ms;
  --ease-out: cubic-bezier(0.2, 0, 0, 1);

  display: flex;
  min-height: 100vh;
  width: 100%;
  background: var(--bg);
  color: var(--text);
  font-weight: var(--fw-normal);
  font-size: 14px;
  line-height: 1.55;
}

@media (prefers-color-scheme: dark) {
  .container {
    --bg: var(--n900);
    --surface: #131c2b;
    --surface-2: #0d1420;
    --surface-3: #1b2537;
    --border: #24304a;
    --border-strong: #33415c;
    --text: var(--n100);
    --text-muted: var(--n400);
    --text-subtle: var(--n500);
    --accent: #60a5fa;
    --accent-weak: #12203a;
    --accent-border: #1e3a63;

    --ok-bg: #0c1f16;
    --ok-bd: #1a4531;
    --ok-fg: #4ade80;
    --warn-bg: #241a08;
    --warn-bd: #4d3711;
    --warn-fg: #fbbf24;
    --err-bg: #2a1213;
    --err-bd: #582226;
    --err-fg: #f87171;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* @nuxt/icon renders icons as mask-image spans, not inline <svg>. They take
   their colour from `currentColor`, so state comes from CSS alone. */
.iconify {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: -0.125em;
}

.scanner-card {
  background: var(--bg);
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Content column. Previously the page was 100vw edge-to-edge, so TLV rows
   stretched the full width of a large display. */
.shell {
  width: 100%;
  max-width: 1180px;
  margin-inline: auto;
}

/* ---------------------------------------------------------------- header -- */

.sticky-head {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.header {
  padding: var(--s8) var(--s6) var(--s6);
}

.title {
  font-size: 20px;
  font-weight: var(--fw-semibold);
  letter-spacing: -0.01em;
  color: var(--text);
  text-wrap: balance;
}

.subtitle {
  margin-top: var(--s1);
  font-size: 14px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

/* ------------------------------------------------------------------ tabs -- */

.tab-navigation {
  padding-inline: var(--s6);
}

.tab-shell {
  display: flex;
  gap: var(--s1);
}

.tab-button {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  /* Optical alignment: icon side carries 2px less than the text side. */
  padding: var(--s3) var(--s4) var(--s3) 14px;
  min-height: 40px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font: inherit;
  font-weight: var(--fw-medium);
  font-size: 14px;
  cursor: pointer;
  transition-property: color, border-bottom-color, background-color, scale;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.tab-button:hover {
  color: var(--text);
}

.tab-button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-button:active {
  scale: 0.96;
}

.tab-button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

/* Icons inherit colour and sit on the text's optical line. */
.tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* ----------------------------------------------------------- input areas -- */

.input-area {
  padding: var(--s6);
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.sample-selector {
  display: flex;
  align-items: center;
  gap: var(--s3);
  margin-bottom: var(--s4);
}

.sample-label {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--text-muted);
  white-space: nowrap;
}

.sample-label .iconify {
  width: 15px;
  height: 15px;
}

.sample-select,
.edit-select,
.download-select {
  padding: var(--s2) var(--s3);
  min-height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font: inherit;
  font-size: 14px;
  font-weight: var(--fw-normal);
  color: var(--text);
  background: var(--surface);
  cursor: pointer;
  transition-property: border-color, box-shadow;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.sample-select {
  flex: 1;
  min-width: 0;
}

.sample-select:hover,
.edit-select:hover,
.download-select:hover,
.edit-input:hover {
  border-color: var(--n400);
}

.input-field {
  width: 100%;
  height: 112px;
  padding: var(--s3);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font-family: var(--mono);
  font-size: 13px;
  font-weight: var(--fw-normal);
  line-height: 1.6;
  resize: vertical;
  color: var(--text);
  background: var(--surface);
  transition-property: border-color, box-shadow;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.input-field:hover {
  border-color: var(--n400);
}

/* Was #7dd3fc on white — roughly 1.6:1. */
.input-field::placeholder {
  color: var(--text-subtle);
}

.sample-select:focus-visible,
.edit-select:focus-visible,
.download-select:focus-visible,
.input-field:focus-visible,
.edit-input:focus-visible,
.mcc-search-input:focus-visible {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-weak);
}

.action-buttons {
  display: flex;
  gap: var(--s2);
  margin-top: var(--s4);
}

/* --------------------------------------------------------------- buttons -- */

.btn,
.copy-btn,
.edit-update-btn,
.edit-reset-btn,
.edit-cancel-btn,
.mcc-warning-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  padding: var(--s2) var(--s4);
  min-height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-size: 14px;
  font-weight: var(--fw-medium);
  cursor: pointer;
  white-space: nowrap;
  transition-property: background-color, border-color, color, scale, box-shadow;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.btn .iconify,
.copy-btn .iconify,
.edit-update-btn .iconify,
.edit-cancel-btn .iconify,
.mcc-warning-btn .iconify,
.crc-link .iconify {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.btn:hover,
.copy-btn:hover,
.edit-cancel-btn:hover {
  background: var(--surface-3);
  border-color: var(--n400);
}

.btn:active,
.copy-btn:active,
.edit-update-btn:active:not(:disabled),
.edit-reset-btn:active,
.edit-cancel-btn:active,
.mcc-warning-btn:active {
  scale: 0.96;
}

.btn:focus-visible,
.copy-btn:focus-visible,
.edit-update-btn:focus-visible,
.edit-reset-btn:focus-visible,
.edit-cancel-btn:focus-visible,
.mcc-warning-btn:focus-visible,
.crc-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.btn-primary,
.paste-btn,
.edit-update-btn {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}

.btn-primary:hover,
.paste-btn:hover,
.edit-update-btn:hover:not(:disabled) {
  background: var(--a700);
  border-color: var(--a700);
  color: #ffffff;
}

@media (prefers-color-scheme: dark) {

  .btn-primary,
  .paste-btn,
  .edit-update-btn {
    color: var(--n900);
  }

  .btn-primary:hover,
  .paste-btn:hover,
  .edit-update-btn:hover:not(:disabled) {
    background: var(--a500);
    border-color: var(--a500);
    color: var(--n900);
  }
}

.btn-secondary {
  background: var(--surface);
}

.edit-active {
  background: var(--err-bg);
  border-color: var(--err-bd);
  color: var(--err-fg);
}

.edit-active:hover {
  background: var(--err-bg);
  border-color: var(--err-fg);
}

.edit-update-btn {
  flex: 1;
  min-width: 200px;
}

.edit-update-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.edit-update-btn:disabled:active {
  scale: 1;
}

/* ---------------------------------------------------------- empty state -- */

.empty-state {
  flex: 1;
  display: flex;
  padding: var(--s16) var(--s6);
}

.empty-state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--s3);
}

.empty-state-icon {
  width: 28px;
  height: 28px;
  color: var(--n400);
}

.empty-state-title {
  font-size: 15px;
  font-weight: var(--fw-semibold);
  color: var(--text);
  text-wrap: balance;
}

.empty-state-body {
  max-width: 46ch;
  font-size: 14px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

/* --------------------------------------------------------------- results -- */

.result-section {
  /* Was `padding-bottom: 220px` — a magic number reserving space nothing used. */
  padding: var(--s6);
}

.summary-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--s5);
  padding: var(--s4);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  margin-bottom: var(--s6);
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  min-width: 0;
}

.summary-label {
  font-size: 11px;
  font-weight: var(--fw-medium);
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-value {
  font-size: 14px;
  font-weight: var(--fw-medium);
  color: var(--text);
  word-break: break-word;
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}

/* State is carried by the badge, so the row itself stays neutral. */
.mcc-present,
.mcc-missing,
.ts-valid,
.ts-expired,
.ts-invalid,
.ts-missing {
  background: none;
  border: none;
  padding-left: 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--s4);
  margin-bottom: var(--s4);
}

.result-header h2 {
  font-size: 15px;
  font-weight: var(--fw-semibold);
  color: var(--text);
  text-wrap: balance;
}

.header-buttons {
  display: flex;
  gap: var(--s2);
}

/* ---------------------------------------------------------------- badges -- */

.mcc-badge,
.ts-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: 2px var(--s2);
  border: 1px solid transparent;
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: var(--fw-medium);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.mcc-badge .iconify,
.ts-badge .iconify,
.mcc-indicator .iconify,
.validation-item .iconify {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.mcc-badge-present,
.ts-badge-valid {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.mcc-badge-missing,
.ts-badge-expired {
  background: var(--err-bg);
  border-color: var(--err-bd);
  color: var(--err-fg);
}

.ts-badge-invalid {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

.ts-badge-none {
  background: var(--surface-3);
  border-color: var(--border);
  color: var(--text-subtle);
}

/* ----------------------------------------------------------------- alert -- */

.mcc-warning-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  background: var(--warn-bg);
  border: 1px solid var(--warn-bd);
  border-radius: var(--r-lg);
  margin-bottom: var(--s5);
}

.mcc-warning-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--warn-fg);
}

.mcc-warning-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.mcc-warning-title {
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--warn-fg);
  text-wrap: balance;
}

.mcc-warning-desc {
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--warn-fg);
  opacity: 0.85;
  text-wrap: pretty;
}

.mcc-warning-btn {
  align-self: flex-start;
  min-height: 32px;
  padding: var(--s1) var(--s3);
  font-size: 13px;
  background: var(--surface);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

.mcc-warning-btn:hover {
  background: var(--warn-bd);
}

/* ------------------------------------------------------------ edit panel -- */

.edit-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--s5);
  margin-bottom: var(--s5);
  animation: fadeIn var(--dur-base) var(--ease-out);
}

.edit-panel-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--s5);
  padding-bottom: var(--s4);
  border-bottom: 1px solid var(--border);
}

.edit-panel-header h3 {
  font-size: 15px;
  font-weight: var(--fw-semibold);
  color: var(--text);
  text-wrap: balance;
}

.edit-info {
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

.edit-form-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: var(--s5);
  margin-bottom: var(--s5);
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  min-width: 0;
}

.edit-field label {
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--text-muted);
}

.edit-input {
  padding: var(--s2) var(--s3);
  min-height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font: inherit;
  font-size: 14px;
  font-weight: var(--fw-normal);
  color: var(--text);
  background: var(--surface);
  transition-property: border-color, box-shadow;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.edit-input::placeholder {
  color: var(--text-subtle);
}

.edit-field-hint,
.edit-field-error {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  font-size: 12px;
  font-weight: var(--fw-normal);
  font-variant-numeric: tabular-nums;
  text-wrap: pretty;
}

.edit-field-hint {
  color: var(--text-subtle);
}

.edit-field-error {
  color: var(--err-fg);
}

.edit-field-error .iconify {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.mcc-selection {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

/* Concentric: 12px padding + 4px inner radius = 6px outer (nearest step). */
.edit-validation-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: var(--s2);
  padding: var(--s3);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  margin-bottom: var(--s5);
}

.validation-item {
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: var(--s2);
  border: 1px solid transparent;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: var(--fw-normal);
  transition-property: background-color, color, border-color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.validation-item.valid {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.validation-item.invalid {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text-subtle);
}

.edit-actions {
  display: flex;
  gap: var(--s2);
  margin-top: var(--s5);
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.edit-reset-btn:hover {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

/* ------------------------------------------------------------ live toggle -- */

.live-preview-toggle {
  display: flex;
  align-items: center;
  margin-bottom: var(--s4);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--s3);
  cursor: pointer;
}

/* Visually hidden, not `display: none` — the latter drops it from the tab
   order and the accessibility tree. */
.toggle-checkbox {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background: var(--n300);
  border-radius: 999px;
  flex-shrink: 0;
  transition-property: background-color;
  transition-duration: var(--dur-base);
  transition-timing-function: var(--ease-out);
}

.toggle-checkbox:checked+.toggle-switch {
  background: var(--accent);
}

.toggle-checkbox:focus-visible+.toggle-switch {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #ffffff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  /* `translate` composites; animating `left` triggers layout every frame. */
  transition: translate var(--dur-base) var(--ease-out);
}

.toggle-checkbox:checked+.toggle-switch::after {
  translate: 16px 0;
}

.toggle-text {
  font-size: 14px;
  font-weight: var(--fw-medium);
  color: var(--text);
}

/* ------------------------------------------------------------- TLV tree -- */

.tlv-tree {
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.6;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  color: var(--text);
}

.tree-item {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
  align-items: center;
  padding: var(--s2) var(--s3);
  border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent;
  /* Row hover is the highest-frequency interaction here: colour only. */
  transition-property: background-color, border-left-color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
  cursor: default;
}

.tree-item:last-child {
  border-bottom: none;
}

.tree-item:hover {
  background: var(--surface-3);
  border-left-color: var(--accent-border);
}

/* Tag / length / value: one shared chip shape, distinguished by weight and
   tone rather than three saturated fills. */
.tree-tag,
.tree-length,
.tree-data {
  padding: 1px var(--s2);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  font-size: 12.5px;
  background: var(--surface-2);
  transition-property: background-color, border-color, color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.tree-tag {
  font-weight: var(--fw-semibold);
  color: var(--accent);
  background: var(--accent-weak);
  border-color: var(--accent-border);
  min-width: 34px;
  text-align: center;
}

.tree-length {
  font-weight: var(--fw-normal);
  color: var(--text-subtle);
  min-width: 34px;
  text-align: center;
}

/* Was #ffffff on a #4ade80 fill — about 1.7:1, on the most important text
   on the page. Dark ink on a pale tint instead. */
.tree-data {
  font-weight: var(--fw-medium);
  color: var(--ok-fg);
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  word-break: break-all;
}

.tree-meaning {
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: var(--fw-normal);
  font-family: inherit;
  text-wrap: pretty;
}

.mcc-tag-highlight {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.mcc-tag-present {
  background: var(--ok-bg);
}

.mcc-indicator,
.ts-tree-indicator {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  padding: 1px var(--s2);
  border: 1px solid transparent;
  border-radius: var(--r-sm);
  font-size: 11px;
  font-weight: var(--fw-medium);
  white-space: nowrap;
}

.mcc-indicator {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.ts-valid .ts-tree-indicator,
.timestamp-valid .ts-tree-indicator {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.ts-expired .ts-tree-indicator {
  background: var(--err-bg);
  border-color: var(--err-bd);
  color: var(--err-fg);
}

.ts-invalid .ts-tree-indicator {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

.timestamp-valid .tree-meaning {
  color: var(--ok-fg);
}

.timestamp-expired {
  background: var(--err-bg);
}

.timestamp-expired .tree-meaning {
  color: var(--err-fg);
}

.checksum-valid {
  background: var(--ok-bg);
  border-left-color: var(--ok-bd);
}

/* Nested sub-layers: indentation and one hairline, matching the parent. */
.tree-sublayer {
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  width: 100%;
  margin-top: var(--s2);
  margin-left: var(--s3);
  padding: var(--s2);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  animation: fadeIn var(--dur-base) var(--ease-out);
}

.tree-subitem-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
  align-items: center;
  width: 100%;
  padding: var(--s1) var(--s2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  transition-property: background-color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.tree-subitem-line:hover {
  background: var(--surface-3);
}

.tree-subitem-conversion {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--s1) var(--s2) var(--s1) var(--s8);
  font-size: 11.5px;
  background: none;
  border: none;
}

.tree-subitem-conversion .tree-meaning {
  color: var(--text-subtle);
  font-style: normal;
}

.crc-link {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  min-height: 28px;
  padding: var(--s1) var(--s2);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  color: var(--accent);
  background: var(--surface);
  text-decoration: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--fw-medium);
  transition-property: background-color, border-color, scale;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.crc-link:hover {
  background: var(--accent-weak);
  border-color: var(--accent-border);
}

.crc-link:active {
  scale: 0.96;
}

/* ---------------------------------------------------------- generate tab -- */

.generate-result {
  padding: var(--s6);
}

.data-label {
  font-size: 11px;
  font-weight: var(--fw-medium);
  color: var(--text-subtle);
  margin-bottom: var(--s2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.qr-display-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--s6);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  margin-bottom: var(--s4);
}

.qr-image {
  max-width: 100%;
  height: auto;
  /* Pure black at low alpha, inset so it adds no layout width. A tinted
     neutral would read as dirt along the QR's quiet zone. */
  outline: 1px solid oklch(0 0 0 / 0.1);
  outline-offset: -1px;
}

.download-options {
  display: flex;
  align-items: center;
  gap: var(--s2);
  flex-wrap: wrap;
  margin-bottom: var(--s5);
}

.download-label {
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--text-muted);
  white-space: nowrap;
}

.download-select {
  flex: 1;
  min-width: 140px;
}

.qr-data-display {
  margin-top: var(--s4);
}

.data-content {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: var(--s3);
  font-size: 12.5px;
  font-family: var(--mono);
  line-height: 1.6;
  color: var(--text);
  max-height: 200px;
  overflow: auto;
  word-break: break-all;
  white-space: pre-wrap;
}

/* --------------------------------------------------------- reference tab -- */

.reference-tab {
  padding: var(--s6);
}

.reference-section {
  margin-bottom: var(--s8);
}

.reference-section:last-child {
  margin-bottom: 0;
}

.reference-title {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 14px;
  font-weight: var(--fw-semibold);
  color: var(--text);
  margin-bottom: var(--s3);
  text-wrap: balance;
}

.reference-title .iconify {
  width: 16px;
  height: 16px;
  color: var(--text-subtle);
  flex-shrink: 0;
}

.reference-grid,
.currency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--s2);
}

.reference-item,
.currency-item,
.mcc-item,
.tag-def {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  transition-property: background-color, border-color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

/* Static reference rows: colour only, no movement. */
.reference-item:hover,
.currency-item:hover,
.mcc-item:hover,
.tag-def:hover {
  background: var(--surface-3);
  border-color: var(--border-strong);
}

.reference-item {
  padding: var(--s3);
}

.bank-name {
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--text);
  text-wrap: pretty;
}

.tag-definitions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

/* Concentric: 12px padding + 3px inner radius ≈ 4px outer at this scale. */
.tag-def {
  display: flex;
  gap: var(--s3);
  align-items: baseline;
  padding: var(--s3);
}

.tag-code,
.mcc-code {
  flex-shrink: 0;
  min-width: 44px;
  padding: 1px var(--s2);
  background: var(--accent-weak);
  border: 1px solid var(--accent-border);
  border-radius: var(--r-sm);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: var(--fw-semibold);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.tag-desc,
.mcc-desc {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

.currency-item {
  display: flex;
  align-items: baseline;
  gap: var(--s3);
  padding: var(--s3);
}

.curr-code {
  font-family: var(--mono);
  font-size: 13px;
  font-weight: var(--fw-semibold);
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.curr-name {
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

.mcc-search {
  margin-bottom: var(--s3);
}

.mcc-search-input {
  width: 100%;
  padding: var(--s2) var(--s3);
  min-height: 36px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font: inherit;
  font-size: 14px;
  font-weight: var(--fw-normal);
  color: var(--text);
  background: var(--surface);
  transition-property: border-color, box-shadow;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.mcc-search-input::placeholder {
  color: var(--text-subtle);
}

.mcc-list {
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  max-height: 480px;
  overflow-y: auto;
}

.mcc-item {
  display: flex;
  align-items: baseline;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
}

/* --------------------------------------------------------- notification -- */

.notification {
  pointer-events: auto;
  padding: var(--s3) var(--s4);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-weight: var(--fw-medium);
  box-shadow:
    0 0 0 1px oklch(0 0 0 / 0.04),
    0 4px 12px oklch(0 0 0 / 0.1);
  animation: slideIn var(--dur-base) var(--ease-out);
  opacity: 1;
  transition: opacity var(--dur-base) var(--ease-out);
}

.notification-success {
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.notification-info {
  border-color: var(--accent-border);
  color: var(--accent);
}

.notification-error {
  border-color: var(--err-bd);
  color: var(--err-fg);
}

@keyframes slideIn {
  from {
    transform: translateX(16px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* --------------------------------------------------------- scan / camera -- */

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.field-label {
  display: block;
  margin-bottom: var(--s2);
  font-size: 13px;
  font-weight: var(--fw-medium);
  color: var(--text-muted);
}

.scan-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s2);
  padding: var(--s6);
  margin-bottom: var(--s4);
  text-align: center;
  background: var(--surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--r-lg);
  transition-property: background-color, border-color;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.scan-zone.is-dragging {
  background: var(--accent-weak);
  border-color: var(--accent);
}

.scan-zone.is-busy {
  opacity: 0.7;
}

.scan-zone-icon {
  width: 22px;
  height: 22px;
  color: var(--text-subtle);
}

.scan-zone-text {
  font-size: 13px;
  font-weight: var(--fw-normal);
  color: var(--text-muted);
  text-wrap: pretty;
}

.scan-zone-text strong {
  font-weight: var(--fw-medium);
  color: var(--text);
}

.scan-zone-actions {
  display: flex;
  gap: var(--s2);
  flex-wrap: wrap;
  justify-content: center;
}

.scan-file-btn {
  position: relative;
}

.scan-zone-status {
  font-size: 12px;
  color: var(--text-subtle);
}

.scan-zone-error {
  font-size: 12px;
  color: var(--err-fg);
  text-wrap: pretty;
}

.camera-wrap {
  margin-bottom: var(--s4);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
  background: #000;
}

.camera-video {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
}

/* --------------------------------------------------- checksum verdict ----- */

.verdict {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  margin-bottom: var(--s4);
  border: 1px solid;
  border-radius: var(--r-lg);
}

.verdict-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.verdict-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.verdict-title {
  font-size: 14px;
  font-weight: var(--fw-semibold);
}

.verdict-desc {
  font-size: 13px;
  font-weight: var(--fw-normal);
  text-wrap: pretty;
}

.verdict-desc code {
  font-family: var(--mono);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}

.verdict-valid {
  background: var(--ok-bg);
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.verdict-invalid {
  background: var(--err-bg);
  border-color: var(--err-bd);
  color: var(--err-fg);
}

.verdict-missing {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

.verdict-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  align-self: flex-start;
  min-height: 32px;
  padding: var(--s1) var(--s3);
  border: 1px solid currentColor;
  border-radius: var(--r-md);
  background: none;
  color: inherit;
  font: inherit;
  font-size: 13px;
  font-weight: var(--fw-medium);
  cursor: pointer;
  opacity: 0.85;
  transition-property: opacity, scale;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.verdict-btn:hover {
  opacity: 1;
}

.verdict-btn:active {
  scale: 0.96;
}

.verdict-btn .iconify {
  width: 14px;
  height: 14px;
}

/* ------------------------------------------------- parser diagnostics ----- */

.issues {
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  margin-bottom: var(--s4);
}

.issue {
  display: flex;
  align-items: flex-start;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  border: 1px solid;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: var(--fw-normal);
  text-wrap: pretty;
}

.issue .iconify {
  width: 15px;
  height: 15px;
  margin-top: 1px;
}

.issue-error {
  background: var(--err-bg);
  border-color: var(--err-bd);
  color: var(--err-fg);
}

.issue-warn {
  background: var(--warn-bg);
  border-color: var(--warn-bd);
  color: var(--warn-fg);
}

/* ------------------------------------------------ copyable / inline edit -- */

button.tree-data {
  font-family: var(--mono);
  cursor: copy;
  text-align: left;
}

button.tree-data:hover {
  border-color: var(--ok-fg);
}

button.tree-data:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

button.tree-data.is-copied {
  background: var(--accent-weak);
  border-color: var(--accent);
  color: var(--accent);
}

.inline-edit-btn,
.inline-ok,
.inline-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  transition-property: background-color, border-color, color, scale;
  transition-duration: var(--dur-fast);
  transition-timing-function: var(--ease-out);
}

.inline-edit-btn .iconify,
.inline-ok .iconify,
.inline-cancel .iconify {
  width: 13px;
  height: 13px;
}

.inline-edit-btn:hover,
.inline-cancel:hover {
  background: var(--surface-3);
  color: var(--text);
}

.inline-ok {
  border-color: var(--ok-bd);
  color: var(--ok-fg);
}

.inline-ok:hover {
  background: var(--ok-bg);
}

.inline-edit-btn:active,
.inline-ok:active,
.inline-cancel:active {
  scale: 0.96;
}

.inline-input {
  flex: 1;
  min-width: 140px;
  padding: 1px var(--s2);
  border: 1px solid var(--accent);
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--text);
  font-family: var(--mono);
  font-size: 12.5px;
  font-weight: var(--fw-medium);
}

.inline-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.generate-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  margin-bottom: var(--s2);
}

/* -------------------------------------------------------------- toasts ---- */

.toast-host {
  position: fixed;
  top: var(--s5);
  right: var(--s5);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  pointer-events: none;
}

@media (max-width: 768px) {
  .toast-host {
    top: var(--s3);
    right: var(--s3);
    left: var(--s3);
  }

  .scan-zone {
    padding: var(--s4);
  }
}

/* ============================================================================
   Motion

   Applied only where it carries information: the arrival of a result, the
   structure of a decoded payload, and the life cycle of a toast. Hover and
   typing stay still — those repeat too often to earn an animation.
   ========================================================================= */

/* -- Tab switch: enter only. There is no leave transition, so the outgoing
      panel unmounts immediately and the two never overlap in layout. -------- */
.tab-enter-active {
  animation: tabIn var(--dur-base) var(--ease-out);
}

@keyframes tabIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* -- Result arrival ------------------------------------------------------- */
.verdict {
  animation: verdictIn 260ms var(--ease-out) backwards;
}

.summary-card {
  animation: verdictIn 260ms var(--ease-out) 40ms backwards;
}

.issues {
  animation: verdictIn 260ms var(--ease-out) 20ms backwards;
}

@keyframes verdictIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
    filter: blur(3px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* -- TLV rows: staggered so the payload's structure reads top-down as it
      lands. The container is keyed on `treeAnimKey`, which only changes on an
      explicit load (paste, sample, scan, share link) — never while typing. -- */
.tlv-tree>.tree-item {
  animation: rowIn 220ms var(--ease-out) backwards;
}

.tlv-tree>.tree-item:nth-child(1) {
  animation-delay: 0ms;
}

.tlv-tree>.tree-item:nth-child(2) {
  animation-delay: 24ms;
}

.tlv-tree>.tree-item:nth-child(3) {
  animation-delay: 48ms;
}

.tlv-tree>.tree-item:nth-child(4) {
  animation-delay: 72ms;
}

.tlv-tree>.tree-item:nth-child(5) {
  animation-delay: 96ms;
}

.tlv-tree>.tree-item:nth-child(6) {
  animation-delay: 120ms;
}

.tlv-tree>.tree-item:nth-child(7) {
  animation-delay: 144ms;
}

.tlv-tree>.tree-item:nth-child(8) {
  animation-delay: 168ms;
}

/* Capped: past this the stagger stops adding meaning and starts adding wait. */
.tlv-tree>.tree-item:nth-child(n+9) {
  animation-delay: 190ms;
}

@keyframes rowIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* -- Toasts: enter with a slide, leave shorter and softer. ---------------- */
.toast-enter-active {
  transition-property: opacity, transform;
  transition-duration: 220ms;
  transition-timing-function: var(--ease-out);
}

.toast-leave-active {
  transition-property: opacity, transform;
  transition-duration: 140ms;
  transition-timing-function: var(--ease-out);
  position: absolute;
  right: 0;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Remaining toasts slide up to fill the gap left by a dismissed one. */
.toast-move {
  transition: transform 220ms var(--ease-out);
}

/* -- Copy confirmation: a brief tick of scale, not a bounce. -------------- */
button.tree-data.is-copied {
  animation: copyPulse 260ms var(--ease-out);
}

@keyframes copyPulse {
  from {
    scale: 0.96;
  }

  to {
    scale: 1;
  }
}

/* -- Camera panel reveal -------------------------------------------------- */
.camera-wrap {
  animation: cameraIn var(--dur-base) var(--ease-out);
  transform-origin: top;
}

@keyframes cameraIn {
  from {
    opacity: 0;
    transform: scaleY(0.96);
  }

  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* -- Empty state ---------------------------------------------------------- */
.empty-state-inner {
  animation: verdictIn 300ms var(--ease-out) backwards;
}

/* ------------------------------------------------------- reduced motion -- */

/* Every animated state here also carries a static cue (colour, badge, label),
   so movement can be removed without losing meaning. */
@media (prefers-reduced-motion: reduce) {

  .container *,
  .container *::before,
  .container *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
    scroll-behavior: auto !important;
  }

  .btn:active,
  .copy-btn:active,
  .tab-button:active,
  .crc-link:active,
  .edit-update-btn:active:not(:disabled),
  .edit-reset-btn:active,
  .edit-cancel-btn:active,
  .mcc-warning-btn:active {
    scale: 1;
  }

  .tlv-tree>.tree-item,
  .tlv-tree>.tree-item:nth-child(n+9) {
    animation-delay: 0ms !important;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}

/* -------------------------------------------------------------- responsive -- */

@media (max-width: 768px) {
  * {
    touch-action: manipulation;
  }

  .header {
    padding: var(--s5) var(--s4) var(--s4);
  }

  .title {
    font-size: 18px;
  }

  .tab-navigation {
    padding-inline: var(--s4);
  }

  .tab-shell {
    width: 100%;
  }

  .tab-button {
    flex: 1;
    justify-content: center;
    /* Centred at this size, so the optical offset is reset to symmetric. */
    padding: var(--s3) var(--s2);
    min-height: 44px;
  }

  .input-area,
  .result-section,
  .reference-tab,
  .generate-result {
    padding: var(--s4);
  }

  .empty-state {
    padding: var(--s12) var(--s4);
  }

  .sample-selector {
    flex-direction: column;
    align-items: stretch;
    gap: var(--s2);
  }

  .summary-card {
    grid-template-columns: 1fr;
    gap: var(--s3);
  }

  .summary-item {
    flex-direction: row;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--s4);
  }

  .result-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--s3);
  }

  .header-buttons .copy-btn {
    flex: 1;
  }

  /* Touch targets get the full 44px. */
  .btn,
  .copy-btn,
  .edit-input,
  .edit-select,
  .sample-select,
  .mcc-search-input,
  .edit-update-btn,
  .edit-cancel-btn,
  .edit-reset-btn {
    min-height: 44px;
  }

  /* 16px prevents iOS Safari from zooming on focus. */
  .input-field,
  .edit-input,
  .edit-select,
  .sample-select,
  .mcc-search-input {
    font-size: 16px;
  }

  .edit-actions {
    flex-direction: column;
  }

  .edit-update-btn,
  .edit-cancel-btn,
  .edit-reset-btn {
    width: 100%;
    min-width: 0;
  }

  .reference-grid,
  .currency-grid {
    grid-template-columns: 1fr;
  }

}
</style>
