import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { eq, and } from "drizzle-orm";
import { db, workspaceMembersTable } from "@workspace/db";
import { WorkspaceRole } from "../types";
import { WORKSPACE_ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Reads `x-workspace-id` (or `:workspaceId` route param), verifies the
 * authenticated user is a member of that workspace, and attaches
 * req.workspace = { workspaceId, role }.
 *
 * This is the enforcement point for tenant isolation: every service method
 * downstream must filter its queries by req.workspace.workspaceId — never
 * trust a workspaceId that arrives in a request body.
 *
 * Must run after SupabaseAuthGuard (needs req.user to already be set).
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const workspaceId =
      (req.params?.workspaceId as string | undefined) ??
      (req.headers["x-workspace-id"] as string | undefined);

    if (!workspaceId) {
      throw new ForbiddenException(
        "Missing workspace context (x-workspace-id header or :workspaceId param)",
      );
    }

    const [membership] = await db
      .select({ role: workspaceMembersTable.role })
      .from(workspaceMembersTable)
      .where(
        and(
          eq(workspaceMembersTable.workspaceId, workspaceId),
          eq(workspaceMembersTable.userId, req.user.id),
        ),
      )
      .limit(1);

    if (!membership) {
      // Deliberately identical error to "workspace doesn't exist" — never
      // leak whether a workspace id is valid to a non-member.
      throw new ForbiddenException("Not a member of this workspace");
    }

    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `Requires role: ${requiredRoles.join(" or ")}`,
      );
    }

    req.workspace = { workspaceId, role: membership.role };
    return true;
  }
}
