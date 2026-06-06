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
          <h1 class="text-xl font-bold" style="color: #111b17;">Catalog Sync</h1>
          <p class="text-xs" style="color: #667781;">Synchronize your products to WhatsApp Catalog</p>
        </div>
      </div>
      <!-- Last sync badge -->
      <div v-if="lastSync" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
        style="background: #fff; border: 1px solid #e0e0e0; color: #667781;">
        <i class="pi pi-clock text-xs" style="color: #00a884;" />
        {{ lastSyncFormatted }}
      </div>
    </div>

    <!-- Sync Progress Bar (active sync) -->
    <div v-if="syncing" class="rounded-2xl p-5 mb-4" style="background: #fff; border: 1px solid #e0e0e0;">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-5 h-5 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
          <span class="text-sm font-semibold" style="color: #111b17;">Syncing products...</span>
        </div>
        <span class="text-sm font-bold" style="color: #00a884;">{{ syncProgress.done }}/{{ syncProgress.total }}</span>
      </div>
      <div class="w-full rounded-full h-2" style="background: #f0f2f5;">
        <div class="h-2 rounded-full transition-all duration-500" style="background: #00a884;"
          :style="{ width: syncProgressPct + '%' }" />
      </div>
      <p class="text-xs mt-2" style="color: #667781;">{{ syncProgressPct }}% complete — please wait</p>
    </div>

    <!-- Sync Result Banner -->
    <div v-if="syncResult && !syncing" class="rounded-2xl p-4 mb-4 flex items-center gap-4"
      :style="syncHealthStyle(syncResult.sync_health).bannerStyle">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        :style="syncHealthStyle(syncResult.sync_health).iconBg">
        <i :class="syncHealthStyle(syncResult.sync_health).icon" class="text-white text-sm" />
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-0.5">
          <p class="text-sm font-semibold" :style="syncHealthStyle(syncResult.sync_health).textColor">
            {{ syncHealthStyle(syncResult.sync_health).label }}
          </p>
          <span class="text-xs px-2 py-0.5 rounded-full font-medium"
            :style="syncHealthStyle(syncResult.sync_health).badgeStyle">
            {{ syncResult.sync_health }}
          </span>
        </div>
        <p class="text-xs" style="color: #667781;">
          {{ syncResult.synced }} synced · {{ syncResult.failed }} failed · {{ syncResult.total }} total
        </p>
      </div>
      <button @click="syncResult = null" class="text-xs" style="color: #667781;">
        <i class="pi pi-times" />
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <p class="text-xs font-medium mb-1" style="color: #667781;">Available Products</p>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ products.length }}</p>
      </div>
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <p class="text-xs font-medium mb-1" style="color: #667781;">Selected</p>
        <p class="text-2xl font-bold" style="color: #00a884;">{{ selectedIds.length }}</p>
      </div>
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <p class="text-xs font-medium mb-1" style="color: #667781;">Last Synced</p>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ lastSyncStats.synced ?? "—" }}</p>
      </div>
    </div>

    <!-- Product List Card -->
    <div class="rounded-2xl overflow-hidden mb-4" style="background: #fff; border: 1px solid #e0e0e0;">
      <!-- Toolbar -->
      <div class="px-5 py-3 flex items-center justify-between border-b" style="border-color: #f0f2f5;">
        <div class="flex items-center gap-3">
          <button @click="toggleSelectAll"
            class="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg"
            style="background: #f0f2f5; border: 1px solid #e9edef; color: #3b4a54;">
            <i :class="allSelected ? 'pi pi-check-square' : 'pi pi-stop'" class="text-xs" style="color: #00a884;" />
            {{ allSelected ? "Deselect All" : "Select All" }}
          </button>
          <button @click="loadProducts" :disabled="loadingProducts"
            class="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg"
            style="background: #f0f2f5; border: 1px solid #e9edef; color: #3b4a54;">
            <i :class="loadingProducts ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #667781;" />
            Refresh
          </button>
        </div>
        <!-- Sync Buttons -->
        <div class="flex items-center gap-2">
          <button @click="startSync(false)" :disabled="syncing || selectedIds.length === 0"
            class="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-xl"
            style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
            <i class="pi pi-upload text-xs" style="color: #00a884;" />
            Sync Selected ({{ selectedIds.length }})
          </button>
          <button @click="startSync(true)" :disabled="syncing || products.length === 0"
            class="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-xl"
            style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 8px rgba(0,168,132,0.25);">
            <i :class="syncing ? 'pi pi-spin pi-spinner' : 'pi pi-sync'" class="text-xs" />
            Sync All
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingProducts" class="flex flex-col items-center justify-center py-16 gap-3">
        <div class="w-8 h-8 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
        <p class="text-sm" style="color: #667781;">Loading products...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-16 gap-2">
        <i class="pi pi-box text-3xl" style="color: #ccd0d5;" />
        <p class="text-sm font-medium" style="color: #111b17;">No products found</p>
        <p class="text-xs" style="color: #667781;">Products come from your product_dir catalog</p>
      </div>

      <!-- Product Rows -->
      <div v-else class="divide-y" style="border-color: #f0f2f5;">
        <div v-for="p in products" :key="p.id"
          @click="toggleSelect(p.id)"
          class="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors"
          :style="selectedIds.includes(p.id) ? 'background: #f0faf8;' : 'background: #fff;'">
          <!-- Checkbox -->
          <div class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
            :style="selectedIds.includes(p.id)
              ? 'background:#00a884; border:1.5px solid #00a884;'
              : 'background:#fff; border:1.5px solid #ccd0d5;'">
            <i v-if="selectedIds.includes(p.id)" class="pi pi-check text-white" style="font-size:0.6rem;" />
          </div>
          <!-- Image -->
          <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style="background: #f0f2f5; border: 1px solid #e9edef;">
            <img v-if="p.image" :src="p.image" class="w-full h-full object-cover"
              @error="(e:any) => e.target.style.display='none'" />
            <i v-else class="pi pi-image text-sm" style="color: #ccd0d5;" />
          </div>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate" style="color: #111b17;">{{ p.name }}</p>
            <p class="text-xs" style="color: #667781;">{{ p.price ? `₹${p.price}` : "No price" }}</p>
          </div>
          <!-- Status badge -->
          <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            :style="p.available !== false
              ? 'background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;'
              : 'background:#f0f2f5; color:#667781; border:1px solid #e9edef;'">
            {{ p.available !== false ? "Available" : "Unavailable" }}
          </span>
        </div>
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
const products = ref<any[]>([]);
const selectedIds = ref<string[]>([]);
const loadingProducts = ref(false);
const syncing = ref(false);
const syncResult = ref<any>(null);
const lastSync = ref<string | null>(null);
const lastSyncStats = ref<any>({});
const syncProgress = ref({ done: 0, total: 0 });
let pollTimer: any = null;

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const allSelected = computed(() => products.value.length > 0 && selectedIds.value.length === products.value.length);
const syncProgressPct = computed(() => syncProgress.value.total
  ? Math.round((syncProgress.value.done / syncProgress.value.total) * 100) : 0);
const lastSyncFormatted = computed(() => {
  if (!lastSync.value) return "";
  const d = new Date(lastSync.value);
  return `Last sync: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
});

function toggleSelect(id: string) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
}

function toggleSelectAll() {
  if (allSelected.value) selectedIds.value = [];
  else selectedIds.value = products.value.map((p) => p.id);
}

async function loadProducts() {
  loadingProducts.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=product_list`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ user_id: props.user_id }),
    });
    const json = await res.json();
    if (json?.success) {
      products.value = json.data?.products ?? json.data ?? [];
    } else throw new Error(json?.message ?? "Failed to load products");
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loadingProducts.value = false; }
}

async function loadLastSyncStatus() {
  try {
    const res = await fetch(`${apiUrl()}?typ=catalog_status`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      lastSync.value = json.data.last_sync ?? null;
      lastSyncStats.value = json.data;
    }
  } catch {}
}

function syncHealthStyle(health: string) {
  const map: Record<string, any> = {
    good:    { bannerStyle: "background:#e7f8f4; border:1px solid #b2dfdb;", iconBg: "background:#00a884;", icon: "pi pi-check",    textColor: "color:#00a884;", label: "Sync Completed",           badgeStyle: "background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;" },
    partial: { bannerStyle: "background:#fff8e1; border:1px solid #ffe082;", iconBg: "background:#f59e0b;", icon: "pi pi-exclamation-triangle", textColor: "color:#f59e0b;", label: "Sync Partially Complete", badgeStyle: "background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;" },
    failed:  { bannerStyle: "background:#fff0f0; border:1px solid #ffcdd2;", iconBg: "background:#e53935;", icon: "pi pi-times",    textColor: "color:#e53935;", label: "Sync Failed",               badgeStyle: "background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;" },
  };
  return map[health] ?? map.good;
}

async function startSync(syncAll: boolean) {
  syncing.value = true;
  syncResult.value = null;
  syncProgress.value = { done: 0, total: syncAll ? products.value.length : selectedIds.value.length };

  try {
    const body = syncAll
      ? { sync_all: true, id: props.record_id }
      : { product_ids: selectedIds.value, id: props.record_id };

    const res = await fetch(`${apiUrl()}?typ=catalog_sync`, {
      method: "POST", headers: headers(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Sync failed");

    // backend returns full sync result directly
    const d = json.data ?? {};
    syncing.value = false;
    lastSync.value = d.last_sync ?? new Date().toISOString();
    lastSyncStats.value = d;
    syncResult.value = {
      sync_health: d.sync_health ?? "good",
      synced: d.synced ?? 0,
      failed: d.failed ?? 0,
      total: d.total_products ?? 0,
    };
    const health = d.sync_health ?? "good";
    toast.add({
      severity: health === "good" ? "success" : health === "partial" ? "warn" : "error",
      summary: health === "good" ? "Sync Complete" : health === "partial" ? "Sync Partial" : "Sync Failed",
      detail: `${d.synced ?? 0} synced, ${d.failed ?? 0} failed`,
      life: 4000,
    });

  } catch (e: any) {
    syncing.value = false;
    toast.add({ severity: "error", summary: "Sync Error", detail: e.message, life: 4000 });
  }
}

onMounted(async () => {
  await loadProducts();
  await loadLastSyncStatus();
});

onUnmounted(() => clearInterval(pollTimer));
</script>
