import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="text-center py-20">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Welcome✨</h2>
      <div className="flex items-center justify-center gap-4">
        <Link to="/surveys" className="px-5 py-3 rounded-xl border bg-white hover:bg-gray-100 transition">
          available surveys
        </Link>
        <Link to="/survey/new" className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:opacity-90 transition">
          create New survey +
        </Link>
        <Link to="/login" className="px-5 py-3 rounded-xl bg-gray-900 text-white hover:opacity-90 transition">
              sign in / sign up
        </Link>
      </div>
    </section>
  );
}
