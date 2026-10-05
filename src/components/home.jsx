
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "../api/axios";
import background from "../assets/back2.svg";

export default function Home() {
  const [page, setPage] = useState(0);
  const [surveyPub, setSurveyPub] = useState([]);
  const total = surveyPub.length;
  const survey = surveyPub[page];

  const directionRef = useRef(1);
  const isFirstCardRender = useRef(true);
  const reducedMotion = useRef(false);

  const heroRef = useRef(null);
  const cardRef = useRef(null);
  const stampRef = useRef(null);

  const goTo = (delta) => {
    if (total === 0) return;

    directionRef.current = delta >= 0 ? 1 : -1;

    setPage((p) => ((p + delta) % total + total) % total);
  };

  const goToIndex = (index) => {
    if (total === 0 || index === page) return;

    directionRef.current = index >= page ? 1 : -1;
    setPage(index);
  };

  const fetchPublicSurveys = async () => {
    const res = await api.get("/survey/public/list");

    if (res.status === 200) {
      setSurveyPub(res.data);
    }
  };

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    fetchPublicSurveys();
  }, []);

  // Animate the hero content when the page first loads
  useLayoutEffect(() => {
    if (reducedMotion.current) return;

    const ctx = gsap.context(() => {
      gsap.from(heroRef.current.children, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Animate the survey card whenever the active survey changes
  useLayoutEffect(() => {
    if (!survey || !cardRef.current) return;

    const dir = directionRef.current;

    if (reducedMotion.current) {
      isFirstCardRender.current = false;
      return;
    }

    const ctx = gsap.context(() => {
      if (isFirstCardRender.current) {
        gsap.from(cardRef.current, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.15,
        });

        gsap.fromTo(
          stampRef.current,
          { opacity: 0, scale: 1.6, rotate: -8 },
          {
            opacity: 1,
            scale: 1,
            rotate: -8,
            duration: 0.9,
            ease: "elastic.out(1, 0.55)",
            delay: 0.55,
          }
        );

        isFirstCardRender.current = false;
        return;
      }

      const tl = gsap.timeline();

      tl.to(cardRef.current, {
        opacity: 0,
        x: -dir * 50,
        rotate: -dir * 1.5,
        duration: 0.3,
        ease: "power2.in",
      })
        .set(cardRef.current, {
          x: dir * 50,
          rotate: dir * 1.5,
        })
        .to(cardRef.current, {
          opacity: 1,
          x: 0,
          rotate: 0,
          duration: 0.5,
          ease: "power3.out",
        });

      gsap.fromTo(
        stampRef.current,
        { opacity: 0, scale: 1.4, rotate: -8 },
        {
          opacity: 1,
          scale: 1,
          rotate: -8,
          duration: 0.55,
          ease: "back.out(2.2)",
          delay: 0.28,
        }
      );
    });

    return () => ctx.revert();
  }, [page, survey]);

  return (
    <div
      className="min-h-screen rounded-3xl bg-cover bg-no-repeat shadow-lg"
      style={{ backgroundImage: `url(${background})` }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .font-display {
          font-family: 'Fraunces', serif;
        }

        .font-mono-tight {
          font-family: 'JetBrains Mono', monospace;
        }
      `}</style>

      {/* Hero */}
      <section
        ref={heroRef}
        className="px-4 pb-10 pt-14 text-center sm:pb-14 sm:pt-20 md:pt-24"
      >
        <p className="font-mono-tight mb-4 text-[9px] uppercase tracking-[0.25em] text-white sm:mb-5 sm:text-[11px] sm:tracking-[0.3em]">
          Open for responses
        </p>

        <h2 className="font-display mb-6 text-3xl font-bold leading-tight text-[#F5F5FF] sm:text-5xl md:mb-8 md:text-6xl">
          Build Ask Learn <span className="text-[#3D5AFE]">✨</span>
        </h2>

        <div className="flex items-center justify-center">
          <Link
            to="/survey/new"
            className="w-full max-w-xs rounded-full bg-[#60de2f] px-5 py-3 text-sm text-white transition hover:opacity-90 sm:w-auto sm:px-6 sm:text-base font-mono-tight"
          >
            create Your Own Survey
          </Link>
        </div>
      </section>

      {/* Public surveys */}
      <section className="relative px-3 pb-16 sm:px-4 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-4 flex items-center justify-between px-1 sm:mb-6 sm:px-2">
            <p className="font-mono-tight text-[9px] uppercase tracking-[0.2em] text-white sm:text-[11px] sm:tracking-[0.25em]">
              Public surveys
            </p>

            {total > 0 && (
              <p className="font-mono-tight text-[9px] uppercase tracking-[0.2em] text-[#F6F1E7] sm:text-[11px] sm:tracking-[0.25em]">
                {String(page + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </p>
            )}
          </div>

          {total === 0 ? (
            <div className="flex h-[50vh] items-center justify-center rounded-[22px] border border-[#F6F1E7]/10 px-4 sm:h-[60vh] sm:rounded-[28px]">
              <p className="font-mono-tight text-xs text-[#F6F1E7]/30 sm:text-sm">
                loading surveys…
              </p>
            </div>
          ) : (
            <>
              {/* Carousel */}
              <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
                {/* Previous */}
                <button
                  onClick={() => goTo(-1)}
                  aria-label="Previous survey"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F6F1E7]/20 text-sm text-[#F6F1E7] transition hover:bg-[#F6F1E7] hover:text-[#12141C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE] sm:h-11 sm:w-11 sm:text-base md:h-14 md:w-14"
                >
                  ←
                </button>

                {/* Card */}
                <div className="relative min-w-0 flex-1">
                  {/* Back paper layers */}
                  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-2 rounded-[22px] bg-[#F6F1E7]/15 sm:translate-x-2 sm:translate-y-2 sm:rounded-[26px] md:translate-x-3 md:translate-y-3 md:rounded-[28px]" />

                  <div className="absolute inset-0 translate-x-1 translate-y-1 -rotate-1 rounded-[22px] bg-[#F6F1E7]/25 sm:translate-x-1.5 sm:translate-y-1.5 sm:rounded-[26px] md:rounded-[28px]" />

                  <Link
                    ref={cardRef}
                    to={`/survey/${survey.slug}`}
                    className="group relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[22px] bg-[#F6F1E7] p-5 text-[#1B1B18] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:min-h-[560px] sm:rounded-[26px] sm:p-8 md:min-h-[62vh] md:rounded-[28px] md:p-12 lg:p-16"
                  >
                    {/* Stamp */}
                    <div
                      ref={stampRef}
                      className="absolute right-4 top-4 flex h-14 w-14 rotate-[-8deg] flex-col items-center justify-center rounded-full border-2 border-dashed border-[#E8462F] font-mono-tight text-[#E8462F] sm:right-6 sm:top-6 sm:h-20 sm:w-20 sm:border-[3px] md:right-8 md:top-8 md:h-24 md:w-24"
                    >
                      <span className="text-[7px] tracking-widest uppercase sm:text-[10px]">
                        No.
                      </span>

                      <span className="mt-0.5 text-base font-bold leading-none sm:text-xl">
                        {String(page + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Main content */}
                    <div>
                      <p className="font-mono-tight mb-4 text-[9px] uppercase tracking-[0.2em] text-[#1B1B18]/45 sm:mb-6 sm:text-[11px] sm:tracking-[0.25em]">
                        Public survey
                      </p>

                      <h3 className="font-display max-w-3xl pr-12 text-2xl font-semibold leading-[1.1] sm:pr-20 sm:text-4xl md:text-5xl lg:text-6xl">
                        {survey.title}
                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#1B1B18]/65 sm:mt-6 sm:text-lg sm:leading-relaxed md:text-xl">
                        {survey.description}
                      </p>
                    </div>

                    {/* Card footer */}
                    <div className="mt-8 flex flex-col gap-4 border-t border-[#1B1B18]/10 pt-5 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:pt-6">
                      <span className="w-fit rounded-full bg-[#1B1B18] px-3 py-1.5 font-mono-tight text-[10px] uppercase tracking-wide text-[#F6F1E7] sm:text-xs">
                        {survey.question_count} questions
                      </span>

                      <span className="font-mono-tight text-[10px] text-[#1B1B18]/55 sm:text-xs">
                        {survey.total_responses === 0
                          ? "no responses so far"
                          : `${survey.total_responses} responses so far`}
                      </span>

                      <span className="flex items-center gap-1.5 font-mono-tight text-xs font-semibold text-[#3D5AFE] transition-all group-hover:gap-2.5 sm:text-sm">
                        Take this survey <span>→</span>
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Next */}
                <button
                  onClick={() => goTo(1)}
                  aria-label="Next survey"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F6F1E7]/20 text-sm text-[#F6F1E7] transition hover:bg-[#F6F1E7] hover:text-[#12141C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE] sm:h-11 sm:w-11 sm:text-base md:h-14 md:w-14"
                >
                  →
                </button>
              </div>

              {/* Dots */}
              <div className="mt-6 flex items-center justify-center gap-1.5 sm:mt-8 sm:gap-2">
                {surveyPub.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goToIndex(i)}
                    aria-label={`Go to survey ${i + 1}`}
                    aria-current={i === page}
                    className={`h-2 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE] sm:h-2.5 ${
                      i === page
                        ? "w-6 bg-[#F6F1E7] sm:w-7"
                        : "w-2 bg-[#F6F1E7]/20 hover:bg-[#F6F1E7]/40 sm:w-2.5"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
