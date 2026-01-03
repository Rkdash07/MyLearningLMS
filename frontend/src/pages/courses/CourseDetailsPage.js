import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import './Courses.css';

function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/purchase/course/${courseId}/detail-with-status`);
        setData(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [courseId]);

  const handleStartOrBuy = async () => {
    if (!data) return;
    if (data.isPurchased) {
      navigate(`/learning/${courseId}`);
      return;
    }
    setBuying(true);
    try {
      const res = await api.post('/purchase/checkout/create-checkout-session', {
        courseId,
      });
      const url = res.data?.data?.checkoutUrl;
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout');
      setBuying(false);
    }
  };

  if (loading) return <div className="page">Loading course…</div>;
  if (error)
    return (
      <div className="page">
        <div className="error">{error}</div>
      </div>
    );

  const { course, isPurchased } = data || {};

  return (
    <div className="page">
      <div className="course-hero">
        <div>
          <h1>{course?.title}</h1>
          <p className="muted">{course?.description || course?.subtitle}</p>
          <p className="muted tiny">
            {course?.category} • {course?.level}
          </p>
        </div>
        <div className="course-hero-side">
          <p className="price-lg">₹ {course?.price}</p>
          <button
            className="btn-primary"
            onClick={handleStartOrBuy}
            disabled={buying}
          >
            {isPurchased ? 'Continue learning' : buying ? 'Redirecting…' : 'Buy course'}
          </button>
        </div>
      </div>

      <section className="section">
        <h2>Curriculum</h2>
        <div className="lectures">
          {(course?.lectures || []).map((lecture, idx) => (
            <div key={lecture._id || idx} className="lecture-row">
              <span>{lecture.title}</span>
              <span className="muted tiny">
                {lecture.isPreview ? 'Preview' : 'Lesson'} • {lecture.duration} min
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default CourseDetailsPage;


