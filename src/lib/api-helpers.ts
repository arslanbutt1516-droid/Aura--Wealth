import { NextResponse } from "next/server";
import { JWTPayload } from "./auth";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data, message } satisfies ApiResponse<T>,
    { status }
  );
}

export function errorResponse(
  error: string,
  status = 400
): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status }
  );
}

export function unauthorizedResponse(): NextResponse {
  return errorResponse("Unauthorized. Please log in.", 401);
}

export function notFoundResponse(resource = "Resource"): NextResponse {
  return errorResponse(`${resource} not found.`, 404);
}

// Safely serialize MongoDB documents (removes __v, converts _id)
export function serializeDoc<T>(doc: T): T {
  if (!doc) return doc;
  const obj = JSON.parse(JSON.stringify(doc));
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;
  delete obj.passwordHash;
  return obj;
}

export function serializeDocs<T>(docs: T[]): T[] {
  return docs.map(serializeDoc);
}

export type AuthenticatedHandler = (
  req: Request,
  user: JWTPayload,
  params?: Record<string, string>
) => Promise<NextResponse>;
