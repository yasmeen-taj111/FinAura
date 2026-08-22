import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle2, ChevronRight, BookOpen, Clock, Award, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get('/learning/courses');
        const found = response.data.find(c => c._id === id);
        if (found) {
          setCourse(found);
        } else {
          setError('Course not found.');
        }
      } catch (err) {
        console.error('Error fetching course details', err);
        setError('Could not retrieve course contents.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-slate-100">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-secondary animate-spin"></div>
        </div>
        <p className="mt-4 text-brand-muted text-xs font-medium">Unpacking module curriculum...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen py-10 px-6 max-w-2xl mx-auto text-center flex flex-col items-center justify-center bg-brand-bg text-slate-100">
        <h2 className="text-xl font-bold text-brand-danger mb-2">Error</h2>
        <p className="text-brand-muted text-sm mb-6">{error || 'Course not found'}</p>
        <Link to="/learn" className="px-5 py-2 bg-indigo-600 rounded-xl font-bold text-sm text-white">
          Return to Academy
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6 md:px-12 relative overflow-hidden bg-brand-bg text-slate-100">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Back navigation */}
        <Link
          to="/learn"
          className="inline-flex items-center space-x-2 text-xs font-bold text-brand-secondary hover:text-white transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Academy Catalogue</span>
        </Link>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl p-8 border border-white/5 relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
              course.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-brand-success' :
              course.difficulty === 'Intermediate' ? 'bg-indigo-500/10 text-brand-secondary' :
              'bg-rose-500/10 text-brand-danger'
            }`}>
              {course.difficulty}
            </span>
            <span className="text-[10px] text-brand-muted font-medium bg-white/5 px-2 py-0.5 rounded">
              {course.category}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">{course.title}</h1>
          <p className="text-brand-muted text-sm leading-relaxed mb-6 max-w-3xl">{course.description}</p>

          {/* Completion Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-brand-muted block uppercase font-semibold">Lessons</span>
                <span className="text-sm font-bold text-slate-200">{course.progress.totalLessons} Syllabus Concepts</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-success">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-brand-muted block uppercase font-semibold">Completed</span>
                <span className="text-sm font-bold text-slate-200">{course.progress.completedLessons} Completed</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-warning">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-brand-muted block uppercase font-semibold">XP Available</span>
                <span className="text-sm font-bold text-brand-warning">+{course.xpReward} XP Reward</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modules Timeline */}
        <div className="space-y-8">
          <h2 className="text-lg font-bold text-white mb-2">Curriculum Map</h2>

          {course.modules.map((mod, modIdx) => (
            <div key={mod._id} className="relative pl-6 md:pl-8 border-l border-white/10 space-y-4">
              {/* Timeline marker */}
              <div className="absolute -left-[13px] top-1.5 w-6 h-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-[10px] font-bold text-brand-secondary">
                {modIdx + 1}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{mod.title}</h3>
                <p className="text-brand-muted text-xs">{mod.description}</p>
              </div>

              {/* Lessons Stack */}
              <div className="space-y-3">
                {mod.lessons.map((lesson) => (
                  <motion.div
                    key={lesson._id}
                    whileHover={{ x: 3 }}
                    className="p-4 bg-brand-card/40 hover:bg-brand-card/75 border border-white/5 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center space-x-3.5">
                      {lesson.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-success flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
                          <Play className="w-2.5 h-2.5 text-slate-500 fill-slate-500 ml-0.5" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{lesson.title}</h4>
                        <span className="text-[10px] text-brand-muted font-medium bg-white/5 px-2 py-0.5 rounded">
                          +{lesson.xpReward} XP
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/learn/lesson/${lesson._id}`}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer ${
                        lesson.completed
                          ? 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                          : 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-glow-primary'
                      }`}
                    >
                      <span>{lesson.completed ? 'Re-Read' : 'Start'}</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
