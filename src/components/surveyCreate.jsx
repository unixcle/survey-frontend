import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createSurvey } from "../slices/surveySlice";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

const SurveyCreate = () => {
  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    questions: [],
  });
  const [question, setQuestion] = useState({
    title: "",
    question_type: "free_text", // or 'multiple_choice'
    required: false,
    choices: [],
    openEdit: false, // Track edit state for the question
    editIndex: -1, // Index of the question being edited
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating, error } = useSelector((state) => state.surveys);
  const [sub, setSub] = useState(false);

  // Add a new question
  const handleAddQuestion = () => {
    if (!question.title) {
      Swal.fire({
        icon: "warning",
        title: "Empty field!",
        text: "The Field is Empty , please fill it!",
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
      choice.trim().toLowerCase(),
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
    setQuestion({ title: "", question_type: "free_text", choices: [] });
  };

  //delete current questions
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = survey.questions.filter((_, i) => i !== index);

    setSurvey((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));

    // اگر همان سوالی که در حال ادیتش هست حذف شد
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

  // Save the survey
  const handleSaveSurvey = async () => {
    console.log("✅ Save Survey clicked");
    setSub(true);

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

    const payload = {
      title: survey.title.trim(),
      description: survey.description.trim(),
      questions: survey.questions.map((q) => ({
        title: (q.title || "").trim(),
        required: q.required,
        question_type: q.question_type,
        choices: q.required
          ? (q.choices || [])
              .map((c) => ({
                title: (typeof c === "string" ? c : c?.title || "").trim(),
              }))
              .filter((c) => c.title) // گزینه‌های خالی حذف می‌شن
          : [],
      })),
    };
    console.log(payload);
    try {
      const created = await dispatch(createSurvey(payload)).unwrap();

      Swal.fire({
        icon: "success",
        title: "Survey created successfully",
      });
      // 2) ناوبری بعد از موفقیت
      navigate("/");
      //? یا اگر صفحه detail داری:
      //TODO navigate(`/surveys/${created.id}`);
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || "Something went wrong",
      });
      console.log(e);
    }
  };
  // Handle changes in the question fields
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

  // Handle changes in multiple choice choices
  const handleChoiceChange = (index, e) => {
    const updatedChoices = [...question.choices];
    updatedChoices[index] = e.target.value;
    setQuestion({
      ...question,
      choices: updatedChoices,
    });
  };

  // Add new choice in multiple-choice question
  const handleAddChoice = () => {
    setQuestion({
      ...question,
      choices: [...question.choices, ""],
    });
  };

  // delete choices
  const handleDeleteChoice = (index) => {
    if (question.choices.length <= 2) return;

    const updatedChoices = question.choices.filter((_, i) => i !== index);

    setQuestion((prev) => ({
      ...prev,
      choices: updatedChoices,
    }));
  };

  // Start editing a question
  const handleEditQuestion = (index) => {
    const editingQuestion = survey.questions[index];
    setQuestion({
      ...editingQuestion,
      openEdit: true,
      editIndex: index,
    });
  };

  // Save the edited question
  const handleSaveEditedQuestion = () => {
    const normalizedChoices = question.choices.map((choice) =>
      choice.trim().toLowerCase(),
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
      choices: [],
      openEdit: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Survey</h1>

        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          {/* Survey Title and Description Inputs */}
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={survey.title}
                onChange={(e) =>
                  setSurvey({ ...survey, title: e.target.value })
                }
                className={`mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500
                   ${sub && !survey.title.trim() ? "border-red-500" : "border-gray-300"}`}
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
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Survey description"
              />
            </div>

            <hr className="my-6" />

            {/*Current Questions Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Current Questions
              </h3>

              {survey.questions.length > 0 ? (
                <div className="space-y-4">
                  {survey.questions.map((q, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-100 rounded-xl p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-700">{q.title}</p>

                        <p className="text-sm text-gray-500">
                          {q.question_type}
                        </p>

                        {q.question_type === "multiple_choice" && (
                          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
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
                      <div>
                        {question.openEdit && question.editIndex === index ? (
                          <button
                            type="button"
                            onClick={handleSaveEditedQuestion}
                            className="px-3 py-1 text-sm rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEditQuestion(index)}
                            className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-100 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No questions added yet.</p>
              )}

              {/* Add Question Form */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Add / Edit Question
                </h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Question Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={question.title}
                    onChange={handleQuestionChange}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="free_text">Free Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                </div>

                {question.question_type === "multiple_choice" && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                    <p className="font-semibold text-gray-700">Choices</p>
                    {question.choices.map((choice, index) => (
                      <div key={index} className="mb-2 flex gap-2">
                        <input
                          question_type="text"
                          value={choice}
                          onChange={(e) => handleChoiceChange(index, e)}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 invalid:border-red-500 valid:border-green-500"
                          required
                        />
                        {question.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteChoice(index)}
                            className="px-3 py-2 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddChoice}
                      className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                    >
                      Add Choice
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    question.openEdit
                      ? handleSaveEditedQuestion
                      : handleAddQuestion
                  }
                  className="w-full mt-6 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
                >
                  {question.openEdit ? "Update Question" : "Add Question"}
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleSaveSurvey}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition"
              >
                {creating ? "در حال ذخیره..." : "Save Survey"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyCreate;
