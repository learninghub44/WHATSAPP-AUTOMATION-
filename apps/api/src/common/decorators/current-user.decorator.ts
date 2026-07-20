import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { AuthenticatedUser, WorkspaceContext } from "../types";

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.user!;
  },
);

export const CurrentWorkspace = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): WorkspaceContext => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.workspace!;
  },
);
