// // questionSlice.ts
// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   questions: [],
// };

// const questionSlice = createSlice({
//   name: 'questions',
//   initialState,
//   reducers: {
//     // اضافه کردن سوال جدید
//     addQuestion: (state) => {
//       state.questions.push({
//         id: state.questions.length + 1,
//         text: '',
//         type: 'text', // نوع پیش‌فرض سوال "text" است
//         options: [],
//       });
//     },

//     // تغییر متن سوال
//     setQuestionText: (state, action) => {
//       const { questionId, text } = action.payload;
//       const question = state.questions.find(q => q.id === questionId);
//       if (question) {
//         question.text = text;
//       }
//     },

//     // تغییر نوع سوال
//     setQuestionType: (state, action) => {
//       const { questionId, type } = action.payload;
//       const question = state.questions.find(q => q.id === questionId);
//       if (question) {
//         question.type = type;
//       }
//     },

//     // اضافه کردن گزینه به سوالات چندگزینه‌ای
//     addOption: (state, action) => {
//       const { questionId, optionText } = action.payload;
//       const question = state.questions.find(q => q.id === questionId);
//       if (question && question.type === 'multiple') {
//         question.options.push(optionText);
//       }
//     },

//     // بازنشانی سوالات
//     resetQuestions: (state) => {
//       state.questions = [];
//     },
//   },
// });

// export const { addQuestion, setQuestionText, setQuestionType, addOption, resetQuestions } = questionSlice.actions;
// export default questionSlice.reducer;
