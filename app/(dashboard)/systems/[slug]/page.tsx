import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSystem, getSystems } from "@/lib/content";
import { Page } from "@/components/Shell";
import { DocView } from "@/components/DocView";

type Params = { params: Promise<{ slug: string }> };

/** Static generation: every system page is built at deploy time. */
export function generateStaticParams() {
  return getSystems().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = getSystem(slug);
  return {
    title: doc?.title ?? "System",
    description: doc?.summary,
  };
}

export default async function SystemPage({ params }: Params) {
  const { slug } = await params;
  const doc = getSystem(slug);
  if (!doc) notFound();

  return (
    <Page>
      <DocView
        doc={doc}
        eyebrow="System"
        backHref="/systems"
        backLabel="All systems"
      />
    </Page>
  );
}
