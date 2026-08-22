import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { api } from "../api/axios";
import background from "../assets/back.svg"

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

  // Hero entrance
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

  // Card transition on page change
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
        .set(cardRef.current, { x: dir * 50, rotate: dir * 1.5 })
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
    <div className="min-h-screen bg-cover bg-no-repeat bg-[#99ffbd] bg-[linear-gradient(180deg,rgba(153,255,189,1)_0%,rgba(189,255,215,1)_9%,rgba(255,255,255,1)_100%)] shadow-lg rounded-3xl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono-tight { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* Hero */}
      <section ref={heroRef} className="text-center pt-20 pb-14 px-4">
        <p className="font-mono-tight text-[11px] tracking-[0.3em] text-black uppercase mb-5">
          Open for responses
        </p>
        <h2 className="font-display text-5xl md:text-6xl font-semibold text-[#004418] mb-8">
          Welcome <span className="text-[#3D5AFE]">✨</span>
        </h2>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/surveys"
            className="px-6 py-3 rounded-full bg-[#99fdff] text-black border border-[#F6F1E7]/20 text-[#F6F1E7] hover:bg-[#F6F1E7]/10 transition font-mono-tight text-sm"
          >
            available surveys
          </Link>
          <Link
            to="/survey/new"
            className="px-6 py-3 rounded-full bg-[#3D5AFE] text-white hover:opacity-90 transition font-mono-tight text-sm"
          >
            create New survey +
          </Link>
        </div>
      </section>

      {/* Public surveys — large single-card carousel */}
      <section className="relative px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-2">
            <p className="font-mono-tight text-[11px] tracking-[0.25em] text-[#F6F1E7]/40 uppercase">
              Public surveys
            </p>
            {total > 0 && (
              <p className="font-mono-tight text-[11px] tracking-[0.25em] text-[#F6F1E7]/40 uppercase">
                {String(page + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
            )}
          </div>

          {total === 0 ? (
            <div className="h-[60vh] rounded-[28px] border border-[#F6F1E7]/10 animate-pulse flex items-center justify-center">
              <p className="font-mono-tight text-sm text-[#F6F1E7]/30">
                loading surveys…
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 sm:gap-6">
                <button
                  onClick={() => goTo(-1)}
                  aria-label="Previous survey"
                  className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-[#F6F1E7]/20 text-[#F6F1E7] hover:bg-[#F6F1E7] hover:text-[#12141C] transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]"
                >
                  ←
                </button>

                {/* Card with stacked-paper depth */}
                <div className="relative flex-1 min-h-[62vh]">
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-2 rounded-[28px] bg-[#F6F1E7]/15" />
                  <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 -rotate-1 rounded-[28px] bg-[#F6F1E7]/25" />

                  <Link
                    ref={cardRef}
                    to={`/survey/${survey.slug}`}
                    className="group relative flex flex-col justify-between h-full min-h-[62vh] rounded-[28px] bg-[#F6F1E7] text-[#1B1B18] p-8 sm:p-12 md:p-16 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                  >
                    {/* Stamp */}
                    <div
                      ref={stampRef}
                      className="absolute top-6 right-6 sm:top-8 sm:right-8 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-dashed border-[#E8462F] text-[#E8462F] flex flex-col items-center justify-center rotate-[-8deg] font-mono-tight"
                    >
                      <span className="text-[10px] tracking-widest uppercase">No.</span>
                      <span className="text-xl font-bold leading-none mt-0.5">
                        {String(page + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div>
                      <p className="font-mono-tight text-[11px] tracking-[0.25em] text-[#1B1B18]/45 uppercase mb-6">
                        Public survey
                      </p>
                      <h3 className="font-display text-3xl sm:text-4xl md:text-6xl font-semibold leading-[1.05] max-w-3xl pr-20">
                        {survey.title}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl text-[#1B1B18]/65 mt-6 max-w-2xl leading-relaxed">
                        {survey.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4 border-t border-[#1B1B18]/10 pt-6 mt-10">
                      <span className="font-mono-tight text-xs uppercase tracking-wide bg-[#1B1B18] text-[#F6F1E7] px-3 py-1.5 rounded-full">
                        {survey.question_count} questions
                      </span>
                      <span className="font-mono-tight text-xs text-[#1B1B18]/55">
                        {survey.total_responses === 0
                          ? "no responses so far"
                          : `${survey.total_responses} responses so far`}
                      </span>
                      <span className="font-mono-tight text-sm font-semibold text-[#3D5AFE] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        Take this survey <span>→</span>
                      </span>
                    </div>
                  </Link>
                </div>

                <button
                  onClick={() => goTo(1)}
                  aria-label="Next survey"
                  className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-full border border-[#F6F1E7]/20 text-[#F6F1E7] hover:bg-[#F6F1E7] hover:text-[#12141C] transition flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE]"
                >
                  →
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {surveyPub.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goToIndex(i)}
                    aria-label={`Go to survey ${i + 1}`}
                    aria-current={i === page}
                    className={`h-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5AFE] ${
                      i === page
                        ? "w-7 bg-[#3D5AFE]"
                        : "w-2.5 bg-[#F6F1E7]/20 hover:bg-[#F6F1E7]/40"
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