<template>
  <div class="min-h-screen p-6" style="background: #f5f6f7;">
    <Toast position="top-right" />
    <ConfirmDialog />

    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: #00a884;">
          <i class="pi pi-whatsapp text-white text-lg" />
        </div>
        <div>
          <h1 class="text-xl font-bold" style="color: #111b17;">WhatsApp Business</h1>
          <p class="text-xs" style="color: #667781;">Manage all business profiles</p>
        </div>
      </div>
      <div class="flex items-center gap-2 rounded-xl px-3 py-2" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <i class="pi pi-users text-sm" style="color: #667781;" />
        <span class="text-sm font-medium" style="color: #111b17;">{{ records.length }} profiles</span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);">
      <DataTable
        :value="records"
        :loading="loading"
        :paginator="records.length > 10"
        :rows="10"
        class="wa-table"
        :pt="{
          root: { style: 'background: #fff; color: #111b17;' },
          table: { style: 'background: #fff;' },
          thead: { style: 'background: #f0f2f5;' },
          headerRow: { style: 'background: #f0f2f5;' },
          headerCell: { style: 'background: #f0f2f5; color: #667781; border-bottom: 1px solid #e9edef; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;' },
          bodyRow: { style: 'background: #fff; border-bottom: 1px solid #f0f2f5;' },
          bodyCell: { style: 'background: #fff; color: #111b17;' },
          paginator: { style: 'background: #fff; border-top: 1px solid #e0e0e0; color: #667781;' },
        }"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center py-16" style="color: #667781;">
            <i class="pi pi-inbox text-4xl mb-3" style="color: #ccd0d5;" />
            <p class="font-medium">No business profiles yet</p>
            <p class="text-sm mt-1">Create your first profile to get started</p>
          </div>
        </template>

        <Column header="Business" style="min-width:200px">
          <template #body="{ data: row }">
            <div class="flex items-center gap-3 py-1">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style="background: #e7f8f4; border: 1px solid #b2dfdb;">
                <img v-if="row.data?.logo_url || row.data?.logo" :src="row.data?.logo_url || row.data?.logo" class="w-full h-full object-cover rounded-xl" @error="(e:any) => e.target.style.display='none'" />
                <span v-else class="font-bold text-sm" style="color: #00a884;">{{ (row.data?.title || "?")[0].toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-semibold text-sm" style="color: #111b17;">{{ row.data?.title || "—" }}</p>
                <p class="text-xs" style="color: #667781;">{{ row.data?.description?.slice(0,40) || "No description" }}</p>
              </div>
            </div>
          </template>
        </Column>

        <Column header="Phone" style="min-width:150px">
          <template #body="{ data: row }">
            <div class="flex items-center gap-2">
              <i class="pi pi-phone text-xs" style="color: #00a884;" />
              <span class="text-sm" style="color: #3b4a54;">{{ row.data?.phone || "—" }}</span>
            </div>
          </template>
        </Column>

        <Column header="Category" style="min-width:130px">
          <template #body="{ data: row }">
            <span v-if="row.data?.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
              {{ row.data.category }}
            </span>
            <span v-else class="text-sm" style="color: #ccd0d5;">—</span>
          </template>
        </Column>

        <Column header="Actions" style="width:130px">
          <template #body="{ data: row }">
            <div class="flex items-center gap-1">
              <button @click="openEdit(row)" title="Edit" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style="background: #e7f8f4; border: 1px solid #b2dfdb;">
                <i class="pi pi-pencil text-xs" style="color: #00a884;" />
              </button>
              <button @click="goSettings(row)" title="Settings" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style="background: #f0f4ff; border: 1px solid #c7d2fe;">
                <i class="pi pi-cog text-xs" style="color: #6366f1;" />
              </button>
              <button @click="confirmDelete(row)" title="Delete" class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style="background: #fff0f0; border: 1px solid #ffcdd2;">
                <i class="pi pi-trash text-xs" style="color: #e53935;" />
              </button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:visible="editVisible" modal :style="{ width: '460px', background: '#fff', border: '1px solid #e9edef', borderRadius: '1rem' }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-pencil text-sm" style="color: #00a884;" />
          </div>
          <span class="font-semibold" style="color: #111b17;">Edit Profile</span>
        </div>
      </template>
      <div class="flex flex-col gap-4 pt-2">
        <!-- Logo preview -->
        <div class="flex items-center gap-4 p-3 rounded-xl" style="background: #f0f2f5; border: 1px solid #e9edef;">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0" style="background: #fff; border: 1px solid #e9edef;">
            <img v-if="editForm.logo" :src="editForm.logo" class="w-full h-full object-cover" @error="(e:any) => e.target.style.display='none'" />
            <i v-else class="pi pi-image" style="color: #ccd0d5;" />
          </div>
          <div class="flex-1">
            <label class="text-sm font-medium block mb-1.5" style="color: #3b4a54;">Logo URL</label>
            <InputText v-model="editForm.logo" placeholder="https://example.com/logo.png" class="w-full rounded-xl text-sm" :style="inputStyle" />
          </div>
        </div>
        <div v-for="(placeholder, field) in fieldsWithoutLogo" :key="field" class="flex flex-col gap-1.5">
          <label class="text-sm font-medium" style="color: #3b4a54;">{{ placeholder }}</label>
          <InputText v-if="field !== 'description'" v-model="editForm[field]" :placeholder="placeholder" class="w-full rounded-xl" :style="inputStyle" />
          <Textarea v-else v-model="editForm[field]" :placeholder="placeholder" rows="3" class="w-full rounded-xl resize-none" :style="inputStyle" />
        </div>
      </div>
      <template #footer>
        <div class="flex items-center justify-end gap-2 pt-1">
          <button @click="editVisible = false" class="rounded-lg text-sm font-medium px-4 py-2" style="background: #fff; border: 1px solid #e9edef; color: #667781;">
            Cancel
          </button>
          <button @click="saveEdit" :disabled="saving" class="rounded-lg text-sm font-semibold px-4 py-2 flex items-center gap-2" style="background: #00a884; color: #fff; border: none; box-shadow: 0 2px 8px rgba(0,168,132,0.25); white-space: nowrap;">
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" class="text-xs" />
            Save changes
          </button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string }>();

const toast = useToast();
const confirm = useConfirm();
const loading = ref(false);
const saving = ref(false);
const records = ref<any[]>([]);
const editVisible = ref(false);
const editId = ref("");
const editForm = ref<any>({ title: "", logo: "", phone: "", category: "", description: "" });

const fields: Record<string, string> = { title: "Business Title", logo: "Logo URL", phone: "Phone", category: "Category", description: "Description" };
const fieldsWithoutLogo: Record<string, string> = { title: "Business Title", phone: "Phone", category: "Category", description: "Description" };
const inputStyle = "background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;";

const BASE_URL = "";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

async function loadRecords() {
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=list`, { method: "POST", headers: headers(), body: JSON.stringify({ user_id: props.user_id }) });
    const json = await res.json();
    records.value = Array.isArray(json?.data) ? json.data : [];
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}

function goSettings(row: any) {
  window.location.href = `/fragsettings?record_id=${row.id}`;
}

function openEdit(row: any) {
  editId.value = row.id;
  const d = row.data ?? {};
  editForm.value = {
    title: d.title ?? "",
    logo: d.logo_url ?? d.logo ?? "",
    phone: d.phone ?? "",
    category: d.category ?? "",
    description: d.description ?? "",
  };
  editVisible.value = true;
}

async function saveEdit() {
  saving.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=update`, { method: "POST", headers: headers(), body: JSON.stringify({ id: editId.value, data: { logo: editForm.value.logo, title: editForm.value.title, phone: editForm.value.phone, category: editForm.value.category, description: editForm.value.description } }) });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Update failed");
    toast.add({ severity: "success", summary: "Updated", detail: "Profile updated successfully", life: 3000 });
    if (json?.warning) toast.add({ severity: "warn", summary: "Warning", detail: json.warning, life: 6000 });
    editVisible.value = false;
    await loadRecords();
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { saving.value = false; }
}

function confirmDelete(row: any) {
  confirm.require({
    message: `Delete "${row.data?.title || "this profile"}"? This cannot be undone.`,
    header: "Confirm Delete",
    icon: "pi pi-exclamation-triangle",
    rejectProps: { label: "Cancel", severity: "secondary", outlined: true },
    acceptProps: { label: "Delete", severity: "danger" },
    accept: async () => {
      try {
        const res = await fetch(`${apiUrl()}?typ=delete`, { method: "POST", headers: headers(), body: JSON.stringify({ id: row.id }) });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.message ?? "Delete failed");
        toast.add({ severity: "success", summary: "Deleted", detail: "Profile deleted", life: 3000 });
        await loadRecords();
      } catch (e: any) {
        toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
      }
    },
  });
}

onMounted(loadRecords);
</script>
