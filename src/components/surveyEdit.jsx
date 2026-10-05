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
    question_type: "free_text",
    required: false,
    choices: [],
    openEdit: false,
    editIndex: -1,
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
          icon: "error",
          title: "Error",
          text: getError(err),
        });
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
      updatedChoices[index].title = value;

      return {
        ...prevQuestion,
        choices: updatedChoices,
      };
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

      setSurvey({
        ...survey,
        questions: updatedQuestions,
      });
    } else {
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

    setSurvey({
      ...survey,
      questions: updatedQuestions,
    });
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

    const hasEmptyQuestion = survey.questions.some(
      (q) => !q.title.trim(),
    );

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

    try {
      await dispatch(updateSurveyThunk(updatedSurvey)).unwrap();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 px-3 py-5 sm:px-4 sm:py-8 md:py-10">
      <div className="w-full max-w-3xl min-w-0 rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
        <h1 className="mb-5 text-2xl font-bold text-gray-800 sm:mb-6 sm:text-3xl">
          Edit Survey
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Survey info */}
          <div className="min-w-0">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700"
            >
              Title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={survey.title}
              onChange={handleSurveyChange}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 invalid:border-red-500 sm:px-4 sm:py-3 sm:text-base"
              required
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              value={survey.description}
              onChange={handleSurveyChange}
              className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          {/* Public / Active toggles */}
          <div className="flex flex-col gap-3 rounded-xl bg-gray-50 p-3 sm:p-4 md:flex-row md:items-center md:justify-between md:gap-6">
            {/* Public / Private */}
            <div className="flex w-full items-center justify-between gap-3 md:justify-start">
              <span className="text-sm font-semibold text-gray-700">
                {survey.isPublic ? "Public" : "Private"}
              </span>

              <button
                type="button"
                aria-label={`Set survey to ${
                  survey.isPublic ? "private" : "public"
                }`}
                onClick={() =>
                  setSurvey((prev) => ({
                    ...prev,
                    isPublic: !prev.isPublic,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
                  survey.isPublic ? "bg-indigo-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    survey.isPublic
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Active / Closed */}
            <div className="flex w-full items-center justify-between gap-3 md:justify-start">
              <span className="text-sm font-semibold text-gray-700">
                {survey.isActive ? "Active" : "Closed"}
              </span>

              <button
                type="button"
                aria-label={`Set survey to ${
                  survey.isActive ? "closed" : "active"
                }`}
                onClick={() =>
                  setSurvey((prev) => ({
                    ...prev,
                    isActive: !prev.isActive,
                  }))
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
                  survey.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                    survey.isActive
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <hr className="my-5 sm:my-6" />

          {/* Current questions */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-800">
              Current Questions
            </h3>

            <div className="space-y-3">
              {survey.questions.map((q, index) => (
                <div
                  key={index}
                  className="flex min-w-0 flex-col gap-4 rounded-xl bg-gray-100 p-4 sm:p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium text-gray-700">
                      {q.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {q.question_type}
                    </p>

                    {q.question_type === "multiple_choice" && (
                      <ul className="mt-2 list-inside list-disc space-y-1 break-words text-sm text-gray-600">
                        {q.choices.map((choice, idx) => (
                          <li key={idx}>
                            {typeof choice === "string"
                              ? choice
                              : choice.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex w-full gap-2 border-t border-gray-200 pt-3 md:w-auto md:shrink-0 md:border-t-0 md:pt-0">
                    <button
                      type="button"
                      disabled={survey.total_responses > 0}
                      onClick={() => handleDeleteQuestion(index)}
                      className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      disabled={survey.total_responses > 0}
                      onClick={() =>
                        setQuestion({
                          ...q,
                          editIndex: index,
                          openEdit: true,
                        })
                      }
                      className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
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

          <div className="min-w-0">
            <label
              htmlFor="question-title"
              className="block text-sm font-semibold text-gray-700"
            >
              Question Title
            </label>

            <input
              id="question-title"
              type="text"
              value={question.title}
              disabled={survey.total_responses > 0}
              onChange={handleQuestionChange}
              name="title"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 sm:px-4 sm:py-3 sm:text-base"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="question-type"
              className="block text-sm font-semibold text-gray-700"
            >
              Question Type
            </label>

            <select
              id="question-type"
              value={question.question_type}
              onChange={handleQuestionChange}
              name="question_type"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:px-4 sm:py-3 sm:text-base"
            >
              <option value="free_text">Free Text</option>
              <option value="multiple_choice">
                Multiple Choice
              </option>
            </select>
          </div>

          {/* Multiple choice */}
          {question.question_type === "multiple_choice" && (
            <div className="space-y-3 rounded-xl bg-gray-50 p-3 sm:p-4">
              <p className="font-semibold text-gray-700">Choices</p>

              {question.choices.map((choice, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <input
                    type="text"
                    value={choice.title}
                    onChange={(e) => handleChoiceChange(e, index)}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm sm:py-2 sm:text-base"
                  />

                  <button
                    type="button"
                    onClick={() => handleDeleteChoice(index)}
                    className="w-full rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 transition hover:bg-red-200 sm:w-auto"
                  >
                    Delete
                  </button>
                </div>
              ))}

              <div>
                <button
                  type="button"
                  onClick={handleAddChoice}
                  className="w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm text-white transition hover:bg-blue-600 sm:w-auto sm:text-base"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddOrEditQuestion}
            className="w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:text-base"
          >
            {question.editIndex >= 0
              ? "Update Question"
              : "Add Question"}
          </button>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white transition hover:bg-green-600 sm:text-base"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SurveyEditPage;