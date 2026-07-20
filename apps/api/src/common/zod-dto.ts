import { BadRequestException, PipeTransform, Injectable } from "@nestjs/common";
import { ZodType } from "zod/v4";

/** Attaches the schema to a class so ZodValidationPipe can find it. */
export function createZodDto<T extends ZodType>(schema: T) {
  class ZodDto {
    static readonly schema = schema;
  }
  return ZodDto as unknown as new () => import("zod/v4").infer<T>;
}

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: { metatype?: unknown }) {
    const metatype = metadata.metatype as
      | { schema?: ZodType }
      | undefined;
    if (!metatype?.schema) return value;

    const result = metatype.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: "Validation failed",
        issues: result.error.issues,
      });
    }
    return result.data;
  }
}
