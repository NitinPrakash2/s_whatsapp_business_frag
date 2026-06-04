import { createApp } from "vue";
import type { _p_TYP, _pp_TYP } from "../shared/types";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import Comp from "./index.vue";

const index = async (_p: _p_TYP) => {
    return {
        set: async (_pp: _pp_TYP) => {
            console.log(`--hydrator [${(_pp as any)[`data`][`curr`].type}]`);

            const props = { _p, _pp };
            const app = createApp(Comp, props);

            app.use(PrimeVue, { theme: { preset: Aura } });
            app.use(ToastService);
            app.use(ConfirmationService);

            const mountEl = document.getElementById(_p.f.name("vue-root"));
            app.mount(mountEl!);

            return {
                r: ``,
                style: ``,
                evt: {
                    change: () => {
                        _p.f.call("msg", {
                            type: `change`,
                            _p,
                            _pp,
                            custom: {},
                        });
                    },
                },
            };
        },
    };
};

export { index, index as hydrator };
