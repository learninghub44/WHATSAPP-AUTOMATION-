import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  db,
  workspacesTable,
  workspaceMembersTable,
  subscriptionsTable,
} from "@workspace/db";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CurrentUser,
  CurrentWorkspace,
} from "../../common/decorators/current-user.decorator";
import { AuthenticatedUser, WorkspaceContext } from "../../common/types";
import { CreateWorkspaceDto, InviteMemberDto, defaultLimitsFor } from "./dto";

@UseGuards(SupabaseAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
  @Get("mine")
  async listMine(@CurrentUser() user: AuthenticatedUser) {
    return db
      .select({
        id: workspacesTable.id,
        name: workspacesTable.name,
        slug: workspacesTable.slug,
        role: workspaceMembersTable.role,
      })
      .from(workspaceMembersTable)
      .innerJoin(
        workspacesTable,
        eq(workspaceMembersTable.workspaceId, workspacesTable.id),
      )
      .where(eq(workspaceMembersTable.userId, user.id));
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    // Every write here belongs to a single all-or-nothing tenant bootstrap:
    // workspace + owner membership + trial subscription.
    return db.transaction(async (tx) => {
      const [workspace] = await tx
        .insert(workspacesTable)
        .values({ name: dto.name, slug: dto.slug, ownerId: user.id })
        .returning();

      await tx.insert(workspaceMembersTable).values({
        workspaceId: workspace.id,
        userId: user.id,
        role: "owner",
      });

      await tx.insert(subscriptionsTable).values({
        workspaceId: workspace.id,
        plan: "starter",
        status: "trialing",
        limits: defaultLimitsFor("starter"),
      });

      return workspace;
    });
  }

  @UseGuards(WorkspaceGuard)
  @Get(":workspaceId/members")
  listMembers(@CurrentWorkspace() workspace: WorkspaceContext) {
    return db
      .select()
      .from(workspaceMembersTable)
      .where(eq(workspaceMembersTable.workspaceId, workspace.workspaceId));
  }

  /**
   * Invites are recorded as pending; actual account creation happens when
   * the invitee registers (phase 2 wires this to a Resend invite email +
   * an `invites` table with an accept token). For now this documents the
   * intended role but requires the invitee to already have an account.
   */
  @UseGuards(WorkspaceGuard)
  @Roles("owner", "admin")
  @Post(":workspaceId/members/invite")
  invite(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("workspaceId") _workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return {
      message: `Invite flow for ${dto.email} as ${dto.role} not yet wired to email delivery — phase 2`,
      workspaceId: workspace.workspaceId,
    };
  }
}
