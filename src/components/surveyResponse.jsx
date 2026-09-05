import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { api } from "../api/axios";
import { getError } from "../errors/getError";

export default function SurveyResponse() {
  const { slug } = useParams();

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
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-500">{error}</p>

          <button
            onClick={handleFetchDetail}
            className="mt-4 rounded-xl bg-gray-900 px-5 py-2 text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">No survey data found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            {data.title}
          </h1>

          <p className="text-gray-600">{data.description}</p>
        </div>

        <div className="space-y-6">
          {data.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-200 p-5"
            >
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                {index + 1}. {question.title}
              </h3>

              {question.question_type === "multiple_choice" ? (
                <div className="space-y-3">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
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
                        className="accent-blue-500"
                      />

                      <span className="text-gray-700">{choice.title}</span>
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
                  className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-8 w-full rounded-xl bg-blue-500 py-4 text-lg font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {submitting ? "Submitting..." : "Finish"}
        </button>
      </div>
    </div>
  );
}
