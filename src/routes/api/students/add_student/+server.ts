import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { grade, gradeSubject, student, subject } from '$lib/server/db/schema/schema.js';
import { eq, and } from 'drizzle-orm';

// GET: Fetch all grade subjects for a student in an academic term
export const GET: RequestHandler = async ({ url }) => {
  const studNo = url.searchParams.get('studNo');
  const academicTermId = url.searchParams.get('academicTermId');

  if (!studNo || !academicTermId) {
    return json({ error: 'Missing studNo or academicTermId' }, { status: 400 });
  }

  try {
    // First, find or create the grade record for this student and term
    let gradeRecord = await db
      .select()
      .from(grade)
      .where(and(eq(grade.studNo, studNo), eq(grade.academicTermId, academicTermId)))
      .get();

    if (!gradeRecord) {
      // Create a new grade record if it doesn't exist
      const gradeId = `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(grade).values({
        id: gradeId,
        studNo,
        academicTermId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      gradeRecord = await db
        .select()
        .from(grade)
        .where(eq(grade.id, gradeId))
        .get();
    }

    // Fetch all grade subjects for this grade record
    const gradeSubjects = await db
      .select({
        gradeSubjectId: gradeSubject.id,
        gradeId: gradeSubject.gradeId,
        subjectId: gradeSubject.subjectId,
        prelim: gradeSubject.prelim,
        midterm: gradeSubject.midterm,
        semifinals: gradeSubject.semifinals,
        finals: gradeSubject.finals,
        combined: gradeSubject.combined,
        remarks: gradeSubject.remarks,
        subjectCode: subject.code,
        subjectName: subject.name,
        units: subject.units
      })
      .from(gradeSubject)
      .leftJoin(subject, eq(gradeSubject.subjectId, subject.id))
      .where(eq(gradeSubject.gradeId, gradeRecord!.id))
      .all();

    // Transform to match the expected format
    const enrollments = gradeSubjects.map((gs) => ({
      enrollmentId: gs.gradeSubjectId,
      subjectId: gs.subjectId,
      subjectCode: gs.subjectCode,
      subjectName: gs.subjectName,
      units: gs.units,
      prelim: gs.prelim,
      midterm: gs.midterm,
      semifinals: gs.semifinals,
      finals: gs.finals,
      combined: gs.combined,
      remarks: gs.remarks
    }));

    return json(enrollments);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
};

// POST: Enroll student in a subject (create a new gradeSubject entry)
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { studNo, subjectId, academicTermId } = await request.json();

    if (!studNo || !subjectId || !academicTermId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create the grade record
    let gradeRecord = await db
      .select()
      .from(grade)
      .where(and(eq(grade.studNo, studNo), eq(grade.academicTermId, academicTermId)))
      .get();

    if (!gradeRecord) {
      const gradeId = `grade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(grade).values({
        id: gradeId,
        studNo,
        academicTermId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      gradeRecord = await db
        .select()
        .from(grade)
        .where(eq(grade.id, gradeId))
        .get();
    }

    // Check if subject is already enrolled
    const existingEnrollment = await db
      .select()
      .from(gradeSubject)
      .where(
        and(
          eq(gradeSubject.gradeId, gradeRecord!.id),
          eq(gradeSubject.subjectId, subjectId)
        )
      )
      .get();

    if (existingEnrollment) {
      return json({ error: 'Student is already enrolled in this subject' }, { status: 400 });
    }

    // Create new gradeSubject entry
    const gradeSubjectId = `gs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(gradeSubject).values({
      id: gradeSubjectId,
      gradeId: gradeRecord!.id,
      subjectId,
      prelim: 0,
      midterm: 0,
      semifinals: 0,
      finals: 0,
      combined: 0,
      remarks: ''
    });

    return json({ 
      success: true, 
      message: 'Student enrolled successfully',
      gradeSubjectId 
    });
  } catch (error) {
    console.error('Error enrolling student:', error);
    return json({ error: 'Failed to enroll student' }, { status: 500 });
  }
};

// PUT: Update grades for a subject
export const PUT: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    const { studNo, academicTermId, subjectId, prelim, midterm, semifinals, finals } = data;

    if (!studNo || !academicTermId || !subjectId) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find the grade record
    const gradeRecord = await db
      .select()
      .from(grade)
      .where(and(eq(grade.studNo, studNo), eq(grade.academicTermId, academicTermId)))
      .get();

    if (!gradeRecord) {
      return json({ error: 'Grade record not found' }, { status: 404 });
    }

    // Find the gradeSubject entry
    const existingGradeSubject = await db
      .select()
      .from(gradeSubject)
      .where(
        and(
          eq(gradeSubject.gradeId, gradeRecord.id),
          eq(gradeSubject.subjectId, subjectId)
        )
      )
      .get();

    if (!existingGradeSubject) {
      return json({ error: 'Subject enrollment not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (prelim !== undefined && prelim !== null) updateData.prelim = prelim;
    if (midterm !== undefined && midterm !== null) updateData.midterm = midterm;
    if (semifinals !== undefined && semifinals !== null) updateData.semifinals = semifinals;
    if (finals !== undefined && finals !== null) updateData.finals = finals;

    // Calculate combined grade and remarks
    const periods = [
      { value: prelim ?? existingGradeSubject.prelim ?? 0, weight: 0.2 },
      { value: midterm ?? existingGradeSubject.midterm ?? 0, weight: 0.2 },
      { value: semifinals ?? existingGradeSubject.semifinals ?? 0, weight: 0.3 },
      { value: finals ?? existingGradeSubject.finals ?? 0, weight: 0.3 }
    ];

    let totalWeightedGrade = 0;
    let totalWeight = 0;

    periods.forEach(period => {
      if (period.value > 0) {
        totalWeightedGrade += period.value * period.weight;
        totalWeight += period.weight;
      }
    });

    if (totalWeight > 0) {
      const combined = Math.round((totalWeightedGrade / totalWeight) * 100) / 100;
      updateData.combined = combined;
      updateData.remarks = combined >= 75 ? 'PASSED' : 'FAILED';
    }

    // Update the gradeSubject record
    await db
      .update(gradeSubject)
      .set(updateData)
      .where(eq(gradeSubject.id, existingGradeSubject.id));

    // Update the grade record's updatedAt timestamp
    await db
      .update(grade)
      .set({ updatedAt: new Date().toISOString() })
      .where(eq(grade.id, gradeRecord.id));

    // Fetch the updated record
    const updatedGradeSubject = await db
      .select()
      .from(gradeSubject)
      .where(eq(gradeSubject.id, existingGradeSubject.id))
      .get();

    return json({ 
      success: true, 
      message: 'Grade updated successfully',
      updatedGrade: updatedGradeSubject
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    return json({ error: 'Failed to update grade' }, { status: 500 });
  }
};

// DELETE: Remove a subject enrollment (delete gradeSubject entry)
export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return json({ error: 'Missing enrollmentId' }, { status: 400 });
    }

    // Delete the gradeSubject entry
    await db
      .delete(gradeSubject)
      .where(eq(gradeSubject.id, enrollmentId));

    return json({ 
      success: true, 
      message: 'Subject enrollment removed successfully' 
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return json({ error: 'Failed to delete enrollment' }, { status: 500 });
  }
};