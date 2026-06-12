"use client";

import { useActionState, useState, useEffect } from "react";
import { submitExamAction } from "@/server/actions/certification.actions";
import { Button, Card, CardContent } from "@/components/ui";

interface ExamQuestion {
  question: string;
  options: string[];
}

const EXAM_MINUTES = 30;

export default function ExamClient({
  certificationId,
  questions,
  slug,
}: {
  certificationId: string;
  questions: ExamQuestion[];
  slug: string;
}) {
  const [state, action, isPending] = useActionState(submitExamAction, {});
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60);

  useEffect(() => {
    if (state.success) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [state.success]);

  const fmt = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const answered = answers.filter((a) => a !== null).length;

  if (state.success) {
    return (
      <Card>
        <CardContent className="pt-10 pb-10 text-center">
          <div className={`text-6xl mb-4 ${state.passed ? "" : "grayscale"}`}>
            {state.passed ? "🏆" : "📋"}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {state.passed ? "Certification Earned!" : "Not Passed"}
          </h2>
          <p className="text-gray-500 mb-1">
            Score:{" "}
            <span className={`font-bold text-lg ${state.passed ? "text-green-600" : "text-red-600"}`}>
              {state.score}%
            </span>
          </p>
          {!state.passed && (
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Review the material and retake when ready.
            </p>
          )}
          <a
            href={`/dashboard/certifications/${slug}`}
            className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            {state.passed ? "View Certification" : "Back"}
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Timer bar */}
      <div
        className={`flex items-center justify-between mb-6 p-4 rounded-lg border ${
          timeLeft < 300
            ? "bg-red-50 border-red-200"
            : "bg-gray-50 border-gray-200"
        }`}
      >
        <span className="text-sm font-medium text-gray-700">
          {answered}/{questions.length} answered
        </span>
        <span
          className={`text-xl font-bold tabular-nums ${
            timeLeft < 300 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {fmt(timeLeft)}
        </span>
      </div>

      {state.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={action}>
        <input type="hidden" name="certificationId" value={certificationId} />
        <input
          type="hidden"
          name="answers"
          value={JSON.stringify(answers.map((a) => a ?? -1))}
        />

        <div className="space-y-5">
          {questions.map((q, qi) => (
            <Card key={qi}>
              <CardContent className="pt-5">
                <p className="font-medium text-gray-900 mb-4">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[qi] === oi
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                          answers[qi] === oi
                            ? "border-indigo-500"
                            : "border-gray-300"
                        }`}
                      >
                        {answers[qi] === oi && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{opt}</span>
                      <input
                        type="radio"
                        name={`q_${qi}`}
                        value={oi}
                        checked={answers[qi] === oi}
                        onChange={() =>
                          setAnswers((prev) => {
                            const next = [...prev];
                            next[qi] = oi;
                            return next;
                          })
                        }
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            loading={isPending}
            disabled={answered < questions.length || isPending || timeLeft === 0}
          >
            Submit Exam
          </Button>
          <a
            href={`/dashboard/certifications/${slug}`}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
