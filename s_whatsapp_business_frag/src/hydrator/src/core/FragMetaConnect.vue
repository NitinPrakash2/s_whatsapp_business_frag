<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <!-- ─── Disconnect Confirmation Modal ─── -->
    <div
      v-if="disconnectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background:rgba(0,0,0,0.55); backdrop-filter:blur(4px);"
    >
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#e0e0e0]">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style="background:#fff0f0;">
            <i class="pi pi-exclamation-triangle text-lg" style="color:#e53935;" />
          </div>
          <h3 class="text-base font-bold" style="color:#111b17;">Disconnect Meta Account</h3>
        </div>
        <p class="text-sm mb-6 leading-relaxed" style="color:#667781;">
          This removes your seller-side connection only. Your Meta Business assets remain intact and you can reconnect at any time.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            @click="disconnectModal = false"
            class="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style="background:#f0f2f5; color:#667781;"
          >
            Cancel
          </button>
          <button
            @click="triggerDisconnect"
            :disabled="disconnecting"
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer"
            style="background:#e53935;"
          >
            <i :class="disconnecting ? 'pi pi-spin pi-spinner' : 'pi pi-sign-out'" class="text-xs" />
            {{ disconnecting ? 'Disconnecting…' : 'Disconnect' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Page Shell ─── -->
    <div class="max-w-xl mx-auto">

      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:#00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color:#111b17;">WhatsApp Business</h1>
          <p class="text-xs" style="color:#667781;">Connect and manage your Meta Business account</p>
        </div>
      </div>

      <!-- ─── STATE: LOADING (checking status on mount) ─── -->
      <div v-if="status === 'checking'"
        class="rounded-2xl p-12 flex flex-col items-center gap-4"
        style="background:#fff; border:1px solid #e0e0e0;"
      >
        <div class="w-12 h-12 rounded-full animate-spin"
          style="border:3px solid #e9edef; border-top-color:#00a884;" />
        <p class="text-sm font-medium" style="color:#111b17;">Checking connection status…</p>
      </div>

      <!-- ─── STATE: CONNECTING (redirect in progress) ─── -->
      <div v-else-if="status === 'connecting'"
        class="rounded-2xl p-12 flex flex-col items-center gap-4 text-center"
        style="background:#fff; border:1px solid #00a884; box-shadow:0 4px 20px rgba(0,168,132,0.1);"
      >
        <div class="w-14 h-14 rounded-full animate-spin"
          style="border:3px solid #e9edef; border-top-color:#00a884;" />
        <div>
          <p class="text-base font-bold" style="color:#111b17;">Connecting your Meta account…</p>
          <p class="text-sm mt-1" style="color:#667781;">
            Please complete the authorization in the Meta window.<br />
            You'll be redirected back here automatically.
          </p>
        </div>
        <button
          @click="status = 'disconnected'"
          class="text-xs cursor-pointer"
          style="color:#8696a0;"
        >
          Cancel
        </button>
      </div>

      <!-- ─── STATE: NOT CONNECTED ─── -->
      <div v-else-if="status === 'disconnected'">

        <!-- Error alert -->
        <div v-if="errorAlert"
          class="rounded-2xl p-4 mb-4 flex items-start gap-3"
          :style="alertStyle.banner"
        >
          <i :class="alertStyle.icon" class="text-sm mt-0.5 flex-shrink-0" :style="alertStyle.iconColor" />
          <div class="flex-1">
            <p class="text-sm font-semibold" :style="alertStyle.titleColor">{{ errorAlert.title }}</p>
            <p class="text-xs mt-0.5" :style="alertStyle.msgColor">{{ errorAlert.message }}</p>
          </div>
          <button @click="errorAlert = null" class="cursor-pointer flex-shrink-0">
            <i class="pi pi-times text-xs" style="color:#667781;" />
          </button>
        </div>

        <!-- Onboarding Card -->
        <div class="rounded-2xl overflow-hidden" style="background:#fff; border:1px solid #e0e0e0;">

          <!-- Hero -->
          <div class="px-8 pt-10 pb-8 flex flex-col items-center text-center gap-5">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center"
              style="background:linear-gradient(135deg,#e7f8f4,#f0f2f5);">
              <i class="pi pi-whatsapp text-4xl" style="color:#00a884;" />
            </div>
            <div>
              <h2 class="text-xl font-bold mb-2" style="color:#111b17;">Connect WhatsApp Business</h2>
              <p class="text-sm leading-relaxed" style="color:#667781; max-width:360px;">
                Connect your Meta account to automatically discover your WhatsApp Business account and product catalog.
              </p>
            </div>

            <!-- Primary CTA -->
            <button
              @click="startOAuth"
              :disabled="oauthLoading"
              class="flex items-center gap-3 px-7 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-all hover:scale-[1.02]"
              style="background:#00a884; border:none; box-shadow:0 4px 16px rgba(0,168,132,0.35);"
            >
              <i :class="oauthLoading ? 'pi pi-spin pi-spinner' : 'pi pi-whatsapp'" />
              {{ oauthLoading ? 'Preparing connection…' : 'Connect WhatsApp Business' }}
            </button>

            <p class="text-xs" style="color:#8696a0;">
              <i class="pi pi-lock text-[10px] mr-1" />
              Secure authorization via Meta Business API
            </p>
          </div>

          <!-- What gets connected -->
          <div class="border-t border-[#f0f2f5] px-6 py-5 grid grid-cols-3 gap-4">
            <div v-for="item in whatConnects" :key="item.label" class="flex flex-col items-center gap-2 text-center">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="item.iconBg">
                <i :class="item.icon" class="text-sm" :style="item.iconColor" />
              </div>
              <p class="text-xs font-semibold" style="color:#111b17;">{{ item.label }}</p>
              <p class="text-[10px]" style="color:#8696a0;">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── STATE: CONNECTED ─── -->
      <div v-else-if="status === 'connected'">

        <!-- Token Expiry Warning -->
        <div v-if="assets.token_days_left !== null && assets.token_days_left <= 7"
          class="rounded-2xl p-4 mb-4 flex items-start gap-3"
          style="background:#fff8e1; border:1px solid #ffe082;"
        >
          <i class="pi pi-exclamation-triangle text-sm mt-0.5" style="color:#f59e0b;" />
          <div class="flex-1">
            <p class="text-sm font-semibold" style="color:#f59e0b;">
              {{ assets.token_days_left <= 0 ? 'Token Expired!' : `Token expires in ${assets.token_days_left} days` }}
            </p>
            <p class="text-xs mt-0.5" style="color:#92700a;">Please reconnect your Meta account to continue syncing products.</p>
          </div>
          <button @click="startOAuth"
            class="text-xs px-3 py-1.5 rounded-lg font-semibold cursor-pointer flex-shrink-0"
            style="background:#f59e0b; color:#fff;">
            Reconnect
          </button>
        </div>

        <!-- Error alert (non-fatal, e.g. validate warning) -->
        <div v-if="errorAlert"
          class="rounded-2xl p-4 mb-4 flex items-start gap-3"
          :style="alertStyle.banner"
        >
          <i :class="alertStyle.icon" class="text-sm mt-0.5 flex-shrink-0" :style="alertStyle.iconColor" />
          <div class="flex-1">
            <p class="text-sm font-semibold" :style="alertStyle.titleColor">{{ errorAlert.title }}</p>
            <p class="text-xs mt-0.5" :style="alertStyle.msgColor">{{ errorAlert.message }}</p>
          </div>
          <button @click="errorAlert = null" class="cursor-pointer flex-shrink-0">
            <i class="pi pi-times text-xs" style="color:#667781;" />
          </button>
        </div>

        <!-- Connected Card -->
        <div class="rounded-2xl overflow-hidden" style="background:#fff; border:1px solid #e0e0e0;">

          <!-- Connected Header -->
          <div class="px-6 pt-6 pb-5 flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style="background:#e7f8f4; border:2px solid #00a884;">
              <i class="pi pi-whatsapp text-2xl" style="color:#00a884;" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full text-white"
                  style="background:#00a884;">● Connected</span>
                <span class="text-xs" style="color:#667781;">
                  Since {{ formatTime(assets.connected_at) }}
                </span>
              </div>
              <p class="text-lg font-bold truncate" style="color:#111b17;">
                {{ assets.business_name || 'Your WhatsApp Business' }}
              </p>
              <p class="text-sm" style="color:#667781;">{{ assets.phone_number }}</p>
            </div>
            <button
              @click="refreshStatus"
              :disabled="refreshing"
              class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0 cursor-pointer"
              style="background:#f0f2f5; border:1px solid #e9edef; color:#111b17;"
            >
              <i :class="refreshing ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-[10px]" style="color:#00a884;" />
              Refresh
            </button>
          </div>

          <!-- Asset Cards -->
          <div class="grid grid-cols-2 gap-3 px-6 pb-5">

            <!-- Business Account -->
            <div class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                  <i class="pi pi-building text-[10px]" style="color:#00a884;" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:#8696a0;">Business Account</span>
              </div>
              <p class="text-sm font-bold truncate" style="color:#111b17;">{{ assets.waba_name || '—' }}</p>
              <span class="text-[10px] px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold"
                style="background:#e7f8f4; color:#00a884;">Verified</span>
            </div>

            <!-- Phone Number -->
            <div class="rounded-xl p-4" style="background:#f9fafb; border:1px solid #f0f2f5;">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#e7f8f4;">
                  <i class="pi pi-phone text-[10px]" style="color:#00a884;" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:#8696a0;">Phone Number</span>
              </div>
              <p class="text-sm font-bold" style="color:#111b17;">{{ assets.phone_number || '—' }}</p>
              <span class="text-[10px] px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold"
                style="background:#e7f8f4; color:#00a884;">Active</span>
            </div>

            <!-- Product Catalog — full width -->
            <div class="rounded-xl p-4 col-span-2" style="background:#f9fafb; border:1px solid #f0f2f5;">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background:#f0f4ff;">
                  <i class="pi pi-box text-[10px]" style="color:#6366f1;" />
                </div>
                <span class="text-[10px] font-semibold uppercase tracking-wider" style="color:#8696a0;">Product Catalog</span>
              </div>
              <div v-if="assets.catalog_name" class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold" style="color:#111b17;">{{ assets.catalog_name }}</p>
                  <p class="text-xs mt-0.5" style="color:#667781;">{{ assets.catalog_product_count ?? 0 }} products</p>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded font-semibold"
                  style="background:#e7f8f4; color:#00a884;">Connected</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <i class="pi pi-exclamation-triangle text-xs" style="color:#f59e0b;" />
                <p class="text-sm" style="color:#f59e0b;">No catalog found — sync products to create one</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 flex flex-col sm:flex-row gap-3">
            <button
              @click="navigate('FragCatalogSync')"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-all hover:scale-[1.01]"
              style="background:#00a884; box-shadow:0 2px 8px rgba(0,168,132,0.25);"
            >
              <i class="pi pi-sync text-xs" />
              Sync Products
            </button>
            <button
              @click="validateConnection"
              :disabled="validating"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style="background:#f0f4ff; color:#6366f1; border:1px solid #e0e7ff;"
            >
              <i :class="validating ? 'pi pi-spin pi-spinner' : 'pi pi-verified'" class="text-xs" />
              {{ validating ? 'Validating…' : 'Validate Connection' }}
            </button>
            <button
              @click="disconnectModal = true"
              class="px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style="background:#fff0f0; color:#e53935; border:1px solid #ffcdd2;"
            >
              Disconnect
            </button>
          </div>
        </div>

        <!-- ─── Manual IDs Form (shown when WABA/catalog not auto-discovered) ─── -->
        <div v-if="showManualForm"
          class="rounded-2xl p-5 mt-4"
          style="background:#fff; border:1px solid #ffe082;"
        >
          <div class="flex items-center gap-2 mb-1">
            <i class="pi pi-info-circle text-sm" style="color:#f59e0b;" />
            <p class="text-sm font-bold" style="color:#111b17;">Complete Your Setup</p>
          </div>
          <p class="text-xs mb-4" style="color:#667781;">
            We couldn't auto-discover your WhatsApp Business IDs. Please enter them manually from your
            <a href="https://business.facebook.com/settings/whatsapp-business-accounts" target="_blank" style="color:#00a884;">Meta Business Manager</a>.
          </p>
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">WABA ID (WhatsApp Business Account ID)</label>
              <input v-model="manualIds.waba_id" type="text" placeholder="e.g. 1415340977276784"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Phone Number ID</label>
              <input v-model="manualIds.phone_number_id" type="text" placeholder="e.g. 1070991472774265"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
            <div>
              <label class="text-xs font-semibold mb-1 block" style="color:#667781;">Catalog ID</label>
              <input v-model="manualIds.catalog_id" type="text" placeholder="e.g. 839145555943921"
                class="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style="border:1px solid #e0e0e0; background:#f9fafb; color:#111b17;" />
            </div>
            <div class="flex gap-2 pt-1">
              <button @click="saveManualIds" :disabled="manualSaving"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
                style="background:#00a884;">
                <i :class="manualSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" class="text-xs" />
                {{ manualSaving ? 'Saving…' : 'Save & Connect' }}
              </button>
              <button @click="showManualForm = false"
                class="px-4 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
                style="background:#f0f2f5; color:#667781;">
                Skip
              </button>
            </div>
          </div>
        </div>

        <!-- Validation Result -->
        <div v-if="validationResult"
          class="rounded-2xl p-5 mt-4"
          style="background:#fff; border:1px solid #e0e0e0;"
        >
          <div class="flex items-center gap-2 mb-4 pb-3 border-b border-[#f0f2f5]">
            <i class="pi pi-shield text-sm" style="color:#00a884;" />
            <h2 class="font-bold text-sm" style="color:#111b17;">Connection Health</h2>
            <span class="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
              :style="validationResult.all_passed
                ? 'background:#e7f8f4; color:#00a884; border:1px solid #b2dfdb;'
                : 'background:#fff8e1; color:#f59e0b; border:1px solid #ffe082;'"
            >
              {{ validationResult.all_passed ? 'All Checks Passed' : 'Issues Found' }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="check in validationResult.checks" :key="check.label"
              class="flex items-center justify-between p-3 rounded-xl border"
              :style="check.passed
                ? 'background:#f8fff8; border-color:#b2dfdb;'
                : 'background:#fff8f8; border-color:#ffcdd2;'"
            >
              <div class="flex items-center gap-2">
                <i :class="check.icon" class="text-xs" :style="check.iconColor" />
                <span class="text-xs font-semibold" style="color:#111b17;">{{ check.label }}</span>
              </div>
              <span class="text-xs font-bold"
                :style="check.passed ? 'color:#00a884;' : 'color:#e53935;'">
                {{ check.passed ? 'OK' : 'Fail' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── STATE: ERROR (fatal, e.g. OAuth returned error param) ─── -->
      <div v-else-if="status === 'error'"
        class="rounded-2xl p-10 flex flex-col items-center text-center gap-4"
        style="background:#fff; border:1px solid #e0e0e0;"
      >
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:#fff0f0;">
          <i class="pi pi-times-circle text-2xl" style="color:#e53935;" />
        </div>
        <div>
          <p class="text-base font-bold mb-1" style="color:#e53935;">Connection Failed</p>
          <p class="text-sm" style="color:#667781; max-width:320px;">{{ fatalErrorMsg }}</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="retryOAuth"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white cursor-pointer"
            style="background:#00a884;"
          >
            <i class="pi pi-refresh text-xs" />
            Try Again
          </button>
          <button
            @click="status = 'disconnected'; fatalErrorMsg = ''"
            class="px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer"
            style="background:#f0f2f5; color:#667781;"
          >
            Cancel
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface Assets {
  business_name: string;
  waba_name: string;
  phone_number: string;
  catalog_name: string;
  catalog_product_count: number;
  connected_at: string;
  waba_id: string;
  phone_number_id: string;
  catalog_id: string;
  token_days_left: number | null;
}

interface ErrorAlert {
  title: string;
  message: string;
  type: "permission" | "token" | "catalog" | "network" | "unknown";
}

interface ValidationResult {
  all_passed: boolean;
  checks: { label: string; passed: boolean; icon: string; iconColor: string }[];
}

type Status = "checking" | "connecting" | "disconnected" | "connected" | "error";

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
const status = ref<Status>("checking");
const oauthLoading = ref(false);
const refreshing = ref(false);
const validating = ref(false);
const disconnecting = ref(false);
const disconnectModal = ref(false);
const fatalErrorMsg = ref("");
const errorAlert = ref<ErrorAlert | null>(null);
const validationResult = ref<ValidationResult | null>(null);

const assets = ref<Assets>({
  business_name: "", waba_name: "", phone_number: "",
  catalog_name: "", catalog_product_count: 0, connected_at: "",
  waba_id: "", phone_number_id: "", catalog_id: "", token_days_left: null,
});
const showManualForm = ref(false);
const manualSaving = ref(false);
const manualIds = ref({ waba_id: "", phone_number_id: "", catalog_id: "" });

// ─── Static UI data ───────────────────────────────────────────────────────────
const whatConnects = [
  { label: "WhatsApp Business", desc: "Auto-discovered", icon: "pi pi-whatsapp", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
  { label: "Phone Number", desc: "Auto-assigned", icon: "pi pi-phone", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
  { label: "Product Catalog", desc: "Auto-linked", icon: "pi pi-box", iconBg: "background:#f0f4ff;", iconColor: "color:#6366f1;" },
];

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
const alertStyle = computed(() => {
  const t = errorAlert.value?.type;
  if (t === "token" || t === "permission") {
    return {
      banner: "background:#fff0f0; border:1px solid #ffcdd2;",
      icon: "pi pi-lock",
      iconColor: "color:#e53935;",
      titleColor: "color:#e53935;",
      msgColor: "color:#b71c1c;",
    };
  }
  if (t === "catalog") {
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

// ─── OAuth Flow ───────────────────────────────────────────────────────────────
async function startOAuth(): Promise<void> {
  oauthLoading.value = true;
  errorAlert.value = null;
  try {
    // Build the frontend URL seller returns to after OAuth
    const frontendRedirectUrl = `${window.location.origin}/fragmetaconnect`;

    // Backend callback URL (registered in Meta Developer Console)
    const backendCallbackUrl = window.location.hostname === "localhost"
      ? "http://localhost:8000/client-public/api/meta/oauth/callback"
      : "https://fastapi.dryutil.1mn.io/client-public/api/meta/oauth/callback";

    // state format: "<record_id>|<frontend_redirect_url>"
    const state = `${props.record_id}|${frontendRedirectUrl}`;

    // use public route — no JWT needed for OAuth start
    const baseUrl = window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://fastapi.dryutil.1mn.io";
    const res = await fetch(`${baseUrl}/client-public/api/wa/${props.project}/${props.instance}/oauth-start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: props.record_id, redirect_uri: backendCallbackUrl, state }),
    });
    const json = await res.json();
    if (!json?.success || !json?.data?.auth_url) {
      throw new Error(json?.message ?? "Could not start authorization.");
    }
    status.value = "connecting";
    await new Promise(r => setTimeout(r, 300));
    window.location.href = json.data.auth_url;
  } catch (e: any) {
    oauthLoading.value = false;
    status.value = "disconnected";
    errorAlert.value = classifyError(e.message);
  }
}

async function retryOAuth(): Promise<void> {
  status.value = "disconnected";
  fatalErrorMsg.value = "";
  await startOAuth();
}

// ─── Connection Status ────────────────────────────────────────────────────────
async function checkConnectionStatus(): Promise<void> {
  try {
    const json = await api("meta_connection_status");
    if (json?.success && json?.data) {
      const d = json.data;
      const connected = d.connected ?? d.meta_connected ?? d.access_token_set ?? false;
      if (connected) {
        mapAssets(d);
        status.value = "connected";
      } else {
        status.value = "disconnected";
      }
    } else {
      status.value = "disconnected";
    }
  } catch (e: any) {
    // If status check fails, default to disconnected — don't block the page
    status.value = "disconnected";
    errorAlert.value = classifyError(e.message);
  }
}

async function refreshStatus(): Promise<void> {
  refreshing.value = true;
  errorAlert.value = null;
  validationResult.value = null;
  try {
    const json = await api("meta_connection_status");
    if (json?.success && json?.data) {
      mapAssets(json.data);
      status.value = "connected";
      toast.add({ severity: "success", summary: "Refreshed", detail: "Connection details updated.", life: 3000 });
    }
  } catch (e: any) {
    errorAlert.value = classifyError(e.message);
  } finally {
    refreshing.value = false;
  }
}

// ─── Validate ─────────────────────────────────────────────────────────────────
async function validateConnection(): Promise<void> {
  validating.value = true;
  errorAlert.value = null;
  try {
    const json = await api("catalog_validate");
    if (json?.success && json?.data) {
      const d = json.data;
      const checks = [
        { label: "Meta Connected",    passed: d.meta_connected ?? false,     icon: "pi pi-facebook",  iconColor: "color:#1877f2;" },
        { label: "Catalog Accessible", passed: d.catalog_accessible ?? false, icon: "pi pi-box",       iconColor: "color:#6366f1;" },
        { label: "WABA Accessible",   passed: d.waba_connected ?? false,      icon: "pi pi-whatsapp",  iconColor: "color:#00a884;" },
        { label: "Permissions Valid", passed: d.permissions_valid ?? false,   icon: "pi pi-shield",    iconColor: "color:#f59e0b;" },
      ];
      const all_passed = checks.every(c => c.passed);
      validationResult.value = { all_passed, checks };
      toast.add({
        severity: all_passed ? "success" : "warn",
        summary: all_passed ? "All Checks Passed" : "Some Checks Failed",
        detail: all_passed ? "Your Meta integration is fully healthy." : "Review the health check results below.",
        life: 4000,
      });
    }
  } catch (e: any) {
    errorAlert.value = classifyError(e.message);
  } finally {
    validating.value = false;
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────
async function triggerDisconnect(): Promise<void> {
  disconnecting.value = true;
  try {
    try { await api("meta_disconnect"); } catch { /* non-fatal */ }

    assets.value = { business_name: "", waba_name: "", phone_number: "", catalog_name: "", catalog_product_count: 0, connected_at: "" };
    validationResult.value = null;
    errorAlert.value = null;
    status.value = "disconnected";

    toast.add({ severity: "info", summary: "Disconnected", detail: "Seller-side connection records removed.", life: 4000 });
  } finally {
    disconnecting.value = false;
    disconnectModal.value = false;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapAssets(d: any): void {
  assets.value = {
    business_name: d.business_name ?? d.display_name ?? "",
    waba_name: d.waba_name ?? d.business_name ?? "WhatsApp Business Account",
    phone_number: d.phone_number ?? d.display_phone_number ?? "",
    catalog_name: d.catalog_name ?? "",
    catalog_product_count: d.catalog_product_count ?? d.total_catalog_products ?? 0,
    connected_at: d.connected_at ?? d.last_connected ?? "",
    waba_id: d.waba_id ?? "",
    phone_number_id: d.phone_number_id ?? "",
    catalog_id: d.catalog_id ?? "",
    token_days_left: d.token_days_left ?? null,
  };
  showManualForm.value = !d.waba_id || !d.phone_number_id || !d.catalog_id;
  // pre-fill manual form with existing values if partially set
  if (showManualForm.value) {
    manualIds.value = {
      waba_id: d.waba_id ?? "",
      phone_number_id: d.phone_number_id ?? "",
      catalog_id: d.catalog_id ?? "",
    };
  }
}

async function saveManualIds(): Promise<void> {
  if (!manualIds.value.waba_id || !manualIds.value.phone_number_id || !manualIds.value.catalog_id) {
    toast.add({ severity: "warn", summary: "Missing Fields", detail: "Please fill all 3 fields.", life: 3000 });
    return;
  }
  manualSaving.value = true;
  try {
    const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8000" : "https://fastapi.dryutil.1mn.io";
    const res = await fetch(`${baseUrl}/client-public/api/wa/${props.project}/${props.instance}/meta-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: props.record_id, meta: { ...manualIds.value } }),
    });
    const json = await res.json();
    if (json?.success) {
      showManualForm.value = false;
      await refreshStatus();
      toast.add({ severity: "success", summary: "Saved!", detail: "IDs saved. Your WhatsApp Shop is ready.", life: 4000 });
    } else throw new Error(json?.message ?? "Save failed");
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Save Failed", detail: e.message, life: 4000 });
  } finally {
    manualSaving.value = false;
  }
}

function classifyError(message: string): ErrorAlert {
  const m = (message ?? "").toLowerCase();
  if (m.includes("token") && m.includes("expired"))
    return { type: "token", title: "Session Expired", message: "Your Meta session has expired. Please reconnect." };
  if (m.includes("permission") || m.includes("scope") || m.includes("403") || m.includes("denied"))
    return { type: "permission", title: "Permission Denied", message: "Meta permissions were not granted. Please try again and accept all requested permissions." };
  if (m.includes("catalog") && (m.includes("not found") || m.includes("missing")))
    return { type: "catalog", title: "Catalog Not Found", message: "No product catalog was found on your Meta account. Please create one in Meta Business Manager first." };
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout"))
    return { type: "network", title: "Connection Error", message: "Unable to reach the server. Please check your internet connection and try again." };
  return { type: "unknown", title: "Something Went Wrong", message: message || "An unexpected error occurred. Please try again." };
}

function formatTime(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return `Today, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString())
    return `Yesterday, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function navigate(frag: string): void {
  window.history.pushState(null, "", `/${frag.toLowerCase()}`);
  window.dispatchEvent(new Event("popstate"));
}

// ─── OAuth Callback Detection ─────────────────────────────────────────────────
function handleOAuthReturn(): boolean {
  const params = new URLSearchParams(window.location.search);

  // Backend redirected back with ?connected=true after successful OAuth
  if (params.get("connected") === "true") {
    window.history.replaceState({}, "", window.location.pathname);
    toast.add({ severity: "success", summary: "Account Connected!", detail: "Your Meta account was connected successfully.", life: 5000 });
    return true; // trigger checkConnectionStatus
  }

  // Backend redirected back with ?error=... after failed OAuth
  const oauthError = params.get("error") || params.get("error_message");
  if (oauthError) {
    window.history.replaceState({}, "", window.location.pathname);
    fatalErrorMsg.value = decodeURIComponent(oauthError).replace(/_/g, " ");
    status.value = "error";
    return false;
  }

  return false;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  const isOAuthReturn = handleOAuthReturn();
  // Always check connection status on mount — covers both fresh load and OAuth return
  await checkConnectionStatus();
  if (isOAuthReturn && status.value !== "connected") {
    // OAuth claimed success but status check says not connected — show warning
    toast.add({ severity: "warn", summary: "Connection Incomplete", detail: "Please try connecting again.", life: 5000 });
  }
});
</script>
