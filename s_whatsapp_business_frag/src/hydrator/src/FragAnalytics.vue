<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Commerce</h1>
          <p class="text-xs" style="color: #667781;">Analytics Overview</p>
        </div>
      </div>
      <button @click="loadAll" :disabled="loading"
        class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
        Refresh
      </button>
    </div>

    <!-- Section: Business Profiles -->
    <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #667781;">Business Profiles</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div v-for="s in businessStats" :key="s.label"
        class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium" style="color: #667781;">{{ s.label }}</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="s.iconBg">
            <i :class="s.icon" class="text-sm" :style="s.iconColor" />
          </div>
        </div>
        <p class="text-4xl font-bold" :style="s.valueColor">{{ s.value }}</p>
        <p class="text-xs mt-1" style="color: #667781;">{{ s.sub }}</p>
      </div>
    </div>

    <!-- Section: Meta & Catalog Status -->
    <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #667781;">Connection & Catalog</p>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <!-- Meta Connection -->
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            :style="catalogStatus.meta_connected ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
            <i :class="catalogStatus.meta_connected ? 'pi pi-check' : 'pi pi-times'" class="text-xs"
              :style="catalogStatus.meta_connected ? 'color:#00a884;' : 'color:#e53935;'" />
          </div>
          <span class="text-xs font-medium" style="color: #667781;">Meta</span>
        </div>
        <p class="text-sm font-bold" :style="catalogStatus.meta_connected ? 'color:#00a884;' : 'color:#e53935;'">
          {{ catalogStatus.meta_connected ? "Connected" : "Disconnected" }}
        </p>
      </div>

      <!-- Catalog -->
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            :style="catalogStatus.catalog_connected ? 'background:#e7f8f4;' : 'background:#fff8e1;'">
            <i :class="catalogStatus.catalog_connected ? 'pi pi-check' : 'pi pi-exclamation-triangle'" class="text-xs"
              :style="catalogStatus.catalog_connected ? 'color:#00a884;' : 'color:#f59e0b;'" />
          </div>
          <span class="text-xs font-medium" style="color: #667781;">Catalog</span>
        </div>
        <p class="text-sm font-bold" :style="catalogStatus.catalog_connected ? 'color:#00a884;' : 'color:#f59e0b;'">
          {{ catalogStatus.catalog_connected ? "Active" : "Not Set" }}
        </p>
      </div>

      <!-- Total Products -->
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-box text-xs" style="color: #00a884;" />
          </div>
          <span class="text-xs font-medium" style="color: #667781;">Total Products</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ catalogStatus.total_products ?? "—" }}</p>
      </div>

      <!-- Sync Health -->
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" :style="syncHealthStyle.iconBg">
            <i :class="syncHealthStyle.icon" class="text-xs" :style="syncHealthStyle.iconColor" />
          </div>
          <span class="text-xs font-medium" style="color: #667781;">Sync Health</span>
        </div>
        <p class="text-sm font-bold" :style="syncHealthStyle.textColor">{{ syncHealthStyle.label }}</p>
      </div>
    </div>

    <!-- Section: Sync Stats -->
    <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #667781;">Sync Statistics</p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div v-for="s in syncStats" :key="s.label"
        class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium" style="color: #667781;">{{ s.label }}</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="s.iconBg">
            <i :class="s.icon" class="text-sm" :style="s.iconColor" />
          </div>
        </div>
        <p class="text-4xl font-bold" :style="s.valueColor">{{ s.value }}</p>
        <p class="text-xs mt-1" style="color: #667781;">{{ s.sub }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Bar: Business by Category -->
      <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-chart-bar" style="color: #00a884;" />
          <h2 class="font-semibold text-sm" style="color: #111b17;">Business by Category</h2>
        </div>
        <Chart type="bar" :data="barChartData" :options="barChartOptions" style="height:200px" />
      </div>

      <!-- Doughnut: Sync Results -->
      <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-4">
          <i class="pi pi-chart-pie" style="color: #00a884;" />
          <h2 class="font-semibold text-sm" style="color: #111b17;">Sync Results</h2>
        </div>
        <div v-if="hasSyncData" style="height:200px;" class="flex items-center justify-center">
          <Chart type="doughnut" :data="doughnutData" :options="doughnutOptions" style="height:200px;max-width:200px;" />
        </div>
        <div v-else class="flex flex-col items-center justify-center gap-2" style="height:200px; color:#667781;">
          <i class="pi pi-sync text-3xl" style="color: #ccd0d5;" />
          <p class="text-sm">No sync data yet</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Chart from "primevue/chart";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const loading = ref(false);
const stats = ref({ total: 0, active: 0, recent: 0 });
const catalogStatus = ref<any>({
  meta_connected: false, catalog_connected: false,
  total_products: 0, synced: 0, failed: 0,
  sync_health: "unknown", last_sync: null,
});
const barChartData = ref<any>({});
const doughnutData = ref<any>({});

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const barChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#667781" }, grid: { color: "#f0f2f5" } },
    y: { ticks: { color: "#667781" }, grid: { color: "#f0f2f5" } },
  },
};

const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { position: "bottom", labels: { color: "#667781", font: { size: 11 } } } },
};

const syncHealthStyle = computed(() => {
  const map: Record<string, any> = {
    good:    { icon: "pi pi-check",    iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", textColor: "color:#00a884;", label: "Good" },
    warning: { icon: "pi pi-exclamation-triangle", iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", textColor: "color:#f59e0b;", label: "Warning" },
    error:   { icon: "pi pi-times",    iconBg: "background:#fff0f0;", iconColor: "color:#e53935;", textColor: "color:#e53935;", label: "Error" },
    unknown: { icon: "pi pi-minus",    iconBg: "background:#f0f2f5;", iconColor: "color:#667781;", textColor: "color:#667781;", label: "Unknown" },
  };
  return map[catalogStatus.value.sync_health] ?? map.unknown;
});

const businessStats = computed(() => [
  { label: "Total Businesses", value: stats.value.total,  icon: "pi pi-building",     iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#111b17;", sub: "All registered profiles" },
  { label: "Active Profiles",  value: stats.value.active, icon: "pi pi-check-circle", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#00a884;", sub: "Profiles with phone number" },
  { label: "Recent Activity",  value: stats.value.recent, icon: "pi pi-chart-line",   iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#111b17;", sub: "Last 5 records" },
]);

const syncStats = computed(() => [
  { label: "Products Synced", value: catalogStatus.value.synced ?? 0, icon: "pi pi-check-circle", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#00a884;", sub: "Successfully in WhatsApp Catalog" },
  { label: "Sync Failed",     value: catalogStatus.value.failed ?? 0, icon: "pi pi-times-circle", iconBg: "background:#fff0f0;", iconColor: "color:#e53935;", valueColor: "color:#e53935;", sub: "Rejected by Meta" },
  { label: "Pending",         value: Math.max(0, (catalogStatus.value.total_products ?? 0) - (catalogStatus.value.synced ?? 0) - (catalogStatus.value.failed ?? 0)),
    icon: "pi pi-clock", iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", valueColor: "color:#f59e0b;", sub: "Not yet synced" },
]);

const hasSyncData = computed(() =>
  (catalogStatus.value.synced ?? 0) > 0 || (catalogStatus.value.failed ?? 0) > 0
);

async function loadAll() {
  loading.value = true;
  await Promise.all([loadBusinessStats(), loadCatalogStatus()]);
  loading.value = false;
}

async function loadBusinessStats() {
  try {
    const res = await fetch(`${apiUrl()}?typ=list`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ user_id: props.user_id }),
    });
    const json = await res.json();
    const records: any[] = Array.isArray(json?.data) ? json.data : [];
    stats.value.total = records.length;
    stats.value.active = records.filter((r) => r.data?.phone).length;
    stats.value.recent = records.slice(-5).length;
    const catMap: Record<string, number> = {};
    for (const r of records) {
      const cat = r.data?.category || "Uncategorized";
      catMap[cat] = (catMap[cat] ?? 0) + 1;
    }
    barChartData.value = {
      labels: Object.keys(catMap),
      datasets: [{ label: "Businesses", data: Object.values(catMap), backgroundColor: "#00a884", borderRadius: 8, borderSkipped: false }],
    };
  } catch (e) { console.error(e); }
}

async function loadCatalogStatus() {
  try {
    const res = await fetch(`${apiUrl()}?typ=catalog_status`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      catalogStatus.value = { ...catalogStatus.value, ...json.data };
      doughnutData.value = {
        labels: ["Synced", "Failed", "Pending"],
        datasets: [{
          data: [
            json.data.synced ?? 0,
            json.data.failed ?? 0,
            Math.max(0, (json.data.total_products ?? 0) - (json.data.synced ?? 0) - (json.data.failed ?? 0)),
          ],
          backgroundColor: ["#00a884", "#e53935", "#f59e0b"],
          borderWidth: 0,
        }],
      };
    }
  } catch (e) { console.error(e); }
}

onMounted(loadAll);
</script>
