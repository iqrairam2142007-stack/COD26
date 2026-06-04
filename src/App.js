import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import logo from './logo.jpg.jpeg';
import scanner from './scanner.jpg.jpeg';
import { unitdata } from './unitdata';
import {
  createSchoolCode,
  getAllSchoolCodes,
  getAllStudents,
  getPlatformMode,
  loginStudent,
  registerStudent,
  scheduleNextInstallment,
  updateStudent
} from './platformService';
import { storage, hasFirebaseConfig } from './firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

const STUDENT_NAVIGATION = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'units', label: 'Units' },
  { key: 'chatbot', label: 'Python Chatbot' },
  { key: 'arena', label: 'Arena' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'project', label: 'Project' },
  { key: 'certificate', label: 'Certificate' }
];

const ADMIN_NAVIGATION = [
  { key: 'dashboard', label: 'Overview' },
  { key: 'schoolCodes', label: 'School Codes' },
  { key: 'units', label: 'Topics' },
  { key: 'chatbot', label: 'Python Chatbot' },
  { key: 'arena', label: 'Tests / Arena' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'projects', label: 'Projects' },
  { key: 'payments', label: 'Payments' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'certificate', label: 'Certificate' }
];

const ADMIN_CREDENTIALS = {
  email: process.env.REACT_APP_ADMIN_EMAIL || '',
  password: process.env.REACT_APP_ADMIN_PASSWORD || ''
};

const ARENA_CHALLENGES = [
  {
    title: 'Python Warm-Up',
    question: 'Which keyword is used to define a function in Python?',
    options: ['func', 'define', 'def', 'lambda'],
    answerIndex: 2,
    explanation: 'Python uses the def keyword to create a function.'
  },
  {
    title: 'Data Types Clash',
    question: 'Which of these is a mutable Python data structure?',
    options: ['tuple', 'string', 'list', 'frozenset'],
    answerIndex: 2,
    explanation: 'Lists are mutable, so items can be updated after creation.'
  },
  {
    title: 'Loop Arena',
    question: 'Which statement immediately exits a loop in Python?',
    options: ['skip', 'end', 'break', 'pass'],
    answerIndex: 2,
    explanation: 'break stops the loop immediately.'
  },
  {
    title: 'OOP Sprint',
    question: 'What does __init__ usually do inside a class?',
    options: [
      'Deletes the object',
      'Initializes instance data',
      'Imports another class',
      'Creates a loop'
    ],
    answerIndex: 1,
    explanation: '__init__ runs when an object is created and sets up the instance.'
  },
  {
    title: 'Error Shield',
    question: 'Which keyword is used to handle exceptions?',
    options: ['catch', 'except', 'handle', 'rescue'],
    answerIndex: 1,
    explanation: 'except is used with try to catch errors in Python.'
  }
];

const SAMPLE_LEADERBOARD = [
  { name: 'Aarav', score: 48 },
  { name: 'Ishita', score: 46 },
  { name: 'Meher', score: 44 }
];

const VIEW_PATHS = {
  dashboard: '/dashboard',
  units: '/units',
  chatbot: '/chatbot',
  arena: '/arena',
  assignments: '/assignments',
  project: '/project',
  certificate: '/certificate',
  schoolCodes: '/school-codes',
  projects: '/projects',
  payments: '/payments',
  reminders: '/reminders'
};

const PATH_TO_VIEW = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([k, v]) => [v, k])
);

const formatDate = (value) => {
  if (!value) {
    return 'Will be scheduled after payment';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

function App() {
  const [students, setStudents] = useState([]);
  const [schoolCodes, setSchoolCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMode, setLoginMode] = useState('student');
  const [studentAccessMode, setStudentAccessMode] = useState('direct');
  const [studentAuthMode, setStudentAuthMode] = useState('signin');
  const [studentName, setStudentName] = useState('');
  const [studentUsername, setStudentUsername] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentInstitution, setStudentInstitution] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentSchoolCode, setStudentSchoolCode] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [assignmentUploadFiles, setAssignmentUploadFiles] = useState({});
  const [projectFile, setProjectFile] = useState(null);
  const [assignmentFeedbackDrafts, setAssignmentFeedbackDrafts] = useState({});
  const [projectFeedbackDrafts, setProjectFeedbackDrafts] = useState({});
  const [loginError, setLoginError] = useState('');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = PATH_TO_VIEW[location.pathname] ?? 'dashboard';
  const setActiveView = (key) => navigate(VIEW_PATHS[key] ?? '/dashboard');
  const [selectedUnitId, setSelectedUnitId] = useState(unitdata[0]?.id ?? 1);
  const [currentPage, setCurrentPage] = useState(0);
  const [unitTab, setUnitTab] = useState('theory');
  const [videoSceneIndex, setVideoSceneIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [voiceReadCounts, setVoiceReadCounts] = useState({});
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your COD26 Python chatbot. Ask me any Python question about syntax, loops, functions, OOP, exceptions, file handling, projects, or unit topics.'
    }
  ]);
  const [arenaIndex, setArenaIndex] = useState(0);
  const [arenaAnswers, setArenaAnswers] = useState([]);

  const platformMode = getPlatformMode();
  const now = useMemo(() => new Date(), []);

  const refreshData = async () => {
    const [nextStudents, nextCodes] = await Promise.all([getAllStudents(), getAllSchoolCodes()]);
    setStudents(nextStudents);
    setSchoolCodes(nextCodes);
  };

  const currentStudent = useMemo(() => {
    if (user?.role !== 'student') {
      return null;
    }

    return students.find((student) => student.email === user.email) ?? null;
  }, [students, user]);

  const selectedUnit = useMemo(
    () => unitdata.find((unit) => unit.id === selectedUnitId) ?? unitdata[0],
    [selectedUnitId]
  );

  const schoolDetails = useMemo(
    () => schoolCodes.find((entry) => entry.code === currentStudent?.schoolCode) ?? null,
    [currentStudent, schoolCodes]
  );

  const getAssignmentStatus = (student, unitId) =>
    student?.assignmentSubmissions?.find((submission) => submission.unitId === unitId) ?? null;

  const billingPlan = currentStudent?.accessType === 'direct' ? currentStudent.billingPlan : [];
  const nextUnpaidMonth = billingPlan.find((month) => !month.paid) ?? null;
  const paidMonths = billingPlan.filter((month) => month.paid).length;
  const isSchoolStudent = currentStudent?.accessType === 'school';
  const firstInstallmentPaid = billingPlan[0]?.paid;
  const lockedMonth =
    currentStudent?.accessType === 'direct'
      ? !firstInstallmentPaid
        ? billingPlan[0] ?? null
        : nextUnpaidMonth?.deadlineDate && now >= new Date(nextUnpaidMonth.deadlineDate)
          ? nextUnpaidMonth
          : null
      : null;
  const hasActiveAccess = currentStudent
    ? currentStudent.accessType === 'school'
      ? true
      : Boolean(firstInstallmentPaid) && !lockedMonth
    : false;
  const projectApproved = currentStudent?.projectStatus === 'approved';
  const canAccessCertificate = currentStudent
    ? currentStudent.accessType === 'school'
      ? projectApproved
      : billingPlan.every((month) => month.paid) && projectApproved
    : false;
  const currentNavigation = user?.role === 'admin' ? ADMIN_NAVIGATION : STUDENT_NAVIGATION;
  const isLastPage = currentPage === selectedUnit.pages.length - 1;
  const unitProgress = Math.round(((currentPage + 1) / selectedUnit.pages.length) * 100);
  const answeredArenaQuestions = arenaAnswers.filter((answer) => answer !== undefined).length;
  const arenaFinished = answeredArenaQuestions === ARENA_CHALLENGES.length;
  const activeArenaQuestion = ARENA_CHALLENGES[arenaIndex];
  const activeArenaAnswer = arenaAnswers[arenaIndex];
  const arenaScore = arenaAnswers.reduce(
    (score, answer, index) => score + (answer === ARENA_CHALLENGES[index]?.answerIndex ? 1 : 0),
    0
  );
  const currentVideoScene = selectedUnit.videoLesson.scenes[videoSceneIndex] ?? selectedUnit.videoLesson.scenes[0];
  const currentVoiceKey = `${selectedUnit.id}-${videoSceneIndex}`;
  const currentVoiceReads = voiceReadCounts[currentVoiceKey] || 0;

  useEffect(() => {
    if (!isVideoPlaying || unitTab !== 'video') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setVideoProgress((progress) => {
        if (progress >= 100) {
          const isLastScene = videoSceneIndex >= selectedUnit.videoLesson.scenes.length - 1;

          if (isLastScene) {
            setIsVideoPlaying(false);
            return 100;
          }

          setVideoSceneIndex((index) => Math.min(index + 1, selectedUnit.videoLesson.scenes.length - 1));
          return 0;
        }

        return progress + 5;
      });
    }, 220);

    return () => window.clearInterval(intervalId);
  }, [isVideoPlaying, unitTab, videoSceneIndex, selectedUnit]);

  useEffect(() => {
    setVideoProgress(0);
    setIsVideoPlaying(false);
  }, [selectedUnitId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [loadedStudents, loadedCodes] = await Promise.all([getAllStudents(), getAllSchoolCodes()]);
        if (!cancelled) {
          setStudents(loadedStudents);
          setSchoolCodes(loadedCodes);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const studentsWithPendingReminders = useMemo(
    () =>
      students
        .filter((student) => student.accessType === 'direct')
        .map((student) => {
          const dueMonth = student.billingPlan.find(
            (month) =>
              !month.paid &&
              month.reminderDate &&
              now >= new Date(month.reminderDate) &&
              month.deadlineDate &&
              now <= new Date(month.deadlineDate)
          );

          return dueMonth ? { ...student, dueMonth } : null;
        })
        .filter(Boolean),
    [students, now]
  );

  const eligibleCertificateStudents = useMemo(
    () =>
      students.filter((student) =>
        student.accessType === 'school'
          ? student.projectStatus === 'approved'
          : student.projectStatus === 'approved' && student.billingPlan.every((month) => month.paid)
      ),
    [students]
  );

  const directStudentCount = students.filter((student) => student.accessType === 'direct').length;
  const schoolStudentCount = students.filter((student) => student.accessType === 'school').length;
  const approvedAssignmentsCount = (currentStudent?.assignmentSubmissions || []).filter(
    (submission) => submission.status === 'approved'
  ).length;
  const pendingAssignmentsCount = (currentStudent?.assignmentSubmissions || []).filter(
    (submission) => submission.status === 'pending_review'
  ).length;
  const needsChangesAssignmentsCount = (currentStudent?.assignmentSubmissions || []).filter(
    (submission) => submission.status === 'needs_changes'
  ).length;

  const baseStudentFieldsReady =
    studentName.trim() !== '' &&
    studentUsername.trim() !== '' &&
    studentEmail.trim() !== '' &&
    studentInstitution.trim() !== '' &&
    studentPassword.trim() !== '';

  const studentSigninReady =
    studentAccessMode === 'direct'
      ? studentEmail.trim() !== '' && studentPassword.trim() !== ''
      : studentEmail.trim() !== '' && studentPassword.trim() !== '' && studentId.trim() !== '';

  const studentSignupReady =
    studentAccessMode === 'direct'
      ? baseStudentFieldsReady
      : baseStudentFieldsReady && studentId.trim() !== '' && studentSchoolCode.trim() !== '';

  const adminLoginReady = adminEmail.trim() !== '' && adminPassword.trim() !== '';
  const schoolCodeFormReady = newSchoolName.trim() !== '' && newSchoolCode.trim() !== '';

  const updateCurrentStudent = async (updater) => {
    if (!currentStudent) {
      return;
    }

    await updateStudent(currentStudent.email, updater);
    await refreshData();
  };

  const resetStudentForm = () => {
    setStudentName('');
    setStudentUsername('');
    setStudentEmail('');
    setStudentInstitution('');
    setStudentPassword('');
    setStudentId('');
    setStudentSchoolCode('');
    setPaymentTransactionId('');
    setAssignmentUploadFiles({});
    setProjectFile(null);
  };

  const resetArena = () => {
    setArenaIndex(0);
    setArenaAnswers([]);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const readSceneHeadline = () => {
    if (currentVoiceReads >= 2 || !currentVideoScene) {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      window.alert('Voice reading is not supported in this browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentVideoScene.headline);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setVoiceReadCounts((counts) => ({
      ...counts,
      [currentVoiceKey]: currentVoiceReads + 1
    }));
  };

  const getPythonTutorReply = (query) => {
    const cleanedQuery = query.trim().toLowerCase();

    if (!cleanedQuery) {
      return 'Please type a Python question so I can help you clearly.';
    }

    const matchedUnit = unitdata.find((unit) => {
      const titleMatch = cleanedQuery.includes(unit.title.toLowerCase());
      const highlightMatch = unit.highlights?.some((item) => cleanedQuery.includes(item.toLowerCase()));
      const assignmentMatch = cleanedQuery.includes('assignment') && cleanedQuery.includes(unit.title.toLowerCase());
      return titleMatch || highlightMatch || assignmentMatch;
    });

    const quickRules = [
      {
        keywords: ['what is python', 'about python'],
        answer:
          'Python is a high-level, readable programming language used in web development, automation, data science, AI, scripting, and education. It is popular because beginners can learn it quickly while professionals can use it for real projects.'
      },
      {
        keywords: ['loop', 'for loop', 'while loop'],
        answer:
          'A loop repeats work. Use a for loop when you know what sequence or range to iterate over. Use a while loop when repetition depends on a condition staying true. break exits the loop and continue skips to the next iteration.'
      },
      {
        keywords: ['function', 'def', 'return'],
        answer:
          'A function is a reusable block of code created using def. It can receive input through parameters and send a result back with return. Functions reduce repetition and make programs easier to maintain.'
      },
      {
        keywords: ['list', 'tuple', 'set', 'dictionary', 'dict'],
        answer:
          'Lists are ordered and mutable, tuples are ordered and fixed, sets store unique values, and dictionaries store key-value pairs. Choose the data structure based on whether you need order, uniqueness, labels, or mutability.'
      },
      {
        keywords: ['class', 'object', 'oop', 'inheritance', 'polymorphism', 'abstraction', 'encapsulation'],
        answer:
          'In OOP, a class is a blueprint and an object is an instance of that blueprint. Inheritance lets one class reuse another, polymorphism allows one interface to behave differently, encapsulation protects data, and abstraction hides unnecessary details.'
      },
      {
        keywords: ['exception', 'error', 'try', 'except'],
        answer:
          'Exception handling protects your program from crashing unexpectedly. Put risky code in try, handle known problems in except, and use finally for cleanup. This makes Python programs safer and more user friendly.'
      },
      {
        keywords: ['file', 'file handling', 'read file', 'write file'],
        answer:
          'Python uses open() for files. Read mode loads data, write mode replaces content, and append mode adds content. Using with open(...) is recommended because it closes the file automatically.'
      }
    ];

    const matchedRule = quickRules.find((rule) => rule.keywords.some((keyword) => cleanedQuery.includes(keyword)));

    if (matchedUnit) {
      return `${matchedUnit.title}:\n\n${matchedUnit.pages[0]}\n\nExample:\n${matchedUnit.codeExample}\n\nAssignment guidance:\n${matchedUnit.assignmentBrief}`;
    }

    if (matchedRule) {
      return matchedRule.answer;
    }

    return 'I can help with Python basics, variables, operators, if/else, loops, lists, tuples, sets, dictionaries, functions, modules, file handling, exceptions, OOP, inheritance, polymorphism, abstraction, and project guidance. Please ask your question with a topic name or keyword for a deeper answer.';
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) {
      return;
    }

    const userMessage = { role: 'user', content: chatInput.trim() };
    const assistantMessage = {
      role: 'assistant',
      content: getPythonTutorReply(chatInput)
    };

    setChatMessages((messages) => [...messages, userMessage, assistantMessage]);
    setChatInput('');
  };

  const handleStudentSignIn = async () => {
    if (!studentSigninReady) {
      return;
    }

    try {
      const student = await loginStudent({
        accessType: studentAccessMode,
        email: studentEmail,
        studentId,
        password: studentPassword
      });

      setLoginError('');
      setUser({ role: 'student', email: student.email, name: student.name });
      setActiveView('dashboard');
      resetArena();
      await refreshData();
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleStudentSignUp = async () => {
    if (!studentSignupReady) {
      return;
    }

    try {
      const student = await registerStudent({
        name: studentName,
        username: studentUsername,
        email: studentEmail,
        institution: studentInstitution,
        password: studentPassword,
        accessType: studentAccessMode,
        studentId,
        schoolCode: studentSchoolCode
      });

      setLoginError('');
      setUser({ role: 'student', email: student.email, name: student.name });
      setActiveView('dashboard');
      resetArena();
      await refreshData();
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminLoginReady) {
      return;
    }

    if (
      adminEmail.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
      adminPassword === ADMIN_CREDENTIALS.password
    ) {
      setLoginError('');
      setUser({ role: 'admin', name: 'COD26 Admin', email: ADMIN_CREDENTIALS.email });
      setActiveView('dashboard');
      await refreshData();
      return;
    }

    setLoginError('Invalid admin email or password.');
  };

  const handleCreateSchoolCode = async () => {
    if (!schoolCodeFormReady) {
      return;
    }

    try {
      await createSchoolCode({ schoolName: newSchoolName, code: newSchoolCode });
      setLoginError('');
      setNewSchoolName('');
      setNewSchoolCode('');
      await refreshData();
    } catch (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = () => {
    stopSpeech();
    setIsVideoPlaying(false);
    setVideoProgress(0);
    setUser(null);
    setLoginMode('student');
    setStudentAccessMode('direct');
    setStudentAuthMode('signin');
    setAdminEmail('');
    setAdminPassword('');
    setAssignmentFeedbackDrafts({});
    setProjectFeedbackDrafts({});
    setLoginError('');
    setSidebarOpen(false);
    setActiveView('dashboard');
    resetStudentForm();
    resetArena();
  };

  const handleSelectUnit = (unitId) => {
    setSelectedUnitId(unitId);
    setCurrentPage(0);
    setVideoSceneIndex(0);
    setVideoProgress(0);
    setIsVideoPlaying(false);
    stopSpeech();
    setUnitTab('theory');
    setActiveView('units');
  };

  const handleVideoPlayPause = () => {
    if (videoSceneIndex >= selectedUnit.videoLesson.scenes.length - 1 && videoProgress >= 100) {
      setVideoSceneIndex(0);
      setVideoProgress(0);
    }

    setIsVideoPlaying((playing) => !playing);
  };

  const handleReplayVideo = () => {
    stopSpeech();
    setVideoSceneIndex(0);
    setVideoProgress(0);
    setIsVideoPlaying(true);
  };

  const handleSelectVideoScene = (index) => {
    stopSpeech();
    setVideoSceneIndex(index);
    setVideoProgress(0);
    setIsVideoPlaying(false);
  };

  const handleCurrentPayment = async () => {
    if (!currentStudent || !nextUnpaidMonth || paymentTransactionId.trim() === '') {
      return;
    }

    const paymentDate = new Date();

    await updateCurrentStudent((student) => {
      const updatedPlan = student.billingPlan.map((month) =>
        month.id === nextUnpaidMonth.id
          ? {
              ...month,
              cycleStart: month.cycleStart || paymentDate.toISOString(),
              paid: true,
              paidOn: paymentDate.toISOString(),
              reminderSent: false,
              transactionId: paymentTransactionId.trim().toUpperCase()
            }
          : month
      );

      return {
        ...student,
        billingPlan: scheduleNextInstallment(updatedPlan, nextUnpaidMonth.id, paymentDate)
      };
    });
    setPaymentTransactionId('');
  };

  const handleProjectFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProjectFile(file);
  };

  const handleAssignmentFileChange = (unitId, event) => {
    const file = event.target.files?.[0] || null;

    setAssignmentUploadFiles((current) => ({
      ...current,
      [unitId]: file
    }));
  };

  const handleAssignmentSubmit = async (unit) => {
    const file = assignmentUploadFiles[unit.id];

    if (!currentStudent || !file) {
      return;
    }

    let fileURL = '';
    if (hasFirebaseConfig && storage) {
      const storageRef = ref(storage, `assignments/${currentStudent.email}/${unit.id}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      fileURL = await getDownloadURL(snapshot.ref);
    }

    await updateCurrentStudent((student) => {
      const existing = student.assignmentSubmissions || [];
      const filtered = existing.filter((submission) => submission.unitId !== unit.id);

      return {
        ...student,
        assignmentSubmissions: [
          ...filtered,
          {
            unitId: unit.id,
            fileName: file.name,
            fileURL,
            submitted: true,
            submittedAt: new Date().toISOString(),
            status: 'pending_review',
            feedback: '',
            notes: `Submitted for ${unit.title}`
          }
        ]
      };
    });

    setAssignmentUploadFiles((current) => ({
      ...current,
      [unit.id]: null
    }));
  };

  const handleProjectSubmit = async () => {
    if (!projectFile && !currentStudent?.projectFileName) {
      return;
    }

    let fileName = currentStudent?.projectFileName || '';
    let fileURL = currentStudent?.projectFileURL || '';

    if (projectFile) {
      fileName = projectFile.name;
      if (hasFirebaseConfig && storage) {
        const storageRef = ref(storage, `projects/${currentStudent.email}/${projectFile.name}`);
        const snapshot = await uploadBytes(storageRef, projectFile);
        fileURL = await getDownloadURL(snapshot.ref);
      }
    }

    await updateCurrentStudent((student) => ({
      ...student,
      projectFileName: fileName,
      projectFileURL: fileURL,
      projectSubmitted: true,
      projectSubmittedAt: new Date().toISOString(),
      projectStatus: 'pending_review',
      projectFeedback: ''
    }));

    setProjectFile(null);
    setActiveView('certificate');
  };

  const markStudentMonthPaid = async (email, monthId, paid) => {
    await updateStudent(email, (student) => ({
      ...student,
      billingPlan: student.billingPlan.map((month) =>
        month.id === monthId
          ? {
              ...month,
              paid,
              reminderSent: paid ? false : month.reminderSent,
              transactionId: paid ? month.transactionId : ''
            }
          : month
      )
    }));
    await refreshData();
  };

  const markReminderSent = async (email, monthId) => {
    await updateStudent(email, (student) => ({
      ...student,
      billingPlan: student.billingPlan.map((month) =>
        month.id === monthId ? { ...month, reminderSent: true } : month
      )
    }));
    await refreshData();
  };

  const updateAssignmentReviewStatus = async (email, unitId, status, feedback = '') => {
    await updateStudent(email, (student) => ({
      ...student,
      assignmentSubmissions: (student.assignmentSubmissions || []).map((submission) =>
        submission.unitId === unitId
          ? { ...submission, status, feedback }
          : submission
      )
    }));
    setAssignmentFeedbackDrafts((drafts) => ({
      ...drafts,
      [`${email}-${unitId}`]: feedback
    }));
    await refreshData();
  };

  const updateProjectReviewStatus = async (email, status, feedback = '') => {
    await updateStudent(email, (student) => ({
      ...student,
      projectStatus: status,
      projectFeedback: feedback
    }));
    setProjectFeedbackDrafts((drafts) => ({
      ...drafts,
      [email]: feedback
    }));
    await refreshData();
  };

  const handleArenaAnswer = (optionIndex) => {
    if (activeArenaAnswer !== undefined) {
      return;
    }

    setArenaAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers];
      nextAnswers[arenaIndex] = optionIndex;
      return nextAnswers;
    });
  };

  const handleArenaNext = async () => {
    if (arenaIndex === ARENA_CHALLENGES.length - 1) {
      if (currentStudent) {
        await updateCurrentStudent((student) => ({
          ...student,
          arenaBestScore: Math.max(student.arenaBestScore || 0, arenaScore)
        }));
      }
      return;
    }

    setArenaIndex((index) => Math.min(index + 1, ARENA_CHALLENGES.length - 1));
  };

  const renderDummyCertificate = (name) => (
    <div className="certificate-box dummy-certificate">
      <div className="certificate-brand">
        <img src={logo} className="certificate-logo" alt="COD26 certificate logo" />
        <div>
          <p className="eyebrow">COD26</p>
          <h3>Create. Optimize. Develop.</h3>
        </div>
      </div>
      <p className="eyebrow dummy-badge">Dummy certificate preview</p>
      <h1>Certificate of Achievement</h1>
      <p>This is a preview certificate for</p>
      <h2>{name || 'Student Name'}</h2>
      <p>It becomes official only when the required conditions are completed.</p>
    </div>
  );

  const renderStudentPlan = (student, adminEditable = false) => {
    if (student.accessType !== 'direct') {
      return (
        <div className="empty-state">
          <h3>No payment required</h3>
          <p>
            This student is enrolled through school code <strong>{student.schoolCode}</strong> and uses
            student ID <strong>{student.studentId}</strong>.
          </p>
        </div>
      );
    }

    const firstPendingMonth = student.billingPlan.find((month) => !month.paid);
    const activeDueMonth =
      firstPendingMonth?.id === 1
        ? firstPendingMonth
        : firstPendingMonth?.deadlineDate && now >= new Date(firstPendingMonth.deadlineDate)
          ? firstPendingMonth
          : null;

    return (
      <div className="payment-plan-list">
        {student.billingPlan.map((month) => {
          const dueNow = Boolean(activeDueMonth && activeDueMonth.id === month.id);
          const statusLabel = month.paid ? 'Paid' : dueNow ? 'Payment due' : 'Upcoming';
          const statusClass = month.paid ? 'status-paid' : dueNow ? 'status-due' : 'status-upcoming';

          return (
            <article key={`${student.email}-${month.id}`} className="plan-card">
              <div className="section-header compact-header">
                <div>
                  <p className="eyebrow">{month.title}</p>
                  <h3>{month.monthLabel}</h3>
                </div>
                <span className={`status-chip ${statusClass}`}>{statusLabel}</span>
              </div>
              <p>₹299 payment through scanner.</p>
              <p className="helper-text">Reminder mail date: {formatDate(month.reminderDate)}</p>
              <p className="helper-text">Deadline: {formatDate(month.deadlineDate)}</p>
              <p className="helper-text">
                Transaction ID: <strong>{month.transactionId || 'Not submitted yet'}</strong>
              </p>
              {adminEditable && (
                <div className="button-row">
                  <button
                    className="secondary-button"
                    onClick={() => markStudentMonthPaid(student.email, month.id, true)}
                  >
                    Mark Paid
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => markStudentMonthPaid(student.email, month.id, false)}
                  >
                    Mark Unpaid
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="dashboard-grid">
      <section className="panel-card hero-card">
        <div className="hero-brand-row">
          <img src={logo} className="hero-logo" alt="COD26 logo" />
          <div>
            <p className="eyebrow">{isSchoolStudent ? 'Partner school / college access' : 'Direct student access'}</p>
            <h2>Welcome back, {currentStudent?.name || 'Student'}!</h2>
          </div>
        </div>
        <p>
          {isSchoolStudent
            ? `You are learning through partner institution access using school code ${currentStudent?.schoolCode}, student ID ${currentStudent?.studentId}, and ${currentStudent?.institution}.`
            : `You are enrolled as a direct COD26 student from ${currentStudent?.institution}. Enter your monthly transaction ID after payment to unlock the course.`}
        </p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total units</span>
          <strong>{unitdata.length}</strong>
        </article>
        <article className="stat-card">
          <span>Access status</span>
          <strong>{hasActiveAccess ? 'Active' : 'Locked until valid transaction ID'}</strong>
        </article>
        <article className="stat-card">
          <span>{isSchoolStudent ? 'Student ID' : 'Months paid'}</span>
          <strong>{isSchoolStudent ? currentStudent?.studentId : `${paidMonths} / 6`}</strong>
        </article>
      </section>

      <section className="panel-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Continue learning</p>
            <h3>{selectedUnit.title}</h3>
          </div>
          <button className="secondary-button" onClick={() => setActiveView('units')}>
            Open units
          </button>
        </div>
        <p>{selectedUnit.pages[currentPage]}</p>
      </section>

      <section className="panel-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Submission summary</p>
            <h3>Assignments and project review</h3>
          </div>
        </div>
        <div className="mini-summary-grid">
          <article className="mini-summary-card">
            <span>Assignments approved</span>
            <strong>{approvedAssignmentsCount}</strong>
          </article>
          <article className="mini-summary-card">
            <span>Pending review</span>
            <strong>{pendingAssignmentsCount}</strong>
          </article>
          <article className="mini-summary-card">
            <span>Needs changes</span>
            <strong>{needsChangesAssignmentsCount}</strong>
          </article>
          <article className="mini-summary-card">
            <span>Project review</span>
            <strong>{currentStudent?.projectStatus?.replace('_', ' ') || 'not submitted'}</strong>
          </article>
        </div>
      </section>

      <section className="panel-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Certificate rule</p>
            <h3>{isSchoolStudent ? 'Project submission required' : '6 payments + project submission'}</h3>
          </div>
          <button className="secondary-button" onClick={() => setActiveView('certificate')}>
            View certificate
          </button>
        </div>
        <p>
          {isSchoolStudent
            ? `School: ${schoolDetails?.schoolName || 'Approved school partner'} · Project review: ${currentStudent?.projectStatus?.replace('_', ' ') || 'not submitted'}`
            : `Payments completed: ${paidMonths}/6 · Project review: ${currentStudent?.projectStatus?.replace('_', ' ') || 'not submitted'}`}
        </p>
      </section>
    </div>
  );

  const renderUnits = () => (
    <div className="units-layout">
      <aside className="units-list panel-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Course structure</p>
            <h3>COD26 Units</h3>
          </div>
          <span>{unitdata.length} topics</span>
        </div>

        {unitdata.map((unit) => (
          <button
            key={unit.id}
            className={`unit-list-button ${unit.id === selectedUnit.id ? 'active' : ''}`}
            onClick={() => handleSelectUnit(unit.id)}
          >
            <span>Unit {unit.id}</span>
            <strong>{unit.title}</strong>
          </button>
        ))}
      </aside>

      <section className="panel-card unit-detail-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Unit {selectedUnit.id}</p>
            <h2>{selectedUnit.title}</h2>
          </div>
          <div className="unit-progress-box">
            <span>{unitProgress}% complete</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${unitProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="highlight-row">
          {selectedUnit.highlights?.map((item) => (
            <span key={item} className="highlight-chip">{item}</span>
          ))}
        </div>

        <div className="tab-strip">
          <button
            className={`tab-pill ${unitTab === 'theory' ? 'active' : ''}`}
            onClick={() => setUnitTab('theory')}
          >
            Theory
          </button>
          <button
            className={`tab-pill ${unitTab === 'code' ? 'active' : ''}`}
            onClick={() => setUnitTab('code')}
          >
            Code Example
          </button>
          <button
            className={`tab-pill ${unitTab === 'video' ? 'active' : ''}`}
            onClick={() => setUnitTab('video')}
          >
            AI Video
          </button>
          <button
            className={`tab-pill ${unitTab === 'practice' ? 'active' : ''}`}
            onClick={() => setUnitTab('practice')}
          >
            Practice
          </button>
        </div>

        {unitTab === 'theory' && (
          <>
            <div className="theory-box">
              <p>{selectedUnit.pages[currentPage]}</p>
            </div>

            <div className="page-controls">
              <button
                className="secondary-button"
                onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </button>
              <span>
                Page {currentPage + 1} of {selectedUnit.pages.length}
              </span>
              <button
                className="secondary-button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(selectedUnit.pages.length - 1, page + 1))
                }
                disabled={isLastPage}
              >
                Next
              </button>
            </div>
          </>
        )}

        {unitTab === 'code' && (
          <div className="code-card">
            <div className="section-header compact-header">
              <div>
                <p className="eyebrow">Code spotlight</p>
                <h3>Example for {selectedUnit.title}</h3>
              </div>
            </div>
            <pre>{selectedUnit.codeExample}</pre>
          </div>
        )}

        {unitTab === 'video' && (
          <div className="video-card enhanced-video-card">
            <div className="video-hero">
              <button className="video-screen" onClick={handleVideoPlayPause}>
                <span className="video-badge">AI Lesson</span>
                <div className="video-screen-content">
                  <div className="video-screen-top">
                    <p className="eyebrow">COD26 Learning Studio</p>
                    <span className="status-chip status-upcoming">
                      Scene {videoSceneIndex + 1} of {selectedUnit.videoLesson.scenes.length}
                    </span>
                  </div>
                  <div className="video-screen-main">
                    <div className="play-circle large-play">{isVideoPlaying ? '❚❚' : '▶'}</div>
                    <div>
                      <h3>{currentVideoScene.headline}</h3>
                      <p className="helper-text">{selectedUnit.videoLesson.summary}</p>
                    </div>
                  </div>
                  <div className="video-progress-bar">
                    <div className="video-progress-fill" style={{ width: `${videoProgress}%` }} />
                  </div>
                </div>
              </button>

              <div className="video-meta-grid">
                <article className="video-meta-card">
                  <span>Duration</span>
                  <strong>{selectedUnit.videoLesson.duration}</strong>
                </article>
                <article className="video-meta-card">
                  <span>Theory topic</span>
                  <strong>{selectedUnit.theoryTopic}</strong>
                </article>
                <article className="video-meta-card">
                  <span>Assignment window</span>
                  <strong>{selectedUnit.assignmentWindowDays} days</strong>
                </article>
              </div>
            </div>

            <div className="video-placeholder">
              <div className="play-circle">▶</div>
              <div>
                <strong>Working AI Lesson Player</strong>
                <p className="helper-text">Click the large video area to play or pause. The lesson auto-moves scene by scene so students can actually watch the topic flow inside the website.</p>
              </div>
            </div>

            <div className="current-scene-card">
              <div className="section-header compact-header">
                <div>
                  <p className="eyebrow">Current scene explanation</p>
                  <h3>{currentVideoScene.headline}</h3>
                </div>
                <span className="status-chip status-upcoming">
                  Voice headline {currentVoiceReads}/2
                </span>
              </div>
              <p>{currentVideoScene.narration}</p>
              <div className="alert-box subtle-alert compact-top">
                <strong>Key takeaway</strong>
                <p>{currentVideoScene.takeaway}</p>
              </div>
              <div className="button-row top-space-small wrap-row">
                <button
                  className="secondary-button inline-button"
                  onClick={() => handleSelectVideoScene(Math.max(0, videoSceneIndex - 1))}
                  disabled={videoSceneIndex === 0}
                >
                  Previous scene
                </button>
                <button className="secondary-button inline-button" onClick={handleVideoPlayPause}>
                  {isVideoPlaying ? 'Pause AI lesson' : 'Play AI lesson'}
                </button>
                <button className="secondary-button inline-button" onClick={handleReplayVideo}>
                  Replay from start
                </button>
                <button
                  className="secondary-button inline-button"
                  onClick={readSceneHeadline}
                  disabled={currentVoiceReads >= 2}
                >
                  Voice bot: read headline
                </button>
                <button
                  className="secondary-button inline-button"
                  onClick={() => handleSelectVideoScene(Math.min(selectedUnit.videoLesson.scenes.length - 1, videoSceneIndex + 1))}
                  disabled={videoSceneIndex === selectedUnit.videoLesson.scenes.length - 1}
                >
                  Next scene
                </button>
              </div>
            </div>

            <div className="scene-grid">
              {selectedUnit.videoLesson.scenes.map((scene, index) => (
                <article
                  key={scene.headline}
                  className={`scene-card ${index === videoSceneIndex ? 'active' : ''}`}
                  onClick={() => handleSelectVideoScene(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      handleSelectVideoScene(index);
                    }
                  }}
                >
                  <span className="scene-number">Scene {index + 1}</span>
                  <h4>{scene.headline}</h4>
                  <p>{scene.takeaway}</p>
                </article>
              ))}
            </div>

            <div className="alert-box subtle-alert compact-top">
              <strong>AI prompt</strong>
              <p>{selectedUnit.videoLesson.prompt}</p>
            </div>

            <div className="button-row top-space-small wrap-row">
              <button className="secondary-button inline-button" onClick={() => handleDownloadAssignment(selectedUnit)}>
                Download assignment PDF
              </button>
            </div>
          </div>
        )}

        {unitTab === 'practice' && (
          <div className="assessment-box">
            <h3>{selectedUnit.theoryTopic}</h3>
            <p>{selectedUnit.quiz}</p>
            <h3>Assignment</h3>
            <p>{selectedUnit.assignment}</p>
            <p>{selectedUnit.assignmentBrief}</p>
            <p className="helper-text">Complete this assignment within {selectedUnit.assignmentWindowDays} days.</p>
            <div className="button-row top-space-small">
              <button className="secondary-button" onClick={() => handleDownloadAssignment(selectedUnit)}>
                Download Assignment PDF
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );

  const renderChatbot = () => (
    <section className="panel-card chatbot-layout">
      <div className="section-header">
        <div>
          <p className="eyebrow">COD26 Python Assistant</p>
          <h2>Python Doubt Solver Chatbot</h2>
        </div>
        <span className="status-chip status-upcoming">Python-focused help</span>
      </div>

      <div className="chatbot-shell">
        <div className="quick-prompts">
          {[
            'What is Python?',
            'Explain loops with example',
            'Difference between list and tuple',
            'Explain OOP simply',
            'How does exception handling work?'
          ].map((prompt) => (
            <button key={prompt} className="secondary-button inline-button" onClick={() => setChatInput(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-window">
          {chatMessages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
              <strong>{message.role === 'assistant' ? 'COD26 Bot' : 'You'}</strong>
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        <div className="chat-compose">
          <textarea
            value={chatInput}
            onChange={(event) => setChatInput(event.target.value)}
            placeholder="Ask any Python question related to syntax, loops, functions, OOP, exceptions, files, assignments, or projects..."
          />
          <div className="button-row wrap-row">
            <button className="primary-button inline-button" onClick={handleChatSend}>
              Ask chatbot
            </button>
            <button
              className="secondary-button inline-button"
              onClick={() =>
                setChatMessages([
                  {
                    role: 'assistant',
                    content:
                      'Hello! I am your COD26 Python chatbot. Ask me any Python question about syntax, loops, functions, OOP, exceptions, file handling, projects, or unit topics.'
                  }
                ])
              }
            >
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderArena = () => (
    <section className="panel-card arena-layout">
      <div className="section-header">
        <div>
          <p className="eyebrow">COD26 Arena</p>
          <h2>Quiz Compete Section</h2>
        </div>
        <span className="status-chip status-upcoming">
          {answeredArenaQuestions} / {ARENA_CHALLENGES.length} answered
        </span>
      </div>

      <div className="arena-grid">
        <div className="panel-subcard">
          {!arenaFinished ? (
            <>
              <p className="arena-badge">Round {arenaIndex + 1}</p>
              <h3>{activeArenaQuestion.title}</h3>
              <p className="quiz-question">{activeArenaQuestion.question}</p>
              <div className="arena-options">
                {activeArenaQuestion.options.map((option, index) => {
                  const isSelected = activeArenaAnswer === index;
                  const isCorrect = activeArenaQuestion.answerIndex === index;
                  const optionClassName = [
                    'arena-option',
                    activeArenaAnswer !== undefined && isCorrect ? 'correct' : '',
                    activeArenaAnswer !== undefined && isSelected && !isCorrect ? 'wrong' : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={option}
                      className={optionClassName}
                      onClick={() => handleArenaAnswer(index)}
                      disabled={activeArenaAnswer !== undefined}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {activeArenaAnswer !== undefined && (
                <div className="alert-box success-banner">
                  <strong>
                    {activeArenaAnswer === activeArenaQuestion.answerIndex
                      ? 'Correct!'
                      : 'Keep practicing!'}
                  </strong>
                  <p>{activeArenaQuestion.explanation}</p>
                </div>
              )}

              <div className="page-controls">
                <button className="secondary-button" onClick={resetArena}>
                  Restart arena
                </button>
                <button
                  className="primary-button inline-button"
                  onClick={handleArenaNext}
                  disabled={activeArenaAnswer === undefined}
                >
                  {arenaIndex === ARENA_CHALLENGES.length - 1 ? 'Finish challenge' : 'Next round'}
                </button>
              </div>
            </>
          ) : (
            <div className="certificate-box arena-summary">
              <p className="eyebrow">Challenge complete</p>
              <h2>You finished the COD26 Arena!</h2>
              <p>
                Final score: <strong>{arenaScore}</strong> out of {ARENA_CHALLENGES.length}
              </p>
              <p className="helper-text">
                Best score saved for your account: {Math.max(currentStudent?.arenaBestScore || 0, arenaScore)}
              </p>
              <button className="primary-button" onClick={resetArena}>
                Play again
              </button>
            </div>
          )}
        </div>

        <aside className="panel-subcard">
          <h3>Leaderboard preview</h3>
          <div className="assignment-list compact-list">
            {SAMPLE_LEADERBOARD.map((entry, index) => (
              <article key={entry.name} className="assignment-item compact-item">
                <strong>
                  #{index + 1} {entry.name}
                </strong>
                <span>{entry.score} pts</span>
              </article>
            ))}
            <article className="assignment-item compact-item">
              <strong>You</strong>
              <span>{Math.max(currentStudent?.arenaBestScore || 0, arenaScore)} pts</span>
            </article>
          </div>
        </aside>
      </div>
    </section>
  );

  const renderAssignments = () => (
    <section className="panel-card assignment-list">
      <div className="section-header">
        <div>
          <p className="eyebrow">Practice track</p>
          <h2>Assignments</h2>
        </div>
        <span>{unitdata.length} tasks</span>
      </div>

      {unitdata.map((unit) => {
        const submission = currentStudent ? getAssignmentStatus(currentStudent, unit.id) : null;

        return (
          <article key={unit.id} className="assignment-item">
            <h3>
              Unit {unit.id}: {unit.title}
            </h3>
            <p><strong>{unit.theoryTopic}</strong></p>
            <p>{unit.assignment}</p>
            <p>{unit.assignmentBrief}</p>
            <p className="helper-text">Deadline window: complete within {unit.assignmentWindowDays} days.</p>
            <div className="submission-box">
              <label className="form-field compact-field" htmlFor={`assignment-${unit.id}`}>
                Submit assignment file
                <input
                  id={`assignment-${unit.id}`}
                  type="file"
                  onChange={(event) => handleAssignmentFileChange(unit.id, event)}
                />
              </label>
              <p className="helper-text">
                {assignmentUploadFiles[unit.id]
                  ? `Selected file: ${assignmentUploadFiles[unit.id].name}`
                  : submission?.fileName
                    ? `Latest submitted file: ${submission.fileName}`
                    : 'No assignment file selected yet.'}
              </p>
              <p className="helper-text">
                Status:{' '}
                <strong>{submission?.submitted ? `Submitted on ${formatDate(submission.submittedAt)}` : 'Pending submission'}</strong>
              </p>
              {submission?.status && (
                <p className="helper-text">
                  Review status: <strong>{submission.status.replace('_', ' ')}</strong>
                  {submission.feedback ? ` · ${submission.feedback}` : ''}
                </p>
              )}
            </div>
            <div className="button-row top-space-small wrap-row">
              <button className="secondary-button" onClick={() => handleDownloadAssignment(unit)}>
                Download Assignment PDF
              </button>
              <button
                className="secondary-button inline-button"
                onClick={() => handleAssignmentSubmit(unit)}
                disabled={!assignmentUploadFiles[unit.id]}
              >
                Submit Assignment
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );

  const renderProject = () => (
    <section className="panel-card">
      <p className="eyebrow">Final evaluation</p>
      <h2>Project submission</h2>
      <p>
        {isSchoolStudent
          ? 'School students can submit their project to unlock the official certificate.'
          : 'Direct students can submit their project anytime, but the certificate unlocks only after all 6 monthly payments are completed.'}
      </p>
      <label className="form-field" htmlFor="project-upload">
        Upload your project file
        <input id="project-upload" type="file" onChange={handleProjectFileChange} />
      </label>
      <p className="helper-text">
        {projectFile
          ? `Selected file: ${projectFile.name}`
          : currentStudent?.projectFileName
            ? `Previously submitted: ${currentStudent.projectFileName}`
            : 'Choose a file before submitting your final project.'}
      </p>
      <p className="helper-text">
        Review status: <strong>{currentStudent?.projectStatus?.replace('_', ' ') || 'not submitted'}</strong>
        {currentStudent?.projectFeedback ? ` · ${currentStudent.projectFeedback}` : ''}
      </p>
      <button
        className="primary-button"
        onClick={handleProjectSubmit}
        disabled={!projectFile && !currentStudent?.projectFileName}
      >
        Submit project
      </button>
      <div className="alert-box subtle-alert">
        <strong>Certificate rule</strong>
        <p>
          {isSchoolStudent
            ? 'Project submission unlocks the school-program certificate.'
            : 'For direct students, the certificate unlocks only after 6 paid months and project submission.'}
        </p>
      </div>
    </section>
  );

  const handleDownloadAssignment = (unit) => {
    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (unit.assignmentWindowDays || 10));

    const assignmentWindow = window.open('', '_blank', 'width=1000,height=820');

    if (!assignmentWindow) {
      window.alert('Please allow pop-ups to open the assignment PDF print window.');
      return;
    }

    assignmentWindow.document.write(`
      <html>
        <head>
          <title>COD26 Assignment - ${unit.title}</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; background: #f6efe4; color: #2f241c; }
            .sheet { max-width: 920px; margin: 24px auto; background: white; border-radius: 24px; border: 10px solid #d86d1f; padding: 32px; box-sizing: border-box; }
            .brand { display: flex; align-items: center; gap: 16px; margin-bottom: 22px; }
            .brand img { width: 70px; height: 70px; border-radius: 18px; object-fit: cover; }
            h1 { margin: 8px 0 10px; font-size: 34px; }
            h2 { margin: 0; font-size: 24px; color: #b85713; }
            h3 { margin-top: 24px; }
            p, li { line-height: 1.7; font-size: 17px; }
            .eyebrow { text-transform: uppercase; letter-spacing: 0.15em; color: #b85713; font-weight: bold; font-size: 12px; margin: 0 0 6px; }
            .box { background: #fff8ef; border: 1px solid #eadac7; border-radius: 18px; padding: 18px; margin-top: 16px; }
            ul { padding-left: 20px; }
            @media print { .sheet { margin: 0 auto; box-shadow: none; } body { background: white; } }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="brand">
              <img src="${logo}" alt="COD26 logo" />
              <div>
                <p class="eyebrow">COD26 Assignment Sheet</p>
                <h1>${unit.title}</h1>
                <h2>${unit.theoryTopic}</h2>
              </div>
            </div>
            <div class="box">
              <p><strong>Allotted on:</strong> ${startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Submission deadline:</strong> ${dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Completion rule:</strong> This assignment must be completed within ${unit.assignmentWindowDays || 10} days.</p>
            </div>
            <h3>Theory Focus</h3>
            <p>${unit.pages[0].replace(/\n/g, ' ')}</p>
            <h3>Assignment Work</h3>
            <p>${unit.assignment}</p>
            <h3>Guidance</h3>
            <p>${unit.assignmentBrief}</p>
            <div class="box">
              <p><strong>Before submitting:</strong></p>
              <ul>
                <li>Read the complete theory pages carefully.</li>
                <li>Study the code example for this unit.</li>
                <li>Prepare your work clearly and submit within the deadline.</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `);
    assignmentWindow.document.close();
    assignmentWindow.focus();
    setTimeout(() => assignmentWindow.print(), 500);
  };

  const handleDownloadCertificate = () => {
    const certificateName = currentStudent?.name || eligibleCertificateStudents[0]?.name || 'COD26 Student';
    const certificateSubtext = isSchoolStudent
      ? `Institution access verified with student ID ${currentStudent?.studentId || 'N/A'} and successful project submission.`
      : 'All required learning milestones and project submission were completed successfully.';

    const certificateWindow = window.open('', '_blank', 'width=1100,height=850');

    if (!certificateWindow) {
      window.alert('Please allow pop-ups to open the printable certificate.');
      return;
    }

    certificateWindow.document.write(`
      <html>
        <head>
          <title>COD26 Certificate - ${certificateName}</title>
          <style>
            body {
              margin: 0;
              font-family: Georgia, 'Times New Roman', serif;
              background: #f6efe4;
              color: #2f241c;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .sheet {
              width: 1100px;
              max-width: calc(100vw - 40px);
              background: linear-gradient(135deg, #fffaf2, #fff2e0);
              border: 14px solid #d86d1f;
              border-radius: 28px;
              padding: 48px;
              box-sizing: border-box;
              box-shadow: 0 20px 50px rgba(0,0,0,0.12);
            }
            .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 18px;
              margin-bottom: 20px;
            }
            .brand img {
              width: 86px;
              height: 86px;
              border-radius: 22px;
              object-fit: cover;
            }
            .eyebrow {
              text-transform: uppercase;
              letter-spacing: 0.18em;
              color: #b85713;
              font-size: 12px;
              font-weight: bold;
              margin: 0 0 8px;
              text-align: center;
            }
            h1 {
              text-align: center;
              font-size: 52px;
              margin: 10px 0 18px;
            }
            h2 {
              text-align: center;
              font-size: 36px;
              margin: 18px 0;
              color: #b85713;
            }
            p {
              text-align: center;
              font-size: 20px;
              line-height: 1.7;
              margin: 10px 0;
            }
            .footer {
              margin-top: 36px;
              display: flex;
              justify-content: space-between;
              gap: 24px;
              align-items: end;
            }
            .sign {
              flex: 1;
              border-top: 2px solid #d5b999;
              padding-top: 12px;
              text-align: center;
              font-size: 18px;
            }
            .date {
              font-size: 16px;
              color: #6f6257;
            }
            @media print {
              body {
                background: white;
              }
              .sheet {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="brand">
              <img src="${logo}" alt="COD26 logo" />
              <div>
                <p class="eyebrow">COD26</p>
                <p style="margin:0;font-size:22px;font-weight:bold;">Create. Optimize. Develop.</p>
              </div>
            </div>
            <p class="eyebrow">Official Certificate of Achievement</p>
            <h1>Certificate of Achievement</h1>
            <p>This certificate is proudly awarded to</p>
            <h2>${certificateName}</h2>
            <p>for successfully completing the COD26 learning journey and meeting the required academic and platform criteria.</p>
            <p>${certificateSubtext}</p>
            <div class="footer">
              <div class="sign">Academic Coordinator</div>
              <div class="sign">COD26 Director</div>
            </div>
            <p class="date">Issued on ${new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}</p>
          </div>
        </body>
      </html>
    `);
    certificateWindow.document.close();
    certificateWindow.focus();
    setTimeout(() => certificateWindow.print(), 500);
  };

  const renderCertificate = () => {
    const certificateName = currentStudent?.name || eligibleCertificateStudents[0]?.name || 'COD26 Student';

    return (
      <section className="panel-card cert-section column-layout">
        {user?.role === 'admin' || canAccessCertificate ? (
          <div className="certificate-box">
            <div className="certificate-brand">
              <img src={logo} className="certificate-logo" alt="COD26 certificate logo" />
              <div>
                <p className="eyebrow">COD26</p>
                <h3>Create. Optimize. Develop.</h3>
              </div>
            </div>
            <p className="eyebrow">Official certificate</p>
            <h1>Certificate of Achievement</h1>
            <p>This certificate is proudly awarded to</p>
            <h2>{certificateName}</h2>
            <p>for successfully completing the COD26 learning journey.</p>
            <p className="helper-text">
              {isSchoolStudent
                ? 'Institution access verified with student ID and project submission.'
                : 'All required learning milestones and project submission were completed successfully.'}
            </p>
            <div className="certificate-actions">
              <button className="primary-button inline-button" onClick={handleDownloadCertificate}>
                Download / Print Certificate
              </button>
              <p className="helper-text small-note">
                A print window opens. Choose <strong>Save as PDF</strong> in your browser to download it.
              </p>
            </div>
          </div>
        ) : (
          <div className="certificate-preview-stack">
            <div className="empty-state wide-card">
              <h2>Certificate locked</h2>
              <p>
                {isSchoolStudent
                  ? 'Partner institution students must submit the project to receive the certificate.'
                  : 'Please complete the required learning milestones and submit the project to receive the certificate.'}
              </p>
            </div>
            {renderDummyCertificate(currentStudent?.name)}
          </div>
        )}
      </section>
    );
  };

  const renderPaymentGate = () => (
    <section className="panel-card payment-gate">
      <p className="eyebrow">Scanner payment required</p>
      <h2>₹299 per month for 6 months</h2>
      <p>
        This direct-student portal unlocks only after payment. Every child who has paid must enter a
        valid transaction ID. Without transaction ID, the course stays locked.
      </p>
      <img src={scanner} className="scanner-img" alt="Payment QR code" />
      {lockedMonth && (
        <div className="alert-box">
          <strong>{lockedMonth.monthLabel} payment is pending.</strong>
          <p>
            Reminder mail date: {formatDate(lockedMonth.reminderDate)} · Deadline:{' '}
            {formatDate(lockedMonth.deadlineDate)}
          </p>
          <p>
            Each new payment creates the next deadline after 30 days, and reminder mail should be sent 3 days before that deadline.
          </p>
        </div>
      )}
      <label className="form-field" htmlFor="transaction-id">
        Transaction ID
        <input
          id="transaction-id"
          type="text"
          placeholder="Enter payment transaction ID"
          value={paymentTransactionId}
          onChange={(event) => setPaymentTransactionId(event.target.value)}
        />
      </label>
      <button
        className="primary-button"
        onClick={handleCurrentPayment}
        disabled={paymentTransactionId.trim() === ''}
      >
        Unlock course for {nextUnpaidMonth?.monthLabel || 'current month'}
      </button>
      {currentStudent && renderStudentPlan(currentStudent, false)}
    </section>
  );

  const renderAdminOverview = () => (
    <div className="dashboard-grid">
      <section className="panel-card hero-card">
        <p className="eyebrow">Admin control center</p>
        <h2>COD26 Admin Dashboard</h2>
        <p>
          Manage direct students, school-code students, monthly transaction IDs, reminder mails,
          and certificate eligibility from one place.
        </p>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Official admin</span>
          <strong>{ADMIN_CREDENTIALS.email}</strong>
        </article>
        <article className="stat-card">
          <span>Direct students</span>
          <strong>{directStudentCount}</strong>
        </article>
        <article className="stat-card">
          <span>School-code students</span>
          <strong>{schoolStudentCount}</strong>
        </article>
      </section>

      <section className="panel-card">
        <p className="eyebrow">School code control</p>
        <h3>{schoolCodes.length} active school code(s)</h3>
        <p>Admins create school codes. School students must enter school code and student ID.</p>
      </section>

      <section className="panel-card">
        <p className="eyebrow">Backend mode</p>
        <h3>{platformMode}</h3>
        <p>
          Student data is currently stored locally until real Firebase credentials are connected.
        </p>
      </section>
    </div>
  );

  const renderAdminSchoolCodes = () => (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">School access manager</p>
          <h2>Create school code</h2>
        </div>
        <span>{schoolCodes.length} active codes</span>
      </div>

      <label className="form-field" htmlFor="school-name">
        School name
        <input
          id="school-name"
          type="text"
          placeholder="Enter school name"
          value={newSchoolName}
          onChange={(event) => setNewSchoolName(event.target.value)}
        />
      </label>
      <label className="form-field" htmlFor="school-code">
        School code
        <input
          id="school-code"
          type="text"
          placeholder="Enter school code"
          value={newSchoolCode}
          onChange={(event) => setNewSchoolCode(event.target.value.toUpperCase())}
        />
      </label>
      <button className="primary-button" onClick={handleCreateSchoolCode} disabled={!schoolCodeFormReady}>
        Create school code
      </button>

      <div className="student-records top-space">
        {schoolCodes.length === 0 ? (
          <div className="empty-state">
            <h3>No school codes yet</h3>
            <p>Create a code here, then school students can register without payment.</p>
          </div>
        ) : (
          schoolCodes.map((entry) => (
            <article key={entry.id} className="student-card panel-subcard">
              <p className="eyebrow">School partner</p>
              <h3>{entry.schoolName}</h3>
              <p>
                Code: <strong>{entry.code}</strong>
              </p>
              <p className="helper-text">Created on {formatDate(entry.createdAt)}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );

  const renderAdminPayments = () => (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Payment manager</p>
          <h2>Student access records</h2>
        </div>
        <span>{students.length} student record(s)</span>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No student accounts yet</h3>
          <p>Once students create accounts, their direct or school access data will appear here.</p>
        </div>
      ) : (
        <div className="student-records">
          {students.map((student) => (
            <article key={student.email} className="student-card panel-subcard">
              <div className="section-header">
                <div>
                  <p className="eyebrow">{student.accessType === 'school' ? 'Partner institution student' : 'Direct student'}</p>
                  <h3>{student.name}</h3>
                  <p className="helper-text">{student.email}</p>
                  <p className="helper-text">@{student.username} · {student.institution}</p>
                </div>
                <span className="status-chip status-upcoming">
                  {student.accessType === 'school'
                    ? student.studentId || 'Student ID pending'
                    : `${student.billingPlan.filter((month) => month.paid).length} / 6 paid`}
                </span>
              </div>
              {student.accessType === 'school' && (
                <div className="alert-box subtle-alert compact-top">
                  <strong>School code</strong>
                  <p>
                    {student.schoolCode} · Student ID {student.studentId}
                  </p>
                </div>
              )}
              {renderStudentPlan(student, true)}
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderAdminAssignments = () => (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Assignment tracking</p>
          <h2>Student assignment submissions</h2>
        </div>
        <span>{students.length} student record(s)</span>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No assignment submissions yet</h3>
          <p>Student assignment submissions will appear here unit by unit.</p>
        </div>
      ) : (
        <div className="student-records">
          {students.map((student) => (
            <article key={`${student.email}-assignments`} className="student-card panel-subcard">
              <p className="eyebrow">Assignment submission status</p>
              <h3>{student.name}</h3>
              <p>{student.institution}</p>
              <p className="helper-text">{student.email}</p>
              <div className="assignment-admin-grid top-space-small">
                {unitdata.map((unit) => {
                  const submission = getAssignmentStatus(student, unit.id);

                  return (
                    <div key={`${student.email}-${unit.id}`} className="assignment-admin-card">
                      <strong>Unit {unit.id}: {unit.title}</strong>
                      <p className="helper-text">{submission?.submitted ? `Submitted on ${formatDate(submission.submittedAt)}` : 'Pending'}</p>
                      <p className="helper-text">File: {submission?.fileName || 'No file uploaded yet'}</p>
                      <p className="helper-text">Review: {submission?.status?.replace('_', ' ') || 'not submitted'}</p>
                      {submission?.feedback && <p className="helper-text">Feedback: {submission.feedback}</p>}
                      {submission?.submitted && (
                        <>
                          <label className="form-field compact-field top-space-small" htmlFor={`assignment-feedback-${student.email}-${unit.id}`}>
                            Admin feedback
                            <textarea
                              id={`assignment-feedback-${student.email}-${unit.id}`}
                              value={assignmentFeedbackDrafts[`${student.email}-${unit.id}`] ?? submission?.feedback ?? ''}
                              onChange={(event) =>
                                setAssignmentFeedbackDrafts((drafts) => ({
                                  ...drafts,
                                  [`${student.email}-${unit.id}`]: event.target.value
                                }))
                              }
                              placeholder="Write custom feedback for this assignment"
                            />
                          </label>
                          <div className="button-row top-space-small wrap-row">
                            <button
                              className="secondary-button inline-button"
                              onClick={() =>
                                updateAssignmentReviewStatus(
                                  student.email,
                                  unit.id,
                                  'approved',
                                  assignmentFeedbackDrafts[`${student.email}-${unit.id}`] || 'Approved by admin'
                                )
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="secondary-button inline-button"
                              onClick={() =>
                                updateAssignmentReviewStatus(
                                  student.email,
                                  unit.id,
                                  'needs_changes',
                                  assignmentFeedbackDrafts[`${student.email}-${unit.id}`] || 'Please improve and resubmit'
                                )
                              }
                            >
                              Needs Changes
                            </button>
                            <button
                              className="secondary-button inline-button"
                              onClick={() =>
                                updateAssignmentReviewStatus(
                                  student.email,
                                  unit.id,
                                  'pending_review',
                                  assignmentFeedbackDrafts[`${student.email}-${unit.id}`] || 'Waiting for final review'
                                )
                              }
                            >
                              Mark Pending
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderAdminProjects = () => (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Project review center</p>
          <h2>Projects and submissions</h2>
        </div>
        <span>{students.length} student record(s)</span>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No projects yet</h3>
          <p>Student project uploads and statuses will appear here for admin review.</p>
        </div>
      ) : (
        <div className="student-records">
          {students.map((student) => (
            <article key={`${student.email}-project`} className="student-card panel-subcard">
              <p className="eyebrow">Project status</p>
              <h3>{student.name}</h3>
              <p>{student.institution}</p>
              <p className="helper-text">{student.email}</p>
              <p>
                Project file: <strong>{student.projectFileName || 'No file uploaded yet'}</strong>
              </p>
              <p>
                Submission status: <strong>{student.projectSubmitted ? 'Submitted' : 'Pending'}</strong>
              </p>
              <p>
                Review status: <strong>{student.projectStatus?.replace('_', ' ') || 'not submitted'}</strong>
              </p>
              {student.projectFeedback && <p className="helper-text">Feedback: {student.projectFeedback}</p>}
              {student.projectSubmitted && (
                <>
                  <label className="form-field compact-field top-space-small" htmlFor={`project-feedback-${student.email}`}>
                    Admin project feedback
                    <textarea
                      id={`project-feedback-${student.email}`}
                      value={projectFeedbackDrafts[student.email] ?? student.projectFeedback ?? ''}
                      onChange={(event) =>
                        setProjectFeedbackDrafts((drafts) => ({
                          ...drafts,
                          [student.email]: event.target.value
                        }))
                      }
                      placeholder="Write custom project feedback"
                    />
                  </label>
                  <div className="button-row top-space-small wrap-row">
                    <button
                      className="secondary-button inline-button"
                      onClick={() =>
                        updateProjectReviewStatus(
                          student.email,
                          'approved',
                          projectFeedbackDrafts[student.email] || 'Approved by admin'
                        )
                      }
                    >
                      Approve Project
                    </button>
                    <button
                      className="secondary-button inline-button"
                      onClick={() =>
                        updateProjectReviewStatus(
                          student.email,
                          'needs_changes',
                          projectFeedbackDrafts[student.email] || 'Please make corrections and resubmit'
                        )
                      }
                    >
                      Needs Changes
                    </button>
                    <button
                      className="secondary-button inline-button"
                      onClick={() =>
                        updateProjectReviewStatus(
                          student.email,
                          'pending_review',
                          projectFeedbackDrafts[student.email] || 'Waiting for final review'
                        )
                      }
                    >
                      Mark Pending
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderAdminReminders = () => (
    <section className="panel-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Reminder center</p>
          <h2>Draft reminder mails</h2>
        </div>
        <span>Direct students · 3 days before deadline</span>
      </div>

      {studentsWithPendingReminders.length === 0 ? (
        <div className="empty-state">
          <h3>No reminder pending</h3>
          <p>All currently active direct-student months are paid.</p>
        </div>
      ) : (
        <div className="student-records">
          {studentsWithPendingReminders.map((student) => {
            const mailtoLink = `mailto:${student.email}?subject=${encodeURIComponent(
              `COD26 payment reminder for ${student.dueMonth.monthLabel}`
            )}&body=${encodeURIComponent(
              `Hello ${student.name},\n\nThis is a reminder to complete your COD26 monthly payment of ₹299 for ${student.dueMonth.monthLabel} before ${formatDate(
                student.dueMonth.deadlineDate
              )}. Website access remains blocked until payment is completed and the transaction ID is entered.\n\nRegards,\nCOD26 Team`
            )}`;

            return (
              <article key={student.email} className="student-card panel-subcard">
                <p className="eyebrow">Reminder pending</p>
                <h3>{student.name}</h3>
                <p>{student.email}</p>
                <p>
                  Pending month: <strong>{student.dueMonth.monthLabel}</strong>
                </p>
                <p className="helper-text">
                  Reminder mail date: {formatDate(student.dueMonth.reminderDate)} · Deadline:{' '}
                  {formatDate(student.dueMonth.deadlineDate)}
                </p>
                <div className="button-row">
                  <a className="secondary-button link-button" href={mailtoLink}>
                    Draft reminder mail
                  </a>
                  <button
                    className="secondary-button"
                    onClick={() => markReminderSent(student.email, student.dueMonth.id)}
                  >
                    Mark reminder sent
                  </button>
                </div>
                {student.dueMonth.reminderSent && (
                  <p className="helper-text">Reminder already marked as sent.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const renderStudentContent = () => {
    switch (activeView) {
      case 'units':
        return renderUnits();
      case 'chatbot':
        return renderChatbot();
      case 'arena':
        return renderArena();
      case 'assignments':
        return renderAssignments();
      case 'project':
        return renderProject();
      case 'certificate':
        return renderCertificate();
      case 'dashboard':
      default:
        return renderDashboard();
    }
  };

  const renderAdminContent = () => {
    switch (activeView) {
      case 'schoolCodes':
        return renderAdminSchoolCodes();
      case 'units':
        return renderUnits();
      case 'chatbot':
        return renderChatbot();
      case 'arena':
        return renderArena();
      case 'assignments':
        return renderAdminAssignments();
      case 'projects':
        return renderAdminProjects();
      case 'payments':
        return renderAdminPayments();
      case 'reminders':
        return renderAdminReminders();
      case 'certificate':
        return renderCertificate();
      case 'dashboard':
      default:
        return renderAdminOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="App">
        <div className="auth-shell">
          <div className="logo-stage" aria-hidden="true">
            <span className="logo-orbit orbit-one" />
            <span className="logo-orbit orbit-two" />
            <span className="logo-orbit orbit-three" />
            <img src={logo} className="logo-top animated-logo" alt="COD26 logo" />
          </div>
          <p className="helper-text">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {!user ? (
        <div className="auth-shell">
          <div className="logo-stage" aria-hidden="true">
            <span className="logo-orbit orbit-one" />
            <span className="logo-orbit orbit-two" />
            <span className="logo-orbit orbit-three" />
            <img src={logo} className="logo-top animated-logo" alt="COD26 logo" />
          </div>

          <div className="auth-card">
            <div className="login-toggle">
              <button
                className={`tab-button ${loginMode === 'student' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMode('student');
                  setLoginError('');
                }}
              >
                Student Login
              </button>
              <button
                className={`tab-button ${loginMode === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMode('admin');
                  setLoginError('');
                }}
              >
                Admin Login
              </button>
            </div>

            {loginMode === 'student' ? (
              <>
                <div className="login-toggle secondary-toggle">
                  <button
                    className={`tab-button ${studentAccessMode === 'direct' ? 'active' : ''}`}
                    onClick={() => {
                      setStudentAccessMode('direct');
                      setLoginError('');
                    }}
                  >
                    Direct Student
                  </button>
                  <button
                    className={`tab-button ${studentAccessMode === 'school' ? 'active' : ''}`}
                    onClick={() => {
                      setStudentAccessMode('school');
                      setLoginError('');
                    }}
                  >
                    School Code Student
                  </button>
                </div>

                <div className="login-toggle secondary-toggle">
                  <button
                    className={`tab-button ${studentAuthMode === 'signin' ? 'active' : ''}`}
                    onClick={() => {
                      setStudentAuthMode('signin');
                      setLoginError('');
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className={`tab-button ${studentAuthMode === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setStudentAuthMode('signup');
                      setLoginError('');
                    }}
                  >
                    Create Account
                  </button>
                </div>

                <p className="eyebrow">
                  {studentAccessMode === 'school' ? 'School code access' : 'Direct COD26 students'}
                </p>
                <h1>
                  {studentAccessMode === 'school'
                    ? studentAuthMode === 'signin'
                      ? 'School Student Login'
                      : 'Create School Student Account'
                    : studentAuthMode === 'signin'
                      ? 'Student Login'
                      : 'Create Direct Student Account'}
                </h1>
                <p className="helper-text">
                  {studentAccessMode === 'school'
                    ? 'Use the admin-created school code and your student ID to access the program through your school or college account.'
                    : 'Direct access unlocks after monthly payment is made and the transaction ID is entered correctly.'}
                </p>

                {studentAuthMode === 'signup' && (
                  <label className="form-field" htmlFor="student-name">
                    Student name
                    <input
                      id="student-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={studentName}
                      onChange={(event) => setStudentName(event.target.value)}
                    />
                  </label>
                )}

                {studentAuthMode === 'signup' && (
                  <label className="form-field" htmlFor="student-username">
                    Username
                    <input
                      id="student-username"
                      type="text"
                      placeholder="Choose a username"
                      value={studentUsername}
                      onChange={(event) => setStudentUsername(event.target.value)}
                    />
                  </label>
                )}

                <label className="form-field" htmlFor="student-email">
                  Registered email
                  <input
                    id="student-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={studentEmail}
                    onChange={(event) => setStudentEmail(event.target.value)}
                  />
                </label>

                {studentAuthMode === 'signup' && (
                  <label className="form-field" htmlFor="student-institution">
                    School / College
                    <input
                      id="student-institution"
                      type="text"
                      placeholder="Enter your school or college name"
                      value={studentInstitution}
                      onChange={(event) => setStudentInstitution(event.target.value)}
                    />
                  </label>
                )}

                {studentAccessMode === 'school' && (
                  <label className="form-field" htmlFor="student-id">
                    Student ID
                    <input
                      id="student-id"
                      type="text"
                      placeholder="Enter student ID"
                      value={studentId}
                      onChange={(event) => setStudentId(event.target.value.toUpperCase())}
                    />
                  </label>
                )}

                {studentAccessMode === 'school' && studentAuthMode === 'signup' && (
                  <label className="form-field" htmlFor="student-school-code">
                    School code
                    <input
                      id="student-school-code"
                      type="text"
                      placeholder="Enter school code created by admin"
                      value={studentSchoolCode}
                      onChange={(event) => setStudentSchoolCode(event.target.value.toUpperCase())}
                    />
                  </label>
                )}

                <label className="form-field" htmlFor="student-password">
                  Password
                  <input
                    id="student-password"
                    type="password"
                    placeholder="Enter your password"
                    value={studentPassword}
                    onChange={(event) => setStudentPassword(event.target.value)}
                  />
                </label>

                <div className="alert-box subtle-alert">
                  <strong>{studentAccessMode === 'school' ? 'Access rule' : 'Payment rule'}</strong>
                  <p>
                    {studentAccessMode === 'school'
                      ? 'Each learner must enter name, username, email, password, school or college, student ID, and the admin-created school code during account creation.'
                      : 'Each learner must enter name, username, email, password, and school or college. Paid learners must also enter a valid transaction ID before the course unlocks.'}
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={studentAuthMode === 'signin' ? handleStudentSignIn : handleStudentSignUp}
                  disabled={studentAuthMode === 'signin' ? !studentSigninReady : !studentSignupReady}
                >
                  {studentAuthMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </>
            ) : (
              <>
                <p className="eyebrow">Official access only</p>
                <h1>Admin Control Login</h1>
                <p className="helper-text">
                  Admin can create school codes, manage payments, review transaction IDs, and issue
                  certificates.
                </p>
                <label className="form-field" htmlFor="admin-email">
                  Admin email
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="Enter admin email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                  />
                </label>
                <label className="form-field" htmlFor="admin-password">
                  Admin password
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                  />
                </label>
                <button
                  className="primary-button"
                  onClick={handleAdminLogin}
                  disabled={!adminLoginReady}
                >
                  Login as Admin
                </button>
              </>
            )}

            {loginError && <div className="alert-box error-banner">{loginError}</div>}
          </div>
        </div>
      ) : (
        <div className="main-layout">
          <header className="top-bar">
            <div className="brand-row">
              <button
                className="menu-toggle"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label="Toggle navigation"
              >
                ☰
              </button>
              <img src={logo} className="logo-small" alt="COD26 logo" />
              <div>
                <strong>COD26</strong>
                <p className="helper-text">
                  {user.role === 'admin'
                    ? 'Official admin console'
                    : currentStudent?.accessType === 'school'
                      ? 'School-code student dashboard'
                      : 'Direct student dashboard'}
                </p>
              </div>
            </div>

            <div className="top-bar-actions">
              <span className="status-chip status-upcoming">{user.name}</span>
              <button className="secondary-button inline-button" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </header>

          <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            {currentNavigation.map((item) => (
              <button
                key={item.key}
                className={`nav-button ${activeView === item.key ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.key);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <main className="content">
            {user.role === 'student' && !hasActiveAccess
              ? renderPaymentGate()
              : user.role === 'admin'
                ? renderAdminContent()
                : renderStudentContent()}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
