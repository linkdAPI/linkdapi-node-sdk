![LinkdAPI Favicon](https://linkdapi.com/favicon.ico)

# LinkdAPI Node.js - The best API for professional Data

[![npm Version](https://img.shields.io/npm/v/linkdapi)](https://www.npmjs.com/package/linkdapi)
[![Node Versions](https://img.shields.io/node/v/linkdapi)](https://www.npmjs.com/package/linkdapi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/linkdapi)](https://www.npmjs.com/package/linkdapi)
[![Twitter Follow](https://img.shields.io/twitter/follow/linkdapi?style=social)](https://x.com/l1nkdapi)

<div align="center">

🔑 **[Get Your API Key](https://linkdapi.com/?p=signup)** (100 free credits) • 📖 **[Full Documentation](https://linkdapi.com/docs)** • 💬 **[Support](https://linkdapi.com/help-center)**

**⚡ Zero Dependencies** • **🚀 Native Fetch API** • **🎯 Production Ready**

</div>

A lightweight Node.js wrapper for [LinkdAPI](https://linkdapi.com) — the most advanced API for accessing professional profile and company data. With unmatched **reliability**, **stability**, and **scalability**, it's perfect for developers, analysts, and anyone building tools that work with professional networking data at scale.

---

## 📑 Table of Contents

- [Why LinkdAPI?](#why-linkdapi)
- [Why LinkdAPI Beats Alternatives](#why-linkdapi-beats-alternatives)
- [📦 Installation](#-installation)
- [✨ Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
  - [ESM Usage](#esm-usage)
  - [CommonJS Usage](#commonjs-usage)
  - [Advanced Async Pattern](#advanced-async-pattern)
- [⚡ Performance Benefits](#-performance-benefits)
- [📚 API Reference](#-api-reference)
- [💡 Real-World Examples](#-real-world-examples)
- [📈 Use Cases](#-use-cases)
- [🔧 Error Handling](#-error-handling)
- [🔗 Resources](#-resources)
- [📜 License](#-license)

---

## Why LinkdAPI?

- We deliver data **reliably and efficiently** without relying on complex workarounds.
- Built for **scale, stability, and accuracy**, so your applications run smoothly.
- Perfect for **automation**, **data analysis**, **contact enrichment**, and **lead generation**.

![LinkdAPI Hero](https://linkdapi.com/hero.jpg)

## Why LinkdAPI Beats Alternatives

| Feature | LinkdAPI | SerpAPI | Scraping |
|---------|----------|---------|----------|
| **Reliable Data Access** | ✅ Yes | ❌ No | ❌ No |
| **No Proxy Management** | ✅ Yes | ❌ No | ❌ No |
| **No Cookies Management** | ✅ Yes | ❌ No | ❌ No |
| **Structured JSON Data** | ✅ Yes | ❌ HTML | ✅ Yes |
| **Scalability** | ✅ Built for scale | ❌ Rate-limited | ❌ Manual effort |
| **Pricing Transparency** | ✅ Clear pricing tiers | ✅ Pay-per-request | ❌ Hidden costs (proxies, CAPTCHAs) |
| **API Reliability** | ✅ High uptime | ✅ Good | ❌ Unstable (blocks) |
| **Automation-Friendly** | ✅ Full automation | ✅ Partial | ❌ Manual work needed |
| **Support & Documentation** | ✅ Dedicated support | ✅ Good docs | ❌ Community-based |
| **Stability & Resilience** | ✅ Optimized for reliability | ❌ Limited | ❌ High risk |
---

## 📦 Installation

Install with npm:

```bash
npm install linkdapi
```

Or with yarn:

```bash
yarn add linkdapi
```

> **Note:** Requires Node.js 18.0.0 or higher (uses native `fetch` API)

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔄 Full TypeScript Support
- **Type Definitions** - Built-in TypeScript support
- **IntelliSense** - Full IDE autocomplete
- **Type Safety** - Catch errors at compile time

### 🚀 Performance Optimized
- Built-in retry mechanism
- Automatic request throttling
- Zero external dependencies
- Native fetch API

</td>
<td width="50%">

### 🛠️ Developer Friendly
- Full type hints support
- Comprehensive error handling
- ESM and CommonJS support
- Extensive documentation

### 🎯 Production Ready
- Automatic retries with exponential backoff
- Timeout configuration
- Error recovery
- Battle tested

</td>
</tr>
</table>

---

## 🚀 Quick Start

### ESM Usage

```typescript
import { LinkdAPI } from 'linkdapi';

// Initialize the client
const api = new LinkdAPI({ apiKey: 'your_api_key' });

// Get profile overview
const profile = await api.getProfileOverview('ryanroslansky');
console.log(`Profile: ${profile.data.fullName}`);

// Get company information
const company = await api.getCompanyInfo({ name: 'google' });
console.log(`Company: ${company.data.name}`);
```

### CommonJS Usage

```javascript
const { LinkdAPI } = require('linkdapi');

const api = new LinkdAPI({ apiKey: 'your_api_key' });

async function main() {
  // Single request
  const profile = await api.getProfileOverview('ryanroslansky');
  console.log(`Profile: ${profile.data.fullName}`);

  // Fetch multiple profiles concurrently
  const profiles = await Promise.all([
    api.getProfileOverview('ryanroslansky'),
    api.getProfileOverview('satyanadella'),
    api.getProfileOverview('jeffweiner08')
  ]);

  for (const profile of profiles) {
    console.log(`Name: ${profile.data.fullName}`);
  }
}

main();
```

### Advanced Async Pattern

```typescript
import { LinkdAPI } from 'linkdapi';

async function fetchProfileData(username: string) {
  const api = new LinkdAPI({ apiKey: 'your_api_key' });

  // Get profile overview first
  const overview = await api.getProfileOverview(username);
  const urn = overview.data.urn;

  // Fetch multiple endpoints concurrently
  const [details, experience, education, skills] = await Promise.all([
    api.getProfileDetails(urn),
    api.getFullExperience(urn),
    api.getEducation(urn),
    api.getSkills(urn)
  ]);

  return {
    overview,
    details,
    experience,
    education,
    skills
  };
}

// Usage
const data = await fetchProfileData('ryanroslansky');
```

---

## ⚡ Performance Benefits

The async nature of Node.js provides significant performance improvements when making multiple API calls:

| Scenario | Sequential | Concurrent (Promise.all) | Improvement |
|----------|------------|--------------------------|-------------|
| Single Request | ~200ms | ~200ms | Same |
| 10 Sequential Requests | ~2000ms | ~2000ms | Same |
| **10 Concurrent Requests** | ~2000ms | **~200ms** | **10x faster** |
| **100 Concurrent Requests** | ~20000ms | **~500ms** | **40x faster** |

**When to use Concurrent:**
- ✅ Scraping multiple profiles at once
- ✅ Batch processing jobs or companies
- ✅ Real-time data aggregation
- ✅ Building high-performance APIs

**When to use Sequential:**
- ✅ Simple scripts
- ✅ Single requests
- ✅ Learning/prototyping

---

## 📚 API Reference

All methods return Promises and support async/await.

<details>
<summary><b>🔹 Profile Endpoints</b> (Click to expand)</summary>

```typescript
// Profile Information
getProfileOverview(username)              // Basic profile info
getProfileDetails(urn)                    // Detailed profile data
getContactInfo(username)                  // Email, phone, websites
getProfileAbout(urn)                      // About section & verification
getFullProfile({ username?, urn? })       // Complete profile data in 1 request

// Work & Education
getFullExperience(urn)                    // Complete work history
getCertifications(urn)                    // Professional certifications
getEducation(urn)                         // Education history
getSkills(urn)                            // Skills & endorsements

// Social & Engagement
getSocialMatrix(username)                 // Connections & followers count
getRecommendations(urn)                   // Given & received recommendations
getSimilarProfiles(urn)                   // Similar profile suggestions
getProfileReactions(urn, cursor?)         // All profile reactions
getProfileInterests(urn)                  // Profile interests
getProfileServices(urn)                   // Profile services
getProfileUrn(username)                   // Get URN from username
```

</details>

<details>
<summary><b>🔹 Company Endpoints</b> (Click to expand)</summary>

```typescript
// Company Search & Info
companyNameLookup(query)                          // Search companies by name
getCompanyInfo({ companyId?, name? })             // Get company details
getSimilarCompanies(companyId)                    // Similar company suggestions
getCompanyEmployeesData(companyId)                // Employee statistics
getCompanyJobs(companyIds, start?)                // Active job listings
getCompanyAffiliatedPages(companyId)              // Subsidiaries & affiliates
getCompanyPosts(companyId, start?)                // Company posts
getCompanyId(universalName)                       // Get ID from universal name
getCompanyDetailsV2(companyId)                    // Extended company info
```

</details>

<details>
<summary><b>🔹 Job Endpoints</b> (Click to expand)</summary>

```typescript
// Job Search
searchJobs({
  keyword?,              // Job title, skills, or keywords
  location?,             // City, state, or region
  geoId?,                // Geographic ID
  companyIds?,           // Specific company IDs
  jobTypes?,             // full_time, part_time, contract, etc.
  experience?,           // internship, entry_level, mid_senior, etc.
  regions?,              // Region codes
  timePosted?,           // any, 24h, 1week, 1month
  salary?,               // any, 40k, 60k, 80k, 100k, 120k
  workArrangement?,      // onsite, remote, hybrid
  start?                 // Pagination
})

// Job Search V2 (comprehensive)
searchJobsV2({
  keyword?, start?, sortBy?, datePosted?, experience?,
  jobTypes?, workplaceTypes?, salary?, companies?,
  industries?, locations?, functions?, titles?,
  benefits?, commitments?, easyApply?, verifiedJob?,
  under10Applicants?, fairChance?
})

// Job Details
getJobDetails(jobId)                   // Detailed job information
getJobDetailsV2(jobId)                 // All job statuses supported
getSimilarJobs(jobId)                  // Similar job postings
getPeopleAlsoViewedJobs(jobId)         // Related jobs
getHiringTeam(jobId, start?)           // Hiring team members
getProfilePostedJobs(profileUrn, start?, count?)  // Jobs by profile
```

</details>

<details>
<summary><b>🔹 Post Endpoints</b> (Click to expand)</summary>

```typescript
// Posts
getFeaturedPosts(urn)                             // Featured posts
getAllPosts(urn, cursor?, start?)                 // All posts with pagination
getPostInfo(urn)                                  // Single post details
getPostComments(urn, start?, count?, cursor?)     // Post comments
getPostLikes(urn, start?)                         // Post likes/reactions
```

</details>

<details>
<summary><b>🔹 Comment Endpoints</b> (Click to expand)</summary>

```typescript
getAllComments(urn, cursor?)           // All comments by profile
getCommentLikes(urns, start?)          // Likes on specific comments
```

</details>

<details>
<summary><b>🔹 Search Endpoints</b> (Click to expand)</summary>

```typescript
// People Search
searchPeople({
  keyword?,
  currentCompany?,
  firstName?,
  geoUrn?,
  industry?,
  lastName?,
  profileLanguage?,
  pastCompany?,
  school?,
  serviceCategory?,
  title?,
  start?
})

// Company Search
searchCompanies({
  keyword?,
  geoUrn?,
  companySize?,    // "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10,000", "10,001+"
  hasJobs?,
  industry?,
  start?
})

// Post Search
searchPosts({
  keyword?,
  authorCompany?,
  authorIndustry?,
  authorJobTitle?,
  contentType?,
  datePosted?,
  fromMember?,
  fromOrganization?,
  mentionsMember?,
  mentionsOrganization?,
  sortBy?,
  start?
})

// Other Search
searchServices({ keyword?, geoUrn?, profileLanguage?, serviceCategory?, start? })
searchSchools(keyword?, start?)
```

</details>

<details>
<summary><b>🔹 Article Endpoints</b> (Click to expand)</summary>

```typescript
getAllArticles(urn, start?)            // All articles by profile
getArticleInfo(url)                    // Article details from URL
getArticleReactions(urn, start?)       // Article likes/reactions
```

</details>

<details>
<summary><b>🔹 Services Endpoints</b> (Click to expand)</summary>

```typescript
getServiceDetails(vanityname)          // Get service by VanityName
getSimilarServices(vanityname)         // Get similar services
```

</details>

<details>
<summary><b>🔹 Lookup Endpoints</b> (Click to expand)</summary>

```typescript
geoNameLookup(query)                   // Search locations & get geo IDs
titleSkillsLookup(query)               // Search skills & job titles
servicesLookup(query)                  // Search service categories
```

</details>

<details>
<summary><b>🔹 System</b> (Click to expand)</summary>

```typescript
getServiceStatus()                     // Check API service status
```

</details>

> 📖 **Full documentation for all endpoints:** [linkdapi.com/docs](https://linkdapi.com/docs/intro)

> 🚀 **More endpoints coming soon!** Check our [roadmap](https://linkdapi.com/roadmap)


## 💡 Real-World Examples

### Example 1: Bulk Profile Enrichment

```typescript
import { LinkdAPI } from 'linkdapi';

async function enrichLeads(usernames: string[]) {
  const api = new LinkdAPI({ apiKey: 'your_api_key' });

  // Fetch all profiles concurrently
  const profiles = await Promise.all(
    usernames.map(username =>
      api.getProfileOverview(username).catch(err => ({ error: err, username }))
    )
  );

  const enrichedData = [];
  for (let i = 0; i < usernames.length; i++) {
    const profile = profiles[i];
    if (profile.success) {
      const data = profile.data;
      enrichedData.push({
        username: usernames[i],
        name: data.fullName,
        headline: data.headline,
        location: data.location,
        company: data.company
      });
    }
  }

  return enrichedData;
}

// Process 100 leads in seconds instead of minutes
const leads = ['ryanroslansky', 'satyanadella', 'jeffweiner08'];
const data = await enrichLeads(leads);
```

### Example 2: Company Intelligence Dashboard

```typescript
import { LinkdAPI } from 'linkdapi';

async function getCompanyIntelligence(companyName: string) {
  const api = new LinkdAPI({ apiKey: 'your_api_key' });

  // Get company info
  const companyInfo = await api.getCompanyInfo({ name: companyName });
  const companyId = companyInfo.data.id;

  // Fetch multiple data points concurrently
  const [employees, similar, jobs, affiliates] = await Promise.all([
    api.getCompanyEmployeesData(companyId),
    api.getSimilarCompanies(companyId),
    api.getCompanyJobs(companyId),
    api.getCompanyAffiliatedPages(companyId)
  ]);

  return {
    info: companyInfo,
    employees,
    similar,
    jobs,
    affiliates
  };
}

const intelligence = await getCompanyIntelligence('google');
```

### Example 3: Job Market Analysis

```typescript
import { LinkdAPI } from 'linkdapi';

async function analyzeJobMarket(role: string, locations: string[]) {
  const api = new LinkdAPI({ apiKey: 'your_api_key' });

  // Search jobs in multiple locations concurrently
  const results = await Promise.all(
    locations.map(location =>
      api.searchJobs({ keyword: role, location, timePosted: '1week' })
    )
  );

  const analysis: Record<string, any> = {};
  for (let i = 0; i < locations.length; i++) {
    const result = results[i];
    if (result.success) {
      const jobs = result.data.jobs;
      analysis[locations[i]] = {
        totalJobs: jobs.length,
        companies: [...new Set(jobs.map((j: any) => j.company))],
        salaryRange: jobs.filter((j: any) => j.salary).map((j: any) => j.salary)
      };
    }
  }

  return analysis;
}

// Analyze "Software Engineer" jobs across 5 cities in parallel
const analysis = await analyzeJobMarket(
  'Software Engineer',
  ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA']
);
```

---

## 📈 Use Cases

<table>
<tr>
<td width="50%">

### 🎯 Lead Generation & Sales
- **Profile Enrichment** - Enhance lead data with professional profiles
- **Company Research** - Deep dive into target companies
- **Contact Discovery** - Find decision makers and key contacts
- **Market Intelligence** - Analyze competitors and opportunities

### 📊 Data Analytics & Research
- **Market Analysis** - Job market trends and salary insights
- **Talent Mapping** - Identify skill gaps and hiring patterns
- **Content Analysis** - Track engagement and viral posts
- **Network Analysis** - Study professional connections

</td>
<td width="50%">

### 🤖 Automation & Integration
- **CRM Integration** - Auto-update contact records
- **Recruiting Pipelines** - Automated candidate sourcing
- **Brand Monitoring** - Track company mentions and sentiment
- **API Development** - Build applications using professional data

### 🔍 Verification & Compliance
- **Identity Verification** - Validate professional credentials
- **Background Checks** - Verify employment history
- **Email Validation** - Confirm email-to-profile matches
- **Due Diligence** - Research business partnerships

</td>
</tr>
</table>

## 🔧 Error Handling

The SDK provides robust error handling with custom error classes:

```typescript
import { LinkdAPI, HTTPError, NetworkError, TimeoutError } from 'linkdapi';

async function fetchWithErrorHandling() {
  const api = new LinkdAPI({ apiKey: 'your_api_key' });

  try {
    const profile = await api.getProfileOverview('username');

    if (profile.success) {
      console.log(`Success: ${profile.data}`);
    } else {
      console.log(`API Error: ${profile.message}`);
    }

  } catch (error) {
    if (error instanceof HTTPError) {
      // Handle HTTP errors (4xx, 5xx)
      console.error(`HTTP Error ${error.statusCode}: ${error.responseBody}`);
    } else if (error instanceof TimeoutError) {
      // Handle timeout errors
      console.error(`Timeout: ${error.message}`);
    } else if (error instanceof NetworkError) {
      // Handle network errors
      console.error(`Network Error: ${error.message}`);
    } else {
      // Handle unexpected errors
      console.error(`Unexpected Error: ${error}`);
    }
  }
}
```

### Built-in Retry Mechanism

The client automatically retries failed requests with exponential backoff:

```typescript
// Configure retry behavior
const api = new LinkdAPI({
  apiKey: 'your_api_key',
  maxRetries: 5,          // Default: 3
  retryDelay: 2000,       // Default: 1000 milliseconds
  timeout: 60000          // Default: 30000 milliseconds
});

// Requests will be retried automatically on failure
const profile = await api.getProfileOverview('username');
```

---

## 🏁 Why Choose LinkdAPI Node.js SDK?

**LinkdAPI** is more than just an API wrapper—it's a complete solution for professional and company data access:

### ⚡ **Performance First**
- **Promise.all Support** - Up to 40x faster for batch operations
- **Zero Dependencies** - Lightweight and fast
- **Smart Retries** - Automatic recovery from transient failures

### 🛡️ **Production Ready**
- **Type Safety** - Full TypeScript support for better IDE experience
- **Error Recovery** - Comprehensive error handling and retries
- **Battle Tested** - Used by developers worldwide

### 🚀 **Developer Experience**
- **ESM & CommonJS** - Works with any module system
- **Async/Await** - Modern JavaScript patterns
- **Rich Documentation** - Examples for every use case

Whether you're building tools to gather professional profiles, analyze company data, or automate recruiting workflows, **LinkdAPI** gives you the speed, reliability, and flexibility you need—without the hassle of complicated setups.

---

## 🔗 Resources

<table>
<tr>
<td width="50%">

### 📚 Documentation & Learning
- [🎓 Getting Started Guide](https://linkdapi.com/docs/intro)
- [📖 API Documentation](https://linkdapi.com/docs)

</td>
<td width="50%">

### 🛠️ Tools & Support
- [🔑 Get API Key](https://linkdapi.com/?p=signup)
- [💬 Help Center](https://linkdapi.com/help-center)
- [🗺️ Roadmap](https://linkdapi.com/roadmap)
- [🐦 Twitter/X](https://x.com/l1nkdapi)

</td>
</tr>
</table>

---

## 📜 License

**MIT License** – Free to use for personal and commercial projects.

---

## 🌟 Support the Project

If you find LinkdAPI useful, consider:
- ⭐ **Starring the project** on GitHub
- 🐦 **Following us** on [Twitter/X](https://x.com/l1nkdapi)
- 📢 **Sharing** with your network
- 💡 **Contributing** ideas and feedback

---

<div align="center">

**Built with ❤️ for developers who need reliable access to professional data**

[Website](https://linkdapi.com) • [Documentation](https://linkdapi.com/docs) • [Twitter](https://x.com/l1nkdapi) • [Support](https://linkdapi.com/help-center)

</div>
