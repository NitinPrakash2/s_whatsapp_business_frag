<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <div class="max-w-2xl mx-auto">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Business</h1>
          <p class="text-xs" style="color: #667781;">Connect and manage your WhatsApp Business account</p>
        </div>
      </div>

      <!-- ─── CONNECTION STATUS CARD ─── -->
      <div class="rounded-2xl overflow-hidden mb-4" style="background: #fff; border: 1px solid #e0e0e0;">

        <!-- Connected State -->
        <div v-if="status === 'connected'">
          <div class="px-6 pt-6 pb-4 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style="background: #e7f8f4; border: 2px solid #00a884;">
              <i class="pi pi-whatsapp text-2xl" style="color: #00a884;" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style="background: #00a884; color: #fff;">● Connected</span>
                <span class="text-xs" style="color: #667781;">
                  Since {{ formatTime(assets.connected_at) }}
                </span>
              </div>
              <p class="text-lg font-bold truncate" style="color: #111b17;">
                {{ assets.business_name || "Your WhatsApp Business" }}
              </p>
              <p class="text-sm" style="color: #667781;">{{ assets.phone_number }}</p>
            </div>
            <button @click="refreshConnection" :disabled="refreshing"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium flex-shrink-0"
              style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
              <i :class="refreshing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
              Refresh
            </button>
          </div>

          <!-- Connected Assets Grid -->
          <div class="grid grid-cols-2 gap-3 px-6 pb-6">
            <!-- Business -->
            <div class="rounded-xl p-4" style="background: #f9fafb; border: 1px solid #f0f2f5;">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
                  <i class="pi pi-building text-xs" style="color: #00a884;" />
                </div>
                <span class="text-xs font-medium" style="color: #667781;">Business Account</span>
              </div>
              <p class="text-sm font-semibold truncate" style="color: #111b17;">{{ assets.waba_name || "—" }}</p>
              <span class="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                style="background: #e7f8f4; color: #00a884;">Verified</span>
            </div>

            <!-- Phone -->
            <div class="rounded-xl p-4" style="background: #f9fafb; border: 1px solid #f0f2f5;">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
                  <i class="pi pi-phone text-xs" style="color: #00a884;" />
                </div>
                <span class="text-xs font-medium" style="color: #667781;">Phone Number</span>
              </div>
              <p class="text-sm font-semibold" style="color: #111b17;">{{ assets.phone_number || "—" }}</p>
              <span class="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                style="background: #e7f8f4; color: #00a884;">Active</span>
            </div>

            <!-- Catalog -->
            <div class="rounded-xl p-4 col-span-2" style="background: #f9fafb; border: 1px solid #f0f2f5;">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #f0f4ff;">
                    <i class="pi pi-box text-xs" style="color: #6366f1;" />
                  </div>
                  <span class="text-xs font-medium" style="color: #667781;">Product Catalog</span>
                </div>
                <!-- Multi-catalog selector -->
                <select v-if="assets.catalogs?.length > 1"
                  v-model="selectedCatalogId"
                  @change="onCatalogSelect"
                  class="text-xs rounded-lg px-2 py-1 appearance-none"
                  style="background: #fff; border: 1px solid #e9edef; color: #111b17;">
                  <option v-for="cat in assets.catalogs" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div v-if="assets.catalog_name" class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold" style="color: #111b17;">{{ assets.catalog_name }}</p>
                  <p class="text-xs mt-0.5" style="color: #667781;">
                    {{ assets.catalog_product_count ?? 0 }} products available
                  </p>
                </div>
                <span class="text-xs px-1.5 py-0.5 rounded"
                  style="background: #e7f8f4; color: #00a884;">Catalog Connected</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-xs" style="color: #f59e0b;" />
                <p class="text-sm" style="color: #f59e0b;">No catalog found — sync products to create one</p>
              </div>
            </div>
          </div>

          <!-- Action Row -->
          <div class="px-6 pb-6 flex gap-3">
            <button @click="syncProducts" :disabled="syncing"
              class="flex-1 rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2"
              style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 8px rgba(0,168,132,0.2);">
              <i :class="syncing ? 'pi pi-spin pi-spinner' : 'pi pi-sync'" class="text-xs" />
              {{ syncing ? syncProgressMsg : "Sync Products to WhatsApp" }}
            </button>
            <button @click="disconnect"
              class="px-4 rounded-xl py-2.5 text-sm font-medium"
              style="background: #fff0f0; color: #e53935; border: 1px solid #ffcdd2;">
              Disconnect
            </button>
          </div>
        </div>

        <!-- Not Connected State -->
        <div v-else-if="status === 'disconnected' || status === 'unconfigured'">
          <div class="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center"
              style="background: #f0f2f5;">
              <i class="pi pi-whatsapp text-3xl" style="color: #ccd0d5;" />
            </div>
            <div>
              <p class="text-lg font-bold mb-1" style="color: #111b17;">Connect WhatsApp Business</p>
              <p class="text-sm" style="color: #667781; max-width: 360px;">
                Connect your WhatsApp Business account to start receiving customer messages and syncing your product catalog.
              </p>
            </div>
            <!-- Primary CTA — future: launches Meta Embedded Signup -->
            <button @click="connectMeta" :disabled="connecting"
              class="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm"
              style="background: #00a884; color: #fff; border: none; box-shadow: 0 4px 12px rgba(0,168,132,0.3);">
              <i :class="connecting ? 'pi pi-spin pi-spinner' : 'pi pi-whatsapp'" />
              {{ connecting ? connectProgressMsg : "Connect WhatsApp Business" }}
            </button>
            <p class="text-xs" style="color: #667781;">
              Secure connection via Meta Business API
            </p>
          </div>
        </div>

        <!-- Failed State -->
        <div v-else-if="status === 'failed'">
          <div class="px-6 py-8 flex flex-col items-center text-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center"
              style="background: #fff0f0;">
              <i class="pi pi-times-circle text-2xl" style="color: #e53935;" />
            </div>
            <div>
              <p class="text-base font-bold mb-1" style="color: #e53935;">Connection Failed</p>
              <p class="text-sm" style="color: #667781;">{{ errorMessage }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="connectMeta" :disabled="connecting"
                class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm"
                style="background: #00a884; color: #fff; border: none;">
                <i class="pi pi-refresh text-xs" />
                Try Again
              </button>
              <button @click="status = 'unconfigured'"
                class="px-4 py-2.5 rounded-xl text-sm font-medium"
                style="background: #f0f2f5; color: #667781; border: 1px solid #e9edef;">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="status === 'loading'">
          <div class="px-6 py-12 flex flex-col items-center gap-4">
            <div class="w-12 h-12 rounded-full animate-spin"
              style="border: 3px solid #e9edef; border-top-color: #00a884;" />
            <p class="text-sm font-medium" style="color: #111b17;">{{ connectProgressMsg }}</p>
            <p class="text-xs" style="color: #667781;">Please wait, this may take a few seconds</p>
          </div>
        </div>

      </div>

      <!-- ─── ERROR ALERTS ─── -->
      <div v-if="errorAlert" class="rounded-2xl p-4 mb-4 flex items-start gap-3"
        :style="errorAlert.style">
        <i :class="errorAlert.icon" class="text-sm mt-0.5 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-semibold" :style="errorAlert.titleStyle">{{ errorAlert.title }}</p>
          <p class="text-xs mt-0.5" :style="errorAlert.msgStyle">{{ errorAlert.message }}</p>
        </div>
        <button @click="errorAlert = null">
          <i class="pi pi-times text-xs" style="color: #667781;" />
        </button>
      </div>

      <!-- ─── ACTIVITY LOG ─── -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center justify-between border-b" style="border-color: #f0f2f5;">
          <div class="flex items-center gap-2">
            <i class="pi pi-clock text-sm" style="color: #667781;" />
            <h2 class="font-semibold text-sm" style="color: #111b17;">Recent Activity</h2>
          </div>
          <button @click="loadLogs" :disabled="logsLoading"
            class="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style="background: #f0f2f5; border: 1px solid #e9edef; color: #667781;">
            <i :class="logsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" style="font-size:0.6rem;" />
            Refresh
          </button>
        </div>

        <div v-if="logsLoading" class="flex items-center justify-center py-8">
          <div class="w-5 h-5 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
        </div>

        <div v-else class="divide-y" style="border-color: #f0f2f5;">
          <div v-for="log in activityLogs" :key="log.label"
            class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :style="log.iconBg">
                <i :class="log.icon" class="text-xs" :style="log.iconColor" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #111b17;">{{ log.label }}</p>
                <p class="text-xs" style="color: #667781;">{{ log.sub }}</p>
              </div>
            </div>
            <div class="text-right flex-shrink-0">
              <span v-if="log.value" class="text-xs px-2 py-0.5 rounded-full" :style="log.badgeStyle">
                {{ log.value }}
              </span>
              <span v-else class="text-xs" style="color: #ccd0d5;">No data yet</span>
              <p v-if="log.sub2" class="text-xs mt-0.5" style="color: #667781;">{{ log.sub2 }}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ConnectedAssets {
  business_name: string;
  waba_name: string;
  phone_number: string;
  catalog_name: string;
  catalog_id: string;
  catalog_product_count: number;
  catalogs: { id: string; name: string }[];
  connected_at: string;
}

interface ErrorAlert {
  title: string;
  message: string;
  icon: string;
  style: string;
  titleStyle: string;
  msgStyle: string;
}

type ConnectionStatus = "loading" | "connected" | "disconnected" | "unconfigured" | "failed";

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
const status = ref<ConnectionStatus>("unconfigured");
const connecting = ref(false);
const refreshing = ref(false);
const syncing = ref(false);
const logsLoading = ref(false);
const connectProgressMsg = ref("Connecting...");
const syncProgressMsg = ref("Syncing...");
const errorMessage = ref("");
const errorAlert = ref<ErrorAlert | null>(null);
const selectedCatalogId = ref("");

const assets = ref<ConnectedAssets>({
  business_name: "", waba_name: "", phone_number: "",
  catalog_name: "", catalog_id: "", catalog_product_count: 0,
  catalogs: [], connected_at: "",
});

const logs = ref({
  last_sync: null as string | null,
  last_sync_count: null as number | null,
  last_webhook: null as string | null,
  last_webhook_from: null as string | null,
  last_test: null as string | null,
  last_test_success: null as boolean | null,
});

// ─── API ──────────────────────────────────────────────────────────────────────
const apiUrl = () => `/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${props.access_token}`,
});

async function api(typ: string, body: object) {
  const res = await fetch(`${apiUrl()}?typ=${typ}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

// ─── Error mapping ────────────────────────────────────────────────────────────
function showError(message: string) {
  const lower = message.toLowerCase();
  let alert: ErrorAlert;

  if (lower.includes("token") && lower.includes("expired")) {
    alert = {
      title: "Session Expired",
      message: "Your WhatsApp connection session has expired. Please reconnect.",
      icon: "pi pi-clock",
      style: "background: #fff8e1; border: 1px solid #ffe082;",
      titleStyle: "color: #f59e0b;",
      msgStyle: "color: #92700a;",
    };
  } else if (lower.includes("permission") || lower.includes("scope")) {
    alert = {
      title: "Permission Missing",
      message: "Required WhatsApp permissions are not granted. Please reconnect and grant all requested permissions.",
      icon: "pi pi-lock",
      style: "background: #fff0f0; border: 1px solid #ffcdd2;",
      titleStyle: "color: #e53935;",
      msgStyle: "color: #b71c1c;",
    };
  } else if (lower.includes("catalog")) {
    alert = {
      title: "Catalog Not Found",
      message: "No product catalog was found for your WhatsApp Business account. Please create one in Meta Business Manager.",
      icon: "pi pi-box",
      style: "background: #fff8e1; border: 1px solid #ffe082;",
      titleStyle: "color: #f59e0b;",
      msgStyle: "color: #92700a;",
    };
  } else {
    alert = {
      title: "Connection Failed",
      message: message || "Something went wrong. Please try again.",
      icon: "pi pi-times-circle",
      style: "background: #fff0f0; border: 1px solid #ffcdd2;",
      titleStyle: "color: #e53935;",
      msgStyle: "color: #b71c1c;",
    };
  }
  errorAlert.value = alert;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Activity logs computed ───────────────────────────────────────────────────
const activityLogs = computed(() => [
  {
    label: "Last Product Sync",
    sub: "Products pushed to WhatsApp Catalog",
    icon: "pi pi-sync",
    iconBg: "background: #f0f4ff;",
    iconColor: "color: #6366f1;",
    value: logs.value.last_sync ? formatTime(logs.value.last_sync) : null,
    sub2: logs.value.last_sync_count ? `${logs.value.last_sync_count} products` : null,
    badgeStyle: "background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;",
  },
  {
    label: "Last Customer Message",
    sub: "Most recent WhatsApp message received",
    icon: "pi pi-comments",
    iconBg: "background: #e7f8f4;",
    iconColor: "color: #00a884;",
    value: logs.value.last_webhook ? formatTime(logs.value.last_webhook) : null,
    sub2: logs.value.last_webhook_from ? `from ${logs.value.last_webhook_from}` : null,
    badgeStyle: "background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;",
  },
  {
    label: "Last Connection Check",
    sub: "Verified WhatsApp API is reachable",
    icon: "pi pi-bolt",
    iconBg: "background: #fff8e1;",
    iconColor: "color: #f59e0b;",
    value: logs.value.last_test
      ? `${logs.value.last_test_success ? "✓ Passed" : "✗ Failed"} · ${formatTime(logs.value.last_test)}`
      : null,
    sub2: null,
    badgeStyle: logs.value.last_test_success
      ? "background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;"
      : "background: #fff0f0; color: #e53935; border: 1px solid #ffcdd2;",
  },
]);

// ─── Connect Meta ─────────────────────────────────────────────────────────────
// Architecture note: this function is designed to be future-ready for
// Meta Embedded Signup. To plug in Embedded Signup later, replace the
// api("meta_connect") call with the FB SDK launchWhatsAppSignup() call,
// then pass the returned code to meta_connect endpoint.
async function connectMeta() {
  connecting.value = true;
  status.value = "loading";
  errorAlert.value = null;

  try {
    // Step 1: Initiate connection
    connectProgressMsg.value = "Connecting to WhatsApp Business...";
    const json = await api("meta_connect", { id: props.record_id });
    if (!json?.success) throw new Error(json?.message ?? "Connection failed");

    // Step 2: Test connection
    connectProgressMsg.value = "Verifying connection...";
    const testJson = await api("meta_test", { id: props.record_id });
    if (!testJson?.success) throw new Error(testJson?.message ?? "Verification failed");

    // Step 3: Load connected assets
    connectProgressMsg.value = "Loading your business details...";
    await loadAssets();

    logs.value.last_test = new Date().toISOString();
    logs.value.last_test_success = true;
    status.value = "connected";
    toast.add({ severity: "success", summary: "Connected!", detail: "WhatsApp Business connected successfully", life: 4000 });

  } catch (e: any) {
    status.value = "failed";
    errorMessage.value = e.message;
    showError(e.message);
    logs.value.last_test = new Date().toISOString();
    logs.value.last_test_success = false;
  } finally {
    connecting.value = false;
  }
}

// ─── Refresh connection ────────────────────────────────────────────────────────
async function refreshConnection() {
  refreshing.value = true;
  errorAlert.value = null;
  try {
    const json = await api("meta_test", { id: props.record_id });
    if (!json?.success) throw new Error(json?.message ?? "Refresh failed");
    await loadAssets();
    logs.value.last_test = new Date().toISOString();
    logs.value.last_test_success = true;
    toast.add({ severity: "success", summary: "Refreshed", detail: "Connection verified successfully", life: 3000 });
  } catch (e: any) {
    showError(e.message);
    logs.value.last_test = new Date().toISOString();
    logs.value.last_test_success = false;
  } finally { refreshing.value = false; }
}

// ─── Load connected assets from backend ───────────────────────────────────────
async function loadAssets() {
  const json = await api("get_meta_config", { id: props.record_id });
  if (!json?.success) return;
  const d = json.data?.data ?? json.data;

  // Map backend data to seller-friendly assets — never expose IDs
  assets.value = {
    business_name: d.business_name ?? d.display_name ?? "",
    waba_name: d.waba_name ?? "WhatsApp Business Account",
    phone_number: d.phone_number ?? d.display_phone_number ?? "",
    catalog_name: d.catalog_name ?? "",
    catalog_id: d.catalog_id ?? "",
    catalog_product_count: d.catalog_product_count ?? 0,
    catalogs: d.catalogs ?? (d.catalog_id ? [{ id: d.catalog_id, name: d.catalog_name ?? "Default Catalog" }] : []),
    connected_at: d.connected_at ?? d.last_connected ?? "",
  };

  if (d.catalog_id && !selectedCatalogId.value) {
    selectedCatalogId.value = d.catalog_id;
  }

  // Determine connection status from backend data
  if (d.access_token_set) status.value = "connected";
  else status.value = "unconfigured";
}

// ─── Catalog selector ─────────────────────────────────────────────────────────
async function onCatalogSelect() {
  // When seller picks a different catalog, update backend silently
  try {
    await api("save_meta_config", {
      id: props.record_id,
      data: { catalog_id: selectedCatalogId.value },
    });
    const selected = assets.value.catalogs.find(c => c.id === selectedCatalogId.value);
    if (selected) assets.value.catalog_name = selected.name;
    toast.add({ severity: "success", summary: "Catalog Updated", detail: `Now using: ${selected?.name}`, life: 3000 });
  } catch (e: any) {
    showError(e.message);
  }
}

// ─── Disconnect ────────────────────────────────────────────────────────────────
function disconnect() {
  status.value = "unconfigured";
  assets.value = { business_name: "", waba_name: "", phone_number: "", catalog_name: "", catalog_id: "", catalog_product_count: 0, catalogs: [], connected_at: "" };
  toast.add({ severity: "info", summary: "Disconnected", detail: "WhatsApp Business account disconnected", life: 3000 });
}

// ─── Sync products ─────────────────────────────────────────────────────────────
async function syncProducts() {
  syncing.value = true;
  syncProgressMsg.value = "Syncing products...";
  try {
    const json = await api("catalog_sync", { id: props.record_id, sync_all: true });
    if (!json?.success) throw new Error(json?.message ?? "Sync failed");
    const d = json.data ?? {};
    logs.value.last_sync = d.last_sync ?? new Date().toISOString();
    logs.value.last_sync_count = d.synced ?? 0;
    assets.value.catalog_product_count = d.synced ?? assets.value.catalog_product_count;
    const health = d.sync_health ?? "good";
    toast.add({
      severity: health === "good" ? "success" : health === "partial" ? "warn" : "error",
      summary: health === "good" ? "Sync Complete" : health === "partial" ? "Sync Partial" : "Sync Failed",
      detail: `${d.synced ?? 0} products synced to WhatsApp`,
      life: 4000,
    });
  } catch (e: any) {
    showError(e.message);
  } finally { syncing.value = false; }
}

// ─── Load logs ─────────────────────────────────────────────────────────────────
async function loadLogs() {
  logsLoading.value = true;
  try {
    const [catalogJson, convoJson] = await Promise.all([
      api("catalog_status", { id: props.record_id }),
      api("conversation_list", { id: props.record_id }),
    ]);
    if (catalogJson?.success) {
      logs.value.last_sync = catalogJson.data?.last_sync ?? null;
      logs.value.last_sync_count = catalogJson.data?.synced ?? null;
    }
    if (convoJson?.success && convoJson.data?.contacts?.length > 0) {
      const latest = convoJson.data.contacts.reduce((a: any, b: any) =>
        new Date(a.last_seen) > new Date(b.last_seen) ? a : b
      );
      logs.value.last_webhook = latest.last_seen ?? null;
      logs.value.last_webhook_from = latest.phone ?? null;
    }
  } finally { logsLoading.value = false; }
}

// ─── Mount ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  await loadAssets();
  await loadLogs();
});
</script>
