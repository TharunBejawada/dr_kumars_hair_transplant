import { type ServiceContentSection } from "@drkumar/shared";

interface Props {
  sections?: ServiceContentSection[];
}

export default function ServiceContentSectionsView({ sections }: Props) {
  if (!sections || sections.length === 0) return null;

  const validSections = sections.filter(
    (s) => (s.title && s.title.trim().length > 0) || (s.description && s.description.trim().length > 0)
  );

  if (validSections.length === 0) return null;

  return (
    <section className="bg-white py-12 md:py-16 border-b border-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-[110px] space-y-8">
        {validSections.map((sec, idx) => (
          <article
            key={sec.id || idx}
            className="rounded-2xl border border-teal-100/70 bg-gradient-to-b from-[#f9fdfc] to-white p-6 sm:p-8 md:p-10 shadow-xs"
          >
            {sec.title && (
              <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-[#111827] tracking-tight pb-3 border-b border-teal-100/80 mb-5">
                {sec.title}
              </h2>
            )}
            {sec.description && (
              <div
                className="blog-content text-[15px] sm:text-[16px] text-gray-700 leading-relaxed space-y-4 font-normal"
                dangerouslySetInnerHTML={{ __html: sec.description }}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
