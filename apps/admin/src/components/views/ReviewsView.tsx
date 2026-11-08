import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Plus,
  ThumbsUp,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import { ReviewItem } from '../../types';

interface ReviewsViewProps {
  reviews: ReviewItem[];
  stats: { rating: number; totalReviews: number };
  onAddReview: (review: {
    name: string;
    time: string;
    rating: number;
    text: string;
    verified: boolean;
    location: string;
  }) => Promise<void>;
  onDeleteReview: (id: string) => Promise<void>;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  stats,
  onAddReview,
  onDeleteReview,
}) => {
  const [name, setName] = useState('');
  const [time, setTime] = useState('Recently');
  const [rating, setRating] = useState('5');
  const [text, setText] = useState('');
  const [location, setLocation] = useState('Borella Rd Store');
  const [verified, setVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    setIsSubmitting(true);
    await onAddReview({
      name: name.trim(),
      time: time.trim(),
      rating: Number(rating),
      text: text.trim(),
      verified,
      location: location.trim(),
    });
    setName('');
    setText('');
    setIsSubmitting(false);
  };

  return (
    <div className="content">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1>Google & Storefront Reviews</h1>
          <p>Manage customer testimonials displayed on DWstore.lk homepage and product pages.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="row g-3 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Star size={20} fill="currentColor" />
            </span>
            <div>
              <small>Average Rating</small>
              <b>{stats.rating || 4.9} / 5.0</b>
              <span className="ms-note up">Google Maps Verified</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#ecf6ef', color: '#059669' }}>
              <ThumbsUp size={20} />
            </span>
            <div>
              <small>Total Feedback</small>
              <b>{stats.totalReviews || reviews.length}</b>
              <span className="ms-note up">100% Genuine</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#eef2fd', color: '#4f46e5' }}>
              <CheckCircle2 size={20} />
            </span>
            <div>
              <small>Verified Purchases</small>
              <b>96%</b>
              <span className="ms-note up">Borella Showroom</span>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card-x ms-card">
            <span className="ico" style={{ background: '#f6eff6', color: '#9333ea' }}>
              <MapPin size={20} />
            </span>
            <div>
              <small>Showroom Hub</small>
              <b>Colombo 08</b>
              <span className="ms-note">Borella Main Road</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-column layout */}
      <div className="row g-4">
        {/* Left Column: Add Review Form */}
        <div className="col-12 col-xl-5">
          <div className="card-x">
            <div className="card-head">
              <h5>Add New Verified Review</h5>
            </div>
            <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
              Publish customer feedback received via Google Maps, WhatsApp, or in-store purchases to the live storefront.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  placeholder="e.g. Sisira Ranasinghe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Rating Stars
                  </label>
                  <select
                    className="sel-x w-100"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Time Tag
                  </label>
                  <input
                    type="text"
                    className="w-100 p-2 rounded-2"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    placeholder="e.g. 2 days ago"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Store Location / Source
                </label>
                <input
                  type="text"
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="d-block mb-1 text-muted" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Review Text / Comment *
                </label>
                <textarea
                  rows={4}
                  className="w-100 p-2 rounded-2"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  placeholder="Super Quality Genuine Product! Fast delivery and friendly warranty support..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex align-items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="verifiedReview"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                />
                <label htmlFor="verifiedReview" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  Mark as <b>Verified Buyer</b> (Adds green checkmark badge)
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-dark-x w-100 justify-content-center"
                style={{ height: '42px' }}
              >
                <Plus size={16} /> Publish to Storefront
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Published Reviews List */}
        <div className="col-12 col-xl-7">
          <div className="card-x">
            <div className="card-head">
              <div>
                <h5>Published Reviews ({reviews.length})</h5>
                <small className="text-muted">Directly synced with `/api/reviews`</small>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-3"
                  style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
                >
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <b>{rev.name}</b>
                        {rev.verified && (
                          <span
                            className="badge-x s-Delivered"
                            style={{ fontSize: '11px', padding: '1px 7px' }}
                          >
                            Verified Buyer
                          </span>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted mt-1" style={{ fontSize: '12px' }}>
                        <span className="d-flex text-warning">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </span>
                        <span>•</span>
                        <Clock size={12} /> {rev.time}
                        <span>•</span>
                        <MapPin size={12} /> {rev.location}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-btn text-danger"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => onDeleteReview(rev.id)}
                      title="Delete Review"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="m-0" style={{ fontSize: '13px', color: 'var(--text)' }}>
                    "{rev.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
