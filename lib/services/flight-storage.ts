import { Redis } from '@upstash/redis';

// Setup Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Key prefix to namespace our flight offers
const KEY_PREFIX = 'flight_offer:';
// Set expiration time to 30 minutes (in seconds)
const EXPIRATION_TIME = 60 * 30;

export const FlightStorageService = {
  // Store a flight offer
  storeFlightOffer: async (offerId: string, offer: any): Promise<void> => {
    const key = `${KEY_PREFIX}${offerId}`;
    await redis.set(key, JSON.stringify(offer), { ex: EXPIRATION_TIME });
  },
  
  // Store multiple flight offers
  storeFlightOffers: async (offers: any[]): Promise<void> => {
    const pipeline = redis.pipeline();
    
    offers.forEach(offer => {
      if (offer.id) {
        const key = `${KEY_PREFIX}${offer.id}`;
        pipeline.set(key, JSON.stringify(offer), { ex: EXPIRATION_TIME });
      }
    });
    
    await pipeline.exec();
  },
  
  // Get a flight offer by ID
  getFlightOffer: async (offerId: string): Promise<any | null> => {
    const key = `${KEY_PREFIX}${offerId}`;
    const data = await redis.get(key);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data as string);
    } catch (error) {
      console.error('Error parsing flight offer data:', error);
      return null;
    }
  },
  
  // Get all flight offers (note: this could be expensive with many offers)
  getAllFlightOffers: async (): Promise<any[]> => {
    const keys = await redis.keys(`${KEY_PREFIX}*`);
    if (keys.length === 0) return [];
    
    const offers = await redis.mget(...keys);
    
    return offers
      .filter(Boolean)
      .map(offer => {
        try {
          return JSON.parse(offer as string);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  },
  
  // Clear all flight offers (useful for testing)
  clearFlightOffers: async (): Promise<void> => {
    const keys = await redis.keys(`${KEY_PREFIX}*`);
    if (keys.length === 0) return;
    
    await redis.del(...keys);
  }
};
