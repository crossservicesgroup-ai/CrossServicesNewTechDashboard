import type { Metadata } from "next";
import { AskScreen } from "@/components/AskScreen";

/**
 * The full-screen assistant.
 *
 * Everything on this page is client-side — it renders the shared conversation
 * held by AssistantProvider in the shell, which is also what the corner panel
 * renders. There is nothing to read from /content here.
 */
export const metadata: Metadata = {
  title: "Ask",
  description:
    "Ask questions about the systems, accounts, costs and runbooks in this dashboard.",
};

export default function AskPage() {
  return <AskScreen />;
}
