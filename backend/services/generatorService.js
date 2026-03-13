const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
const Blueprint = require("../models/Blueprint");


exports.generatePaperData = async (blueprintId, rules = null) => {

  const blueprint = await Blueprint.findById(blueprintId);

  if (!blueprint) throw new Error("Blueprint not found");

  const q3 = shuffle(await Question.find({ marks: 3 }));
  const q4 = shuffle(await Question.find({ marks: 4 }));
  const q7 = shuffle(await Question.find({ marks: 7 }));

  let i3 = 0, i4 = 0, i7 = 0;

  const pattern = blueprint.questions;

  /* =====================================
     CASE 1 — PROMPT BASED GENERATION
  ===================================== */

  if (rules) {

    const result = { questions: [] };

    const totalQuestions = rules.totalQuestions || pattern.length;
    const marks = rules.marks || 7;

    for (let i = 0; i < totalQuestions; i++) {

      let q;

      if (marks === 3) {
        q = q3[i3++ % q3.length];
      }
      else if (marks === 4) {
        q = q4[i4++ % q4.length];
      }
      else {
        q = q7[i7++ % q7.length];
      }

      result.questions.push({
        number: i + 1,
        parts: [
          {
            label: "a",
            marks: q.marks,
            questionText: q.questionText
          }
        ]
      });

    }

    return result;
  }

  /* =====================================
     CASE 2 — BLUEPRINT BASED GENERATION
  ===================================== */

  const generated = { questions: [] };

  for (let i = 0; i < pattern.length; i++) {

    const blueprintQuestion = pattern[i];

    const generatedParts = [];

    for (let p = 0; p < blueprintQuestion.parts.length; p++) {

      const part = blueprintQuestion.parts[p];

      let q;

      if (part.marks === 3) {
        q = q3[i3++ % q3.length];
      }
      else if (part.marks === 4) {
        q = q4[i4++ % q4.length];
      }
      else {
        q = q7[i7++ % q7.length];
      }

      generatedParts.push({
        label: part.label,
        marks: q.marks,
        questionText: q.questionText
      });

    }

    generated.questions.push({
      number: i + 1,
      parts: generatedParts
    });

  }

  return generated;

};