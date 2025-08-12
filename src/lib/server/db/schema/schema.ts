import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Staff table - Updated with missing fields
export const staff = sqliteTable('staff', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
    firstName: text('first_name'), // Added missing field
    lastName: text('last_name'),   // Added missing field
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    pictureId: text('picture_id'),
    pictureUrl: text('picture_url'),
    createdAt: text('created_at').notNull().default(new Date().toISOString()), // Added missing field
    updatedAt: text('updated_at').notNull().default(new Date().toISOString())  // Added missing field
});

// Academic terms/semesters
export const academicTerm = sqliteTable('academic_term', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false)
});

// Course programs
export const course = sqliteTable('course', {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    totalUnits: integer('total_units').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// Year levels
export const yearLevel = sqliteTable('year_level', {
    id: text('id').primaryKey(),
    level: integer('level').notNull(),
    name: text('name').notNull()
});

// Sections
export const section = sqliteTable('section', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    courseId: text('course_id').notNull().references(() => course.id),
    yearLevelId: text('year_level_id').notNull().references(() => yearLevel.id),
    academicTermId: text('academic_term_id').notNull().references(() => academicTerm.id),
    maxStudents: integer('max_students').notNull().default(40),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// Subjects/Courses catalog
export const subject = sqliteTable('subject', {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    units: integer('units').notNull().default(3),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// Curriculum (which subjects are required for each course and year level)
export const curriculum = sqliteTable('curriculum', {
    courseId: text('course_id').notNull().references(() => course.id),
    yearLevelId: text('year_level_id').notNull().references(() => yearLevel.id),
    subjectId: text('subject_id').notNull().references(() => subject.id),
    semester: integer('semester').notNull()
});

// Student biodata table
export const student = sqliteTable('student', {
    studNo: text('stud_no').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    courseId: text('course_id').notNull().references(() => course.id),
    currentYearLevelId: text('current_year_level_id').references(() => yearLevel.id),
    currentSectionId: text('current_section_id').references(() => section.id),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

// Class schedules
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

// Student enrollment in schedules
export const studentSchedule = sqliteTable('student_schedule', {
    studNo: text('stud_no').notNull().references(() => student.studNo),
    scheduleId: text('schedule_id').notNull().references(() => schedule.id),
    status: text('status').notNull().default('Enrolled')
});

// Individual grade records
export const grade = sqliteTable('grade', {
    id: text('id').primaryKey(),
    studNo: text('stud_no').notNull().references(() => student.studNo),
    scheduleId: text('schedule_id').notNull().references(() => schedule.id),
    score: real('score'),
    maxScore: real('max_score').notNull()
});

// Type exports (keep as is)
export type Session = typeof staff.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Student = typeof student.$inferSelect;
export type Course = typeof course.$inferSelect;
export type YearLevel = typeof yearLevel.$inferSelect;
export type Section = typeof section.$inferSelect;
export type Subject = typeof subject.$inferSelect;
export type Curriculum = typeof curriculum.$inferSelect;
export type AcademicTerm = typeof academicTerm.$inferSelect;
export type Schedule = typeof schedule.$inferSelect;
export type StudentSchedule = typeof studentSchedule.$inferSelect;
export type Grade = typeof grade.$inferSelect;

// Insert types
export type InsertStaff = typeof staff.$inferInsert;
export type InsertStudent = typeof student.$inferInsert;
export type InsertCourse = typeof course.$inferInsert;
export type InsertYearLevel = typeof yearLevel.$inferInsert;
export type InsertSection = typeof section.$inferInsert;
export type InsertSubject = typeof subject.$inferInsert;
export type InsertCurriculum = typeof curriculum.$inferInsert;
export type InsertAcademicTerm = typeof academicTerm.$inferInsert;
export type InsertSchedule = typeof schedule.$inferInsert;
export type InsertStudentSchedule = typeof studentSchedule.$inferInsert;
export type InsertGrade = typeof grade.$inferInsert;