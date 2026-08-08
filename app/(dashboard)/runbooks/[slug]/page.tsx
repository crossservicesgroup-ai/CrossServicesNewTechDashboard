import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRunbook, getRunbooks } from "@/lib/content";
import { Page } from "@/components/Shell";
import { DocView } from "@/components/DocView";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getRunbooks().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const doc = getRunbook(slug);
  return { title: doc?.title ?? "Runbook", description: doc?.summary };
}

export default async function RunbookPage({ params }: Params) {
  const { slug } = await params;
  const doc = getRunbook(slug);
  if (!doc) notFound();

  return (
    <Page>
      <DocView
        doc={doc}
        eyebrow="Runbook"
        backHref="/runbooks"
        backLabel="All runbooks"
      />
    </Page>
  );
}
