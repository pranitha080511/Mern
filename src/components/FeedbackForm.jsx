import React, { useState } from 'react';
import { Star, Camera, X, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function FeedbackForm({ order, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB');
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) { setError('Please select a rating'); return; }
    if (!comment.trim()) { setError('Please write your feedback'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('orderNumericId', order.orderId);
      formData.append('rating', rating);
      formData.append('comment', comment.trim());
      if (photo) formData.append('photo', photo);

      const data = await api.post('/api/feedback', formData);

      setSuccess(true);
      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: 48, maxWidth: 420, width: '100%',
            textAlign: 'center', color: '#f8f4f0',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 36,
            boxShadow: '0 0 30px rgba(16,185,129,0.4)',
          }}>🎉</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Thank You!</h3>
          <p style={{ color: 'rgba(248,244,240,0.6)', fontSize: 14, marginBottom: 6 }}>
            Your feedback has been submitted successfully.
          </p>
          <p style={{ color: 'rgba(248,244,240,0.4)', fontSize: 12, marginBottom: 24 }}>
            We appreciate your review for Order #{order.orderId}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <span key={s} style={{ fontSize: 24, color: s <= rating ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}>★</span>
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #ec4899, #7c3aed)',
              border: 'none', color: 'white', padding: '12px 32px',
              borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(236,72,153,0.3)',
            }}
          >Close</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,8,20,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1525 0%, #0f0c1a 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 20, width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto', color: '#f8f4f0', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #e11d8c)',
          borderRadius: '20px 20px 0 0', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>PRODUCT REVIEW</p>
            <h2 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800 }}>Order #{order.orderId}</h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>

          {/* Products summary */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: 16, marginBottom: 24,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(248,244,240,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              Products Received
            </p>
            {order.products.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: 'rgba(248,244,240,0.8)' }}>{p.name} <span style={{ color: 'rgba(248,244,240,0.4)' }}>×{p.quantity}</span></span>
                <span style={{ color: '#f9a8d4', fontWeight: 700 }}>₹{p.price * p.quantity}</span>
              </div>
            ))}
          </div>

          {/* Star Rating */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(248,244,240,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              How would you rate your experience?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 36, padding: 4, transition: 'transform 0.15s',
                    transform: (hoveredRating >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                    filter: (hoveredRating >= star || rating >= star) ? 'none' : 'grayscale(1) opacity(0.3)',
                  }}
                >⭐</button>
              ))}
            </div>
            {rating > 0 && (
              <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(248,244,240,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Your Feedback
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Share your experience with the product... How was the quality? Packaging? Would you recommend it?"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12,
                padding: 14, color: '#f8f4f0', fontSize: 14, resize: 'vertical',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                minHeight: 100,
              }}
              onFocus={e => e.target.style.borderColor = '#ec4899'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
            />
            <p style={{ textAlign: 'right', fontSize: 11, color: 'rgba(248,244,240,0.3)', marginTop: 4 }}>
              {comment.length}/1000
            </p>
          </div>

          {/* Photo Upload */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(248,244,240,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              📷 Upload Product Photo (Optional)
            </label>

            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: '100%', maxHeight: 200, objectFit: 'cover',
                    borderRadius: 12, border: '2px solid rgba(236,72,153,0.3)',
                  }}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(239,68,68,0.9)', border: 'none',
                    color: 'white', borderRadius: '50%', width: 28, height: 28,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                ><X size={14} /></button>
                <p style={{ fontSize: 11, color: 'rgba(248,244,240,0.4)', marginTop: 6 }}>{photo.name} ({(photo.size / 1024 / 1024).toFixed(1)}MB)</p>
              </div>
            ) : (
              <label
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '28px 20px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '2px dashed rgba(255,255,255,0.12)',
                  borderRadius: 14, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.background = 'rgba(236,72,153,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >
                <Camera size={28} style={{ color: 'rgba(248,244,240,0.4)' }} />
                <span style={{ color: 'rgba(248,244,240,0.5)', fontSize: 13, fontWeight: 600 }}>Click to upload a photo</span>
                <span style={{ color: 'rgba(248,244,240,0.3)', fontSize: 11 }}>JPG, PNG, WEBP • Max 5MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', borderRadius: 12, padding: '10px 16px',
              fontSize: 13, fontWeight: 600, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 24px',
              background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #ec4899, #7c3aed)',
              border: 'none', color: 'white', borderRadius: 14,
              fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 4px 24px rgba(236,72,153,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'feedbackSpin 0.6s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <><Send size={16} /> Submit Feedback</>
            )}
          </button>
        </form>

        <style>{`
          @keyframes feedbackSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
