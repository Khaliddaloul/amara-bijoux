"use client";

import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { markCampaignSent } from "@/actions/admin/campaigns";
import { Button } from "@/components/ui/button";

export function CampaignSendButton({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await markCampaignSent(campaignId);
          if (!res.success) toast.error(res.error);
          else {
            toast.success("تم تسجيل الإرسال (بدون SMTP)");
            router.refresh();
          }
        })
      }
    >
      {pending ? <Loader2 className="ms-1 h-4 w-4 animate-spin" /> : <Send className="ms-1 h-4 w-4" />}
      إرسال
    </Button>
  );
}
