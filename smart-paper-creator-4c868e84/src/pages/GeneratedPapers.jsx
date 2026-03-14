import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, FileText, Search } from 'lucide-react';
import { getGeneratedPapers, downloadPaper, deletePaper } from '../services/api';
import { toast } from 'sonner';

export default function GeneratedPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await getGeneratedPapers();
      setPapers(res.data?.papers || res.data || []);
    } catch {
      // Use mock data
      setPapers([
        { _id: '1', subject: 'Data Structures', createdAt: '2025-03-10', totalMarks: 100 },
        { _id: '2', subject: 'Operating Systems', createdAt: '2025-03-09', totalMarks: 75 },
        { _id: '3', subject: 'DBMS', createdAt: '2025-03-08', totalMarks: 100 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await downloadPaper(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paper_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePaper(id);
      setPapers(papers.filter((p) => (p._id || p.id) !== id));
      toast.success('Paper deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = papers.filter((p) =>
    (p.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Generated Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all generated question papers</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject..."
            className="pl-9 pr-4 py-2 rounded-lg bg-muted border border-input text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none w-64"
          />
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paper ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marks</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-muted rounded animate-pulse w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No papers found</td></tr>
            ) : (
              filtered.map((p) => {
                const id = p._id || p.id;
                return (
                  <tr key={id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">#{id?.slice(-6)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{p.subject}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{p.totalMarks || p.paperConfig?.totalMarks || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleDownload(id)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
