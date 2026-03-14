import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { getQuestions } from '../services/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', unit: '', difficulty: '', search: '' });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await getQuestions();
      setQuestions(res.data?.questions || res.data || []);
    } catch {
      setQuestions([
        { _id: '1', question: 'Explain the difference between stack and queue.', subject: 'Data Structures', unit: 'Unit 1', difficulty: 'Easy', marks: 5 },
        { _id: '2', question: 'Write a program for binary search tree insertion.', subject: 'Data Structures', unit: 'Unit 3', difficulty: 'Medium', marks: 10 },
        { _id: '3', question: 'Describe the concept of normalization in DBMS.', subject: 'DBMS', unit: 'Unit 2', difficulty: 'Medium', marks: 8 },
        { _id: '4', question: 'Compare preemptive and non-preemptive scheduling.', subject: 'Operating Systems', unit: 'Unit 4', difficulty: 'Hard', marks: 10 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = questions.filter((q) => {
    if (filters.subject && q.subject !== filters.subject) return false;
    if (filters.unit && q.unit !== filters.unit) return false;
    if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
    if (filters.search && !q.question?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const subjects = [...new Set(questions.map((q) => q.subject).filter(Boolean))];
  const units = [...new Set(questions.map((q) => q.unit).filter(Boolean))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          Question Bank
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and filter your stored questions</p>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search questions..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filters.unit}
            onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
            className="px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Units</option>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-elevated p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No questions found</div>
        ) : (
          filtered.map((q, i) => (
  <div key={q._id || i} className="card-elevated p-5 hover:shadow-lg transition-shadow">

    <p className="text-foreground font-medium text-sm">
      {q.questionText || q.question}
    </p>

    <div className="flex gap-2 mt-3 flex-wrap">

      {q.subject && (
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
          {q.subject}
        </span>
      )}

      {q.unit && (
        <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
          {q.unit}
        </span>
      )}

      {q.difficulty && (
        <span className={`text-xs px-2 py-1 rounded-full ${
          q.difficulty === 'Easy'
            ? 'bg-green-500/10 text-green-600'
            : q.difficulty === 'Hard'
            ? 'bg-red-500/10 text-red-600'
            : 'bg-yellow-500/10 text-yellow-600'
        }`}>
          {q.difficulty}
        </span>
      )}

      {q.marks && (
        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
          {q.marks} marks
        </span>
      )}

    </div>

  </div>
))
        )}
      </div>
    </div>
  );
}
