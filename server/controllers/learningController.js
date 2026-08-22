const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const UserProgress = require('../models/UserProgress');
const Badge = require('../models/Badge');

// Helper to level up based on XP (500 XP per level)
const calculateLevel = (xp) => {
  return Math.floor(xp / 500) + 1;
};

// Helper to check and unlock badge
const awardBadge = async (progress, badgeCode) => {
  const badge = await Badge.findOne({ code: badgeCode });
  if (!badge) return null;

  // Check if already earned
  const alreadyEarned = progress.earnedBadges.some(
    (b) => b.badgeId.toString() === badge._id.toString()
  );

  if (!alreadyEarned) {
    progress.earnedBadges.push({ badgeId: badge._id, earnedAt: new Date() });
    progress.xp += badge.xpReward;
    return badge;
  }
  return null;
};

/**
 * @desc    Get all courses with modules, lessons, and completion status
 * @route   GET /api/learning/courses
 * @access  Private
 */
const getCourses = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user progress
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = await UserProgress.create({ userId });
    }

    const completedLessonIds = progress.completedLessons.map((l) =>
      l.lessonId.toString()
    );

    // Fetch courses
    const courses = await Course.find().lean();
    const result = [];

    for (const course of courses) {
      // Fetch modules for this course
      const modules = await Module.find({ courseId: course._id })
        .sort({ order: 1 })
        .lean();

      const moduleList = [];
      let courseCompletedLessons = 0;
      let courseTotalLessons = 0;

      for (const mod of modules) {
        // Fetch lessons for this module
        const lessons = await Lesson.find({ moduleId: mod._id })
          .sort({ order: 1 })
          .select('-content') // Don't send heavy contents in list view
          .lean();

        const lessonList = lessons.map((lesson) => {
          courseTotalLessons++;
          const isCompleted = completedLessonIds.includes(lesson._id.toString());
          if (isCompleted) {
            courseCompletedLessons++;
          }
          return {
            ...lesson,
            completed: isCompleted,
          };
        });

        moduleList.push({
          ...mod,
          lessons: lessonList,
        });
      }

      const percentComplete = courseTotalLessons > 0 
        ? Math.round((courseCompletedLessons / courseTotalLessons) * 100)
        : 0;

      result.push({
        ...course,
        modules: moduleList,
        progress: {
          totalLessons: courseTotalLessons,
          completedLessons: courseCompletedLessons,
          percentComplete,
        },
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get lesson content and safe quiz details
 * @route   GET /api/learning/lessons/:id
 * @access  Private
 */
const getLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId).lean();

    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    // Fetch corresponding quiz
    const quiz = await Quiz.findOne({ lessonId }).lean();
    let safeQuiz = null;

    if (quiz) {
      // Strip correct answers and explanations to prevent cheating
      safeQuiz = {
        _id: quiz._id,
        passingScore: quiz.passingScore,
        xpReward: quiz.xpReward,
        questions: quiz.questions.map((q, idx) => ({
          question: q.question,
          options: q.options,
          index: idx,
        })),
      };
    }

    res.status(200).json({
      lesson,
      quiz: safeQuiz,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit quiz answers and evaluate
 * @route   POST /api/learning/lessons/:id/quiz
 * @access  Private
 */
const submitQuiz = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user._id;
    const { answers } = req.body; // Array of { index: Number, selectedOption: String }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404);
      throw new Error('Lesson not found');
    }

    const quiz = await Quiz.findOne({ lessonId });
    if (!quiz) {
      res.status(404);
      throw new Error('Quiz not found for this lesson');
    }

    if (!answers || !Array.isArray(answers)) {
      res.status(400);
      throw new Error('Invalid quiz submission answers');
    }

    let correctCount = 0;
    const totalCount = quiz.questions.length;

    // Grade answers
    const evaluation = quiz.questions.map((q, idx) => {
      const userAns = answers.find((a) => a.index === idx);
      const isCorrect = userAns && userAns.selectedOption === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        selectedOption: userAns ? userAns.selectedOption : null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const passed = score >= quiz.passingScore;

    let xpEarned = 0;
    let badgeUnlocked = null;
    let leveledUp = false;
    let previousLevel = 1;
    let newLevel = 1;

    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ userId });
    }

    previousLevel = progress.level;

    if (passed) {
      const isAlreadyCompleted = progress.completedLessons.some(
        (l) => l.lessonId.toString() === lessonId.toString()
      );

      if (!isAlreadyCompleted) {
        // Mark lesson completed
        progress.completedLessons.push({ lessonId, completedAt: new Date() });

        // Calculate XP Reward
        xpEarned = (lesson.xpReward || 50) + (quiz.xpReward || 100);
        progress.xp += xpEarned;

        // Calculate Streak update
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!progress.lastActiveDate) {
          progress.streak = 1;
        } else {
          const lastActive = new Date(progress.lastActiveDate);
          lastActive.setHours(0, 0, 0, 0);
          
          const diffTime = Math.abs(today - lastActive);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Yesterday, increment streak
            progress.streak += 1;
          } else if (diffDays > 1) {
            // Missed a day, reset streak to 1
            progress.streak = 1;
          }
          // If diffDays is 0 (already active today), keep streak same
        }
        progress.lastActiveDate = new Date();

        // 1. Award FIRST_LESSON badge
        if (progress.completedLessons.length === 1) {
          const badge = await awardBadge(progress, 'FIRST_LESSON');
          if (badge) badgeUnlocked = badge;
        }

        // 2. Award QUIZ_MASTER badge if 100% score
        if (score === 100) {
          const badge = await awardBadge(progress, 'QUIZ_MASTER');
          if (badge) badgeUnlocked = badge;
        }

        // 3. Award Course Completion badges
        // Find which course this lesson belongs to
        const parentModule = await Module.findById(lesson.moduleId);
        if (parentModule) {
          const parentCourse = await Course.findById(parentModule.courseId);
          if (parentCourse) {
            // Check if all lessons in this course are completed
            const allModules = await Module.find({ courseId: parentCourse._id });
            const moduleIds = allModules.map(m => m._id);
            const courseLessons = await Lesson.find({ moduleId: { $in: moduleIds } });
            
            const userCompletedIds = progress.completedLessons.map(l => l.lessonId.toString());
            const allCompleted = courseLessons.every(l => userCompletedIds.includes(l._id.toString()));

            if (allCompleted) {
              let courseBadgeCode = '';
              if (parentCourse.title.includes('Money Basics')) courseBadgeCode = 'SAVING_BASICS';
              else if (parentCourse.title.includes('Compounding')) courseBadgeCode = 'COMPOUNDING_EXPERT';
              else if (parentCourse.title.includes('Risk')) courseBadgeCode = 'RISK_EXPLORER';

              if (courseBadgeCode) {
                const badge = await awardBadge(progress, courseBadgeCode);
                if (badge) badgeUnlocked = badge;
              }
            }
          }
        }

        // Recalculate level
        newLevel = calculateLevel(progress.xp);
        if (newLevel > previousLevel) {
          progress.level = newLevel;
          leveledUp = true;
        }

        await progress.save();
      }
    }

    res.status(200).json({
      passed,
      score,
      correctCount,
      totalCount,
      evaluation,
      xpEarned,
      badgeUnlocked,
      leveledUp,
      newLevel: progress.level,
      streak: progress.streak,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user learning progress
 * @route   GET /api/learning/progress
 * @access  Private
 */
const getProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let progress = await UserProgress.findOne({ userId })
      .populate('earnedBadges.badgeId')
      .lean();

    if (!progress) {
      progress = await UserProgress.create({ userId });
      progress = await UserProgress.findOne({ userId })
        .populate('earnedBadges.badgeId')
        .lean();
    }

    res.status(200).json(progress);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all learning badges and highlight earned status
 * @route   GET /api/learning/badges
 * @access  Private
 */
const getBadges = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await UserProgress.findOne({ userId });

    const earnedBadgeIds = progress 
      ? progress.earnedBadges.map((b) => b.badgeId.toString())
      : [];

    const badges = await Badge.find().lean();
    const result = badges.map((badge) => ({
      ...badge,
      earned: earnedBadgeIds.includes(badge._id.toString()),
      earnedAt: progress 
        ? progress.earnedBadges.find((b) => b.badgeId.toString() === badge._id.toString())?.earnedAt
        : null,
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getLesson,
  submitQuiz,
  getProgress,
  getBadges,
};
