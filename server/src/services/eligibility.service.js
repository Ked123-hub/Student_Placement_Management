const prisma = require("../config/db");

function getStudentValue(student, field) {
  switch (field) {
    case "CGPA":
      return Number(student.cgpa);

    case "TENTH_PERCENT":
      return Number(student.tenthPercent);

    case "TWELFTH_PERCENT":
      return Number(student.twelfthPercent);

    case "DIPLOMA_PERCENT":
      return student.diplomaPercent === null
        ? null
        : Number(student.diplomaPercent);

    case "BACKLOGS":
      return Number(student.backlogs);

    case "BRANCH":
      return student.branch;

    case "YEAR":
      return Number(student.year);

    default:
      return null;
  }
}

function checkCondition(studentValue, operator, requiredValue) {
  switch (operator) {
    case "GTE":
      return studentValue >= Number(requiredValue);

    case "LTE":
      return studentValue <= Number(requiredValue);

    case "GT":
      return studentValue > Number(requiredValue);

    case "LT":
      return studentValue < Number(requiredValue);

    case "EQ":
      return studentValue == requiredValue;

    case "IN":
      return Array.isArray(requiredValue) &&
        requiredValue.includes(studentValue);

    case "NOT_IN":
      return Array.isArray(requiredValue) &&
        !requiredValue.includes(studentValue);

    default:
      return false;
  }
}

async function evaluateDriveEligibility(driveId) {
  const criteria = await prisma.eligibilityCriteria.findMany({
    where: {
      driveId
    }
  });

  const students = await prisma.student.findMany();

  const results = [];

  for (const student of students) {
    let eligible = true;
    const failed = [];

    for (const criterion of criteria) {
      const studentValue = getStudentValue(
        student,
        criterion.field
      );

      const passed = checkCondition(
        studentValue,
        criterion.operator,
        criterion.value
      );

      if (!passed) {
        eligible = false;

        failed.push(
          `${criterion.field} ${criterion.operator} ${JSON.stringify(criterion.value)}`
        );
      }
    }

    results.push({
      driveId,
      studentId: student.id,
      eligible,
      reason: eligible
        ? "All eligibility criteria satisfied"
        : `Failed: ${failed.join(", ")}`
    });
  }

  return results;
}

async function saveEligibility(driveId) {
  const results = await evaluateDriveEligibility(driveId);

  await prisma.$transaction(async (tx) => {
    await tx.driveEligibility.deleteMany({
      where: {
        driveId
      }
    });

    for (const result of results) {
      await tx.driveEligibility.create({
        data: {
          driveId: result.driveId,
          studentId: result.studentId,
          eligible: result.eligible,
          reason: result.reason
        }
      });
    }
  });

  return results;
}

module.exports = {
  evaluateDriveEligibility,
  saveEligibility
};