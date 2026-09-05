import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/home.jsx"
import SurveyCreate from "./components/surveyCreate.jsx";
import { persistor, store } from "./store.js";
import { Provider } from "react-redux";
import LoginForm from "./components/loginForm.jsx";
import { PersistGate } from "redux-persist/integration/react";
import { setupInterceptors } from "./api/interceptor";
import Register from "./components/register.jsx";
import SurveyEditPage from "./components/surveyEdit.jsx";
import ProtectedRoute from "./routes/protected.jsx";
import SurveyDetail from "./components/surveyDetail.jsx";
import SurveyResponse from "./components/surveyResponse.jsx";
import SurveyResults from "./components/surveyResults.jsx";
import Profile from "./components/profile.jsx";
import ErrorPage from "./components/errorPage.jsx";

setupInterceptors();
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },

      { path: "/register", element: <Register /> },
      { path: "/login", element: <LoginForm /> },
      { path:"/survey/response/:slug", element: <SurveyResponse/>},
      { path: "/survey/:slug", element: <SurveyDetail/>},
      {
        element: <ProtectedRoute />,
        children: [
          { path:"/profile" , element:<Profile/>},
          { path: "/survey/new", element: <SurveyCreate /> },
          { path: "/survey/edit/:slug", element: <SurveyEditPage /> },
          { path: "/survey/results/:slug", element: <SurveyResults/>},
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>
);
