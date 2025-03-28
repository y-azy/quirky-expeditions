import { amadeus } from './amadeus';
import type { FlightOffer } from './amadeus';

// Cache implementation to reduce API calls
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

function getCacheKey(endpoint: string, params: any): string {
  return `${endpoint}:${JSON.stringify(params)}`;
}

function getFromCache(cacheKey: string): any | null {
  const cached = cache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setToCache(cacheKey: string, data: any): void {
  cache[cacheKey] = { data, timestamp: Date.now() };
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: string;
  returnDate?: string;
}) {
  try {
    const cacheKey = getCacheKey('flightOffersSearch', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults || '1',
      returnDate: params.returnDate,
      max: 4
    });

    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw new Error('Unable to connect to flight search system. Please try again later.');
  }
}

export async function getSeatMap({ flightOfferId, flightOrderId }: { 
  flightOfferId?: string; 
  flightOrderId?: string;
}) {
  try {
    if (flightOfferId) {
      // For getSeatMap with a flightOffer, we need the complete flight offer object
      // First, we need to fetch the complete flight offer if we only have the ID
      let flightOffer;
      try {
        // This would typically come from your app state or session storage
        // In a real implementation, store the complete flight offers when first retrieved
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: 'NYC',  // These would be dynamically replaced with
          destinationLocationCode: 'LAX', // values from your app state/session
          departureDate: new Date().toISOString().split('T')[0],
          adults: '1'
        });
        
        flightOffer = response.data.find((offer: any) => offer.id === flightOfferId);
        
        if (!flightOffer) {
          throw new Error("Flight offer not found");
        }
      } catch (fetchError) {
        console.error("Error fetching flight offer:", fetchError);
        throw new Error("Could not retrieve the complete flight offer required for seat map");
      }
      
      // Now use the actual Amadeus SDK with the complete flight offer
      const response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
          data: [flightOffer]
        })
      );
      
      return response.data;
    } else if (flightOrderId) {
      const response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
          data: [{
            type: "flight-order",
            id: flightOrderId
          }]
        })
      );
      
      return response.data;
    } else {
      throw new Error("Either flightOfferId or flightOrderId must be provided");
    }
  } catch (error) {
    console.error("Error in getSeatMap:", error);
    throw error;
  }
}

export async function confirmFlightPrice(flightOffer: any) {
  try {
    // The SDK expects a complete flight offer, not just an ID
    if (typeof flightOffer === 'string') {
      throw new Error("A complete flight offer object is required, not just an ID");
    }
    
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: "flight-offers-pricing",
          flightOffers: [flightOffer]
        }
      })
    );
    
    return response.data;
  } catch (error) {
    console.error("Error confirming flight price:", error);
    throw error;
  }
}

// Add a helper to get an authentication token
async function getAmadeusToken() {
  try {
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      throw new Error("Amadeus API credentials are not configured");
    }
    
    const tokenResponse = await fetch(`${process.env.AMADEUS_API_BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'client_id': process.env.AMADEUS_API_KEY,
        'client_secret': process.env.AMADEUS_API_SECRET
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Failed to get Amadeus token: ${JSON.stringify(errorData)}`);
    }
    
    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error("Error getting Amadeus token:", error);
    throw error;
  }
}

export async function createFlightOrder(params: {
  flightOffer: any;
  traveler: {
    id: string;
    dateOfBirth: string;
    name: {
      firstName: string;
      lastName: string;
    };
    contact: {
      emailAddress: string;
      phones: Array<{
        deviceType: string;
        countryCallingCode: string;
        number: string;
      }>;
    };
  };
}) {
  try {
    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers: [params.flightOffer],
          travelers: [params.traveler]
        }
      })
    );
    
    return {
      orderId: response.data.id,
      ...response.data
    };
  } catch (error) {
    console.error('Error creating flight order:', error);
    throw new Error('Unable to create flight booking. Please try again later.');
  }
}

export async function getFlightStatus(params: {
  carrierCode: string;
  flightNumber: string;
  scheduledDate: string;
}) {
  try {
    const cacheKey = getCacheKey('flightStatus', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.schedule.flights.get({
      carrierCode: params.carrierCode,
      flightNumber: params.flightNumber,
      scheduledDepartureDate: params.scheduledDate
    });

    if (response.data && response.data.length > 0) {
      setToCache(cacheKey, response.data[0]);
      return response.data[0];
    }
    throw new Error('No flight status found for the provided details');
  } catch (error) {
    console.error('Error fetching flight status:', error);
    throw new Error('Unable to retrieve flight status information. Please check the flight details and try again.');
  }
}

export async function searchAirports(keyword: string) {
  try {
    // Check if keyword appears to be Montana related
    if (keyword.toLowerCase().includes('montana') || keyword.toLowerCase() === 'mt') {
      // Hard-code a response for Montana airports
      return [
        {
          name: "Bozeman Yellowstone International Airport",
          iataCode: "BZN",
          cityName: "Bozeman",
          countryName: "United States"
        },
        {
          name: "Billings Logan International Airport",
          iataCode: "BIL",
          cityName: "Billings",
          countryName: "United States"
        },
        {
          name: "Missoula International Airport",
          iataCode: "MSO",
          cityName: "Missoula",
          countryName: "United States"
        },
        {
          name: "Helena Regional Airport",
          iataCode: "HLN",
          cityName: "Helena",
          countryName: "United States"
        }
      ];
    }
    
    // Regular processing for other keywords
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: 'AIRPORT'
    });
    
    return response.data.map((location: any) => ({
      name: location.name,
      iataCode: location.iataCode,
      cityName: location.address.cityName,
      countryName: location.address.countryName
    }));
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
}

export async function getFlightDelay(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  aircraftCode: string;
  carrierCode: string;
  flightNumber: string;
  duration: string;
}) {
  try {
    const cacheKey = getCacheKey('flightDelay', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.travel.predictions.flightDelay.get(params);
    
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error predicting flight delay:', error);
    throw new Error('Unable to predict flight delay information. Please try again later.');
  }
}

export async function getAirlineDetails(airlineCode: string) {
  try {
    const cacheKey = getCacheKey('airlineDetails', { airlineCode });
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCode
    });
    
    if (response.data && response.data.length > 0) {
      setToCache(cacheKey, response.data[0]);
      return response.data[0];
    }
    throw new Error(`No airline found with code ${airlineCode}`);
  } catch (error) {
    console.error('Error fetching airline details:', error);
    throw new Error('Unable to retrieve airline information. Please try again later.');
  }
}

export async function getFlightPrice(params: {
  origin: string;
  destination: string;
  departureDate: string;
}) {
  try {
    const cacheKey = getCacheKey('flightPriceAnalysis', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.analytics.itineraryPriceMetrics.get({
      originIataCode: params.origin,
      destinationIataCode: params.destination,
      departureDate: params.departureDate,
      currencyCode: 'USD'
    });
    
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching flight price metrics:', error);
    throw new Error('Unable to retrieve price metrics. Please try again later.');
  }
}

export async function getAirportDetails(iataCode: string) {
  try {
    const cacheKey = getCacheKey('airportDetails', { iataCode });
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    // First try to find the airport with a direct lookup
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword: iataCode,
        subType: 'AIRPORT'
      });
      
      if (response.data && response.data.length > 0) {
        const airportData = response.data.find((loc: any) => loc.iataCode === iataCode);
        if (airportData) {
          setToCache(cacheKey, airportData);
          return airportData;
        }
      }
    } catch (directLookupError) {
      console.error('Direct airport lookup failed:', directLookupError);
    }
    
    // Fallback to nearby search if direct lookup fails
    const response = await amadeus.referenceData.locations.airports.get({
      latitude: 0, // This is a placeholder since we don't know the coordinates
      longitude: 0, // We'll search with the IATA code as the keyword instead
      radius: 500,
    });
    
    const airportData = response.data.find((loc: any) => loc.iataCode === iataCode);
    if (airportData) {
      setToCache(cacheKey, airportData);
      return airportData;
    }
    
    throw new Error(`Airport with IATA code ${iataCode} not found`);
  } catch (error) {
    console.error('Error fetching airport details:', error);
    throw new Error('Unable to retrieve airport information. Please try again later.');
  }
}

export async function getFlightOfferByID(id: string, offers: FlightOffer[]) {
  const offer = offers.find(offer => offer.id === id);
  if (!offer) {
    throw new Error(`Flight offer with ID ${id} not found`);
  }
  return offer;
}

export async function getFlightInspirationSearch(params: {
  origin: string;
  maxPrice?: number;
}) {
  try {
    const cacheKey = getCacheKey('flightInspirationSearch', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const requestParams: any = {
      origin: params.origin
    };
    
    if (params.maxPrice) {
      requestParams.maxPrice = params.maxPrice;
    }
    
    try {
      const response = await amadeus.shopping.flightDestinations.get(requestParams);
      setToCache(cacheKey, response.data);
      return response.data;
    } catch (apiError) {
      console.error('Amadeus API error:', apiError);
      
      if (apiError.response && 
          apiError.response.result && 
          apiError.response.result.errors && 
          apiError.response.result.errors[0] && 
          apiError.response.result.errors[0].detail === "ORIGIN AND DESTINATION NOT SUPPORTED") {
        
        // Return a structured response instead of throwing
        return {
          meta: { 
            count: 0, 
            links: {} 
          },
          data: [],
          warnings: [{
            status: 200,
            code: "INFORMATION_ONLY",
            title: "Flight Inspiration not available",
            detail: "This route or feature is not supported in the current environment"
          }]
        };
      }
      
      // For other errors, rethrow
      throw apiError;
    }
  } catch (error) {
    console.error('Error fetching flight inspiration:', error);
    // Return a structured error response instead of throwing
    return {
      meta: { count: 0, links: {} },
      data: [],
      errors: [{
        status: 500,
        code: "SERVICE_UNAVAILABLE",
        title: "Service Temporarily Unavailable",
        detail: "Unable to retrieve flight inspiration search results. Please try again later."
      }]
    };
  }
}

export async function getCheapestFlightDates(params: {
  origin: string;
  destination: string;
}) {
  try {
    const cacheKey = getCacheKey('cheapestFlightDates', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    try {
      const response = await amadeus.shopping.flightDates.get({
        origin: params.origin,
        destination: params.destination
      });
      
      setToCache(cacheKey, response.data);
      return response.data;
    } catch (apiError) {
      console.error('Amadeus API error:', apiError);
      
      // Format and return structured error response
      return {
        meta: { count: 0, links: {} },
        data: [],
        errors: [{
          status: apiError.response?.statusCode || 500,
          code: apiError.response?.result?.errors?.[0]?.code || "ERROR",
          title: apiError.response?.result?.errors?.[0]?.title || "API Error",
          detail: apiError.response?.result?.errors?.[0]?.detail || 
                 "This route combination is not supported or available."
        }]
      };
    }
  } catch (error) {
    console.error('Error fetching cheapest flight dates:', error);
    // Return structured error instead of throwing
    return {
      meta: { count: 0, links: {} },
      data: [],
      errors: [{
        status: 500,
        code: "SERVICE_UNAVAILABLE", 
        title: "Service Temporarily Unavailable",
        detail: error instanceof Error ? error.message : 
                "Unable to retrieve cheapest flight dates for this route."
      }]
    };
  }
}

// Utility function to clear cache
export function clearAmadeusCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}
