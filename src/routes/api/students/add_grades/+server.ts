// /api/students/add_grades/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { grade } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// POST - Enroll student in a subject (add subjectId to enrolledSubjects string)
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { studNo, subjectId } = body;

  if (!studNo || !subjectId) {
    return json({ error: 'Student number and subject are required.' }, { status: 400 });
  }

  try {
    // Find or create grade record for the student
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
      message: 'Subject enrolled successfully'
    });
  } catch (err) {
    console.error('Error enrolling subject:', err);
    return json({
      error: 'Failed to enroll subject.',
      details: String(err)
    }, { status: 500 });
  }
};

// PUT - Update grades for a subject in enrolledSubjects
export const PUT: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { studNo, subjectId, prelim, midterm, semifinals, finals, combined, remarks } = body;

  if (!studNo || !subjectId) {
    return json({ error: 'Student number and subject are required.' }, { status: 400 });
  }

  try {
    // Find grade record
    let gradeRecord = await db.select().from(grade).where(eq(grade.studNo, studNo)).limit(1);

    if (gradeRecord.length === 0) {
      return json({ error: 'Grade record not found.' }, { status: 404 });
    }

    // Only update if subject is in enrolledSubjects
    let enrolledSubjectsArr = gradeRecord[0].enrolledSubjects
      ? gradeRecord[0].enrolledSubjects.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    if (!enrolledSubjectsArr.includes(subjectId)) {
      return json({ error: 'Student is not enrolled in this subject.' }, { status: 404 });
    }

    // Update grades (store as JSON string/object if you want per-subject grades, or use separate columns if shared)
    // Here, we assume grades are shared for all subjects (not recommended for real multi-subject grading)
    await db
      .update(grade)
      .set({
        prelim: prelim ?? gradeRecord[0].prelim,
        midterm: midterm ?? gradeRecord[0].midterm,
        semifinals: semifinals ?? gradeRecord[0].semifinals,
        finals: finals ?? gradeRecord[0].finals,
        combined: combined ?? gradeRecord[0].combined,
        remarks: remarks ?? gradeRecord[0].remarks,
        updatedAt: new Date().toISOString()
      })
      .where(eq(grade.studNo, studNo));

    return json({
      success: true,
      message: 'Grade updated successfully'
    });
  } catch (err) {
    console.error('Error updating grade:', err);
    return json({
      error: 'Failed to update grade.',
      details: String(err)
    }, { status: 500 });
  }
};

// GET - Retrieve enrolled subjects and grades for a student
export const GET: RequestHandler = async ({ url }) => {
  const studNo = url.searchParams.get('studNo');
  if (!studNo) {
    return json({ error: 'Student number is required.' }, { status: 400 });
  }

  try {
    const gradeRecord = await db.select().from(grade).where(eq(grade.studNo, studNo)).limit(1);

    if (gradeRecord.length === 0) {
      return json({ enrolledSubjects: [], grades: null });
    }

    const enrolledSubjectsArr = gradeRecord[0].enrolledSubjects
      ? gradeRecord[0].enrolledSubjects.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    return json({
      enrolledSubjects: enrolledSubjectsArr,
      grades: {
        prelim: gradeRecord[0].prelim,
        midterm: gradeRecord[0].midterm,
        semifinals: gradeRecord[0].semifinals,
        finals: gradeRecord[0].finals,
        combined: gradeRecord[0].combined,
        remarks: gradeRecord[0].remarks
      }
    });
  } catch (err) {
    console.error('Error fetching grades:', err);
    return json({
      error: 'Failed to fetch grades.',
      details: String(err)
    }, { status: 500 });
  }
};