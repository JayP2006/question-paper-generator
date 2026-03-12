const Question = require('../models/Question');
const Syllabus = require('../models/Syllabus');

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

exports.generatePaperData = async (blueprintId, rules=null) => {

    const Blueprint = require("../models/Blueprint");

    const blueprint = await Blueprint.findById(blueprintId);

    if(!blueprint) throw new Error("Blueprint not found");

    const generated = {questions:[]};

    const q3 = shuffle(await Question.find({marks:3}));
    const q4 = shuffle(await Question.find({marks:4}));
    const q7 = shuffle(await Question.find({marks:7}));

    let i3=0,i4=0,i7=0;

    let pattern = blueprint.questions;

    if(rules && rules.totalQuestions){
        pattern = pattern.slice(0,rules.totalQuestions);
    }

    for(const q of pattern){

        const parts=[];

        for(const part of q.parts){

            let selected;

            if(part.marks===3){
                selected=q3[i3++ % q3.length];
            }
            else if(part.marks===4){
                selected=q4[i4++ % q4.length];
            }
            else{
                selected=q7[i7++ % q7.length];
            }

            parts.push({
                label:part.label,
                marks:selected.marks,
                questionText:selected.questionText
            });

        }

        generated.questions.push({
            number:q.number,
            parts
        });

    }

    return generated;

};