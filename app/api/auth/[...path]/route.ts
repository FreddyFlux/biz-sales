import { authApiHandler } from "@/lib/auth/server";

const handler = authApiHandler();

export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handler.GET(req, ctx);
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handler.POST(req, ctx);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handler.PUT(req, ctx);
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handler.DELETE(req, ctx);
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  return handler.PATCH(req, ctx);
}
