import { useEffect, useState } from "react";
import ProgressBar from "./progressBar";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

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
      console.log(err);
      setError(err);
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

      console.log("STATUS:", res.status);
      console.log("DATA:", res.data);

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
      <div>
        <p className="text-sm text-slate-500">Loading survey results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p className="text-sm text-red-500">Failed to load results</p>
        <p className="mt-1 text-sm text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">
          {results.title || "Survey Results"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review the responses and insights collected from your survey.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {results.questions?.map((question, questionIndex) => {
          const isExpanded = expandedQuestions[question.id] || false;

          const answers = question.text_answers || [];

          const visibleAnswers = isExpanded ? answers : answers.slice(0, 5);

          const hasMore = answers.length > 5;

          return (
            <div
              key={question.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Question Header */}
              <div className="border-b border-slate-100 bg-white px-5 py-5 sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                    {questionIndex + 1}
                  </div>

                  <div className="flex-1">
                    <h2 className="font-semibold leading-6 text-slate-800">
                      {question.title}
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {question.question_type === "multiple_choice"
                        ? "Multiple choice responses"
                        : `${answers.length} written responses`}
                    </p>

                    {summaryLoading[question.id] && (
                      <div className="border-b border-slate-100 bg-indigo-50 px-5 py-4 sm:px-6">
                        <p className="text-sm text-indigo-600">
                          Generating summary...
                        </p>
                      </div>
                    )}

                    {summary[question.id] && (
                      <div className="border-b border-slate-100 bg-indigo-50 px-5 py-4 sm:px-6">
                        <p className="mb-1 text-sm font-semibold text-indigo-700">
                          AI Summary
                        </p>

                        <p className="text-sm leading-6 text-slate-600">
                          {summary[question.id].summary}
                        </p>
                      </div>
                    )}

                    {/* Summary Button */}
                    {question.question_type === "free_text" ? <button
                      onClick={() => handleSummery(question.id)}
                      disabled={summaryLoading[question.id]}
                      className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {summaryLoading[question.id]
                        ? "Generating..."
                        : "Summarize"}
                    </button> : ""}
                  </div>
                </div>
              </div>

              {/* Multiple Choice */}
              {question.question_type === "multiple_choice" && (
                <div className="space-y-5 px-5 py-6 sm:px-6">
                  {question.choices?.map((choice, index) => (
                    <div key={choice.id || index}>
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
                <div className="px-5 py-6 sm:px-6">
                  {answers.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                      <p className="text-sm text-slate-400">
                        No written responses yet.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {visibleAnswers.map((answer, index) => (
                          <TextAnswer key={index} answer={answer} />
                        ))}
                      </div>

                      {hasMore && (
                        <button
                          onClick={() => toggleQuestion(question.id)}
                          className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
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
    !expanded && isLong ? `${answer.slice(0, 180)}...` : answer;

  return (
    <div className="min-w-0 flex-1">
      <p className="break-words text-sm leading-6 text-slate-600">
        {displayedAnswer}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {expanded ? "View Less" : "View More"}
        </button>
      )}
    </div>
  );
}
