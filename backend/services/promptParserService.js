exports.parsePrompt = async (prompt)=>{

const lower = prompt.toLowerCase();

const rules={};

const match = lower.match(/(\d+)\s+questions?\s+of\s+(\d+)\s*marks?/);

if(match){

rules.simpleQuestions=true;
rules.totalQuestions=parseInt(match[1]);
rules.marks=parseInt(match[2]);

return rules;

}

return null;

}