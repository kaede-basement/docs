import DefaultTheme from 'vitepress/theme'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { watch } from 'vue'
import { inBrowser, type EnhanceAppContext } from 'vitepress/dist/client/index.js'
import "./custom.css";
import Ref from './components/Ref.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component('Ref', Ref);

    // Otherwise, 'document' won't be defined
    if (!inBrowser) {
      return;
    }

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