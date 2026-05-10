import { AnnouncementBar } from "./announcement-bar";
import { StoreFooter } from "./store-footer";
import { StoreHeader } from "./store-header";

/** Public storefront chrome — matches reference header/footer + notice bar. Admin routes must not use this. */
export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <AnnouncementBar />
      <StoreHeader />
      <main>{children}</main>
      <StoreFooter />
    </div>
  );
}
