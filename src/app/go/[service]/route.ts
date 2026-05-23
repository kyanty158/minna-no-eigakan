import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ service: string }> };

export async function GET(request: Request, { params }: Params) {
  const { service } = await params;

  const { data: link } = await supabase
    .from("affiliate_links")
    .select("url, vod_service:vod_services(official_url)")
    .eq("vod_service.slug", service)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (link?.url) {
    return NextResponse.redirect(link.url);
  }

  const { data: vod } = await supabase
    .from("vod_services")
    .select("official_url")
    .eq("slug", service)
    .single();

  if (vod?.official_url) {
    return NextResponse.redirect(vod.official_url);
  }

  return NextResponse.redirect(new URL("/vod", request.url));
}
