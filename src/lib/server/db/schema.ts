import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Staff table (was user)
export const staff = sqliteTable('staff', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').notNull(),
    pictureId: text('picture_id'),      // <-- nullable, not unique
    pictureUrl: text('picture_url')     // <-- nullable, not unique
});

// Student biodata table
export const student = sqliteTable('student', {
    studNo: text('stud_no').primaryKey(),
    firstName: text('first_name').notNull(),
    middleName: text('middle_name'), // NEW: Middle name
    lastName: text('last_name').notNull(),
    gender: text('gender'),
    age: integer('age'),
    birthDate: text('birth_date'),
    birthPlace: text('birth_place'), // NEW: Place of birth
    address: text('address'), // General address (optional)
    houseNo: text('house_no'), // NEW: House/Block/Lot No.
    street: text('street'), // NEW: Street
    barangay: text('barangay'), // NEW: Barangay
    city: text('city'), // NEW: City/Municipality
    province: text('province'), // NEW: Province
    zipCode: text('zip_code'), // NEW: Zip code
    contactNumber: text('contact_number'),
    email: text('email'), // NEW: Student email
    pictureId: text('picture_id'),
    pictureUrl: text('picture_url'),
    course: text('course').notNull(),
    yearLevel: text('year_level'),
    section: text('section'),
    guardian: text('guardian'),
    guardianPhone: text('guardian_phone'),
    mother: text('mother'),
    father: text('father'),
    nationality: text('nationality'), // NEW: Nationality
    religion: text('religion'), // NEW: Religion
    civilStatus: text('civil_status'), // NEW: Civil status
    // Add more fields as needed
});

// Schedules table
export const schedule = sqliteTable('schedule', {
    id: text('id').primaryKey(),  // Add primary key
    course: text('course').notNull(),
    yearLevel: text('year_level'),
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
    id: text('id').primaryKey(),  // Add primary key
    userId: text('user_id').notNull().references(() => staff.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Student = typeof student.$inferSelect;
export type Schedule = typeof schedule.$inferSelect;
export type StudentSchedule = typeof studentSchedule.$inferSelect;