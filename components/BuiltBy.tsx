import { author } from "@/lib/author";
import Reveal from "./Reveal";
import styles from "./BuiltBy.module.css";

type IconName = (typeof author.tools)[number]["icon"] | "linkedin" | "code" | "instagram" | "whatsapp" | "mail" | "arrow" | "check";

const PATHS: Record<IconName, React.ReactNode> = {
  clipboard: (
    <>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
    </>
  ),
  charm: (
    <>
      <path d="M12 2v8" />
      <circle cx="12" cy="15" r="5" />
      <circle cx="12" cy="15" r="1.6" />
    </>
  ),
  note: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  book: (
    <>
      <path d="M12 6c-2-1.5-5-2-8-1.5v14c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-14c-3-.5-6 0-8 1.5Z" />
      <path d="M12 6v14" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7.5 10.5V17M7.5 7.3v.2M11.5 17v-6.5M11.5 13.5c0-1.8 1-3 2.6-3s2.4 1.1 2.4 3V17" />
    </>
  ),
  code: <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5l-3 14" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.2-4A8 8 0 1 1 8 19l-4 1Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-1.8-1.8l.8-1-1-2L9 9.5Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  arrow: <path d="M8 16 16 8M9.5 8H16v6.5" />,
  check: <path d="m6.5 12.5 3.5 3.5 7.5-8" />,
};

const Icon = ({ name, size = 20 }: { name: IconName; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {PATHS[name]}
  </svg>
);

const external = (url: string) => (url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});

/** "Who built this" card: the developer behind the store. Content lives in lib/author.ts. */
export default function BuiltBy() {
  const a = author;
  const mailto = `mailto:${a.email}?subject=${encodeURIComponent("Project enquiry via Lumi Lobes")}`;
  const social = [
    { name: "linkedin" as const, label: "LinkedIn", url: a.social.linkedin },
    { name: "code" as const, label: "GitHub", url: a.social.github },
    { name: "instagram" as const, label: "Instagram", url: a.social.instagram },
    { name: "whatsapp" as const, label: "WhatsApp", url: a.social.whatsapp },
    { name: "mail" as const, label: "Email", url: `mailto:${a.email}` },
  ].filter((s) => s.url);

  return (
    <section className={`container ${styles.section}`} aria-labelledby="built-by-title">
      <p className={styles.kicker}>Who built this</p>
      <Reveal>
        <div className={styles.card}>
          <div className={styles.main}>
            <div className={styles.identity}>
              <div className={styles.avatar}>
                <span className={styles.ring} aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.photo} alt={a.name} width={112} height={112} />
                <span className={styles.badge} title="Verified developer">
                  <Icon name="check" size={16} />
                </span>
              </div>
              <div>
                <h2 id="built-by-title" className={styles.title}>
                  Built by {a.shortName}
                </h2>
                <p className={styles.role}>{a.role}</p>
                <p className={styles.where}>
                  <span className={styles.dot} aria-hidden />
                  {a.location} · {a.availability}
                </p>
              </div>
            </div>

            <p className={styles.bio}>
              I&rsquo;m <strong>{a.name}</strong>. For over eight years I&rsquo;ve built online stores on <strong>Shopify</strong>,{" "}
              <strong>Magento 2</strong> and <strong>PHP</strong> for brands in the UK, Australia, New Zealand and India. Lumi Lobes is a
              storefront I designed and built end to end, from the 1,200-design catalog and animations to the virtual try-on. I design, code and
              maintain each project myself.
            </p>

            <div className={styles.stats}>
              {a.stats.map((s) => (
                <div key={s.label} className={styles.stat}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              {a.links.portfolio && (
                <a href={a.links.portfolio} className={`${styles.btn} ${styles.btnPrimary}`} {...external(a.links.portfolio)}>
                  View my portfolio
                </a>
              )}
              <a href={mailto} className={`${styles.btn} ${a.links.portfolio ? "" : styles.btnPrimary}`}>
                Hire me for a project
              </a>
              {a.links.source && (
                <a href={a.links.source} className={styles.btn} {...external(a.links.source)}>
                  View the source
                </a>
              )}
            </div>
          </div>

          <aside className={styles.side}>
            <p className={styles.label}>More tools by {a.shortName}</p>
            <ul className={styles.tools}>
              {a.tools.map((t, i) => {
                const body = (
                  <>
                    <span className={styles.toolIcon}>
                      <Icon name={t.icon} />
                    </span>
                    <span className={styles.toolText}>
                      <strong>{t.name}</strong>
                      <span>{t.text}</span>
                    </span>
                    {t.url && (
                      <span className={styles.toolArrow}>
                        <Icon name="arrow" size={16} />
                      </span>
                    )}
                  </>
                );
                return (
                  <li key={t.name} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                    {t.url ? (
                      <a href={t.url} className={styles.tool} {...external(t.url)}>
                        {body}
                      </a>
                    ) : (
                      <div className={styles.tool}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className={styles.label}>Find me</p>
            <div className={styles.social}>
              {social.map((s) => (
                <a key={s.name} href={s.url} className={styles.socialBtn} aria-label={s.label} title={s.label} {...external(s.url)}>
                  <Icon name={s.name} />
                </a>
              ))}
            </div>

            <a href={mailto} className={styles.contact}>
              <strong>Need a Shopify or Magento developer?</strong>
              <span>{a.email}</span>
            </a>
          </aside>
        </div>
      </Reveal>
    </section>
  );
}
