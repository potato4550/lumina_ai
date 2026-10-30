"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzeIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analyze/light-curve");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20 text-slate-500 text-sm animate-pulse">
      Initializing Astrophysical Workspace...
    </div>
  );
}
