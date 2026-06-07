export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string | null;
  type: "single" | "multiple";
  deadline: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  creatorId: string;
  creator: {
    id: string;
    email: string;
    name?: string | null;
  };
  options: PollOption[];
  totalVotes: number;
  hasVoted?: boolean;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  options: string[];
  type: "single" | "multiple";
  deadline: string;
}

export interface VoteInput {
  optionIds: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date | string;
  userId: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
}
