# LinkdAPI Node.js SDK

Official Node.js SDK for [LinkdAPI](https://linkdapi.com) - The best API for professional Data.

## Features

- Full TypeScript support with type definitions
- Zero external dependencies (uses native `fetch`)
- Automatic retry mechanism with exponential backoff
- Requires Node.js 18.0.0 or higher

## Installation

```bash
npm install linkdapi
```

## Quick Start

```typescript
import { LinkdAPI } from 'linkdapi';

const api = new LinkdAPI({ apiKey: 'your-api-key' });

// Get profile overview
const profile = await api.getProfileOverview('ryanroslansky');
console.log(profile);
```

### CommonJS Usage

```javascript
const { LinkdAPI } = require('linkdapi');

const api = new LinkdAPI({ apiKey: 'your-api-key' });

async function main() {
  const profile = await api.getProfileOverview('ryanroslansky');
  console.log(profile);
}

main();
```

## Configuration

```typescript
const api = new LinkdAPI({
  apiKey: 'your-api-key',           // Required: Get one at https://linkdapi.com/?p=signup
  baseUrl: 'https://linkdapi.com',  // Optional: API base URL
  timeout: 30000,                   // Optional: Request timeout in ms (default: 30000)
  maxRetries: 3,                    // Optional: Max retry attempts (default: 3)
  retryDelay: 1000,                 // Optional: Initial retry delay in ms (default: 1000)
});
```

## API Methods

All methods have documentation URLs in JSDoc. Each method links to the full API documentation.

### Profile Endpoints

```typescript
// Get basic profile by username
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/overview
await api.getProfileOverview('username');

// Get profile details by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/details
await api.getProfileDetails('urn');

// Get contact info by username
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/contact-info
await api.getContactInfo('username');

// Get full experience by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/full-experience
await api.getFullExperience('urn');

// Get certifications by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/certifications
await api.getCertifications('urn');

// Get education by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/education
await api.getEducation('urn');

// Get skills by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/skills
await api.getSkills('urn');

// Get social matrix by username
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/social-matrix
await api.getSocialMatrix('username');

// Get recommendations by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/recommendations
await api.getRecommendations('urn');

// Get similar profiles by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/similar
await api.getSimilarProfiles('urn');

// Get profile about by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/about
await api.getProfileAbout('urn');

// Get profile reactions by URN (with pagination)
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/reactions
await api.getProfileReactions('urn', 'cursor');

// Get profile interests by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/interests
await api.getProfileInterests('urn');

// Get full profile (everything in 1 request)
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/full
await api.getFullProfile({ username: 'username' });
await api.getFullProfile({ urn: 'urn' });

// Get profile services by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/services
await api.getProfileServices('urn');

// Get profile URN by username
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/profile/username-to-urn
await api.getProfileUrn('username');
```

### Posts Endpoints

```typescript
// Get featured posts by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/posts/featured
await api.getFeaturedPosts('urn');

// Get all posts by URN (with pagination)
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/posts/all
await api.getAllPosts('urn', 'cursor', 0);

// Get post info by URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/posts/info
await api.getPostInfo('postUrn');

// Get post comments
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/posts/comments
await api.getPostComments('postUrn', 0, 10, 'cursor');

// Get post likes
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/posts/likes
await api.getPostLikes('postUrn', 0);
```

### Comments Endpoints

```typescript
// Get all comments by profile URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/comments/all
await api.getAllComments('urn', 'cursor');

// Get comment likes
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/comments/likes
await api.getCommentLikes('urn1,urn2', 0);
```

### Companies Endpoints

```typescript
// Lookup companies by name
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/name-lookup
await api.companyNameLookup('Google');

// Get company info by ID or name
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/info
await api.getCompanyInfo({ companyId: '1441' });
await api.getCompanyInfo({ name: 'Google' });

// Get similar companies
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/similar
await api.getSimilarCompanies('1441');

// Get company employees data
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/employees-data
await api.getCompanyEmployeesData('1441');

// Get company jobs
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/jobs
await api.getCompanyJobs('1441', 0);
await api.getCompanyJobs(['1441', '1035'], 0);

// Get company affiliated pages
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/affiliated-pages
await api.getCompanyAffiliatedPages('1441');

// Get company posts
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/posts
await api.getCompanyPosts('1441', 0);

// Get company ID by universal name
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/universal-name-to-id
await api.getCompanyId('google');

// Get company details V2
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/info-v2
await api.getCompanyDetailsV2('1441');
```

### Jobs Endpoints

```typescript
// Search jobs
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/search
await api.searchJobs({
  keyword: 'software engineer',
  location: 'San Francisco',
  jobTypes: ['full_time', 'contract'],           // full_time, part_time, contract, temporary, internship, volunteer
  experience: ['associate', 'mid_senior'],       // internship, entry_level, associate, mid_senior, director
  timePosted: '1week',                           // any, 24h, 1week, 1month
  salary: '100k',                                // any, 40k, 60k, 80k, 100k, 120k
  workArrangement: ['remote', 'hybrid'],         // onsite, remote, hybrid
  start: 0,
});

// Get job details
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/details
await api.getJobDetails('jobId');

// Get job details V2 (supports all job statuses)
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/details-v2
await api.getJobDetailsV2('jobId');

// Get similar jobs
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/similar
await api.getSimilarJobs('jobId');

// Get people also viewed jobs
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/people-also-viewed
await api.getPeopleAlsoViewedJobs('jobId');

// Get hiring team
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/hiring-team
await api.getHiringTeam('jobId', 0);

// Get jobs posted by profile
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/jobs/posted-by-profile
await api.getProfilePostedJobs('profileUrn', 0, 25);

// Search jobs V2 (comprehensive filters)
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/jobs
await api.searchJobsV2({
  keyword: 'data scientist',
  datePosted: '1week',                           // 24h, 1week, 1month
  experience: ['mid_senior', 'director'],        // internship, entry_level, associate, mid_senior, director, executive
  jobTypes: ['full_time'],                       // full_time, part_time, contract, temporary, internship, volunteer, other
  workplaceTypes: ['remote'],                    // onsite, remote, hybrid
  salary: '100k',                                // 20k, 30k, 40k, 50k, 60k, 70k, 80k, 90k, 100k
  easyApply: true,
  verifiedJob: true,
  under10Applicants: false,
  fairChance: false,
});
```

### Search Endpoints

```typescript
// Search people
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/people
await api.searchPeople({
  keyword: 'software engineer',
  currentCompany: '1441',
  firstName: 'John',
  lastName: 'Doe',
  geoUrn: '103644278',
  industry: '96',
  profileLanguage: 'en',
  pastCompany: '1035',
  school: '19344',
  serviceCategory: '1',
  title: 'founder',
  start: 0,
});

// Search companies
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/companies
await api.searchCompanies({
  keyword: 'technology',
  companySize: ['51-200', '201-500'],  // 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10,000, 10,001+
  hasJobs: true,
  geoUrn: '103644278',
  industry: '96',
  start: 0,
});

// Search services
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/services
await api.searchServices({
  keyword: 'web development',
  geoUrn: '103644278',
  profileLanguage: 'en',
  serviceCategory: '1',
  start: 0,
});

// Search schools
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/schools
await api.searchSchools('Stanford', 0);

// Search posts
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/search/posts
await api.searchPosts({
  keyword: 'artificial intelligence',
  authorCompany: '1441',
  authorIndustry: '96',
  authorJobTitle: 'founder',
  contentType: 'videos',          // videos, photos, jobs, liveVideos, documents, collaborativeArticles
  datePosted: 'past-week',        // past-24h, past-week, past-month, past-year
  fromMember: 'profileUrn',
  fromOrganization: '1441',
  mentionsMember: 'profileUrn',
  mentionsOrganization: '1035',
  sortBy: 'date_posted',          // relevance, date_posted
  start: 10,
});
```

### Lookup Endpoints

```typescript
// Geo name lookup
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/geos/name-lookup
await api.geoNameLookup('San Francisco');

// Title/skills lookup
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/g/title-skills-lookup
await api.titleSkillsLookup('Python');

// Services lookup
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/g/services-lookup
await api.servicesLookup('consulting');
```

### Services Endpoints

```typescript
// Get service details
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/services/service/details
await api.getServiceDetails('vanityname');

// Get similar services
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/services/service/similar
await api.getSimilarServices('vanityname');
```

### Articles Endpoints

```typescript
// Get all articles by profile URN
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/articles/all
await api.getAllArticles('urn', 0);

// Get article info by URL
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/articles/article/info
await api.getArticleInfo('https://www.linkedin.com/pulse/...');

// Get article reactions
// Docs: https://linkdapi.com/docs?endpoint=/api/v1/articles/article/reactions
await api.getArticleReactions('articleUrn', 0);
```

### Utility Endpoints

```typescript
// Get API service status
await api.getServiceStatus();
```

## Error Handling

```typescript
import { LinkdAPI, HTTPError, NetworkError, TimeoutError } from 'linkdapi';

const api = new LinkdAPI({ apiKey: 'your-api-key' });

try {
  const profile = await api.getProfileOverview('username');
  console.log(profile);
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(`API error ${error.statusCode}: ${error.message}`);
    console.error('Response:', error.responseBody);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  }
}
```

## License

MIT

## Support

- Website: [https://linkdapi.com](https://linkdapi.com)
- Sign up for API key: [https://linkdapi.com/?p=signup](https://linkdapi.com/?p=signup) (100 free credits)
