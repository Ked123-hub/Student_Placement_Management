const prisma = require("../config/db");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedStatuses = ["PRESENT", "ABSENT"];

async function markAttendance(roundId, studentId, status, userId) {
  if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentId is required"
    );
  }

  if (!status || !allowedStatuses.includes(status)) {
    throw createAppError(
      "INVALID_ATTENDANCE_STATUS",
      "status must be PRESENT or ABSENT"
    );
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: {
      id: roundId
    }
  });

  if (!round) {
    throw createAppError(
      "ROUND_NOT_FOUND",
      "Recruitment round not found",
      404
    );
  }

  if (round.status !== "SCHEDULED") {
    throw createAppError(
      "ROUND_NOT_ACTIVE",
      "Attendance can only be marked when round status is SCHEDULED",
      400
    );
  }

  const student = await prisma.student.findUnique({
    where: {
      id: studentId.trim()
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student not found",
      404
    );
  }

  const application = await prisma.application.findUnique({
    where: {
      studentId_driveId: {
        studentId: student.id,
        driveId: round.driveId
      }
    }
  });

  if (!application) {
    throw createAppError(
      "APPLICATION_REQUIRED",
      "Student has not applied to the drive associated with this round",
      400
    );
  }

  const existing = await prisma.attendance.findUnique({
    where: {
      roundId_studentId: {
        roundId,
        studentId: student.id
      }
    }
  });

  const now = new Date();

  if (existing) {
    const updated = await prisma.attendance.update({
      where: {
        id: existing.id
      },
      data: {
        status,
        markedAt: now,
        markedBy: userId
      }
    });

    return {
      attendance: updated,
      isUpdated: true
    };
  }

  const created = await prisma.attendance.create({
    data: {
      roundId,
      studentId: student.id,
      status,
      markedAt: now,
      markedBy: userId
    }
  });

  return {
    attendance: created,
    isUpdated: false
  };
}

async function markAttendanceBulk(roundId, attendances, userId) {
  if (!Array.isArray(attendances) || attendances.length === 0) {
    throw createAppError(
      "VALIDATION_ERROR",
      "attendances must be a non-empty array",
      400
    );
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: {
      id: roundId
    }
  });

  if (!round) {
    throw createAppError(
      "ROUND_NOT_FOUND",
      "Recruitment round not found",
      404
    );
  }

  if (round.status !== "SCHEDULED") {
    throw createAppError(
      "ROUND_NOT_ACTIVE",
      "Attendance can only be marked when round status is SCHEDULED",
      400
    );
  }

  const seenStudentIds = new Set();
  const sanitizedList = [];

  for (let i = 0; i < attendances.length; i++) {
    const item = attendances[i];

    if (!item || typeof item !== "object") {
      throw createAppError(
        "VALIDATION_ERROR",
        `Attendance entry at index ${i} is invalid`
      );
    }

    const { studentId, status } = item;

    if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
      throw createAppError(
        "VALIDATION_ERROR",
        `studentId is required at index ${i}`
      );
    }

    if (!status || !allowedStatuses.includes(status)) {
      throw createAppError(
        "INVALID_ATTENDANCE_STATUS",
        `Invalid status '${status}' at index ${i}. Must be PRESENT or ABSENT`
      );
    }

    const trimmedId = studentId.trim();

    if (seenStudentIds.has(trimmedId)) {
      throw createAppError(
        "VALIDATION_ERROR",
        `Duplicate studentId '${trimmedId}' found in attendances array`
      );
    }

    seenStudentIds.add(trimmedId);
    sanitizedList.push({
      studentId: trimmedId,
      status
    });
  }

  const studentIds = Array.from(seenStudentIds);

  const students = await prisma.student.findMany({
    where: {
      id: {
        in: studentIds
      }
    },
    select: {
      id: true
    }
  });

  const foundStudentIds = new Set(students.map((s) => s.id));

  for (const sId of studentIds) {
    if (!foundStudentIds.has(sId)) {
      throw createAppError(
        "STUDENT_NOT_FOUND",
        `Student '${sId}' not found`,
        404
      );
    }
  }

  const applications = await prisma.application.findMany({
    where: {
      driveId: round.driveId,
      studentId: {
        in: studentIds
      }
    },
    select: {
      studentId: true
    }
  });

  const applicantIds = new Set(applications.map((a) => a.studentId));

  for (const sId of studentIds) {
    if (!applicantIds.has(sId)) {
      throw createAppError(
        "APPLICATION_REQUIRED",
        `Student '${sId}' has not applied to the drive associated with this round`,
        400
      );
    }
  }

  const now = new Date();

  const results = await prisma.$transaction(async (tx) => {
    const upserted = [];

    for (const item of sanitizedList) {
      const record = await tx.attendance.upsert({
        where: {
          roundId_studentId: {
            roundId,
            studentId: item.studentId
          }
        },
        update: {
          status: item.status,
          markedAt: now,
          markedBy: userId
        },
        create: {
          roundId,
          studentId: item.studentId,
          status: item.status,
          markedAt: now,
          markedBy: userId
        }
      });

      upserted.push(record);
    }

    return upserted;
  });

  return {
    totalProcessed: results.length,
    attendances: results
  };
}

async function getRoundAttendance(roundId, query = {}) {
  const round = await prisma.recruitmentRound.findUnique({
    where: {
      id: roundId
    }
  });

  if (!round) {
    throw createAppError(
      "ROUND_NOT_FOUND",
      "Recruitment round not found",
      404
    );
  }

  const where = {
    roundId
  };

  if (query.status) {
    if (!allowedStatuses.includes(query.status)) {
      throw createAppError(
        "INVALID_ATTENDANCE_STATUS",
        "status filter must be PRESENT or ABSENT",
        400
      );
    }

    where.status = query.status;
  }

  const records = await prisma.attendance.findMany({
    where,
    select: {
      id: true,
      status: true,
      markedAt: true,
      markedBy: true,
      student: {
        select: {
          id: true,
          name: true,
          prn: true,
          rollNumber: true,
          email: true,
          branch: true,
          year: true
        }
      }
    },
    orderBy: {
      student: {
        name: "asc"
      }
    }
  });

  const [presentCount, absentCount] = await Promise.all([
    prisma.attendance.count({
      where: {
        roundId,
        status: "PRESENT"
      }
    }),
    prisma.attendance.count({
      where: {
        roundId,
        status: "ABSENT"
      }
    })
  ]);

  return {
    round: {
      id: round.id,
      name: round.name,
      roundNumber: round.roundNumber,
      status: round.status
    },
    summary: {
      total: presentCount + absentCount,
      present: presentCount,
      absent: absentCount
    },
    attendances: records
  };
}

async function getStudentAttendance(roundId, userId) {
  const student = await prisma.student.findUnique({
    where: {
      userId
    }
  });

  if (!student) {
    throw createAppError(
      "STUDENT_NOT_FOUND",
      "Student profile not found",
      404
    );
  }

  const round = await prisma.recruitmentRound.findUnique({
    where: {
      id: roundId
    }
  });

  if (!round) {
    throw createAppError(
      "ROUND_NOT_FOUND",
      "Recruitment round not found",
      404
    );
  }

  const record = await prisma.attendance.findUnique({
    where: {
      roundId_studentId: {
        roundId,
        studentId: student.id
      }
    },
    select: {
      id: true,
      status: true,
      markedAt: true
    }
  });

  return {
    roundId,
    attendance: record || null
  };
}

module.exports = {
  markAttendance,
  markAttendanceBulk,
  getRoundAttendance,
  getStudentAttendance
};
