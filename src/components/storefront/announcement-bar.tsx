/** Mirrors reference notice-bar: black strip + centered slogan (Arabic). */
export function AnnouncementBar() {
  return (
    <div className="notice-bar bg-black py-2.5 text-center text-xs text-white md:text-sm">
      <p>
        <strong className="font-semibold">كل قطعة تحكي قصة</strong>
        <span className="mx-1">—</span>
        <span>اكتشفي قصتك اليوم.</span>
      </p>
    </div>
  );
}
