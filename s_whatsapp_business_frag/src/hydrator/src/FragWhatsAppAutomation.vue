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
          <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Automation</h1>
          <p class="text-xs" style="color: #667781;">Configure automated message responses</p>
        </div>
      </div>
      <button @click="saveAll" :disabled="saving"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 8px rgba(0,168,132,0.25);">
        <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'" class="text-xs" />
        Save All
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
      <p class="text-sm" style="color: #667781;">Loading automation config...</p>
    </div>

    <div v-else class="flex flex-col gap-4">

      <!-- Welcome Message -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-star text-xs" style="color: #00a884;" />
          </div>
          <div>
            <h2 class="font-semibold text-sm" style="color: #111b17;">Welcome Message</h2>
            <p class="text-xs" style="color: #667781;">Sent when a customer messages for the first time</p>
          </div>
        </div>
        <div class="p-5">
          <Textarea v-model="form.welcome_message" rows="3" placeholder="Hi! Welcome to our store. How can I help you today?"
            class="w-full rounded-xl resize-none" :style="inputStyle" />
          <p class="text-xs mt-2" style="color: #667781;">Use <code style="background:#f0f2f5; padding:1px 4px; border-radius:4px;">{{name}}</code> to insert customer name</p>
          <div class="mt-2 px-3 py-2 rounded-xl flex items-start gap-2" style="background: #fff8e1; border: 1px solid #ffe082;">
            <i class="pi pi-info-circle text-xs mt-0.5 flex-shrink-0" style="color: #f59e0b;" />
            <p class="text-xs" style="color: #92700a;">First-time customers receive only the welcome message. They must send a second message to get product replies. This is intentional.</p>
          </div>
        </div>
      </div>

      <!-- Default Reply -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-reply text-xs" style="color: #00a884;" />
          </div>
          <div>
            <h2 class="font-semibold text-sm" style="color: #111b17;">Default Reply</h2>
            <p class="text-xs" style="color: #667781;">Sent when no matching product or category is found</p>
          </div>
        </div>
        <div class="p-5">
          <Textarea v-model="form.default_reply" rows="3" placeholder="Sorry, I couldn't find what you're looking for. Try searching with a product name or category."
            class="w-full rounded-xl resize-none" :style="inputStyle" />
        </div>
      </div>

      <!-- Product Response Template -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-box text-xs" style="color: #00a884;" />
          </div>
          <div>
            <h2 class="font-semibold text-sm" style="color: #111b17;">Product Response Template</h2>
            <p class="text-xs" style="color: #667781;">Template used when sending a product to a customer</p>
          </div>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <Textarea v-model="form.product_template" rows="4"
            placeholder="🛍️ *{{product_name}}*&#10;💰 Price: ₹{{price}}&#10;📦 {{description}}&#10;&#10;Reply *BUY* to order"
            class="w-full rounded-xl resize-none" :style="inputStyle" />
          <div class="flex flex-wrap gap-2">
            <span class="text-xs" style="color: #667781;">Available variables:</span>
            <code v-for="v in productVars" :key="v"
              @click="insertVar('product_template', v)"
              class="text-xs px-2 py-0.5 rounded-full cursor-pointer"
              style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
              {{ v }}
            </code>
          </div>
        </div>
      </div>

      <!-- Category Response Template -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-list text-xs" style="color: #00a884;" />
          </div>
          <div>
            <h2 class="font-semibold text-sm" style="color: #111b17;">Category Response Template</h2>
            <p class="text-xs" style="color: #667781;">Sent when customer asks about a product category</p>
          </div>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <Textarea v-model="form.category_template" rows="4"
            placeholder="📂 *{{category_name}}* — {{product_count}} products available&#10;&#10;{{product_list}}&#10;&#10;Reply with a product name to see details"
            class="w-full rounded-xl resize-none" :style="inputStyle" />
          <div class="flex flex-wrap gap-2">
            <span class="text-xs" style="color: #667781;">Available variables:</span>
            <code v-for="v in categoryVars" :key="v"
              @click="insertVar('category_template', v)"
              class="text-xs px-2 py-0.5 rounded-full cursor-pointer"
              style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
              {{ v }}
            </code>
          </div>
        </div>
      </div>

      <!-- Automation Toggles -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="px-5 py-4 flex items-center gap-2 border-b" style="border-color: #f0f2f5;">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-cog text-xs" style="color: #00a884;" />
          </div>
          <h2 class="font-semibold text-sm" style="color: #111b17;">Automation Settings</h2>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div v-for="toggle in toggles" :key="toggle.key"
            class="flex items-center justify-between py-2 border-b last:border-0" style="border-color: #f0f2f5;">
            <div>
              <p class="text-sm font-medium" style="color: #111b17;">{{ toggle.label }}</p>
              <p class="text-xs" style="color: #667781;">{{ toggle.sub }}</p>
            </div>
            <button @click="form.toggles[toggle.key] = !form.toggles[toggle.key]"
              class="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
              :style="form.toggles[toggle.key] ? 'background:#00a884;' : 'background:#ccd0d5;'">
              <div class="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow"
                :style="form.toggles[toggle.key] ? 'left: calc(100% - 1.375rem);' : 'left: 2px;'" />
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import Textarea from "primevue/textarea";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const toast = useToast();
const loading = ref(false);
const saving = ref(false);

const form = ref<any>({
  welcome_message: "",
  default_reply: "",
  product_template: "",
  category_template: "",
  toggles: {
    auto_reply: true,
    product_search: true,
  },
});

const inputStyle = "background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;";
const productVars = ["{{product_name}}", "{{price}}", "{{description}}", "{{image_url}}", "{{availability}}"];
const categoryVars = ["{{category_name}}", "{{product_count}}", "{{product_list}}"];

const toggles = [
  { key: "auto_reply",     label: "Auto Reply",          sub: "Automatically reply to incoming messages" },
  { key: "product_search", label: "Product Search",       sub: "Match customer message to products from product_dir" },
];

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

function insertVar(field: string, variable: string) {
  form.value[field] = (form.value[field] || "") + variable;
}

onMounted(async () => {
  if (!props.record_id) return;
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=get_automation_config`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success && json?.data) {
      const d = json.data?.data ?? json.data;
      Object.keys(form.value).forEach(k => { if (d[k] !== undefined) form.value[k] = d[k]; });
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Load Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
});

async function saveAll() {
  saving.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=save_automation_config`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, data: { ...form.value } }),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Save failed");
    toast.add({ severity: "success", summary: "Saved", detail: "Automation config saved successfully", life: 3000 });
    if (json?.warning) toast.add({ severity: "warn", summary: "Warning", detail: json.warning, life: 6000 });
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { saving.value = false; }
}
</script>
