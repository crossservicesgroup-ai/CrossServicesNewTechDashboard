import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { Page } from "@/components/Shell";
import { DocView } from "@/components/DocView";

const SLUG = "resources";

export function generateMetadata(): Metadata {
  const doc = getPage(SLUG);
  return { title: doc?.title ?? SLUG, description: doc?.summary };
}

export default function ResourcesPage() {
  const doc = getPage(SLUG);
  if (!doc) notFound();

  return (
    <Page>
      <DocView doc={doc} eyebrow="Cross Services Systems" />
    </Page>
  );
}
