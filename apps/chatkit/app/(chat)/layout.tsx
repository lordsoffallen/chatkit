import { cookies, headers } from "next/headers";
import { Suspense } from "react";
import { ArtifactStateProvider } from "@/components/chatkit/artifacts/core/state";
import { DataStreamProvider } from "@/components/data/data-stream-provider";
import { AppSidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import type { AuthUser } from "@/types/user";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="flex h-dvh" />}>
      <SidebarWrapper>{children}</SidebarWrapper>
    </Suspense>
  );
}

async function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    cookies(),
  ]);
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  return (
    <DataStreamProvider>
      <ArtifactStateProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar user={session?.user as AuthUser} />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </ArtifactStateProvider>
    </DataStreamProvider>
  );
}
