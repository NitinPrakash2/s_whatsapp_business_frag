<template>
  <component
    :is="fragMap[fragment]"
    v-if="fragMap[fragment]"
    v-bind="fragProps"
  />
  <div v-else class="p-4 text-red-500">Unknown fragment: {{ fragment }}</div>
</template>

<script lang="ts" setup>
import type { _p_TYP, _pp_TYP } from "../shared/types";
import { computed, ref, onMounted } from "vue";
// ─── Core MVP Frags ───────────────────────────────────────────────────────────
import FragDashboard from "./src/core/FragDashboard.vue";
import FragMetaConnect from "./src/core/FragMetaConnect.vue";
import FragCatalogStatus from "./src/core/FragCatalogStatus.vue";
import FragCatalogSync from "./src/core/FragCatalogSync.vue";
import FragAnalytics from "./src/core/FragAnalytics.vue";
import FragSettings from "./src/core/FragSettings.vue";

// ─── Legacy Frags (future use) ────────────────────────────────────────────────
import FragSetup from "./src/legacy/FragSetup.vue";
import FragManage from "./src/legacy/FragManage.vue";
import FragWhatsAppAutomation from "./src/legacy/FragWhatsAppAutomation.vue";
import FragConversations from "./src/legacy/FragConversations.vue";
import FragCustomers from "./src/legacy/FragCustomers.vue";
import FragMessages from "./src/legacy/FragMessages.vue";

const { _p, _pp } = defineProps<{
  _p: _p_TYP;
  _pp: _pp_TYP;
}>();

const fragMap: Record<string, any> = {
  FragDashboard,
  FragAnalytics,
  FragSetup,
  FragManage,
  FragSettings,
  FragMetaConnect,
  FragCatalogStatus,
  FragCatalogSync,
  FragWhatsAppAutomation,
  FragConversations,
  FragCustomers,
  FragMessages,
};

const d = computed(() => (_pp.data.curr as any)?.data ?? {});

// Read fragment from URL path e.g. /fragsetup → FragSetup
const getFragmentFromUrl = () => {
  const path = window.location.pathname.replace(/^\//,"").toLowerCase();
  const match = Object.keys(fragMap).find(k => k.toLowerCase() === path);
  return match || d.value.fragment || "FragDashboard";
};

const fragment = ref(getFragmentFromUrl());

// Update fragment when URL changes (popstate)
onMounted(() => {
  window.addEventListener("popstate", () => {
    fragment.value = getFragmentFromUrl();
  });
});

const fragProps = computed(() => ({
  project: d.value.project ?? "",
  instance: d.value.instance ?? "",
  user_id: d.value.user_id ?? "",
  access_token: d.value.access_token ?? "",
  record_id: d.value.record_id ?? "",
}));
</script>
