import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { student } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.studNo || !data.firstName || !data.lastName || !data.courseId) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check for duplicate student number
    const existing = await db.select().from(student).where(eq(student.studNo, data.studNo)).get();
    if (existing) {
      return new Response(JSON.stringify({ error: 'Student number already exists.' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare data for insertion (map fields to schema)
    const studentData = {
      studNo: data.studNo,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      gender: data.gender || null,
      age: data.age ? Number(data.age) : null,
      birthDate: data.birthDate || null,
      birthPlace: data.birthPlace || null,
      address: data.address || null,
      houseNo: data.houseNo || null,
      street: data.street || null,
      barangay: data.barangay || null,
      city: data.city || null,
      province: data.province || null,
      zipCode: data.zipCode || null,
      contactNumber: data.contactNumber || null,
      email: data.email || null,
      pictureId: data.pictureId || null,
      pictureUrl: data.pictureUrl || null,
      courseId: data.courseId, // must be courseId from client
      currentYearLevelId: data.currentYearLevelId || null,
      currentSectionId: data.currentSectionId || null,
      studentType: data.studentType || 'Regular',
      studentStatus: data.studentStatus || 'Active',
      totalUnitsEarned: 0,
      totalUnitsEnrolled: 0,
      cumulativeGPA: null,
      academicStanding: 'Good Standing',
      guardian: data.guardian || null,
      guardianPhone: data.guardianPhone || null,
      mother: data.mother || null,
      father: data.father || null,
      nationality: data.nationality || 'Filipino',
      religion: data.religion || null,
      civilStatus: data.civilStatus || 'Single',
      enrollmentDate: new Date().toISOString(),
      isActive: true
    };

    // Insert new student
    const [newStudent] = await db.insert(student).values(studentData).returning();

    return new Response(JSON.stringify({
      success: true,
      student: newStudent,
      message: 'Student added successfully!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Add student error:', err);
    return new Response(JSON.stringify({
      error: 'Failed to add student.',
      details: err instanceof Error ? err.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};