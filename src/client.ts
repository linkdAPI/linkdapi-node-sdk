/**
 * LinkdAPI Node.js SDK
 *
 * A high-level client for interacting with the LinkdAPI service.
 *
 * This client provides:
 * - Automatic retry mechanism for failed requests
 * - Type-annotated methods for better IDE support
 * - Connection pooling for improved performance
 * - Comprehensive error handling
 *
 * Basic Usage:
 * ```typescript
 * const api = new LinkdAPI({ apiKey: "your_api_key" });
 * const profile = await api.getProfileOverview("ryanroslansky");
 * console.log(profile);
 * ```
 *
 * @see https://linkdapi.com/?p=signup - Get your API key (100 free credits)
 */

const DEFAULT_BASE_URL = 'https://linkdapi.com';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

export interface ClientConfig {
  /** Your LinkdAPI authentication key. Get one at https://linkdapi.com/?p=signup */
  apiKey: string;
  /** Base URL for the API (default: "https://linkdapi.com") */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum retry attempts for failed requests (default: 3) */
  maxRetries?: number;
  /** Initial delay between retries in milliseconds (default: 1000). Delay increases with each retry. */
  retryDelay?: number;
}

export class LinkdAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LinkdAPIError';
  }
}

export class HTTPError extends LinkdAPIError {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly responseBody?: string;

  constructor(statusCode: number, statusText: string, responseBody?: string) {
    super(`API request failed with status ${statusCode}: ${statusText}`);
    this.name = 'HTTPError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

export class NetworkError extends LinkdAPIError {
  public readonly cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export class TimeoutError extends LinkdAPIError {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class LinkdAPI {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(config: ClientConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryDelay = config.retryDelay || DEFAULT_RETRY_DELAY;
  }

  private getHeaders(): Record<string, string> {
    return {
      'X-linkdapi-apikey': this.apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'LinkdAPI-Node-Client/1.0',
    };
  }

  private async sendRequest(
    method: string,
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    let url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;

    if (params) {
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      }
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method,
          headers: this.getHeaders(),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const responseBody = await response.text();
          throw new HTTPError(response.status, response.statusText, responseBody);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new TimeoutError(`Request timed out after ${this.timeout}ms`);
        }

        // Don't retry on client errors (4xx)
        if (error instanceof HTTPError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error;
        }

        // Wait before retrying
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * (attempt + 1)));
        }
      }
    }

    if (lastError instanceof HTTPError || lastError instanceof TimeoutError) {
      throw lastError;
    }
    throw new NetworkError(
      `Request failed after ${this.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`,
      lastError || undefined
    );
  }

  // ==================== Profile Endpoints ====================

  /**
   * Get basic profile information by username.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/overview
   *
   * @param username - The LinkedIn username to look up
   * @returns Profile overview data
   */
  async getProfileOverview(username: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/overview', { username });
  }

  /**
   * Get profile details information by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/details
   *
   * @param urn - The LinkedIn URN (Uniform Resource Name) for the profile
   * @returns Detailed profile information
   */
  async getProfileDetails(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/details', { urn });
  }

  /**
   * Get contact details for a profile by username.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/contact-info
   *
   * @param username - The LinkedIn username to look up
   * @returns Contact information including email, phone, and websites
   */
  async getContactInfo(username: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/contact-info', { username });
  }

  /**
   * Get complete work experience by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/full-experience
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Complete work experience information
   */
  async getFullExperience(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/full-experience', { urn });
  }

  /**
   * Get lists of professional certifications by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/certifications
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Certification information
   */
  async getCertifications(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/certifications', { urn });
  }

  /**
   * Get full education information by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/education
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Education history
   */
  async getEducation(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/education', { urn });
  }

  /**
   * Get profile skills by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/skills
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Skills information
   */
  async getSkills(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/skills', { urn });
  }

  /**
   * Get social network metrics by username.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/social-matrix
   *
   * @param username - The LinkedIn username to look up
   * @returns Social metrics including connections and followers count
   */
  async getSocialMatrix(username: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/social-matrix', { username });
  }

  /**
   * Get profile given and received recommendations by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/recommendations
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Recommendations data
   */
  async getRecommendations(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/recommendations', { urn });
  }

  /**
   * Get similar profiles for a given profile using its URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/similar
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns List of similar profiles
   */
  async getSimilarProfiles(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/similar', { urn });
  }

  /**
   * Get about this profile such as last update and verification info.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/about
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Profile about information
   */
  async getProfileAbout(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/about', { urn });
  }

  /**
   * Get all reactions for given profile by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/reactions
   *
   * @param urn - The LinkedIn URN for the profile
   * @param cursor - Pagination cursor (optional)
   * @returns Reactions data with pagination information
   */
  async getProfileReactions(urn: string, cursor: string = ''): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { urn };
    if (cursor) {
      params.cursor = cursor;
    }
    return this.sendRequest('GET', 'api/v1/profile/reactions', params);
  }

  /**
   * Get profile interests by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/interests
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Profile interests information
   */
  async getProfileInterests(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/interests', { urn });
  }

  /**
   * Get full profile data in 1 request (everything included).
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/full
   *
   * @param options - Either username or urn must be provided
   * @param options.username - The LinkedIn username
   * @param options.urn - The LinkedIn URN for the profile
   * @returns Complete profile data including all information
   */
  async getFullProfile(options: { username?: string; urn?: string }): Promise<Record<string, unknown>> {
    if (!options.username && !options.urn) {
      throw new Error('Either username or urn must be provided');
    }
    const params: Record<string, unknown> = {};
    if (options.username) params.username = options.username;
    if (options.urn) params.urn = options.urn;
    return this.sendRequest('GET', 'api/v1/profile/full', params);
  }

  /**
   * Get profile services by URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/services
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns Profile services information
   */
  async getProfileServices(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/services', { urn });
  }

  /**
   * Get profile URN by username.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/profile/username-to-urn
   *
   * @param username - The LinkedIn username for the profile
   * @returns Profile URN
   */
  async getProfileUrn(username: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/profile/username-to-urn', { username });
  }

  // ==================== Posts Endpoints ====================

  /**
   * Get all featured posts for a given profile using its URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/posts/featured
   *
   * @param urn - The LinkedIn URN for the profile
   * @returns List of featured posts
   */
  async getFeaturedPosts(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/posts/featured', { urn });
  }

  /**
   * Retrieve all posts for a given profile URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/posts/all
   *
   * @param urn - The LinkedIn URN of the profile
   * @param cursor - Pagination cursor (default is empty)
   * @param start - Start index for pagination (default is 0)
   * @returns List of posts with pagination info
   */
  async getAllPosts(urn: string, cursor: string = '', start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/posts/all', { urn, cursor, start });
  }

  /**
   * Retrieve information about a specific post using its URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/posts/info
   *
   * @param urn - The URN of the LinkedIn post
   * @returns Detailed post information
   */
  async getPostInfo(urn: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/posts/info', { urn });
  }

  /**
   * Get comments for a specific LinkedIn post.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/posts/comments
   *
   * @param urn - The URN of the post
   * @param start - Starting index for pagination (default is 0)
   * @param count - Number of comments to fetch per request (default is 10)
   * @param cursor - Cursor for pagination (default is empty)
   * @returns A list of comments and pagination metadata
   */
  async getPostComments(urn: string, start: number = 0, count: number = 10, cursor: string = ''): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/posts/comments', { urn, start, count, cursor });
  }

  /**
   * Retrieve all users who liked or reacted to a given post.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/posts/likes
   *
   * @param urn - The URN of the LinkedIn post
   * @param start - Pagination start index (default is 0)
   * @returns List of users who liked/reacted to the post
   */
  async getPostLikes(urn: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/posts/likes', { urn, start });
  }

  // ==================== Comments Endpoints ====================

  /**
   * Retrieve all comments made by a profile using their URN.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/comments/all
   *
   * @param urn - The LinkedIn profile URN
   * @param cursor - Pagination cursor (default is empty)
   * @returns List of comments made by the user
   */
  async getAllComments(urn: string, cursor: string = ''): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/comments/all', { urn, cursor });
  }

  /**
   * Get all users who reacted to one or more comment URNs.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/comments/likes
   *
   * @param urns - Comma-separated URNs of comments
   * @param start - Pagination start index (default is 0)
   * @returns List of users who liked or reacted to the comments
   */
  async getCommentLikes(urns: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/comments/likes', { urn: urns, start });
  }

  // ==================== Service Status Endpoint ====================

  /**
   * Get API service status.
   *
   * @returns Service status information
   */
  async getServiceStatus(): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'status/');
  }

  // ==================== Companies Endpoints ====================

  /**
   * Search companies by name.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/name-lookup
   *
   * @param query - The search query (can be 1 character or multiple)
   * @returns List of matching companies
   */
  async companyNameLookup(query: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/name-lookup', { query });
  }

  /**
   * Get company details either by ID or name.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/info
   *
   * @param options - Either companyId or name must be provided
   * @param options.companyId - Company ID
   * @param options.name - Company name
   * @returns Company details information
   */
  async getCompanyInfo(options: { companyId?: string; name?: string }): Promise<Record<string, unknown>> {
    if (!options.companyId && !options.name) {
      throw new Error('Either companyId or name must be provided');
    }
    const params: Record<string, unknown> = {};
    if (options.companyId) params.id = options.companyId;
    if (options.name) params.name = options.name;
    return this.sendRequest('GET', 'api/v1/companies/company/info', params);
  }

  /**
   * Get similar companies by ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/similar
   *
   * @param companyId - Company ID
   * @returns List of similar companies
   */
  async getSimilarCompanies(companyId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/similar', { id: companyId });
  }

  /**
   * Get company employees data by ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/employees-data
   *
   * @param companyId - Company ID
   * @returns Company employees data
   */
  async getCompanyEmployeesData(companyId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/employees-data', { id: companyId });
  }

  /**
   * Get available job listings for given companies by ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/jobs
   *
   * @param companyIds - Company ID(s) - can be a single ID or array of IDs
   * @param start - Pagination start index (default is 0)
   * @returns List of job listings for the specified companies
   */
  async getCompanyJobs(companyIds: string | string[], start: number = 0): Promise<Record<string, unknown>> {
    const ids = Array.isArray(companyIds) ? companyIds.join(',') : companyIds;
    return this.sendRequest('GET', 'api/v1/companies/jobs', { companyIDs: ids, start });
  }

  /**
   * Get affiliated pages/subsidiaries of a company by ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/affiliated-pages
   *
   * @param companyId - Company ID
   * @returns List of affiliated pages and subsidiaries
   */
  async getCompanyAffiliatedPages(companyId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/affiliated-pages', { id: companyId });
  }

  /**
   * Get Posts of a company by ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/posts
   *
   * @param companyId - Company ID
   * @param start - Pagination start index (default is 0)
   * @returns List of posts
   */
  async getCompanyPosts(companyId: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/posts', { id: companyId, start });
  }

  /**
   * Get ID of a company by universal_name (username).
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/universal-name-to-id
   *
   * @param universalName - Company universalName (username)
   * @returns Company ID
   */
  async getCompanyId(universalName: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/universal-name-to-id', { universalName });
  }

  /**
   * Get company details V2 with extended information by company ID.
   * This endpoint returns more information about the company including
   * peopleAlsoFollow, affiliatedByJobs, etc.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/companies/company/info-v2
   *
   * @param companyId - Company ID
   * @returns Extended company details information
   */
  async getCompanyDetailsV2(companyId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/companies/company/info-v2', { id: companyId });
  }

  // ==================== Jobs Endpoints ====================

  /**
   * Search for jobs with various filters.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/search
   *
   * @param options - Search options
   * @param options.keyword - Job title, skills, or keywords
   * @param options.location - City, state, or region
   * @param options.geoId - LinkedIn's internal geographic identifier
   * @param options.companyIds - Specific company LinkedIn IDs (string or array)
   * @param options.jobTypes - Employment types: full_time, part_time, contract, temporary, internship, volunteer
   * @param options.experience - Experience levels: internship, entry_level, associate, mid_senior, director
   * @param options.regions - Specific region codes (string or array)
   * @param options.timePosted - How recently posted: any, 24h, 1week, 1month
   * @param options.salary - Minimum salary: any, 40k, 60k, 80k, 100k, 120k
   * @param options.workArrangement - Work arrangement: onsite, remote, hybrid
   * @param options.start - Pagination start index (default is 0)
   * @returns List of job search results
   */
  async searchJobs(options: {
    keyword?: string;
    location?: string;
    geoId?: string;
    companyIds?: string | string[];
    jobTypes?: string | string[];
    experience?: string | string[];
    regions?: string | string[];
    timePosted?: string;
    salary?: string;
    workArrangement?: string | string[];
    start?: number;
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start: options.start ?? 0 };

    if (options.keyword) params.keyword = options.keyword;
    if (options.location) params.location = options.location;
    if (options.geoId) params.geoId = options.geoId;
    if (options.companyIds) {
      params.companyIds = Array.isArray(options.companyIds) ? options.companyIds.join(',') : options.companyIds;
    }
    if (options.jobTypes) {
      params.jobTypes = Array.isArray(options.jobTypes) ? options.jobTypes.join(',') : options.jobTypes;
    }
    if (options.experience) {
      params.experience = Array.isArray(options.experience) ? options.experience.join(',') : options.experience;
    }
    if (options.regions) {
      params.regions = Array.isArray(options.regions) ? options.regions.join(',') : options.regions;
    }
    if (options.timePosted) params.timePosted = options.timePosted;
    if (options.salary) params.salary = options.salary;
    if (options.workArrangement) {
      params.workArrangement = Array.isArray(options.workArrangement) ? options.workArrangement.join(',') : options.workArrangement;
    }

    return this.sendRequest('GET', 'api/v1/jobs/search', params);
  }

  /**
   * Get job details by job ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/details
   *
   * @param jobId - Job ID (must be open and actively hiring)
   * @returns Detailed job information
   */
  async getJobDetails(jobId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/job/details', { jobId });
  }

  /**
   * Get similar jobs by job ID.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/similar
   *
   * @param jobId - Job ID
   * @returns List of similar jobs
   */
  async getSimilarJobs(jobId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/job/similar', { jobId });
  }

  /**
   * Get related jobs that people also viewed.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/people-also-viewed
   *
   * @param jobId - Job ID
   * @returns List of related jobs
   */
  async getPeopleAlsoViewedJobs(jobId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/job/people-also-viewed', { jobId });
  }

  /**
   * Get job details V2 by job ID. This endpoint supports all job statuses
   * (open, closed, expired, etc.) and provides detailed information about the job.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/details-v2
   *
   * @param jobId - Job ID (supports all job statuses)
   * @returns Detailed job information
   */
  async getJobDetailsV2(jobId: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/job/details-v2', { jobId });
  }

  /**
   * Get hiring team members for a specific job.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/job/hiring-team
   *
   * @param jobId - Job ID
   * @param start - Pagination start index (default is 0)
   * @returns List of hiring team members
   */
  async getHiringTeam(jobId: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/job/hiring-team', { jobId, start });
  }

  /**
   * Get jobs posted by a specific profile.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/jobs/posted-by-profile
   *
   * @param profileUrn - Profile URN
   * @param start - Pagination start index (default is 0)
   * @param count - Number of jobs to retrieve (default is 25)
   * @returns List of jobs posted by the profile
   */
  async getProfilePostedJobs(profileUrn: string, start: number = 0, count: number = 25): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/jobs/posted-by-profile', { profileUrn, start, count });
  }

  /**
   * Search for jobs V2 with comprehensive filters (all filters available).
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/jobs
   *
   * @param options - Search options
   * @param options.keyword - Search keyword
   * @param options.start - Pagination offset (default: 0, increment by 25)
   * @param options.sortBy - Sort by "relevance" (default) or "date_posted"
   * @param options.datePosted - Filter by "24h", "1week", or "1month"
   * @param options.experience - Experience levels: internship, entry_level, associate, mid_senior, director, executive
   * @param options.jobTypes - Employment types: full_time, part_time, contract, temporary, internship, volunteer, other
   * @param options.workplaceTypes - Work arrangement: onsite, remote, hybrid
   * @param options.salary - Minimum annual salary: 20k, 30k, 40k, 50k, 60k, 70k, 80k, 90k, 100k
   * @param options.companies - Company IDs (string or array)
   * @param options.industries - Industry IDs (string or array)
   * @param options.locations - LinkedIn's internal geographic identifiers (string or array)
   * @param options.functions - Job function codes (string or array, e.g., "it,sales,eng")
   * @param options.titles - Job title IDs (string or array)
   * @param options.benefits - Benefits: medical_ins, dental_ins, vision_ins, 401k, pension, paid_maternity, paid_paternity, commuter, student_loan, tuition, disability_ins
   * @param options.commitments - Company values: dei, environmental, work_life, social_impact, career_growth
   * @param options.easyApply - Show only LinkedIn Easy Apply jobs
   * @param options.verifiedJob - Show only verified job postings
   * @param options.under10Applicants - Show jobs with fewer than 10 applicants
   * @param options.fairChance - Show jobs from fair chance employers
   * @returns List of job search results
   */
  async searchJobsV2(options: {
    keyword?: string;
    start?: number;
    sortBy?: string;
    datePosted?: string;
    experience?: string | string[];
    jobTypes?: string | string[];
    workplaceTypes?: string | string[];
    salary?: string;
    companies?: string | string[];
    industries?: string | string[];
    locations?: string | string[];
    functions?: string | string[];
    titles?: string | string[];
    benefits?: string | string[];
    commitments?: string | string[];
    easyApply?: boolean;
    verifiedJob?: boolean;
    under10Applicants?: boolean;
    fairChance?: boolean;
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start: options.start ?? 0 };

    if (options.keyword) params.keyword = options.keyword;
    if (options.sortBy) params.sortBy = options.sortBy;
    if (options.datePosted) params.datePosted = options.datePosted;
    if (options.experience) {
      params.experience = Array.isArray(options.experience) ? options.experience.join(',') : options.experience;
    }
    if (options.jobTypes) {
      params.jobTypes = Array.isArray(options.jobTypes) ? options.jobTypes.join(',') : options.jobTypes;
    }
    if (options.workplaceTypes) {
      params.workplaceTypes = Array.isArray(options.workplaceTypes) ? options.workplaceTypes.join(',') : options.workplaceTypes;
    }
    if (options.salary) params.salary = options.salary;
    if (options.companies) {
      params.companies = Array.isArray(options.companies) ? options.companies.join(',') : options.companies;
    }
    if (options.industries) {
      params.industries = Array.isArray(options.industries) ? options.industries.join(',') : options.industries;
    }
    if (options.locations) {
      params.locations = Array.isArray(options.locations) ? options.locations.join(',') : options.locations;
    }
    if (options.functions) {
      params.functions = Array.isArray(options.functions) ? options.functions.join(',') : options.functions;
    }
    if (options.titles) {
      params.titles = Array.isArray(options.titles) ? options.titles.join(',') : options.titles;
    }
    if (options.benefits) {
      params.Benefits = Array.isArray(options.benefits) ? options.benefits.join(',') : options.benefits;
    }
    if (options.commitments) {
      params.commitments = Array.isArray(options.commitments) ? options.commitments.join(',') : options.commitments;
    }
    if (options.easyApply !== undefined) params.easyApply = String(options.easyApply).toLowerCase();
    if (options.verifiedJob !== undefined) params.verifiedJob = String(options.verifiedJob).toLowerCase();
    if (options.under10Applicants !== undefined) params.under10Applicants = String(options.under10Applicants).toLowerCase();
    if (options.fairChance !== undefined) params.fairChance = String(options.fairChance).toLowerCase();

    return this.sendRequest('GET', 'api/v1/search/jobs', params);
  }

  // ==================== Geos Lookup Endpoints ====================

  /**
   * Search locations and get geo IDs.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/geos/name-lookup
   *
   * @param query - The search query (can be 1 character or multiple)
   * @returns List of matching locations with geo IDs
   */
  async geoNameLookup(query: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/geos/name-lookup', { query });
  }

  // ==================== Search Endpoints ====================

  /**
   * Search for people with various filters.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/people
   *
   * @param options - Search options
   * @param options.keyword - Search keyword (e.g., "software engineer")
   * @param options.start - Pagination start index (default is 0)
   * @param options.currentCompany - Current company IDs (string or array)
   * @param options.firstName - First name filter
   * @param options.geoUrn - Geographic URNs (string or array)
   * @param options.industry - Industry IDs (string or array)
   * @param options.lastName - Last name filter
   * @param options.profileLanguage - Profile language (e.g., "en" for English)
   * @param options.pastCompany - Past company IDs (string or array)
   * @param options.school - School IDs (string or array)
   * @param options.serviceCategory - Service category ID
   * @param options.title - Job title (e.g., "founder")
   * @returns List of people matching the search criteria
   */
  async searchPeople(options: {
    keyword?: string;
    start?: number;
    currentCompany?: string | string[];
    firstName?: string;
    geoUrn?: string | string[];
    industry?: string | string[];
    lastName?: string;
    profileLanguage?: string;
    pastCompany?: string | string[];
    school?: string | string[];
    serviceCategory?: string;
    title?: string;
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start: options.start ?? 0 };

    if (options.keyword) params.keyword = options.keyword;
    if (options.currentCompany) {
      params.currentCompany = Array.isArray(options.currentCompany) ? options.currentCompany.join(',') : options.currentCompany;
    }
    if (options.firstName) params.firstName = options.firstName;
    if (options.geoUrn) {
      params.geoUrn = Array.isArray(options.geoUrn) ? options.geoUrn.join(',') : options.geoUrn;
    }
    if (options.industry) {
      params.industry = Array.isArray(options.industry) ? options.industry.join(',') : options.industry;
    }
    if (options.lastName) params.lastName = options.lastName;
    if (options.profileLanguage) params.profileLanguage = options.profileLanguage;
    if (options.pastCompany) {
      params.pastCompany = Array.isArray(options.pastCompany) ? options.pastCompany.join(',') : options.pastCompany;
    }
    if (options.school) {
      params.school = Array.isArray(options.school) ? options.school.join(',') : options.school;
    }
    if (options.serviceCategory) params.serviceCategory = options.serviceCategory;
    if (options.title) params.title = options.title;

    return this.sendRequest('GET', 'api/v1/search/people', params);
  }

  /**
   * Search for companies with various filters.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/companies
   *
   * @param options - Search options
   * @param options.keyword - Search keyword (e.g., "software")
   * @param options.start - Pagination start index (default is 0)
   * @param options.geoUrn - Geographic URNs (string or array)
   * @param options.companySize - Company sizes: "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10,000", "10,001+"
   * @param options.hasJobs - Filter companies with job listings
   * @param options.industry - Industry IDs (string or array)
   * @returns List of companies matching the search criteria
   */
  async searchCompanies(options: {
    keyword?: string;
    start?: number;
    geoUrn?: string | string[];
    companySize?: string | string[];
    hasJobs?: boolean;
    industry?: string | string[];
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start: options.start ?? 0 };

    if (options.keyword) params.keyword = options.keyword;
    if (options.geoUrn) {
      params.geoUrn = Array.isArray(options.geoUrn) ? options.geoUrn.join(',') : options.geoUrn;
    }
    if (options.companySize) {
      params.companySize = Array.isArray(options.companySize) ? options.companySize.join(',') : options.companySize;
    }
    if (options.hasJobs !== undefined) params.hasJobs = String(options.hasJobs).toLowerCase();
    if (options.industry) {
      params.industry = Array.isArray(options.industry) ? options.industry.join(',') : options.industry;
    }

    return this.sendRequest('GET', 'api/v1/search/companies', params);
  }

  /**
   * Search for services offered by LinkedIn members.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/services
   *
   * @param options - Search options
   * @param options.keyword - Search keyword (e.g., "software")
   * @param options.start - Pagination start index (default is 0)
   * @param options.geoUrn - Geographic URNs (string or array)
   * @param options.profileLanguage - Profile language (e.g., "en,ch")
   * @param options.serviceCategory - Service category IDs (string or array)
   * @returns List of services matching the search criteria
   */
  async searchServices(options: {
    keyword?: string;
    start?: number;
    geoUrn?: string | string[];
    profileLanguage?: string;
    serviceCategory?: string | string[];
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start: options.start ?? 0 };

    if (options.keyword) params.keyword = options.keyword;
    if (options.geoUrn) {
      params.geoUrn = Array.isArray(options.geoUrn) ? options.geoUrn.join(',') : options.geoUrn;
    }
    if (options.profileLanguage) params.profileLanguage = options.profileLanguage;
    if (options.serviceCategory) {
      params.serviceCategory = Array.isArray(options.serviceCategory) ? options.serviceCategory.join(',') : options.serviceCategory;
    }

    return this.sendRequest('GET', 'api/v1/search/services', params);
  }

  /**
   * Search for educational institutions/schools.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/schools
   *
   * @param keyword - Search keyword (e.g., "stanford")
   * @param start - Pagination start index (default is 0)
   * @returns List of schools matching the search criteria
   */
  async searchSchools(keyword?: string, start: number = 0): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = { start };
    if (keyword) params.keyword = keyword;
    return this.sendRequest('GET', 'api/v1/search/schools', params);
  }

  /**
   * Search for LinkedIn posts with various filters.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/search/posts
   *
   * @param options - Search options
   * @param options.keyword - Search keyword (e.g., "google")
   * @param options.start - Pagination start index (default is 10)
   * @param options.authorCompany - Company ID of the post author
   * @param options.authorIndustry - Industry ID of the post author
   * @param options.authorJobTitle - Job title of the post author (e.g., "founder")
   * @param options.contentType - Content type: videos, photos, jobs, liveVideos, documents, collaborativeArticles
   * @param options.datePosted - Date filter: past-24h, past-week, past-month, past-year
   * @param options.fromMember - Profile URN of the post author
   * @param options.fromOrganization - Company IDs (string or array)
   * @param options.mentionsMember - Profile URN mentioned in posts
   * @param options.mentionsOrganization - Company IDs mentioned (string or array)
   * @param options.sortBy - Sort order: relevance, date_posted (default is "relevance")
   * @returns List of posts matching the search criteria
   */
  async searchPosts(options: {
    keyword?: string;
    start?: number;
    authorCompany?: string;
    authorIndustry?: string;
    authorJobTitle?: string;
    contentType?: string;
    datePosted?: string;
    fromMember?: string;
    fromOrganization?: string | string[];
    mentionsMember?: string;
    mentionsOrganization?: string | string[];
    sortBy?: string;
  } = {}): Promise<Record<string, unknown>> {
    const params: Record<string, unknown> = {
      start: options.start ?? 10,
      sortBy: options.sortBy ?? 'relevance',
    };

    if (options.keyword) params.keyword = options.keyword;
    if (options.authorCompany) params.authorCompany = options.authorCompany;
    if (options.authorIndustry) params.authorIndustry = options.authorIndustry;
    if (options.authorJobTitle) params.authorJobTitle = options.authorJobTitle;
    if (options.contentType) params.contentType = options.contentType;
    if (options.datePosted) params.datePosted = options.datePosted;
    if (options.fromMember) params.fromMember = options.fromMember;
    if (options.fromOrganization) {
      params.fromOrganization = Array.isArray(options.fromOrganization) ? options.fromOrganization.join(',') : options.fromOrganization;
    }
    if (options.mentionsMember) params.mentionsMember = options.mentionsMember;
    if (options.mentionsOrganization) {
      params.mentionsOrganization = Array.isArray(options.mentionsOrganization) ? options.mentionsOrganization.join(',') : options.mentionsOrganization;
    }

    return this.sendRequest('GET', 'api/v1/search/posts', params);
  }

  // ==================== Skills & Titles Lookup Endpoints ====================

  /**
   * Search for keywords and get relevant skills and titles with their IDs.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/g/title-skills-lookup
   *
   * @param query - Search query
   * @returns List of relevant skills and titles with IDs
   */
  async titleSkillsLookup(query: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/g/title-skills-lookup', { query });
  }

  /**
   * Look up service categories and return matching services.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/g/services-lookup
   *
   * @param query - Search query for services (e.g., "software")
   * @returns List of matching service categories with IDs
   */
  async servicesLookup(query: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/g/services-lookup', { query });
  }

  // ==================== Services Endpoints ====================

  /**
   * Get service by VanityName.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/services/service/details
   *
   * @param vanityname - The service vanity name identifier
   * @returns Service details information
   */
  async getServiceDetails(vanityname: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/services/service/details', { vanityname });
  }

  /**
   * Get similar services by VanityName.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/services/service/similar
   *
   * @param vanityname - The service vanity name identifier
   * @returns List of similar services
   */
  async getSimilarServices(vanityname: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/services/service/similar', { vanityname });
  }

  // ==================== Articles Endpoints ====================

  /**
   * Get all articles published by a specific LinkedIn profile.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/articles/all
   *
   * @param urn - The LinkedIn profile URN
   * @param start - Pagination start index (default is 0)
   * @returns List of articles published by the profile
   */
  async getAllArticles(urn: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/articles/all', { urn, start });
  }

  /**
   * Get detailed information about a specific LinkedIn article.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/articles/article/info
   *
   * @param url - Full LinkedIn article URL (e.g., "https://www.linkedin.com/pulse/...")
   * @returns Detailed article information
   */
  async getArticleInfo(url: string): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/articles/article/info', { url });
  }

  /**
   * Get reactions (likes, comments, etc.) for a specific LinkedIn article.
   *
   * Documentation: https://linkdapi.com/docs?endpoint=/api/v1/articles/article/reactions
   *
   * @param urn - Article/thread URN (obtained from getArticleInfo)
   * @param start - Pagination start index (default is 0)
   * @returns Reactions data for the article
   */
  async getArticleReactions(urn: string, start: number = 0): Promise<Record<string, unknown>> {
    return this.sendRequest('GET', 'api/v1/articles/article/reactions', { urn, start });
  }
}
