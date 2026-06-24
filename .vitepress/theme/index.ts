import DefaultTheme from 'vitepress/theme'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { watch } from 'vue'
import { Router } from 'vitepress/dist/client/index.js'
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ router }: { "router": Router }) {
    let currentRoute: string | undefined;

    NProgress.configure({ showSpinner: false });

    router.onBeforeRouteChange = (to: string) => {
      const cleaned: string | undefined = to
        ?.split("?")?.[0]
        ?.split("#")?.[0];

      if (currentRoute !== cleaned) {
        NProgress.start();
      }

      currentRoute = cleaned;
    }

    watch(
      () => router.route.path,
      () => NProgress.done(),
    );
  }
}