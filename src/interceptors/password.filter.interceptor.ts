import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export function SanitizeResponse(fieldsToRemove: string[]): MethodDecorator {
  return UseInterceptors(SanitizeResponseInterceptor(fieldsToRemove));
}

export function SanitizeResponseInterceptor(
  fieldsToRemove: string[],
): Type<NestInterceptor> {
  @Injectable()
  class DynamicSanitizer implements NestInterceptor {
    intercept(
      context: ExecutionContext,
      next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
      return next.handle().pipe(
        map((data) => {
          const sanitize = (obj: any) => {
            if (!obj) return obj; // return if obj is falsy (null, undefined, etc.)

            // if it is an array, recursively sanitize each element
            if (Array.isArray(obj)) {
              return obj.map((item) => sanitize(item)); // sanitize each item of the array
            }

            // if its an object, sanitize its properties
            if (typeof obj === 'object') {
              for (const field of fieldsToRemove) {
                delete obj[field]; // remove specified fields from the object
              }

              // recursively sanitize nested objects
              Object.keys(obj).forEach((key) => {
                obj[key] = sanitize(obj[key]); // recursively sanitize the nested fields
              });
            }

            return obj; // return the sanitized object
          };

          // apply sanitize to the whole response data
          return sanitize(data);
        }),
      );
    }
  }

  return DynamicSanitizer;
}
