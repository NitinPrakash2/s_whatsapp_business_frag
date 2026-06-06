<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">Catalog Status</h1>
          <p class="text-xs" style="color: #667781;">Monitor your WhatsApp Commerce health</p>
        </div>
      </div>
      <button @click="refresh" :disabled="loading"
        class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
        Refresh
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
      <p class="text-sm" style="color: #667781;">Loading status...</p>
    </div>

    <div v-else>
      <!-- Health Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- Meta Connection -->
        <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color: #667781;">Meta Connection</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              :style="status.meta_connected ? 'background:#e7f8f4;' : 'background:#fff0f0;'">
              <i :class="status.meta_connected ? 'pi pi-check' : 'pi pi-times'" class="text-xs"
                :style="status.meta_connected ? 'color:#00a884;' : 'color:#e53935;'" />
            </div>
          </div>
          <p class="text-lg font-bold mb-0.5" :style="status.meta_connected ? 'color:#00a884;' : 'color:#e53935;'">
            {{ status.meta_connected ? "Connected" : "Disconnected" }}
          </p>
          <p class="text-xs" style="color: #667781;">{{ status.display_name || "—" }}</p>
        </div>

        <!-- Catalog Connection -->
        <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color: #667781;">Catalog</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center"
              :style="status.catalog_connected ? 'background:#e7f8f4;' : 'background:#fff8e1;'">
              <i :class="status.catalog_connected ? 'pi pi-check' : 'pi pi-exclamation-triangle'" class="text-xs"
                :style="status.catalog_connected ? 'color:#00a884;' : 'color:#f59e0b;'" />
            </div>
          </div>
          <p class="text-lg font-bold mb-0.5" :style="status.catalog_connected ? 'color:#00a884;' : 'color:#f59e0b;'">
            {{ status.catalog_connected ? "Active" : "Not Configured" }}
          </p>
          <p class="text-xs" style="color: #667781;">ID: {{ status.catalog_id || "—" }}</p>
        </div>

        <!-- Sync Health -->
        <div class="rounded-2xl p-5" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-semibold uppercase tracking-wide" style="color: #667781;">Sync Health</span>
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" :style="syncHealthStyle.iconBg">
              <i :class="syncHealthStyle.icon" class="text-xs" :style="syncHealthStyle.iconColor" />
            </div>
          </div>
          <p class="text-lg font-bold mb-0.5" :style="syncHealthStyle.textColor">
            {{ syncHealthStyle.label }}
          </p>
          <p class="text-xs" style="color: #667781;">{{ lastSyncFormatted }}</p>
        </div>
      </div>

      <!-- Product Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div v-for="stat in productStats" :key="stat.label"
          class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center" :style="stat.iconBg">
              <i :class="stat.icon" class="text-xs" :style="stat.iconColor" />
            </div>
            <span class="text-xs font-medium" style="color: #667781;">{{ stat.label }}</span>
          </div>
          <p class="text-2xl font-bold" :style="stat.valueColor">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Failed Items -->
      <div v-if="status.failed_items?.length" class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center justify-between border-b" style="border-color: #f0f2f5;">
          <div class="flex items-center gap-2">
            <i class="pi pi-exclamation-circle text-sm" style="color: #e53935;" />
            <h2 class="font-semibold text-sm" style="color: #111b17;">Failed Items ({{ status.failed_items.length }})</h2>
          </div>
        </div>
        <div class="divide-y" style="border-color: #f0f2f5;">
          <div v-for="item in status.failed_items" :key="item.id"
            class="px-5 py-3 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium" style="color: #111b17;">{{ item.name || item.id }}</p>
              <p class="text-xs" style="color: #e53935;">{{ item.reason }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full" style="background: #fff0f0; color: #e53935; border: 1px solid #ffcdd2;">Failed</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!status.meta_connected" class="rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center" style="background: #f0f2f5;">
          <i class="pi pi-link text-xl" style="color: #ccd0d5;" />
        </div>
        <p class="font-semibold" style="color: #111b17;">Meta not connected</p>
        <p class="text-sm" style="color: #667781;">Go to Meta Connection to configure your credentials first</p>
        <button @click="() => window.location.href='/fragmetaconnect'"
          class="mt-1 px-4 py-2 rounded-xl text-sm font-semibold"
          style="background: #00a884; color: #fff; border: none;">
          Configure Meta
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const toast = useToast();
const loading = ref(false);
const status = ref<any>({
  meta_connected: false,
  catalog_connected: false,
  catalog_id: "",
  display_name: "",
  last_sync: null,
  total_products: 0,
  synced: 0,
  failed: 0,
  failed_items: [],
  sync_health: "unknown",
});

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

let autoRefresh: any = null;

const syncHealthStyle = computed(() => {
  const map: Record<string, any> = {
    good:    { icon: "pi pi-check",                iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", textColor: "color:#00a884;", label: "Good" },
    warning: { icon: "pi pi-exclamation-triangle", iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", textColor: "color:#f59e0b;", label: "Warning" },
    error:   { icon: "pi pi-times",                iconBg: "background:#fff0f0;", iconColor: "color:#e53935;", textColor: "color:#e53935;", label: "Error" },
    unknown: { icon: "pi pi-minus",                iconBg: "background:#f0f2f5;", iconColor: "color:#667781;", textColor: "color:#667781;", label: "Unknown" },
  };
  return map[status.value.sync_health] ?? map.unknown;
});

const lastSyncFormatted = computed(() => {
  if (!status.value.last_sync) return "Never synced";
  const d = new Date(status.value.last_sync);
  return `Last sync: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
});

const productStats = computed(() => [
  { label: "Total Products",  value: status.value.total_products, icon: "pi pi-box",          iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#111b17;" },
  { label: "Synced",          value: status.value.synced,         icon: "pi pi-check-circle",  iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;", valueColor: "color:#00a884;" },
  { label: "Failed",          value: status.value.failed,         icon: "pi pi-times-circle",  iconBg: "background:#fff0f0;", iconColor: "color:#e53935;", valueColor: "color:#e53935;" },
  { label: "Pending",         value: Math.max(0, status.value.total_products - status.value.synced - status.value.failed),
    icon: "pi pi-clock", iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;", valueColor: "color:#f59e0b;" },
]);

async function refresh() {
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=catalog_status`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) status.value = { ...status.value, ...json.data };
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}

onMounted(() => {
  refresh();
  autoRefresh = setInterval(refresh, 30000);
});

onUnmounted(() => clearInterval(autoRefresh));
</script>
