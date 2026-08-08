import { notFound } from "next/navigation";
import { getPage } from "@/lib/content";
import { Page } from "@/components/Shell";
import { DocView } from "@/components/DocView";

export default function StartHerePage() {
  const doc = getPage("start-here");
  if (!doc) notFound();

  return (
    <Page>
      <DocView doc={doc} eyebrow="Cross Services Systems" />
    </Page>
  );
}
