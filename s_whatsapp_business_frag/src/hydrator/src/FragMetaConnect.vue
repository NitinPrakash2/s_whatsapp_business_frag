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
          <h1 class="text-xl font-bold" style="color: #111b17;">Meta Configuration</h1>
          <p class="text-xs" style="color: #667781;">Manage your WhatsApp Business API credentials</p>
        </div>
      </div>

      <!-- Status Bar -->
      <div class="rounded-2xl mb-4 px-4 py-3 flex items-center justify-between"
        :style="statusBanner.style">
        <div class="flex items-center gap-2">
          <i :class="statusBanner.icon" class="text-sm" />
          <span class="text-sm font-semibold">{{ statusBanner.text }}</span>
        </div>
        <span class="text-xs px-2.5 py-1 rounded-full font-semibold"
          :style="connectionStatus === 'connected'
            ? 'background: #00a884; color: #fff;'
            : connectionStatus === 'failed'
              ? 'background: #e53935; color: #fff;'
              : 'background: #667781; color: #fff;'">
          {{ connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'failed' ? 'Not Connected' : 'Unknown' }}
        </span>
      </div>

      <!-- Credentials Card -->
      <div class="rounded-2xl overflow-hidden mb-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <i class="pi pi-key text-sm" style="color: #667781;" />
          <h2 class="font-semibold text-sm" style="color: #111b17;">API Credentials</h2>
        </div>

        <div class="p-5 flex flex-col gap-4">
          <!-- Access Token -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Access Token</label>
            <div v-if="tokenSet && !form.meta_access_token"
              class="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style="background: #e7f8f4; border: 1px solid #b2dfdb;">
              <div class="flex items-center gap-2">
                <i class="pi pi-lock text-xs" style="color: #00a884;" />
                <span class="text-sm" style="color: #00a884;">Token saved — ••••••{{ tokenMasked }}</span>
              </div>
              <button @click="form.meta_access_token = ''" class="text-xs font-medium" style="color: #667781;">Update</button>
            </div>
            <div v-else class="relative">
              <InputText
                v-model="form.meta_access_token"
                :type="showToken ? 'text' : 'password'"
                placeholder="EAAxxxxxxxxxxxxxxx"
                class="w-full rounded-xl pr-10"
                :style="inputStyle"
              />
              <button @click="showToken = !showToken" class="absolute right-3 top-1/2 -translate-y-1/2">
                <i :class="showToken ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm" style="color: #667781;" />
              </button>
            </div>
          </div>

          <!-- Phone Number ID -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Phone Number ID</label>
            <InputText v-model="form.phone_number_id" placeholder="987654321098765" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <!-- WABA ID -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">WhatsApp Business Account ID (WABA ID)</label>
            <InputText v-model="form.waba_id" placeholder="123456789012345" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <!-- Catalog ID -->
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">
              Catalog ID
              <span class="text-xs font-normal ml-1" style="color: #667781;">(required for product sync)</span>
            </label>
            <InputText v-model="form.catalog_id" placeholder="112233445566778" class="w-full rounded-xl" :style="inputStyle" />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-5 pb-5 grid grid-cols-3 gap-2">
          <button @click="save" :disabled="saving"
            class="rounded-xl font-semibold py-2.5 flex items-center justify-center gap-2 text-sm"
            style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 8px rgba(0,168,132,0.2);">
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'" class="text-xs" />
            Save
          </button>
          <button @click="testConnection" :disabled="testing"
            class="rounded-xl font-semibold py-2.5 flex items-center justify-center gap-2 text-sm"
            style="background: #f0f2f5; color: #111b17; border: 1px solid #e9edef;">
            <i :class="testing ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'" class="text-xs" style="color: #00a884;" />
            Test
          </button>
          <button @click="syncProducts" :disabled="syncing"
            class="rounded-xl font-semibold py-2.5 flex items-center justify-center gap-2 text-sm"
            style="background: #f0f4ff; color: #6366f1; border: 1px solid #c7d2fe;">
            <i :class="syncing ? 'pi pi-spin pi-spinner' : 'pi pi-sync'" class="text-xs" />
            Sync
          </button>
        </div>
      </div>

      <!-- Test Result Card -->
      <div v-if="testResult" class="rounded-2xl p-5 mb-4" :style="testResult.cardStyle">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" :style="testResult.iconBg">
            <i :class="testResult.icon" class="text-sm" />
          </div>
          <span class="font-semibold" :style="testResult.titleStyle">{{ testResult.title }}</span>
        </div>
        <div v-if="testResult.data" class="flex flex-col gap-2">
          <div v-for="(val, key) in testResult.data" :key="key"
            class="flex items-center justify-between py-1.5 border-b" style="border-color: rgba(0,0,0,0.06);">
            <span class="text-xs font-medium capitalize" style="color: #667781;">{{ String(key).replace(/_/g,' ') }}</span>
            <span class="text-xs font-semibold" style="color: #111b17;">{{ val }}</span>
          </div>
        </div>
        <p v-else class="text-sm" :style="testResult.titleStyle" style="opacity:0.8;">{{ testResult.message }}</p>
      </div>

      <!-- Logs Card -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center justify-between border-b" style="border-color: #f0f2f5;">
          <div class="flex items-center gap-2">
            <i class="pi pi-list text-sm" style="color: #667781;" />
            <h2 class="font-semibold text-sm" style="color: #111b17;">Activity Log</h2>
          </div>
          <button @click="loadLogs" :disabled="logsLoading"
            class="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
            style="background: #f0f2f5; border: 1px solid #e9edef; color: #667781;">
            <i :class="logsLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" style="font-size: 0.6rem;" />
            Refresh
          </button>
        </div>

        <div v-if="logsLoading" class="flex items-center justify-center py-10">
          <div class="w-6 h-6 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
        </div>

        <div v-else class="divide-y" style="border-color: #f0f2f5;">
          <!-- Last Sync -->
          <div class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #f0f4ff;">
                <i class="pi pi-sync text-xs" style="color: #6366f1;" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #111b17;">Last Sync</p>
                <p class="text-xs" style="color: #667781;">Products synchronized to WhatsApp Catalog</p>
              </div>
            </div>
            <div class="text-right">
              <span v-if="logs.last_sync"
                class="text-xs px-2 py-0.5 rounded-full"
                style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
                {{ formatTime(logs.last_sync) }}
              </span>
              <span v-else class="text-xs" style="color: #ccd0d5;">Never</span>
              <p v-if="logs.last_sync_count" class="text-xs mt-0.5" style="color: #667781;">
                {{ logs.last_sync_count }} products
              </p>
            </div>
          </div>

          <!-- Last Webhook -->
          <div class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
                <i class="pi pi-arrow-down text-xs" style="color: #00a884;" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #111b17;">Last Webhook Activity</p>
                <p class="text-xs" style="color: #667781;">Last message received from WhatsApp</p>
              </div>
            </div>
            <div class="text-right">
              <span v-if="logs.last_webhook"
                class="text-xs px-2 py-0.5 rounded-full"
                style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
                {{ formatTime(logs.last_webhook) }}
              </span>
              <span v-else class="text-xs" style="color: #ccd0d5;">No activity yet</span>
              <p v-if="logs.last_webhook_from" class="text-xs mt-0.5" style="color: #667781;">
                from {{ logs.last_webhook_from }}
              </p>
            </div>
          </div>

          <!-- Last Test -->
          <div class="px-5 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #fff8e1;">
                <i class="pi pi-bolt text-xs" style="color: #f59e0b;" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #111b17;">Last Connection Test</p>
                <p class="text-xs" style="color: #667781;">Last time Meta API was tested</p>
              </div>
            </div>
            <div class="text-right">
              <span v-if="logs.last_test"
                class="text-xs px-2 py-0.5 rounded-full"
                :style="logs.last_test_success
                  ? 'background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;'
                  : 'background: #fff0f0; color: #e53935; border: 1px solid #ffcdd2;'">
                {{ logs.last_test_success ? 'Passed' : 'Failed' }} · {{ formatTime(logs.last_test) }}
              </span>
              <span v-else class="text-xs" style="color: #ccd0d5;">Never tested</span>
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
import InputText from "primevue/inputtext";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const toast = useToast();
const saving = ref(false);
const testing = ref(false);
const syncing = ref(false);
const logsLoading = ref(false);
const showToken = ref(false);
const connectionStatus = ref<"unknown" | "connected" | "failed" | "unconfigured">("unconfigured");
const testResult = ref<any>(null);
const tokenSet = ref(false);
const tokenMasked = ref("");
const logs = ref<any>({
  last_sync: null, last_sync_count: null,
  last_webhook: null, last_webhook_from: null,
  last_test: null, last_test_success: null,
});

const form = ref({ meta_access_token: "", waba_id: "", phone_number_id: "", catalog_id: "" });
const inputStyle = "background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;";

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const statusBanner = computed(() => {
  const map: Record<string, any> = {
    connected:    { style: "background: #e7f8f4; border: 1px solid #b2dfdb;", icon: "pi pi-check-circle", text: "Meta account connected" },
    failed:       { style: "background: #fff0f0; border: 1px solid #ffcdd2;", icon: "pi pi-times-circle", text: "Connection failed — check credentials" },
    unconfigured: { style: "background: #fff8e1; border: 1px solid #ffe082;", icon: "pi pi-exclamation-triangle", text: "Credentials not configured yet" },
    unknown:      { style: "background: #f0f2f5; border: 1px solid #e9edef;", icon: "pi pi-info-circle", text: "Run a test to verify connection" },
  };
  return map[connectionStatus.value];
});

function formatTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function loadConfig() {
  if (!props.record_id) return;
  try {
    const res = await fetch(`${apiUrl()}?typ=get_meta_config`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      const d = json.data?.data ?? json.data;
      form.value.meta_access_token = "";
      form.value.waba_id = d.waba_id ?? "";
      form.value.phone_number_id = d.phone_number_id ?? "";
      form.value.catalog_id = d.catalog_id ?? "";
      tokenSet.value = d.access_token_set ?? false;
      tokenMasked.value = (d.access_token_masked ?? "").slice(-6);
      if (d.access_token_set) connectionStatus.value = "unknown";
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Load Error", detail: e.message, life: 4000 });
  }
}

async function loadLogs() {
  logsLoading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=catalog_status`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      const d = json.data;
      logs.value.last_sync = d.last_sync ?? null;
      logs.value.last_sync_count = d.synced ?? null;
    }
    // load last webhook from conversation_list
    const res2 = await fetch(`${apiUrl()}?typ=conversation_list`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json2 = await res2.json();
    if (json2?.success && json2?.data?.contacts?.length > 0) {
      const latest = json2.data.contacts.reduce((a: any, b: any) =>
        new Date(a.last_seen) > new Date(b.last_seen) ? a : b
      );
      logs.value.last_webhook = latest.last_seen ?? null;
      logs.value.last_webhook_from = latest.phone ?? null;
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Log Error", detail: e.message, life: 4000 });
  } finally { logsLoading.value = false; }
}

async function save() {
  saving.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=save_meta_config`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({
        id: props.record_id,
        data: { ...form.value },
      }),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Save failed");
    toast.add({ severity: "success", summary: "Saved", detail: "Credentials saved successfully", life: 3000 });
    if (json?.warning) toast.add({ severity: "warn", summary: "Warning", detail: json.warning, life: 6000 });
    // reload to show masked token
    await loadConfig();
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { saving.value = false; }
}

async function testConnection() {
  testing.value = true;
  testResult.value = null;
  try {
    // save first
    const saveRes = await fetch(`${apiUrl()}?typ=save_meta_config`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, data: { ...form.value } }),
    });
    const saveJson = await saveRes.json();
    if (!saveJson?.success) throw new Error(saveJson?.message ?? "Save failed before test");
    toast.add({ severity: "info", summary: "Testing...", detail: "Credentials saved, testing connection", life: 2000 });

    // then test
    const res = await fetch(`${apiUrl()}?typ=meta_test`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success) {
      connectionStatus.value = "connected";
      logs.value.last_test = new Date().toISOString();
      logs.value.last_test_success = true;
      testResult.value = {
        title: "Connection Successful",
        icon: "pi pi-check text-white",
        iconBg: "background: #00a884;",
        cardStyle: "background: #e7f8f4; border: 1px solid #b2dfdb;",
        titleStyle: "color: #00a884;",
        data: json.data,
      };
    } else {
      throw new Error(json?.message ?? "Connection failed");
    }
  } catch (e: any) {
    connectionStatus.value = "failed";
    logs.value.last_test = new Date().toISOString();
    logs.value.last_test_success = false;
    testResult.value = {
      title: "Connection Failed",
      icon: "pi pi-times text-white",
      iconBg: "background: #e53935;",
      cardStyle: "background: #fff0f0; border: 1px solid #ffcdd2;",
      titleStyle: "color: #e53935;",
      message: e.message,
    };
  } finally { testing.value = false; }
}

async function syncProducts() {
  syncing.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=catalog_sync`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, sync_all: true }),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Sync failed");
    const d = json.data ?? {};
    logs.value.last_sync = d.last_sync ?? new Date().toISOString();
    logs.value.last_sync_count = d.synced ?? 0;
    const health = d.sync_health ?? "good";
    toast.add({
      severity: health === "good" ? "success" : health === "partial" ? "warn" : "error",
      summary: health === "good" ? "Sync Complete" : health === "partial" ? "Sync Partial" : "Sync Failed",
      detail: `${d.synced ?? 0} synced, ${d.failed ?? 0} failed`,
      life: 4000,
    });
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Sync Error", detail: e.message, life: 4000 });
  } finally { syncing.value = false; }
}

onMounted(async () => {
  await loadConfig();
  await loadLogs();
});
</script>
