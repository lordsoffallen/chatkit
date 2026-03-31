export type ChatVisibility = "private" | "public" | (string & {});

export type SidebarChat = {
  id: string;
  title: string;
  createdAt: string | Date;
  visibility?: ChatVisibility;
};

export type SidebarUser = {
  email?: string | null;
  image?: string | null;
  isAnonymous?: boolean;
  role?: string | null;
};
