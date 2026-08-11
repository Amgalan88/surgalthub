import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Нэвтэрч орно уу." }, { status: 401 });
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*, courses(title), profiles(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (!certificate) {
    return NextResponse.json({ error: "Гэрчилгээ олдсонгүй." }, { status: 404 });
  }

  const cert = certificate as unknown as {
    issued_at: string;
    certificate_no: string;
    courses: { title: string } | null;
    profiles: { full_name: string | null } | null;
  };

  const courseTitle = cert.courses?.title ?? "Карго Академи";
  const holderName = cert.profiles?.full_name ?? "Оюутан";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const navy = rgb(0.06, 0.12, 0.19);
  const brand = rgb(0.92, 0.34, 0.05);
  const slate = rgb(0.35, 0.4, 0.47);

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: 0, width, height: 14, color: brand });
  page.drawRectangle({ x: 0, y: height - 14, width, height: 14, color: navy });
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: navy,
    borderWidth: 1.5,
  });

  const centerText = (
    text: string,
    y: number,
    font = serif,
    size = 20,
    color = navy
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - textWidth) / 2, y, size, font, color });
  };

  centerText("КАРГО АКАДЕМИ", height - 90, serif, 16, brand);
  centerText("ГЭРЧИЛГЭЭ", height - 150, serif, 34, navy);
  centerText(
    "Энэхүү гэрчилгээг доорх хүнд олгож байна",
    height - 200,
    serifRegular,
    13,
    slate
  );
  centerText(holderName, height - 250, serif, 28, navy);
  centerText(
    `"${courseTitle}" сургалтыг амжилттай төгссөнийг батламжлав`,
    height - 300,
    serifRegular,
    14,
    slate
  );

  const issued = new Date(cert.issued_at).toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  centerText(`Олгосон огноо: ${issued}`, height - 360, serifRegular, 11, slate);
  centerText(
    `Гэрчилгээний дугаар: ${cert.certificate_no}`,
    height - 380,
    serifRegular,
    11,
    slate
  );

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificate-${cert.certificate_no}.pdf"`,
    },
  });
}
