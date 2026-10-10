const prisma = require("../config/db");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

const allowedResults = ["PASSED", "FAILED", "NOT_PROGRESSED"];

function parseScore(score, index = null) {
  const prefix = index !== null ? `At index ${index}: ` : "";

  if (score === undefined || score === null || score === "") {
    return null;
  }

  const num = Number(score);

  if (isNaN(num) || num < 0 || num > 9999.99) {
    throw createAppError(
      "INVALID_SCORE",
      `${prefix}score must be a number between 0 and 9999.99`,
      400
    );
  }

  return num;
}

function parseRemarks(remarks, index = null) {
  const prefix = index !== null ? `At index ${index}: ` : "";

  if (remarks === undefined || remarks === null) {
    return null;
  }

  if (typeof remarks !== "string") {
    throw createAppError(
      "VALIDATION_ERROR",
      `${prefix}remarks must be a string`,
      400
    );
  }

  return remarks.trim() === "" ? null : remarks.trim();
}

async function recordResult(roundId, data = {}, userId) {
  const { studentId, result, score, remarks } = data;

  if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
    throw createAppError(
      "VALIDATION_ERROR",
      "studentId is required",
      400
    );
  }

  if (!result || !allowedResults.includes(result)) {
    throw createAppError(
      "INVALID_ROUND_RESULT",
      "result must be PASSED, FAILED, or NOT_PROGRESSED",
      400
    );
  }

  const parsedScore = parseScore(score);
  const parsedRemarks = parseRemarks(remarks);

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
      "Round results can only be recorded when round status is SCHEDULED",
      400
    );
  }

  const trimmedStudentId = studentId.trim();

  const student = await prisma.student.findUnique({
    where: {
      id: trimmedStudentId
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
        studentId: trimmedStudentId,
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

  // Attendance gating: if PASSED, must have PRESENT attendance
  if (result === "PASSED") {
    const attendance = await prisma.attendance.findUnique({
      where: {
        roundId_studentId: {
          roundId,
          studentId: trimmedStudentId
        }
      }
    });

    if (!attendance || attendance.status !== "PRESENT") {
      throw createAppError(
        "ATTENDANCE_REQUIRED",
        "Student must be marked PRESENT before passing the round",
        400
      );
    }
  }

  // Previous round gating: if roundNumber > 1, must have PASSED immediately previous round
  if (round.roundNumber > 1) {
    const previousRound = await prisma.recruitmentRound.findFirst({
      where: {
        driveId: round.driveId,
        roundNumber: round.roundNumber - 1
      }
    });

    if (previousRound) {
      const prevResult = await prisma.roundResult.findUnique({
        where: {
          roundId_studentId: {
            roundId: previousRound.id,
            studentId: trimmedStudentId
          }
        }
      });

      if (!prevResult || prevResult.result !== "PASSED") {
        throw createAppError(
          "PREVIOUS_ROUND_NOT_CLEARED",
          `Student must have PASSED the previous round (Round ${previousRound.roundNumber}) before receiving a result for this round`,
          400
        );
      }
    }
  }

  const existing = await prisma.roundResult.findUnique({
    where: {
      roundId_studentId: {
        roundId,
        studentId: trimmedStudentId
      }
    }
  });

  const now = new Date();

  if (existing) {
    const updated = await prisma.roundResult.update({
      where: {
        id: existing.id
      },
      data: {
        result,
        score: parsedScore,
        remarks: parsedRemarks,
        recordedAt: now,
        recordedBy: userId
      }
    });

    return {
      result: updated,
      isUpdated: true
    };
  }

  const created = await prisma.roundResult.create({
    data: {
      roundId,
      studentId: trimmedStudentId,
      result,
      score: parsedScore,
      remarks: parsedRemarks,
      recordedAt: now,
      recordedBy: userId
    }
  });

  return {
    result: created,
    isUpdated: false
  };
}

async function recordResultsBulk(roundId, resultsArray, userId) {
  if (!Array.isArray(resultsArray) || resultsArray.length === 0) {
    throw createAppError(
      "VALIDATION_ERROR",
      "results must be a non-empty array",
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
      "Round results can only be recorded when round status is SCHEDULED",
      400
    );
  }

  const seenStudentIds = new Set();
  const sanitizedList = [];

  for (let i = 0; i < resultsArray.length; i++) {
    const item = resultsArray[i];

    if (!item || typeof item !== "object") {
      throw createAppError(
        "VALIDATION_ERROR",
        `Result entry at index ${i} is invalid`,
        400
      );
    }

    const { studentId, result, score, remarks } = item;

    if (!studentId || typeof studentId !== "string" || !studentId.trim()) {
      throw createAppError(
        "VALIDATION_ERROR",
        `studentId is required at index ${i}`,
        400
      );
    }

    if (!result || !allowedResults.includes(result)) {
      throw createAppError(
        "INVALID_ROUND_RESULT",
        `Invalid result '${result}' at index ${i}. Must be PASSED, FAILED, or NOT_PROGRESSED`,
        400
      );
    }

    const trimmedId = studentId.trim();

    if (seenStudentIds.has(trimmedId)) {
      throw createAppError(
        "VALIDATION_ERROR",
        `Duplicate studentId '${trimmedId}' found in results array`,
        400
      );
    }

    seenStudentIds.add(trimmedId);

    const parsedScore = parseScore(score, i);
    const parsedRemarks = parseRemarks(remarks, i);

    sanitizedList.push({
      studentId: trimmedId,
      result,
      score: parsedScore,
      remarks: parsedRemarks
    });
  }

  const studentIds = Array.from(seenStudentIds);

  // Check students exist
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

  // Check applications exist
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

  // Check attendance for students marked PASSED
  const passedStudentIds = sanitizedList
    .filter((item) => item.result === "PASSED")
    .map((item) => item.studentId);

  if (passedStudentIds.length > 0) {
    const attendances = await prisma.attendance.findMany({
      where: {
        roundId,
        studentId: {
          in: passedStudentIds
        }
      }
    });

    const presentMap = new Map();
    for (const att of attendances) {
      if (att.status === "PRESENT") {
        presentMap.set(att.studentId, true);
      }
    }

    for (const sId of passedStudentIds) {
      if (!presentMap.get(sId)) {
        throw createAppError(
          "ATTENDANCE_REQUIRED",
          "Student must be marked PRESENT before passing the round",
          400
        );
      }
    }
  }

  // Check previous round gating if roundNumber > 1
  if (round.roundNumber > 1) {
    const previousRound = await prisma.recruitmentRound.findFirst({
      where: {
        driveId: round.driveId,
        roundNumber: round.roundNumber - 1
      }
    });

    if (previousRound) {
      const prevResults = await prisma.roundResult.findMany({
        where: {
          roundId: previousRound.id,
          studentId: {
            in: studentIds
          }
        }
      });

      const clearedMap = new Map();
      for (const pr of prevResults) {
        if (pr.result === "PASSED") {
          clearedMap.set(pr.studentId, true);
        }
      }

      for (const sId of studentIds) {
        if (!clearedMap.get(sId)) {
          throw createAppError(
            "PREVIOUS_ROUND_NOT_CLEARED",
            `Student must have PASSED the previous round (Round ${previousRound.roundNumber}) before receiving a result for this round`,
            400
          );
        }
      }
    }
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    let createdCount = 0;
    let updatedCount = 0;
    const processedResults = [];

    for (const item of sanitizedList) {
      const existing = await tx.roundResult.findUnique({
        where: {
          roundId_studentId: {
            roundId,
            studentId: item.studentId
          }
        }
      });

      if (existing) {
        const updated = await tx.roundResult.update({
          where: {
            id: existing.id
          },
          data: {
            result: item.result,
            score: item.score,
            remarks: item.remarks,
            recordedAt: now,
            recordedBy: userId
          }
        });
        updatedCount++;
        processedResults.push(updated);
      } else {
        const created = await tx.roundResult.create({
          data: {
            roundId,
            studentId: item.studentId,
            result: item.result,
            score: item.score,
            remarks: item.remarks,
            recordedAt: now,
            recordedBy: userId
          }
        });
        createdCount++;
        processedResults.push(created);
      }
    }

    return {
      totalProcessed: processedResults.length,
      created: createdCount,
      updated: updatedCount
    };
  });
}

async function getRoundResults(roundId, query = {}) {
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

  if (query.result) {
    if (!allowedResults.includes(query.result)) {
      throw createAppError(
        "INVALID_ROUND_RESULT",
        "result filter must be PASSED, FAILED, or NOT_PROGRESSED",
        400
      );
    }
    where.result = query.result;
  }

  const results = await prisma.roundResult.findMany({
    where,
    select: {
      id: true,
      result: true,
      score: true,
      remarks: true,
      recordedAt: true,
      recordedBy: true,
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

  const [passedCount, failedCount, notProgressedCount] = await Promise.all([
    prisma.roundResult.count({
      where: {
        roundId,
        result: "PASSED"
      }
    }),
    prisma.roundResult.count({
      where: {
        roundId,
        result: "FAILED"
      }
    }),
    prisma.roundResult.count({
      where: {
        roundId,
        result: "NOT_PROGRESSED"
      }
    })
  ]);

  return {
    round: {
      id: round.id,
      roundNumber: round.roundNumber,
      name: round.name,
      status: round.status
    },
    summary: {
      total: passedCount + failedCount + notProgressedCount,
      passed: passedCount,
      failed: failedCount,
      notProgressed: notProgressedCount
    },
    results
  };
}

async function getStudentRoundResult(roundId, userId) {
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

  const res = await prisma.roundResult.findUnique({
    where: {
      roundId_studentId: {
        roundId,
        studentId: student.id
      }
    },
    select: {
      id: true,
      result: true,
      score: true,
      remarks: true,
      recordedAt: true
    }
  });

  return {
    roundId,
    result: res || null
  };
}

module.exports = {
  recordResult,
  recordResultsBulk,
  getRoundResults,
  getStudentRoundResult
};
