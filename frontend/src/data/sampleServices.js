/**
 * Demo services for development / testing only.
 * Shape supports both camelCase and snake_case (and some UPPER) used across the app.
 */

const PROVIDER_ID = 1; // Sample Provider from sampleUsers.js

export const SAMPLE_SERVICES = [
  {
    id: 101,
    ID: 101,
    title: "Handyman & Repairs",
    TITLE: "Handyman & Repairs",
    description: "Fixing things around the house: furniture assembly, small repairs, hanging shelves, and general handyman work. Same-day slots available.",
    DESCRIPTION: "Fixing things around the house: furniture assembly, small repairs, hanging shelves, and general handyman work. Same-day slots available.",
    category: { name: "Home Repair" },
    category_name: "Home Repair",
    CATEGORY: "Home Repair",
    price_amount: 45,
    priceAmount: 45,
    price_unit: "hr",
    priceUnit: "hr",
    duration_minutes: 60,
    durationMinutes: 60,
    provider_id: PROVIDER_ID,
    AUTHORID: PROVIDER_ID,
    neighborhood_name: "Downtown",
    serviceRadiusKm: 5,
    images: ["https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80"],
  },
  {
    id: 102,
    ID: 102,
    title: "Tutoring – Math & Science",
    TITLE: "Tutoring – Math & Science",
    description: "K–12 and college math and science tutoring. Patient, experienced. In-person or online.",
    DESCRIPTION: "K–12 and college math and science tutoring. Patient, experienced. In-person or online.",
    category: { name: "Education" },
    category_name: "Education",
    CATEGORY: "Education",
    price_amount: 55,
    priceAmount: 55,
    price_unit: "hr",
    priceUnit: "hr",
    duration_minutes: 60,
    durationMinutes: 60,
    provider_id: PROVIDER_ID,
    AUTHORID: PROVIDER_ID,
    neighborhood_name: "Riverside",
    serviceRadiusKm: 10,
    images: ["https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"],
  },
  {
    id: 103,
    ID: 103,
    title: "Pet Sitting & Walks",
    TITLE: "Pet Sitting & Walks",
    description: "Dog walking, pet sitting, and drop-in visits. Reliable and caring. Flexible schedule.",
    DESCRIPTION: "Dog walking, pet sitting, and drop-in visits. Reliable and caring. Flexible schedule.",
    category: { name: "Pets" },
    category_name: "Pets",
    CATEGORY: "Pets",
    price_amount: 25,
    priceAmount: 25,
    price_unit: "hr",
    priceUnit: "hr",
    duration_minutes: 60,
    durationMinutes: 60,
    provider_id: PROVIDER_ID,
    AUTHORID: PROVIDER_ID,
    neighborhood_name: "West End",
    serviceRadiusKm: 3,
    images: ["https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80"],
  },
  {
    id: 104,
    ID: 104,
    title: "Yard Work & Gardening",
    TITLE: "Yard Work & Gardening",
    description: "Lawn mowing, weeding, pruning, and light landscaping. Tools provided. Weekly or one-off.",
    DESCRIPTION: "Lawn mowing, weeding, pruning, and light landscaping. Tools provided. Weekly or one-off.",
    category: { name: "Garden" },
    category_name: "Garden",
    CATEGORY: "Garden",
    price_amount: 40,
    priceAmount: 40,
    price_unit: "hr",
    priceUnit: "hr",
    duration_minutes: 90,
    durationMinutes: 90,
    provider_id: PROVIDER_ID,
    AUTHORID: PROVIDER_ID,
    neighborhood_name: "Northside",
    serviceRadiusKm: 8,
    images: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80"],
  },
];

/**
 * Get all sample services. For dev only.
 * @returns {Array}
 */
export const getSampleServices = () => [...SAMPLE_SERVICES];

/**
 * Get one sample service by id. For dev only.
 * @param {number} id
 * @returns {object | null}
 */
export const getSampleServiceById = (id) => {
  const numId = Number(id);
  if (Number.isNaN(numId)) return null;
  return SAMPLE_SERVICES.find((s) => s.id === numId || s.ID === numId) ?? null;
};
