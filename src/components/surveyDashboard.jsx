import { Link } from "react-router-dom";
import { Pencil, Trash2, Share2 } from "lucide-react";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { deleteSurvey } from "../slices/surveySlice";

export default function SurveyDashboard({ surveys }) {
  const dispatch = useDispatch();

  const handleDeleteSurvey = (surveySlug) => {
    // Normalize the slug before sending it to the API.
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
        dispatch(deleteSurvey(formattedTitle));
        Swal.fire("Deleted!", "Survey deleted successfully!", "success");
      }
    });
  };

  const handleCopy = async (surveySlug) => {
    try {
      await navigator.clipboard.writeText(
        `http://localhost:5173/survey/response/${surveySlug}`,
      );
      Swal.fire("Link Copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy link");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-4 sm:py-6 md:p-6">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Survey Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and track your surveys
            </p>
          </div>

          <Link
            to="/survey/new/"
            className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            + Create Survey
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-slate-500">Total Surveys</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-3xl font-bold text-slate-800">
                {surveys.length}
              </h2>

              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                +12%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-slate-500">Active Surveys</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-3xl font-bold text-slate-800">
                {surveys.filter((item) => item.is_active).length}
              </h2>

              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                Active
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-slate-500">Total Responses</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-3xl font-bold text-slate-800">
                {surveys.reduce(
                  (total, item) => total + item.total_responses,
                  0,
                )}
              </h2>

              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                +18%
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-sm text-slate-500">Completion Rate</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <h2 className="text-3xl font-bold text-slate-800">78%</h2>

              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                +5%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-800">Recent Surveys</h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest surveys and their activity
              </p>
            </div>

            {/* TODO: Add pagination or a page showing all surveys. */}
            <button className="self-start text-sm font-medium text-indigo-600 hover:text-indigo-700 sm:self-auto">
              View all
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium sm:px-6 sm:py-4">
                    Survey
                  </th>

                  <th className="px-4 py-3 font-medium sm:px-6 sm:py-4">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium sm:px-6 sm:py-4">
                    Responses
                  </th>

                  <th className="px-4 py-3 font-medium sm:px-6 sm:py-4">
                    Privacy
                  </th>

                  <th className="px-4 py-3 font-medium sm:px-6 sm:py-4">
                    Result
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {surveys.map((survey) => (
                  <tr className="transition hover:bg-slate-50" key={survey.id}>
                    <td className="max-w-[260px] px-4 py-3 sm:px-6 sm:py-4">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-slate-800">
                          {survey.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          customer-satisfaction
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <span
                        className={
                          survey.is_active
                            ? "whitespace-nowrap rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600"
                            : "whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
                        }
                      >
                        {survey.is_active ? "Active" : "Closed"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-600 sm:px-6 sm:py-4">
                      {survey.total_responses}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500 sm:px-6 sm:py-4">
                      {survey.is_public ? "public" : "private"}
                    </td>

                    <td className="px-4 py-3 sm:px-6 sm:py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/survey/results/${survey.slug}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          View
                        </Link>

                        <Link
                          to={`/survey/edit/${survey.slug}`}
                          title="Edit"
                          aria-label="Edit survey"
                          className="text-slate-400 transition hover:text-indigo-600"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          title="Delete"
                          aria-label="Delete survey"
                          onClick={() => handleDeleteSurvey(survey.slug)}
                          className="text-slate-400 transition hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>

                        <button
                          type="button"
                          title="Share"
                          aria-label="Share survey"
                          onClick={() => handleCopy(survey.slug)}
                          className="text-slate-400 transition hover:text-emerald-600"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
