import React, { useState, useEffect, useRef } from "react";
import {
  Orbit,
  Clock,
  BookOpen,
  Search,
  CheckCircle,
  TrendingUp,
  Award,
  Book,
  BrainCircuit,
  Settings,
  User,
  Plus,
  Trash2,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Flame,
  Binary,
  Compass,
  Activity,
  Atom,
  Volume2,
  Calendar as CalendarIcon,
  HelpCircle,
  Sun,
  Moon,
  MessageSquare,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Share2,
  Menu
} from "lucide-react";
import { PHYSICS_SUBJECTS, DAILY_QUIZZES, MOTIVATIONAL_QUOTES } from "./data/physicsData";
import { SubjectBranch, Chapter, Formula, Flashcard, QuizQuestion, Task, Assignment, Message, UserProfile } from "./types";

export default function App() {
  // Theme Configuration
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("physics_planner_dark_mode");
    return saved === "true";
  });

  // App Initialization & Welcome States
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [guestMode, setGuestMode] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");

  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "planner" | "subjects" | "tests" | "profile">("home");

  // User Profile State
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Henderson",
    college: "State Institute of Physics",
    course: "B.Sc. Hons Physics",
    semester: "Semester 4",
    streak: 12,
    dailyStudyGoalMinutes: 60,
    totalStudyMinutes: 2550, // 42.5 hours
    completedChapters: ["kinematics", "gas-laws"],
    bookmarkedTopics: ["projectile-time-of-flight", "carnot-efficiency"]
  });

  // Active Learning State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<SubjectBranch | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeFormula, setActiveFormula] = useState<Formula | null>(null);

  // Search Results State for formula search
  const [isSearchingGlobal, setIsSearchingGlobal] = useState<boolean>(false);

  // Flashcards state
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState<boolean>(false);

  // Quizzes and Tests state
  const [currentDailyQuizIndex, setCurrentDailyQuizIndex] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [dailyQuizScore, setDailyQuizScore] = useState<number>(0);

  // Practice Test state
  const [activeTest, setActiveTest] = useState<{
    subjectId: string;
    chapterId: string;
    questions: QuizQuestion[];
    currentQuestionIndex: number;
    answers: Record<number, number>;
    submitted: boolean;
    timeRemaining: number;
  } | null>(null);

  const [activeTestTimer, setActiveTestTimer] = useState<NodeJS.Timeout | null>(null);

  // Pomodoro Timer State
  const [timerMode, setTimerMode] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [timerDuration, setTimerDuration] = useState<number>(25 * 60); // 25 mins
  const [timerRemaining, setTimerRemaining] = useState<number>(25 * 60);
  const [timerIsActive, setTimerIsActive] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Smart Study Planner State
  const [tasks, setTasks] = useState<Task[]>([
    { id: "t1", text: "Derive Euler-Lagrange equation for spherical pendulum", completed: false, dueDate: "2026-07-15", subjectBranch: "Classical Mechanics" },
    { id: "t2", text: "Complete thermodynamic entropy problem set (Chapter 3)", completed: true, dueDate: "2026-07-14", subjectBranch: "Thermodynamics" },
    { id: "t3", text: "Review Wave Function normalization exercises", completed: false, dueDate: "2026-07-16", subjectBranch: "Modern Physics" },
    { id: "t4", text: "Prepare pre-lab questions for Double Slit Diffraction experiment", completed: false, dueDate: "2026-07-17", subjectBranch: "Optics" }
  ]);
  const [newTaskText, setNewTaskText] = useState<string>("");
  const [newTaskBranch, setNewTaskBranch] = useState<string>("Classical Mechanics");
  const [newTaskDate, setNewTaskDate] = useState<string>("2026-07-15");

  // Assignment Tracker State
  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: "a1", title: "Quantum Mechanical Tunneling Lab Report", subjectBranch: "Modern Physics", dueDate: "2026-07-19", priority: "High", status: "In Progress" },
    { id: "a2", title: "Fourier Series Expansion of Square Waves Assignment", subjectBranch: "Mathematical Physics", dueDate: "2026-07-22", priority: "Medium", status: "To Do" },
    { id: "a3", title: "Kepler's Laws Planet Elliptical Orbit Derivation", subjectBranch: "Classical Mechanics", dueDate: "2026-07-14", priority: "High", status: "Completed" }
  ]);
  const [newAssignTitle, setNewAssignTitle] = useState<string>("");
  const [newAssignBranch, setNewAssignBranch] = useState<string>("Modern Physics");
  const [newAssignPriority, setNewAssignPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [newAssignDueDate, setNewAssignDueDate] = useState<string>("2026-07-20");

  // AI Study Assistant Chat State
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: "ai-initial",
      role: "assistant",
      content: "Hello! I am your AI Physics Companion. Click on any active branch or formula to study, or type your question below. I can help with step-by-step math derivations, physics principles, or study plans!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userChatMessage, setUserChatMessage] = useState<string>("");
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiConfigError, setAiConfigError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Quick Notes State
  const [quickNotes, setQuickNotes] = useState<string>(
    "Exam reminder: focus on the derivation of Heisenberg uncertainty principle via Gaussian wave packets. Remember to review the Carnot cycle isothermal step coordinates!"
  );

  // Attendance Tracker States
  const [attendance, setAttendance] = useState<Record<string, { attended: number; total: number }>>({
    classical: { attended: 18, total: 20 },
    mathPhysics: { attended: 15, total: 16 },
    thermo: { attended: 14, total: 15 },
    waves: { attended: 11, total: 12 },
    optics: { attended: 9, total: 10 },
    electricity: { attended: 16, total: 18 },
    modern: { attended: 12, total: 14 }
  });

  // Motivational Quote Rotation
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState<number>(0);

  // Notification Toast State
  const [notification, setNotification] = useState<string | null>(
    "Tip: Use the Formula Library to bookmark key equations before your practice test!"
  );

  // Sync class theme on toggling Dark Mode
  useEffect(() => {
    localStorage.setItem("physics_planner_dark_mode", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Quote rotation interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Pomodoro Timer Effect
  useEffect(() => {
    if (timerIsActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerIsActive]);

  // Test Timer Effect
  useEffect(() => {
    if (activeTest && !activeTest.submitted) {
      const timer = setInterval(() => {
        setActiveTest((prev) => {
          if (!prev) return null;
          if (prev.timeRemaining <= 1) {
            clearInterval(timer);
            return { ...prev, timeRemaining: 0, submitted: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTest]);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  const handleTimerComplete = () => {
    setTimerIsActive(false);
    // Add study stats
    if (timerMode === "focus") {
      const studyMins = Math.floor(timerDuration / 60);
      setProfile((prev) => ({
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + studyMins
      }));
      setNotification(`Excellent! You completed your ${studyMins}-minute focus session. Your study stats have been updated!`);
    } else {
      setNotification("Break completed! Ready to dive back into physics?");
    }
  };

  const switchTimerMode = (mode: "focus" | "shortBreak" | "longBreak") => {
    setTimerIsActive(false);
    setTimerMode(mode);
    let seconds = 25 * 60;
    if (mode === "shortBreak") seconds = 5 * 60;
    if (mode === "longBreak") seconds = 15 * 60;
    setTimerDuration(seconds);
    setTimerRemaining(seconds);
  };

  // Helper mapping iconName to React Lucide components
  const getSubjectIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Orbit":
        return <Orbit className={className} />;
      case "Binary":
        return <Binary className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Activity":
        return <Activity className={className} />;
      case "Compass":
        return <Compass className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Atom":
        return <Atom className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Toggle Bookmark
  const toggleBookmark = (topicId: string) => {
    setProfile((prev) => {
      const exists = prev.bookmarkedTopics.includes(topicId);
      const updated = exists
        ? prev.bookmarkedTopics.filter((t) => t !== topicId)
        : [...prev.bookmarkedTopics, topicId];
      return { ...prev, bookmarkedTopics: updated };
    });
  };

  // Toggle Chapter Completion
  const toggleChapterCompletion = (chapterId: string) => {
    setProfile((prev) => {
      const exists = prev.completedChapters.includes(chapterId);
      const updated = exists
        ? prev.completedChapters.filter((c) => c !== chapterId)
        : [...prev.completedChapters, chapterId];
      return { ...prev, completedChapters: updated };
    });
  };

  // Add a task
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: "t_" + Date.now(),
      text: newTaskText,
      completed: false,
      dueDate: newTaskDate,
      subjectBranch: newTaskBranch
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText("");
  };

  // Toggle task complete
  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  // Delete a task
  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Add an Assignment
  const addAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle.trim()) return;
    const newAss: Assignment = {
      id: "a_" + Date.now(),
      title: newAssignTitle,
      subjectBranch: newAssignBranch,
      priority: newAssignPriority,
      dueDate: newAssignDueDate,
      status: "To Do"
    };
    setAssignments([newAss, ...assignments]);
    setNewAssignTitle("");
  };

  // Toggle Assignment Status
  const toggleAssignmentStatus = (id: string) => {
    setAssignments(
      assignments.map((a) => {
        if (a.id === id) {
          const nextStatusMap: Record<Assignment["status"], Assignment["status"]> = {
            "To Do": "In Progress",
            "In Progress": "Completed",
            "Completed": "To Do"
          };
          return { ...a, status: nextStatusMap[a.status] };
        }
        return a;
      })
    );
  };

  // Delete Assignment
  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  // Handle Practice Test Selection
  const startPracticeTest = (chapter: Chapter, branchName: string) => {
    // Construct test of 5 questions including customized questions
    const generatedQuestions: QuizQuestion[] = [
      {
        id: "test1",
        question: `Which fundamental principle is central to solving motion parameters in the chapter ${chapter.title}?`,
        options: ["Conservation of Mass", "The Action of Force Field Variables", "Translational Coordinates & Acceleration Integrals", "Statistical Thermal Equilibrium"],
        answerIndex: 2,
        explanation: "Kinematics and mechanical variables are derived directly using integrals of velocity and continuous translational derivatives."
      },
      ...chapter.flashcards.map((f, index) => ({
        id: `test_${index}`,
        question: `Based on '${chapter.title}': ${f.question}`,
        options: [f.answer, "An arbitrary steady state variable", "Fictitious centrifugal coordinates", "Not defined under traditional mechanics"],
        answerIndex: 0,
        explanation: "This directly maps to standard core definitions covered in the syllabus notes."
      }))
    ];

    setActiveTest({
      subjectId: branchName,
      chapterId: chapter.title,
      questions: generatedQuestions,
      currentQuestionIndex: 0,
      answers: {},
      submitted: false,
      timeRemaining: 15 * 60 // 15 minutes
    });
  };

  // Handle Daily Quiz Answer Submission
  const submitDailyQuizAnswer = (optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedQuizAnswer(optionIdx);
    setQuizSubmitted(true);
    const correct = optionIdx === DAILY_QUIZZES[currentDailyQuizIndex].answerIndex;
    if (correct) {
      setDailyQuizScore((prev) => prev + 1);
      setProfile((prev) => ({ ...prev, streak: prev.streak + 1 }));
      setNotification("Correct! Your physics streak has increased! 🔥");
    } else {
      setNotification("Oops, that answer is incorrect. Review the physics explanation below.");
    }
  };

  const nextDailyQuiz = () => {
    setQuizSubmitted(false);
    setSelectedQuizAnswer(null);
    setCurrentDailyQuizIndex((prev) => (prev + 1) % DAILY_QUIZZES.length);
  };

  // Submit Practice Test
  const submitPracticeTest = () => {
    if (!activeTest) return;
    setActiveTest({
      ...activeTest,
      submitted: true
    });
    // Add stats to total study minutes as reward
    setProfile((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + 15
    }));
  };

  // Call Gemini AI Assistant API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatMessage.trim() || aiIsLoading) return;

    const userText = userChatMessage;
    const userMsg: Message = {
      id: "user_" + Date.now(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setUserChatMessage("");
    setAiIsLoading(true);
    setAiConfigError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...aiMessages, userMsg],
          topic: selectedChapter ? `${selectedSubject?.name} - ${selectedChapter.title}` : selectedSubject?.name,
          currentFormula: activeFormula
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Internal Server Error");
      }

      const assistantMsg: Message = {
        id: "ai_" + Date.now(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setAiMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiConfigError(error.message || "Could not connect to study assistant server.");
      // Provide an educational local alternative
      const alternativeMsg: Message = {
        id: "ai_err_" + Date.now(),
        role: "assistant",
        content: `⚠️ (API Connection offline/unconfigured)
Let me assist locally! Regarding your query, remember:
1. Classical Physics forces obey Newton's formulation: F = dp/dt.
2. Under Thermodynamics, internal energy changes correspond directly to heat exchange and gas work: ΔU = Q - W.
3. For Quantum equations, wave-particles possess a wavelength λ = h/p.
Please verify your GEMINI_API_KEY is properly set up in AI Studio Secrets for the complete interactive physics derivation solver.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setAiMessages((prev) => [...prev, alternativeMsg]);
    } finally {
      setAiIsLoading(false);
    }
  };

  // Total completed chapters ratio
  const completedChaptersCount = profile.completedChapters.length;
  const totalChaptersCount = PHYSICS_SUBJECTS.reduce((sum, s) => sum + s.chapters.length, 0);
  const syllabusCompletionPercentage = Math.round((completedChaptersCount / totalChaptersCount) * 100);

  // Filter formulas or subjects based on global search
  const filteredSubjects = PHYSICS_SUBJECTS.filter((subject) => {
    const matchesSubject = subject.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChapter = subject.chapters.some((ch) =>
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.notes.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesSubject || matchesChapter;
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-900"}`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-lg w-11/12 animate-fade-in bg-blue-600 text-white rounded-xl shadow-xl px-4 py-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-300 shrink-0 animate-pulse" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white hover:text-sky-200 ml-3">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Welcome Screen Cover overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-600/20 blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-sky-600/20 blur-3xl"></div>
            
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Atom className="w-12 h-12 text-white animate-spin-slow" />
                <Clock className="w-6 h-6 text-sky-200 absolute -bottom-1 -right-1" />
                <BookOpen className="w-5 h-5 text-white absolute -top-1 -left-1" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent">
              Physics Planner Pro
            </h1>
            <p className="text-sky-400 font-bold tracking-wider text-xs uppercase mt-1 mb-4">
              Plan. Learn. Solve. Succeed.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              Organize your physics journey with smart study plans, automated progress tracking, integrated formula libraries, active recall flashcards, and a real-time AI solver.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setGuestMode(false);
                  setNotification("Welcome back to Physics Planner Pro! Let's conquer classical & modern physics.");
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
                id="btn-get-started"
              >
                Get Started
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                  id="btn-sign-in"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowWelcome(false);
                    setGuestMode(true);
                  }}
                  className="py-2.5 bg-slate-800/40 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  id="btn-continue-guest"
                >
                  Continue as Guest
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-6">
              Designed for undergrads, engineered for physics mastery.
            </p>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Sign In to Your Workspace</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowAuthModal(false);
                setShowWelcome(false);
                if (authEmail) {
                  setProfile((p) => ({ ...p, name: authEmail.split("@")[0] }));
                }
                setNotification("Successfully logged in! Restoring study state...");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 rounded-lg text-sm border border-slate-700 focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-bold transition-colors"
              >
                Continue to Workspace
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER LAYOUT */}
      <div className="flex max-w-[1400px] mx-auto min-h-screen">
        
        {/* SIDEBAR NAVIGATION - DESKTOP VIEW */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 hidden md:flex">
          {/* Brand header */}
          <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
            <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Atom className="w-6 h-6 text-white animate-spin-slow" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight dark:text-white">PHYSICS</h1>
              <p className="text-[10px] text-blue-600 dark:text-sky-400 font-bold tracking-widest uppercase">
                Planner Pro
              </p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => { setActiveTab("home"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`w-full text-left sidebar-item p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab("planner"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`w-full text-left sidebar-item p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "planner"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Smart Planner</span>
            </button>

            <button
              onClick={() => { setActiveTab("subjects"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`w-full text-left sidebar-item p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "subjects"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">Syllabus & Notes</span>
            </button>

            <button
              onClick={() => { setActiveTab("tests"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`w-full text-left sidebar-item p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "tests"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BrainCircuit className="w-5 h-5" />
              <span className="text-sm font-medium">Practice Tests</span>
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`w-full text-left sidebar-item p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Profile & Stats</span>
            </button>
          </nav>

          {/* Sidebar Footer Pro banner */}
          <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border border-slate-800 shadow-xl">
            <div className="flex items-center gap-1.5 mb-1 text-sky-400">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
              <p className="text-[10px] font-bold tracking-wider uppercase">ADVANCED DERIVATIONS</p>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              Complete reference with 5,000+ physics derivations & quantum tools.
            </p>
            <button
              onClick={() => {
                setProfile((p) => ({ ...p, name: "Dr. " + p.name }));
                setNotification("Pro features unlocked! Premium researcher badge granted 🎓");
              }}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Unlock Derivation Pro
            </button>
          </div>
        </aside>

        {/* MAIN BODY AREA */}
        <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          
          {/* HEADER BAR */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
            
            {/* Search Input and Brand (mobile) */}
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="md:hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-sky-400 rounded-lg flex items-center justify-center text-white">
                  <Atom className="w-5 h-5" />
                </div>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search formulas, chapters or laws..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      setIsSearchingGlobal(true);
                      setActiveTab("subjects");
                    } else {
                      setIsSearchingGlobal(false);
                    }
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 pl-9 pr-4 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 border-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Profile/Quick Info & Theme Selector */}
            <div className="flex items-center gap-4 ml-4 shrink-0">
              
              {/* Daily Streak Indicator */}
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold">
                <Flame className="w-4 h-4 fill-current animate-bounce text-orange-500" />
                <span>{profile.streak} Days</span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
              </button>

              {/* User Avatar & Title */}
              <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
                <div className="text-right">
                  <p className="text-xs font-bold dark:text-white">{profile.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium tracking-wider uppercase">
                    {profile.college ? `${profile.college.substring(0, 15)}...` : "Undergrad"}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-extrabold text-blue-600">
                  {profile.name[0]}
                </div>
              </div>
            </div>
          </header>

          {/* BOTTOM NAVIGATION FOR MOBILE VIEW */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 md:hidden">
            <button
              onClick={() => { setActiveTab("home"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`flex flex-col items-center p-1 ${activeTab === "home" ? "text-blue-600" : "text-slate-400"}`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => { setActiveTab("planner"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`flex flex-col items-center p-1 ${activeTab === "planner" ? "text-blue-600" : "text-slate-400"}`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">Planner</span>
            </button>
            <button
              onClick={() => { setActiveTab("subjects"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`flex flex-col items-center p-1 ${activeTab === "subjects" ? "text-blue-600" : "text-slate-400"}`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium">Subjects</span>
            </button>
            <button
              onClick={() => { setActiveTab("tests"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`flex flex-col items-center p-1 ${activeTab === "tests" ? "text-blue-600" : "text-slate-400"}`}
            >
              <BrainCircuit className="w-5 h-5" />
              <span className="text-[10px] font-medium">Tests</span>
            </button>
            <button
              onClick={() => { setActiveTab("profile"); setSelectedSubject(null); setSelectedChapter(null); }}
              className={`flex flex-col items-center p-1 ${activeTab === "profile" ? "text-blue-600" : "text-slate-400"}`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </nav>

          {/* MAIN PAGE VIEW ROUTER */}
          <div className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto space-y-6">

            {/* Global search details bar (if searching) */}
            {searchQuery && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>Searching for &ldquo;<strong>{searchQuery}</strong>&rdquo; in physics chapters and formulas.</span>
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* TAB 1: HOME DASHBOARD */}
            {activeTab === "home" && (
              <div className="space-y-6">
                
                {/* Greeting & Countdown */}
                <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-sky-600/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-sky-900/20 rounded-3xl p-6 border border-blue-500/10 relative overflow-hidden">
                  <div className="absolute right-4 top-4 opacity-10 animate-spin-slow">
                    <Atom className="w-24 h-24" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                    Good morning, {profile.name}. 👋
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Your current study path: <span className="text-blue-600 dark:text-blue-400 font-bold">{profile.course}</span>
                  </p>
                  
                  {/* Countdown Ticker */}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/15">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Syllabus Completed: {syllabusCompletionPercentage}%</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      📅 Physics Finals countdown: <strong className="text-red-500 dark:text-red-400">14 Days</strong> left
                    </div>
                  </div>
                </div>

                {/* MOTIVATIONAL QUOTE */}
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-4">
                  <span className="text-3xl text-blue-500 font-serif shrink-0">“</span>
                  <div>
                    <p className="text-sm italic text-slate-700 dark:text-slate-300">
                      {MOTIVATIONAL_QUOTES[currentQuoteIndex].text}
                    </p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                      — {MOTIVATIONAL_QUOTES[currentQuoteIndex].author}
                    </p>
                  </div>
                </div>

                {/* TODAY'S CORE STATS ROW */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Streak</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{profile.streak}</span>
                      <span className="text-xs font-semibold text-amber-500">🔥 Days</span>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study Duration</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                        {(profile.totalStudyMinutes / 60).toFixed(1)}
                      </span>
                      <span className="text-xs font-semibold text-blue-500">Hours</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal Progress</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
                        {Math.round((profile.totalStudyMinutes % 60) / profile.dailyStudyGoalMinutes * 100)}%
                      </span>
                      <span className="text-xs font-semibold text-green-500">Daily Target</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solved Practice</span>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{tasks.filter(t => t.completed).length + assignments.filter(a => a.status === 'Completed').length}</span>
                      <span className="text-xs font-semibold text-purple-500">Milestones</span>
                    </div>
                  </div>
                </div>

                {/* 2 COLUMN GRID: STUDY PLAN & POMODORO */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Today's Study Plan Tasks list */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        Today's Study Plan
                      </h3>
                      <button
                        onClick={() => setActiveTab("planner")}
                        className="text-xs text-blue-600 dark:text-sky-400 font-bold hover:underline"
                      >
                        Edit Plan
                      </button>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[280px] pr-1">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                            task.completed
                              ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-150 dark:border-slate-850 opacity-60"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 shadow-sm hover:border-blue-200"
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 dark:border-slate-600 hover:border-blue-500"
                            }`}
                          >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${task.completed ? "line-through text-slate-500" : "font-bold text-slate-800 dark:text-slate-200"}`}>
                              {task.text}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              📅 Due {task.dueDate} • <span className="text-blue-500 font-medium">{task.subjectBranch}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* POMODORO FOCUS TIMER SECTION */}
                  <div className="bg-[#0F172A] border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-400" />
                          Focus Chamber
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pomodoro Study Method</p>
                      </div>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-md animate-pulse">
                        {timerIsActive ? "ACTIVE" : "STANDBY"}
                      </span>
                    </div>

                    {/* Timer Tab Toggles */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl mb-4 text-center">
                      <button
                        onClick={() => switchTimerMode("focus")}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          timerMode === "focus" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Focus
                      </button>
                      <button
                        onClick={() => switchTimerMode("shortBreak")}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          timerMode === "shortBreak" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        S. Break
                      </button>
                      <button
                        onClick={() => switchTimerMode("longBreak")}
                        className={`py-1 rounded-lg text-[10px] font-bold transition-all ${
                          timerMode === "longBreak" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        L. Break
                      </button>
                    </div>

                    {/* Display countdown with animated progress ring */}
                    <div className="flex flex-col items-center py-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-slate-800"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className="text-blue-500 transition-all duration-300"
                            strokeWidth="4"
                            strokeDasharray="251.2"
                            strokeDashoffset={String(251.2 * (1 - timerRemaining / timerDuration))}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-3xl font-black text-white tracking-tight">
                            {Math.floor(timerRemaining / 60).toString().padStart(2, "0")}:
                            {(timerRemaining % 60).toString().padStart(2, "0")}
                          </span>
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 mt-1">
                            {timerMode === "focus" ? "Study Physics" : "Break Time"}
                          </span>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-3 mt-4 w-full">
                        <button
                          onClick={() => setTimerIsActive(!timerIsActive)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                            timerIsActive
                              ? "bg-amber-600 hover:bg-amber-500 text-white"
                              : "bg-blue-600 hover:bg-blue-500 text-white"
                          }`}
                        >
                          {timerIsActive ? (
                            <>
                              <Pause className="w-3.5 h-3.5" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" /> Start Focus
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => switchTimerMode(timerMode)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONTINUING LEVEL / SYLLABUS DIRECT ACCESS CARDS */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Explore Physics Curriculum
                    </h3>
                    <button
                      onClick={() => setActiveTab("subjects")}
                      className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      View All Branches &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PHYSICS_SUBJECTS.slice(0, 4).map((sub) => {
                      const completedCount = sub.chapters.filter(ch => profile.completedChapters.includes(ch.id)).length;
                      const percent = Math.round((completedCount / sub.chapters.length) * 100);
                      return (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubject(sub);
                            setActiveTab("subjects");
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all shadow-sm group hover:-translate-y-1"
                        >
                          <div className={`w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-800/80 flex items-center justify-center shrink-0 ${sub.color}`}>
                            {getSubjectIcon(sub.iconName, "w-6 h-6")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black truncate text-slate-800 dark:text-slate-100 group-hover:text-blue-600">
                              {sub.name}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {percent}% completed ({completedCount}/{sub.chapters.length})
                            </p>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2 COLUMN SECTION: QUICK NOTE SCRATCHPAD & DAILY CHALLENGE QUIZ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Daily Quiz challenge */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute right-2 top-2 opacity-15">
                      <Sparkles className="w-32 h-32 text-indigo-400 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-amber-500 rounded-lg text-slate-950">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Streak Builder Quiz</span>
                    </div>

                    <h4 className="text-sm font-bold text-indigo-200 uppercase tracking-wide">
                      Question {currentDailyQuizIndex + 1} of {DAILY_QUIZZES.length}
                    </h4>

                    <p className="text-sm font-black text-white mt-2 mb-4 leading-relaxed">
                      {DAILY_QUIZZES[currentDailyQuizIndex].question}
                    </p>

                    <div className="space-y-2 relative z-10">
                      {DAILY_QUIZZES[currentDailyQuizIndex].options.map((option, idx) => {
                        let btnStyle = "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800";
                        if (quizSubmitted) {
                          if (idx === DAILY_QUIZZES[currentDailyQuizIndex].answerIndex) {
                            btnStyle = "bg-green-600/30 border-green-500 text-green-300 font-bold";
                          } else if (idx === selectedQuizAnswer) {
                            btnStyle = "bg-red-600/30 border-red-500 text-red-300 line-through";
                          } else {
                            btnStyle = "bg-slate-800/40 border-slate-700 text-slate-400 opacity-60";
                          }
                        }
                        return (
                          <button
                            key={idx}
                            disabled={quizSubmitted}
                            onClick={() => submitDailyQuizAnswer(idx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && idx === DAILY_QUIZZES[currentDailyQuizIndex].answerIndex && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs text-slate-300">
                        <p className="font-bold text-indigo-300">Explanation:</p>
                        <p className="mt-1 leading-relaxed">{DAILY_QUIZZES[currentDailyQuizIndex].explanation}</p>
                        
                        <button
                          onClick={nextDailyQuiz}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors"
                        >
                          Next Daily Quiz
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notebook Scratchpad */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                        <Book className="w-5 h-5 text-blue-500" />
                        Quick Scratchpad
                      </h3>
                      <p className="text-xs text-slate-400 mb-3">Keep reminders, equations, or exam subtopics here.</p>
                      
                      <textarea
                        value={quickNotes}
                        onChange={(e) => setQuickNotes(e.target.value)}
                        placeholder="Type some physics formulas or ideas to remember..."
                        rows={6}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Saved automatically to session storage</span>
                      <button
                        onClick={() => {
                          setQuickNotes("");
                          setNotification("Scratchpad cleared!");
                        }}
                        className="text-red-500 hover:underline font-bold"
                      >
                        Clear Notes
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: SMART PLANNER */}
            {activeTab === "planner" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg">
                  <h2 className="text-2xl font-black tracking-tight">Smart Study Planner</h2>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    Prioritize physics lab preparation, math exercises, and theoretical revision tasks. Set due dates, categorizations, and check off completed targets.
                  </p>
                </div>

                {/* ADD TASK WIDGET */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm mb-4 dark:text-white">Plan Next Study Session</h3>
                  
                  <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Study Objective / Task</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Normalization of Schrödinger wave function..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject Branch</label>
                      <select
                        value={newTaskBranch}
                        onChange={(e) => setNewTaskBranch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
                      >
                        <option>Classical Mechanics</option>
                        <option>Mathematical Physics</option>
                        <option>Thermodynamics</option>
                        <option>Waves & Oscillations</option>
                        <option>Optics</option>
                        <option>Electricity & Magnetism</option>
                        <option>Modern Physics</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md"
                      >
                        <Plus className="w-4 h-4" /> Add to Plan
                      </button>
                    </div>
                  </form>
                </div>

                {/* STUDY ASSIGNMENTS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Task list Column */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-sm mb-4 dark:text-white flex items-center justify-between">
                      <span>Study Milestones</span>
                      <span className="text-xs text-slate-400 font-normal">
                        {tasks.filter(t => t.completed).length}/{tasks.length} Completed
                      </span>
                    </h3>

                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                task.completed
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "border-slate-300 dark:border-slate-600 hover:border-blue-500"
                              }`}
                            >
                              {task.completed && <Check className="w-3.5 h-3.5" />}
                            </button>
                            <div>
                              <p className={`text-xs font-bold ${task.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                                {task.text}
                              </p>
                              <p className="text-[9px] text-slate-400 mt-1">
                                📅 {task.dueDate} • <span className="text-blue-500 font-bold">{task.subjectBranch}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Tracker and due date alert */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm mb-2 dark:text-white">Lab & Homework Tracker</h3>
                      <p className="text-xs text-slate-400 mb-4">Official university submissions and priority levels.</p>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {assignments.map((ass) => (
                          <div
                            key={ass.id}
                            className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-xl"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                                {ass.title}
                              </h4>
                              <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                ass.priority === "High"
                                  ? "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              }`}>
                                {ass.priority}
                              </span>
                            </div>

                            <p className="text-[9px] text-slate-400 mt-1">
                              Subject: {ass.subjectBranch} • Due: {ass.dueDate}
                            </p>

                            <div className="mt-2.5 flex justify-between items-center">
                              <button
                                onClick={() => toggleAssignmentStatus(ass.id)}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                  ass.status === "Completed"
                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                    : ass.status === "In Progress"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    : "bg-slate-500/10 text-slate-600 border-slate-500/10"
                                }`}
                              >
                                {ass.status}
                              </button>
                              <button
                                onClick={() => deleteAssignment(ass.id)}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={addAssignment} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Add new lab / homework..."
                        value={newAssignTitle}
                        onChange={(e) => setNewAssignTitle(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={newAssignPriority}
                          onChange={(e) => setNewAssignPriority(e.target.value as any)}
                          className="bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                        </select>
                        <button type="submit" className="bg-blue-600 text-white rounded-lg text-xs font-bold py-1">
                          Add Task
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: SUBJECTS, NOTES & STUDY */}
            {activeTab === "subjects" && (
              <div className="space-y-6">
                
                {/* Dual navigation layout or specific subject detail */}
                {!selectedSubject ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white p-6 rounded-3xl shadow-lg">
                      <h2 className="text-2xl font-black tracking-tight">Syllabus & notes Archive</h2>
                      <p className="text-xs text-sky-100 mt-1">
                        Select a domain of physics to read chapter notes, formula sheets, practice derivations, and view flashcards.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSubjects.map((sub) => {
                        const completedCount = sub.chapters.filter(ch => profile.completedChapters.includes(ch.id)).length;
                        return (
                          <div
                            key={sub.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-blue-400 dark:hover:border-blue-500 transition-all group"
                          >
                            <div>
                              <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 ${sub.color}`}>
                                {getSubjectIcon(sub.iconName, "w-7 h-7")}
                              </div>

                              <h3 className="text-lg font-black tracking-tight text-slate-850 dark:text-white group-hover:text-blue-600 transition-colors">
                                {sub.name}
                              </h3>

                              <p className="text-xs text-slate-400 mt-2">
                                Chapters: {sub.chapters.map(ch => ch.title).join(", ")}
                              </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                {completedCount} / {sub.chapters.length} Completed
                              </span>
                              
                              <button
                                onClick={() => setSelectedSubject(sub)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all"
                              >
                                Open Domain &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <button onClick={() => setSelectedSubject(null)} className="hover:text-blue-600">Syllabus Archive</button>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="font-bold text-slate-800 dark:text-slate-100">{selectedSubject.name}</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${selectedSubject.color}`}>
                          {getSubjectIcon(selectedSubject.iconName, "w-8 h-8")}
                        </div>
                        <div>
                          <h2 className="text-xl font-black dark:text-white">{selectedSubject.name}</h2>
                          <p className="text-xs text-slate-400">University Syllabus Chapter Series</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedSubject(null)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                      >
                        &larr; Back to Syllabus
                      </button>
                    </div>

                    {/* TWO COLUMN CHAPTER DETAILS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Sidebar Chapter lists */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Chapters in this Syllabus</h3>
                        {selectedSubject.chapters.map((chapter) => {
                          const isCompleted = profile.completedChapters.includes(chapter.id);
                          return (
                            <div
                              key={chapter.id}
                              onClick={() => {
                                setSelectedChapter(chapter);
                                setCurrentFlashcardIndex(0);
                                setShowFlashcardAnswer(false);
                                setActiveFormula(null);
                              }}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                selectedChapter?.id === chapter.id
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/10"
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-sm font-extrabold leading-snug">{chapter.title}</h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleChapterCompletion(chapter.id);
                                  }}
                                  className={`p-1 rounded-lg transition-colors ${
                                    isCompleted
                                      ? "text-green-500 bg-green-50 dark:bg-green-950/20"
                                      : "text-slate-400 hover:text-green-500"
                                  }`}
                                  title="Mark Chapter as Mastered"
                                >
                                  <CheckCircle className="w-4 h-4 fill-current" />
                                </button>
                              </div>
                              <p className="text-[10px] opacity-80 mt-1.5">
                                {chapter.formulas.length} formulas • {chapter.flashcards.length} flashcards
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Notes Reader View */}
                      <div className="lg:col-span-2 space-y-6">
                        {selectedChapter ? (
                          <div className="space-y-6">
                            
                            {/* Chapter note and study module switcher */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                  <span className="text-[10px] bg-blue-50 dark:bg-slate-800 text-blue-600 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                    Study Active Chapter
                                  </span>
                                  <h3 className="text-lg font-black mt-1 dark:text-white">{selectedChapter.title}</h3>
                                </div>

                                <button
                                  onClick={() => {
                                    setAiMessages((prev) => [
                                      ...prev,
                                      {
                                        id: "prompt_" + Date.now(),
                                        role: "user",
                                        content: `Explain the physics derivation or main concept of the chapter "${selectedChapter.title}" in simple terms.`,
                                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      }
                                    ]);
                                    setActiveTab("home");
                                    setNotification("Chatting with AI Study Companion about this topic!");
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Ask AI Companion
                                </button>
                              </div>

                              {/* Rich formatted notes */}
                              <div className="prose prose-slate dark:prose-invert max-w-none mt-4 text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
                                {selectedChapter.notes.split("\n\n").map((para, i) => {
                                  if (para.startsWith("###")) {
                                    return <h4 key={i} className="text-sm font-extrabold text-slate-900 dark:text-white pt-2">{para.replace("###", "")}</h4>;
                                  }
                                  if (para.startsWith("-")) {
                                    return (
                                      <ul key={i} className="list-disc pl-5 space-y-1">
                                        {para.split("\n").map((li, liIdx) => (
                                          <li key={liIdx}>{li.replace("- ", "")}</li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  return <p key={i}>{para}</p>;
                                })}
                              </div>
                            </div>

                            {/* Flashcards active recall review widget */}
                            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Active Recall Flashcards</h4>
                              
                              <div className="min-h-[140px] flex flex-col justify-between">
                                <div
                                  onClick={() => setShowFlashcardAnswer(!showFlashcardAnswer)}
                                  className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700/60 cursor-pointer text-center min-h-[90px] flex flex-col justify-center transition-all"
                                >
                                  {!showFlashcardAnswer ? (
                                    <div>
                                      <p className="text-xs text-slate-400 tracking-wider uppercase mb-1">Question</p>
                                      <p className="text-sm font-bold text-white">
                                        {selectedChapter.flashcards[currentFlashcardIndex]?.question || "No flashcards in this topic."}
                                      </p>
                                      <p className="text-[10px] text-blue-400 font-bold mt-3">Click to Flip Card 🔄</p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-xs text-green-400 tracking-wider uppercase mb-1">Answer</p>
                                      <p className="text-sm text-slate-200">
                                        {selectedChapter.flashcards[currentFlashcardIndex]?.answer}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-4 flex justify-between items-center text-xs">
                                  <span className="text-slate-400">
                                    Card {currentFlashcardIndex + 1} of {selectedChapter.flashcards.length}
                                  </span>

                                  <div className="flex gap-2">
                                    <button
                                      disabled={currentFlashcardIndex === 0}
                                      onClick={() => {
                                        setCurrentFlashcardIndex(prev => prev - 1);
                                        setShowFlashcardAnswer(false);
                                      }}
                                      className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-45"
                                    >
                                      <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                      disabled={currentFlashcardIndex === selectedChapter.flashcards.length - 1}
                                      onClick={() => {
                                        setCurrentFlashcardIndex(prev => prev + 1);
                                        setShowFlashcardAnswer(false);
                                      }}
                                      className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-45"
                                    >
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Formulas Reference */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Formula Sheet</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedChapter.formulas.map((formula, idx) => {
                                  const isBookmarked = profile.bookmarkedTopics.includes(formula.name);
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => setActiveFormula(formula)}
                                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                        activeFormula?.name === formula.name
                                          ? "border-blue-500 bg-blue-50/20"
                                          : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 hover:border-blue-200"
                                      }`}
                                    >
                                      <div className="flex justify-between items-start gap-2">
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{formula.name}</h5>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBookmark(formula.name);
                                          }}
                                          className="text-slate-400 hover:text-blue-600"
                                        >
                                          {isBookmarked ? (
                                            <BookmarkCheck className="w-4 h-4 text-blue-600 fill-current" />
                                          ) : (
                                            <Bookmark className="w-4 h-4" />
                                          )}
                                        </button>
                                      </div>

                                      {/* LaTeX display equations wrapper */}
                                      <div className="my-3 py-2 bg-slate-900 text-sky-300 font-mono text-center rounded-lg text-sm font-bold shadow-inner">
                                        {formula.latex}
                                      </div>

                                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {formula.explanation}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Start Test Trigger */}
                            <div className="bg-gradient-to-br from-[#0F172A] to-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h4 className="font-extrabold text-sm">Ready to evaluate your knowledge?</h4>
                                <p className="text-xs text-slate-400 mt-1">Practice testing increases retention by up to 150%.</p>
                              </div>
                              <button
                                onClick={() => {
                                  startPracticeTest(selectedChapter, selectedSubject.name);
                                  setActiveTab("tests");
                                  setNotification("Quiz generated! Timer started.");
                                }}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                              >
                                Start Chapter Quiz &rarr;
                              </button>
                            </div>

                          </div>
                        ) : (
                          <div className="h-[400px] bg-slate-100 dark:bg-slate-900/40 rounded-3xl flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <BookOpen className="w-12 h-12 text-slate-400 mb-3 animate-pulse" />
                            <h3 className="font-extrabold text-slate-700 dark:text-slate-300">No Chapter Selected</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm">Select any syllabus chapter on the left sidebar to unlock core lecture notes, formulas, and flashcards.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: PRACTICE TESTS */}
            {activeTab === "tests" && (
              <div className="space-y-6">
                
                {activeTest ? (
                  <div className="space-y-6">
                    {/* Head bar */}
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-red-500 tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                          Live Examination Frame
                        </span>
                        <h2 className="text-lg font-black dark:text-white mt-1">
                          Test: {activeTest.chapterId}
                        </h2>
                        <p className="text-xs text-slate-400">Subject Field: {activeTest.subjectId}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-500">Time Remaining</div>
                        <div className="text-xl font-black text-blue-600 dark:text-sky-400">
                          {Math.floor(activeTest.timeRemaining / 60)}:
                          {(activeTest.timeRemaining % 60).toString().padStart(2, "0")}
                        </div>
                      </div>
                    </div>

                    {/* Progress tracking */}
                    <div className="bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${((activeTest.currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
                      ></div>
                    </div>

                    {/* Question details card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                      <span className="text-xs text-slate-400">
                        Question {activeTest.currentQuestionIndex + 1} of {activeTest.questions.length}
                      </span>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2 mb-6">
                        {activeTest.questions[activeTest.currentQuestionIndex].question}
                      </h3>

                      <div className="space-y-3">
                        {activeTest.questions[activeTest.currentQuestionIndex].options.map((option, idx) => {
                          const isSelected = activeTest.answers[activeTest.currentQuestionIndex] === idx;
                          let btnClass = "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                          
                          if (isSelected) {
                            btnClass = "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-sky-400 font-bold";
                          }

                          if (activeTest.submitted) {
                            const isCorrect = idx === activeTest.questions[activeTest.currentQuestionIndex].answerIndex;
                            if (isCorrect) {
                              btnClass = "bg-green-500/10 border-green-500 text-green-600 font-bold";
                            } else if (isSelected) {
                              btnClass = "bg-red-500/10 border-red-500 text-red-600 line-through";
                            } else {
                              btnClass = "bg-slate-50 dark:bg-slate-800/20 text-slate-400 border-transparent opacity-60";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              disabled={activeTest.submitted}
                              onClick={() => {
                                setActiveTest({
                                  ...activeTest,
                                  answers: { ...activeTest.answers, [activeTest.currentQuestionIndex]: idx }
                                });
                              }}
                              className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${btnClass}`}
                            >
                              <span>{option}</span>
                              {activeTest.submitted && idx === activeTest.questions[activeTest.currentQuestionIndex].answerIndex && (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {activeTest.submitted && (
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                          <p className="font-extrabold text-blue-600 dark:text-sky-400">Detailed Physics Derivation Explanation:</p>
                          <p className="mt-1.5 text-slate-600 dark:text-slate-300 leading-relaxed">
                            {activeTest.questions[activeTest.currentQuestionIndex].explanation}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center">
                      <button
                        disabled={activeTest.currentQuestionIndex === 0}
                        onClick={() => setActiveTest({ ...activeTest, currentQuestionIndex: activeTest.currentQuestionIndex - 1 })}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold disabled:opacity-45"
                      >
                        &larr; Previous
                      </button>

                      {!activeTest.submitted ? (
                        <div className="flex gap-2">
                          {activeTest.currentQuestionIndex === activeTest.questions.length - 1 ? (
                            <button
                              onClick={submitPracticeTest}
                              className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold"
                            >
                              Submit Examination &rarr;
                            </button>
                          ) : (
                            <button
                              onClick={() => setActiveTest({ ...activeTest, currentQuestionIndex: activeTest.currentQuestionIndex + 1 })}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                            >
                              Next Question &rarr;
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {activeTest.currentQuestionIndex < activeTest.questions.length - 1 ? (
                            <button
                              onClick={() => setActiveTest({ ...activeTest, currentQuestionIndex: activeTest.currentQuestionIndex + 1 })}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                            >
                              Next Question &rarr;
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveTest(null);
                                setNotification("Practice session saved! Excellent work evaluating your comprehension.");
                              }}
                              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
                            >
                              Back to Practice Lobby
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-600 to-sky-600 text-white p-6 rounded-3xl shadow-md">
                      <h2 className="text-2xl font-black tracking-tight">University Test Lobby</h2>
                      <p className="text-xs text-blue-100 mt-1">
                        Select a syllabus domain to construct an interactive multiple choice exercise to prep for upcoming terminal testing.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Interactive Selection list */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-extrabold text-sm mb-4 dark:text-white">Formulate Custom MCQ Test</h3>
                        <p className="text-xs text-slate-400 mb-4">Select any domain below to auto-synthesize active test parameters:</p>

                        <div className="space-y-3">
                          {PHYSICS_SUBJECTS.map((sub) => (
                            <div
                              key={sub.id}
                              className="p-3.5 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-center"
                            >
                              <div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">{sub.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{sub.chapters.length} chapters available</p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedSubject(sub);
                                  setActiveTab("subjects");
                                  setNotification("Select a chapter, then click 'Start Chapter Quiz' at the bottom!");
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg"
                              >
                                Select Topic
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Analytics visualization */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="font-extrabold text-sm mb-1 dark:text-white">Aesthetic Performance Analytics</h3>
                          <p className="text-xs text-slate-400 mb-4">Syllabus domain retention scores tracked by weekly progress.</p>
                          
                          {/* Beautiful SVG Analytics graph */}
                          <div className="py-4 flex justify-center">
                            <svg className="w-full max-w-[280px] h-[150px]" viewBox="0 0 100 50">
                              {/* Background grids */}
                              <line x1="0" y1="10" x2="100" y2="10" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                              <line x1="0" y1="25" x2="100" y2="25" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                              <line x1="0" y1="40" x2="100" y2="40" stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2" />
                              
                              {/* Performance curve */}
                              <path
                                d="M0,45 Q20,38 40,22 T80,14 T100,8"
                                fill="none"
                                stroke="#2563EB"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle cx="40" cy="22" r="2" fill="#38BDF8" />
                              <circle cx="80" cy="14" r="2" fill="#38BDF8" />
                              <circle cx="100" cy="8" r="2.5" fill="#2563EB" />
                              
                              {/* Text nodes */}
                              <text x="5" y="47" className="text-[4px] fill-slate-400 font-bold font-sans">Week 1</text>
                              <text x="40" y="47" className="text-[4px] fill-slate-400 font-bold font-sans">Week 2</text>
                              <text x="80" y="47" className="text-[4px] fill-slate-400 font-bold font-sans">Week 3</text>
                            </svg>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <p className="text-slate-500">
                            📊 Current metrics show <strong>84%</strong> average test retention on thermodynamics and quantum mechanics concepts. Keep it up!
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 5: PROFILE & ATTENDANCE */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                
                {/* User details header */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-blue-500/20">
                      {profile.name[0]}
                    </div>

                    <div>
                      <h2 className="text-xl font-black dark:text-white">{profile.name}</h2>
                      <p className="text-xs text-slate-500">{profile.college} • {profile.semester}</p>
                      <p className="text-xs text-blue-600 dark:text-sky-400 font-bold mt-0.5">{profile.course}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Study Level Status</span>
                    <span className="text-lg font-black text-slate-800 dark:text-white">Advanced Researcher</span>
                  </div>
                </div>

                {/* STUDY HOURS AND GOAL EDIT WIDGET */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Stats edit card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-sm mb-4 dark:text-white">Update Academic profile</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Student Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">College/University</label>
                        <input
                          type="text"
                          value={profile.college}
                          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Daily Goal (Minutes)</label>
                        <input
                          type="number"
                          value={profile.dailyStudyGoalMinutes}
                          onChange={(e) => setProfile({ ...profile, dailyStudyGoalMinutes: Number(e.target.value) })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Syllabus Attendance metrics tracker */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-sm mb-2 dark:text-white">University Class Attendance Tracker</h3>
                    <p className="text-xs text-slate-400 mb-4">Ensure compliance with the university standard 75% baseline attendance.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(attendance).map(([key, rawValue]) => {
                        const value = rawValue as { attended: number; total: number };
                        const pct = Math.round((value.attended / value.total) * 100);
                        return (
                          <div key={key} className="p-3 bg-slate-50 dark:bg-slate-800/30 border border-slate-250 dark:border-slate-850 rounded-xl">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                                {key.replace("classical", "Classical Mech.").replace("mathPhysics", "Math Physics").replace("thermo", "Thermodynamics")}
                              </span>
                              <span className={`font-bold ${pct >= 75 ? "text-green-600" : "text-red-500"}`}>
                                {pct}% ({value.attended}/{value.total})
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 75 ? "bg-green-500" : "bg-red-500"}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ACHIEVEMENTS BLOCK */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-extrabold text-sm mb-4 dark:text-white">Physics Badges & Achievements</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-250 dark:border-slate-850 text-center flex flex-col items-center">
                      <Award className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
                      <h4 className="text-xs font-black dark:text-slate-100">Galileo Apprentice</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Completed kinematics syllabus objectives with over 90% accuracy.</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-250 dark:border-slate-850 text-center flex flex-col items-center">
                      <Zap className="w-10 h-10 text-blue-500 mb-2" />
                      <h4 className="text-xs font-black dark:text-slate-100">Entropy Conqueror</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Conquered second law formulas and Carnot Cycle parameters.</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-250 dark:border-slate-850 text-center flex flex-col items-center opacity-45">
                      <Atom className="w-10 h-10 text-slate-400 mb-2" />
                      <h4 className="text-xs font-black dark:text-slate-100">Quantum Oracle</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Unlock this badge by completing wave mechanics module chapters.</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-250 dark:border-slate-850 text-center flex flex-col items-center">
                      <Flame className="w-10 h-10 text-orange-500 mb-2" />
                      <h4 className="text-xs font-black dark:text-slate-100">Atomic Thinker</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Maintain an active 7-day streak tracking physics study objectives.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* CHAT TAB / FLOATING ACTION FOR AI PHYSICS COMPANION */}
          <div className="fixed bottom-20 right-6 z-30 max-w-sm w-11/12">
            
            {/* COLLAPSED FLOATING LAUNCHER BUTTON */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setNotification("Physics companion unlocked! Type any question below.");
                  // Scroll to chat
                  const elem = document.getElementById("ai-assistance-card");
                  elem?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl flex items-center justify-center gap-2 group cursor-pointer animate-pulse"
                title="Open AI Study Assistant"
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-black pr-2 max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
                  AI Physics Helper
                </span>
              </button>
            </div>

            {/* AI PHYSICS CHAT INTERFACE COMPONENT */}
            <div id="ai-assistance-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[380px] overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-sky-300 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-black">AI Physics Assistant</h4>
                    <p className="text-[8px] text-blue-200">Gemini-Powered Companion</p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[220px] bg-slate-50 dark:bg-slate-950/60 text-xs">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 mr-auto border border-slate-100 dark:border-slate-850"
                        : "bg-blue-600 text-white ml-auto"
                    }`}
                  >
                    <p className="font-medium whitespace-pre-line">{msg.content}</p>
                    <span className="text-[8px] opacity-60 block text-right mt-1">{msg.timestamp}</span>
                  </div>
                ))}

                {aiIsLoading && (
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl mr-auto text-slate-500 animate-pulse">
                    Thinking of beautiful derivations... ⏳
                  </div>
                )}

                {aiConfigError && (
                  <div className="p-2 bg-red-500/15 text-red-500 rounded-xl text-[10px] border border-red-500/20">
                    {aiConfigError}
                  </div>
                )}
                
                <div ref={chatBottomRef} />
              </div>

              {/* Chat input form */}
              <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder={selectedChapter ? `Ask about "${selectedChapter.title}"...` : "Ask any physics derivation or equation..."}
                  value={userChatMessage}
                  onChange={(e) => setUserChatMessage(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-xs focus:outline-none dark:text-white"
                />
                <button
                  type="submit"
                  disabled={aiIsLoading}
                  className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center justify-center shrink-0 disabled:opacity-45"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
