import axios from 'axios';
import { DinoxRequest, TaskResponse, TaskStatus } from '../types/api';

const API_BASE_URL = 'https://api.deepdataspace.com';
const MAX_RETRIES = 60;
const POLLING_INTERVAL = 1000;

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const analyzeDinox = async (request: DinoxRequest, token: string): Promise<TaskStatus> => {
  try {
    // Initial request to start the task
    const response = await axios.post<TaskResponse>(`${API_BASE_URL}/tasks/dinox`, request, {
      headers: {
        'Content-Type': 'application/json',
        'Token': token
      }
    });

    if (response.data.code !== 0) {
      throw new ApiError(response.data.msg || 'Failed to start analysis');
    }

    const taskUuid = response.data.data.task_uuid;
    
    // Poll for results
    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      const statusResponse = await axios.get<TaskStatus>(
        `${API_BASE_URL}/task_statuses/${taskUuid}`,
        { headers: { Token: token } }
      );

      const status = statusResponse.data.data.status;
      
      if (status === 'failed') {
        throw new ApiError(statusResponse.data.data.error || 'Analysis failed');
      }
      
      if (status === 'success') {
        return statusResponse.data;
      }

      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
      retryCount++;
    }

    throw new ApiError('Analysis timed out');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.data?.msg || error.message);
    }
    throw new ApiError('An unexpected error occurred');
  }
};