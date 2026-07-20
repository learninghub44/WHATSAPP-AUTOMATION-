import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, conversationsTable, messagesTable, contactsTable } from "@workspace/db";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentWorkspace } from "../../common/decorators/current-user.decorator";
import { WorkspaceContext } from "../../common/types";
import { AssignConversationDto } from "./dto";

@UseGuards(SupabaseAuthGuard, WorkspaceGuard)
@Controller("workspaces/:workspaceId/conversations")
export class ConversationsController {
  @Get()
  list(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Query("status") status?: "open" | "pending" | "resolved" | "closed",
  ) {
    const base = eq(conversationsTable.workspaceId, workspace.workspaceId);
    const where = status
      ? and(base, eq(conversationsTable.status, status))
      : base;

    return db
      .select({
        id: conversationsTable.id,
        status: conversationsTable.status,
        isAiHandled: conversationsTable.isAiHandled,
        lastMessageAt: conversationsTable.lastMessageAt,
        assignedAgentId: conversationsTable.assignedAgentId,
        contactId: contactsTable.id,
        contactName: contactsTable.name,
        contactWaId: contactsTable.waId,
      })
      .from(conversationsTable)
      .innerJoin(contactsTable, eq(conversationsTable.contactId, contactsTable.id))
      .where(where)
      .orderBy(desc(conversationsTable.lastMessageAt))
      .limit(100);
  }

  @Get(":conversationId/messages")
  messages(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("conversationId") conversationId: string,
  ) {
    return db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, conversationId),
          eq(messagesTable.workspaceId, workspace.workspaceId),
        ),
      )
      .orderBy(asc(messagesTable.createdAt))
      .limit(200);
  }

  @Patch(":conversationId")
  async update(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("conversationId") conversationId: string,
    @Body() dto: AssignConversationDto,
  ) {
    const [updated] = await db
      .update(conversationsTable)
      .set({
        ...dto,
        updatedAt: new Date(),
        // Assigning a human agent implicitly hands off from the AI.
        ...(dto.assignedAgentId ? { isAiHandled: false } : {}),
      })
      .where(
        and(
          eq(conversationsTable.id, conversationId),
          eq(conversationsTable.workspaceId, workspace.workspaceId),
        ),
      )
      .returning();
    return updated ?? null;
  }
}
