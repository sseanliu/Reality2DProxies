export interface DinoxPrompt {
  type: 'text';
  text: string;
}

export interface DinoxRequest {
  image: string;
  prompts: DinoxPrompt[];
}

export interface KeyPoint {
  x: number;
  y: number;
  score: number;
}

export interface DetectedObject {
  bbox: number[];
  category: string;
  hand: KeyPoint[] | null;
  pose: KeyPoint[] | null;
  mask: {
    counts: string;
    size: number[];
  };
  score: number;
}

export interface TaskResponse {
  code: number;
  data: {
    task_uuid: string;
  };
  msg: string;
}

export interface TaskStatus {
  code: number;
  data: {
    error: string;
    result: {
      objects: DetectedObject[];
    };
    session_id: string;
    status: 'waiting' | 'running' | 'success' | 'failed';
    uuid: string;
  };
  msg: string;
}