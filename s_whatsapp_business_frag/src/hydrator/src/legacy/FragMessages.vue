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
          <h1 class="text-xl font-bold" style="color: #111b17;">Message Logs</h1>
          <p class="text-xs" style="color: #667781;">All incoming and outgoing WhatsApp messages</p>
        </div>
      </div>
      <button @click="loadMessages" :disabled="loading"
        class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
        Refresh
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div v-for="s in statCards" :key="s.label" class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center" :style="s.iconBg">
            <i :class="s.icon" class="text-xs" :style="s.iconColor" />
          </div>
          <span class="text-xs" style="color: #667781;">{{ s.label }}</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ s.value }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: #667781;" />
        <input v-model="search" placeholder="Search by phone or message..."
          class="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm"
          style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;" />
      </div>
      <select v-model="filterDirection"
        class="rounded-xl px-3 py-2.5 text-sm appearance-none"
        style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
        <option value="all">All Directions</option>
        <option value="in">Inbound</option>
        <option value="out">Outbound</option>
      </select>
    </div>

    <!-- Messages List -->
    <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">

      <!-- Table Header -->
      <div class="grid px-5 py-3 text-xs font-semibold uppercase tracking-wide border-b"
        style="grid-template-columns: 100px 1fr 140px 100px 120px; border-color: #f0f2f5; color: #667781; background: #f9fafb;">
        <span>Direction</span>
        <span>Message</span>
        <span>From / To</span>
        <span>Type</span>
        <span>Time</span>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-16">
        <div class="w-8 h-8 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
      </div>

      <div v-else-if="filteredMessages.length === 0" class="flex flex-col items-center justify-center py-16 gap-2">
        <i class="pi pi-inbox text-3xl" style="color: #ccd0d5;" />
        <p class="text-sm font-medium" style="color: #111b17;">No messages found</p>
        <p class="text-xs" style="color: #667781;">Messages appear after WhatsApp activity via webhook</p>
      </div>

      <div v-else>
        <div v-for="msg in paginatedMessages" :key="msg.id"
          class="grid px-5 py-3 border-b items-center"
          style="grid-template-columns: 100px 1fr 140px 100px 120px; border-color: #f0f2f5;">

          <!-- Direction -->
          <div>
            <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
              :style="msg.direction === 'in'
                ? 'background: #e7f8f4; color: #00a884; border: 1px solid #b2dfdb;'
                : 'background: #f0f4ff; color: #6366f1; border: 1px solid #c7d2fe;'">
              <i :class="msg.direction === 'in' ? 'pi pi-arrow-down' : 'pi pi-arrow-up'" style="font-size:0.55rem;" />
              {{ msg.direction === 'in' ? 'Inbound' : 'Outbound' }}
            </span>
          </div>

          <!-- Message -->
          <div class="pr-4">
            <p class="text-sm truncate" style="color: #111b17; max-width: 400px;">{{ msg.message }}</p>
          </div>

          <!-- From/To -->
          <div>
            <p class="text-xs font-medium" style="color: #3b4a54;">{{ msg.direction === 'in' ? msg.from : msg.to }}</p>
          </div>

          <!-- Type -->
          <div>
            <span class="text-xs px-2 py-0.5 rounded-full"
              style="background: #f0f2f5; color: #667781; border: 1px solid #e9edef;">
              {{ msg.type ?? "text" }}
            </span>
          </div>

          <!-- Time -->
          <div>
            <p class="text-xs" style="color: #667781;">{{ formatTime(msg.created_at) }}</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredMessages.length > pageSize" class="flex items-center justify-between px-5 py-3 border-t" style="border-color: #f0f2f5;">
          <span class="text-xs" style="color: #667781;">
            Showing {{ (page - 1) * pageSize + 1 }}–{{ Math.min(page * pageSize, filteredMessages.length) }} of {{ filteredMessages.length }}
          </span>
          <div class="flex items-center gap-1">
            <button @click="page--" :disabled="page === 1"
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
              <i class="pi pi-chevron-left" style="font-size:0.6rem;" />
            </button>
            <span class="text-xs px-2" style="color: #111b17;">{{ page }}</span>
            <button @click="page++" :disabled="page * pageSize >= filteredMessages.length"
              class="w-7 h-7 rounded-lg flex items-center justify-center"
              style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;">
              <i class="pi pi-chevron-right" style="font-size:0.6rem;" />
            </button>
          </div>
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
const loading = ref(false);
const messages = ref<any[]>([]);
const search = ref("");
const filterDirection = ref("all");
const page = ref(1);
const pageSize = 20;
let autoRefresh: any = null;

const BASE_URL = "";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const filteredMessages = computed(() => {
  let list = [...messages.value];
  if (filterDirection.value !== "all") list = list.filter(m => m.direction === filterDirection.value);
  if (search.value) list = list.filter(m =>
    m.message?.toLowerCase().includes(search.value.toLowerCase()) ||
    m.from?.includes(search.value) ||
    m.to?.includes(search.value)
  );
  return list;
});

const paginatedMessages = computed(() =>
  filteredMessages.value.slice((page.value - 1) * pageSize, page.value * pageSize)
);

const statCards = computed(() => {
  const all = messages.value;
  const inbound = all.filter(m => m.direction === "in");
  const outbound = all.filter(m => m.direction === "out");
  const today = all.filter(m => {
    if (!m.created_at) return false;
    return new Date(m.created_at).toDateString() === new Date().toDateString();
  });
  return [
    { label: "Total Messages", value: all.length,      icon: "pi pi-comments",   iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
    { label: "Inbound",        value: inbound.length,  icon: "pi pi-arrow-down", iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
    { label: "Outbound",       value: outbound.length, icon: "pi pi-arrow-up",   iconBg: "background:#f0f4ff;", iconColor: "color:#6366f1;" },
    { label: "Today",          value: today.length,    icon: "pi pi-calendar",   iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;" },
  ];
});

function formatTime(ts: string | null) {
  if (!ts) return "—";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString();
}

async function loadMessages() {
  loading.value = true;
  page.value = 1;
  try {
    const res = await fetch(`${apiUrl()}?typ=message_log`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, limit: 100, offset: 0 }),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Failed to load");
    // filter out webhook event rows — only show real in/out messages
    messages.value = (json.data ?? []).filter((m: any) => m.direction === "in" || m.direction === "out");
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}

onMounted(() => {
  loadMessages();
  autoRefresh = setInterval(loadMessages, 30000);
});
onUnmounted(() => clearInterval(autoRefresh));
</script>
