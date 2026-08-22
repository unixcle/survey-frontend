import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/axios";
import { Link } from "react-router-dom";

export default function surveyDetail() {
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

        {/* Questions (view only) */}
        <div className="space-y-6">
          {data.questions.map((q, index) => (
            <div key={q.id} className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {index + 1}. {q.title}
              </h3>

              {q.question_type === "multiple_choice" ? (
                <div className="space-y-3">
                  {q.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200"
                    >
                      <span className="w-4 h-4 rounded-full border border-gray-400 inline-block" />
                      <span className="text-gray-700">{choice.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
            </div>
          ))}
          <Link to={`/survey/response/${slug}`}><button className="w-full bg-blue-300 p-2 font-bold text-lg text-blue-900 rounded-2xl">Answer</button></Link>
        </div>
      </div>
    </div>
  );
}