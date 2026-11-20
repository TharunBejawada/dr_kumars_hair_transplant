"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.replace("/");
    } else {
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-white px-4">
      <meta httpEquiv="refresh" content="0;url=/" />
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Redirecting to Home...</h1>
        <p className="mt-2 text-sm text-gray-500">
          The requested page was not found. Redirecting you to the home page...
        </p>
      </div>
    </div>
  );
}
