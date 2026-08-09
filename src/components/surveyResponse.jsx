import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import Swal from "sweetalert2";

export default function surveyResponse() {
  const { slug } = useParams();
  //slug
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleFetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`http://127.0.0.1:8000/api/survey/${slug}`);

      if (res.status === 200) {
        setLoading(false);
        setData(res.data);
        console.log(res);
      } else {
        throw new Error("something went wrong");
      }
    } catch (err) {
      console.log(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const emptyQuestion = data.questions.find((q) => {
      const value = answers[q.id];

      if (q.question_type === "multiple_choice") {
        return value === undefined;
      }

      return !value || value.trim() === "";
    });

    if (emptyQuestion) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Survey",
        text: "Please answer all questions before submitting.",
      });
      return;
    }

    try {
      const formattedAnswer = data.questions.map((q) => {
        const value = answers[q.id];

        if (q.question_type === "multiple_choice") {
          return {
            question: q.id,
            chosen_choice: value,
          };
        }

        return {
          question: q.id,
          text_answer: value,
        };
      });

      const payload = {
        answers: formattedAnswer,
      };

      const res = await api.post(
        `http://127.0.0.1:8000/api/survey/${slug}/response/`,
        payload,
      );

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Finished!",
          text: "Thanks for your help.",
        });
      }
    } catch (err) {
      console.log(err)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response.data.errors[0].detail,
      });
    }
  };
  useEffect(() => {
    handleFetchDetail();
  }, [slug]);

  if (loading) return <div className="text-center">loading</div>;
  if (error) return <div className="text-center">{`${error.message}`}</div>;
  if (!data) return <div className="text-center">no data</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {data.title}
          </h1>
          <p className="text-gray-600">{data.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {data.questions.map((q, index) => (
            <div key={q.id} className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {index + 1}. {q.title}
              </h3>

              {q.question_type === "multiple_choice" ? (
                <div className="space-y-3">
                  {q.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition
                      ${
                        answers[q.id] === choice.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={choice.id}
                        checked={answers[q.id] === choice.id}
                        onChange={(e) =>
                          handleAnswerChange(q.id, Number(e.target.value))
                        }
                        className="accent-blue-500"
                      />
                      <span className="text-gray-700">{choice.title}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={4}
                  required
                  className="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-8 w-full py-4 bg-blue-500 text-white text-lg font-semibold rounded-xl hover:bg-blue-600 transition"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
