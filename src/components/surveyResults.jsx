import { useEffect, useState } from "react";
import ProgressBar from "./progressBar";
import { api } from "../api/axios";
import { useParams } from "react-router-dom";

export default function SurveyResults() {
  const { title } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 

  const fetchResults = async () => {
    try {
      setLoading(true)
      const res = await api.get(
        `http://127.0.0.1:8000/api/survey/${title}/resaults/`
      );
      if (res.status === 200) {
        setLoading(false);
        setResults(res.data);
      } else {
        throw new Error("something went wrong");
      }
    } catch (err) {
      console.log(err.message);
      setError(err)
    }
    finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading || !results) {
  return <div>در حال دریافت نتایج...</div>;
}
  return (
  <div style={{ maxWidth: "600px", margin: "0 auto" }}>
    <h2>{results.title}</h2>
    <p>{results.description}</p>

    {results.questions?.map((question) => (
      <div
        key={question.id}
        style={{
          marginTop: "24px",
          padding: "16px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px"
        }}
      >
        <h4 style={{ marginBottom: "12px" }}>{question.title}</h4>

        {/* multiple choice */}
        {question.question_type === "multiple_choice" &&
          question.choices.map((choice, index) => (
            <ProgressBar
              key={index}
              label={choice.title}
              percent={choice.percentage}
            />
          ))}

        {/* free text */}
        {question.question_type === "free_text" && (
          <div style={{ fontSize: "14px", color: "#374151" }}>
            {question.text_answers.map((answer, index) => (
              <div key={index}>• {answer}</div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);
}
