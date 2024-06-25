import axios from 'axios';
import { TAX_API_ENDPOINT } from 'src/config/const';

export interface TaxEntry {
  send_id: string;
  send_date: string;
  ns10: string;
  ns11: string;
  address: string;
  name: string;
  tin: string;
  count: string;
}

interface TaxResponse {
  success: boolean;
  code: number;
  text: null | string;
  data: unknown;
}

const request = axios.create({
  baseURL: TAX_API_ENDPOINT,
  timeout: 30000,
});

// Add a request interceptor
request.interceptors.request.use(
  (config: any) => {
    // Do something before request is sent
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  },
);

// Add a response interceptor
request.interceptors.response.use(
  (response) => {
    // Calculate the duration
    // @ts-expect-error Metadata
    const duration = new Date() - response.config.metadata.startTime;
    console.log(`Request to ${response.config.url} took ${duration} ms`);

    // Log the response data
    console.log('Response data:', response.data);

    return response;
  },
  (error) => {
    // @ts-expect-error Metadata
    const duration = new Date() - error.config.metadata.startTime;
    console.log(`Request to ${error.config.url} took ${duration} ms`);

    // Log the error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Error data:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error message:', error.message);
    }

    return Promise.reject(error);
  },
);

const sendEntry = async (entry: TaxEntry) => {
  console.log('SENDING ENTRY', Object.values(entry));
  // return request.post<TaxResponse>('involved-businessman', entry);
  return Promise.resolve({ data: { success: true } });
};

const Tax = {
  sendEntry,
};

export function stringifyIfObject(value) {
  console.log(value);
  // Check if the value is an object and not null or an array
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  return value;
}

export const formatSendDate = (date: string) => date + '  12:00:00';

export default Tax;
