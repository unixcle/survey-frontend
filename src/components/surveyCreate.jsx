
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createSurvey } from "../slices/surveySlice";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import { getError } from "../errors/getError";

const SurveyCreate = () => {
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
  const navigate = useNavigate();

  const { creating } = useSelector((state) => state.surveys);
  const [sub, setSub] = useState(false);

  // Add a new question
  const handleAddQuestion = () => {
    if (!question.title) {
      Swal.fire({
        icon: "warning",
        title: "Empty field!",
        text: "The Field is Empty, please fill it!",
      });
      return;
    }

    if (question.choices.some((choice) => !choice.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Empty Choice Field!",
        text: "Please fill all choice fields.",
      });
      return;
    }

    const normalizedChoices = question.choices.map((choice) =>
      choice.trim().toLowerCase()
    );

    const hasDuplicateChoices =
      new Set(normalizedChoices).size !== normalizedChoices.length;

    if (hasDuplicateChoices) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Choices!",
        text: "Choices cannot be duplicated.",
      });
      return;
    }

    setSurvey({
      ...survey,
      questions: [...survey.questions, question],
    });

    setQuestion({
      title: "",
      question_type: "free_text",
      required: false,
      choices: [],
      openEdit: false,
      editIndex: -1,
    });
  };

  // Delete current question
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = survey.questions.filter((_, i) => i !== index);

    setSurvey((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));

    if (question.openEdit && question.editIndex === index) {
      setQuestion({
        title: "",
        question_type: "free_text",
        required: false,
        choices: [],
        openEdit: false,
        editIndex: -1,
      });
    }
  };

  // Save survey
  const handleSaveSurvey = async () => {
    setSub(true);

    if (!survey.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Empty Title",
        text: "Please fill the title field!",
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
      (q) => !q.title.trim()
    );

    if (hasEmptyQuestion) {
      Swal.fire({
        icon: "error",
        title: "All questions must have a title",
      });
      return;
    }

    const payload = {
      title: survey.title.trim(),
      description: survey.description.trim(),
      is_active: survey.isActive,
      is_public: survey.isPublic,
      questions: survey.questions.map((q) => ({
        title: (q.title || "").trim(),
        required: q.required,
        question_type: q.question_type,
        choices: q.required
          ? (q.choices || [])
              .map((c) => ({
                title: (
                  typeof c === "string" ? c : c?.title || ""
                ).trim(),
              }))
              .filter((c) => c.title)
          : [],
      })),
    };

    try {
      await dispatch(createSurvey(payload)).unwrap();
      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: getError(err),
      });
    }
  };

  // Handle question field changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;

    setQuestion((prev) => ({
      ...prev,
      [name]: value,
      required: value === "multiple_choice",
      choices:
        name === "question_type" &&
        value === "multiple_choice" &&
        prev.choices.length < 2
          ? ["", ""]
          : value === "free_text"
          ? []
          : prev.choices,
    }));
  };

  // Handle choice changes
  const handleChoiceChange = (index, e) => {
    const updatedChoices = [...question.choices];
    updatedChoices[index] = e.target.value;

    setQuestion({
      ...question,
      choices: updatedChoices,
    });
  };

  // Add choice
  const handleAddChoice = () => {
    setQuestion({
      ...question,
      choices: [...question.choices, ""],
    });
  };

  // Delete choice
  const handleDeleteChoice = (index) => {
    if (question.choices.length <= 2) return;

    const updatedChoices = question.choices.filter(
      (_, i) => i !== index
    );

    setQuestion((prev) => ({
      ...prev,
      choices: updatedChoices,
    }));
  };

  // Start editing question
  const handleEditQuestion = (index) => {
    const editingQuestion = survey.questions[index];

    setQuestion({
      ...editingQuestion,
      openEdit: true,
      editIndex: index,
    });
  };

  // Save edited question
  const handleSaveEditedQuestion = () => {
    const normalizedChoices = question.choices.map((choice) =>
      choice.trim().toLowerCase()
    );

    const hasDuplicateChoices =
      new Set(normalizedChoices).size !== normalizedChoices.length;

    if (hasDuplicateChoices) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Choices!",
        text: "Choices cannot be duplicated.",
      });
      return;
    }

    const updatedQuestions = [...survey.questions];

    updatedQuestions[question.editIndex] = question;

    setSurvey({
      ...survey,
      questions: updatedQuestions,
    });

    setQuestion({
      title: "",
      question_type: "free_text",
      required: false,
      choices: [],
      openEdit: false,
      editIndex: -1,
    });
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-50 px-3 py-5 sm:px-4 sm:py-8 md:py-10">
      <div className="w-full max-w-3xl min-w-0">
        <div className="rounded-2xl bg-white p-4 shadow-lg sm:p-6 md:p-8">
          <h1 className="mb-5 text-2xl font-bold text-gray-800 sm:mb-6 sm:text-3xl">
            Create Survey
          </h1>

          <div className="mx-auto min-w-0 rounded-lg bg-white p-0 sm:p-2 md:p-0">
            {/* Survey Title and Description */}
            <form className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Title
                </label>

                <input
                  type="text"
                  value={survey.title}
                  onChange={(e) =>
                    setSurvey({
                      ...survey,
                      title: e.target.value,
                    })
                  }
                  className={`mt-2 w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base ${
                    sub && !survey.title.trim()
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Survey title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={survey.description}
                  onChange={(e) =>
                    setSurvey({
                      ...survey,
                      description: e.target.value,
                    })
                  }
                  className="mt-2 w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3 sm:text-base"
                  placeholder="Survey description"
                />
              </div>

              {/* Public / Active Toggles */}
              <div className="flex flex-col gap-4 rounded-xl bg-gray-50 p-3 sm:p-4 md:flex-row md:items-center md:justify-between md:bg-transparent md:p-0">
                {/* Public / Private */}
                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                  <span className="text-sm font-semibold text-gray-700">
                    {survey.isPublic ? "Public" : "Private"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSurvey((prev) => ({
                        ...prev,
                        isPublic: !prev.isPublic,
                      }))
                    }
                    aria-label={`Make survey ${
                      survey.isPublic ? "private" : "public"
                    }`}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
                      survey.isPublic
                        ? "bg-indigo-500"
                        : "bg-gray-300"
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
                <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-start">
                  <span className="text-sm font-semibold text-gray-700">
                    {survey.isActive ? "Active" : "Closed"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSurvey((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                    aria-label={`${
                      survey.isActive ? "Close" : "Activate"
                    } survey`}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ${
                      survey.isActive
                        ? "bg-green-500"
                        : "bg-gray-300"
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

              {/* Current Questions */}
              <div className="mb-6 sm:mb-8">
                <h3 className="mb-3 text-lg font-semibold text-gray-800 sm:text-xl">
                  Current Questions
                </h3>

                {survey.questions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {survey.questions.map((q, index) => (
                      <div
                        key={index}
                        className="flex min-w-0 flex-col gap-4 rounded-xl bg-gray-100 p-3 sm:p-4 md:flex-row md:items-center md:justify-between"
                      >
                        {/* Question information */}
                        <div className="min-w-0 flex-1">
                          <p className="break-words font-medium text-gray-700">
                            {q.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            {q.question_type}
                          </p>

                          {q.question_type === "multiple_choice" && (
                            <ul className="mt-2 list-inside list-disc space-y-1 break-words text-xs text-gray-600 sm:text-sm">
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

                        {/* Question actions */}
                        <div className="flex w-full shrink-0 items-center gap-2 border-t border-gray-200 pt-3 md:w-auto md:border-0 md:pt-0">
                          {question.openEdit &&
                          question.editIndex === index ? (
                            <button
                              type="button"
                              onClick={handleSaveEditedQuestion}
                              className="flex-1 rounded-lg bg-indigo-500 px-3 py-2 text-sm text-white transition hover:bg-indigo-600 md:flex-none"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleEditQuestion(index)
                              }
                              className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm text-white transition hover:bg-green-600 md:flex-none"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteQuestion(index)
                            }
                            aria-label="Delete question"
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No questions added yet.
                  </p>
                )}

                {/* Add / Edit Question */}
                <div className="mt-5 sm:mt-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-800 sm:text-xl">
                    Add / Edit Question
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Question Title
                      </label>

                      <input
                        type="text"
                        name="title"
                        value={question.title}
                        onChange={handleQuestionChange}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 sm:px-4 sm:py-3 sm:text-base"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Question Type
                      </label>

                      <select
                        name="question_type"
                        value={question.question_type}
                        onChange={handleQuestionChange}
                        className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 sm:px-4 sm:py-3 sm:text-base"
                      >
                        <option value="free_text">
                          Free Text
                        </option>
                        <option value="multiple_choice">
                          Multiple Choice
                        </option>
                      </select>
                    </div>

                    {/* Choices */}
                    {question.question_type ===
                      "multiple_choice" && (
                      <div className="rounded-xl bg-gray-50 p-3 sm:p-4">
                        <p className="mb-3 font-semibold text-gray-700">
                          Choices
                        </p>

                        <div className="space-y-3">
                          {question.choices.map(
                            (choice, index) => (
                              <div
                                key={index}
                                className="flex min-w-0 flex-col gap-2 sm:flex-row"
                              >
                                <input
                                  type="text"
                                  value={choice}
                                  onChange={(e) =>
                                    handleChoiceChange(
                                      index,
                                      e
                                    )
                                  }
                                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500 sm:text-base"
                                  required
                                />

                                {question.choices.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteChoice(index)
                                    }
                                    className="w-full shrink-0 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-600 transition hover:bg-red-200 sm:w-auto"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleAddChoice}
                          className="mt-3 w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm text-white transition hover:bg-blue-600 sm:w-auto sm:text-base"
                        >
                          Add Choice
                        </button>
                      </div>
                    )}

                    {/* Add / Update Question */}
                    <button
                      type="button"
                      onClick={
                        question.openEdit
                          ? handleSaveEditedQuestion
                          : handleAddQuestion
                      }
                      className="mt-1 w-full rounded-xl bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:text-base"
                    >
                      {question.openEdit
                        ? "Update Question"
                        : "Add Question"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Survey */}
              <div className="mt-6 flex justify-center sm:mt-8">
                <button
                  type="button"
                  onClick={handleSaveSurvey}
                  disabled={creating}
                  className="w-full rounded-xl bg-green-500 py-3 text-sm font-bold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                >
                  {creating ? "در حال ذخیره..." : "Save Survey"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCreate;
