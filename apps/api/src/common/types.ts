export interface AuthenticatedUser {
  id: string; // Supabase auth.users.id
  email: string | null;
}

export type WorkspaceRole = "owner" | "admin" | "agent";

export interface WorkspaceContext {
  workspaceId: string;
  role: WorkspaceRole;
}

// Augment Express's Request with the fields our guards attach.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      workspace?: WorkspaceContext;
    }
  }
}
