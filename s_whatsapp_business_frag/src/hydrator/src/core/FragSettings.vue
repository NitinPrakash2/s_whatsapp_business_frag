<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Disconnect Confirmation Modal ─── -->
    <div
      v-if="disconnectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e0e0]">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style="background: #fff0f0;">
            <i class="pi pi-exclamation-triangle text-lg" style="color: #e53935;" />
          </div>
          <div>
            <h3 class="text-base font-bold" style="color: #111b17;">Disconnect Meta Account</h3>
            <p class="text-xs mt-0.5" style="color: #667781;">This action removes your seller-side connection records only.</p>
          </div>
        </div>
        <p class="text-sm mb-6 leading-relaxed" style="color: #667781;">
          Your Meta Business assets (catalog, WABA, phone number) remain intact. You can reconnect at any time.
        </p>
        <div class="flex items-center justify-end gap-3">
          <button
            @click="disconnectModal = false"
            class="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            style="background: #f0f2f5; color: #667781;"
          >
            Cancel
          </button>
          <button
            @click="triggerDisconnect"
            :disabled="disconnecting"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-colors"
            style="background: #e53935;"
          >
            <i :class="disconnecting ? 'pi pi-spin pi-spinner' : 'pi pi-sign-out'" class="text-xs" />
            {{ disconnecting ? 'Disconnecting…' : 'Disconnect' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Header ─── -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-cog text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">Connection Settings</h1>
          <p class="text-xs" style="color: #667781;">Manage your Meta account, catalog, and connection health</p>
        </div>
      </div>
      <button
        @click="refreshAll"
        :disabled="globalLoading"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
        :style="globalLoading
          ? 'background:#f0f2f5; border:1px solid #e9edef; color:#ccd0d5; cursor:not-allowed;'
          : 'background:#fff; border:1px solid #e0e0e0; color:#111b17; box-shadow:0 1px 3px rgba(0,0,0,0.04);'"
      >
        <i :class="globalLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color:#00a884;" />
        Refresh Catalog Details
      </button>
    </div>

    <!-- ─── Error Alert ─── -->
    <div
      v-if="errorAlert"
      class="rounded-2xl p-4 mb-5 flex items-start gap-3"
      :style="alertStyle.banner"
    >
      <i :class="alertStyle.icon" class="text-sm mt-0.5 flex-shrink-0" :style="alertStyle.iconColor" />
      <div class="flex-1">
        <p class="text-sm font-semibold" :style="alertStyle.titleColor">{{ errorAlert.title }}</p>
        <p class="text-xs mt-0.5" :style="alertStyle.msgColor">{{ errorAlert.message }}</p>
      </div>
      <button @click="errorAlert = null" class="flex-shrink-0 cursor-pointer">
        <i class="pi pi-times text-xs" style="color: #667781;" />
      </button>
    </div>

    <!-- ─── Loading Skeleton ─── -->
    <div v-if="initialLoading">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          v-for="n in 4"
          :key="'sk-' + n"
          class="rounded-2xl p-6 animate-pulse"
          style="background:#fff; border:1px solid #e0e0e0; min-height:200px;"
        >
          <div class="h-4 bg-gray-200 rounded-full w-2/5 mb-5" />
          <div class="space-y-3">
            <div class="h-3 bg-gray-100 rounded-full w-full" />
            <div class="h-3 bg-gray-100 rounded-full w-5/6" />
            <div class="h-3 bg-gray-100 rounded-full w-3/4" />
            <div class="h-3 bg-gray-100 rounded-full w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Main Content ─── -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">

      <!-- ══ LEFT COLUMN ══ -->
      <div class="space-y-5">

        <!-- Card: Business Profile -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="flex items-center gap-2">
              <i class="pi pi-user-edit text-sm" style="color:#00a884;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Business Profile</h2>
            </div>
            <button @click="saveProfile" :disabled="profileSaving"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
              :style="profileSaving ? 'background:#b2dfdb;' : 'background:#00a884;'">
              <i :class="profileSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'" class="text-[10px]" />
              {{ profileSaving ? 'Saving…' : 'Save' }}
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Store Name</label>
              <input v-model="profile.title" type="text" placeholder="e.g. My Fashion Store"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Description</label>
              <textarea v-model="profile.description" rows="3" placeholder="Tell customers about your store…"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Category</label>
              <select v-model="profile.category"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;">
                <option value="">Select category</option>
                <option value="APPAREL">Apparel</option>
                <option value="BEAUTY">Beauty</option>
                <option value="FOOD">Food</option>
                <option value="RETAIL">Retail</option>
                <option value="SERVICES">Services</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Logo URL</label>
              <input v-model="profile.logo_url" type="text" placeholder="https://…"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
          </div>
        </div>

        <!-- Card: Connected Meta Account -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="flex items-center gap-2">
              <i class="pi pi-building text-sm" style="color: #00a884;" />
              <h2 class="font-bold text-sm" style="color: #111b17;">Connected Meta Account</h2>
            </div>
            <span
              class="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              :style="catalog.meta_connected
                ? 'background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;'
                : 'background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;'"
            >
              {{ catalog.meta_connected ? '● Connected' : '● Disconnected' }}
            </span>
          </div>

          <div class="space-y-3.5">
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Business Name</span>
              <span class="font-bold text-right truncate max-w-[200px]" style="color: #111b17;">
                {{ catalog.business_name || '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Catalog Name</span>
              <span class="font-bold text-right truncate max-w-[200px]" style="color: #111b17;">
                {{ catalog.catalog_name || '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Phone Number</span>
              <span class="font-bold text-right" style="color: #111b17;">
                {{ catalog.phone_number || '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Connection Status</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-semibold"
                :style="catalog.meta_connected
                  ? 'background:#e7f8f4; color:#00a884;'
                  : 'background:#f0f2f5; color:#667781;'"
              >
                {{ catalog.meta_connected ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Last Validation</span>
              <span class="font-bold text-right" style="color: #111b17;">
                {{ lastValidationTime ? formatTime(lastValidationTime) : 'Never' }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-5 mt-5 border-t border-[#f0f2f5]">
            <button
              @click="navigateToMetaConnect"
              class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              style="background: #e7f8f4; color: #00a884;"
            >
              <i class="pi pi-refresh text-[10px]" />
              Reconnect Meta
            </button>
            <button
              @click="disconnectModal = true"
              :disabled="!catalog.meta_connected"
              class="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              :style="catalog.meta_connected
                ? 'background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;'
                : 'background:#f0f2f5; color:#ccd0d5; cursor:not-allowed;'"
            >
              <i class="pi pi-sign-out text-[10px]" />
              Disconnect Meta
            </button>
          </div>
        </div>

        <!-- Card: Connection Validation -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="flex items-center gap-2">
              <i class="pi pi-verified text-sm" style="color: #00a884;" />
              <h2 class="font-bold text-sm" style="color: #111b17;">Connection Validation</h2>
            </div>
            <button
              @click="validateConnection"
              :disabled="validating"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors"
              :style="validating
                ? 'background:#b2dfdb; cursor:not-allowed;'
                : 'background:#00a884;'"
            >
              <i :class="validating ? 'pi pi-spin pi-spinner' : 'pi pi-check-circle'" class="text-[10px]" />
              {{ validating ? 'Validating…' : 'Validate Connection' }}
            </button>
          </div>

          <!-- Pre-validation hint -->
          <div v-if="!hasValidated" class="rounded-xl p-4 text-center" style="background:#f8f9fa; border:1px solid #f0f2f5;">
            <i class="pi pi-shield text-2xl mb-2" style="color: #ccd0d5;" />
            <p class="text-xs font-medium" style="color: #8696a0;">
              Run a validation check to verify your Meta integration health.
            </p>
          </div>

          <!-- Validation Results -->
          <div v-else class="space-y-2.5">

            <!-- Meta Connected -->
            <div class="flex items-center justify-between p-3 rounded-xl border"
              :style="validation.meta_connected
                ? 'background:#f8fff8; border-color:#b2dfdb;'
                : 'background:#fff8f8; border-color:#ffcdd2;'"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style="background: #e8f0fe;">
                  <i class="pi pi-facebook text-xs" style="color: #1877f2;" />
                </div>
                <span class="text-xs font-semibold" style="color: #111b17;">Meta Connected</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold"
                  :style="validation.meta_connected ? 'color:#00a884;' : 'color:#e53935;'">
                  {{ validation.meta_connected ? 'Passed' : 'Failed' }}
                </span>
                <div class="w-5 h-5 rounded-full flex items-center justify-center"
                  :style="validation.meta_connected ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
                  <i
                    :class="validation.meta_connected ? 'pi pi-check' : 'pi pi-times'"
                    class="text-[9px]"
                    :style="validation.meta_connected ? 'color:#00a884;' : 'color:#e53935;'"
                  />
                </div>
              </div>
            </div>

            <!-- Catalog Accessible -->
            <div class="flex items-center justify-between p-3 rounded-xl border"
              :style="validation.catalog_accessible
                ? 'background:#f8fff8; border-color:#b2dfdb;'
                : 'background:#fff8f8; border-color:#ffcdd2;'"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style="background: #f0f4ff;">
                  <i class="pi pi-box text-xs" style="color: #6366f1;" />
                </div>
                <span class="text-xs font-semibold" style="color: #111b17;">Catalog Accessible</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold"
                  :style="validation.catalog_accessible ? 'color:#00a884;' : 'color:#e53935;'">
                  {{ validation.catalog_accessible ? 'Passed' : 'Failed' }}
                </span>
                <div class="w-5 h-5 rounded-full flex items-center justify-center"
                  :style="validation.catalog_accessible ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
                  <i
                    :class="validation.catalog_accessible ? 'pi pi-check' : 'pi pi-times'"
                    class="text-[9px]"
                    :style="validation.catalog_accessible ? 'color:#00a884;' : 'color:#e53935;'"
                  />
                </div>
              </div>
            </div>

            <!-- Permissions Valid -->
            <div class="flex items-center justify-between p-3 rounded-xl border"
              :style="validation.permissions_valid
                ? 'background:#f8fff8; border-color:#b2dfdb;'
                : 'background:#fff8f8; border-color:#ffcdd2;'"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style="background: #fff8e1;">
                  <i class="pi pi-shield text-xs" style="color: #f59e0b;" />
                </div>
                <span class="text-xs font-semibold" style="color: #111b17;">Permissions Valid</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold"
                  :style="validation.permissions_valid ? 'color:#00a884;' : 'color:#e53935;'">
                  {{ validation.permissions_valid ? 'Passed' : 'Failed' }}
                </span>
                <div class="w-5 h-5 rounded-full flex items-center justify-center"
                  :style="validation.permissions_valid ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
                  <i
                    :class="validation.permissions_valid ? 'pi pi-check' : 'pi pi-times'"
                    class="text-[9px]"
                    :style="validation.permissions_valid ? 'color:#00a884;' : 'color:#e53935;'"
                  />
                </div>
              </div>
            </div>

            <!-- WABA Accessible -->
            <div class="flex items-center justify-between p-3 rounded-xl border"
              :style="validation.waba_connected
                ? 'background:#f8fff8; border-color:#b2dfdb;'
                : 'background:#fff8f8; border-color:#ffcdd2;'"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style="background: #e7f8f4;">
                  <i class="pi pi-whatsapp text-xs" style="color: #00a884;" />
                </div>
                <span class="text-xs font-semibold" style="color: #111b17;">WABA Accessible</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold"
                  :style="validation.waba_connected ? 'color:#00a884;' : 'color:#e53935;'">
                  {{ validation.waba_connected ? 'Passed' : 'Failed' }}
                </span>
                <div class="w-5 h-5 rounded-full flex items-center justify-center"
                  :style="validation.waba_connected ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
                  <i
                    :class="validation.waba_connected ? 'pi pi-check' : 'pi pi-times'"
                    class="text-[9px]"
                    :style="validation.waba_connected ? 'color:#00a884;' : 'color:#e53935;'"
                  />
                </div>
              </div>
            </div>

            <!-- Overall summary pill -->
            <div class="flex items-center justify-center pt-1">
              <span
                class="text-xs font-semibold px-3 py-1 rounded-full"
                :style="allPassed
                  ? 'background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;'
                  : 'background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;'"
              >
                <i :class="allPassed ? 'pi pi-check-circle' : 'pi pi-exclamation-circle'" class="mr-1 text-[10px]" />
                {{ allPassed ? 'All checks passed' : 'Some checks failed' }}
              </span>
            </div>
          </div>
        </div>

      </div>

      <!-- ══ RIGHT COLUMN ══ -->
      <div class="space-y-5">

        <!-- Card: Catalog Information -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="flex items-center gap-2">
              <i class="pi pi-box text-sm" style="color: #6366f1;" />
              <h2 class="font-bold text-sm" style="color: #111b17;">Catalog Information</h2>
            </div>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
              style="background:#f0f4ff; color:#6366f1; border:1px solid #e0e7ff;">
              Meta Catalog
            </span>
          </div>

          <div class="space-y-3.5">
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Catalog Name</span>
              <span class="font-bold text-right truncate max-w-[200px]" style="color: #111b17;">
                {{ catalog.catalog_name || '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Catalog ID</span>
              <span class="font-mono text-xs font-semibold text-right truncate max-w-[200px]"
                style="color: #8696a0; background:#f0f2f5; padding:2px 8px; border-radius:6px;">
                {{ catalog.catalog_id || '—' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Product Count</span>
              <span class="font-bold" style="color: #00a884;">
                {{ catalog.total_catalog_products }} products
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Last Sync</span>
              <span class="font-bold text-right" style="color: #111b17;">
                {{ sync.last_sync ? formatTime(sync.last_sync) : 'Never' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card: Connected Assets -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <i class="pi pi-link text-sm" style="color: #6366f1;" />
            <h2 class="font-bold text-sm" style="color: #111b17;">Connected Assets</h2>
          </div>

          <div class="space-y-2.5">
            <!-- WhatsApp Business Account -->
            <div class="p-3.5 rounded-xl border" style="background:#f8f9fa; border-color:#f0f2f5;">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                  <i class="pi pi-whatsapp text-[10px]" style="color:#00a884;" />
                </div>
                <p class="text-[10px] font-bold uppercase tracking-wider" style="color: #8696a0;">
                  WhatsApp Business Account
                </p>
              </div>
              <p class="text-sm font-bold truncate pl-8" style="color: #111b17;">
                {{ catalog.business_name || 'Not Connected' }}
              </p>
            </div>

            <!-- Phone Number -->
            <div class="p-3.5 rounded-xl border" style="background:#f8f9fa; border-color:#f0f2f5;">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                  <i class="pi pi-phone text-[10px]" style="color:#00a884;" />
                </div>
                <p class="text-[10px] font-bold uppercase tracking-wider" style="color: #8696a0;">
                  Phone Number
                </p>
              </div>
              <p class="text-sm font-bold pl-8" style="color: #111b17;">
                {{ catalog.phone_number || 'Not Configured' }}
              </p>
            </div>

            <!-- Product Catalog -->
            <div class="p-3.5 rounded-xl border" style="background:#f8f9fa; border-color:#f0f2f5;">
              <div class="flex items-center gap-2 mb-1.5">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
                  <i class="pi pi-box text-[10px]" style="color:#6366f1;" />
                </div>
                <p class="text-[10px] font-bold uppercase tracking-wider" style="color: #8696a0;">
                  Product Catalog
                </p>
              </div>
              <p class="text-sm font-bold truncate pl-8" style="color: #111b17;">
                {{ catalog.catalog_name || 'No Catalog Selected' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Card: System Information -->
        <div class="rounded-2xl p-6 bg-white border border-[#e0e0e0] shadow-sm">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <i class="pi pi-info-circle text-sm" style="color: #f59e0b;" />
            <h2 class="font-bold text-sm" style="color: #111b17;">System Information</h2>
          </div>

          <div class="space-y-3.5">
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Last Sync</span>
              <span class="font-bold text-right" style="color: #111b17;">
                {{ sync.last_sync ? formatTime(sync.last_sync) : 'Never' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Last Validation</span>
              <span class="font-bold text-right" style="color: #111b17;">
                {{ lastValidationTime ? formatTime(lastValidationTime) : 'Never' }}
              </span>
            </div>
            <div class="flex items-start justify-between gap-2 text-sm">
              <span class="font-medium flex-shrink-0" style="color: #667781;">Catalog Status</span>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-semibold"
                :style="statusBadge(sync.sync_health)"
              >
                {{ formatStatus(sync.last_sync_status) }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface CatalogDetails {
  meta_connected: boolean;
  business_name: string;
  catalog_name: string;
  catalog_id: string;
  phone_number: string;
  total_catalog_products: number;
  last_updated: string | null;
}

interface ValidationData {
  meta_connected: boolean;
  catalog_accessible: boolean;
  waba_connected: boolean;
  permissions_valid: boolean;
}

interface SyncStatus {
  last_sync_status: string;
  last_sync: string | null;
  sync_health: string;
}

interface ErrorAlert {
  title: string;
  message: string;
  type: "token_expired" | "catalog_missing" | "permission_error" | "network_error" | "unknown";
}

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{
  project: string;
  instance: string;
  user_id: string;
  access_token: string;
  record_id: string;
}>();

// ─── State ────────────────────────────────────────────────────────────────────
const toast = useToast();
const initialLoading = ref(true);
const globalLoading = ref(false);
const validating = ref(false);
const disconnecting = ref(false);
const disconnectModal = ref(false);
const hasValidated = ref(false);
const lastValidationTime = ref<string | null>(null);
const errorAlert = ref<ErrorAlert | null>(null);

const catalog = ref<CatalogDetails>({
  meta_connected: false,
  business_name: "",
  catalog_name: "",
  catalog_id: "",
  phone_number: "",
  total_catalog_products: 0,
  last_updated: null,
});

const validation = ref<ValidationData>({
  meta_connected: false,
  catalog_accessible: false,
  waba_connected: false,
  permissions_valid: false,
});

const sync = ref<SyncStatus>({
  last_sync_status: "unknown",
  last_sync: null,
  sync_health: "unknown",
});

const profile = ref({ title: "", description: "", category: "", logo_url: "" });
const profileSaving = ref(false);

// ─── API ──────────────────────────────────────────────────────────────────────
const apiUrl = () => `/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${props.access_token}`,
});

async function api(typ: string, body: object = {}): Promise<any> {
  const res = await fetch(`${apiUrl()}?typ=${typ}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ id: props.record_id, ...body }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("token expired");
  if (!res.ok) throw new Error(`network_error_${res.status}`);
  return res.json();
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const allPassed = computed(() =>
  validation.value.meta_connected &&
  validation.value.catalog_accessible &&
  validation.value.waba_connected &&
  validation.value.permissions_valid
);

const alertStyle = computed(() => {
  const t = errorAlert.value?.type;
  if (t === "token_expired" || t === "permission_error") {
    return {
      banner: "background:#fff0f0; border:1px solid #ffcdd2;",
      icon: "pi pi-lock",
      iconColor: "color:#e53935;",
      titleColor: "color:#e53935;",
      msgColor: "color:#b71c1c;",
    };
  }
  if (t === "catalog_missing") {
    return {
      banner: "background:#fff8e1; border:1px solid #ffe082;",
      icon: "pi pi-box",
      iconColor: "color:#f59e0b;",
      titleColor: "color:#f59e0b;",
      msgColor: "color:#92700a;",
    };
  }
  return {
    banner: "background:#fff0f0; border:1px solid #ffcdd2;",
    icon: "pi pi-times-circle",
    iconColor: "color:#e53935;",
    titleColor: "color:#e53935;",
    msgColor: "color:#b71c1c;",
  };
});

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchProfile(): Promise<void> {
  try {
    const json = await api("get_profile");
    if (json?.success && json?.data) {
      const d = json.data;
      profile.value = {
        title: d.title ?? d.profile?.title ?? "",
        description: d.description ?? d.profile?.description ?? "",
        category: d.category ?? d.profile?.category ?? "",
        logo_url: d.logo_url ?? d.profile?.logo_url ?? "",
      };
    }
  } catch { /* non-fatal */ }
}

async function saveProfile(): Promise<void> {
  profileSaving.value = true;
  try {
    const json = await api("save_profile", { profile: profile.value });
    if (json?.success) {
      toast.add({ severity: "success", summary: "Saved!", detail: "Business profile updated.", life: 3000 });
    } else throw new Error(json?.message ?? "Save failed");
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Save Failed", detail: e.message, life: 3000 });
  } finally {
    profileSaving.value = false;
  }
}

async function fetchCatalogDetails(): Promise<void> {
  const json = await api("catalog_details");
  if (json?.success && json?.data) {
    const d = json.data;
    catalog.value = {
      meta_connected: d.meta_connected ?? d.access_token_set ?? false,
      business_name: d.business_name ?? d.display_name ?? "",
      catalog_name: d.catalog_name ?? "",
      catalog_id: d.catalog_id ?? "",
      phone_number: d.phone_number ?? d.display_phone_number ?? "",
      total_catalog_products: d.total_catalog_products ?? d.catalog_product_count ?? d.total_products ?? 0,
      last_updated: d.last_updated ?? d.updated_at ?? null,
    };
  }
}

async function fetchSyncStatus(): Promise<void> {
  try {
    const json = await api("catalog_sync_status");
    if (json?.success && json?.data) {
      const d = json.data;
      sync.value = {
        last_sync_status: d.last_sync_status ?? d.sync_status ?? d.status ?? d.sync_health ?? "unknown",
        last_sync: d.last_sync ?? d.last_sync_time ?? d.updated_at ?? null,
        sync_health: d.sync_health ?? d.health ?? "unknown",
      };
    }
  } catch {
    // non-fatal
  }
}

// ─── Operations ───────────────────────────────────────────────────────────────
async function validateConnection(): Promise<void> {
  validating.value = true;
  errorAlert.value = null;
  try {
    const json = await api("catalog_validate");
    lastValidationTime.value = new Date().toISOString();
    hasValidated.value = true;

    if (json?.success && json?.data) {
      const d = json.data;
      validation.value = {
        meta_connected: d.meta_connected ?? false,
        catalog_accessible: d.catalog_accessible ?? d.catalog_valid ?? false,
        waba_connected: d.waba_connected ?? false,
        permissions_valid: d.permissions_valid ?? d.permissions_ok ?? false,
      };
      toast.add({
        severity: allPassed.value ? "success" : "warn",
        summary: allPassed.value ? "All Checks Passed" : "Validation Issues Found",
        detail: allPassed.value
          ? "Your Meta integration is fully healthy."
          : "Some integration checks failed — review results below.",
        life: 4000,
      });
    }
  } catch (e: any) {
    const err = classifyError(e.message ?? "");
    errorAlert.value = err;
    toast.add({ severity: "error", summary: "Validation Failed", detail: err.message, life: 4000 });
  } finally {
    validating.value = false;
  }
}

async function refreshAll(): Promise<void> {
  globalLoading.value = true;
  errorAlert.value = null;
  try {
    await Promise.all([fetchCatalogDetails(), fetchSyncStatus(), fetchProfile()]);
    if (!initialLoading.value) {
      toast.add({ severity: "success", summary: "Settings Refreshed", detail: "Catalog details and sync status updated.", life: 3000 });
    }
  } catch (e: any) {
    const err = classifyError(e.message ?? "");
    errorAlert.value = err;
    toast.add({ severity: "error", summary: "Refresh Failed", detail: err.message, life: 4000 });
  } finally {
    globalLoading.value = false;
    initialLoading.value = false;
  }
}

async function triggerDisconnect(): Promise<void> {
  disconnecting.value = true;
  try {
    // Attempt to clear seller-side records on the backend
    try {
      await api("meta_disconnect");
    } catch {
      // Non-fatal: clear locally even if endpoint is absent
    }

    catalog.value = {
      meta_connected: false,
      business_name: "",
      catalog_name: "",
      catalog_id: "",
      phone_number: "",
      total_catalog_products: 0,
      last_updated: null,
    };
    validation.value = { meta_connected: false, catalog_accessible: false, waba_connected: false, permissions_valid: false };
    sync.value = { last_sync_status: "unknown", last_sync: null, sync_health: "unknown" };
    hasValidated.value = false;
    lastValidationTime.value = null;

    toast.add({ severity: "info", summary: "Disconnected", detail: "Seller-side connection records removed.", life: 4000 });
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Disconnect Failed", detail: e.message || "Unable to remove connection.", life: 4000 });
  } finally {
    disconnecting.value = false;
    disconnectModal.value = false;
  }
}

function navigateToMetaConnect(): void {
  window.history.pushState(null, "", "/fragmetaconnect");
  window.dispatchEvent(new Event("popstate"));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function classifyError(message: string): ErrorAlert {
  const m = message.toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { type: "token_expired", title: "Session Expired", message: "Your Meta session has expired. Please reconnect." };
  if (m.includes("catalog") && (m.includes("missing") || m.includes("not found") || m.includes("404")))
    return { type: "catalog_missing", title: "Catalog Missing", message: "No active catalog found. Reconnect your Meta profile to sync assets." };
  if (m.includes("permission") || m.includes("403") || m.includes("forbidden"))
    return { type: "permission_error", title: "Access Denied", message: "Insufficient Meta API permissions. Please reconnect and grant access." };
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout"))
    return { type: "network_error", title: "Connection Error", message: "Unable to reach the settings server. Please check your network." };
  return { type: "unknown", title: "Operation Failed", message: message || "An unexpected error occurred." };
}

function statusBadge(health: string): string {
  const h = (health ?? "").toLowerCase();
  if (["good", "completed", "success"].includes(h)) return "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;";
  if (["partial", "warning"].includes(h)) return "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;";
  if (["failed", "error"].includes(h)) return "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;";
  return "background:#f0f2f5; color:#667781; border:1px solid #e9edef;";
}

function formatStatus(status: string): string {
  if (!status) return "Unknown";
  const map: Record<string, string> = {
    running: "In Progress", syncing: "In Progress",
    completed: "Completed", success: "Completed", good: "Completed",
    failed: "Failed", error: "Failed",
    partial: "Warning", warning: "Warning",
    unknown: "Not Synced",
  };
  return map[status.toLowerCase()] ?? status;
}

function formatTime(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString())
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(refreshAll);
</script>
