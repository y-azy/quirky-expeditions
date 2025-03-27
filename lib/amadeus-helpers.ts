import { amadeus } from './amadeus';
import { FlightOffer } from './amadeus';

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
    throw error;
  }
}

export async function getSeatMap(params: {
  flightOfferId?: string;
  flightOrderId?: string;
}) {
  try {
    const cacheKey = getCacheKey('seatmaps', params);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    let response;
    if (params.flightOfferId) {
      // When we have a flight offer, we need to use POST
      response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
          data: [{
            type: "flight-offers",
            id: params.flightOfferId
          }]
        })
      );
    } else if (params.flightOrderId) {
      // When we have a flight order, we use GET
      response = await amadeus.shopping.seatmaps.get({
        flightOrderId: params.flightOrderId
      });
    } else {
      throw new Error('Either flightOfferId or flightOrderId is required');
    }
    
    setToCache(cacheKey, response.data);
    return { data: response.data[0] };
  } catch (error) {
    console.error('Error fetching seat map:', error);
    throw error;
  }
}

export async function confirmFlightPrice(flightOffer: any) {
  try {
    const cacheKey = getCacheKey('flightOffersPrice', flightOffer);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      })
    );
    
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error confirming flight price:', error);
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
    throw error;
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
    throw new Error('No flight status found');
  } catch (error) {
    console.error('Error fetching flight status:', error);
    throw error;
  }
}

export async function searchAirports(keyword: string) {
  try {
    const cacheKey = getCacheKey('airportSearch', { keyword });
    const cachedData = getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT'
    });
    
    setToCache(cacheKey, response.data);
    return response.data;
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
    throw error;
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
    return { iataCode: airlineCode, businessName: airlineCode };
  } catch (error) {
    console.error('Error fetching airline details:', error);
    // Return a minimal object instead of throwing
    return { iataCode: airlineCode, businessName: airlineCode };
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
    throw error;
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
    // Return minimal information instead of throwing
    return { iataCode, name: iataCode };
  }
}

export async function getFlightOfferByID(id: string, offers: FlightOffer[]) {
  return offers.find(offer => offer.id === id);
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
    
    const response = await amadeus.shopping.flightDestinations.get(requestParams);
    
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching flight inspiration:', error);
    throw error;
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

    const response = await amadeus.shopping.flightDates.get({
      origin: params.origin,
      destination: params.destination
    });
    
    setToCache(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching cheapest flight dates:', error);
    throw error;
  }
}

// Utility function to clear cache
export function clearAmadeusCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}
