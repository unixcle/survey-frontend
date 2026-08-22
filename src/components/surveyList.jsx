import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchSurveys, deleteSurvey } from "../slices/surveySlice";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { Share2 } from "lucide-react";

const SurveyList = () => {
  const dispatch = useDispatch();
  const { surveys, loadingList, error } = useSelector((s) => s.surveys);
  console.log(surveys)
  useEffect(() => {
    dispatch(fetchSurveys());
  }, [dispatch]);

  const handleDeleteSurvey = (surveySlug) => {
    console.log(surveySlug);
    const formattedTitle = encodeURIComponent(surveySlug.replace(/\s+/g, "-"));
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteSurvey(formattedTitle)); // حذف نظرسنجی
        Swal.fire("Deleted!", "Survey deleted successfully!", "success");
      }
    });
  };

  const handleCopy = async (surveySlug) => {
  try {
    await navigator.clipboard.writeText(
      `http://localhost:5173/survey/response/${surveySlug}`
    );
    Swal.fire("Link Copied!");
  } catch (err) {
    console.error(err);
    alert("Failed to copy link");
  }
};

  if (loadingList) return <div>Loading</div>;
  if (error) return <div className="text-red-600">{String(error)}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">Surveys</h1>
      <ul className="mt-4 grid grid-cols-2 gap-4">
        {surveys.map((survey) => (
          <li
            key={survey.id}
            className="bg-blue-100 p-5 shadow-lg rounded-2xl h-[160px]"
          >
            <p className="font-semibold mt-1">
              <span className="font-bold">Title: </span> {survey.title}
            </p>
            <p className="font-semibold mt-1">
              <span className="font-bold">Question Count: </span>
              {survey.question_count}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={`/survey/response/${survey.slug}`}>
                <button
                  className="px-3 py-1 bg-black text-white rounded-xl"
                >
                  Answer Survey
                </button>
              </Link>

              <button onClick={()=>handleCopy(survey.slug)} className="px-3 py-1 bg-black text-white rounded-xl flex items-center gap-2 cursor-pointer">
                <Share2 size={18} />
                <span>Copy Link</span>
              </button>

              <Link to={`/survey/edit/${survey.slug}`}>
                <button className="px-3 py-1 bg-blue-400 text-white rounded-xl disabled:opacity-50">
                  Edit
                </button>
              </Link>

              <button
                className="px-3 py-1 bg-red-500 text-white rounded-xl cursor-pointer"
                onClick={() => handleDeleteSurvey(survey.slug)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/survey/new">
        <button className="mt-4 px-4 py-2 bg-green-500 rounded-xl text-white">
          Create New Survey
        </button>
      </Link>
    </div>
  );
};

export default SurveyList;
