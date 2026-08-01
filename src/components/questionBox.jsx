// import { useDispatch, useSelector } from "react-redux";
// import { addOption, setQuestionText, setQuestionType } from "../slices/questionSlice";



// const QuestionBox = ({ questionId, questionText, questionType, options }) => {
//    const useAppDispatch = useDispatch;
//  const useAppSelector = useSelector;
//   const dispatch = useAppDispatch();

//   // تغییرات محلی برای نمایش سوال و گزینه‌ها
//   const handleSetQuestionText = (e) => {
//     dispatch(setQuestionText({ questionId, text: e.target.value }));
//   };

//   const handleSetQuestionType = (e) => {
//     dispatch(setQuestionType({ questionId, type: e.target.value }));
//   };

//   const handleAddOption = () => {
//     dispatch(addOption({ questionId, optionText: "" }));
//   };

//   const handleOptionChange = (index, value) => {
//     const updatedOptions = [...options];
//     updatedOptions[index] = value;
//     // به‌روزرسانی گزینه‌ها با dispatch
//     dispatch(addOption({ questionId, optionText: value }));
//   };

//   return (
//     <div className="question-box">
//       <div>
//         <label>Question</label>
//         <input
//           type="text"
//           value={questionText}
//           className="w-full border rounded-2xl h-[50px] p-4"
//           onChange={handleSetQuestionText}
//           placeholder="Enter Your Question"
//         />
//       </div>

//       <div className="my-4 bg-gray-300 w-[50%] p-5 rounded">
//         <label>Question Type:</label>
//         <select value={questionType} onChange={handleSetQuestionType}>
//           <option value="text">Text Answer</option>
//           <option value="multiple">Multiple</option>
//         </select>
//       </div>

//       {questionType === "multiple" && (
//         <div className="bg-purple-400 rounded p-4 text-white w-[100%]">
//           <label>Choices: </label>
//           {options.map((option, index) => (
//             <div key={index} className="flex justify-between mt-3">
//               <div className="flex justify-center items-center">
//                 <input
//                   type="radio"
//                   id={`option-${index}`}
//                   name="option-group"
//                   value={option}
//                   onChange={(e) => handleOptionChange(index, e.target.value)}
//                 />
//                 <input
//                   type="text"
//                   value={option}
//                   onChange={(e) => handleOptionChange(index, e.target.value)}
//                   placeholder={`Choice ${index + 1}`}
//                 />
//               </div>
//             </div>
//           ))}
//           <button type="button" onClick={handleAddOption}>
//             Add Option +
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionBox;
