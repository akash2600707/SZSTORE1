import { NextResponse } from "next/server";
import { pub } from "@/lib/db";

export async function GET() {
  try {
    const { data, error } = await pub()
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          stage: "postgrest",
          message: error.message,
          code: error.code || null,
          status: error.status || null,
          hint: error.hint || null,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, rows: data?.length ?? 0 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        stage: "fetch",
        message: error?.message || "Unknown error",
        cause: error?.cause?.message || null,
      },
      { status: 502 }
    );
  }
}
