/**
 * Demo reviews for development / testing only.
 * Used as fallback when no real reviews are available from backend.
 */

export const SAMPLE_REVIEWS = [
  {
    id: 1,
    rating: 5,
    title: "Excellent service!",
    comment: "Very professional and thorough. Completed the work faster than expected. Highly recommend!",
    reviewerName: "Sarah M.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: 2,
    rating: 4,
    title: "Great work, very reliable",
    comment: "Did a fantastic job. Communication was clear and the work was done to a high standard. Will book again.",
    reviewerName: "Michael T.",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
  },
  {
    id: 3,
    rating: 5,
    title: "Highly professional",
    comment: "Arrived on time, very courteous, and did excellent work. Best service I've received in this category.",
    reviewerName: "Jessica L.",
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days ago
  },
  {
    id: 4,
    rating: 4,
    title: "Good value for money",
    comment: "Quality work at a fair price. No complaints. Would definitely use this service again.",
    reviewerName: "David K.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
  {
    id: 5,
    rating: 5,
    title: "Perfect attention to detail",
    comment: "Really pays attention to the little things. The level of care and professionalism was outstanding.",
    reviewerName: "Emma R.",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  },
];
