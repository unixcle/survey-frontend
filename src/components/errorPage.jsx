import { useRef, useEffect } from "react";
import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import gsap from "gsap";

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const codeRef = useRef(null);
  const titleRef = useRef(null);
  const messageRef = useRef(null);
  const buttonRef = useRef(null);
  const orbRef = useRef(null);

  console.error(error);

  let statusCode = "!";
  let title = "Something went wrong";
  let message = "An unexpected error occurred. Our team has been notified.";

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    title = error.status === 404 ? "Page not found" : `Error ${error.status}`;
    message =
      error.status === 404
        ? "The page you're looking for has moved or doesn't exist."
        : error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      gsap.set(
        [codeRef.current, titleRef.current, messageRef.current, buttonRef.current],
        { opacity: 0 }
      );

      tl.fromTo(
        orbRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.6)" }
      )
        .fromTo(
          codeRef.current,
          { y: 40, opacity: 0, filter: "blur(8px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          titleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3"
        )
        .fromTo(
          messageRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.25"
        )
        .fromTo(
          buttonRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.25"
        );

      gsap.to(orbRef.current, {
        y: -14,
        duration: 2.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,_#1a1033_0%,_#0a0714_60%,_#050308_100%)] font-sans"
    >
      <div
        ref={orbRef}
        className="pointer-events-none absolute top-[12%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,_rgba(139,92,246,0.45)_0%,_rgba(139,92,246,0)_70%)] blur-[10px]"
      />

      <div className="relative z-10 max-w-[480px] px-8 py-8 text-center">
        <div
          ref={codeRef}
          className="mb-2 bg-gradient-to-br from-violet-400 via-pink-400 to-blue-400 bg-clip-text text-[clamp(5rem,15vw,9rem)] font-extrabold leading-none tracking-tight text-transparent"
        >
          {statusCode}
        </div>

        <h1 ref={titleRef} className="my-2 text-2xl font-bold text-violet-50">
          {title}
        </h1>

        <p ref={messageRef} className="mb-8 text-sm leading-relaxed text-zinc-400">
          {message}
        </p>

        <button
          ref={buttonRef}
          onClick={() => navigate("/")}
          className="rounded-full bg-gradient-to-br from-violet-500 to-pink-500 px-9 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.35)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_34px_rgba(236,72,153,0.4)] active:-translate-y-0.5"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default ErrorPage;