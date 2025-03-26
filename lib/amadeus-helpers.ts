import { amadeus } from './amadeus';

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults?: string;
  returnDate?: string;
}) {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults || '1',
      returnDate: params.returnDate,
      max: 4
    });

    return response.data;
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

export async function getSeatMap(params: {
  flightOfferId: string;
}) {
  try {
    const response = await amadeus.shopping.seatmaps.get({
      flightOfferId: params.flightOfferId
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching seat map:', error);
    throw error;
  }
}

export async function confirmFlightPrice(flightOffer: any) {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer]
        }
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming flight price:', error);
    throw error;
  }
}

export async function createFlightOrder(params: {
  flightOffer: any;
  travelers: any[];
}) {
  try {
    const response = await amadeus.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers: [params.flightOffer],
          travelers: params.travelers
        }
      })
    );
    return response.data;
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
    const response = await amadeus.schedule.flights.get(params);
    return response.data[0];
  } catch (error) {
    console.error('Error fetching flight status:', error);
    throw error;
  }
}

export async function searchAirports(keyword: string) {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT'
    });
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
    const response = await amadeus.travel.predictions.flightDelay.get(params);
    return response.data;
  } catch (error) {
    console.error('Error getting flight delay prediction:', error);
    throw error;
  }
}

export async function getAirlineDetails(airlineCode: string) {
  try {
    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCode
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching airline details:', error);
    throw error;
  }
}

export async function getFlightPrice(params: {
  origin: string;
  destination: string;
  departureDate: string;
}) {
  try {
    const response = await amadeus.analytics.itineraryPriceMetrics.get({
      originIataCode: params.origin,
      destinationIataCode: params.destination,
      departureDate: params.departureDate,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching flight price metrics:', error);
    throw error;
  }
}

export async function getAirportDetails(iataCode: string) {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: iataCode,
      subType: 'AIRPORT'
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching airport details:', error);
    throw error;
  }
}
