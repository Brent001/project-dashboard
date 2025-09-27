// /api/enrollments/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { grade, subject } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// "Enroll" a student in a subject by updating the enrolledSubjects string in the grade record
export const POST = async ({ request }) => {
  const { studNo, subjectId } = await request.json();

  if (!studNo || !subjectId) {
    return json({ error: 'Student number and subject are required.' }, { status: 400 });
  }

  // Check if subject exists
  const subj = await db.select().from(subject).where(eq(subject.id, subjectId)).get();
  if (!subj) {
    return json({ error: 'Subject not found.' }, { status: 404 });
  }

  try {
    // Try to find an existing grade record for the student
    let gradeRecord = await db.select().from(grade).where(eq(grade.studNo, studNo)).limit(1);

    if (gradeRecord.length > 0) {
      // Already has a grade record, update enrolledSubjects
      let enrolledSubjectsArr = gradeRecord[0].enrolledSubjects
        ? gradeRecord[0].enrolledSubjects.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];
      if (enrolledSubjectsArr.includes(subjectId)) {
        return json({ error: 'Student already enrolled in this subject.' }, { status: 409 });
      }
      enrolledSubjectsArr.push(subjectId);
      await db
        .update(grade)
        .set({
          enrolledSubjects: enrolledSubjectsArr.join(','),
          updatedAt: new Date().toISOString()
        })
        .where(eq(grade.studNo, studNo));
    } else {
      // No grade record yet, create one
      await db.insert(grade).values({
        id: nanoid(),
        studNo,
        enrolledSubjects: subjectId,
        prelim: 0,
        midterm: 0,
        semifinals: 0,
        finals: 0,
        combined: 0,
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return json({
      success: true,
      enrolledSubject: {
        id: subjectId,
        subjectId: subjectId,
        code: subj.code,
        name: subj.name,
        units: subj.units
      }
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return json({ error: 'Failed to enroll student.' }, { status: 500 });
  }
};

// Get all enrolled subjects for a student (from the enrolledSubjects string)
export const GET = async ({ url }) => {
  const studNo = url.searchParams.get('studNo');
  if (!studNo) {
    return json({ error: 'Student number is required.' }, { status: 400 });
  }

  try {
    // Get the grade record for the student
    const gradeRecord = await db.select().from(grade).where(eq(grade.studNo, studNo)).limit(1);

    if (gradeRecord.length === 0) {
      return json([]);
    }

    const enrolledSubjectsArr = gradeRecord[0].enrolledSubjects
      ? gradeRecord[0].enrolledSubjects.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    if (enrolledSubjectsArr.length === 0) {
      return json([]);
    }

    // Fetch subject details for all enrolled subjects
    const subjects = await db
      .select()
      .from(subject)
      .where(subject.id.in ? subject.id.in(enrolledSubjectsArr) : subject.id.equals(enrolledSubjectsArr[0]));

    // Return in the same format as before
    const result = subjects.map((subj: any) => ({
      id: subj.id,
      subjectId: subj.id,
      code: subj.code,
      name: subj.name,
      units: subj.units
    }));

    return json(result);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return json({ error: 'Failed to fetch enrollments.' }, { status: 500 });
  }
};

// Unenroll by removing the subjectId from the enrolledSubjects string
export const DELETE = async ({ request }) => {
  const { studNo, subjectId } = await request.json();

  if (!studNo || !subjectId) {
    return json({ error: 'Student number and subject are required.' }, { status: 400 });
  }

  try {
    // Get the grade record
    const gradeRecord = await db.select().from(grade).where(eq(grade.studNo, studNo)).limit(1);

    if (gradeRecord.length === 0) {
      return json({ error: 'No enrollment found for this student.' }, { status: 404 });
    }

    let enrolledSubjectsArr = gradeRecord[0].enrolledSubjects
      ? gradeRecord[0].enrolledSubjects.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    if (!enrolledSubjectsArr.includes(subjectId)) {
      return json({ error: 'Student is not enrolled in this subject.' }, { status: 404 });
    }

    enrolledSubjectsArr = enrolledSubjectsArr.filter((id: string) => id !== subjectId);

    await db
      .update(grade)
      .set({
        enrolledSubjects: enrolledSubjectsArr.join(','),
        updatedAt: new Date().toISOString()
      })
      .where(eq(grade.studNo, studNo));

    return json({ success: true, message: 'Student unenrolled successfully.' });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    return json({ error: 'Failed to unenroll student.' }, { status: 500 });
  }
};