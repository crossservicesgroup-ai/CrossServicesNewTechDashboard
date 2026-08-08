import { Shell } from "@/components/Shell";

/**
 * Wraps every dashboard route in the sidebar/drawer shell.
 *
 * The login page sits outside this group so it renders on its own, without
 * navigation to a site the visitor cannot see yet.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
