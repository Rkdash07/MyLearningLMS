import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import '../courses/Courses.css';
import './Player.css';

function CoursePlayerPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [activeLecture, setActiveLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/progress/${courseId}`);
        const data = res.data?.data;
        setCourse(data.courseDetails);
        setProgress(data.progress || []);
        setCompletion(data.completionPercentage || 0);
        setActiveLecture(
          data.courseDetails?.lectures?.[0] || null
        );
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [courseId]);

  const isLectureCompleted = (lectureId) =>
    progress.some((p) => p.lecture === lectureId && p.isCompleted);

  const markCompleted = async (lectureId) => {
    try {
      const res = await api.patch(
        `/progress/${courseId}/lectures/${lectureId}`
      );
      setProgress(res.data?.data?.lectureProgress || []);
      const completedItems = res.data?.data?.lectureProgress?.filter(
        (l) => l.isCompleted
      ).length;
      const total = course?.lectures?.length || 1;
      setCompletion(Math.round((completedItems / total) * 100));
    } catch {
      // ignore for now
    }
  };

  if (loading) return <div className="page">Loading player…</div>;
  if (error)
    return (
      <div className="page">
        <div className="error">{error}</div>
      </div>
    );

  return (
    <div className="player-shell">
      <div className="player-main">
        <div className="player-video">
          {activeLecture ? (
            activeLecture.videoUrl?.includes('cloudinary') ? (
              <video
                key={activeLecture._id}
                controls
                style={{ width: '100%', height: '100%' }}
                src={activeLecture.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                title={activeLecture.title}
                src={activeLecture.videoUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%' }}
              />
            )
          ) : (
            <div className="muted small" style={{ padding: '40px', textAlign: 'center' }}>
              Select a lecture to start.
            </div>
          )}
        </div>
        {activeLecture && (
          <div className="player-controls">
            <div>
              <h2>{activeLecture.title}</h2>
              <p className="muted tiny">
                {activeLecture.duration} min
              </p>
            </div>
            {!isLectureCompleted(activeLecture._id) && (
              <button
                className="btn-primary"
                onClick={() => markCompleted(activeLecture._id)}
              >
                Mark as completed
              </button>
            )}
          </div>
        )}
      </div>
      <aside className="player-sidebar">
        <div className="player-header">
          <h3>{course?.title}</h3>
          <p className="muted tiny">Progress: {completion}%</p>
        </div>
        <div className="player-lectures">
          {(course?.lectures || []).map((lecture) => (
            <button
              key={lecture._id}
              className={`player-lecture ${
                activeLecture?._id === lecture._id ? 'active' : ''
              } ${isLectureCompleted(lecture._id) ? 'done' : ''}`}
              onClick={() => setActiveLecture(lecture)}
            >
              <div>
                <span>{lecture.title}</span>
                <span className="muted tiny">
                  {lecture.duration} min
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default CoursePlayerPage;


