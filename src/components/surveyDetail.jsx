import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import Swal from "sweetalert2";
import { getError } from "../errors/getError";

export default function SurveyDetail() {
  const { slug } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchDetail = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/survey/${slug}/response/`);

      if (res.status === 200) {
        setLoading(false);
        setData(res.data);
      } else {
        throw new Error("something went wrong");
      }
    } catch (err) {
      setError(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-sm text-gray-600 sm:text-base">
        loading
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-sm text-red-600 sm:text-base">
        {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center text-sm text-gray-600 sm:text-base">
        no data
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 px-3 py-5 sm:px-4 sm:py-8 md:py-10">
      <div className="w-full max-w-3xl min-w-0 rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 min-w-0 sm:mb-8">
          <h1 className="mb-2 break-words text-2xl font-bold text-gray-800 sm:text-3xl">
            {data.title}
          </h1>

          <p className="break-words text-sm leading-6 text-gray-600 sm:text-base">
            {data.description}
          </p>
        </div>

        {/* Questions (view only) */}
        <div className="space-y-4 sm:space-y-6">
          {data.questions.map((q, index) => (
            <div
              key={q.id}
              className="min-w-0 rounded-xl border border-gray-200 p-4 sm:p-5"
            >
              <h3 className="mb-3 break-words text-base font-semibold leading-6 text-gray-800 sm:mb-4 sm:text-lg sm:leading-7">
                {index + 1}. {q.title}
              </h3>

              {q.question_type === "multiple_choice" ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {q.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-200 p-3 sm:items-center"
                    >
                      <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-gray-400 sm:mt-0" />

                      <span className="min-w-0 break-words text-sm leading-5 text-gray-700 sm:text-base">
                        {choice.title}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <Link
            to={`/survey/response/${slug}`}
            className="block w-full"
          >
            <button
              type="button"
              className="w-full rounded-2xl bg-blue-300 px-4 py-3 text-base font-bold text-blue-900 transition hover:bg-blue-400 sm:text-lg"
            >
              Answer
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}