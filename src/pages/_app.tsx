import type { AppProps } from "next/app";

/** طبقة Pages Router مطلوبة لاستقرار بناء Next في بعض البيئات — كل المسارات الفعلية في `src/app`. */
export default function PagesAppShell({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
