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
          <p class="text-xs" style="color: #667781;">Update your business profile settings</p>
        </div>
      </div>

      <!-- Record Switcher -->
      <div class="rounded-2xl mb-4 p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-semibold" style="color: #111b17;">Select Business Profile</label>
          <span class="text-xs px-2 py-0.5 rounded-full" style="background: #e7f8f4; color: #00a884;">{{ allRecords.length }} profiles</span>
        </div>
        <div v-if="listLoading" class="flex items-center gap-2 py-2" style="color: #667781;">
          <div class="w-4 h-4 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
          <span class="text-sm">Loading profiles...</span>
        </div>
        <div v-else class="flex flex-col gap-2 overflow-y-auto" style="max-height: 180px;">
          <button
            v-for="r in allRecords"
            :key="r.id"
            @click="selectRecord(r.id)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            :style="selectedId === r.id
              ? 'background: #e7f8f4; border: 1.5px solid #00a884;'
              : 'background: #f0f2f5; border: 1.5px solid transparent;'"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
              :style="selectedId === r.id ? 'background: #00a884;' : 'background: #ccd0d5;'">
              <img v-if="r.data?.logo" :src="r.data.logo" class="w-full h-full object-cover" @error="(e:any) => e.target.style.display='none'" />
              <span v-else class="text-white font-bold text-sm">{{ (r.data?.title || '?')[0].toUpperCase() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate" :style="selectedId === r.id ? 'color: #00a884;' : 'color: #111b17;'">
                {{ r.data?.title || 'Untitled' }}
              </p>
              <p class="text-xs truncate" style="color: #667781;">{{ r.data?.category || 'No category' }}</p>
            </div>
            <i v-if="selectedId === r.id" class="pi pi-check-circle flex-shrink-0" style="color: #00a884;" />
          </button>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div class="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-lg" style="color: #111b17;">Profile Settings</h2>
            <p class="text-sm" style="color: #667781;">Changes are saved to your WhatsApp Business profile</p>
          </div>
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #f0f2f5;">
            <i class="pi pi-cog text-sm" style="color: #667781;" />
          </div>
        </div>

        <!-- No profile selected -->
        <div v-if="!selectedId" class="flex flex-col items-center justify-center py-16 gap-2" style="color: #667781;">
          <i class="pi pi-arrow-up text-2xl" style="color: #ccd0d5;" />
          <p class="text-sm">Select a profile above to edit its settings</p>
        </div>

        <!-- Loading -->
        <div v-else-if="fetchLoading" class="flex flex-col items-center justify-center py-16 gap-3">
          <div class="w-10 h-10 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
          <p class="text-sm" style="color: #667781;">Loading profile...</p>
        </div>

        <!-- Form -->
        <div v-else class="p-6 flex flex-col gap-4">
          <!-- Logo preview -->
          <div class="flex items-center gap-4 p-4 rounded-xl" style="background: #f0f2f5; border: 1px solid #e9edef;">
            <div class="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style="background: #fff; border: 1px solid #e9edef;">
              <img v-if="form.logo" :src="form.logo" class="w-full h-full object-cover" @error="(e:any) => e.target.style.display='none'" />
              <i v-else class="pi pi-image text-xl" style="color: #ccd0d5;" />
            </div>
            <div class="flex-1">
              <label class="text-sm font-medium block mb-1.5" style="color: #3b4a54;">Logo URL</label>
              <InputText v-model="form.logo" placeholder="https://example.com/logo.png" class="w-full rounded-xl text-sm" :style="inputStyle" />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-medium" style="color: #3b4a54;">Business Title</label>
            <InputText v-model="form.title" placeholder="Business Title" class="w-full rounded-xl" :style="inputStyle" />
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

        <div v-if="selectedId && !fetchLoading" class="px-6 pb-6">
          <button
            @click="save"
            :disabled="saving"
            class="w-full rounded-xl font-semibold py-3 flex items-center justify-center gap-2"
            style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 10px rgba(0,168,132,0.25);"
          >
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" class="text-sm" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const toast = useToast();
const listLoading = ref(false);
const fetchLoading = ref(false);
const saving = ref(false);
const allRecords = ref<any[]>([]);
const selectedId = ref(props.record_id || new URLSearchParams(window.location.search).get("record_id") || "");
const form = ref({ logo: "", title: "", category: "", description: "" });
const inputStyle = "background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;";

const BASE_URL = "http://localhost:8000";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

onMounted(async () => {
  // load all records for the switcher
  listLoading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=list`, { method: "POST", headers: headers(), body: JSON.stringify({ user_id: props.user_id }) });
    const json = await res.json();
    allRecords.value = Array.isArray(json?.data) ? json.data : [];
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { listLoading.value = false; }

  // if a record_id was passed, load it immediately
  if (selectedId.value) await fetchProfile();
});

async function selectRecord(id: string) {
  selectedId.value = id;
  await fetchProfile();
}

async function fetchProfile() {
  fetchLoading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=get`, { method: "POST", headers: headers(), body: JSON.stringify({ id: selectedId.value }) });
    const json = await res.json();
    if (json?.success && json?.data) {
      const d = json.data?.data ?? json.data;
      form.value = { logo: d.logo ?? "", title: d.title ?? "", category: d.category ?? "", description: d.description ?? "" };
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Load Error", detail: e.message, life: 4000 });
  } finally { fetchLoading.value = false; }
}

async function save() {
  saving.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=update`, { method: "POST", headers: headers(), body: JSON.stringify({ id: selectedId.value, data: { ...form.value } }) });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Update failed");
    toast.add({ severity: "success", summary: "Saved!", detail: "Settings updated successfully", life: 3000 });
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { saving.value = false; }
}
</script>
