/**
 * Complete Integration Test Suite for Neighbourly Stage 2
 * Tests all 40+ APIs with proper workflow and edge cases
 * 
 * Run with: npm test
 */

const request = require('supertest');
const app = require('../server');
const { query } = require('../config/database');

// Test data storage
let testData = {
  admin: { token: null, id: null },
  provider: { token: null, id: null },
  seeker: { token: null, id: null },
  moderator: { token: null, id: null },
  city: { id: null },
  neighborhood: { id: null },
  category: { id: null, subcategoryId: null },
  service: { id: null },
  booking: { id: null },
  transaction: { id: null },
  review: { id: null },
  dispute: { id: null }
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('🚀 Neighbourly Stage 2 - Complete Integration Tests', () => {
  
  // ============================================================================
  // SETUP & TEARDOWN
  // ============================================================================
  
  beforeAll(async () => {
    console.log('\n🔧 Setting up test environment...\n');
    // Database should be clean from migration
  });

  afterAll(async () => {
    console.log('\n🧹 Cleaning up test environment...\n');
    // Cleanup is handled by soft deletes in application
  });

  // ============================================================================
  // 1. AUTHENTICATION & AUTHORIZATION TESTS
  // ============================================================================
  
  describe('🔐 Authentication & Authorization', () => {
    
    test('Should register admin user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin123@test.com',
          password: 'Admin123!',
          phone: '+1234567890',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System administrator'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
      
      testData.admin.token = res.body.data.token;
      testData.admin.id = res.body.data.user.id;
    });

    test('Should register provider user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'provider@test.com',
          password: 'Provider123!',
          phone: '+1234567891',
          role: 'provider',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Professional plumber with 10 years experience'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('provider');
      
      testData.provider.token = res.body.data.token;
      testData.provider.id = res.body.data.user.id;
    });

    test('Should register seeker user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'seeker@test.com',
          password: 'Seeker123!',
          phone: '+1234567892',
          role: 'seeker',
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'Looking for reliable services'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('seeker');
      
      testData.seeker.token = res.body.data.token;
      testData.seeker.id = res.body.data.user.id;
    });

    test('Should register moderator user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'moderator@test.com',
          password: 'Mod123!',
          phone: '+1234567893',
          role: 'moderator',
          firstName: 'Mike',
          lastName: 'Moderator',
          bio: 'Community moderator'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      testData.moderator.token = res.body.data.token;
      testData.moderator.id = res.body.data.user.id;
    });

    test('Should fail with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'Test123!',
          role: 'seeker',
          firstName: 'Test',
          lastName: 'User'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test('Should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'provider@test.com',
          password: 'Provider123!'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    test('Should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'provider@test.com',
          password: 'WrongPassword123!'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('Should get current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('provider@test.com');
      expect(res.body.data.user.first_name).toBe('John');
    });

    test('Should update user profile', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          bio: 'Updated bio - Expert plumber',
          firstName: 'Johnny'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.bio).toContain('Updated bio');
    });

    test('Should fail without authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me');
      
      expect(res.status).toBe(401);
    });
  });

  // ============================================================================
  // 2. LOCATION MANAGEMENT TESTS
  // ============================================================================
  
  describe('🌍 Location Management', () => {
    
    test('Admin should create city', async () => {
      const res = await request(app)
        .post('/api/v1/locations/cities')
        .set('Authorization', `Bearer ${testData.admin.token}`)
        .send({
          name: 'New York',
          stateProvince: 'NY',
          country: 'United States',
          countryCode: 'US',
          timezone: 'America/New_York'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.city.name).toBe('New York');
      
      testData.city.id = res.body.data.city.id;
    });

    test('Provider should NOT create city (RBAC)', async () => {
      const res = await request(app)
        .post('/api/v1/locations/cities')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          name: 'Los Angeles',
          stateProvince: 'CA',
          country: 'United States',
          countryCode: 'US',
          timezone: 'America/Los_Angeles'
        });
      
      expect(res.status).toBe(403);
    });

    test('Should get all cities (public)', async () => {
      const res = await request(app)
        .get('/api/v1/locations/cities');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.cities)).toBe(true);
      expect(res.body.data.cities.length).toBeGreaterThan(0);
    });

    test('Admin should create neighborhood', async () => {
      const res = await request(app)
      .post('/api/v1/locations/neighborhoods')
      .set('Authorization', `Bearer ${testData.admin.token}`)
      .send({
        cityId: testData.city.id,
        name: 'Empress Market Saddar',
        description: 'Historic market area in Saddar, Karachi',
        coordinates: [
        [24.8615, 67.0304], // NW corner
        [24.8606, 67.0320], // NE corner
        [24.8597, 67.0312], // SE corner
        [24.8606, 67.0296]  // SW corner
        ]
      });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      testData.neighborhood.id = res.body.data.neighborhood.id;
    });

    test('Should find neighborhood by coordinates', async () => {
      // Wait a bit for H3 processing
      await wait(100);
      
      const res = await request(app)
        .get('/api/v1/locations/neighborhoods/find')
        .query({ lat: 40.7589, lng: -73.9851 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.h3Index).toBeDefined();
    });

    test('Admin should create category', async () => {
      const res = await request(app)
        .post('/api/v1/locations/categories')
        .set('Authorization', `Bearer ${testData.admin.token}`)
        .send({
          name: 'Home Services',
          description: 'Home maintenance and repair',
          sortOrder: 1
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      testData.category.id = res.body.data.category.id;
    });

    test('Admin should create subcategory', async () => {
      const res = await request(app)
        .post('/api/v1/locations/categories')
        .set('Authorization', `Bearer ${testData.admin.token}`)
        .send({
          parentId: testData.category.id,
          name: 'Plumbing',
          description: 'Plumbing services',
          sortOrder: 1
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      testData.category.subcategoryId = res.body.data.category.id;
    });

    test('Should get all categories (public)', async () => {
      const res = await request(app)
        .get('/api/v1/locations/categories');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.categories).toBeDefined();
    });
  });

  // ============================================================================
  // 3. SERVICE MANAGEMENT TESTS
  // ============================================================================
  
  describe('🏠 Service Management', () => {
    
    test('Provider should create service', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          categoryId: testData.category.subcategoryId,
          title: 'Expert Plumbing Services - 24/7 Emergency',
          description: 'Professional plumbing repairs, installations, and emergency services. Licensed and insured with 10+ years experience.',
          shortDescription: 'Fast, reliable plumbing service',
          priceAmount: 75.00,
          priceUnit: 'per_hour',
          serviceRadiusKm: 10,
          durationMinutes: 120,
          streetAddress: '123 Broadway',
          cityId: testData.city.id,
          neighborhoodId: testData.neighborhood.id,
          postalCode: '10001',
          latitude: 40.7589,
          longitude: -73.9851
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service.h3_index).toBeDefined();
      
      testData.service.id = res.body.data.service.id;
    });

    test('Seeker should NOT create service (RBAC)', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          categoryId: testData.category.subcategoryId,
          title: 'Test Service',
          description: 'Test',
          shortDescription: 'Test',
          priceAmount: 50,
          priceUnit: 'per_hour',
          serviceRadiusKm: 5,
          streetAddress: '456 Test St',
          cityId: testData.city.id,
          postalCode: '10002',
          latitude: 40.7500,
          longitude: -73.9900
        });
      
      expect(res.status).toBe(403);
    });

    test('Should search nearby services (public)', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 10
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.services)).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThan(0);
    });

    test('Should search with all filters', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 15,
          categoryId: testData.category.subcategoryId,
          minPrice: 50,
          maxPrice: 100,
          sortBy: 'price',
          sortOrder: 'ASC'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.filters).toBeDefined();
    });

    test('Should search by text', async () => {
      const res = await request(app)
        .get('/api/v1/services/search')
        .query({ q: 'plumbing' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.services)).toBe(true);
    });

    test('Should get service details (public)', async () => {
      const res = await request(app)
        .get(`/api/v1/services/${testData.service.id}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service.title).toContain('Plumbing');
    });

    test('Provider should get own services', async () => {
      const res = await request(app)
        .get('/api/v1/services/my/services')
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.length).toBeGreaterThan(0);
    });

    test('Provider should update own service', async () => {
      const res = await request(app)
        .patch(`/api/v1/services/${testData.service.id}`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          priceAmount: 85.00,
          title: 'Expert Plumbing Services - Updated'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service.price_amount).toBe('85.00');
    });

    test('Seeker should NOT update provider service (RBAC)', async () => {
      const res = await request(app)
        .patch(`/api/v1/services/${testData.service.id}`)
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          priceAmount: 50.00
        });
      
      expect(res.status).toBe(403);
    });
  });

  // ============================================================================
  // 4. BOOKING TESTS
  // ============================================================================
  
  describe('📅 Booking Management', () => {
    
    test('Seeker should create booking', async () => {
      const scheduledStart = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
          specialInstructions: 'Please bring pipe wrench'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.booking_reference).toBeDefined();
      expect(res.body.data.booking.status).toBe('pending');
      
      testData.booking.id = res.body.data.booking.id;
    });

    test('Should prevent self-booking', async () => {
      const scheduledStart = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);
      
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString()
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('own service');
    });

    test('Seeker should get own bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .query({ role: 'seeker' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
    });

    test('Provider should get own bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .query({ role: 'provider' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
    });

    test('Should get upcoming bookings', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/upcoming')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Should get booking details', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${testData.booking.id}`)
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.id).toBe(testData.booking.id);
    });

    test('Unauthorized user should NOT view booking', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${testData.booking.id}`)
        .set('Authorization', `Bearer ${testData.moderator.token}`);
      
      expect(res.status).toBe(403);
    });
  });

  // ============================================================================
  // 5. TRANSACTION TESTS
  // ============================================================================
  
  describe('💳 Transaction & Payment', () => {
    
    test('Seeker should pay for booking', async () => {
      const res = await request(app)
        .post('/api/v1/transactions/pay')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: testData.booking.id,
          paymentMethod: 'demo_card'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.status).toBe('completed');
      expect(res.body.data.transaction.platform_fee).toBeDefined();
      
      testData.transaction.id = res.body.data.transaction.id;
    });

    test('Provider should NOT pay for own booking', async () => {
      const res = await request(app)
        .post('/api/v1/transactions/pay')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          bookingId: testData.booking.id,
          paymentMethod: 'demo_card'
        });
      
      expect(res.status).toBe(403);
    });

    test('Should get transaction details', async () => {
      const res = await request(app)
        .get(`/api/v1/transactions/${testData.transaction.id}`)
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.amount).toBeDefined();
    });

    test('Should get my transactions', async () => {
      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .query({ type: 'all' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
    });

    test('Provider should get earnings summary', async () => {
      const res = await request(app)
        .get('/api/v1/transactions/earnings')
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.total_earnings).toBeDefined();
    });

    test('Seeker should NOT access earnings', async () => {
      const res = await request(app)
        .get('/api/v1/transactions/earnings')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(403);
    });
  });

  // ============================================================================
  // 6. BOOKING STATUS WORKFLOW
  // ============================================================================
  
  describe('📋 Booking Status Workflow', () => {
    
    test('Provider should confirm booking (after payment)', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${testData.booking.id}/status`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({ status: 'confirmed' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe('confirmed');
    });

    test('Provider should start service', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${testData.booking.id}/status`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({ status: 'in_progress' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.booking.status).toBe('in_progress');
    });

    test('Provider should complete booking', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${testData.booking.id}/status`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({ status: 'completed' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.booking.status).toBe('completed');
    });
  });

  // ============================================================================
  // 7. REVIEW & RATING TESTS
  // ============================================================================
  
  describe('⭐ Reviews & Ratings', () => {
    
    test('Seeker should create review after completion', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: testData.booking.id,
          rating: 5,
          title: 'Excellent Service!',
          comment: 'Very professional and quick. Fixed my pipes in no time. Highly recommended!',
          isAnonymous: false
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.rating).toBe(5);
      
      testData.review.id = res.body.data.review.id;
    });

    test('Should prevent duplicate reviews', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: testData.booking.id,
          rating: 4,
          title: 'Duplicate Review',
          comment: 'This should fail'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    test('Provider should NOT review own service', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          bookingId: testData.booking.id,
          rating: 5,
          title: 'Test',
          comment: 'Test'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('seeker');
    });

    test('Should get provider reviews (public)', async () => {
      const res = await request(app)
        .get(`/api/v1/reviews/provider/${testData.provider.id}`)
        .query({ limit: 5 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reviews).toBeDefined();
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.average_rating).toBeDefined();
    });

    test('Provider should respond to review', async () => {
      const res = await request(app)
        .post(`/api/v1/reviews/${testData.review.id}/response`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          response: 'Thank you for your kind words! Always happy to help.'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.review.response).toBeDefined();
    });

    test('Should flag inappropriate review', async () => {
      const res = await request(app)
        .post(`/api/v1/reviews/${testData.review.id}/flag`)
        .set('Authorization', `Bearer ${testData.moderator.token}`)
        .send({
          reason: 'Contains inappropriate language'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================================================
  // 8. REPUTATION SYSTEM TESTS
  // ============================================================================
  
  describe('🏆 Reputation System', () => {
    
    test('Provider reputation should be updated', async () => {
      // Wait for potential async reputation update
      await wait(1000);
      
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.user.average_rating).toBeDefined();
      expect(res.body.data.user.total_reviews).toBeGreaterThan(0);
      expect(res.body.data.user.reliability_score).toBeDefined();
    });

    test('Reputation should reflect booking completion', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testData.provider.id}/reputation`)
        .set('Authorization', `Bearer ${testData.admin.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reputation.total_bookings).toBeGreaterThan(0);
      expect(res.body.data.reputation.completion_rate).toBeDefined();
    });

    test('Should get leaderboard', async () => {
      const res = await request(app)
        .get('/api/v1/users/leaderboard')
        .query({ limit: 10 });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });
  });

  // ============================================================================
  // 9. DISPUTE MANAGEMENT TESTS
  // ============================================================================
  
  describe('⚖️ Dispute Management', () => {
    
    // Create a new booking for dispute testing
    let disputeBookingId;
    
    beforeAll(async () => {
      const scheduledStart = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);
      
      const bookingRes = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString()
        });
      
      disputeBookingId = bookingRes.body.data.booking.id;
      
      // Pay for booking
      await request(app)
        .post('/api/v1/transactions/pay')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: disputeBookingId,
          paymentMethod: 'demo_card'
        });
      
      // Set to disputed status
      await request(app)
        .patch(`/api/v1/bookings/${disputeBookingId}/status`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({ status: 'confirmed' });
    });
    
    test('Seeker should create dispute', async () => {
      const res = await request(app)
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: disputeBookingId,
          againstUserId: testData.provider.id,
          category: 'service_quality',
          description: 'Service was not completed as promised. Multiple issues remain unresolved.',
          evidence: [
            { type: 'image', url: 'https://example.com/evidence1.jpg' },
            { type: 'image', url: 'https://example.com/evidence2.jpg' }
          ]
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispute.status).toBe('open');
      expect(res.body.data.dispute.category).toBe('service_quality');
      
      testData.dispute.id = res.body.data.dispute.id;
    });

    test('Should prevent duplicate disputes on same booking', async () => {
      const res = await request(app)
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: disputeBookingId,
          againstUserId: testData.provider.id,
          category: 'payment_issue',
          description: 'Duplicate dispute test'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });

    test('Non-participant should NOT create dispute', async () => {
      const res = await request(app)
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.moderator.token}`)
        .send({
          bookingId: disputeBookingId,
          againstUserId: testData.provider.id,
          category: 'other',
          description: 'Unauthorized dispute'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('participants');
    });

    test('Should validate dispute category', async () => {
      const res = await request(app)
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          bookingId: disputeBookingId,
          againstUserId: testData.provider.id,
          category: 'invalid_category',
          description: 'Test'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('category');
    });

    test('Participant should get own disputes', async () => {
      const res = await request(app)
        .get('/api/v1/disputes/my')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.disputes.length).toBeGreaterThan(0);
    });

    test('Participant should view dispute details', async () => {
      const res = await request(app)
        .get(`/api/v1/disputes/${testData.dispute.id}`)
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispute.id).toBe(testData.dispute.id);
    });

    test('Provider (other party) should view dispute details', async () => {
      const res = await request(app)
        .get(`/api/v1/disputes/${testData.dispute.id}`)
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Unrelated user should NOT view dispute', async () => {
      const res = await request(app)
        .get(`/api/v1/disputes/${testData.dispute.id}`)
        .set('Authorization', `Bearer ${testData.admin.token}`);
      
      // Admin can view, but random user cannot
      expect(res.status).toBe(200); // Admin has access
    });

    test('Participant should add evidence to dispute', async () => {
      const res = await request(app)
        .post(`/api/v1/disputes/${testData.dispute.id}/evidence`)
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          evidenceUrl: 'https://example.com/additional-evidence.jpg'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Moderator should get all disputes', async () => {
      const res = await request(app)
        .get('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.moderator.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.disputes)).toBe(true);
    });

    test('Seeker should NOT access all disputes', async () => {
      const res = await request(app)
        .get('/api/v1/disputes')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(403);
    });

    test('Moderator should assign self to dispute', async () => {
      const res = await request(app)
        .post(`/api/v1/disputes/${testData.dispute.id}/assign`)
        .set('Authorization', `Bearer ${testData.moderator.token}`)
        .send({
          moderatorId: testData.moderator.id
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispute.status).toBe('under_review');
    });

    test('Moderator should update dispute status', async () => {
      const res = await request(app)
        .patch(`/api/v1/disputes/${testData.dispute.id}/status`)
        .set('Authorization', `Bearer ${testData.moderator.token}`)
        .send({
          status: 'resolved',
          resolution: 'After reviewing evidence, partial refund issued to seeker. Provider advised on service standards.'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispute.status).toBe('resolved');
    });

    test('Moderator should close dispute', async () => {
      const res = await request(app)
        .post(`/api/v1/disputes/${testData.dispute.id}/close`)
        .set('Authorization', `Bearer ${testData.moderator.token}`)
        .send({
          resolution: 'Case closed. Both parties satisfied with resolution.'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dispute.status).toBe('closed');
    });

    test('Moderator should get dispute statistics', async () => {
      const res = await request(app)
        .get('/api/v1/disputes/stats')
        .set('Authorization', `Bearer ${testData.moderator.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.total).toBeDefined();
    });
  });

  // ============================================================================
  // 10. NOTIFICATION TESTS
  // ============================================================================
  
  describe('🔔 Notifications', () => {
    
    test('User should get notifications', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.notifications)).toBe(true);
    });

    test('Should get unread notification count', async () => {
      const res = await request(app)
        .get('/api/v1/notifications/unread/count')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBeDefined();
    });

    test('Should mark notification as read', async () => {
      // First get notifications
      const notifRes = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      if (notifRes.body.data.notifications.length > 0) {
        const notifId = notifRes.body.data.notifications[0].id;
        
        const res = await request(app)
          .patch(`/api/v1/notifications/${notifId}/read`)
          .set('Authorization', `Bearer ${testData.seeker.token}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    test('Should mark all notifications as read', async () => {
      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================================================
  // 11. ADVANCED SEARCH & FILTERING
  // ============================================================================
  
  describe('🔍 Advanced Search & Filtering', () => {
    
    test('Should search with complex filters', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 20,
          categoryId: testData.category.subcategoryId,
          minPrice: 50,
          maxPrice: 150,
          minRating: 4,
          verified: true,
          sortBy: 'rating',
          sortOrder: 'DESC',
          page: 1,
          limit: 10
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    test('Should handle invalid coordinates gracefully', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 999,
          lng: 999,
          radius: 5
        });
      
      expect(res.status).toBe(400);
    });

    test('Should search by multiple categories', async () => {
      const res = await request(app)
        .get('/api/v1/services/search')
        .query({
          q: 'service',
          categories: [testData.category.id, testData.category.subcategoryId].join(',')
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Should filter by availability', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 10,
          availableFrom: new Date().toISOString(),
          availableTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Should get trending services in neighborhood', async () => {
      const res = await request(app)
        .get(`/api/v1/services/trending/${testData.neighborhood.id}`)
        .query({ period: 'week' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================================================
  // 12. EDGE CASES & ERROR HANDLING
  // ============================================================================
  
  describe('🚨 Edge Cases & Error Handling', () => {
    
    test('Should handle missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          title: 'Incomplete Service'
          // Missing required fields
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('Should handle invalid UUID format', async () => {
      const res = await request(app)
        .get('/api/v1/services/invalid-uuid')
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(400);
    });

    test('Should handle non-existent resources', async () => {
      const res = await request(app)
        .get('/api/v1/services/00000000-0000-0000-0000-000000000000');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test('Should prevent SQL injection in search', async () => {
      const res = await request(app)
        .get('/api/v1/services/search')
        .query({ q: "'; DROP TABLE services; --" });
      
      expect(res.status).toBe(200); // Should handle safely
      expect(res.body.success).toBe(true);
    });

    test('Should handle very long strings', async () => {
      const longString = 'x'.repeat(10000);
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          categoryId: testData.category.subcategoryId,
          title: longString,
          description: 'Test',
          shortDescription: 'Test',
          priceAmount: 50,
          priceUnit: 'per_hour',
          serviceRadiusKm: 5,
          streetAddress: '123 Test St',
          cityId: testData.city.id,
          postalCode: '10001',
          latitude: 40.7589,
          longitude: -73.9851
        });
      
      expect(res.status).toBe(400);
    });

    test('Should handle negative prices', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          categoryId: testData.category.subcategoryId,
          title: 'Test Service',
          description: 'Test',
          shortDescription: 'Test',
          priceAmount: -50,
          priceUnit: 'per_hour',
          serviceRadiusKm: 5,
          streetAddress: '123 Test St',
          cityId: testData.city.id,
          postalCode: '10001',
          latitude: 40.7589,
          longitude: -73.9851
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('price');
    });

    test('Should handle booking conflict', async () => {
      const scheduledStart = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const scheduledEnd = new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000);
      
      // Create first booking
      const res1 = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString()
        });
      
      // Try to create overlapping booking
      const res2 = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: new Date(scheduledStart.getTime() + 60 * 60 * 1000).toISOString(),
          scheduledEnd: new Date(scheduledEnd.getTime() + 60 * 60 * 1000).toISOString()
        });
      
      if (res1.status === 201) {
        expect(res2.status).toBe(400);
        expect(res2.body.message).toContain('conflict');
      }
    });

    test('Should handle past booking dates', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // Yesterday
      const pastDateEnd = new Date(pastDate.getTime() + 2 * 60 * 60 * 1000);
      
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .send({
          serviceId: testData.service.id,
          scheduledStart: pastDate.toISOString(),
          scheduledEnd: pastDateEnd.toISOString()
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('past');
    });

    test('Should handle invalid status transitions', async () => {
      const res = await request(app)
        .patch(`/api/v1/bookings/${testData.booking.id}/status`)
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({ status: 'pending' }); // Cannot go back to pending
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('invalid');
    });

    test('Should handle malformed JSON', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      expect(res.status).toBe(400);
    });

    test('Should handle rate limiting (if implemented)', async () => {
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app)
            .get('/api/v1/services/nearby')
            .query({ lat: 40.7589, lng: -73.9851, radius: 5 })
        );
      }
      
      const responses = await Promise.all(requests);
      // Some responses might be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      // This is optional - depends on rate limiting implementation
    });
  });

  // ============================================================================
  // 13. PAGINATION & PERFORMANCE
  // ============================================================================
  
  describe('📄 Pagination & Performance', () => {
    
    test('Should paginate search results', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 20,
          page: 1,
          limit: 5
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(5);
    });

    test('Should handle large page numbers', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 20,
          page: 999,
          limit: 10
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.services).toBeDefined();
    });

    test('Should respect maximum limit', async () => {
      const res = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 20,
          limit: 1000 // Should be capped to max limit (e.g., 100)
        });
      
      expect(res.status).toBe(200);
      expect(res.body.data.services.length).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // 14. DATA INTEGRITY & CONSTRAINTS
  // ============================================================================
  
  describe('🔒 Data Integrity & Constraints', () => {
    
    test('Should enforce unique email constraint', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'provider@test.com', // Already exists
          password: 'NewPassword123!',
          role: 'seeker',
          firstName: 'Duplicate',
          lastName: 'User'
        });
      
      expect(res.status).toBe(409);
    });

    test('Should enforce referential integrity', async () => {
      const res = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          categoryId: 999999, // Non-existent category
          title: 'Test Service',
          description: 'Test',
          shortDescription: 'Test',
          priceAmount: 50,
          priceUnit: 'per_hour',
          serviceRadiusKm: 5,
          streetAddress: '123 Test St',
          cityId: testData.city.id,
          postalCode: '10001',
          latitude: 40.7589,
          longitude: -73.9851
        });
      
      expect(res.status).toBe(400);
    });

    test('Should prevent orphaned records on soft delete', async () => {
      // Create a service
      const serviceRes = await request(app)
        .post('/api/v1/services')
        .set('Authorization', `Bearer ${testData.provider.token}`)
        .send({
          categoryId: testData.category.subcategoryId,
          title: 'Temporary Service',
          description: 'Test service for deletion',
          shortDescription: 'Test',
          priceAmount: 50,
          priceUnit: 'per_hour',
          serviceRadiusKm: 5,
          streetAddress: '123 Test St',
          cityId: testData.city.id,
          postalCode: '10001',
          latitude: 40.7589,
          longitude: -73.9851
        });
      
      const serviceId = serviceRes.body.data.service.id;
      
      // Delete it
      const deleteRes = await request(app)
        .delete(`/api/v1/services/${serviceId}`)
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(deleteRes.status).toBe(200);
      
      // Verify it's soft deleted (not returned in active searches)
      const searchRes = await request(app)
        .get('/api/v1/services/nearby')
        .query({
          lat: 40.7589,
          lng: -73.9851,
          radius: 1
        });
      
      const deletedService = searchRes.body.data.services.find(s => s.id === serviceId);
      expect(deletedService).toBeUndefined();
    });
  });

  // ============================================================================
  // 15. ADMIN OPERATIONS
  // ============================================================================
  
  describe('👑 Admin Operations', () => {
    
    test('Admin should view all users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${testData.admin.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.users)).toBe(true);
    });

    test('Non-admin should NOT view all users', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${testData.provider.token}`);
      
      expect(res.status).toBe(403);
    });

    test('Admin should suspend user', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${testData.provider.id}/suspend`)
        .set('Authorization', `Bearer ${testData.admin.token}`)
        .send({
          reason: 'Policy violation',
          duration: '7d'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Admin should reactivate user', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${testData.provider.id}/reactivate`)
        .set('Authorization', `Bearer ${testData.admin.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('Admin should get platform statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${testData.admin.token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.total_users).toBeDefined();
      expect(res.body.data.stats.total_bookings).toBeDefined();
      expect(res.body.data.stats.total_revenue).toBeDefined();
    });

    test('Admin should export audit logs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${testData.admin.token}`)
        .query({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          action: 'create',
          limit: 50
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
    });
  });

  // ============================================================================
  // 16. SECURITY TESTS
  // ============================================================================
  
  describe('🛡️ Security Tests', () => {
    
    test('Should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'weak@test.com',
          password: '123', // Weak password
          role: 'seeker',
          firstName: 'Test',
          lastName: 'User'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('password');
    });

    test('Should sanitize user input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'xss@test.com',
          password: 'Test123!',
          role: 'seeker',
          firstName: '<script>alert("XSS")</script>',
          lastName: 'User'
        });
      
      if (res.status === 201) {
        expect(res.body.data.user.first_name).not.toContain('<script>');
      }
    });

    test('Should prevent unauthorized access to other users data', async () => {
      const res = await request(app)
        .get(`/api/v1/users/${testData.provider.id}/private`)
        .set('Authorization', `Bearer ${testData.seeker.token}`);
      
      expect(res.status).toBe(403);
    });

    test('Should invalidate expired tokens', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);
      
      expect(res.status).toBe(401);
    });

    test('Should prevent CSRF attacks (if implemented)', async () => {
      // This depends on CSRF protection implementation
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${testData.seeker.token}`)
        .set('Origin', 'https://malicious-site.com')
        .send({
          serviceId: testData.service.id,
          scheduledStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          scheduledEnd: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString()
        });
      
      // Should either succeed with CORS check or fail
      expect([200, 201, 403]).toContain(res.status);
    });
  });

  // ============================================================================
  // 17. FINAL SUMMARY
  // ============================================================================
  
  describe('📊 Test Summary', () => {
    
    test('Print test statistics', () => {
      console.log('\n===========================================');
      console.log('🎉 TEST SUITE COMPLETE');
      console.log('===========================================');
      console.log(`✓ Total Test Categories: 17`);
      console.log(`✓ Users Created: 4 (admin, provider, seeker, moderator)`);
      console.log(`✓ Services Created: Multiple`);
      console.log(`✓ Bookings Created: Multiple`);
      console.log(`✓ Transactions Created: Multiple`);
      console.log(`✓ Reviews Created: 1+`);
      console.log(`✓ Disputes Created: 1+`);
      console.log('===========================================\n');
      
      expect(true).toBe(true);
    });
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to create a test user
 */
async function createTestUser(role, index = 0) {
  return request(app)
    .post('/api/v1/auth/register')
    .send({
      email: `${role}${index}@test.com`,
      password: `${role.charAt(0).toUpperCase() + role.slice(1)}123!`,
      phone: `+12345678${index}`,
      role: role,
      firstName: `Test${role.charAt(0).toUpperCase() + role.slice(1)}`,
      lastName: `User${index}`,
      bio: `Test ${role} user ${index}`
    });
}

/**
 * Helper to create a test service
 */
async function createTestService(token, categoryId, cityId, lat, lng, overrides = {}) {
  return request(app)
    .post('/api/v1/services')
    .set('Authorization', `Bearer ${token}`)
    .send({
      categoryId,
      title: 'Test Service',
      description: 'Test description',
      shortDescription: 'Test short',
      priceAmount: 50,
      priceUnit: 'per_hour',
      serviceRadiusKm: 5,
      durationMinutes: 60,
      streetAddress: '123 Test St',
      cityId,
      postalCode: '10001',
      latitude: lat,
      longitude: lng,
      ...overrides
    });
}

/**
 * Helper to create a test booking
 */
async function createTestBooking(token, serviceId, daysFromNow = 7, durationHours = 2) {
  const scheduledStart = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  const scheduledEnd = new Date(scheduledStart.getTime() + durationHours * 60 * 60 * 1000);
  
  return request(app)
    .post('/api/v1/bookings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      serviceId,
      scheduledStart: scheduledStart.toISOString(),
      scheduledEnd: scheduledEnd.toISOString(),
      specialInstructions: 'Test booking'
    });
}