<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Header ─── -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold" style="color: #111b17;">Welcome Back 👋</h1>
        <p class="text-sm mt-0.5" style="color: #667781;">
          Manage your Meta Catalog and WhatsApp Commerce products from one place.
        </p>
      </div>
      <button
        @click="refreshAll"
        :disabled="globalLoading"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer self-start sm:self-auto"
        :style="globalLoading
          ? 'background:#f0f2f5; border:1px solid #e9edef; color:#ccd0d5; cursor:not-allowed;'
          : 'background:#fff; border:1px solid #e0e0e0; color:#111b17; box-shadow:0 1px 3px rgba(0,0,0,0.04);'"
      >
        <i :class="globalLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color:#00a884;" />
        Refresh Status
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
        <i class="pi pi-times text-xs" style="color:#667781;" />
      </button>
    </div>

    <!-- ─── Loading Skeleton ─── -->
    <div v-if="initialLoading">
      <!-- KPI Skeleton -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div
          v-for="n in 4" :key="'sk-kpi-' + n"
          class="rounded-2xl p-5 animate-pulse"
          style="background:#fff; border:1px solid #e0e0e0;"
        >
          <div class="h-3 rounded-full bg-gray-200 mb-3 w-16" />
          <div class="h-7 rounded-full bg-gray-200 w-20 mb-2" />
          <div class="h-2.5 rounded-full bg-gray-100 w-28" />
        </div>
      </div>
      <!-- Card Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div
          v-for="n in 3" :key="'sk-card-' + n"
          class="rounded-2xl p-6 animate-pulse"
          style="background:#fff; border:1px solid #e0e0e0; min-height:180px;"
        >
          <div class="h-4 bg-gray-200 rounded-full w-1/3 mb-4" />
          <div class="space-y-3">
            <div class="h-3 bg-gray-100 rounded-full w-full" />
            <div class="h-3 bg-gray-100 rounded-full w-5/6" />
            <div class="h-3 bg-gray-100 rounded-full w-4/6" />
          </div>
        </div>
      </div>
      <!-- Table Skeleton -->
      <div class="rounded-2xl overflow-hidden animate-pulse" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-5 py-4 border-b border-[#f0f2f5]">
          <div class="h-4 bg-gray-200 rounded-full w-40" />
        </div>
        <div class="p-5 space-y-3">
          <div v-for="n in 5" :key="'sk-row-' + n" class="h-9 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- ─── Not Connected Empty State ─── -->
    <div
      v-else-if="!isConnected"
      class="rounded-2xl p-14 flex flex-col items-center justify-center gap-5 text-center"
      style="background:#fff; border:1px solid #e0e0e0;"
    >
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center"
        style="background:linear-gradient(135deg,#e7f8f4,#f0f2f5);">
        <i class="pi pi-whatsapp text-4xl" style="color:#00a884;" />
      </div>
      <div>
        <p class="text-xl font-bold mb-2" style="color:#111b17;">Connect Your Meta Account</p>
        <p class="text-sm leading-relaxed" style="color:#667781; max-width:420px;">
          Connect your WhatsApp Business account to start syncing products and monitoring your Meta Catalog from this dashboard.
        </p>
      </div>
      <button
        @click="navigate('FragMetaConnect')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm cursor-pointer"
        style="background:#00a884; color:#fff; border:none; box-shadow:0 4px 12px rgba(0,168,132,0.3);"
      >
        <i class="pi pi-whatsapp" />
        Connect Meta
      </button>
    </div>

    <!-- ─── Main Dashboard ─── -->
    <div v-else>

      <!-- ── Section 1: KPI Cards ── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">

        <!-- Total Products -->
        <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Products</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
              <i class="pi pi-box text-xs" style="color:#00a884;" />
            </div>
          </div>
          <p class="text-2xl font-bold" style="color:#111b17;">{{ catalog.total_catalog_products }}</p>
          <p class="text-xs mt-1" style="color:#8696a0;">In Meta Catalog</p>
        </div>

        <!-- Catalog Status -->
        <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Catalog</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              :style="catalog.meta_connected ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
              <i class="pi pi-link text-xs"
                :style="catalog.meta_connected ? 'color:#00a884;' : 'color:#e53935;'" />
            </div>
          </div>
          <p class="text-base font-bold"
            :style="catalog.meta_connected ? 'color:#00a884;' : 'color:#e53935;'">
            {{ catalog.meta_connected ? 'Connected ✅' : 'Disconnected' }}
          </p>
          <p class="text-xs mt-1" style="color:#8696a0;">{{ catalog.catalog_name || 'Meta Catalog' }}</p>
        </div>

        <!-- Last Sync -->
        <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Last Sync</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#fff8e1;">
              <i class="pi pi-clock text-xs" style="color:#f59e0b;" />
            </div>
          </div>
          <p class="text-sm font-bold" style="color:#111b17;">
            {{ sync.last_sync ? formatTime(sync.last_sync) : 'Never' }}
          </p>
          <p class="text-xs mt-1" style="color:#8696a0;">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold" :style="badgeStyle(sync.sync_health)">
              {{ formatStatus(sync.last_sync_status) }}
            </span>
          </p>
        </div>

        <!-- Sync Success Rate -->
        <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Success Rate</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
              <i class="pi pi-chart-line text-xs" style="color:#6366f1;" />
            </div>
          </div>
          <p class="text-2xl font-bold" style="color:#00a884;">{{ successRate }}%</p>
          <p class="text-xs mt-1" style="color:#8696a0;">Based on last {{ syncHistory.length }} runs</p>
        </div>
      </div>

      <!-- ── Section 2: Meta Connection + Catalog + Sync Overview ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        <!-- Meta Connection Card -->
        <div class="rounded-2xl p-5 flex flex-col" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
              <i class="pi pi-whatsapp text-xs" style="color:#00a884;" />
            </div>
            <h2 class="font-bold text-sm" style="color:#111b17;">Meta Connection</h2>
          </div>
          <div class="space-y-3 flex-1">
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Status</span>
              <span class="font-semibold px-2 py-0.5 rounded-full"
                :style="catalog.meta_connected
                  ? 'background:#e7f8f4; color:#00a884;'
                  : 'background:#fff0f0; color:#e53935;'">
                {{ catalog.meta_connected ? '● Connected' : '● Disconnected' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Catalog</span>
              <span class="font-semibold truncate max-w-[130px]" style="color:#111b17;">
                {{ catalog.catalog_name || '—' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Last Validation</span>
              <span class="font-semibold" style="color:#111b17;">
                {{ validation.checked ? formatTime(validation.checkedAt) : 'Not checked' }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 flex-wrap pt-1">
              <span
                v-for="check in validationChecks"
                :key="check.label"
                class="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                :style="check.passed ? 'background:#e7f8f4; color:#00a884;' : 'background:#fff0f0; color:#e53935;'"
              >
                {{ check.passed ? '✓' : '✗' }} {{ check.label }}
              </span>
            </div>
          </div>
          <button
            @click="navigate('FragMetaConnect')"
            class="mt-4 w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style="background:#e7f8f4; color:#00a884;"
          >
            View Connection →
          </button>
        </div>

        <!-- Catalog Overview Card -->
        <div class="rounded-2xl p-5 flex flex-col" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
              <i class="pi pi-box text-xs" style="color:#6366f1;" />
            </div>
            <h2 class="font-bold text-sm" style="color:#111b17;">Catalog Overview</h2>
          </div>
          <div class="space-y-3 flex-1">
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Catalog Name</span>
              <span class="font-semibold truncate max-w-[130px]" style="color:#111b17;">
                {{ catalog.catalog_name || '—' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Product Count</span>
              <span class="font-bold text-base" style="color:#00a884;">
                {{ catalog.total_catalog_products }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Last Updated</span>
              <span class="font-semibold" style="color:#111b17;">
                {{ catalog.last_updated ? formatTime(catalog.last_updated) : '—' }}
              </span>
            </div>
          </div>
          <button
            @click="navigate('FragCatalogStatus')"
            class="mt-4 w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            style="background:#f0f4ff; color:#6366f1;"
          >
            View Catalog Status →
          </button>
        </div>

        <!-- Product Sync Overview Card -->
        <div class="rounded-2xl p-5 flex flex-col" style="background:#fff; border:1px solid #e0e0e0;">
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
              <i class="pi pi-sync text-xs" style="color:#00a884;" />
            </div>
            <h2 class="font-bold text-sm" style="color:#111b17;">Product Sync</h2>
          </div>
          <div class="space-y-3 flex-1">
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Last Sync</span>
              <span class="font-semibold" style="color:#111b17;">
                {{ sync.last_sync ? formatTime(sync.last_sync) : 'Never' }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Status</span>
              <span class="px-2 py-0.5 rounded-full font-semibold text-[10px]" :style="badgeStyle(sync.sync_health)">
                {{ formatStatus(sync.last_sync_status) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Successful</span>
              <span class="font-bold" style="color:#00a884;">{{ sync.synced }}</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span style="color:#667781;">Failed</span>
              <span class="font-bold" :style="sync.failed > 0 ? 'color:#e53935;' : 'color:#111b17;'">
                {{ sync.failed }}
              </span>
            </div>
          </div>
          <button
            @click="navigate('FragCatalogSync')"
            class="mt-4 w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors text-white"
            style="background:#00a884;"
          >
            Sync Products →
          </button>
        </div>
      </div>

      <!-- ── Section 3: Recent Sync Activity ── -->
      <div class="rounded-2xl overflow-hidden mb-5" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-5 py-4 border-b border-[#f0f2f5] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="pi pi-history" style="color:#6366f1;" />
            <h2 class="font-bold text-sm" style="color:#111b17;">Recent Sync Activity</h2>
          </div>
          <button
            @click="navigate('FragAnalytics')"
            class="text-xs font-semibold cursor-pointer transition-colors px-3 py-1.5 rounded-lg"
            style="background:#f0f4ff; color:#6366f1;"
          >
            View Full History →
          </button>
        </div>

        <!-- Empty history -->
        <div v-if="recentHistory.length === 0" class="py-12 flex flex-col items-center gap-2">
          <i class="pi pi-inbox text-3xl" style="color:#ccd0d5;" />
          <p class="text-sm" style="color:#8696a0;">No sync runs yet.</p>
        </div>

        <!-- History Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr style="background:#f8f9fa;" class="border-b border-[#f0f2f5]">
                <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#667781;">Date</th>
                <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style="color:#667781;">Status</th>
                <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-center" style="color:#667781;">Products</th>
                <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-center" style="color:#667781;">Success</th>
                <th class="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-center" style="color:#667781;">Failed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#f0f2f5]">
              <tr
                v-for="run in recentHistory"
                :key="run.id || run.date"
                class="hover:bg-[#f8f9fa] transition-colors"
              >
                <td class="px-5 py-3 text-sm" style="color:#111b17;">
                  {{ formatTime(run.date || run.created_at) }}
                </td>
                <td class="px-5 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-semibold"
                    :style="badgeStyle(run.status || run.sync_health)">
                    {{ formatStatus(run.status || run.sync_health) }}
                  </span>
                </td>
                <td class="px-5 py-3 text-sm text-center" style="color:#111b17;">
                  {{ run.total_products ?? run.total ?? 0 }}
                </td>
                <td class="px-5 py-3 text-sm text-center font-semibold" style="color:#00a884;">
                  {{ run.synced ?? run.successful ?? 0 }}
                </td>
                <td class="px-5 py-3 text-sm text-center font-semibold"
                  :style="(run.failed ?? 0) > 0 ? 'color:#e53935;' : 'color:#667781;'">
                  {{ run.failed ?? 0 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Section 4: Quick Actions ── -->
      <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-bolt" style="color:#f59e0b;" />
          <h2 class="font-bold text-sm" style="color:#111b17;">Quick Actions</h2>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            @click="navigate('FragMetaConnect')"
            class="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            style="background:#e7f8f4; border:1px solid #b2dfdb;"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#fff;">
              <i class="pi pi-whatsapp" style="color:#00a884;" />
            </div>
            <span class="text-xs font-bold" style="color:#00a884;">Connect Meta</span>
          </button>

          <button
            @click="navigate('FragCatalogSync')"
            class="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            style="background:#f0f4ff; border:1px solid #c7d2fe;"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#fff;">
              <i class="pi pi-sync" style="color:#6366f1;" />
            </div>
            <span class="text-xs font-bold" style="color:#6366f1;">Sync Products</span>
          </button>

          <button
            @click="refreshAll"
            :disabled="globalLoading"
            class="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            style="background:#fff8e1; border:1px solid #ffe082;"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#fff;">
              <i :class="globalLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" style="color:#f59e0b;" />
            </div>
            <span class="text-xs font-bold" style="color:#f59e0b;">Refresh Status</span>
          </button>

          <button
            @click="navigate('FragAnalytics')"
            class="flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
            style="background:#fff0f5; border:1px solid #ffc0d0;"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:#fff;">
              <i class="pi pi-chart-bar" style="color:#e91e8c;" />
            </div>
            <span class="text-xs font-bold" style="color:#e91e8c;">View Analytics</span>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
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

interface SyncStatus {
  last_sync_status: string;
  last_sync: string | null;
  sync_health: string;
  synced: number;
  failed: number;
}

interface ValidationState {
  checked: boolean;
  checkedAt: string | null;
  meta_connected: boolean;
  catalog_accessible: boolean;
  waba_connected: boolean;
  permissions_valid: boolean;
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

const sync = ref<SyncStatus>({
  last_sync_status: "unknown",
  last_sync: null,
  sync_health: "unknown",
  synced: 0,
  failed: 0,
});

const validation = ref<ValidationState>({
  checked: false,
  checkedAt: null,
  meta_connected: false,
  catalog_accessible: false,
  waba_connected: false,
  permissions_valid: false,
});

const syncHistory = ref<any[]>([]);
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;

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
const isConnected = computed(() => catalog.value.meta_connected);

const successRate = computed(() => {
  const runs = syncHistory.value;
  if (!runs.length) return 100;
  let totalAttempted = 0;
  let totalSuccessful = 0;
  runs.forEach(r => {
    const synced = r.synced ?? r.successful ?? 0;
    const failed = r.failed ?? 0;
    totalAttempted += synced + failed;
    totalSuccessful += synced;
  });
  return totalAttempted > 0 ? Math.round((totalSuccessful / totalAttempted) * 100) : 100;
});

const recentHistory = computed(() => syncHistory.value.slice(0, 5));

const validationChecks = computed(() => [
  { label: "Meta", passed: validation.value.meta_connected },
  { label: "Catalog", passed: validation.value.catalog_accessible },
  { label: "WABA", passed: validation.value.waba_connected },
  { label: "Permissions", passed: validation.value.permissions_valid },
]);

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
        last_sync_status: d.last_sync_status ?? d.sync_status ?? d.status ?? "unknown",
        last_sync: d.last_sync ?? d.last_sync_time ?? null,
        sync_health: d.sync_health ?? d.health ?? "unknown",
        synced: d.synced ?? d.successful ?? 0,
        failed: d.failed ?? 0,
      };
    }
  } catch {
    // non-fatal
  }
}

async function fetchSyncHistory(): Promise<void> {
  try {
    const json = await api("catalog_sync_history", { page: 1, limit: 5 });
    if (json?.success && json?.data) {
      const d = json.data;
      syncHistory.value = d.history ?? d.runs ?? (Array.isArray(d) ? d : []);
    } else {
      syncHistory.value = [];
    }
  } catch {
    syncHistory.value = [];
  }
}

async function fetchValidation(): Promise<void> {
  try {
    const json = await api("catalog_validate");
    if (json?.success && json?.data) {
      const d = json.data;
      validation.value = {
        checked: true,
        checkedAt: new Date().toISOString(),
        meta_connected: d.meta_connected ?? false,
        catalog_accessible: d.catalog_accessible ?? d.catalog_valid ?? false,
        waba_connected: d.waba_connected ?? false,
        permissions_valid: d.permissions_valid ?? d.permissions_ok ?? false,
      };
    }
  } catch {
    // non-fatal
  }
}

// ─── Refresh All ─────────────────────────────────────────────────────────────
async function refreshAll(): Promise<void> {
  globalLoading.value = true;
  errorAlert.value = null;
  try {
    await fetchCatalogDetails();
    await Promise.all([fetchSyncStatus(), fetchSyncHistory(), fetchValidation()]);
    if (!initialLoading.value) {
      toast.add({ severity: "success", summary: "Refreshed", detail: "Dashboard updated.", life: 2000 });
    }
  } catch (e: any) {
    const err = classifyError(e.message ?? "");
    errorAlert.value = err;
    if (!initialLoading.value) {
      toast.add({ severity: "error", summary: "Refresh Failed", detail: err.message, life: 4000 });
    }
  } finally {
    globalLoading.value = false;
    initialLoading.value = false;
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(frag: string): void {
  window.history.pushState(null, "", `/${frag.toLowerCase()}`);
  window.dispatchEvent(new Event("popstate"));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function classifyError(message: string): ErrorAlert {
  const m = message.toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { type: "token_expired", title: "Session Expired", message: "Your Meta session has expired. Please reconnect." };
  if (m.includes("catalog") && (m.includes("missing") || m.includes("not found") || m.includes("404")))
    return { type: "catalog_missing", title: "Catalog Missing", message: "No active catalog found. Please configure your Meta catalog first." };
  if (m.includes("permission") || m.includes("403") || m.includes("forbidden"))
    return { type: "permission_error", title: "Access Denied", message: "Insufficient Meta API permissions. Please reconnect." };
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout"))
    return { type: "network_error", title: "Connection Error", message: "Unable to reach the server. Please check your connection." };
  return { type: "unknown", title: "Load Failed", message: message || "An unexpected error occurred." };
}

function badgeStyle(health: string): string {
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
onMounted(async () => {
  await refreshAll();
  // Auto-refresh every 60s silently
  autoRefreshTimer = setInterval(() => {
    if (!globalLoading.value) {
      Promise.all([fetchCatalogDetails(), fetchSyncStatus(), fetchSyncHistory()]).catch(() => {});
    }
  }, 60000);
});

onUnmounted(() => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
});
</script>
