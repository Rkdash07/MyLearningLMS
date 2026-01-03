import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import '../courses/Courses.css';

function InstructorCourseEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('beginner');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [lectures, setLectures] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddLecture, setShowAddLecture] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDescription, setLectureDescription] = useState('');
  const [lectureVideo, setLectureVideo] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [addingLecture, setAddingLecture] = useState(false);

  const isNewCourse = !courseId || courseId === 'new';

  useEffect(() => {
    async function fetchCourse() {
      if (isNewCourse) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/course/c/${courseId}`);
        const c = res.data?.data;
        setCourse(c);
        setTitle(c.title || '');
        setSubtitle(c.subtitle || '');
        setDescription(c.description || '');
        setPrice(c.price || '');
        setCategory(c.category || '');
        setLevel(c.level || 'beginner');
        setThumbnailPreview(c.thumbnail || '');
        
        // Fetch lectures
        const lecturesRes = await api.get(`/course/c/${courseId}/lectures`);
        setLectures(lecturesRes.data?.data?.lectures || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [courseId, isNewCourse]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('level', level);
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      if (isNewCourse) {
        const res = await api.post('/course', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        navigate(`/instructor/courses/${res.data?.data?._id}`);
      } else {
        await api.patch(`/course/c/${courseId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setError('');
        alert('Course saved successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureTitle || !lectureVideo) {
      setError('Lecture title and video are required');
      return;
    }
    setAddingLecture(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', lectureTitle);
      formData.append('description', lectureDescription);
      formData.append('isPreview', isPreview);
      formData.append('video', lectureVideo);

      const res = await api.post(`/course/c/${courseId}/lectures`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setLectures([...lectures, res.data?.data]);
      setLectureTitle('');
      setLectureDescription('');
      setLectureVideo(null);
      setIsPreview(false);
      setShowAddLecture(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lecture');
    } finally {
      setAddingLecture(false);
    }
  };

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{isNewCourse ? 'Create course' : 'Edit course'}</h1>
          <p>Update basic details and manage curriculum.</p>
        </div>
      </div>
      <form className="section" onSubmit={handleSave}>
        <div className="auth-field">
          <span>Title *</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <span>Subtitle</span>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
        <div className="auth-field">
          <span>Category *</span>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required={!isNewCourse}
            placeholder="e.g., Web Development, Data Science"
          />
        </div>
        <div className="auth-field">
          <span>Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="auth-field">
          <span>Price (₹) *</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>
        <div className="auth-field">
          <span>Thumbnail {isNewCourse ? '*' : ''}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            required={isNewCourse}
          />
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Thumbnail preview"
              style={{ maxWidth: '200px', marginTop: '10px', borderRadius: '4px' }}
            />
          )}
        </div>
        {error && <div className="error">{error}</div>}
        <button
          className="btn-primary"
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving…' : isNewCourse ? 'Create course' : 'Save changes'}
        </button>
      </form>

      {!isNewCourse && (
        <section className="section">
          <div className="page-header">
            <div>
              <h2>Lectures</h2>
              <p>Manage course curriculum and lectures.</p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setShowAddLecture(!showAddLecture)}
            >
              {showAddLecture ? 'Cancel' : 'Add Lecture'}
            </button>
          </div>

          {showAddLecture && (
            <form onSubmit={handleAddLecture} className="section" style={{ marginTop: '20px', border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
              <div className="auth-field">
                <span>Lecture Title *</span>
                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  required
                />
              </div>
              <div className="auth-field">
                <span>Description</span>
                <textarea
                  value={lectureDescription}
                  onChange={(e) => setLectureDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="auth-field">
                <span>Video File *</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setLectureVideo(e.target.files[0])}
                  required
                />
              </div>
              <div className="auth-field">
                <label>
                  <input
                    type="checkbox"
                    checked={isPreview}
                    onChange={(e) => setIsPreview(e.target.checked)}
                  />
                  <span style={{ marginLeft: '8px' }}>Make this a preview lecture</span>
                </label>
              </div>
              <button
                className="btn-primary"
                type="submit"
                disabled={addingLecture}
              >
                {addingLecture ? 'Adding…' : 'Add Lecture'}
              </button>
            </form>
          )}

          <div className="lectures" style={{ marginTop: '20px' }}>
            {lectures.length === 0 ? (
              <p className="muted">No lectures yet. Add your first lecture to get started.</p>
            ) : (
              lectures.map((lecture, idx) => (
                <div key={lecture._id || idx} className="lecture-row">
                  <div>
                    <span>{lecture.title}</span>
                    {lecture.description && (
                      <p className="muted tiny" style={{ marginTop: '4px' }}>
                        {lecture.description}
                      </p>
                    )}
                  </div>
                  <div>
                    <span className="muted tiny">
                      {lecture.isPreview ? 'Preview' : 'Lesson'} • {lecture.duration || 0} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default InstructorCourseEditorPage;


