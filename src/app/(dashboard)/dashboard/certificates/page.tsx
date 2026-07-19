import { createClient } from "@/lib/supabase/server";
import { Award, Download } from "lucide-react";

export default async function CertificatesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*, course:courses(title, thumbnail_url)")
    .eq("user_id", user.id)
    .order("issued_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Certificates</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Certificates are issued automatically when you complete a course.
      </p>

      {!certificates || certificates.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-slate-400">
          Complete a course to earn your first certificate.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="card overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Award size={48} />
              </div>
              <div className="p-4">
                <div className="font-medium text-slate-900 dark:text-white">{cert.course?.title}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Issued {new Date(cert.issued_at).toLocaleDateString()} • Code: {cert.certificate_code}
                </div>
                <a
                  href={cert.pdf_url ?? "#"}
                  className="btn-secondary mt-3 w-full gap-2 text-sm"
                  download
                >
                  <Download size={15} /> Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
