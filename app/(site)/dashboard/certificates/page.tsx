import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, Download } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { getCurrentProfile } from "@/lib/auth";
import { getMyCertificates } from "@/lib/data/progress";

export default async function CertificatesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/certificates");

  const certificates = await getMyCertificates(profile.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900">Миний гэрчилгээ</h1>

      {certificates.length === 0 ? (
        <Card className="mt-8">
          <CardBody className="flex flex-col items-center py-14 text-center">
            <Award className="text-slate-300" size={40} />
            <p className="mt-4 text-slate-500">
              Та одоогоор гэрчилгээ аваагүй байна. Сургалтаа дуусгаад
              шалгалтаа өгвөл энд харагдана.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id}>
              <CardBody>
                <Award className="text-brand-600" size={28} />
                <h3 className="mt-3 font-semibold text-navy-900">
                  {cert.courses?.title ?? "Сургалт"}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Дугаар: {cert.certificate_no}
                </p>
                <p className="text-xs text-slate-500">
                  Огноо:{" "}
                  {new Date(cert.issued_at).toLocaleDateString("mn-MN")}
                </p>
                <Link
                  href={`/api/certificates/${cert.id}`}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  <Download size={15} /> Татах
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
