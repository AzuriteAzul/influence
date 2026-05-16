import { Suspense } from "react";
import BrowsePageInner from "./browse-inner";

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12">Loading...</div>}>
      <BrowsePageInner />
    </Suspense>
  );
}
