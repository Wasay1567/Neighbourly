# Neighbourly - Stage 2: Multi-City Network (COMPLETE)

A hyper-local marketplace backend with **40+ APIs**, H3 geospatial search, RBAC, custom reputation algorithm, and complete transaction system.

https://github.com/Wasay1567/neighbourly.git
branches:
stage-2
stage-2-frontend
stage-1

## 🎯 What's Included

### ✅ Complete Feature Set
- **Authentication & Authorization**: JWT + RBAC with 4 roles
- **Service Management**: Create, search, filter with H3 geospatial
- **Booking System**: Full lifecycle from request to completion
- **Payment System**: Demo payment with transaction tracking
- **Review & Rating**: Smart reputation algorithm with cron job
- **Dispute System**: Regional moderation with evidence support
- **Location Management**: Cities, neighborhoods, categories
- **Advanced Filtering**: Radius, price, rating, verification, sorting

### 🗂️ Database Schema
- **23 Tables**: Fully normalized with audit trails
- **H3 Indexing**: Optimized for geospatial queries
- **15+ Indexes**: Performance-tuned for scale
- **RBAC System**: Granular permissions with overrides
- **Immutable Audit Logs**: Complete change tracking

### 🔐 Security & RBAC
- **4 Roles**: Seeker, Provider, Moderator, Admin
- **20+ Permissions**: Hierarchical access control
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API abuse protection
- **Input Validation**: SQL injection prevention

### 🤖 Custom Algorithms

#### Reputation Score Algorithm
```
Reliability Score = 
  (Review Quality × 40%) +
  (Recent Performance × 25%) +
  (Consistency × 15%) +
  (Completion Rate × 10%) +
  (Responsiveness × 10%) +
  Experience Bonus -
  Cancellation Penalty
```

#### Factors:
- Average rating (0-5 stars)
- Recent 10 reviews trend
- Rating consistency (stddev)
- Booking completion rate
- Response time
- Experience level (total bookings)
- Cancellation rate penalty

---

### Core Design Principles

1. **Normalization**: 3NF compliance to eliminate data redundancy
2. **Indexing Strategy**: B-tree, GIN, and H3-optimized indexes
3. **Soft Deletes**: `deleted_at` timestamps for data recovery
4. **Audit Trail**: Immutable logs for all critical operations
5. **Denormalization Where Needed**: `user_reputation` table for performance

### Entity Relationship Diagram

```
users (1) ─────────── (1) user_profiles
  │                           │
  │                           │
  ├─── (1:N) ───> addresses ──┤
  │                           │
  ├─── (1:N) ───> service_listings
  │                           │
  │                           ├─── (N:1) ───> service_categories
  │                           │
  │                           └─── (1:N) ───> service_availability
  │
  ├─── (1:N) ───> bookings <─── (N:1) ─── service_listings
  │                   │
  │                   ├─── (1:1) ───> reviews
  │                   │
  │                   ├─── (1:1) ───> transactions
  │                   │
  │                   └─── (1:N) ───> disputes
  │
  └─── (1:1) ───> user_reputation
```

### Key Tables

#### Users & Profiles
- **users**: Authentication & core user data
- **user_profiles**: Personal information (1:1 with users)
- **user_reputation**: Denormalized metrics for fast queries

#### Location & Geography
- **cities**: Top-level geographic boundaries
- **neighborhoods**: City subdivisions with H3 coverage
- **addresses**: User/service locations with H3 indexes

#### Services & Bookings
- **service_listings**: Available services with geospatial data
- **service_categories**: Hierarchical categorization
- **service_availability**: Recurring time slots
- **bookings**: Service reservations with status tracking

#### Reviews & Transactions
- **reviews**: 1-5 star ratings with comments
- **transactions**: Payment records with platform fees
- **disputes**: Conflict resolution system

#### RBAC System
- **permissions**: Granular access rights
- **role_permissions**: Default role capabilities
- **user_permission_overrides**: User-specific exceptions

#### Audit & Compliance
- **audit_logs**: Immutable change tracking (INSERT-only)
- **notifications**: User alerts and messages

## 🚀 Quick Start

### Prerequisites
```bash
# Required software
- Docker & Docker Compose (v2.0+)
- Node.js (v20+) - for local development
- Git
```

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd neighbourly
```

2. **Set up environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

3. **Start services with Docker Compose**
```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- Node.js backend on port 3000

4. **Verify services**
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend

# Test database connection
docker-compose exec postgres psql -U neighbourly_user -d neighbourly_db -c "SELECT version();"
```

### Database Migrations

The initial migration (`001_initial_schema.sql`) runs automatically when PostgreSQL starts for the first time.

To manually run migrations:
```bash
docker-compose exec postgres psql -U neighbourly_user -d neighbourly_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

## 🗺️ H3 Geospatial Implementation

### Why H3?

Uber's H3 provides:
- **Uniform coverage**: Hexagons tile the Earth with minimal distortion
- **Hierarchical resolution**: 16 levels from continent to building
- **Fast neighbor queries**: O(1) lookups for adjacent cells
- **Compact representation**: 15-character string per hexagon

### Resolution Levels Used

| Resolution | Edge Length | Area | Use Case |
|-----------|-------------|------|----------|
| 7 | ~2.5 km | ~5.16 km² | City-level |
| 8 | ~0.9 km | ~0.74 km² | Neighborhood |
| 9 (default) | ~350 m | ~0.10 km² | Service location |
| 10 | ~120 m | ~0.015 km² | Precise search |

### Example: Radius Search

```javascript
// Find services within 10km of user's location
const h3Service = require('./services/h3Service');

const userLat = 24.8607;
const userLng = 67.0011;
const radiusKm = 10;

// Get all H3 cells within radius
const cells = h3Service.getCellsWithinRadius(userLat, userLng, radiusKm, 9);

// Query database
const query = `
  SELECT * FROM service_listings 
  WHERE h3_index = ANY($1) 
  AND status = 'active'
  ORDER BY created_at DESC
`;

const results = await db.query(query, [cells]);
```

### Database Indexing Strategy

```sql
-- H3 index for fast lookups
CREATE INDEX idx_services_h3_index ON service_listings(h3_index) 
  WHERE status = 'active';

-- Composite index for category + location
CREATE INDEX idx_services_category_h3 ON service_listings(category_id, h3_index)
  WHERE status = 'active';

-- GIN index for neighborhood H3 arrays
CREATE INDEX idx_neighborhoods_h3_cells ON neighborhoods USING GIN(h3_cells);
```

## 🔐 Security Features

### Authentication & Authorization

1. **Password Security**
   - bcrypt hashing with 12 rounds
   - Account lockout after 5 failed attempts
   - 15-minute lockout period

2. **JWT Tokens**
   - 7-day expiration (configurable)
   - Refresh token support
   - Secure HTTP-only cookies (production)

3. **RBAC Implementation**
   - 4 default roles: seeker, provider, moderator, admin
   - 20+ granular permissions
   - User-specific overrides with expiration

### Rate Limiting

```javascript
// API-wide rate limit: 100 requests per 15 minutes
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

// Per-endpoint limits (implemented in routes)
// Auth endpoints: 5 requests per 15 minutes
// Search endpoints: 50 requests per minute
```

### SQL Injection Prevention

- Parameterized queries only
- Input validation with Joi schemas
- Express-validator for request sanitization

### Audit Logging

All sensitive operations are logged immutably:
```sql
-- Example: Booking status change
INSERT INTO audit_logs (
  table_name, record_id, action, 
  old_data, new_data, performed_by
) VALUES (
  'bookings', '...', 'status_change',
  '{"status": "pending"}', '{"status": "confirmed"}',
  'user-uuid'
);
```

## 📈 Performance Optimizations

### Database Level

1. **Connection Pooling**
   - Min: 5 connections
   - Max: 20 connections
   - Idle timeout: 30 seconds

2. **Query Optimization**
   - 15+ strategically placed indexes
   - Partial indexes with WHERE clauses
   - GIN indexes for array/JSONB columns
   - Full-text search with tsvector

3. **Denormalization**
   - `user_reputation` table (calculated metrics)
   - `trending_services_cache` (materialized views)

### Application Level

1. **Redis Caching**
   - Frequently accessed categories
   - High-traffic neighborhoods
   - User sessions
   - Rate limit counters

2. **Database Query Caching**
   - Service listings cache (5 min TTL)
   - Category tree cache (1 hour TTL)

3. **Pagination**
   - Default: 20 items per page
   - Max: 100 items per page
   - Cursor-based for large datasets

## 🧪 Testing

### Manual API Testing

```bash
# Health check
curl http://localhost:3000/health

# Database connection test
curl http://localhost:3000/api/v1/health/db

# Pool statistics
curl http://localhost:3000/api/v1/health/pool
```

### Load Testing (Future)

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test endpoint
ab -n 1000 -c 10 http://localhost:3000/api/v1/services
```

## 📦 Project Structure

```
neighbourly/
├── docker-compose.yml          # Container orchestration
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── server.js           # Express app entry point
│   │   ├── config/
│   │   │   ├── database.js     # PostgreSQL pool config
│   │   │   └── redis.js        # Redis client config
│   │   ├── services/
│   │   │   └── h3Service.js    # Geospatial operations
│   │   ├── models/             # Data access layer
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── controllers/        # Business logic
│   │   └── utils/              # Helpers & logger
│   └── tests/
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3000 | API server port |
| `DB_HOST` | postgres | Database host |
| `DB_PORT` | 5432 | Database port |
| `DB_POOL_MAX` | 20 | Max connections |
| `JWT_SECRET` | (required) | Token signing key |
| `BCRYPT_ROUNDS` | 12 | Password hash cost |
| `H3_DEFAULT_RESOLUTION` | 9 | H3 hex resolution |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Requests per window |

See `.env.example` for complete list.

## 📊 Monitoring & Maintenance

### Database Health

```bash
# Check connection pool stats
docker-compose exec backend node -e "
  const db = require('./src/config/database');
  console.log(db.getPoolStats());
"

# Vacuum and analyze
docker-compose exec postgres psql -U neighbourly_user -d neighbourly_db -c "VACUUM ANALYZE;"

# Index usage statistics
docker-compose exec postgres psql -U neighbourly_user -d neighbourly_db -c "
  SELECT schemaname, tablename, indexname, idx_scan 
  FROM pg_stat_user_indexes 
  ORDER BY idx_scan DESC;
"
```

### Logs

```bash
# Application logs
docker-compose logs -f backend

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis
```

## 🚀 Stage 2 → Stage 3 Evolution Path

### Current (Stage 2)
- Single-region PostgreSQL
- Basic REST API
- H3 geospatial indexing
- Redis caching

### Future (Stage 3)
- **Read/Write Separation**: PostgreSQL primary + read replicas
- **Message Queue**: RabbitMQ/Redis Pub/Sub for async tasks
- **WebSocket/gRPC**: Real-time messaging
- **Horizontal Scaling**: Multiple API servers with load balancer
- **Distributed Caching**: Redis Cluster
- **Search Engine**: Elasticsearch for advanced queries
- **CDN**: Static asset distribution

## 🤝 Design Decisions & Rationale

### 1. PostgreSQL over PostGIS
**Decision**: Use native PostgreSQL with H3 indexes instead of PostGIS spatial types.

**Rationale**:
- H3 provides uniform hexagonal grid (vs. irregular geometries)
- Simpler queries: `WHERE h3_index = ANY($1)` vs. complex ST_Distance
- Better performance for radius searches at scale
- Easier to understand and maintain
- No additional extensions required

### 2. Normalized Schema
**Decision**: Strict 3NF normalization with selective denormalization.

**Rationale**:
- Data integrity through foreign key constraints
- Eliminates update anomalies
- Easier to evolve schema
- Denormalization only for proven performance needs (`user_reputation`)

### 3. Immutable Audit Logs
**Decision**: Append-only audit table with database-level restrictions.

**Rationale**:
- Regulatory compliance (GDPR, SOC2)
- Forensic analysis capabilities
- Dispute resolution evidence
- No DELETE/UPDATE rules prevent tampering

### 4. Separate User Profiles Table
**Decision**: 1:1 relationship between `users` and `user_profiles`.

**Rationale**:
- Separation of authentication data (sensitive) from profile data
- Allows different caching strategies
- Supports multi-region data residency compliance
- Cleaner migrations when adding profile fields

### 5. H3 Resolution 9 Default
**Decision**: Use resolution 9 (~350m edge) for service locations.

**Rationale**:
- Balances precision with query performance
- ~0.10 km² coverage is ideal for neighborhood services
- Allows efficient radius searches (5-25km)
- Can aggregate to res 7/8 for city-level analytics

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready -U neighbourly_user

# View PostgreSQL logs
docker-compose logs postgres | tail -50
```

### Migration Errors
```bash
# Drop and recreate database (CAUTION: destroys data)
docker-compose down -v
docker-compose up -d postgres

# Manually run migration
docker-compose exec postgres psql -U neighbourly_user -d neighbourly_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql
```

### Backend Won't Start
```bash
# Check environment variables
docker-compose exec backend printenv | grep DB_

# Verify dependencies
docker-compose exec backend npm list

# Rebuild container
docker-compose build backend
docker-compose up -d backend
```

## 📚 Additional Resources

- [Uber H3 Documentation](https://h3geo.org/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

## 📄 License

MIT

---

**Built for PROBATTLE26 - Full Stack Challenge**