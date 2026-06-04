<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">

    <!-- Header -->
    <div class="mb-6 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
        <i class="pi pi-whatsapp text-white text-lg" />
      </div>
      <div>
        <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Business</h1>
        <p class="text-xs" style="color: #667781;">Analytics Overview</p>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium" style="color: #667781;">Total Businesses</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-building text-sm" style="color: #00a884;" />
          </div>
        </div>
        <p class="text-4xl font-bold" style="color: #111b17;">{{ stats.total }}</p>
        <p class="text-xs mt-1" style="color: #667781;">All registered profiles</p>
      </div>

      <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium" style="color: #667781;">Active Profiles</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-check-circle text-sm" style="color: #00a884;" />
          </div>
        </div>
        <p class="text-4xl font-bold" style="color: #00a884;">{{ stats.active }}</p>
        <p class="text-xs mt-1" style="color: #667781;">Profiles with phone number</p>
      </div>

      <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium" style="color: #667781;">Recent Activity</span>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-chart-line text-sm" style="color: #00a884;" />
          </div>
        </div>
        <p class="text-4xl font-bold" style="color: #111b17;">{{ stats.recent }}</p>
        <p class="text-xs mt-1" style="color: #667781;">Last 5 records</p>
      </div>
    </div>

    <!-- Chart -->
    <div class="rounded-2xl p-6" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
      <div class="flex items-center gap-2 mb-6">
        <i class="pi pi-chart-bar" style="color: #00a884;" />
        <h2 class="font-semibold" style="color: #111b17;">Business by Category</h2>
      </div>
      <Chart type="bar" :data="chartData" :options="chartOptions" style="height:240px" />
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Chart from "primevue/chart";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string }>();

const stats = ref({ total: 0, active: 0, recent: 0 });
const chartData = ref<any>({});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: "#667781" }, grid: { color: "#f0f2f5" } },
    y: { ticks: { color: "#667781" }, grid: { color: "#f0f2f5" } },
  },
});

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;

onMounted(async () => {
  try {
    const res = await fetch(`${apiUrl()}?typ=list`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` },
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
    chartData.value = {
      labels: Object.keys(catMap),
      datasets: [{ label: "Businesses", data: Object.values(catMap), backgroundColor: "#00a884", borderRadius: 8, borderSkipped: false }],
    };
  } catch (e) { console.error(e); }
});
</script>
