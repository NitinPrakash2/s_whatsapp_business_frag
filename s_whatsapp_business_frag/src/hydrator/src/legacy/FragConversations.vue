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
          <h1 class="text-xl font-bold" style="color: #111b17;">Conversations</h1>
          <p class="text-xs" style="color: #667781;">Monitor incoming and outgoing WhatsApp messages</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Filter -->
        <select v-model="filter" @change="loadMessages"
          class="rounded-xl px-3 py-2 text-sm appearance-none"
          style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
          <option value="all">All Messages</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
        <button @click="loadMessages" :disabled="loading"
          class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium"
          style="background: #fff; border: 1px solid #e0e0e0; color: #111b17;">
          <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'" class="text-xs" style="color: #00a884;" />
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div v-for="s in msgStats" :key="s.label" class="rounded-2xl p-4" style="background: #fff; border: 1px solid #e0e0e0;">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center" :style="s.iconBg">
            <i :class="s.icon" class="text-xs" :style="s.iconColor" />
          </div>
          <span class="text-xs" style="color: #667781;">{{ s.label }}</span>
        </div>
        <p class="text-2xl font-bold" style="color: #111b17;">{{ s.value }}</p>
      </div>
    </div>

    <!-- Conversation Layout -->
    <div class="rounded-2xl overflow-hidden" style="background: #fff; border: 1px solid #e0e0e0;">
      <!-- Contact List + Message Panel -->
      <div class="flex" style="min-height: 520px;">

        <!-- Left: Contact List -->
        <div class="border-r flex flex-col" style="width: 280px; border-color: #f0f2f5; flex-shrink: 0;">
          <div class="px-4 py-3 border-b" style="border-color: #f0f2f5;">
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs" style="color: #667781;" />
              <input v-model="search" placeholder="Search contacts..."
                class="w-full rounded-xl pl-8 pr-3 py-2 text-sm"
                style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;" />
            </div>
          </div>

          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="w-6 h-6 rounded-full animate-spin" style="border: 2px solid #e9edef; border-top-color: #00a884;" />
          </div>

          <div v-else-if="filteredContacts.length === 0" class="flex flex-col items-center justify-center py-12 gap-2">
            <i class="pi pi-inbox text-3xl" style="color: #ccd0d5;" />
            <p class="text-xs" style="color: #667781;">No conversations yet</p>
          </div>

          <div v-else class="overflow-y-auto flex-1">
            <div v-for="contact in filteredContacts" :key="contact.phone"
              @click="selectContact(contact)"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer border-b transition-colors"
              :style="selectedContact?.phone === contact.phone
                ? 'background: #e7f8f4; border-color: #f0f2f5;'
                : 'background: #fff; border-color: #f0f2f5;'">
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style="background: #00a884;">
                {{ (contact.name || contact.phone || "?")[0].toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold truncate" style="color: #111b17;">{{ contact.name || contact.phone }}</p>
                <p class="text-xs truncate" style="color: #667781;">{{ contact.last_message || "No messages" }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <span class="text-xs" style="color: #667781;">{{ formatTime(contact.last_time) }}</span>
                <span v-if="contact.unread > 0"
                  class="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                  style="background: #00a884;">
                  {{ contact.unread }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Message Panel -->
        <div class="flex-1 flex flex-col">
          <!-- No contact selected -->
          <div v-if="!selectedContact" class="flex-1 flex flex-col items-center justify-center gap-3" style="color: #667781;">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background: #f0f2f5;">
              <i class="pi pi-comments text-2xl" style="color: #ccd0d5;" />
            </div>
            <p class="text-sm">Select a conversation to view messages</p>
          </div>

          <template v-else>
            <!-- Contact Header -->
            <div class="px-5 py-3 border-b flex items-center gap-3" style="border-color: #f0f2f5;">
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style="background: #00a884;">
                {{ (selectedContact.name || selectedContact.phone)[0].toUpperCase() }}
              </div>
              <div>
                <p class="text-sm font-semibold" style="color: #111b17;">{{ selectedContact.name || selectedContact.phone }}</p>
                <p class="text-xs" style="color: #667781;">{{ selectedContact.phone }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2" style="background: #efeae2;">
              <div v-if="messagesLoading" class="flex items-center justify-center py-8">
                <div class="w-6 h-6 rounded-full animate-spin" style="border: 2px solid rgba(0,0,0,0.1); border-top-color: #00a884;" />
              </div>
              <template v-else>
                <div v-for="msg in selectedMessages" :key="msg.id"
                  class="flex" :class="msg.direction === 'outbound' ? 'justify-end' : 'justify-start'">
                  <div class="max-w-xs rounded-2xl px-3 py-2 shadow-sm"
                    :style="msg.direction === 'outbound'
                      ? 'background: #d9fdd3; border-radius: 1rem 0 1rem 1rem;'
                      : 'background: #fff; border-radius: 0 1rem 1rem 1rem;'">
                    <p class="text-sm" style="color: #111b17;">{{ msg.content }}</p>
                    <div class="flex items-center gap-1 mt-1 justify-end">
                      <span class="text-xs" style="color: #667781;">{{ formatTime(msg.timestamp) }}</span>
                      <i v-if="msg.direction === 'outbound'" class="text-xs"
                        :class="statusIcon(msg.status)"
                        :style="statusStyle(msg.status)" />
                    </div>
                  </div>
                </div>
                <div v-if="selectedMessages.length === 0" class="flex items-center justify-center py-8">
                  <p class="text-sm" style="color: #667781;">No messages in this conversation</p>
                </div>
              </template>
            </div>

            <!-- Send Message Box -->
            <div class="px-4 py-3 border-t flex items-center gap-2" style="border-color: #f0f2f5; background: #fff;">
              <input v-model="replyText" @keyup.enter="sendMessage"
                placeholder="Type a message..."
                class="flex-1 rounded-xl px-3 py-2 text-sm"
                style="background: #f0f2f5; border: 1px solid #e9edef; color: #111b17;" />
              <button @click="sendMessage" :disabled="sending || !replyText.trim()"
                class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style="background: #00a884; border: none;">
                <i :class="sending ? 'pi pi-spin pi-spinner' : 'pi pi-send'" class="text-white text-xs" />
              </button>
            </div>
          </template>
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
const messagesLoading = ref(false);
const filter = ref("all");
const search = ref("");
const contacts = ref<any[]>([]);
const selectedContact = ref<any>(null);
const selectedMessages = ref<any[]>([]);
const stats = ref({ total: 0, inbound: 0, outbound: 0, active_customers: 0 });
const replyText = ref("");
const sending = ref(false);
let autoRefresh: any = null;

const BASE_URL = "";
const apiUrl = () => `${BASE_URL}/client/api/i/${props.project}/${props.instance}`;
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${props.access_token}` });

const filteredContacts = computed(() => {
  let list = contacts.value;
  if (filter.value !== "all") list = list.filter(c => c.last_direction === filter.value);
  if (search.value) list = list.filter(c =>
    (c.name || "").toLowerCase().includes(search.value.toLowerCase()) ||
    (c.phone || "").includes(search.value)
  );
  return list;
});

const msgStats = computed(() => [
  { label: "Total Messages",    value: stats.value.total,            icon: "pi pi-comments",     iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
  { label: "Inbound",           value: stats.value.inbound,          icon: "pi pi-arrow-down",   iconBg: "background:#e7f8f4;", iconColor: "color:#00a884;" },
  { label: "Outbound",          value: stats.value.outbound,         icon: "pi pi-arrow-up",     iconBg: "background:#f0f4ff;", iconColor: "color:#6366f1;" },
  { label: "Active Customers",  value: stats.value.active_customers, icon: "pi pi-users",         iconBg: "background:#fff8e1;", iconColor: "color:#f59e0b;" },
]);

function formatTime(ts: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString();
}

function statusIcon(status: string) {
  if (status === "read")      return "pi pi-check-circle";  // blue double tick
  if (status === "delivered") return "pi pi-check-circle";  // grey double tick
  if (status === "sent")      return "pi pi-check";          // single tick
  return "pi pi-clock";                                      // pending
}

function statusStyle(status: string) {
  if (status === "read")      return "color: #53bdeb;";
  if (status === "delivered") return "color: #667781;";
  if (status === "sent")      return "color: #667781;";
  return "color: #ccd0d5;";
}

async function loadMessages() {
  loading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=conversation_list`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, user_id: props.user_id }),
    });
    const json = await res.json();
    if (json?.success) {
      contacts.value = (json.data?.contacts ?? []).map((c: any) => ({
        ...c,
        last_time: c.last_seen,
        unread: c.count ?? 0,
      }));
      const s = json.data?.stats ?? {};
      stats.value = {
        total: (s.total_received ?? 0) + (s.total_sent ?? 0),
        inbound: s.total_received ?? 0,
        outbound: s.total_sent ?? 0,
        active_customers: s.total_contacts ?? 0,
      };
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { loading.value = false; }
}

async function selectContact(contact: any) {
  selectedContact.value = contact;
  selectedMessages.value = [];
  messagesLoading.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=conversation_messages`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, phone: contact.phone }),
    });
    const json = await res.json();
    if (json?.success) {
      selectedMessages.value = (json.data ?? []).map((m: any) => ({
        ...m,
        direction: m.direction === "in" ? "inbound" : "outbound",
        content: m.message,
        timestamp: m.created_at,
      }));
    }
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Error", detail: e.message, life: 4000 });
  } finally { messagesLoading.value = false; }
}

async function sendMessage() {
  if (!replyText.value.trim() || !selectedContact.value) return;
  sending.value = true;
  try {
    const res = await fetch(`${apiUrl()}?typ=send_message`, {
      method: "POST", headers: headers(),
      body: JSON.stringify({ id: props.record_id, to: selectedContact.value.phone, message: replyText.value.trim() }),
    });
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message ?? "Send failed");
    replyText.value = "";
    await selectContact(selectedContact.value);
  } catch (e: any) {
    toast.add({ severity: "error", summary: "Send Error", detail: e.message, life: 4000 });
  } finally { sending.value = false; }
}

onMounted(() => {
  loadMessages();
  autoRefresh = setInterval(loadMessages, 15000);
  // auto-select contact if phone passed in URL
  const phoneFromUrl = new URLSearchParams(window.location.search).get("phone");
  if (phoneFromUrl) {
    // wait for contacts to load then select
    const wait = setInterval(() => {
      if (!loading.value && contacts.value.length > 0) {
        clearInterval(wait);
        const found = contacts.value.find(c => c.phone === phoneFromUrl);
        if (found) selectContact(found);
      }
    }, 300);
  }
});
onUnmounted(() => clearInterval(autoRefresh));
</script>
