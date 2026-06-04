<template>
  <div class="min-h-screen p-6 flex items-start justify-center" style="background: #f5f6f7;">
    <Toast position="top-right" />

    <div class="w-full max-w-lg">
      <!-- Header -->
      <div class="mb-6 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Business</h1>
          <p class="text-xs" style="color: #667781;">Create a new business profile</p>
        </div>
      </div>

      <!-- Card -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);">
        <div class="px-6 pt-6 pb-2">
          <h2 class="font-semibold text-lg" style="color: #111b17;">Profile Details</h2>
          <p class="text-sm" style="color: #667781;">Fill in your WhatsApp Business information</p>
        </div>

        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Business Title <span style="color: #e53935;">*</span></label>
            <InputText v-model="form.title" placeholder="e.g. My Store" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Logo URL</label>
            <InputText v-model="form.logo" placeholder="https://example.com/logo.png" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Phone Number</label>
            <InputText v-model="form.phone" placeholder="+91 99999 99999" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Category</label>
            <InputText v-model="form.category" placeholder="e.g. Retail, Food, Tech" class="w-full rounded-xl" :style="inputStyle" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Description</label>
            <Textarea v-model="form.description" placeholder="Brief description of your business..." rows="3" class="w-full rounded-xl resize-none" :style="inputStyle" />
          </div>
        </div>

        <div class="px-6 pb-6">
          <button
            @click="submit"
            :disabled="loading"
            class="w-full rounded-xl font-semibold py-3 flex items-center justify-center gap-2"
            style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 10px rgba(0,168,132,0.25);"
          >
            <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-plus'" class="text-sm" />
            Create Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string }>();

const toast = useToast();
const loading = ref(false);
const form = ref({ title: "", logo: "", phone: "", category: "", description: "" });

const inputStyle = "background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;";

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;

async function submit() {
  if (!form.value.title) {
    toast.add({ severity: "warn", summary: "Required", detail: "Business title is required", life: 3000 });
    return;
  }
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` },
      body: JSON.stringify({ user_id: props.user_id, data: { ...form.value } }),
    });
    const json = await res.json();
    if (json?.success) {
      toast.add({ severity: "success", summary: "Created!", detail: "Business profile created successfully", life: 3000 });
      form.value = { title: "", logo: "", phone: "", category: "", description: "" };
    } else throw new Error(json?.message ?? "Unknown error");
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}
</script>
