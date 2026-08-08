import { getSearchIndex, getTodoCount } from "@/lib/content";
import { SearchProvider } from "./Search";
import { MobileBar, Sidebar } from "./Nav";

/**
 * The page shell: sidebar on desktop, top bar and drawer on mobile.
 *
 * Reads the search index and the TODO count at build time and hands them to
 * the client components, so neither has to fetch anything.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const index = getSearchIndex();
  const todoCount = getTodoCount();

  return (
    <SearchProvider index={index}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <MobileBar todoCount={todoCount} />

      <div className="flex min-h-screen">
        <Sidebar todoCount={todoCount} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </SearchProvider>
  );
}

/**
 * The content column. Capped near 70 characters, which is where long-form
 * reading stops being comfortable.
 */
export function Page({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main
      id="main"
      className={`mx-auto px-5 py-8 sm:px-8 sm:py-12 ${wide ? "max-w-5xl" : "max-w-[72ch]"}`}
    >
      {children}
    </main>
  );
}
