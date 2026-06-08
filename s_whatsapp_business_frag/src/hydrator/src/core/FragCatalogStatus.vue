<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Header ─── -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">Catalog Status</h1>
          <p class="text-xs" style="color: #667781;">Monitor your WhatsApp Commerce catalog health</p>
        </div>
      </div>
      <button @click="refreshAll" :disabled="globalLoading"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        :style="globalLoading
          ? 'background:#f0f2f5; border:1px solid #e9edef; color:#ccd0d5; cursor:not-allowed;'
          : 'background:#fff; border:1px solid #e0e0e0; color:#111b17;'">
        <i :class="globalLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color:#00a884;" />
        Refresh Status
      </button>
    </div>

    <!-- ─── Skeleton ─── -->
    <div v-if="initialLoading">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div v-for="n in 4" :key="n" class="rounded-2xl p-5 animate-pulse" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <div class="h-3 rounded-full" style="background:#e9edef; width:70px;" />
            <div class="w-7 h-7 rounded-lg" style="background:#f0f2f5;" />
          </div>
          <div class="h-5 rounded-full mb-2" style="background:#e9edef; width:90px;" />
          <div class="h-3 rounded-full" style="background:#f0f2f5; width:120px;" />
        </div>
      </div>
      <div class="rounded-2xl p-6 mb-4 animate-pulse" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="flex items-center gap-4 mb-5">
          <div class="w-12 h-12 rounded-2xl" style="background:#f0f2f5;" />
          <div>
            <div class="h-5 rounded-full mb-2" style="background:#e9edef; width:180px;" />
            <div class="h-3 rounded-full" style="background:#f0f2f5; width:120px;" />
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="n in 4" :key="n" class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
            <div class="h-3 rounded-full mb-2" style="background:#e9edef; width:50px;" />
            <div class="h-6 rounded-full" style="background:#e9edef; width:80px;" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="n in 2" :key="n" class="rounded-2xl p-5 animate-pulse" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="h-4 rounded-full mb-4" style="background:#e9edef; width:100px;" />
          <div v-for="m in 3" :key="m" class="flex items-center gap-3 mb-3">
            <div class="w-8 h-8 rounded-lg" style="background:#f0f2f5;" />
            <div>
              <div class="h-3 rounded-full mb-1" style="background:#e9edef; width:120px;" />
              <div class="h-2 rounded-full" style="background:#f0f2f5; width:80px;" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Fatal Error ─── -->
    <div v-else-if="fatalError"
      class="rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center"
      style="background:#fff; border:1px solid #e0e0e0;">
      <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#fff0f0;">
        <i class="pi pi-exclamation-circle text-2xl" style="color:#e53935;" />
      </div>
      <div>
        <p class="text-base font-bold mb-1" style="color:#111b17;">{{ fatalError.title }}</p>
        <p class="text-sm" style="color:#667781; max-width:380px;">{{ fatalError.message }}</p>
      </div>
      <button @click="refreshAll"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
        style="background:#00a884; color:#fff; border:none;">
        <i class="pi pi-refresh text-xs" /> Try Again
      </button>
    </div>

    <!-- ─── Empty: Meta Not Connected ─── -->
    <div v-else-if="!catalogDetails.meta_connected && !globalLoading"
      class="rounded-2xl p-14 flex flex-col items-center justify-center gap-4 text-center"
      style="background:#fff; border:1px solid #e0e0e0;">
      <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
        style="background:linear-gradient(135deg,#e7f8f4,#f0f2f5);">
        <i class="pi pi-link text-3xl" style="color:#00a884;" />
      </div>
      <div>
        <p class="text-lg font-bold mb-2" style="color:#111b17;">Connect Your Account First</p>
        <p class="text-sm" style="color:#667781; max-width:380px;">
          Connect your WhatsApp Business account to start syncing products and monitoring your catalog health.
        </p>
      </div>
      <button @click="() => window.location.href = '/fragmetaconnect'"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
        style="background:#00a884; color:#fff; border:none; box-shadow:0 4px 12px rgba(0,168,132,0.3);">
        <i class="pi pi-whatsapp text-sm" /> Go To Meta Connect
      </button>
    </div>

    <!-- ─── Main Dashboard ─── -->
    <div v-else>

      <!-- Error Alert Banner -->
      <div v-if="errorAlert" class="rounded-2xl p-4 mb-4 flex items-start gap-3" :style="errorAlert.bannerStyle">
        <i :class="errorAlert.icon" class="text-sm mt-0.5 flex-shrink-0" :style="errorAlert.iconStyle" />
        <div class="flex-1">
          <p class="text-sm font-semibold" :style="errorAlert.titleStyle">{{ errorAlert.title }}</p>
          <p class="text-xs mt-0.5" :style="errorAlert.msgStyle">{{ errorAlert.message }}</p>
        </div>
        <button @click="errorAlert = null"><i class="pi pi-times text-xs" style="color:#667781;" /></button>
      </div>

      <!-- ─── Connection Health Cards ─── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div v-for="check in healthChecks" :key="check.label"
          class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">{{ check.label }}</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              :style="check.passed ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
              <i :class="check.passed ? 'pi pi-check' : 'pi pi-times'" class="text-xs"
                :style="check.passed ? 'color:#00a884;' : 'color:#e53935;'" />
            </div>
          </div>
          <p class="text-sm font-bold mb-0.5" :style="check.passed ? 'color:#00a884;' : 'color:#e53935;'">
            {{ check.passed ? check.passLabel : check.failLabel }}
          </p>
          <p class="text-xs" style="color:#667781;">{{ check.detail }}</p>
        </div>
      </div>

      <!-- ─── Catalog Overview Card ─── -->
      <div class="rounded-2xl overflow-hidden mb-4" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-6 pt-6 pb-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            :style="catalogDetails.catalog_connected
              ? 'background:#e7f8f4; border:2px solid #00a884;'
              : 'background:#f0f2f5; border:2px solid #e9edef;'">
            <i class="pi pi-box text-xl"
              :style="catalogDetails.catalog_connected ? 'color:#00a884;' : 'color:#ccd0d5;'" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="catalogDetails.catalog_connected
                  ? 'background:#00a884; color:#fff;'
                  : 'background:#f0f2f5; color:#667781;'">
                {{ catalogDetails.catalog_connected ? '● Connected' : '○ Disconnected' }}
              </span>
            </div>
            <p class="text-lg font-bold truncate" style="color:#111b17;">
              {{ catalogDetails.catalog_name || 'No Catalog' }}
            </p>
            <p class="text-xs" style="color:#667781;">
              {{ catalogDetails.last_updated ? `Updated ${formatTime(catalogDetails.last_updated)}` : 'Not yet updated' }}
            </p>
          </div>
        </div>

        <!-- Catalog Info Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 pb-6">
          <!-- Products in Catalog Highlight -->
          <div class="rounded-xl p-4 col-span-2 md:col-span-1"
            style="background:linear-gradient(135deg,#e7f8f4,#f0faf8); border:1px solid #b2dfdb;">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#fff;">
                <i class="pi pi-box text-xs" style="color:#00a884;" />
              </div>
              <span class="text-xs font-medium" style="color:#667781;">Products in Catalog</span>
            </div>
            <p class="text-3xl font-bold" style="color:#00a884;">{{ catalogDetails.total_products ?? 0 }}</p>
          </div>
          <div class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                <i class="pi pi-check-circle text-xs" style="color:#00a884;" />
              </div>
              <span class="text-xs font-medium" style="color:#667781;">Status</span>
            </div>
            <p class="text-sm font-bold"
              :style="catalogDetails.catalog_connected ? 'color:#00a884;' : 'color:#e53935;'">
              {{ catalogDetails.catalog_connected ? 'Active' : 'Inactive' }}
            </p>
          </div>
          <div class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
                <i class="pi pi-building text-xs" style="color:#6366f1;" />
              </div>
              <span class="text-xs font-medium" style="color:#667781;">Business</span>
            </div>
            <p class="text-sm font-bold truncate" style="color:#111b17;">
              {{ catalogDetails.display_name || '—' }}
            </p>
          </div>
          <div class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#fff8e1;">
                <i class="pi pi-clock text-xs" style="color:#f59e0b;" />
              </div>
              <span class="text-xs font-medium" style="color:#667781;">Last Updated</span>
            </div>
            <p class="text-sm font-bold" style="color:#111b17;">
              {{ catalogDetails.last_updated ? formatTime(catalogDetails.last_updated) : '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- ─── Sync Status + Product Breakdown ─── -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        <!-- Sync Status -->
        <div class="rounded-2xl overflow-hidden" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="px-5 py-4 flex items-center justify-between border-b" style="border-color:#f0f2f5;">
            <div class="flex items-center gap-2">
              <i class="pi pi-sync text-sm" style="color:#00a884;" />
              <h2 class="font-semibold text-sm" style="color:#111b17;">Sync Status</h2>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium" :style="syncHealthBadgeStyle">
              {{ syncStatusLabel }}
            </span>
          </div>
          <div class="divide-y" style="border-color:#f0f2f5;">
            <div v-for="item in syncStatusItems" :key="item.label"
              class="px-5 py-3.5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="item.iconBg">
                  <i :class="item.icon" class="text-xs" :style="item.iconColor" />
                </div>
                <span class="text-sm font-medium" style="color:#111b17;">{{ item.label }}</span>
              </div>
              <span class="text-sm font-bold" :style="item.valueColor">{{ item.value }}</span>
            </div>
          </div>
        </div>

        <!-- Product Breakdown -->
        <div class="rounded-2xl overflow-hidden" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color:#f0f2f5;">
            <i class="pi pi-chart-bar text-sm" style="color:#00a884;" />
            <h2 class="font-semibold text-sm" style="color:#111b17;">Product Breakdown</h2>
          </div>
          <div class="p-5">
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div v-for="stat in productBreakdown" :key="stat.label"
                class="rounded-xl p-4 text-center" style="background:#f9fafb; border:1px solid #f0f2f5;">
                <p class="text-2xl font-bold" :style="stat.valueColor">{{ stat.value }}</p>
                <p class="text-xs mt-1" style="color:#667781;">{{ stat.label }}</p>
              </div>
            </div>
            <!-- Progress Bar -->
            <div v-if="syncData.total_products > 0">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs" style="color:#667781;">Sync Progress</span>
                <span class="text-xs font-semibold" style="color:#00a884;">{{ syncProgressPct }}%</span>
              </div>
              <div class="w-full rounded-full h-2.5" style="background:#f0f2f5;">
                <div class="h-2.5 rounded-full transition-all duration-700"
                  :style="{ width: syncProgressPct + '%', background: syncProgressBarColor }" />
              </div>
              <p class="text-xs mt-1.5" style="color:#667781;">
                {{ syncData.synced }} of {{ syncData.total_products }} products synced
              </p>
            </div>
            <div v-else class="flex items-center justify-center py-4">
              <p class="text-sm" style="color:#ccd0d5;">No sync data available yet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Recent Activity ─── -->
      <div class="rounded-2xl overflow-hidden mb-4" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color:#f0f2f5;">
          <i class="pi pi-clock text-sm" style="color:#667781;" />
          <h2 class="font-semibold text-sm" style="color:#111b17;">Recent Activity</h2>
        </div>
        <div class="divide-y" style="border-color:#f0f2f5;">
          <div v-for="activity in recentActivities" :key="activity.label"
            class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="activity.iconBg">
                <i :class="activity.icon" class="text-xs" :style="activity.iconColor" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color:#111b17;">{{ activity.label }}</p>
                <p class="text-xs" style="color:#667781;">{{ activity.description }}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span v-if="activity.value" class="text-xs px-2 py-0.5 rounded-full" :style="activity.badgeStyle">
                {{ activity.value }}
              </span>
              <span v-else class="text-xs" style="color:#ccd0d5;">No data yet</span>
              <p v-if="activity.sub" class="text-xs mt-0.5" style="color:#667781;">{{ activity.sub }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Failed Items ─── -->
      <div v-if="syncData.failed_items?.length" class="rounded-2xl overflow-hidden"
        style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color:#f0f2f5;">
          <i class="pi pi-exclamation-circle text-sm" style="color:#e53935;" />
          <h2 class="font-semibold text-sm" style="color:#111b17;">
            Failed Items ({{ syncData.failed_items.length }})
          </h2>
        </div>
        <div class="divide-y" style="border-color:#f0f2f5;">
          <div v-for="item in syncData.failed_items" :key="item.id || item.name"
            class="px-5 py-3 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color:#111b17;">{{ item.name || 'Unknown Product' }}</p>
              <p class="text-xs" style="color:#e53935;">{{ friendlyError(item.reason) }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full"
              style="background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;">Failed</span>
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

// ─── Types ────────────────────────────────────────────────────────────────────
interface CatalogDetails {
  meta_connected: boolean;
  catalog_connected: boolean;
  catalog_name: string;
  display_name: string;
  total_products: number;
  last_updated: string | null;
}

interface SyncData {
  last_sync: string | null;
  last_sync_status: string;
  total_products: number;
  synced: number;
  failed: number;
  sync_health: string;
  failed_items: { id: string; name: string; reason: string }[];
}

interface ValidationData {
  meta_connected: boolean;
  catalog_accessible: boolean;
  waba_connected: boolean;
  permissions_valid: boolean;
}

interface ErrorAlert {
  title: string; message: string; icon: string;
  bannerStyle: string; iconStyle: string; titleStyle: string; msgStyle: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps<{
  project: string; instance: string;
  user_id: string; access_token: string; record_id: string;
}>();

// ─── State ────────────────────────────────────────────────────────────────────
const toast = useToast();
const initialLoading = ref(true);
const globalLoading = ref(false);
const errorAlert = ref<ErrorAlert | null>(null);
const fatalError = ref<{ title: string; message: string } | null>(null);

const catalogDetails = ref<CatalogDetails>({
  meta_connected: false, catalog_connected: false,
  catalog_name: "", display_name: "", total_products: 0, last_updated: null,
});

const syncData = ref<SyncData>({
  last_sync: null, last_sync_status: "unknown",
  total_products: 0, synced: 0, failed: 0,
  sync_health: "unknown", failed_items: [],
});

const validationData = ref<ValidationData>({
  meta_connected: false, catalog_accessible: false,
  waba_connected: false, permissions_valid: false,
});

let timer: ReturnType<typeof setInterval> | null = null;

// ─── API ──────────────────────────────────────────────────────────────────────
const apiUrl = () => `/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${props.access_token}`,
});

async function api(typ: string): Promise<any> {
  const res = await fetch(`${apiUrl()}?typ=${typ}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ id: props.record_id }),
  });
  if (res.status === 401 || res.status === 403) throw new Error("token expired");
  if (!res.ok) throw new Error(`network_error_${res.status}`);
  return res.json();
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchDetails() {
  const json = await api("catalog_details");
  if (json?.success && json?.data) {
    const d = json.data;
    catalogDetails.value = {
      meta_connected: d.meta_connected ?? d.access_token_set ?? false,
      catalog_connected: d.catalog_connected ?? !!d.catalog_id,
      catalog_name: d.catalog_name ?? "",
      display_name: d.display_name ?? d.business_name ?? "",
      total_products: d.total_products ?? d.catalog_product_count ?? 0,
      last_updated: d.last_updated ?? d.updated_at ?? null,
    };
  }
}

async function fetchSyncStatus() {
  try {
    // Try catalog_sync_status first, fallback to catalog_status
    let json = await api("catalog_sync_status").catch(() => null);
    if (!json?.success) json = await api("catalog_status");
    if (json?.success && json?.data) {
      const d = json.data;
      syncData.value = {
        last_sync: d.last_sync ?? null,
        last_sync_status: d.last_sync_status ?? d.sync_health ?? "unknown",
        total_products: d.total_products ?? 0,
        synced: d.synced ?? d.successful ?? 0,
        failed: d.failed ?? 0,
        sync_health: d.sync_health ?? "unknown",
        failed_items: d.failed_items ?? [],
      };
    }
  } catch { /* non-fatal */ }
}

async function fetchValidation() {
  try {
    // Try catalog_validate first, fallback to meta_test
    let json = await api("catalog_validate").catch(() => null);
    if (!json?.success) {
      const testJson = await api("meta_test").catch(() => null);
      if (testJson?.success) {
        validationData.value = {
          meta_connected: true, catalog_accessible: catalogDetails.value.catalog_connected,
          waba_connected: true, permissions_valid: true,
        };
        return;
      }
    }
    if (json?.success && json?.data) {
      const d = json.data;
      validationData.value = {
        meta_connected: d.meta_connected ?? false,
        catalog_accessible: d.catalog_accessible ?? d.catalog_valid ?? false,
        waba_connected: d.waba_connected ?? false,
        permissions_valid: d.permissions_valid ?? d.permissions_ok ?? false,
      };
    }
  } catch { /* non-fatal */ }
}

// ─── Refresh All ──────────────────────────────────────────────────────────────
async function refreshAll() {
  globalLoading.value = true;
  fatalError.value = null;
  errorAlert.value = null;
  try {
    await fetchDetails();
    await Promise.all([fetchSyncStatus(), fetchValidation()]);
    if (!initialLoading.value) {
      toast.add({ severity: "success", summary: "Refreshed", detail: "Status updated successfully", life: 2000 });
    }
  } catch (e: any) {
    const err = classifyError(e.message ?? "");
    if (initialLoading.value) fatalError.value = err;
    else {
      errorAlert.value = buildAlert(e.message ?? "");
      toast.add({ severity: "error", summary: "Refresh Failed", detail: err.message, life: 4000 });
    }
  } finally {
    initialLoading.value = false;
    globalLoading.value = false;
  }
}

// ─── Error Helpers ────────────────────────────────────────────────────────────
function classifyError(msg: string): { title: string; message: string } {
  const m = msg.toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { title: "Session Expired", message: "Your session has expired. Please log in again." };
  if (m.includes("permission") || m.includes("scope"))
    return { title: "Permission Missing", message: "Required permissions are missing. Please reconnect your account." };
  if (m.includes("catalog") && (m.includes("not found") || m.includes("404")))
    return { title: "Catalog Not Found", message: "No product catalog found. Please create one in Meta Business Manager." };
  if (m.includes("network") || m.includes("fetch"))
    return { title: "Connection Error", message: "Unable to reach the server. Check your connection and try again." };
  return { title: "Something Went Wrong", message: "An unexpected error occurred. Please try again." };
}

function buildAlert(msg: string): ErrorAlert {
  const m = msg.toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { title: "Session Expired", message: "Please log in again to continue.", icon: "pi pi-clock", bannerStyle: "background:#fff8e1; border:1px solid #ffe082;", iconStyle: "color:#f59e0b;", titleStyle: "color:#f59e0b;", msgStyle: "color:#92700a;" };
  if (m.includes("permission"))
    return { title: "Permission Missing", message: "Please reconnect and grant all required permissions.", icon: "pi pi-lock", bannerStyle: "background:#fff0f0; border:1px solid #ffcdd2;", iconStyle: "color:#e53935;", titleStyle: "color:#e53935;", msgStyle: "color:#b71c1c;" };
  if (m.includes("catalog"))
    return { title: "Catalog Issue", message: "There was a problem with your product catalog.", icon: "pi pi-box", bannerStyle: "background:#fff8e1; border:1px solid #ffe082;", iconStyle: "color:#f59e0b;", titleStyle: "color:#f59e0b;", msgStyle: "color:#92700a;" };
  return { title: "Update Failed", message: "Could not refresh status. Please try again.", icon: "pi pi-exclamation-circle", bannerStyle: "background:#fff0f0; border:1px solid #ffcdd2;", iconStyle: "color:#e53935;", titleStyle: "color:#e53935;", msgStyle: "color:#b71c1c;" };
}

function friendlyError(raw: string): string {
  if (!raw) return "Sync failed";
  const m = raw.toLowerCase();
  if (m.includes("image") || m.includes("photo")) return "Product image is invalid or missing";
  if (m.includes("price")) return "Product price format is incorrect";
  if (m.includes("title") || m.includes("name")) return "Product name is missing or too long";
  if (m.includes("url") || m.includes("link")) return "Product link is invalid";
  if (m.includes("duplicate")) return "Duplicate product detected";
  if (m.includes("permission")) return "Insufficient permissions";
  if (raw.length > 60 || /[{}[\]<>]/.test(raw)) return "Product could not be synced";
  return raw;
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const healthChecks = computed(() => [
  { label: "Meta", passed: validationData.value.meta_connected, passLabel: "Connected", failLabel: "Disconnected", detail: catalogDetails.value.display_name || "Meta Business" },
  { label: "Catalog", passed: validationData.value.catalog_accessible, passLabel: "Accessible", failLabel: "Inaccessible", detail: catalogDetails.value.catalog_name || "Product Catalog" },
  { label: "WABA", passed: validationData.value.waba_connected, passLabel: "Connected", failLabel: "Disconnected", detail: "WhatsApp Business API" },
  { label: "Permissions", passed: validationData.value.permissions_valid, passLabel: "Valid", failLabel: "Missing", detail: "API Access" },
]);

const syncStatusLabel = computed(() => ({ good: "Healthy", warning: "Warning", partial: "Partial", error: "Error", failed: "Failed", unknown: "Not Synced" })[syncData.value.sync_health] ?? "Not Synced");

const syncHealthBadgeStyle = computed(() => ({
  good: "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;",
  warning: "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;",
  partial: "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;",
  error: "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;",
  failed: "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;",
  unknown: "background:#f0f2f5; color:#667781; border:1px solid #e9edef;",
}[syncData.value.sync_health] ?? "background:#f0f2f5; color:#667781; border:1px solid #e9edef;"));

const syncStatusItems = computed(() => [
  { label: "Last Sync Time",     value: syncData.value.last_sync ? formatTime(syncData.value.last_sync) : "Never", icon: "pi pi-clock",        iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", valueColor: "color:#111b17;" },
  { label: "Last Sync Status",   value: syncData.value.last_sync_status === "unknown" ? "—" : cap(syncData.value.last_sync_status), icon: "pi pi-info-circle", iconBg: "background:#f0f4ff;", iconColor: "color:#6366f1;", valueColor: "color:#111b17;" },
  { label: "Products Synced",    value: syncData.value.total_products > 0 ? `${syncData.value.synced} / ${syncData.value.total_products}` : "—", icon: "pi pi-check-circle", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#00a884;" },
  { label: "Successful",         value: syncData.value.synced, icon: "pi pi-thumbs-up",   iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#00a884;" },
  { label: "Failed",             value: syncData.value.failed, icon: "pi pi-thumbs-down", iconBg: "background:#fff0f0;", iconColor: "color:#e53935;", valueColor: syncData.value.failed > 0 ? "color:#e53935;" : "color:#111b17;" },
]);

const productBreakdown = computed(() => {
  const pending = Math.max(0, syncData.value.total_products - syncData.value.synced - syncData.value.failed);
  return [
    { label: "Synced",  value: syncData.value.synced,  valueColor: "color:#00a884;" },
    { label: "Failed",  value: syncData.value.failed,  valueColor: syncData.value.failed > 0 ? "color:#e53935;" : "color:#111b17;" },
    { label: "Pending", value: pending,                 valueColor: pending > 0 ? "color:#f59e0b;" : "color:#111b17;" },
  ];
});

const syncProgressPct = computed(() =>
  syncData.value.total_products > 0
    ? Math.round((syncData.value.synced / syncData.value.total_products) * 100)
    : 0
);

const syncProgressBarColor = computed(() => {
  const p = syncProgressPct.value;
  return p >= 90 ? "#00a884" : p >= 50 ? "#f59e0b" : "#e53935";
});

const recentActivities = computed(() => {
  const allPassed = validationData.value.meta_connected && validationData.value.catalog_accessible && validationData.value.waba_connected && validationData.value.permissions_valid;
  return [
    { label: "Last Sync", description: "Products pushed to WhatsApp Catalog", icon: "pi pi-sync", iconBg: "background:#f0f4ff;", iconColor: "color:#6366f1;", value: syncData.value.last_sync ? formatTime(syncData.value.last_sync) : null, sub: syncData.value.synced > 0 ? `${syncData.value.synced} products synced` : null, badgeStyle: "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;" },
    { label: "Sync Result", description: "Outcome of most recent sync", icon: "pi pi-check-square", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", value: syncData.value.sync_health !== "unknown" ? (syncData.value.sync_health === "good" ? "✓ Success" : syncData.value.sync_health === "error" || syncData.value.sync_health === "failed" ? "✗ Failed" : "⚠ Partial") : null, sub: syncData.value.failed > 0 ? `${syncData.value.failed} items failed` : null, badgeStyle: syncData.value.sync_health === "good" ? "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;" : syncData.value.sync_health === "error" || syncData.value.sync_health === "failed" ? "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;" : "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;" },
    { label: "Last Validation", description: "Connection health check", icon: "pi pi-shield", iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", value: !initialLoading.value ? (allPassed ? "✓ All Checks Passed" : "⚠ Issues Found") : null, sub: null, badgeStyle: allPassed ? "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;" : "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;" },
  ];
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString())
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function cap(s: string): string { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await refreshAll();
  timer = setInterval(() => {
    if (!globalLoading.value)
      Promise.all([fetchDetails(), fetchSyncStatus(), fetchValidation()]).catch(() => {});
  }, 60000);
});

onUnmounted(() => { if (timer) clearInterval(timer); });
</script>
