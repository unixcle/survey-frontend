import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { updateSurveyThunk } from "../slices/surveySlice";
import Swal from "sweetalert2";
import { api } from "../api/axios";
import { getError } from "../errors/getError";

const SurveyEditPage = () => {
  const { slug } = useParams();
  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    questions: [],
    isActive: true,
    isPublic: true,
  });
  const [question, setQuestion] = useState({
    title: "",
    question_type: "free_text", // یا "multiple_choice"
    required: false,
    choices: [],
    openEdit: false, // Track edit state for the question
    editIndex: -1, // Index of the question being edited
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const response = await api.get(`/survey/${slug}/`);
        setSurvey({
          ...response.data,
          isActive: response.data.is_active,
          isPublic: response.data.is_public,
        }); 
      } catch (err) {
        Swal.fire({
          icon:"error",
          title:"Error",
          text:getError(err)
        })
      }
    };
    fetchSurveyData();
  }, [slug]);

  useEffect(() => {
    if (survey.total_responses > 0) {
      Swal.fire({
        icon: "warning",
        title: "Limited Editing",
        text: "This survey has responses. You can only edit the title and description.",
      });
    }
  }, [survey.total_responses]);

  const handleSurveyChange = (e) => {
    const { name, value } = e.target;
    setSurvey((prevSurvey) => ({
      ...prevSurvey,
      [name]: value,
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      [name]: value,
      required: value === "multiple_choice",
    }));
  };
  const handleChoiceChange = (e, index) => {
    const { value } = e.target;
    setQuestion((prevQuestion) => {
      const updatedChoices = [...prevQuestion.choices];
      updatedChoices[index].title = value; // تغییر عنوان گزینه
      return { ...prevQuestion, choices: updatedChoices };
    });
  };
  const handleAddChoice = () => {
    setQuestion((prev) => ({
      ...prev,
      choices: [...prev.choices, { title: "" }],
    }));
  };
  const handleDeleteChoice = (index) => {
    const updatedChoices = question.choices.filter((_, i) => i !== index);
    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      choices: updatedChoices,
    }));
  };

  const handleAddOrEditQuestion = () => {
    if (question.editIndex >= 0) {
      if (!question.title) {
        Swal.fire({
          icon: "warning",
          title: "Empty field!",
          text: "The Field is Empty , please fill it!",
        });
        return;
      }
      if (
        question.question_type === "multiple_choice" &&
        question.choices.some((choice) => !choice.title.trim())
      ) {
        Swal.fire({
          icon: "warning",
          title: "Empty Choice Field!",
          text: "Please fill all choice fields.",
        });
        return;
      }
      if (
        question.question_type === "multiple_choice" &&
        question.choices.length < 2
      ) {
        Swal.fire({
          icon: "warning",
          title: "At least two choices are required",
        });
        return;
      }
      // editing currebt questions
      const updatedQuestions = survey.questions.map((q, index) => {
        if (index === question.editIndex) {
          return {
            ...q,
            title: question.title,
            question_type: question.question_type,
            choices: question.choices,
            required: question.required,
          };
        }
        return q;
      });
      setSurvey({ ...survey, questions: updatedQuestions });
    } else {
      // add new questions
      if (!question.title) {
        Swal.fire({
          icon: "warning",
          title: "Empty field!",
          text: "The Field is Empty , please fill it!",
        });
        return;
      }
      if (
        question.question_type === "multiple_choice" &&
        question.choices.some((choice) => !choice.title.trim())
      ) {
        Swal.fire({
          icon: "warning",
          title: "Empty Choice Field!",
          text: "Please fill all choice fields.",
        });
        return;
      }
      if (
        question.question_type === "multiple_choice" &&
        question.choices.length < 2
      ) {
        Swal.fire({
          icon: "warning",
          title: "At least two choices are required",
        });
        return;
      }
      const newQuestion = { ...question };
      setSurvey((prevSurvey) => ({
        ...prevSurvey,
        questions: [...prevSurvey.questions, newQuestion],
      }));
    }

    // reseting fields
    setQuestion({
      title: "",
      question_type: "free_text",
      required: false,
      choices: [],
      openEdit: false,
      editIndex: -1,
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!survey.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Title",
        text: "please fill  the title field!",
      });
      return;
    }
    if (survey.questions.length === 0) {
      Swal.fire({
        icon: "error",
        title: "At least one question is required",
      });
      return;
    }
    const hasEmptyQuestion = survey.questions.some((q) => !q.title.trim());
    if (hasEmptyQuestion) {
      Swal.fire({
        icon: "error",
        title: "All questions must have a title",
      });
      return;
    }
    const updatedSurvey = {
      title: survey.title,
      id: survey.id,
      description: survey.description,
      is_active: survey.isActive,
      is_public: survey.isPublic,
      questions: survey.questions,
      slug: slug,
    };
    dispatch(updateSurveyThunk(updatedSurvey));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Survey</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={survey.title}
              onChange={handleSurveyChange}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={survey.description}
              onChange={handleSurveyChange}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            {/* Public / Private Toggle */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm font-semibold text-gray-700">
                {survey.isPublic ? "Public" : "Private"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSurvey((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  survey.isPublic ? "bg-indigo-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    survey.isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Active / Closed Toggle */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm font-semibold text-gray-700">
                {survey.isActive ? "Active" : "Closed"}
              </span>
              <button
                type="button"
                onClick={() =>
                  setSurvey((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                  survey.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    survey.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <hr className="my-6" />

          {/* Current questions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Current Questions
            </h3>

            <div className="space-y-3">
              {survey.questions.map((q, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="font-medium text-gray-700">{q.title}</p>
                    <p className="text-sm text-gray-500">{q.question_type}</p>
                    {q.question_type === "multiple_choice" && (
                      <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                        {q.choices.map((choice, idx) => (
                          <li key={idx}>
                            {typeof choice === "string" ? choice : choice.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={survey.total_responses > 0}
                      onClick={() => handleDeleteQuestion(index)}
                      className={`${survey.total_responses > 0 ? "cursor-not-allowed px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600" : "px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"}`}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      disabled={survey.total_responses > 0}
                      onClick={() =>
                        setQuestion({ ...q, editIndex: index, openEdit: true })
                      }
                      className={`${survey.total_responses > 0 ? "cursor-not-allowed px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600" : "px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600"}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question section */}
          <h2 className="text-xl font-semibold text-gray-800">
            Add / Edit Question
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Question Title
            </label>
            <input
              type="text"
              value={question.title}
              disabled={survey.total_responses > 0}
              onChange={handleQuestionChange}
              name="title"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Question Type
            </label>
            <select
              value={question.question_type}
              onChange={handleQuestionChange}
              name="question_type"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="free_text">Free Text</option>
              <option value="multiple_choice">Multiple Choice</option>
            </select>
          </div>

          {/* Multiple choice */}
          {question.question_type === "multiple_choice" && (
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
              <p className="font-semibold text-gray-700">Choices</p>

              {question.choices.map((choice, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={choice.title}
                    onChange={(e) => handleChoiceChange(e, index)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteChoice(index)}
                    className="px-3 py-2 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddOrEditQuestion}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
          >
            {question.editIndex >= 0 ? "Update Question" : "Add Question"}
          </button>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyEditPage;
