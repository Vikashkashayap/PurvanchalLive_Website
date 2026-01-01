import axios from 'axios';

// Cache interface
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Request deduplication
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class RequestManager {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly REQUEST_TIMEOUT = 30 * 1000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  // Generate cache key from URL and params
  private generateKey(url: string, params?: any): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${url}${paramsStr}`;
  }

  // Check if cached data is still valid
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Clean up expired cache entries
  private cleanExpiredCache(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.cache.delete(key);
      }
    }
  }

  // Sleep function for retry delays
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Make request with retry logic
  private async makeRequest(url: string, options: any = {}, retryCount = 0): Promise<any> {
    try {
      const response = await axios({
        url,
        timeout: this.REQUEST_TIMEOUT,
        ...options
      });

      return response;
    } catch (error: any) {
      // Handle 429 (Too Many Requests) with exponential backoff
      if (error.response?.status === 429 && retryCount < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
        console.warn(`Rate limited, retrying in ${delay}ms... (attempt ${retryCount + 1}/${this.MAX_RETRIES})`);
        await this.sleep(delay);
        return this.makeRequest(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  // Main request method with caching and deduplication
  async request<T>(
    url: string,
    options: any = {},
    useCache: boolean = true,
    customTTL?: number
  ): Promise<T> {
    const cacheKey = this.generateKey(url, options.params || options.data);

    // Check cache first
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.data;
      }
    }

    // Check for pending request
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      // Return the pending promise if request is still fresh (< 30 seconds)
      if (Date.now() - pending.timestamp < 30000) {
        return pending.promise;
      } else {
        // Remove stale pending request
        this.pendingRequests.delete(cacheKey);
      }
    }

    // Clean up expired cache entries periodically
    this.cleanExpiredCache();

    // Create new request
    const requestPromise = this.makeRequest(url, options).then(response => {
      const data = response.data;

      // Cache the response
      if (useCache) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: customTTL || this.CACHE_TTL
        });
      }

      // Remove from pending requests
      this.pendingRequests.delete(cacheKey);

      return data;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    // Store pending request
    this.pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });

    return requestPromise;
  }

  // Clear cache for specific URL or all cache
  clearCache(url?: string): void {
    if (url) {
      // Clear cache for specific URL pattern
      for (const key of this.cache.keys()) {
        if (key.startsWith(url)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  // Get cache stats for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const requestManager = new RequestManager();
export default requestManager;
