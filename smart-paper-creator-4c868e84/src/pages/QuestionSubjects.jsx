import React, { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuestions } from "../services/api";

export default function QuestionSubjects() {

  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {

    const res = await getQuestions();
    const questions = res.data?.questions || res.data || [];

    const map = {};

    questions.forEach(q => {

      const subject = q.topic || "Unknown";

      if (!map[subject]) {
        map[subject] = {
          subject,
          count: 0,
          frequency: 0
        };
      }

      map[subject].count += 1;
      map[subject].frequency += q.frequency || 0;

    });

    setSubjects(Object.values(map));
  };

  return (

    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary"/>
          Question Bank
        </h1>

        <p className="text-sm text-muted-foreground">
          Browse questions by subject
        </p>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">

        {subjects.map((s,i)=> (

          <div
            key={i}
            onClick={()=>navigate(`/questions/${s.subject}`)}
            className="card-elevated p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.03]"
          >

            <h3 className="font-semibold text-lg text-foreground">
              {s.subject}
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              {s.count} Questions
            </p>

            <div className="mt-4 text-xs text-primary">
              Total Frequency: {s.frequency}
            </div>

          </div>

        ))}

      </div>

    </div>

  );
}