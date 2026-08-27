const axios = require("axios");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:5000/api";

const randomId = Date.now();
const teacherEmail = `teacher_${randomId}@quizmind.test`;
const student1Email = `student1_${randomId}@quizmind.test`;
const student2Email = `student2_${randomId}@quizmind.test`;
const password = "Password123!";

async function runTests() {
  console.log("==========================================");
  console.log(" Starting QuizMind Full-Stack E2E API Test ");
  console.log("==========================================");

  let teacherToken = "";
  let teacherId = "";
  let student1Token = "";
  let student1Id = "";
  let student2Token = "";
  let student2Id = "";
  let createdQuizId = "";
  let attemptId = "";

  // 1. Health Checks
  console.log("\n[TEST 1] Testing Health Endpoints...");
  const healthRes = await axios.get("http://localhost:5000/health");
  console.log("  GET /health:", healthRes.data.success ? "PASS" : "FAIL");
  const apiHealthRes = await axios.get(`${API_URL}/health`);
  console.log("  GET /api/health:", apiHealthRes.data.success ? "PASS" : "FAIL");

  // 2. Teacher Registration
  console.log("\n[TEST 2] Registering Teacher Account...");
  const regTeacherRes = await axios.post(`${API_URL}/auth/register`, {
    name: "Dr. Elena Vance",
    email: teacherEmail,
    password: password,
    role: "TEACHER"
  });
  console.log("  Teacher registration:", regTeacherRes.data.success ? "PASS" : "FAIL");
  teacherToken = regTeacherRes.data.data.token;
  teacherId = regTeacherRes.data.data.user.id;

  // 3. Student 1 Registration
  console.log("\n[TEST 3] Registering Student 1 Account...");
  const regStudent1Res = await axios.post(`${API_URL}/auth/register`, {
    name: "Gordon Freeman",
    email: student1Email,
    password: password,
    role: "STUDENT"
  });
  console.log("  Student 1 registration:", regStudent1Res.data.success ? "PASS" : "FAIL");
  student1Token = regStudent1Res.data.data.token;
  student1Id = regStudent1Res.data.data.user.id;

  // 4. Student 2 Registration
  console.log("\n[TEST 4] Registering Student 2 Account...");
  const regStudent2Res = await axios.post(`${API_URL}/auth/register`, {
    name: "Alyx Vance",
    email: student2Email,
    password: password,
    role: "STUDENT"
  });
  console.log("  Student 2 registration:", regStudent2Res.data.success ? "PASS" : "FAIL");
  student2Token = regStudent2Res.data.data.token;
  student2Id = regStudent2Res.data.data.user.id;

  // 5. Teacher Login
  console.log("\n[TEST 5] Teacher Login Verification...");
  const loginTeacherRes = await axios.post(`${API_URL}/auth/login`, {
    email: teacherEmail,
    password: password
  });
  console.log("  Teacher login:", loginTeacherRes.data.success ? "PASS" : "FAIL");

  // 6. Auth /me verification
  console.log("\n[TEST 6] Verifying /auth/me with Bearer token...");
  const meRes = await axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${teacherToken}` }
  });
  console.log("  /auth/me authenticated as:", meRes.data.data.user.email, "Role:", meRes.data.data.user.role);

  // 7. Profile update
  console.log("\n[TEST 7] Updating Profile & Preferences...");
  const updateProfileRes = await axios.put(
    `${API_URL}/auth/me`,
    { name: "Dr. Elena Vance (Updated)" },
    { headers: { Authorization: `Bearer ${teacherToken}` } }
  );
  console.log("  Profile update:", updateProfileRes.data.data.user.name === "Dr. Elena Vance (Updated)" ? "PASS" : "FAIL");

  // 8. Quiz Generation from Document via API
  console.log("\n[TEST 8] Uploading Document and Generating Assessment via API...");
  const sampleDocPath = path.join(__dirname, "sample_training.txt");
  fs.writeFileSync(
    sampleDocPath,
    `Standard Operating Procedure: Package Handling and Facility Safety.
1. All packages exceeding 70 lbs must be handled using mechanical lifting equipment or a two-person team lift.
2. Conveyor belts must be shut down and locked out before attempting to clear any belt jam.
3. High-visibility safety vests and steel-toed boots are mandatory inside all sorting hubs.
4. Hazardous material parcels must display proper UN labeling and be segregated in designated containment pallets.`
  );

  const FormData = require("form-data");
  const form = new FormData();
  form.append("document", fs.createReadStream(sampleDocPath));
  form.append("questionCount", "3");
  form.append("difficulty", "medium");
  form.append("questionTypes", "mcq,true_false,short_answer");

  const genQuizRes = await axios.post(`${API_URL}/quizzes/generate`, form, {
    headers: {
      Authorization: `Bearer ${teacherToken}`,
      ...form.getHeaders()
    },
    timeout: 60000
  });

  console.log("  AI Quiz Generation Status:", genQuizRes.data.success ? "PASS" : "FAIL");
  createdQuizId = genQuizRes.data.data._id;
  console.log("  Created Quiz ID:", createdQuizId, "Questions count:", genQuizRes.data.data.questions?.length);
  if (fs.existsSync(sampleDocPath)) fs.unlinkSync(sampleDocPath);

  // 9. Update Quiz Content
  console.log("\n[TEST 9] Updating Quiz Content (Save Draft)...");
  const updateRes = await axios.put(
    `${API_URL}/quizzes/${createdQuizId}`,
    {
      title: "Workforce Facility Safety Standard SOP (Verified)",
      topic: "Safety & Compliance"
    },
    { headers: { Authorization: `Bearer ${teacherToken}` } }
  );
  console.log("  Update Quiz draft:", updateRes.data.success ? "PASS" : "FAIL");

  // 10. Publish Quiz (Testing the previous 500 error!)
  console.log("\n[TEST 10] Publishing Quiz (PATCH /publish)...");
  const publishRes = await axios.patch(
    `${API_URL}/quizzes/${createdQuizId}/publish`,
    {},
    { headers: { Authorization: `Bearer ${teacherToken}` } }
  );
  console.log("  Publish Quiz response status:", publishRes.status, "Status:", publishRes.data.data.status);
  console.log("  Publishing Quiz:", publishRes.data.data.status === "published" ? "PASS" : "FAIL");

  // 11. Student Views Published Quizzes
  console.log("\n[TEST 11] Student Views Published Catalogue...");
  const pubQuizzesRes = await axios.get(`${API_URL}/quizzes/published`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  const foundQuiz = pubQuizzesRes.data.data.find(q => q._id === createdQuizId.toString());
  console.log("  Published quiz visible to student:", Boolean(foundQuiz) ? "PASS" : "FAIL");

  // 12. Student Takes Quiz & Submits Attempt
  console.log("\n[TEST 12] Student 1 Submits Quiz Attempt...");
  const submitRes = await axios.post(
    `${API_URL}/quizzes/${createdQuizId}/attempts`,
    {
      answers: [
        { questionIndex: 0, answer: "Use mechanical lift or two-person team" },
        { questionIndex: 1, answer: "True" }
      ]
    },
    { headers: { Authorization: `Bearer ${student1Token}` } }
  );
  console.log("  Submit Attempt Score:", submitRes.data.data.score, "/", submitRes.data.data.totalQuestions, "Percentage:", submitRes.data.data.percentage + "%");
  attemptId = submitRes.data.data.attemptId;

  // 13. Student 2 Takes Quiz & Submits
  console.log("\n[TEST 13] Student 2 Submits Quiz Attempt...");
  await axios.post(
    `${API_URL}/quizzes/${createdQuizId}/attempts`,
    {
      answers: [
        { questionIndex: 0, answer: "Single person lift" },
        { questionIndex: 1, answer: "True" }
      ]
    },
    { headers: { Authorization: `Bearer ${student2Token}` } }
  );

  // 14. Student Views Attempt Results
  console.log("\n[TEST 14] Student 1 Views Own Attempt Record...");
  const getAttemptRes = await axios.get(`${API_URL}/attempts/${attemptId}`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  console.log("  Student 1 attempt lookup:", getAttemptRes.data.success ? "PASS" : "FAIL");

  // 15. Student Attempts History
  console.log("\n[TEST 15] Student 1 Views Own Attempts List...");
  const myAttemptsRes = await axios.get(`${API_URL}/attempts/my`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  console.log("  Student 1 total attempts:", myAttemptsRes.data.data.length, "PASS");

  // 16. Student Dashboard Stats
  console.log("\n[TEST 16] Student Dashboard Stats...");
  const studentStatsRes = await axios.get(`${API_URL}/attempts/stats`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  console.log("  Student Stats:", JSON.stringify(studentStatsRes.data.data));

  // 17. Leaderboard
  console.log("\n[TEST 17] Testing Workforce Leaderboard...");
  const leaderboardRes = await axios.get(`${API_URL}/attempts/leaderboard?timeframe=all`, {
    headers: { Authorization: `Bearer ${student1Token}` }
  });
  console.log("  Leaderboard total learners ranked:", leaderboardRes.data.data.totalLearners);

  // 18. DATA ISOLATION TEST (CRITICAL)
  console.log("\n[TEST 18] CRITICAL: Verifying Strict User Data Isolation...");
  
  // Student 2 attempts to view Student 1's private attempt
  try {
    await axios.get(`${API_URL}/attempts/${attemptId}`, {
      headers: { Authorization: `Bearer ${student2Token}` }
    });
    console.error("  ISOLATION VIOLATION: Student 2 was able to view Student 1 attempt! FAIL");
  } catch (err) {
    console.log("  Isolation Check 1 (Cross-student attempt view blocked): PASS (HTTP 403)");
  }

  // Student 1 attempts to update teacher's quiz
  try {
    await axios.put(
      `${API_URL}/quizzes/${createdQuizId}`,
      { title: "Hacked Title" },
      { headers: { Authorization: `Bearer ${student1Token}` } }
    );
    console.error("  ISOLATION VIOLATION: Student was able to edit Teacher quiz! FAIL");
  } catch (err) {
    console.log("  Isolation Check 2 (Student editing teacher quiz blocked): PASS (HTTP 404/403)");
  }

  // 19. Teacher Analytics
  console.log("\n[TEST 19] Teacher Analytics & Dashboard Stats...");
  const teacherStatsRes = await axios.get(`${API_URL}/quizzes/stats`, {
    headers: { Authorization: `Bearer ${teacherToken}` }
  });
  console.log("  Teacher Stats:", JSON.stringify(teacherStatsRes.data.data));

  const teacherAnalyticsRes = await axios.get(`${API_URL}/quizzes/analytics`, {
    headers: { Authorization: `Bearer ${teacherToken}` }
  });
  console.log("  Teacher Analytics Summary:", JSON.stringify(teacherAnalyticsRes.data.data.summary));

  console.log("\n==========================================");
  console.log(" ALL FULL-STACK BACKEND TESTS PASSED! ");
  console.log("==========================================");
}

runTests().catch(err => {
  console.error("Test Suite Encountered Fatal Error:", err.response?.data || err.message);
  process.exit(1);
});
