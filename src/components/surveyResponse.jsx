import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { api } from "../api/axios";
import { getError } from "../errors/getError";

export default function SurveyResponse() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleFetchDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.get(`/survey/${slug}/response/`);

      setData(data);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!data?.questions?.length) {
      return;
    }

    const emptyQuestion = data.questions.find((question) => {
      const value = answers[question.id];

      if (question.question_type === "multiple_choice") {
        return value === undefined;
      }

      return !value || value.trim() === "";
    });

    if (emptyQuestion) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Survey",
        text: "Please answer all questions before submitting.",
      });

      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = data.questions.map((question) => {
        const value = answers[question.id];

        if (question.question_type === "multiple_choice") {
          return {
            question: question.id,
            chosen_choice: value,
          };
        }

        return {
          question: question.id,
          text_answer: value.trim(),
        };
      });

      await api.post(`/survey/${slug}/response/`, {
        answers: formattedAnswers,
      });

      await Swal.fire({
        icon: "success",
        title: "Finished!",
        text: "Thanks for your help.",
      });

      navigate("/");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    handleFetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-sm text-gray-500 sm:text-base">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <p className="break-words text-sm text-red-500 sm:text-base">
            {error}
          </p>

          <button
            type="button"
            onClick={handleFetchDetail}
            className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-2.5 text-sm text-white transition hover:bg-gray-800 sm:w-auto sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-center">
        <p className="text-sm text-gray-500 sm:text-base">
          No survey data found.
        </p>
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

        {/* Questions */}
        <div className="space-y-4 sm:space-y-6">
          {data.questions.map((question, index) => (
            <div
              key={question.id}
              className="min-w-0 rounded-xl border border-gray-200 p-4 sm:p-5"
            >
              <h3 className="mb-3 break-words text-base font-semibold leading-6 text-gray-800 sm:mb-4 sm:text-lg sm:leading-7">
                {index + 1}. {question.title}
              </h3>

              {/* Multiple Choice */}
              {question.question_type === "multiple_choice" ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 transition sm:items-center ${
                        answers[question.id] === choice.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={answers[question.id] === choice.id}
                        onChange={() =>
                          handleAnswerChange(question.id, choice.id)
                        }
                        className="mt-0.5 shrink-0 accent-blue-500 sm:mt-0"
                      />

                      <span className="min-w-0 break-words text-sm leading-5 text-gray-700 sm:text-base">
                        {choice.title}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows={4}
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-gray-300 px-3 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 sm:p-4 sm:text-base"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-blue-500 py-3.5 text-base font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400 sm:mt-8 sm:py-4 sm:text-lg"
        >
          {submitting ? "Submitting..." : "Finish"}
        </button>
      </div>
    </div>
  );
}