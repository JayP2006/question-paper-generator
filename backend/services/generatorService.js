const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

exports.generatePaperData = async (blueprintId) => {

    const Blueprint = require('../models/Blueprint');
    const blueprint = await Blueprint.findById(blueprintId);

    if (!blueprint) throw new Error("Blueprint not found");

    const generatedContent = { questions: [] };

    const q3 = shuffle(await Question.find({ marks: 3 }));
    const q4 = shuffle(await Question.find({ marks: 4 }));
    const q7 = shuffle(await Question.find({ marks: 7 }));

    let i3 = 0;
    let i4 = 0;
    let i7 = 0;

    for (const bq of blueprint.questions) {

        const generatedQ = {
            number: bq.number,
            parts: []
        };

        for (const part of bq.parts) {

            let selectedQ = null;

            // FORCE VALID MARKS
            if (part.marks === 3) {

                if (i3 >= q3.length) i3 = 0;
                selectedQ = q3[i3++];

            }

            else if (part.marks === 4) {

                if (i4 >= q4.length) i4 = 0;
                selectedQ = q4[i4++];

            }

            else {  // treat everything else as 7

                if (i7 >= q7.length) i7 = 0;
                selectedQ = q7[i7++];

            }

            generatedQ.parts.push({
                label: part.label,
                marks: selectedQ.marks,
                questionText: selectedQ.questionText
            });

        }

        generatedContent.questions.push(generatedQ);

    }

    return generatedContent;
};