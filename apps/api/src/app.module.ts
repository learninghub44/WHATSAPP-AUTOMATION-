import { Module } from "@nestjs/common";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SupabaseModule } from "./supabase/supabase.module";
import { ZodValidationPipe } from "./common/zod-dto";
import { HealthController } from "./health.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { WorkspacesModule } from "./modules/workspaces/workspaces.module";
import { WhatsappModule } from "./modules/whatsapp/whatsapp.module";
import { AiGatewayModule } from "./modules/ai-gateway/ai-gateway.module";
import { ContactsModule } from "./modules/contacts/contacts.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    SupabaseModule,
    AuthModule,
    WorkspacesModule,
    WhatsappModule,
    AiGatewayModule,
    ContactsModule,
    ConversationsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
