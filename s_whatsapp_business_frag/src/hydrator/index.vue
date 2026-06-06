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
import FragAnalytics from "./src/FragAnalytics.vue";
import FragSetup from "./src/FragSetup.vue";
import FragManage from "./src/FragManage.vue";
import FragSettings from "./src/FragSettings.vue";
import FragMetaConnect from "./src/FragMetaConnect.vue";
import FragCatalogStatus from "./src/FragCatalogStatus.vue";
import FragCatalogSync from "./src/FragCatalogSync.vue";
import FragWhatsAppAutomation from "./src/FragWhatsAppAutomation.vue";
import FragConversations from "./src/FragConversations.vue";

const { _p, _pp } = defineProps<{
  _p: _p_TYP;
  _pp: _pp_TYP;
}>();

const fragMap: Record<string, any> = {
  FragAnalytics,
  FragSetup,
  FragManage,
  FragSettings,
  FragMetaConnect,
  FragCatalogStatus,
  FragCatalogSync,
  FragWhatsAppAutomation,
  FragConversations,
};

const d = computed(() => (_pp.data.curr as any)?.data ?? {});

// Read fragment from URL path e.g. /fragsetup → FragSetup
const getFragmentFromUrl = () => {
  const path = window.location.pathname.replace(/^\//,"").toLowerCase();
  const match = Object.keys(fragMap).find(k => k.toLowerCase() === path);
  return match || d.value.fragment || "";
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
