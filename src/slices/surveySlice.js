import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/axios";
import Swal from 'sweetalert2';


export const fetchSurveys = createAsyncThunk(
  "surveys/fetchSurveys",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/survey/");
      return Array.isArray(data) ? data : (data?.results ?? []);
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "خطا در گرفتن لیست survey ها"
      );
    }
  }
);


export const createSurvey = createAsyncThunk(
  "surveys/createSurvey",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/survey/",
        payload
      );
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "خطا در ساخت survey"
      );
    }
  }
);


export const deleteSurvey = createAsyncThunk(
  "surveys/deleteSurvey",
  async (surveySlug, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/survey/${surveySlug}/`);
      return surveySlug;  // Return the slug so the item can be removed from the Redux state.
    } catch (err) {
      return rejectWithValue(
        err?.response?.data || err?.message || "خطا در حذف survey"
      );
    }
  }
);


export const updateSurveyThunk = createAsyncThunk(
  "surveys/updateSurvey",
  async (surveyData, { rejectWithValue }) => {
    console.log(surveyData)
    try {
      const response = await api.put(`/survey/${surveyData.slug}/`, {
        title: surveyData.title,
        description: surveyData.description,
        questions: surveyData.questions,  
        is_active: surveyData.is_active,
        is_public: surveyData.is_public,
      });
      console.log("UPDATE RESPONSE FROM BACKEND:", response.data);

      if (response.status === 200) {
        
        Swal.fire('بروزرسانی شد!', 'نظرسنجی با موفقیت ویرایش شد.', 'success');
      } else {
        throw new Error(response.data.error || 'خطا در بروزرسانی نظرسنجی');
        
      }
      return response.data;
    } catch (err) {
      Swal.fire('خطا', err.message, 'error');
      return rejectWithValue(
        err?.response?.data || err?.message || 'خطا در بروزرسانی نظرسنجی'
      );
    }
  }
);

const initialState = {
  surveys: [],
  loadingList: false,
  creating: false,
  error: null,
};

const surveySlice = createSlice({
  name: "surveys",
  initialState,
  reducers: {
    addSurvey: (state, action) => {
      state.surveys.push(action.payload);
    },
    updateSurveyInState: (state, action) => {
      const updatedSurvey = action.payload;
      const idx = state.surveys.findIndex((s) => s.id === updatedSurvey.id);
      if (idx !== -1) {
        state.surveys[idx] = updatedSurvey;
      }
    },
    clearSurveyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchSurveys.pending, (state) => {
        state.loadingList = true;
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.loadingList = false;
        state.error = null;
        state.surveys = action.payload;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loadingList = false;
        state.error = action.payload || "گرفتن لیست survey ها ناموفق بود";
      })

      // create
      .addCase(createSurvey.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.creating = false;
        state.error = null;
        const idx = state.surveys.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.surveys[idx] = action.payload;
        else state.surveys.unshift(action.payload);
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "ساخت survey ناموفق بود";
      })

      // delete
      .addCase(deleteSurvey.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteSurvey.fulfilled, (state, action) => {
        const surveySlug = action.payload;
        state.surveys = state.surveys.filter((survey) => survey.slug !== surveySlug);
      })
      .addCase(deleteSurvey.rejected, (state, action) => {
        state.error = action.payload || "حذف survey ناموفق بود";
      })

      // update
      .addCase(updateSurveyThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateSurveyThunk.fulfilled, (state, action) => {
        const updatedSurvey = action.payload;
        const idx = state.surveys.findIndex((s) => s.id === updatedSurvey.id);
        if (idx !== -1) {
          state.surveys[idx] = updatedSurvey;
        }
      })
      .addCase(updateSurveyThunk.rejected, (state, action) => {
        state.error = action.payload || "بروزرسانی نظرسنجی ناموفق بود";
      });
  },
});

export const { addSurvey, updateSurveyInState, clearSurveyError } = surveySlice.actions;
export default surveySlice.reducer;
