import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// ---------------- STAFF ----------------
export const staff = sqliteTable('staff', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    pictureId: text('picture_id'),
    pictureUrl: text('picture_url'),
    createdAt: text('created_at').notNull().default(new Date().toISOString()),
    updatedAt: text('updated_at').notNull().default(new Date().toISOString())
});

// ---------------- ACADEMIC TERM ----------------
export const academicTerm = sqliteTable('academic_term', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false)
});

// ---------------- COURSE ----------------
export const course = sqliteTable('course', {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    totalUnits: integer('total_units').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// ---------------- YEAR LEVEL ----------------
export const yearLevel = sqliteTable('year_level', {
    id: text('id').primaryKey(),
    level: integer('level').notNull(),
    name: text('name').notNull()
});

// ---------------- SECTION ----------------
export const section = sqliteTable('section', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    courseId: text('course_id').notNull().references(() => course.id),
    yearLevelId: text('year_level_id').notNull().references(() => yearLevel.id),
    academicTermId: text('academic_term_id').notNull().references(() => academicTerm.id),
    maxStudents: integer('max_students').notNull().default(40),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// ---------------- SUBJECT ----------------
export const subject = sqliteTable('subject', {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    units: integer('units').notNull(),
    yearLevelId: text('year_level_id').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// ---------------- CURRICULUM ----------------
export const curriculum = sqliteTable('curriculum', {
    courseId: text('course_id').notNull().references(() => course.id),
    yearLevelId: text('year_level_id').notNull().references(() => yearLevel.id),
    subjectId: text('subject_id').notNull().references(() => subject.id),
    semester: integer('semester').notNull()
});

// ---------------- STUDENT ----------------
export const student = sqliteTable('student', {
    studNo: text('stud_no').primaryKey(),
    firstName: text('first_name').notNull(),
    middleName: text('middle_name'),
    lastName: text('last_name').notNull(),
    gender: text('gender'),
    age: integer('age'),
    birthDate: text('birth_date'),
    birthPlace: text('birth_place'),
    address: text('address'),
    houseNo: text('house_no'),
    street: text('street'),
    barangay: text('barangay'),
    city: text('city'),
    province: text('province'),
    zipCode: text('zip_code'),
    contactNumber: text('contact_number'),
    email: text('email'),
    pictureId: text('picture_id'),
    pictureUrl: text('picture_url'),
    course: text('course').notNull(),
    yearLevel: text('year_level'),
    section: text('section'),
    guardian: text('guardian'),
    guardianPhone: text('guardian_phone'),
    mother: text('mother'),
    father: text('father'),
    nationality: text('nationality'),
    religion: text('religion'),
    civilStatus: text('civil_status')
});

// ---------------- SCHEDULE ----------------
export const schedule = sqliteTable('schedule', {
    id: text('id').primaryKey(),
    subjectId: text('subject_id').notNull().references(() => subject.id),
    teacherId: text('teacher_id').references(() => staff.id),
    academicTermId: text('academic_term_id').notNull().references(() => academicTerm.id),
    sectionId: text('section_id').references(() => section.id),
    day: text('day').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// ---------------- GRADES ----------------
export const grade = sqliteTable('grade', {
    id: text('id').primaryKey(),
    studNo: text('stud_no').notNull().references(() => student.studNo),
    academicTermId: text('academic_term_id').notNull().references(() => academicTerm.id),
    createdAt: text('created_at').notNull().default(new Date().toISOString()),
    updatedAt: text('updated_at').notNull().default(new Date().toISOString())
});

// ---------------- GRADE SUBJECT ----------------
export const gradeSubject = sqliteTable('grade_subject', {
    id: text('id').primaryKey(),
    gradeId: text('grade_id').notNull().references(() => grade.id, { onDelete: 'cascade' }),
    subjectId: text('subject_id').notNull().references(() => subject.id),
    prelim: real('prelim').default(0),
    midterm: real('midterm').default(0),
    semifinals: real('semifinals').default(0),
    finals: real('finals').default(0),
    combined: real('combined').default(0),
    remarks: text('remarks').default('')
});

// ---------------- SESSION ----------------
export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull()
});

// ---------------- STAFF LOG ----------------
export const staffLog = sqliteTable('staff_log', {
    id: text('id').primaryKey(),
    staffId: text('staff_id').notNull().references(() => staff.id),
    action: text('action').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    timestamp: text('timestamp').notNull().default(new Date().toISOString()),
    status: text('status').notNull().default('success')
});

// ---------------- SETTINGS ----------------
export const settings = sqliteTable('settings', {
    id: text('id').primaryKey(),
    staffId: text('staff_id').notNull().references(() => staff.id),
    theme: text('theme').notNull().default('system'),
    language: text('language').notNull().default('en'),
    notifications: integer('notifications', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull().default(new Date().toISOString()),
    updatedAt: text('updated_at').notNull().default(new Date().toISOString())
});

// ---------------- TYPES ----------------
export type Staff = typeof staff.$inferSelect;
export type AcademicTerm = typeof academicTerm.$inferSelect;
export type Course = typeof course.$inferSelect;
export type YearLevel = typeof yearLevel.$inferSelect;
export type Section = typeof section.$inferSelect;
export type Subject = typeof subject.$inferSelect;
export type Curriculum = typeof curriculum.$inferSelect;
export type Student = typeof student.$inferSelect;
export type Schedule = typeof schedule.$inferSelect;
export type Grade = typeof grade.$inferSelect;
export type Session = typeof session.$inferSelect;
export type StaffLog = typeof staffLog.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type GradeSubject = typeof gradeSubject.$inferSelect;

// Insert types
export type InsertStaff = typeof staff.$inferInsert;
export type InsertAcademicTerm = typeof academicTerm.$inferInsert;
export type InsertCourse = typeof course.$inferInsert;
export type InsertYearLevel = typeof yearLevel.$inferInsert;
export type InsertSection = typeof section.$inferInsert;
export type InsertSubject = typeof subject.$inferInsert;
export type InsertCurriculum = typeof curriculum.$inferInsert;
export type InsertStudent = typeof student.$inferInsert;
export type InsertSchedule = typeof schedule.$inferInsert;
export type InsertGrade = typeof grade.$inferInsert;
export type InsertSession = typeof session.$inferInsert;
export type InsertStaffLog = typeof staffLog.$inferInsert;
export type InsertSettings = typeof settings.$inferInsert;
export type InsertGradeSubject = typeof gradeSubject.$inferInsert;
