import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { Quiz } from "../models/Quiz";
import { QuizAttempt } from "../models/QuizAttempt";

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("MONGO_URI environment variable is required.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB for demo seeding...");
  await mongoose.connect(mongoUri);

  console.log("Cleaning existing demo records...");
  await User.deleteMany({ email: { $in: ["demo.teacher@quizmind.ai", "demo.student1@quizmind.ai", "demo.student2@quizmind.ai"] } });

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Teacher
  const teacher = await User.create({
    name: "Marcus Vance",
    email: "demo.teacher@quizmind.ai",
    password: passwordHash,
    role: "TEACHER"
  });
  console.log("✔ Created Demo Teacher:", teacher.email);

  // 2. Create Students
  const student1 = await User.create({
    name: "Sarah Chen",
    email: "demo.student1@quizmind.ai",
    password: passwordHash,
    role: "STUDENT"
  });

  const student2 = await User.create({
    name: "David Miller",
    email: "demo.student2@quizmind.ai",
    password: passwordHash,
    role: "STUDENT"
  });
  console.log("✔ Created Demo Students:", student1.email, ",", student2.email);

  // 3. Create Enterprise Training Quizzes
  const quiz1 = await Quiz.create({
    title: "Facility Safety & HAZMAT Protocols SOP",
    description: "Standard Operating Procedures for handling hazardous chemicals, personal protective equipment (PPE), and emergency exit compliance.",
    topic: "Safety & Compliance",
    sourceFile: "UPS_Safety_Compliance_Standard_2026.pdf",
    status: "published",
    createdBy: teacher._id,
    questions: [
      {
        question: "What is the mandatory PPE requirement when operating near high-velocity conveyor belts?",
        type: "mcq",
        options: [
          "High-visibility vest and steel-toe footwear with anti-slip soles",
          "Casual sneakers and loose clothing",
          "Standard cotton gloves only",
          "Hearing protection with no vest requirement"
        ],
        answer: "High-visibility vest and steel-toe footwear with anti-slip soles",
        explanation: "OSHA and enterprise facility guidelines require high-visibility reflective vests and rated steel-toe protective footwear at all times on the sorting floor.",
        difficulty: "medium",
        source: "Section 2.4 - Floor Protective Equipment Mandate"
      },
      {
        question: "Fire exit pathways and electrical shut-off panels must maintain an unobstructed clearance of at least 36 inches.",
        type: "true_false",
        options: ["True", "False"],
        answer: "True",
        explanation: "Federal regulatory standards mandate a minimum 36-inch clear radius in front of all emergency electrical panels and emergency egress doors.",
        difficulty: "easy",
        source: "Section 3.1 - Emergency Egress Standards"
      },
      {
        question: "What immediate action must be taken upon discovering an unlabelled chemical leak in the sorting bay?",
        type: "short_answer",
        answer: "Evacuate the area and notify HAZMAT response supervisor",
        explanation: "Personnel must never attempt unauthorized cleanup; protocol mandates immediate 50-foot perimeter isolation, evacuation, and alerting the designated HAZMAT team.",
        difficulty: "hard",
        source: "Section 7.8 - Chemical Containment Protocol"
      },
      {
        question: "What is the maximum allowable weight for an unassisted single-worker manual lift?",
        type: "mcq",
        options: ["50 lbs", "70 lbs", "100 lbs", "35 lbs"],
        answer: "50 lbs",
        explanation: "Packages exceeding 50 lbs must be handled via team lift or assisted with mechanical hydraulic lifting equipment.",
        difficulty: "easy",
        source: "Section 4.2 - Ergonomic Lifting Standards"
      }
    ]
  });

  const quiz2 = await Quiz.create({
    title: "Logistics Package Routing & Barcode Verification",
    description: "Automated sortation workflows, optical scanner diagnostics, and re-routing protocols for misdirected shipments.",
    topic: "Operations Training",
    sourceFile: "Automated_Sortation_Manual_v4.docx",
    status: "published",
    createdBy: teacher._id,
    questions: [
      {
        question: "When an automated optical sorter fails to decode a damaged 2D DataMatrix code, what is the automated fallback route?",
        type: "mcq",
        options: [
          "Re-route to manual exception lane for key-entry review",
          "Return package immediately to sender",
          "Halt conveyor line completely",
          "Discard barcode tag"
        ],
        answer: "Re-route to manual exception lane for key-entry review",
        explanation: "Unreadable barcodes trigger an automatic pneumatic diverter to lane 9 for manual video coding exception handling without line stoppage.",
        difficulty: "medium",
        source: "Chapter 4 - Sorter Exception Routing"
      },
      {
        question: "High-speed line sort rates should exceed 12,000 parcels per hour under nominal operations.",
        type: "true_false",
        options: ["True", "False"],
        answer: "True",
        explanation: "Nominal operational benchmark for primary cross-belt sorter loops is rated at 12,000 to 15,000 pieces per hour.",
        difficulty: "easy",
        source: "Chapter 2 - Loop Sorter Throughput Capacity"
      }
    ]
  });

  const quiz3 = await Quiz.create({
    title: "Driver Fleet Pre-Trip Inspection & Telematics",
    description: "Vehicle safety walk-around inspections, tire pressure threshold telemetry, and electronic logging device (ELD) certification.",
    topic: "SOP Assessment",
    sourceFile: "Fleet_Safety_Standard_Operating_Procedure.pdf",
    status: "draft",
    createdBy: teacher._id,
    questions: [
      {
        question: "What is the maximum allowed variance in tire tread depth across steering axle tires?",
        type: "mcq",
        options: ["4/32 inch minimum depth", "1/32 inch", "No requirement", "8/32 inch"],
        answer: "4/32 inch minimum depth",
        explanation: "Commercial motor vehicle safety regulations require steering tires to maintain at least 4/32 inch tread depth across all major grooves.",
        difficulty: "hard",
        source: "Section 6.1 - Steering Axle Standards"
      }
    ]
  });

  console.log("✔ Created Demo Quizzes (2 Published, 1 Draft)");

  // 4. Create Realistic Quiz Attempts
  await QuizAttempt.create({
    student: student1._id,
    quiz: quiz1._id,
    quizTitle: quiz1.title,
    quizTopic: quiz1.topic,
    answers: [
      {
        questionIndex: 0,
        question: quiz1.questions[0].question,
        questionType: "mcq",
        selectedAnswer: "High-visibility vest and steel-toe footwear with anti-slip soles",
        correctAnswer: quiz1.questions[0].answer,
        explanation: quiz1.questions[0].explanation,
        isCorrect: true
      },
      {
        questionIndex: 1,
        question: quiz1.questions[1].question,
        questionType: "true_false",
        selectedAnswer: "True",
        correctAnswer: quiz1.questions[1].answer,
        explanation: quiz1.questions[1].explanation,
        isCorrect: true
      },
      {
        questionIndex: 2,
        question: quiz1.questions[2].question,
        questionType: "short_answer",
        selectedAnswer: "Evacuate the area and notify HAZMAT response supervisor",
        correctAnswer: quiz1.questions[2].answer,
        explanation: quiz1.questions[2].explanation,
        isCorrect: true
      },
      {
        questionIndex: 3,
        question: quiz1.questions[3].question,
        questionType: "mcq",
        selectedAnswer: "50 lbs",
        correctAnswer: quiz1.questions[3].answer,
        explanation: quiz1.questions[3].explanation,
        isCorrect: true
      }
    ],
    score: 4,
    totalQuestions: 4,
    correctAnswers: 4,
    incorrectAnswers: 0,
    percentage: 100,
    submittedAt: new Date(Date.now() - 3600000)
  });

  await QuizAttempt.create({
    student: student2._id,
    quiz: quiz1._id,
    quizTitle: quiz1.title,
    quizTopic: quiz1.topic,
    answers: [
      {
        questionIndex: 0,
        question: quiz1.questions[0].question,
        questionType: "mcq",
        selectedAnswer: "High-visibility vest and steel-toe footwear with anti-slip soles",
        correctAnswer: quiz1.questions[0].answer,
        explanation: quiz1.questions[0].explanation,
        isCorrect: true
      },
      {
        questionIndex: 1,
        question: quiz1.questions[1].question,
        questionType: "true_false",
        selectedAnswer: "False",
        correctAnswer: quiz1.questions[1].answer,
        explanation: quiz1.questions[1].explanation,
        isCorrect: false
      },
      {
        questionIndex: 2,
        question: quiz1.questions[2].question,
        questionType: "short_answer",
        selectedAnswer: "Evacuate area immediately",
        correctAnswer: quiz1.questions[2].answer,
        explanation: quiz1.questions[2].explanation,
        isCorrect: false
      },
      {
        questionIndex: 3,
        question: quiz1.questions[3].question,
        questionType: "mcq",
        selectedAnswer: "50 lbs",
        correctAnswer: quiz1.questions[3].answer,
        explanation: quiz1.questions[3].explanation,
        isCorrect: true
      }
    ],
    score: 2,
    totalQuestions: 4,
    correctAnswers: 2,
    incorrectAnswers: 2,
    percentage: 50,
    submittedAt: new Date(Date.now() - 7200000)
  });

  await QuizAttempt.create({
    student: student1._id,
    quiz: quiz2._id,
    quizTitle: quiz2.title,
    quizTopic: quiz2.topic,
    answers: [
      {
        questionIndex: 0,
        question: quiz2.questions[0].question,
        questionType: "mcq",
        selectedAnswer: "Re-route to manual exception lane for key-entry review",
        correctAnswer: quiz2.questions[0].answer,
        explanation: quiz2.questions[0].explanation,
        isCorrect: true
      },
      {
        questionIndex: 1,
        question: quiz2.questions[1].question,
        questionType: "true_false",
        selectedAnswer: "True",
        correctAnswer: quiz2.questions[1].answer,
        explanation: quiz2.questions[1].explanation,
        isCorrect: true
      }
    ],
    score: 2,
    totalQuestions: 2,
    correctAnswers: 2,
    incorrectAnswers: 0,
    percentage: 100,
    submittedAt: new Date(Date.now() - 1800000)
  });

  console.log("✔ Created Demo Student Attempts");
  console.log("\n=======================================================");
  console.log("🎉 DEMO SEEDING COMPLETED SUCCESSFULLY!");
  console.log("Teacher Login: demo.teacher@quizmind.ai / Password123!");
  console.log("Student Login: demo.student1@quizmind.ai / Password123!");
  console.log("=======================================================");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
