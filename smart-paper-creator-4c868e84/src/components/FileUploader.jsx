import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

export default function FileUploader({ onFilesSelected, accept, multiple = false, label, description }) {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(dropped);
    onFilesSelected?.(dropped);
  }, [onFilesSelected]);

  const handleChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    onFilesSelected?.(selected);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{label || 'Drop files here or click to browse'}</p>
            <p className="text-sm text-muted-foreground mt-1">{description || 'Supported: PDF, DOC, DOCX, TXT'}</p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
