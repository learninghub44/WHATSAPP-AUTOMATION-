import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, contactsTable } from "@workspace/db";
import { SupabaseAuthGuard } from "../../common/guards/supabase-auth.guard";
import { WorkspaceGuard } from "../../common/guards/workspace.guard";
import { CurrentWorkspace } from "../../common/decorators/current-user.decorator";
import { WorkspaceContext } from "../../common/types";
import { UpdateContactDto } from "./dto";

@UseGuards(SupabaseAuthGuard, WorkspaceGuard)
@Controller("workspaces/:workspaceId/contacts")
export class ContactsController {
  @Get()
  list(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Query("search") search?: string,
  ) {
    const base = eq(contactsTable.workspaceId, workspace.workspaceId);
    const where = search
      ? and(
          base,
          or(
            ilike(contactsTable.name, `%${search}%`),
            ilike(contactsTable.waId, `%${search}%`),
          ),
        )
      : base;

    return db
      .select()
      .from(contactsTable)
      .where(where)
      .orderBy(desc(contactsTable.lastInteractionAt))
      .limit(100);
  }

  @Get(":contactId")
  get(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("contactId") contactId: string,
  ) {
    return db
      .select()
      .from(contactsTable)
      .where(
        and(
          eq(contactsTable.id, contactId),
          eq(contactsTable.workspaceId, workspace.workspaceId),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }

  @Patch(":contactId")
  async update(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("contactId") contactId: string,
    @Body() dto: UpdateContactDto,
  ) {
    const [updated] = await db
      .update(contactsTable)
      .set({ ...dto, updatedAt: new Date() })
      .where(
        and(
          eq(contactsTable.id, contactId),
          eq(contactsTable.workspaceId, workspace.workspaceId),
        ),
      )
      .returning();
    return updated ?? null;
  }
}
