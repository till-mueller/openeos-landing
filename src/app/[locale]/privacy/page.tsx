import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// Render at request time so env vars set at deploy time take effect without rebuild.
export const dynamic = "force-dynamic";

type ResponsibleData = {
  name: string;
  street: string;
  city: string;
  country: string;
  email: string;
};

function getResponsibleData(locale: string): ResponsibleData {
  const defaultCountry = locale === "de" ? "Deutschland" : "Germany";
  return {
    name: process.env.IMPRINT_NAME ?? "",
    street: process.env.IMPRINT_STREET ?? "",
    city: process.env.IMPRINT_CITY ?? "",
    country: process.env.IMPRINT_COUNTRY ?? defaultCountry,
    email: process.env.IMPRINT_EMAIL ?? "hello@openeos.de",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const responsible = getResponsibleData(locale);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <PrivacyContent responsible={responsible} locale={locale} />
        </div>
      </main>
      <Footer />
    </>
  );
}

function PrivacyContent({
  responsible,
  locale,
}: {
  responsible: ResponsibleData;
  locale: string;
}) {
  const t = useTranslations("privacy");
  const emailLabel = locale === "de" ? "E-Mail" : "Email";

  return (
    <article className="prose prose-gray dark:prose-invert max-w-none">
      <h1 className="text-display-sm font-semibold text-primary mb-4">
        {t("title")}
      </h1>
      <p className="text-tertiary mb-8">{t("lastUpdated")}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("overview.title")}
        </h2>
        <p className="text-tertiary">{t("overview.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("responsible.title")}
        </h2>
        <address className="text-tertiary not-italic whitespace-pre-line">
          {[responsible.name, responsible.street, responsible.city, responsible.country]
            .filter(Boolean)
            .join("\n")}
        </address>
        <p className="text-tertiary mt-2">
          {emailLabel}:{" "}
          <a href={`mailto:${responsible.email}`} className="underline">
            {responsible.email}
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("dataCollection.title")}
        </h2>
        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("dataCollection.server.title")}
        </h3>
        <p className="text-tertiary mb-4">{t("dataCollection.server.content")}</p>

        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("dataCollection.cookies.title")}
        </h3>
        <p className="text-tertiary mb-4">{t("dataCollection.cookies.content")}</p>

        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("dataCollection.contact.title")}
        </h3>
        <p className="text-tertiary mb-4">{t("dataCollection.contact.content")}</p>

        <h3 className="text-lg font-medium text-secondary mb-2">
          {t("dataCollection.account.title")}
        </h3>
        <p className="text-tertiary">{t("dataCollection.account.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("hosting.title")}
        </h2>
        <p className="text-tertiary">{t("hosting.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("appHosting.title")}
        </h2>
        <p className="text-tertiary">{t("appHosting.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("paymentProviders.title")}
        </h2>
        <p className="text-tertiary">{t("paymentProviders.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("fiscalization.title")}
        </h2>
        <p className="text-tertiary">{t("fiscalization.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("emailService.title")}
        </h2>
        <p className="text-tertiary">{t("emailService.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("support.title")}
        </h2>
        <p className="text-tertiary">{t("support.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("ssl.title")}
        </h2>
        <p className="text-tertiary">{t("ssl.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("storage.title")}
        </h2>
        <p className="text-tertiary">{t("storage.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("rights.title")}
        </h2>
        <p className="text-tertiary whitespace-pre-line">{t("rights.content")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          {t("changes.title")}
        </h2>
        <p className="text-tertiary">{t("changes.content")}</p>
      </section>
    </article>
  );
}
