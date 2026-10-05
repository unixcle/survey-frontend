
import { useEffect, useState } from "react";
import ProgressBar from "./progressBar";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { getError } from "../errors/getError";

export default function SurveyResults() {
  const { slug } = useParams();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});

  const [expandedQuestions, setExpandedQuestions] = useState({});

  const fetchResults = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/survey/${slug}/results/`);

      if (res.status === 200) {
        setResults(res.data);
      } else {
        throw new Error("Something went wrong");
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
    fetchResults();
  }, [slug]);

  const toggleQuestion = (questionId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Send question ID to backend
  const handleSummery = async (questionId) => {
    try {
      setSummaryLoading((prev) => ({
        ...prev,
        [questionId]: true,
      }));

      const res = await api.post(
        `/survey/questions/${questionId}/summarize/`,
      );

      setSummary((prev) => ({
        ...prev,
        [questionId]: res.data,
      }));
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
    } finally {
      setSummaryLoading((prev) => ({
        ...prev,
        [questionId]: false,
      }));
    }
  };

  if (loading || !results) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-8 sm:min-h-[50vh]">
        <p className="text-sm text-slate-500 sm:text-base">
          Loading survey results...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-3 py-6 sm:px-4 sm:py-8">
        <p className="text-sm text-red-500 sm:text-base">
          Failed to load results
        </p>

        <p className="mt-1 break-words text-sm text-red-500">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      {/* Header */}
      <div className="mb-5 px-1 sm:mb-6">
        <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
          {results.title || "Survey Results"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Review the responses and insights collected from your survey.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4 sm:space-y-6">
        {results.questions?.map((question, questionIndex) => {
          const isExpanded = expandedQuestions[question.id] || false;

          const answers = question.text_answers || [];

          const visibleAnswers = isExpanded
            ? answers
            : answers.slice(0, 5);

          const hasMore = answers.length > 5;

          return (
            <div
              key={question.id}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
            >
              {/* Question Header */}
              <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600 sm:h-9 sm:w-9 sm:text-sm">
                    {questionIndex + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-sm font-semibold leading-6 text-slate-800 sm:text-base">
                      {question.title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {question.question_type === "multiple_choice"
                        ? "Multiple choice responses"
                        : `${answers.length} written responses`}
                    </p>

                    {/* Summary Loading */}
                    {summaryLoading[question.id] && (
                      <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-3 sm:px-4 sm:py-4">
                        <p className="text-xs text-indigo-600 sm:text-sm">
                          Generating summary...
                        </p>
                      </div>
                    )}

                    {/* AI Summary */}
                    {summary[question.id] && (
                      <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-3 sm:px-4 sm:py-4">
                        <p className="mb-1 text-xs font-semibold text-indigo-700 sm:text-sm">
                          AI Summary
                        </p>

                        <p className="break-words text-xs leading-6 text-slate-600 sm:text-sm">
                          {summary[question.id].summary}
                        </p>
                      </div>
                    )}

                    {/* Summary Button */}
                    {question.question_type === "free_text" && (
                      <button
                        type="button"
                        onClick={() => handleSummery(question.id)}
                        disabled={summaryLoading[question.id]}
                        className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2"
                      >
                        {summaryLoading[question.id]
                          ? "Generating..."
                          : "Summarize"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Multiple Choice */}
              {question.question_type === "multiple_choice" && (
                <div className="space-y-4 px-4 py-5 sm:space-y-5 sm:px-6 sm:py-6">
                  {question.choices?.map((choice, index) => (
                    <div
                      key={choice.id || index}
                      className="min-w-0"
                    >
                      <ProgressBar
                        label={choice.title}
                        percent={choice.percentage}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Free Text */}
              {question.question_type === "free_text" && (
                <div className="px-4 py-5 sm:px-6 sm:py-6">
                  {answers.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 px-3 py-7 text-center sm:px-4 sm:py-8">
                      <p className="text-sm text-slate-400">
                        No written responses yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {visibleAnswers.map((answer, index) => (
                          <TextAnswer
                            key={index}
                            answer={answer}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => toggleQuestion(question.id)}
                          className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:mt-5"
                        >
                          {isExpanded
                            ? "View Less"
                            : `View All ${answers.length} Responses`}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextAnswer({ answer }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = answer.length > 180;

  const displayedAnswer =
    !expanded && isLong
      ? `${answer.slice(0, 180)}...`
      : answer;

  return (
    <div className="min-w-0 flex-1">
      <p className="break-words text-sm leading-6 text-slate-600">
        {displayedAnswer}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          {expanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
}
