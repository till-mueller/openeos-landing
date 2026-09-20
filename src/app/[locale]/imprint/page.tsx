import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Render at request time so env vars set at deploy time take effect without rebuild.
export const dynamic = "force-dynamic";

type ImprintData = {
  name: string;
  street: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  vatId: string;
};

function getImprintData(locale: string): ImprintData {
  const defaultCountry = locale === "de" ? "Deutschland" : "Germany";
  return {
    name: process.env.IMPRINT_NAME ?? "",
    street: process.env.IMPRINT_STREET ?? "",
    city: process.env.IMPRINT_CITY ?? "",
    country: process.env.IMPRINT_COUNTRY ?? defaultCountry,
    email: process.env.IMPRINT_EMAIL ?? "hello@openeos.de",
    phone: process.env.IMPRINT_PHONE ?? "",
    vatId: process.env.IMPRINT_VAT_ID ?? "",
  };
}

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = getImprintData(locale);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ImprintContent data={data} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}

function ImprintContent({ data, locale }: { data: ImprintData; locale: string }) {
  const t = useTranslations("imprint");
  const emailLabel = locale === "de" ? "E-Mail" : "Email";
  const phoneLabel = locale === "de" ? "Telefon" : "Phone";
  const vatLabel = locale === "de" ? "Umsatzsteuer-ID" : "VAT ID";

  const missing = !data.name || !data.street || !data.city;
  if (missing) {
    console.warn(
      "[imprint] IMPRINT_NAME/IMPRINT_STREET/IMPRINT_CITY not fully configured — Impressum is legally required (§ 5 DDG).",
    );
    return (
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-display-sm font-semibold text-primary mb-4">
          {t("title")}
        </h1>
        <p className="text-tertiary">
          {locale === "de"
            ? "Das Impressum ist noch nicht konfiguriert."
            : "The imprint has not been configured yet."}
        </p>
      </article>
    );
  }

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-display-sm font-semibold text-primary mb-8">
        {t("title")}
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("responsible.title")}
        </h2>
        <address className="text-tertiary not-italic whitespace-pre-line">
          {[data.name, data.street, data.city, data.country]
            .filter(Boolean)
            .join("\n")}
        </address>
        {data.vatId && (
          <p className="text-tertiary mt-2">
            {vatLabel}: {data.vatId}
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("contact.title")}
        </h2>
        <p className="text-tertiary">
          {emailLabel}:{" "}
          <a href={`mailto:${data.email}`} className="underline">
            {data.email}
          </a>
          {data.phone && (
            <>
              <br />
              {phoneLabel}:{" "}
              <a href={`tel:${data.phone.replace(/\s+/g, "")}`} className="underline">
                {data.phone}
              </a>
            </>
          )}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("editorial.title")}
        </h2>
        <p className="text-tertiary">{t("editorial.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("dispute.title")}
        </h2>
        <p className="text-tertiary">{t("dispute.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("disclaimer.title")}
        </h2>
        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("disclaimer.liability.title")}
        </h3>
        <p className="text-tertiary mb-4">{t("disclaimer.liability.content")}</p>

        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("disclaimer.links.title")}
        </h3>
        <p className="text-tertiary">{t("disclaimer.links.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("copyright.title")}
        </h2>
        <p className="text-tertiary">{t("copyright.content")}</p>
      </section>
    </article>
  );
}
