import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Briefcase,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
  Award,
  Target,
  Zap,
  BookOpen,
  X,
  ArrowRight
} from 'lucide-react';

function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);


  const handleFileUpload = (file) => {
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setError(null);
    } else {
      setError('Please upload a valid PDF file');
      setResumeFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  const clearResume = () => {
    setResumeFile(null);
    setResults(null);
  };

  // API Call 
  const analyzeResume = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      const transformedResults = {
        overallMatch: Number(data.final_match_percentage.toFixed(2)),
        sections: {
          skills: { score: Number(data.skill_match_percentage.toFixed(2)) },
          experience: { score: Number(data.semantic_match_percentage.toFixed(2)) },
          education: { score: Number((data.semantic_match_percentage * 0.9).toFixed(2)) }
        },
        matchedSkills: data.matched_skills || [],
        missingSkills: data.missing_skills || [],
        recommendations: (data.missing_skills || []).map(
          (skill) => `Improve your proficiency in ${skill} to increase job match accuracy.`
        )
      };

      setResults(transformedResults);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  
  const getScoreLabel = (score) => {
    if (score >= 75) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    return 'Needs Improvement';
  };

  const getScoreColor = (score) => {
    if (score >= 75) return '#10b981';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreBg = (score) => {
    if (score >= 75) return 'from-emerald-500 to-green-600';
    if (score >= 50) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };


  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100%', 
      background: '#0f172a',
      color: 'white',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Animated Background */}
      <div style={{ 
        position: 'fixed', 
        inset: 0, 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: '25%', 
          width: '384px', 
          height: '384px', 
          background: 'rgba(168, 85, 247, 0.2)', 
          borderRadius: '9999px', 
          filter: 'blur(96px)' 
        }}></div>
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          right: '25%', 
          width: '384px', 
          height: '384px', 
          background: 'rgba(59, 130, 246, 0.2)', 
          borderRadius: '9999px', 
          filter: 'blur(96px)' 
        }}></div>
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg shadow-purple-500/50">
                <Sparkles size={32} />
              </div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Smart Recruitment
              </h1>
            </div>
            <p className="text-slate-400 text-xl">AI-Powered Resume & Job Description Matcher</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-7xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3">
              <AlertCircle className="text-red-400" size={24} />
              <span className="text-red-200">{error}</span>
            </div>
          </div>
        )}

        {/* Input Cards */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Resume Upload */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="text-purple-400" size={28} />
                <h2 className="text-2xl font-bold">Upload Resume</h2>
              </div>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/5'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  {!resumeFile ? (
                    <div>
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/10 rounded-2xl mb-4">
                        <FileText className="text-purple-400" size={40} />
                      </div>
                      <p className="text-lg font-semibold mb-2">Drop your resume here</p>
                      <p className="text-slate-400 text-sm">or click to browse • PDF only</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <CheckCircle className="text-green-400" size={24} />
                      <span className="font-medium text-green-300 flex-1 truncate">{resumeFile.name}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          clearResume();
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="text-red-400" size={20} />
                      </button>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="text-blue-400" size={28} />
                <h2 className="text-2xl font-bold">Job Description</h2>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={10}
                placeholder="Paste the job description here..."
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
                <Target size={16} />
                <span>{jobDescription.length} characters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <button
            onClick={analyzeResume}
            disabled={loading || !resumeFile || !jobDescription.trim()}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            {loading ? (
              <>
                <Loader className="animate-spin" size={24} />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={24} />
                Analyze Match
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {results && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overall Match */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-10 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <svg className="transform -rotate-90" width="200" height="200">
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      stroke="#1e293b"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="85"
                      stroke={getScoreColor(results.overallMatch)}
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 85}`}
                      strokeDashoffset={`${2 * Math.PI * 85 * (1 - results.overallMatch / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black" style={{ color: getScoreColor(results.overallMatch) }}>
                      {results.overallMatch}%
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="text-purple-400" size={32} />
                    <h2 className="text-3xl font-bold">Overall Match Score</h2>
                  </div>
                  <p className={`text-4xl font-black mb-2 bg-gradient-to-r ${getScoreBg(results.overallMatch)} bg-clip-text text-transparent`}>
                    {getScoreLabel(results.overallMatch)}
                  </p>
                  <p className="text-slate-400 text-lg">Based on skills, experience, and qualifications</p>
                </div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={28} />
                    <h3 className="text-2xl font-bold">Matched Skills</h3>
                  </div>
                  <span className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl font-bold">
                    {results.matchedSkills.length}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {results.matchedSkills.length > 0 ? (
                    results.matchedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-2 rounded-xl font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500">No matching skills found</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-orange-400" size={28} />
                    <h3 className="text-2xl font-bold">Missing Skills</h3>
                  </div>
                  <span className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-xl font-bold">
                    {results.missingSkills.length}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {results.missingSkills.length > 0 ? (
                    results.missingSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-orange-500/10 border border-orange-500/30 text-orange-300 px-4 py-2 rounded-xl font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-500">All required skills are present</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-blue-400" size={28} />
                <h3 className="text-2xl font-bold">Recommendations</h3>
              </div>
              
              {results.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {results.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <Award className="text-blue-400 mt-1 flex-shrink-0" size={24} />
                      <span className="text-slate-300">{rec}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No recommendations at this time</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;