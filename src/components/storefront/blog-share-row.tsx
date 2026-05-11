"use client";

/** Share links — URLs built on the server and passed in for correct canonical sharing. */
export function BlogShareRow({ url, title }: { url: string; title: string }) {
  const text = encodeURIComponent(title);
  const encUrl = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <a
        className="rounded-full border border-[#f0f0f0] px-3 py-1 text-xs hover:bg-muted"
        href={`https://wa.me/?text=${text}%20${encUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        واتساب
      </a>
      <a
        className="rounded-full border border-[#f0f0f0] px-3 py-1 text-xs hover:bg-muted"
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        X
      </a>
      <a
        className="rounded-full border border-[#f0f0f0] px-3 py-1 text-xs hover:bg-muted"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`}
        target="_blank"
        rel="noreferrer"
      >
        فيسبوك
      </a>
    </div>
  );
}
