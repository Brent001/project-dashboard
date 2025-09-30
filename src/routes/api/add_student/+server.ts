import type { RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { student } from '$lib/server/db/schema/schema.js';
import { eq } from 'drizzle-orm';

function validateStudentPayload(data: Record<string, any>) {
  const required = ['studNo', 'firstName', 'lastName', 'course'];
  const missing = required.filter((key) => !data[key]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate input
    const validationError = validateStudentPayload(data);
    if (validationError) {
      return new Response(
        JSON.stringify({ success: false, error: validationError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for duplicate student number
    const existing = await db
      .select()
      .from(student)
      .where(eq(student.studNo, data.studNo))
      .get();

    if (existing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Student number already exists.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare data for insertion
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
      course: data.course,
      yearLevel: data.yearLevel || null,
      section: data.section || null,
      guardian: data.guardian || null,
      guardianPhone: data.guardianPhone || null,
      mother: data.mother || null,
      father: data.father || null,
      nationality: data.nationality || null,
      religion: data.religion || null,
      civilStatus: data.civilStatus || null
    };

    // Insert new student
    const [newStudent] = await db.insert(student).values(studentData).returning();

    return new Response(
      JSON.stringify({
        success: true,
        data: newStudent,
        message: 'Student added successfully.'
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to add student.',
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};