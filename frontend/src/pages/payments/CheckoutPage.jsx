import React from 'react';
import { useParams } from 'react-router-dom';

// Stripe/Razorpay redirection happens from CourseDetailsPage.
// This page can show a friendly message or handle additional flows if needed.

function CheckoutPage() {
  const { courseId } = useParams();
  return (
    <div className="page">
      <h1>Completing your purchase…</h1>
      <p className="muted">
        If you are not redirected automatically, please go back to the course
        page and try again. Course ID: {courseId}
      </p>
    </div>
  );
}

export default CheckoutPage;


