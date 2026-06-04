import { db, hasFirebaseConfig } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';

const STORAGE_KEY = 'cod26-platform-data';

// ── Date helpers ─────────────────────────────────────────────────────────────

const addDays = (baseDate, days) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const createInstallment = (index, baseDate, immediate = false) => {
  const cycleStart = new Date(baseDate);
  const deadlineDate = immediate ? cycleStart : addDays(cycleStart, 30);
  const reminderDate = immediate ? cycleStart : addDays(cycleStart, 27);

  return {
    id: index + 1,
    title: `Month ${index + 1}`,
    monthLabel: `Installment ${index + 1}`,
    cycleStart: cycleStart.toISOString(),
    reminderDate: reminderDate.toISOString(),
    deadlineDate: deadlineDate.toISOString(),
    paid: false,
    paidOn: '',
    reminderSent: false,
    transactionId: ''
  };
};

export const createBillingPlan = () => {
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) =>
    index === 0
      ? createInstallment(index, now, true)
      : {
          id: index + 1,
          title: `Month ${index + 1}`,
          monthLabel: `Installment ${index + 1}`,
          cycleStart: '',
          reminderDate: '',
          deadlineDate: '',
          paid: false,
          paidOn: '',
          reminderSent: false,
          transactionId: ''
        }
  );
};

export const scheduleNextInstallment = (billingPlan, currentMonthId, paymentDate = new Date()) => {
  return billingPlan.map((month) => {
    if (month.id !== currentMonthId + 1 || month.paid) {
      return month;
    }

    const next = createInstallment(currentMonthId, paymentDate, false);

    return {
      ...month,
      cycleStart: next.cycleStart,
      reminderDate: next.reminderDate,
      deadlineDate: next.deadlineDate,
      monthLabel: next.monthLabel
    };
  });
};

// ── Normalizers ───────────────────────────────────────────────────────────────

const normalizeSchoolCode = (entry, index) => ({
  id: entry.id ?? `${Date.now()}-${index}`,
  schoolName: (entry.schoolName || entry.name || 'School Partner').trim(),
  code: (entry.code || '').trim().toUpperCase(),
  createdAt: entry.createdAt || new Date().toISOString()
});

const normalizeStudent = (student) => {
  const accessType = student.accessType === 'school' ? 'school' : 'direct';

  return {
    name: (student.name || '').trim(),
    username: (student.username || '').trim(),
    email: (student.email || '').trim().toLowerCase(),
    institution: (student.institution || '').trim(),
    password: student.password || '',
    accessType,
    studentId: (student.studentId || '').trim().toUpperCase(),
    schoolCode: (student.schoolCode || '').trim().toUpperCase(),
    billingPlan:
      accessType === 'direct'
        ? Array.isArray(student.billingPlan) && student.billingPlan.length === 6
          ? student.billingPlan.map((month, index) => ({
              id: month.id ?? index + 1,
              title: month.title ?? `Month ${index + 1}`,
              monthLabel: month.monthLabel || `Installment ${index + 1}`,
              cycleStart: month.cycleStart || '',
              reminderDate: month.reminderDate || '',
              deadlineDate: month.deadlineDate || '',
              paid: Boolean(month.paid),
              paidOn: month.paidOn || '',
              reminderSent: Boolean(month.reminderSent),
              transactionId: month.transactionId || ''
            }))
          : createBillingPlan()
        : [],
    assignmentSubmissions: Array.isArray(student.assignmentSubmissions)
      ? student.assignmentSubmissions.map((s) => ({
          unitId: Number(s.unitId),
          fileName: s.fileName || '',
          fileURL: s.fileURL || '',
          submitted: Boolean(s.submitted),
          submittedAt: s.submittedAt || '',
          status: s.status || 'pending',
          feedback: s.feedback || '',
          notes: s.notes || ''
        }))
      : [],
    projectSubmitted: Boolean(student.projectSubmitted),
    projectSubmittedAt: student.projectSubmittedAt || '',
    projectStatus: student.projectStatus || 'not_submitted',
    projectFeedback: student.projectFeedback || '',
    projectFileName: student.projectFileName || '',
    projectFileURL: student.projectFileURL || '',
    arenaBestScore: Number(student.arenaBestScore || 0),
    createdAt: student.createdAt || new Date().toISOString()
  };
};

// ── localStorage fallback ─────────────────────────────────────────────────────

const defaultStore = { students: [], schoolCodes: [] };

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readStore = () => {
  if (!canUseStorage()) return defaultStore;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore;
    const parsed = JSON.parse(raw);
    return {
      students: Array.isArray(parsed.students)
        ? parsed.students.map(normalizeStudent)
        : [],
      schoolCodes: Array.isArray(parsed.schoolCodes)
        ? parsed.schoolCodes.map(normalizeSchoolCode).filter((e) => e.code)
        : []
    };
  } catch {
    return defaultStore;
  }
};

const writeStore = (store) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

// ── Public API (all async; localStorage used when Firebase not configured) ────

export const getPlatformMode = () =>
  hasFirebaseConfig
    ? 'Firestore mode (live backend)'
    : 'Local demo mode (add Firebase credentials to .env to enable backend)';

export const getAllStudents = async () => {
  if (!hasFirebaseConfig) return readStore().students;
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs.map((d) => normalizeStudent(d.data()));
};

export const getAllSchoolCodes = async () => {
  if (!hasFirebaseConfig) return readStore().schoolCodes;
  const snapshot = await getDocs(collection(db, 'schoolCodes'));
  return snapshot.docs.map((d, i) => normalizeSchoolCode(d.data(), i));
};

export const createSchoolCode = async ({ schoolName, code }) => {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedSchoolName = schoolName.trim();

  if (!normalizedSchoolName || !normalizedCode) {
    throw new Error('School name and school code are required.');
  }

  if (!hasFirebaseConfig) {
    const store = readStore();
    if (store.schoolCodes.some((e) => e.code === normalizedCode)) {
      throw new Error('This school code already exists.');
    }
    const schoolCode = normalizeSchoolCode(
      {
        id: `${Date.now()}-${normalizedCode}`,
        schoolName: normalizedSchoolName,
        code: normalizedCode,
        createdAt: new Date().toISOString()
      },
      0
    );
    writeStore({ ...store, schoolCodes: [...store.schoolCodes, schoolCode] });
    return schoolCode;
  }

  const docRef = doc(db, 'schoolCodes', normalizedCode);
  const existing = await getDoc(docRef);
  if (existing.exists()) throw new Error('This school code already exists.');

  const schoolCode = normalizeSchoolCode(
    {
      id: normalizedCode,
      schoolName: normalizedSchoolName,
      code: normalizedCode,
      createdAt: new Date().toISOString()
    },
    0
  );
  await setDoc(docRef, schoolCode);
  return schoolCode;
};

export const registerStudent = async ({
  name,
  username,
  email,
  institution,
  password,
  accessType = 'direct',
  studentId = '',
  schoolCode = ''
}) => {
  const normalizedName = name.trim();
  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedInstitution = institution.trim();
  const normalizedAccessType = accessType === 'school' ? 'school' : 'direct';
  const normalizedStudentId = studentId.trim().toUpperCase();
  const normalizedSchoolCode = schoolCode.trim().toUpperCase();

  if (!normalizedName || !normalizedUsername || !normalizedEmail || !normalizedInstitution || !password) {
    throw new Error('Name, username, email, password, and school or college are required.');
  }

  if (!hasFirebaseConfig) {
    const store = readStore();
    if (store.students.some((s) => s.email === normalizedEmail)) {
      throw new Error('A student account with this email already exists.');
    }
    if (store.students.some((s) => s.username.trim().toLowerCase() === normalizedUsername.toLowerCase())) {
      throw new Error('This username already exists.');
    }
    if (normalizedAccessType === 'school') {
      if (!normalizedStudentId) throw new Error('Student ID is required for school login.');
      if (!store.schoolCodes.some((e) => e.code === normalizedSchoolCode)) {
        throw new Error('Invalid school code. Please enter a code created by admin.');
      }
      if (store.students.some((s) => s.studentId === normalizedStudentId)) {
        throw new Error('This student ID already exists.');
      }
    }
    const student = normalizeStudent({
      name: normalizedName,
      username: normalizedUsername,
      email: normalizedEmail,
      institution: normalizedInstitution,
      password,
      accessType: normalizedAccessType,
      studentId: normalizedStudentId,
      schoolCode: normalizedSchoolCode,
      billingPlan: normalizedAccessType === 'direct' ? createBillingPlan() : [],
      assignmentSubmissions: [],
      projectSubmitted: false,
      projectSubmittedAt: '',
      projectStatus: 'not_submitted',
      projectFeedback: '',
      projectFileName: '',
      arenaBestScore: 0,
      createdAt: new Date().toISOString()
    });
    writeStore({ ...store, students: [...store.students, student] });
    return student;
  }

  // Firestore path
  const studentDocRef = doc(db, 'students', normalizedEmail);
  const existingStudent = await getDoc(studentDocRef);
  if (existingStudent.exists()) throw new Error('A student account with this email already exists.');

  const usernameSnap = await getDocs(
    query(collection(db, 'students'), where('username', '==', normalizedUsername))
  );
  if (!usernameSnap.empty) throw new Error('This username already exists.');

  if (normalizedAccessType === 'school') {
    if (!normalizedStudentId) throw new Error('Student ID is required for school login.');
    const schoolCodeDoc = await getDoc(doc(db, 'schoolCodes', normalizedSchoolCode));
    if (!schoolCodeDoc.exists()) throw new Error('Invalid school code. Please enter a code created by admin.');
    const studentIdSnap = await getDocs(
      query(collection(db, 'students'), where('studentId', '==', normalizedStudentId))
    );
    if (!studentIdSnap.empty) throw new Error('This student ID already exists.');
  }

  const student = normalizeStudent({
    name: normalizedName,
    username: normalizedUsername,
    email: normalizedEmail,
    institution: normalizedInstitution,
    password,
    accessType: normalizedAccessType,
    studentId: normalizedStudentId,
    schoolCode: normalizedSchoolCode,
    billingPlan: normalizedAccessType === 'direct' ? createBillingPlan() : [],
    assignmentSubmissions: [],
    projectSubmitted: false,
    projectSubmittedAt: '',
    projectStatus: 'not_submitted',
    projectFeedback: '',
    projectFileName: '',
    arenaBestScore: 0,
    createdAt: new Date().toISOString()
  });

  await setDoc(studentDocRef, student);
  return student;
};

export const loginStudent = async ({
  email = '',
  password,
  accessType = 'direct',
  studentId = ''
}) => {
  const normalizedAccessType = accessType === 'school' ? 'school' : 'direct';
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedStudentId = studentId.trim().toUpperCase();

  if (!hasFirebaseConfig) {
    const store = readStore();
    const student = store.students.find((entry) => {
      if (entry.accessType !== normalizedAccessType || entry.email !== normalizedEmail) return false;
      return normalizedAccessType === 'school' ? entry.studentId === normalizedStudentId : true;
    });
    if (!student || student.password !== password) {
      throw new Error(
        normalizedAccessType === 'school'
          ? 'Invalid school student credentials or password.'
          : 'Invalid email or password.'
      );
    }
    return student;
  }

  const docRef = doc(db, 'students', normalizedEmail);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error(
      normalizedAccessType === 'school'
        ? 'Invalid school student credentials or password.'
        : 'Invalid email or password.'
    );
  }

  const student = normalizeStudent(snapshot.data());

  if (student.accessType !== normalizedAccessType || student.password !== password) {
    throw new Error(
      normalizedAccessType === 'school'
        ? 'Invalid school student credentials or password.'
        : 'Invalid email or password.'
    );
  }

  if (normalizedAccessType === 'school' && student.studentId !== normalizedStudentId) {
    throw new Error('Invalid school student credentials or password.');
  }

  return student;
};

export const updateStudent = async (email, updater) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!hasFirebaseConfig) {
    const store = readStore();
    const index = store.students.findIndex((s) => s.email === normalizedEmail);
    if (index === -1) throw new Error('Student not found.');
    const current = normalizeStudent(store.students[index]);
    const next = normalizeStudent(
      typeof updater === 'function' ? updater(current) : { ...current, ...updater }
    );
    const nextStudents = [...store.students];
    nextStudents[index] = next;
    writeStore({ ...store, students: nextStudents });
    return next;
  }

  const docRef = doc(db, 'students', normalizedEmail);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) throw new Error('Student not found.');

  const current = normalizeStudent(snapshot.data());
  const next = normalizeStudent(
    typeof updater === 'function' ? updater(current) : { ...current, ...updater }
  );
  await setDoc(docRef, next);
  return next;
};
