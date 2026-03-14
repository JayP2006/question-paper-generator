import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Wand2,
  CheckCircle2,
  ChevronDown,
  Info,
  Layers,
  Settings2,
  MessageSquare,
} from 'lucide-react';
import FileUploader from '../components/FileUploader';
import AILoader from '../components/Loader';
import { uploadSyllabus, uploadPreviousPapers, generatePaper, downloadPaper } from '../services/api';
import { toast } from 'sonner';

export default function SmartGenerator() {
  // State
  const [syllabusFiles, setSyllabusFiles] = useState([]);
  const [prevPaperFiles, setPrevPaperFiles] = useState([]);
  const [blueprintId, setBlueprintId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [config, setConfig] = useState({
    subject: '',
    examType: '',
    totalMarks: 100,
    numberOfQuestions: 10,
    difficulty: 'Medium',
  });
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [syllabusUploaded, setSyllabusUploaded] = useState(false);
  const [papersUploaded, setPapersUploaded] = useState(false);

  // Upload syllabus
  const handleUploadSyllabus = async () => {
    if (!syllabusFiles.length) return toast.error('Please select a syllabus file');
    const fd = new FormData();
    syllabusFiles.forEach((f) => fd.append('file', f));
    try {
      await uploadSyllabus(fd);
      setSyllabusUploaded(true);
      toast.success('Syllabus uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload syllabus');
    }
  };

  // Upload previous papers
  const handleUploadPapers = async () => {
    if (!prevPaperFiles.length) return toast.error('Please select previous papers');
    const fd = new FormData();
    prevPaperFiles.forEach((f) => fd.append('files', f));
    try {
      const res = await uploadPreviousPapers(fd);
      const bid = res.data?.blueprintId || res.data?.blueprint_id || res.data?.id;
      if (bid) {
        setBlueprintId(bid);
        toast.success('Papers processed! Blueprint ID generated.');
      }
      if (res.data?.metadata) setMetadata(res.data.metadata);
      setPapersUploaded(true);
    } catch (err) {
      toast.error('Failed to upload previous papers');
    }
  };

  // Generate paper
  const handleGenerate = async (withPrompt = true) => {
    if (!blueprintId) return toast.error('Blueprint ID is required');
    if (!config.subject) return toast.error('Please enter subject name');

    setGenerating(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 12;
      });
    }, 600);

    try {
      const payload = {
        blueprintId,
        prompt: withPrompt ? prompt : '',
        paperConfig: config,
      };
      const res = await generatePaper(payload);
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setGenerating(false);
        setGeneratedPaper({
  id: res.data.paperId
});
        toast.success('Paper generated successfully!');
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setGenerating(false);
      setProgress(0);
      toast.error('Failed to generate paper');
    }
  };

  // Download
  const handleDownload = async () => {
    const paperId = generatedPaper?.id || generatedPaper?._id;
    if (!paperId) return toast.error('No paper to download');
    try {
      const res = await downloadPaper(paperId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paper_${paperId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  if (generating) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <AILoader progress={progress} />
      </div>
    );
  }

  // Paper preview
  if (generatedPaper) {
    const paper = generatedPaper;
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-foreground">Generated Paper</h1>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg ai-gradient-bg text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Download PDF
            </button>
            <button
              onClick={() => { setGeneratedPaper(null); setProgress(0); }}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>

        <div className="card-elevated p-8">
          {/* Paper Header */}
          <div className="text-center border-b border-border pb-6 mb-6">
            <h2 className="text-xl font-heading font-bold text-foreground">{paper.paperConfig?.subject || config.subject || 'Examination'}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {paper.paperConfig?.examType || config.examType || 'End Semester'} | Total Marks: {paper.paperConfig?.totalMarks || config.totalMarks}
            </p>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {(paper.questions || paper.paper?.questions || []).map((q, i) => (
              <div key={i} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex justify-between items-start">
                  <p className="text-foreground font-medium">
                    <span className="text-primary font-bold mr-2">Q{i + 1}.</span>
                    {q.question || q.text || q}
                  </p>
                  {q.marks && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full ml-4 flex-shrink-0">
                      {q.marks} marks
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          Smart Paper Generator
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your syllabus and previous papers to generate AI-powered question papers
        </p>
      </div>

      {/* Step 1 — Syllabus Upload */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${syllabusUploaded ? 'bg-green-500/10 text-green-600' : 'ai-gradient-bg text-primary-foreground'}`}>
            {syllabusUploaded ? <CheckCircle2 className="w-5 h-5" /> : '1'}
          </div>
          <h2 className="font-heading font-semibold text-foreground text-lg">Upload Syllabus</h2>
        </div>
        <FileUploader
          onFilesSelected={setSyllabusFiles}
          accept=".pdf,.doc,.docx,.txt"
          label="Drop your syllabus file here"
          description="Accepted: PDF, DOC, DOCX, TXT"
        />
        <button
          onClick={handleUploadSyllabus}
          disabled={!syllabusFiles.length}
          className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload Syllabus
        </button>
      </section>

      {/* Step 2 — Previous Papers */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${papersUploaded ? 'bg-green-500/10 text-green-600' : 'ai-gradient-bg text-primary-foreground'}`}>
            {papersUploaded ? <CheckCircle2 className="w-5 h-5" /> : '2'}
          </div>
          <h2 className="font-heading font-semibold text-foreground text-lg">Upload Previous Papers</h2>
        </div>
        <FileUploader
          onFilesSelected={setPrevPaperFiles}
          accept=".pdf,.doc,.docx,.txt"
          multiple
          label="Drop previous question papers here"
          description="Upload multiple papers for better analysis"
        />
        <button
          onClick={handleUploadPapers}
          disabled={!prevPaperFiles.length}
          className="mt-4 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Upload className="w-4 h-4 inline mr-2" />
          Upload & Process Papers
        </button>
      </section>

      {/* Step 3 — Blueprint Info */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${blueprintId ? 'bg-green-500/10 text-green-600' : 'ai-gradient-bg text-primary-foreground'}`}>
            {blueprintId ? <CheckCircle2 className="w-5 h-5" /> : '3'}
          </div>
          <h2 className="font-heading font-semibold text-foreground text-lg flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Blueprint Info
          </h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Blueprint ID</label>
            <input
              value={blueprintId}
              onChange={(e) => setBlueprintId(e.target.value)}
              placeholder="Auto-generated after uploading papers"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          {metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metadata.subject && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-medium text-foreground text-sm">{metadata.subject}</p>
                </div>
              )}
              {metadata.units && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground">Units</p>
                  <p className="font-medium text-foreground text-sm">{Array.isArray(metadata.units) ? metadata.units.join(', ') : metadata.units}</p>
                </div>
              )}
              {metadata.topics && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground">Topics</p>
                  <p className="font-medium text-foreground text-sm">{Array.isArray(metadata.topics) ? metadata.topics.length : metadata.topics}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Step 4 — Paper Configuration */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full ai-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">4</div>
          <h2 className="font-heading font-semibold text-foreground text-lg flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            Paper Configuration
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subject</label>
            <input
              value={config.subject}
              onChange={(e) => setConfig({ ...config, subject: e.target.value })}
              placeholder="e.g., Data Structures"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Exam Type</label>
            <input
              value={config.examType}
              onChange={(e) => setConfig({ ...config, examType: e.target.value })}
              placeholder="e.g., End Semester"
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Total Marks</label>
            <input
              type="number"
              value={config.totalMarks}
              onChange={(e) => setConfig({ ...config, totalMarks: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
        
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Difficulty Level</label>
            <select
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-muted border border-input text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Step 5 — AI Prompt */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full ai-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">5</div>
          <h2 className="font-heading font-semibold text-foreground text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Custom AI Prompt
            <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
          </h2>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="e.g., Generate questions focusing on numerical problems from Unit 3 and Unit 4."
          className="w-full px-4 py-3 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
        />
      </section>

      {/* Step 6 — Generate */}
      <section className="card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full ai-gradient-bg flex items-center justify-center text-sm font-bold text-primary-foreground">6</div>
          <h2 className="font-heading font-semibold text-foreground text-lg">Generate Paper</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleGenerate(true)}
            className="flex-1 px-6 py-3 rounded-xl ai-gradient-bg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Wand2 className="w-5 h-5" />
            Generate with AI Prompt
          </button>
          <button
            onClick={() => handleGenerate(false)}
            className="flex-1 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate without Prompt
          </button>
        </div>
      </section>
    </div>
  );
}
