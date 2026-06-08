<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Header ─── -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-chart-line text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">Analytics Dashboard</h1>
          <p class="text-xs" style="color: #667781;">Catalog sync performance & business insights</p>
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
        Refresh Analytics
      </button>
    </div>

    <!-- ─── Error Alert Banner ─── -->
    <div
      v-if="errorAlert"
      class="rounded-2xl p-4 mb-4 flex items-start gap-3"
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
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          v-for="n in 4"
          :key="'sk-kpi-' + n"
          class="rounded-2xl p-5 animate-pulse"
          style="background:#fff; border:1px solid #e0e0e0;"
        >
          <div class="h-3 rounded-full bg-gray-200 mb-3 w-16" />
          <div class="h-7 rounded-full bg-gray-200 w-24 mb-2" />
          <div class="h-2.5 rounded-full bg-gray-100 w-32" />
        </div>
      </div>
      <!-- Chart Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div v-for="n in 2" :key="'sk-chart-' + n"
          class="rounded-2xl p-6 animate-pulse"
          style="background:#fff; border:1px solid #e0e0e0; height:300px;"
        >
          <div class="h-4 bg-gray-200 rounded-full w-1/3 mb-4" />
          <div class="h-5/6 bg-gray-100 rounded-xl" />
        </div>
      </div>
      <!-- Table Skeleton -->
      <div class="rounded-2xl overflow-hidden mb-6 animate-pulse" style="background:#fff; border:1px solid #e0e0e0;">
        <div class="px-5 py-4 border-b border-[#f0f2f5]">
          <div class="h-4 bg-gray-200 rounded-full w-48" />
        </div>
        <div class="p-5 space-y-3">
          <div v-for="n in 5" :key="'sk-row-' + n" class="h-8 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>

    <!-- ─── Main Content ─── -->
    <div v-else>

      <!-- ─── Empty State ─── -->
      <div
        v-if="hasNoHistory"
        class="rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center"
        style="background:#fff; border:1px solid #e0e0e0;"
      >
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
          style="background:linear-gradient(135deg,#e7f8f4 0%,#f0f2f5 100%);">
          <i class="pi pi-chart-bar text-2xl" style="color:#00a884;" />
        </div>
        <div>
          <p class="text-lg font-bold mb-1" style="color:#111b17;">No analytics available yet.</p>
          <p class="text-sm" style="color:#667781; max-width:400px;">
            Run your first catalog sync to start collecting performance metrics, charts, and product history.
          </p>
        </div>
        <button
          @click="navigateToSync"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
          style="background:#00a884; color:#fff; border:none; box-shadow:0 4px 12px rgba(0,168,132,0.3);"
        >
          <i class="pi pi-sync text-sm" />
          Sync Products
        </button>
      </div>

      <!-- ─── Analytics Panels ─── -->
      <div v-else>

        <!-- ── KPI Cards ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <!-- Products in Catalog -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Products in Catalog</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                <i class="pi pi-box text-xs" style="color:#00a884;" />
              </div>
            </div>
            <p class="text-2xl font-bold" style="color:#111b17;">{{ catalogDetails.total_catalog_products }}</p>
            <p class="text-xs mt-1" style="color:#8696a0;">Live in Meta Catalog</p>
          </div>

          <!-- Total Sync Runs -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Total Sync Runs</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
                <i class="pi pi-sync text-xs" style="color:#6366f1;" />
              </div>
            </div>
            <p class="text-2xl font-bold" style="color:#111b17;">{{ kpis.totalRuns }}</p>
            <p class="text-xs mt-1" style="color:#8696a0;">Total attempted syncs</p>
          </div>

          <!-- Successful Syncs -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Successful Syncs</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                <i class="pi pi-check-circle text-xs" style="color:#00a884;" />
              </div>
            </div>
            <p class="text-2xl font-bold" style="color:#00a884;">{{ kpis.successfulRuns }}</p>
            <p class="text-xs mt-1" style="color:#8696a0;">Completed successfully</p>
          </div>

          <!-- Failed Syncs -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold uppercase tracking-wide" style="color:#667781;">Failed Syncs</span>
              <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:#fff0f0;">
                <i class="pi pi-times-circle text-xs" style="color:#e53935;" />
              </div>
            </div>
            <p class="text-2xl font-bold" :style="kpis.failedRuns > 0 ? 'color:#e53935;' : 'color:#111b17;'">
              {{ kpis.failedRuns }}
            </p>
            <p class="text-xs mt-1" style="color:#8696a0;">Failed sync runs</p>
          </div>
        </div>

        <!-- ── Catalog Overview + Sync Performance ── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <!-- Catalog Overview -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
              <i class="pi pi-info-circle" style="color:#00a884;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Catalog Overview</h2>
            </div>
            <div class="space-y-3.5">
              <div class="flex items-center justify-between text-sm">
                <span style="color:#667781;" class="font-medium">Catalog Name</span>
                <span class="font-bold truncate max-w-[190px]" style="color:#111b17;">
                  {{ catalogDetails.catalog_name || '—' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span style="color:#667781;" class="font-medium">Current Product Count</span>
                <span class="font-bold" style="color:#111b17;">{{ catalogDetails.total_catalog_products }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span style="color:#667781;" class="font-medium">Last Sync Date</span>
                <span class="font-bold" style="color:#111b17;">
                  {{ syncStatus.last_sync ? formatTime(syncStatus.last_sync) : 'Never' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span style="color:#667781;" class="font-medium">Last Sync Status</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-semibold"
                  :style="badgeStyle(syncStatus.sync_health)"
                >
                  {{ formatStatus(syncStatus.last_sync_status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Sync Performance -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
              <i class="pi pi-sliders-h" style="color:#00a884;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Sync Performance</h2>
            </div>
            <div class="space-y-4">
              <!-- Success Rate -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold" style="color:#00a884;">Success Rate</span>
                  <span class="text-xs font-bold" style="color:#00a884;">{{ kpis.successRate }}%</span>
                </div>
                <div class="w-full rounded-full h-2.5" style="background:#f0f2f5;">
                  <div
                    class="h-2.5 rounded-full transition-all duration-700"
                    style="background:#00a884;"
                    :style="{ width: kpis.successRate + '%' }"
                  />
                </div>
              </div>
              <!-- Failure Rate -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-semibold" style="color:#e53935;">Failure Rate</span>
                  <span class="text-xs font-bold" style="color:#e53935;">{{ kpis.failureRate }}%</span>
                </div>
                <div class="w-full rounded-full h-2.5" style="background:#f0f2f5;">
                  <div
                    class="h-2.5 rounded-full transition-all duration-700"
                    style="background:#e53935;"
                    :style="{ width: kpis.failureRate + '%' }"
                  />
                </div>
              </div>
              <!-- Total Synced -->
              <div class="flex items-center justify-between text-sm pt-2 border-t border-[#f0f2f5]">
                <span class="font-medium" style="color:#667781;">Total Products Synced</span>
                <span class="font-bold" style="color:#00a884;">{{ kpis.totalSyncedProducts }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Charts ── -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          <!-- Sync History Trend -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-chart-line" style="color:#00a884;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Sync History Trend</h2>
            </div>
            <div style="height:240px;">
              <Chart type="line" :data="trendChartData" :options="trendChartOptions" style="height:240px;" />
            </div>
          </div>

          <!-- Success vs Failure Trend -->
          <div class="rounded-2xl p-5" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-chart-bar" style="color:#00a884;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Success vs Failure Trend</h2>
            </div>
            <div style="height:240px;">
              <Chart type="bar" :data="successFailChartData" :options="barChartOptions" style="height:240px;" />
            </div>
          </div>
        </div>

        <!-- ── Recent Activity + Failed Summary ── -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          <!-- Recent Sync Activity Table -->
          <div class="rounded-2xl overflow-hidden lg:col-span-2" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="px-5 py-4 border-b border-[#f0f2f5] flex items-center gap-2">
              <i class="pi pi-list" style="color:#6366f1;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Recent Sync Activity (Last 10 Runs)</h2>
            </div>
            <div class="overflow-x-auto">
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
                    v-for="run in recentActivity"
                    :key="run.id || run.date || run.created_at"
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

          <!-- Failed Products Summary -->
          <div class="rounded-2xl p-5 flex flex-col" style="background:#fff; border:1px solid #e0e0e0;">
            <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
              <i class="pi pi-exclamation-triangle" style="color:#e53935;" />
              <h2 class="font-bold text-sm" style="color:#111b17;">Failed Products Summary</h2>
            </div>
            <div class="space-y-4 flex-1">
              <div class="rounded-xl p-4 text-center" style="background:#fff0f0; border:1px solid #ffcdd2;">
                <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color:#e53935;">
                  Total Failed Products
                </p>
                <p class="text-3xl font-extrabold" style="color:#e53935;">{{ syncErrors.length }}</p>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium" style="color:#667781;">Last Failure Date</span>
                <span class="font-semibold" style="color:#111b17;">{{ lastFailureDate }}</span>
              </div>
            </div>
            <div class="pt-4 mt-4 border-t border-[#f0f2f5]">
              <button
                @click="navigateToSync"
                class="w-full py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                style="color:#00a884; background:#e7f8f4;"
              >
                Manage Product Sync
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Chart from "primevue/chart";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface CatalogDetails {
  catalog_name: string;
  catalog_id: string;
  total_source_products: number;
  total_catalog_products: number;
  last_updated: string | null;
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
const errorAlert = ref<ErrorAlert | null>(null);

const catalogDetails = ref<CatalogDetails>({
  catalog_name: "",
  catalog_id: "",
  total_source_products: 0,
  total_catalog_products: 0,
  last_updated: null,
});

const syncStatus = ref<SyncStatus>({
  last_sync_status: "unknown",
  last_sync: null,
  sync_health: "unknown",
});

const syncHistory = ref<any[]>([]);
const syncErrors = ref<any[]>([]);

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

// ─── Computed: KPIs ───────────────────────────────────────────────────────────
const hasNoHistory = computed(() => syncHistory.value.length === 0);

const kpis = computed(() => {
  const runs = syncHistory.value;
  const totalRuns = runs.length;

  const successfulRuns = runs.filter(r => {
    const s = (r.status || r.sync_health || "").toLowerCase();
    return ["completed", "success", "good", "partial", "warning"].includes(s);
  }).length;

  const failedRuns = runs.filter(r => {
    const s = (r.status || r.sync_health || "").toLowerCase();
    return s === "failed" || s === "error";
  }).length;

  let totalAttempted = 0;
  let totalSuccessful = 0;
  runs.forEach(r => {
    const synced = r.synced ?? r.successful ?? 0;
    const failed = r.failed ?? 0;
    totalAttempted += synced + failed;
    totalSuccessful += synced;
  });

  const successRate = totalAttempted > 0 ? Math.round((totalSuccessful / totalAttempted) * 100) : 100;

  return {
    totalRuns,
    successfulRuns,
    failedRuns,
    successRate,
    failureRate: 100 - successRate,
    totalSyncedProducts: totalSuccessful,
  };
});

const recentActivity = computed(() =>
  [...syncHistory.value].slice(0, 10)
);

const lastFailureDate = computed(() => {
  const failed = syncHistory.value.filter(r => {
    const s = (r.status || r.sync_health || "").toLowerCase();
    return s === "failed" || s === "error" || (r.failed ?? 0) > 0;
  });
  if (!failed.length) return "No failures recorded";
  return formatTime(failed[0].date || failed[0].created_at);
});

// ─── Computed: Alert style ────────────────────────────────────────────────────
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

// ─── Computed: Charts ─────────────────────────────────────────────────────────
const chartLabels = computed(() =>
  [...syncHistory.value]
    .filter(r => r.date || r.created_at)
    .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
    .slice(-10)
    .map(r => {
      const d = new Date(r.date || r.created_at);
      return d.toLocaleDateString("en", { month: "short", day: "numeric" });
    })
);

const chartRuns = computed(() =>
  [...syncHistory.value]
    .filter(r => r.date || r.created_at)
    .sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
    .slice(-10)
);

const trendChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: "Products Synced",
      data: chartRuns.value.map(r => r.synced ?? r.successful ?? 0),
      borderColor: "#00a884",
      backgroundColor: "rgba(0,168,132,0.08)",
      borderWidth: 2.5,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
}));

const successFailChartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label: "Success Count",
      data: chartRuns.value.map(r => r.synced ?? r.successful ?? 0),
      backgroundColor: "#00a884",
      borderRadius: 5,
    },
    {
      label: "Failure Count",
      data: chartRuns.value.map(r => r.failed ?? 0),
      backgroundColor: "#e53935",
      borderRadius: 5,
    },
  ],
}));

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#8696a0", font: { size: 10 } } },
    y: { grid: { color: "#f0f2f5" }, ticks: { color: "#8696a0", font: { size: 10 } }, beginAtZero: true },
  },
};

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const, labels: { color: "#667781", font: { size: 10 } } },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: "#8696a0", font: { size: 10 } } },
    y: { grid: { color: "#f0f2f5" }, ticks: { color: "#8696a0", font: { size: 10 } }, beginAtZero: true },
  },
};

// ─── Fetchers ─────────────────────────────────────────────────────────────────
async function fetchCatalogDetails(): Promise<void> {
  const json = await api("catalog_details");
  if (json?.success && json?.data) {
    const d = json.data;
    catalogDetails.value = {
      catalog_name: d.catalog_name ?? "Product Catalog",
      catalog_id: d.catalog_id ?? "",
      total_source_products: d.total_source_products ?? d.source_product_count ?? d.total_products ?? 0,
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
      syncStatus.value = {
        last_sync_status: d.last_sync_status ?? d.sync_status ?? d.status ?? d.sync_health ?? "unknown",
        last_sync: d.last_sync ?? d.last_sync_time ?? d.updated_at ?? null,
        sync_health: d.sync_health ?? d.health ?? "unknown",
      };
    }
  } catch {
    // non-fatal
  }
}

async function fetchSyncHistory(): Promise<void> {
  try {
    const json = await api("catalog_sync_history", { page: 1, limit: 50 });
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

async function fetchSyncErrors(): Promise<void> {
  try {
    const json = await api("catalog_sync_errors");
    if (json?.success && json?.data) {
      const d = json.data;
      syncErrors.value = d.errors ?? d.failed_items ?? (Array.isArray(d) ? d : []);
    } else {
      syncErrors.value = [];
    }
  } catch {
    syncErrors.value = [];
  }
}

// ─── Refresh All ─────────────────────────────────────────────────────────────
async function refreshAll(): Promise<void> {
  globalLoading.value = true;
  errorAlert.value = null;
  try {
    await fetchCatalogDetails();
    await Promise.all([fetchSyncStatus(), fetchSyncHistory(), fetchSyncErrors()]);
    if (!initialLoading.value) {
      toast.add({ severity: "success", summary: "Analytics Updated", detail: "All metrics refreshed.", life: 3000 });
    }
  } catch (e: any) {
    const classified = classifyError(e.message ?? "");
    errorAlert.value = classified;
    toast.add({ severity: "error", summary: "Refresh Failed", detail: classified.message, life: 4000 });
  } finally {
    globalLoading.value = false;
    initialLoading.value = false;
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigateToSync(): void {
  window.history.pushState(null, "", "/fragcatalogsync");
  window.dispatchEvent(new Event("popstate"));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function classifyError(message: string): ErrorAlert {
  const m = message.toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { type: "token_expired", title: "Session Expired", message: "Your Meta session has expired. Please reconnect under Meta Connect." };
  if (m.includes("catalog") && (m.includes("missing") || m.includes("not found") || m.includes("404")))
    return { type: "catalog_missing", title: "Catalog Missing", message: "No active catalog found. Please configure your Meta catalog first." };
  if (m.includes("permission") || m.includes("403") || m.includes("forbidden"))
    return { type: "permission_error", title: "Access Denied", message: "Required Meta API permissions are missing. Please reconnect." };
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
onMounted(refreshAll);
</script>
