import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Staff table (was user)
export const staff = sqliteTable('staff', {
    id: text('id'),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
    pictureId: text('picture_id'),
    pictureUrl: text('picture_url') // <-- Add this line
});

// Student biodata table
export const student = sqliteTable('student', {
    studNo: text('stud_no'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    gender: text('gender'),
    age: integer('age'),
    birthDate: text('birth_date'),
    address: text('address'),
    contactNumber: text('contact_number'),
    pictureId: text('picture_id'),
    course: text('course').notNull(),
    section: text('section'), // <-- Add this line
    guardian: text('guardian'),
    guardianPhone: text('guardian_phone'),
    mother: text('mother'),
    father: text('father'),
    yearLevel: text('year_level')
});

// Schedules table
export const schedule = sqliteTable('schedule', {
    id: text('id'),
    course: text('course').notNull(), // e.g., 'BSCS', 'CRIM'
    yearLevel: text('year_level'),    // e.g., '1st Year', '2nd Year', or null for all
    subject: text('subject').notNull(),
    day: text('day').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    room: text('room')
});

// Junction table: which student is enrolled in which schedule
export const studentSchedule = sqliteTable('student_schedule', {
    studNo: text('stud_no').notNull().references(() => student.studNo),
    scheduleId: text('schedule_id').notNull().references(() => schedule.id)
});

export const session = sqliteTable('session', {
    id: text('id'),
    userId: text('user_id').notNull().references(() => staff.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Student = typeof student.$inferSelect;
export type Schedule = typeof schedule.$inferSelect;
export type StudentSchedule = typeof studentSchedule.$inferSelect;
