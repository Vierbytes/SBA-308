function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    console.log("Assignment Group:", JSON.stringify(assignmentGroup, null, 2));
    console.log("Assignment objects:", assignmentGroup.assignments);

    const validCourseIds = new Set();
    for (let i = 0; i < assignmentGroup.assignments.length; i++) {
        const assignment = assignmentGroup.assignments[i];
        console.log(`Processing assignment ${i + 1}:`, JSON.stringify(assignment, null, 2));
        
        if (assignment.course_id !== undefined && typeof assignment.course_id === 'number') {
            validCourseIds.add(assignment.course_id);
            console.log(`Valid course_id found for assignment ${assignment.id}:`, assignment.course_id);
        } else {
            console.warn(`Invalid course_id found in assignment ${assignment.id}:`, assignment.course_id);
        }
    }

    console.log("Valid course IDs:", validCourseIds);

    const result = [];

    for (const submission of learnerSubmissions) {
        let learnerData = {};
        let totalPoints = 0;

        // Skip if submission doesn't exist for this learner
        if (!submission.submission || submission.submission.score === undefined) {
            continue;
        }

        // Calculate weighted average
        let weightedSum = 0;
        let totalWeight = 0;

        for (let i = 0; i < assignmentGroup.assignments.length; i++) {
            const assignment = assignmentGroup.assignments[i];
            const assignmentId = assignment.id;
            const pointsPossible = assignment.points_possible || 0;

            // Skip if points_possible is 0
            if (pointsPossible === 0) {
                continue;
            }

            let score = submission.submission.score || 0;
            const dueDate = new Date(assignment.due_at);

            // Check if submitted late
            if (new Date(submission.submission.submitted_at) > dueDate) {
                score *= 0.9; // Deduct 10% for late submissions
            }

            // Only add if assignment is due
            if (new Date() <= dueDate) {
                learnerData[assignmentId] = (score / pointsPossible) * 100;
                weightedSum += (score / pointsPossible) * assignment.group_weight;
                totalWeight += assignment.group_weight;
                totalPoints += pointsPossible;
            }
        }

        // Calculate weighted average
        if (totalWeight > 0) {
            learnerData.avg = (weightedSum / totalWeight).toFixed(2);
        } else {
            learnerData.avg = 0;
        }

        result.push({ id: submission.learner_id, ...learnerData });
    }

    return result;
}

// Course data
const courseInfo = {
    id: 12345,
    name: "Mathematics 101"
};

const assignmentGroup = {
    id: 67890,
    name: "Midterm Exams",
    course_id: 12345,
    group_weight: 100,
    assignments: [
        {
            id: 11111,
            name: "Algebra Exam",
            due_at: "2024-12-15 23:59:00",
            points_possible: 100
        },
        {
            id: 22222,
            name: "Calculus Test",
            due_at: "2024-12-22 23:59:00",
            points_possible: 150
        }
    ]
};

const learnerSubmissions = [
    {
        learner_id: 10001,
        assignment_id: 11111,
        submission: {
            submitted_at: "2024-12-10 09:30:00",
            score: 95
        }
    },
    {
        learner_id: 10001,
        assignment_id: 22222,
        submission: {
            submitted_at: "2024-12-18 14:30:00",
            score: 85
        }
    },
    {
        learner_id: 10002,
        assignment_id: 11111,
        submission: {
            submitted_at: "2024-12-11 10:45:00",
            score: 92
        }
    }
];

console.log("Course Info:", JSON.stringify(courseInfo, null, 2));

if (assignmentGroup && Array.isArray(assignmentGroup.assignments) && assignmentGroup.assignments.length > 0) {
    console.log("Assignment Group:", JSON.stringify(assignmentGroup, null, 2));
    
    const validCourseIds = new Set();
    for (const assignment of assignmentGroup.assignments) {
        console.log("Processing assignment:", JSON.stringify(assignment, null, 2));
        if (assignment.course_id !== undefined && typeof assignment.course_id === 'number') {
            validCourseIds.add(assignment.course_id);
        } else {
            console.warn(`Invalid course_id found in assignment ${assignment.id}:`, assignment.course_id);
        }
    }
    
    console.log("Valid course IDs:", validCourseIds);
} else {
    console.log("Invalid AssignmentGroup structure");
}

console.log("Calling getLearnerData...");
const result = getLearnerData(courseInfo, assignmentGroup, learnerSubmissions);
console.log("Result:", JSON.stringify(result, null, 0));
document.getElementById('results').innerHTML = JSON.stringify(result, null, 2);

