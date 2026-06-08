<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Confirmation Dialog Modal ─── -->
    <div v-if="confirmDialogVisible"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm transition-opacity duration-300">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl transform transition-transform duration-300 scale-100 border border-[#e0e0e0]">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-[#e7f8f4] flex items-center justify-center text-[#00a884]">
            <i class="pi pi-question-circle text-lg" />
          </div>
          <h3 class="text-lg font-bold text-[#111b17]">Confirm Product Sync</h3>
        </div>
        <p class="text-sm text-[#667781] mb-6 leading-relaxed">
          Are you sure you want to sync all products to your Meta Catalog?
        </p>
        <div class="flex items-center justify-end gap-3">
          <button @click="confirmDialogVisible = false"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-[#667781] bg-[#f0f2f5] hover:bg-[#e9edef] transition-colors cursor-pointer">
            Cancel
          </button>
          <button @click="triggerSync"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#00a884] hover:bg-[#008f70] transition-colors shadow-md shadow-[#00a884]/20 cursor-pointer">
            Confirm Sync
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Header ─── -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">Catalog Sync Center</h1>
          <p class="text-xs" style="color: #667781;">Manage and monitor Meta Catalog synchronization</p>
        </div>
      </div>
      <!-- Refresh Controls & Loading Indicator -->
      <div class="flex items-center gap-2">
        <button @click="refreshAll" :disabled="globalLoading || syncing"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
          :style="globalLoading || syncing
            ? 'background: #f0f2f5; border: 1px solid #e9edef; color: #ccd0d5; cursor: not-allowed;'
            : 'background: #fff; border: 1px solid #e0e0e0; color: #111b17; box-shadow: 0 1px 3px rgba(0,0,0,0.04);'">
          <i :class="globalLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
          Refresh
        </button>
      </div>
    </div>

    <!-- ─── Error Alert Banner (seller-friendly, dismissible) ─── -->
    <div v-if="errorAlert" class="rounded-2xl p-4 mb-4 flex items-start gap-3 transition-all"
      :style="errorAlertStyle.banner">
      <i :class="errorAlertStyle.icon" class="text-sm mt-0.5 flex-shrink-0" :style="errorAlertStyle.iconStyle" />
      <div class="flex-1">
        <p class="text-sm font-semibold" :style="errorAlertStyle.title">{{ errorAlert.title }}</p>
        <p class="text-xs mt-0.5" :style="errorAlertStyle.message">{{ errorAlert.message }}</p>
      </div>
      <button @click="errorAlert = null" class="flex-shrink-0 cursor-pointer">
        <i class="pi pi-times text-xs" style="color: #667781;" />
      </button>
    </div>

    <!-- ─── Loading Skeleton (Initial Fetch) ─── -->
    <div v-if="initialLoading">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div v-for="n in 4" :key="'sk-metric-' + n" class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="h-3 rounded-full animate-pulse mb-3" style="background: #e9edef; width: 60px;" />
          <div class="h-6 rounded-full animate-pulse" style="background: #e9edef; width: 120px;" />
        </div>
      </div>
      <div class="rounded-2xl p-8 mb-4 animate-pulse" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="h-4 rounded-full bg-gray-200 mb-3 w-1/3 mx-auto" />
        <div class="h-10 rounded-xl bg-gray-200 w-48 mx-auto" />
      </div>
    </div>

    <!-- ─── Main Content ─── -->
    <div v-else>
      
      <!-- ─── Empty State: No sync has ever been performed ─── -->
      <div v-if="hasNeverSynced" class="rounded-2xl p-12 mb-6 flex flex-col items-center justify-center gap-4 text-center"
        style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background: linear-gradient(135deg, #e7f8f4 0%, #f0f2f5 100%);">
          <i class="pi pi-cloud-upload text-2xl" style="color: #00a884;" />
        </div>
        <div>
          <p class="text-lg font-bold mb-1" style="color: #111b17;">No product sync has been performed yet.</p>
          <p class="text-sm" style="color: #667781; max-width: 420px;">
            Synchronize your source system products directly into your connected WhatsApp Meta catalog.
          </p>
        </div>
        <button @click="confirmSync" :disabled="syncing"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm mt-1 transition-all hover:scale-[1.02] cursor-pointer"
          style="background: #00a884; color: #fff; border: none; box-shadow: 0 4px 12px rgba(0,168,132,0.3);">
          <i class="pi pi-sync text-sm" />
          Sync Products
        </button>
      </div>

      <!-- ─── Active Dashboard ─── -->
      <div v-else>
        <!-- Metrics Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <!-- Catalog Name -->
          <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #667781;">Catalog Name</p>
            <p class="text-lg font-bold truncate" style="color: #111b17;">{{ catalogDetails.catalog_name || '—' }}</p>
            <p class="text-xs mt-1" style="color: #8696a0;">ID: {{ catalogDetails.catalog_id || '—' }}</p>
          </div>
          <!-- Source Products count -->
          <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #667781;">Source System Products</p>
            <p class="text-2xl font-bold" style="color: #111b17;">{{ catalogDetails.total_source_products }}</p>
            <p class="text-xs mt-1" style="color: #8696a0;">Available to sync</p>
          </div>
          <!-- Meta Catalog count -->
          <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #667781;">Meta Catalog Products</p>
            <p class="text-2xl font-bold" style="color: #00a884;">{{ catalogDetails.total_catalog_products }}</p>
            <p class="text-xs mt-1" style="color: #8696a0;">Currently synced</p>
          </div>
          <!-- Last Sync Status -->
          <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
            <p class="text-xs font-semibold uppercase tracking-wide mb-1" style="color: #667781;">Last Sync Status</p>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded-full font-semibold" :style="healthStyle(syncData.sync_health).badge">
                {{ formatSyncStatus(syncData.last_sync_status) }}
              </span>
            </div>
            <p class="text-xs mt-1" style="color: #8696a0;">
              {{ syncData.last_sync ? formatTime(syncData.last_sync) : 'Never' }}
            </p>
          </div>
        </div>

        <!-- ─── Sync Progress (Active Sync Only) ─── -->
        <div v-if="syncing" class="rounded-2xl p-6 mb-6" style="background: #fff; border: 1px solid #00a884; box-shadow: 0 4px 15px rgba(0,168,132,0.08);">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
              <span class="text-sm font-bold text-[#111b17]">Sync Running...</span>
            </div>
            <span class="text-xs font-semibold text-[#667781]">
              Processed: {{ progressStats.processed }} / {{ progressStats.total || catalogDetails.total_source_products }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full rounded-full h-2.5 mb-4" style="background: #f0f2f5;">
            <div class="h-2.5 rounded-full transition-all duration-300" style="background: #00a884;"
              :style="{ width: progressPercentage + '%' }" />
          </div>

          <!-- Progress stats grid -->
          <div class="grid grid-cols-3 gap-4 text-center bg-[#f8f9fa] rounded-xl p-3 border border-[#e9edef]">
            <div>
              <p class="text-xs text-[#667781] font-medium">Processed</p>
              <p class="text-base font-bold text-[#111b17]">{{ progressStats.processed }}</p>
            </div>
            <div>
              <p class="text-xs text-[#00a884] font-medium">Successful</p>
              <p class="text-base font-bold text-[#00a884]">{{ progressStats.successful }}</p>
            </div>
            <div>
              <p class="text-xs text-[#e53935] font-medium">Failed</p>
              <p class="text-base font-bold text-[#e53935]">{{ progressStats.failed }}</p>
            </div>
          </div>
          <p class="text-xs text-center mt-2.5 text-[#667781]">Please keep this window open while we push changes to Meta.</p>
        </div>

        <!-- ─── Primary CTA Card ─── -->
        <div v-if="!syncing" class="rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style="background: #fff; border: 1px solid #e0e0e0;">
          <div>
            <h3 class="font-bold text-[#111b17] text-sm sm:text-base">Sync All Products</h3>
            <p class="text-xs text-[#667781] mt-0.5">
              Overwrite or add catalog products to Meta according to the source catalog list.
            </p>
          </div>
          <button @click="confirmSync"
            class="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#00a884] hover:bg-[#008f70] transition-all cursor-pointer shadow-md shadow-[#00a884]/15">
            <i class="pi pi-sync" />
            Sync All Products
          </button>
        </div>

        <!-- ─── Sync Results Banner (Recent run outcome) ─── -->
        <div v-if="lastResult && !syncing" class="rounded-2xl p-5 mb-6 border transition-all"
          :style="healthStyle(lastResult.sync_health).bannerStyle">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                :style="healthStyle(lastResult.sync_health).iconBg">
                <i :class="healthStyle(lastResult.sync_health).icon" class="text-sm" />
              </div>
              <div>
                <p class="font-bold text-sm text-[#111b17]">Sync Completed</p>
                <p class="text-xs text-[#667781] mt-0.5">
                  Result of the last executed sync.
                </p>
              </div>
            </div>
            <button @click="lastResult = null" class="cursor-pointer">
              <i class="pi pi-times text-xs text-[#667781]" />
            </button>
          </div>
          <!-- Results Breakdown -->
          <div class="grid grid-cols-3 gap-2 mt-4 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-black/5 text-center">
            <div>
              <p class="text-xs text-[#667781]">Total Products</p>
              <p class="text-base font-bold text-[#111b17]">{{ lastResult.total }}</p>
            </div>
            <div>
              <p class="text-xs text-[#00a884]">Successful</p>
              <p class="text-base font-bold text-[#00a884]">{{ lastResult.synced }}</p>
            </div>
            <div>
              <p class="text-xs text-[#e53935]">Failed</p>
              <p class="text-base font-bold text-[#e53935]">{{ lastResult.failed }}</p>
            </div>
          </div>
        </div>

        <!-- ─── Failed Products Section ─── -->
        <div v-if="syncErrors.length > 0" class="rounded-2xl overflow-hidden mb-6" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="px-5 py-4 border-b border-[#f0f2f5] flex items-center justify-between" style="background: #fff;">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-[#fff0f0] flex items-center justify-center">
                <i class="pi pi-exclamation-circle text-xs text-[#e53935]" />
              </div>
              <h2 class="font-bold text-sm text-[#111b17]">Failed Products ({{ syncErrors.length }})</h2>
            </div>
          </div>
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[#f0f2f5]" style="background: #f8f9fa;">
                  <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781]">Product Name</th>
                  <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781]">Error Message</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#f0f2f5]">
                <tr v-for="err in syncErrors" :key="err.id || err.name" class="hover:bg-[#f8f9fa] transition-colors">
                  <td class="px-5 py-3.5 text-sm font-semibold text-[#111b17]">{{ err.name || err.product_name || 'Unknown' }}</td>
                  <td class="px-5 py-3.5 text-sm text-[#e53935]">{{ friendlyErrorMessage(err.reason || err.error_message || err.error) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ─── Sync History ─── -->
        <div class="rounded-2xl overflow-hidden mb-6" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="px-5 py-4 border-b border-[#f0f2f5] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-[#f0f4ff] flex items-center justify-center">
                <i class="pi pi-history text-xs text-[#6366f1]" />
              </div>
              <h2 class="font-bold text-sm text-[#111b17]">Recent Sync Runs</h2>
            </div>
          </div>
          <div v-if="syncHistory.length === 0" class="py-12 text-center">
            <i class="pi pi-inbox text-3xl text-gray-300 mb-2" />
            <p class="text-sm text-[#667781]">No history logs found.</p>
          </div>
          <div v-else>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-[#f0f2f5]" style="background: #f8f9fa;">
                    <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781]">Date</th>
                    <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781]">Status</th>
                    <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781] text-center">Total Products</th>
                    <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781] text-center">Successful</th>
                    <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#667781] text-center">Failed</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#f0f2f5]">
                  <tr v-for="run in syncHistory" :key="run.id || run.date" class="hover:bg-[#f8f9fa] transition-colors">
                    <td class="px-5 py-3.5 text-sm text-[#111b17]">{{ formatTime(run.date || run.created_at) }}</td>
                    <td class="px-5 py-3.5 text-xs font-semibold">
                      <span class="px-2 py-0.5 rounded-full" :style="healthStyle(run.status || run.sync_health).badge">
                        {{ formatSyncStatus(run.status || run.sync_health) }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-sm text-[#111b17] text-center">{{ run.total_products ?? run.total ?? 0 }}</td>
                    <td class="px-5 py-3.5 text-sm text-[#00a884] text-center font-semibold">{{ run.synced ?? run.successful ?? 0 }}</td>
                    <td class="px-5 py-3.5 text-sm text-center font-semibold"
                      :class="(run.failed ?? 0) > 0 ? 'text-[#e53935]' : 'text-[#667781]'">
                      {{ run.failed ?? 0 }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Controls -->
            <div class="px-5 py-3.5 border-t border-[#f0f2f5] flex items-center justify-between flex-wrap gap-2">
              <span class="text-xs text-[#667781]">
                Showing page {{ historyPage }} of {{ historyTotalPages }} ({{ historyTotal }} runs total)
              </span>
              <div class="flex items-center gap-2">
                <button @click="changeHistoryPage(historyPage - 1)" :disabled="historyPage <= 1"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3b4a54] bg-[#f0f2f5] hover:bg-[#e9edef] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  Previous
                </button>
                <button @click="changeHistoryPage(historyPage + 1)" :disabled="historyPage >= historyTotalPages"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3b4a54] bg-[#f0f2f5] hover:bg-[#e9edef] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

// ─── Interfaces ───
interface CatalogDetails {
  catalog_name: string;
  catalog_id: string;
  total_source_products: number;
  total_catalog_products: number;
  last_updated: string | null;
}

interface SyncData {
  last_sync_status: string;
  last_sync: string | null;
  sync_health: string;
}

interface ProgressStats {
  processed: number;
  successful: number;
  failed: number;
  total: number;
}

interface ErrorAlert {
  title: string;
  message: string;
  type: "sync_failed" | "token_expired" | "catalog_missing" | "permission_error" | "network_error" | "unknown";
}

// ─── Props ───
const props = defineProps<{
  project: string;
  instance: string;
  user_id: string;
  access_token: string;
  record_id: string;
}>();

// ─── State ───
const toast = useToast();
const initialLoading = ref(true);
const globalLoading = ref(false);
const syncing = ref(false);
const confirmDialogVisible = ref(false);
const errorAlert = ref<ErrorAlert | null>(null);

const catalogDetails = ref<CatalogDetails>({
  catalog_name: "",
  catalog_id: "",
  total_source_products: 0,
  total_catalog_products: 0,
  last_updated: null,
});

const syncData = ref<SyncData>({
  last_sync_status: "unknown",
  last_sync: null,
  sync_health: "unknown",
});

const progressStats = ref<ProgressStats>({
  processed: 0,
  successful: 0,
  failed: 0,
  total: 0,
});

const lastResult = ref<{ synced: number; failed: number; total: number; sync_health: string } | null>(null);
const syncErrors = ref<any[]>([]);
const syncHistory = ref<any[]>([]);

// Pagination settings for sync history
const historyPage = ref(1);
const historyLimit = ref(5);
const historyTotal = ref(0);

let pollingTimer: any = null;

// ─── API Layer ───
const BASE_URL = "";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
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
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("token expired");
    }
    throw new Error(`network_error_${res.status}`);
  }
  return res.json();
}

// ─── Computed Values ───
const hasNeverSynced = computed(() => {
  return !syncData.value.last_sync && syncHistory.value.length === 0;
});

const historyTotalPages = computed(() => {
  return Math.ceil(historyTotal.value / historyLimit.value) || 1;
});

const progressPercentage = computed(() => {
  const total = progressStats.value.total || catalogDetails.value.total_source_products || 1;
  return Math.min(100, Math.round((progressStats.value.processed / total) * 100));
});

const errorAlertStyle = computed(() => {
  const t = errorAlert.value?.type;
  if (t === "token_expired" || t === "permission_error") {
    return {
      banner: "background: #fff0f0; border: 1px solid #ffcdd2;",
      icon: "pi pi-lock",
      iconStyle: "color: #e53935;",
      title: "color: #e53935;",
      message: "color: #b71c1c;",
    };
  } else if (t === "catalog_missing") {
    return {
      banner: "background: #fff8e1; border: 1px solid #ffe082;",
      icon: "pi pi-box",
      iconStyle: "color: #f59e0b;",
      title: "color: #f59e0b;",
      message: "color: #92700a;",
    };
  } else {
    return {
      banner: "background: #fff0f0; border: 1px solid #ffcdd2;",
      icon: "pi pi-times-circle",
      iconStyle: "color: #e53935;",
      title: "color: #e53935;",
      message: "color: #b71c1c;",
    };
  }
});

// ─── Data Fetchers ───
async function fetchCatalogDetails(): Promise<void> {
  try {
    const json = await api("catalog_details");
    if (json?.success && json?.data) {
      const d = json.data;
      catalogDetails.value = {
        catalog_name: d.catalog_name ?? "Product Catalog",
        catalog_id: d.catalog_id ?? "",
        total_source_products: d.total_source_products ?? d.source_product_count ?? d.source_products_count ?? d.total_products ?? 0,
        total_catalog_products: d.total_catalog_products ?? d.catalog_product_count ?? d.total_products ?? 0,
        last_updated: d.last_updated ?? d.updated_at ?? null,
      };
    }
  } catch (e: any) {
    throw e;
  }
}

async function fetchSyncStatus(): Promise<void> {
  try {
    const json = await api("catalog_sync_status");
    if (json?.success && json?.data) {
      const d = json.data;
      
      syncData.value = {
        last_sync_status: d.last_sync_status ?? d.sync_status ?? d.status ?? d.sync_health ?? "unknown",
        last_sync: d.last_sync ?? d.last_sync_time ?? d.updated_at ?? null,
        sync_health: d.sync_health ?? d.health ?? "unknown",
      };

      // If progress updates are inside status
      if (d.processed !== undefined || d.synced !== undefined) {
        progressStats.value = {
          processed: d.processed ?? d.products_processed ?? ((d.synced ?? d.successful ?? 0) + (d.failed ?? 0)),
          successful: d.synced ?? d.successful ?? 0,
          failed: d.failed ?? 0,
          total: d.total_products ?? d.total ?? catalogDetails.value.total_source_products ?? 0,
        };
      }

      // If sync status endpoint indicates syncing is active
      const stat = (d.sync_status ?? d.status ?? d.state ?? "").toLowerCase();
      if (stat === "running" || stat === "syncing" || d.syncing === true) {
        if (!syncing.value) {
          startPolling();
        }
      } else {
        if (syncing.value) {
          stopPolling();
          // Load final results
          lastResult.value = {
            synced: d.synced ?? d.successful ?? 0,
            failed: d.failed ?? 0,
            total: d.total_products ?? d.total ?? progressStats.value.total,
            sync_health: d.sync_health ?? "good",
          };
        }
      }
    }
  } catch (e: any) {
    // Non-fatal
  }
}

async function fetchSyncErrors(): Promise<void> {
  try {
    const json = await api("catalog_sync_errors");
    if (json?.success && json?.data) {
      const d = json.data;
      syncErrors.value = d.errors ?? d.failed_items ?? d ?? [];
    } else {
      syncErrors.value = [];
    }
  } catch (e: any) {
    syncErrors.value = [];
  }
}

async function fetchSyncHistory(page = 1): Promise<void> {
  try {
    const json = await api("catalog_sync_history", {
      page: page,
      limit: historyLimit.value,
    });
    if (json?.success && json?.data) {
      const d = json.data;
      syncHistory.value = d.history ?? d.runs ?? d ?? [];
      historyTotal.value = d.total ?? d.total_count ?? d.length ?? syncHistory.value.length;
      historyPage.value = page;
    }
  } catch (e: any) {
    // Non-fatal
  }
}

// ─── Primary Controls ───
function confirmSync() {
  confirmDialogVisible.value = false;
  // Trigger UI dialog
  confirmDialogVisible.value = true;
}

async function triggerSync() {
  confirmDialogVisible.value = false;
  syncing.value = true;
  errorAlert.value = null;
  lastResult.value = null;

  // Initialize progress
  progressStats.value = {
    processed: 0,
    successful: 0,
    failed: 0,
    total: catalogDetails.value.total_source_products,
  };

  try {
    const json = await api("catalog_sync_full");
    if (json?.success) {
      toast.add({
        severity: "info",
        summary: "Sync Started",
        detail: "Pushing catalog updates to Meta...",
        life: 3000,
      });
      // Start checking for updates immediately
      startPolling();
    } else {
      throw new Error(json?.message ?? "Failed to start sync");
    }
  } catch (e: any) {
    syncing.value = false;
    const classified = classifyError(e.message ?? "");
    errorAlert.value = classified;
    toast.add({
      severity: "error",
      summary: classified.title,
      detail: classified.message,
      life: 5000,
    });
  }
}

// ─── Polling System ───
function startPolling() {
  syncing.value = true;
  if (pollingTimer) clearInterval(pollingTimer);
  pollingTimer = setInterval(async () => {
    try {
      const json = await api("catalog_sync_status");
      if (json?.success && json?.data) {
        const d = json.data;
        const stat = (d.sync_status ?? d.status ?? d.state ?? "").toLowerCase();

        // Update progress counters
        progressStats.value = {
          processed: d.processed ?? d.products_processed ?? ((d.synced ?? d.successful ?? 0) + (d.failed ?? 0)),
          successful: d.synced ?? d.successful ?? 0,
          failed: d.failed ?? 0,
          total: d.total_products ?? d.total ?? catalogDetails.value.total_source_products ?? 0,
        };

        if (stat !== "running" && stat !== "syncing" && d.syncing !== true) {
          stopPolling();
          // Finished sync
          lastResult.value = {
            synced: d.synced ?? d.successful ?? 0,
            failed: d.failed ?? 0,
            total: d.total_products ?? d.total ?? progressStats.value.total,
            sync_health: d.sync_health ?? "good",
          };

          toast.add({
            severity: d.sync_health === "good" ? "success" : d.sync_health === "partial" ? "warn" : "error",
            summary: d.sync_health === "good" ? "Sync Completed" : d.sync_health === "partial" ? "Sync Warning" : "Sync Failed",
            detail: `${d.synced ?? d.successful ?? 0} successfully synced, ${d.failed ?? 0} errors.`,
            life: 5000,
          });

          // Reload tables
          await Promise.all([
            fetchCatalogDetails(),
            fetchSyncStatus(),
            fetchSyncErrors(),
            fetchSyncHistory(1),
          ]);
        }
      }
    } catch (err) {
      // Keep trying unless it's a structural auth issue
    }
  }, 2000);
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  syncing.value = false;
}

// ─── Refresh Control ───
async function refreshAll() {
  globalLoading.value = true;
  errorAlert.value = null;

  try {
    await Promise.all([
      fetchCatalogDetails(),
      fetchSyncStatus(),
      fetchSyncErrors(),
      fetchSyncHistory(historyPage.value),
    ]);

    toast.add({
      severity: "success",
      summary: "Refreshed",
      detail: "Catalog status and history logs updated.",
      life: 3000,
    });
  } catch (e: any) {
    const classified = classifyError(e.message ?? "");
    errorAlert.value = classified;
    toast.add({
      severity: "error",
      summary: "Refresh Failed",
      detail: classified.message,
      life: 4000,
    });
  } finally {
    globalLoading.value = false;
    initialLoading.value = false;
  }
}

async function changeHistoryPage(newPage: number) {
  if (newPage < 1 || newPage > historyTotalPages.value) return;
  globalLoading.value = true;
  try {
    await fetchSyncHistory(newPage);
  } finally {
    globalLoading.value = false;
  }
}

// ─── Helper Functions ───
function classifyError(message: string): ErrorAlert {
  const lower = message.toLowerCase();
  if (lower.includes("token") && lower.includes("expired")) {
    return {
      type: "token_expired",
      title: "Session Expired",
      message: "Your Meta connection credentials have expired. Please log in to Meta Connect again.",
    };
  }
  if (lower.includes("catalog") && (lower.includes("missing") || lower.includes("not found") || lower.includes("404"))) {
    return {
      type: "catalog_missing",
      title: "Catalog Missing",
      message: "No product catalog found for your Meta account. Please select or connect one first.",
    };
  }
  if (lower.includes("permission") || lower.includes("scope") || lower.includes("auth") || lower.includes("forbidden") || lower.includes("403")) {
    return {
      type: "permission_error",
      title: "Permission Denied",
      message: "Insufficient permissions to edit your Meta Catalog. Please grant access under Meta Connect.",
    };
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("timeout") || lower.includes("connect")) {
    return {
      type: "network_error",
      title: "Connection Error",
      message: "Unable to contact the synchronization server. Please verify your connection.",
    };
  }
  return {
    type: "sync_failed",
    title: "Sync Failed",
    message: message || "An unexpected error occurred during product synchronization.",
  };
}

function friendlyErrorMessage(raw: string): string {
  if (!raw) return "Sync failed";
  const lower = raw.toLowerCase();
  if (lower.includes("image") || lower.includes("photo")) return "Product image is invalid or missing URL";
  if (lower.includes("price")) return "Product price format or currency is incorrect";
  if (lower.includes("title") || lower.includes("name")) return "Product name is missing or exceeds max characters";
  if (lower.includes("url") || lower.includes("link")) return "Product link is invalid or unreachable";
  if (lower.includes("duplicate")) return "Duplicate product ID detected in database";
  if (lower.includes("permission")) return "Meta permissions revoked or mismatch";
  if (raw.length > 80 || /[{}\[\]<>]/.test(raw)) return "Format error - product rejected by Meta API";
  return raw;
}

function healthStyle(health: string) {
  const map: Record<string, any> = {
    good: {
      badge: "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;",
      bannerStyle: "background:#e7f8f4; border:1px solid #b2dfdb;",
      iconBg: "background:#00a884;",
      icon: "pi pi-check",
    },
    success: {
      badge: "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;",
      bannerStyle: "background:#e7f8f4; border:1px solid #b2dfdb;",
      iconBg: "background:#00a884;",
      icon: "pi pi-check",
    },
    partial: {
      badge: "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;",
      bannerStyle: "background:#fff8e1; border:1px solid #ffe082;",
      iconBg: "background:#f59e0b;",
      icon: "pi pi-exclamation-triangle",
    },
    warning: {
      badge: "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;",
      bannerStyle: "background:#fff8e1; border:1px solid #ffe082;",
      iconBg: "background:#f59e0b;",
      icon: "pi pi-exclamation-triangle",
    },
    error: {
      badge: "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;",
      bannerStyle: "background:#fff0f0; border:1px solid #ffcdd2;",
      iconBg: "background:#e53935;",
      icon: "pi pi-times",
    },
    failed: {
      badge: "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;",
      bannerStyle: "background:#fff0f0; border:1px solid #ffcdd2;",
      iconBg: "background:#e53935;",
      icon: "pi pi-times",
    },
    unknown: {
      badge: "background:#f0f2f5; color:#667781; border:1px solid #e9edef;",
      bannerStyle: "background:#f0f2f5; border:1px solid #e9edef;",
      iconBg: "background:#667781;",
      icon: "pi pi-info",
    },
  };
  return map[health?.toLowerCase()] ?? map.unknown;
}

function formatSyncStatus(status: string): string {
  if (!status) return "Unknown";
  const map: Record<string, string> = {
    running: "In Progress",
    syncing: "In Progress",
    completed: "Completed",
    success: "Completed",
    failed: "Failed",
    good: "Completed",
    partial: "Warning",
    warning: "Warning",
    unknown: "Not Synced",
  };
  return map[status.toLowerCase()] ?? status.toUpperCase();
}

function formatTime(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

// ─── Lifecycle ───
onMounted(async () => {
  await refreshAll();
});

onUnmounted(() => {
  stopPolling();
});
</script>
