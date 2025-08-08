import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "Imagem não enviada." }, { status: 400 });
    }
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "IMGBB_API_KEY não configurada." }, { status: 500 });
    }
    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("image", imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ""));

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    const data = await response.json();
    if (!data.success) {
      return NextResponse.json({ error: data.error?.message || "Erro ao enviar imagem para ImgBB." }, { status: 500 });
    }
    return NextResponse.json({ url: data.data.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro desconhecido." }, { status: 500 });
  }
}
