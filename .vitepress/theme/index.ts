import NProgress from "nprogress";
import DefaultTheme from "vitepress/theme";
import "nprogress/nprogress.css";
import {
  type EnhanceAppContext,
  inBrowser,
} from "vitepress/dist/client/index.js";
import { watch } from "vue";
import "./custom.css";
import Ref from "./components/table/Ref.vue";
import Secondary from "./components/table/Secondary.vue";
import Status from "./components/table/Status.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component("Status", Status);
    app.component("Ref", Ref);
    app.component("Secondary", Secondary);

    // Otherwise, 'document' won't be defined
    if (!inBrowser) {
      return;
    }

    let currentRoute: string | undefined;

    NProgress.configure({ showSpinner: false });

    router.onBeforeRouteChange = (to: string) => {
      const noSearchParams: string | undefined = to.split("?")[0];
      const cleaned: string | undefined = noSearchParams?.split("#")?.[0];

      if (currentRoute !== cleaned) {
        NProgress.start();
      }

      currentRoute = cleaned;
    };

    watch(
      () => router.route.path,
      () => NProgress.done(),
    );
  },
};
