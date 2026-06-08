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
          <h1 class="text-xl font-bold" style="color: #111b17;">Customers</h1>
          <p class="text-xs" style="color: #667781;">All WhatsApp contacts who have messaged your business</p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-3 py-2 rounded-xl" style="background: #fff; border: 1px solid #e0e0e0;">
        <i class="pi pi-users text-sm" style="color: #667781;" />
        <span class="text-sm font-medium" style="color: #111b17;">{{ stats.total_contacts ?? 0 }} customers</span>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-users text-xs" style="color: #00a884;" />
          </div>
          <span class="text-xs" style="color: #667781;">Total Customers</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ stats.total_contacts ?? 0 }}</p>
      </div>
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-comments text-xs" style="color: #00a884;" />
          </div>
          <span class="text-xs" style="color: #667781;">Total Messages</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ stats.total_received ?? 0 }}</p>
      </div>
      <div class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background: #e7f8f4;">
            <i class="pi pi-arrow-up text-xs" style="color: #00a884;" />
          </div>
          <span class="text-xs" style="color: #667781;">Replies Sent</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ stats.total_sent ?? 0 }}</p>
      </div>
    </div>

    <!-- Search + Filter -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: #667781;" />
        <input v-model="search" placeholder="Search by phone number..."
          class="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;" />
      </div>
      <select v-model="sortBy"
        class="rounded-xl px-3 py-2.5 text-sm appearance-none"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <option value="last_seen">Sort: Recent</option>
        <option value="count">Sort: Most Messages</option>
        <option value="phone">Sort: Phone</option>
      </select>
      <button @click="loadCustomers" :disabled="loading"
        class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
      </button>
    </div>

    <!-- Customers Table -->
    <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
      </div>

      <div v-else-if="filteredCustomers.length === 0" class="flex flex-col items-center justify-center py-16 gap-2">
        <i class="pi pi-inbox text-3xl" style="color: #ccd0d5;" />
        <p class="text-sm font-medium" style="color: #111b17;">No customers yet</p>
        <p class="text-xs" style="color: #667781;">Customers appear after they message your WhatsApp number</p>
      </div>

      <div v-else>
        <!-- Table Header -->
        <div class="grid px-5 py-3 text-xs font-semibold uppercase tracking-wide border-b"
          style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr; border-color: #f0f2f5; color: #667781; background: #f9fafb;">
          <span>Customer</span>
          <span>Messages</span>
          <span>Replies</span>
          <span>Last Active</span>
          <span>Actions</span>
        </div>

        <!-- Rows -->
        <div v-for="c in paginatedCustomers" :key="c.phone"
          class="grid px-5 py-3 border-b items-center hover:bg-gray-50 transition-colors"
          style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr; border-color: #f0f2f5;">

          <!-- Customer -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
              style="background: #00a884;">
              {{ (c.phone || "?")[0] }}
            </div>
            <div>
              <p class="text-sm font-semibold" style="color: #111b17;">{{ c.phone }}</p>
              <p class="text-xs" style="color: #667781;">{{ c.last_message?.slice(0, 35) || "No messages" }}</p>
            </div>
          </div>

          <!-- Messages -->
          <div>
            <span class="text-sm font-semibold" style="color: #111b17;">{{ c.count ?? 0 }}</span>
          </div>

          <!-- Replies -->
          <div>
            <span class="text-sm" style="color: #667781;">{{ c.replies ?? "—" }}</span>
          </div>

          <!-- Last Active -->
          <div>
            <span class="text-xs px-2 py-0.5 rounded-full"
              style="background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;">
              {{ formatTime(c.last_seen) }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button @click="viewConversation(c)"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background: #e7f8f4; border: 1px solid #b2dfdb;" title="View conversation">
              <i class="pi pi-comments text-xs" style="color: #00a884;" />
            </button>
            <button @click="selectedCustomer = c; showDetail = true"
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background: #f0f2f5; border: 1px solid #e9edef;" title="View details">
              <i class="pi pi-info-circle text-xs" style="color: #667781;" />
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredCustomers.length > pageSize" class="flex items-center justify-between px-5 py-3 border-t" style="border-color: #f0f2f5;">
          <span class="text-xs" style="color: #667781;">
            Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filteredCustomers.length) }} of {{ filteredCustomers.length }}
          </span>
          <div class="flex items-center gap-1">
            <button @click="page--" :disabled="page === 1"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
              <i class="pi pi-chevron-left" style="font-size:0.6rem;" />
            </button>
            <span class="text-xs px-2" style="color: #111b17;">{{ page }}</span>
            <button @click="page++" :disabled="page * pageSize >= filteredCustomers.length"
              class="w-7 h-7 rounded-lg flex items-center justify-center text-xs"
              style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
              <i class="pi pi-chevron-right" style="font-size:0.6rem;" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Detail Dialog -->
    <Dialog v-model:visible="showDetail" modal header=" " :style="{ width: '420px', background: '#fff', borderRadius: '1rem' }">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style="background: #00a884;">
            {{ (selectedCustomer?.phone || "?")[0] }}
          </div>
          <div>
            <p class="font-semibold" style="color: #111b17;">{{ selectedCustomer?.phone }}</p>
            <p class="text-xs" style="color: #667781;">Customer Details</p>
          </div>
        </div>
      </template>
      <div v-if="selectedCustomer" class="flex flex-col gap-3 pt-2">
        <div v-for="row in detailRows" :key="row.label"
          class="flex items-center justify-between py-2 border-b" style="border-color: #f0f2f5;">
          <span class="text-xs font-medium" style="color: #667781;">{{ row.label }}</span>
          <span class="text-sm font-semibold" style="color: #111b17;">{{ row.value }}</span>
        </div>
      </div>
      <template #footer>
        <button @click="viewConversation(selectedCustomer); showDetail = false"
          class="w-full rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2"
          style="background: #00a884; color: #fff; border: none;">
          <i class="pi pi-comments text-xs" />
          View Full Conversation
        </button>
      </template>
    </Dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useToast } from "primevue/usetoast";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";

const props = defineProps<{ project: string; instance: string; user_id: string; access_token: string; record_id: string }>();

const toast = useToast();
const loading = ref(false);
const customers = ref<any[]>([]);
const stats = ref<any>({});
const search = ref("");
const sortBy = ref("last_seen");
const page = ref(1);
const pageSize = 15;
const showDetail = ref(false);
const selectedCustomer = ref<any>(null);

const BASE_URL = "";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const filteredCustomers = computed(() => {
  let list = [...customers.value];
  if (search.value) list = list.filter(c => c.phone?.includes(search.value));
  if (sortBy.value === "count") list.sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  else if (sortBy.value === "phone") list.sort((a, b) => (a.phone ?? "").localeCompare(b.phone ?? ""));
  else list.sort((a, b) => new Date(b.last_seen ?? 0).getTime() - new Date(a.last_seen ?? 0).getTime());
  return list;
});

const paginatedCustomers = computed(() =>
  filteredCustomers.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

const detailRows = computed(() => [
  { label: "Phone",         value: selectedCustomer.value?.phone ?? "—" },
  { label: "Total Messages", value: selectedCustomer.value?.count ?? 0 },
  { label: "Last Message",  value: selectedCustomer.value?.last_message ?? "—" },
  { label: "Last Active",   value: formatTime(selectedCustomer.value?.last_seen) },
]);

function formatTime(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function viewConversation(customer: any) {
  window.location.href = `/fragconversations?phone=${customer.phone}`;
}

async function loadCustomers() {
  loading.value = true;
  page.value = 1;
  try {
    const res = await fetch(`${apiUrl()}?typ=conversation_list`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id }),
    });
    const json = await res.json();
    if (json?.success) {
      customers.value = json.data?.contacts ?? [];
      stats.value = json.data?.stats ?? {};
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}

onMounted(loadCustomers);
</script>
