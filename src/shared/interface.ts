export interface INews {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  text: string;
}
export interface INewsWithComment {
  commentCount: number;
  news: INews;
}

export interface IComment {
  id: number;
  created_at: string;
  updated_at: string;
  text: string;
  news_id: number;
  username: string;
}

export interface IStoreNewsError {
  errors: {
    title: string[];
    text: string[];
  };
}

export interface IStoreCommentError {
  errors: {
    text: string[];
  };
}

export interface IActivity {
  name: string;
  weight: number;
  description: string;
}

export interface IUser {
  username: string;
  name: string;
  surname: string;
  email: string;
}

export interface IStoreUserError {
  errors: {
    username: string[];
    name: string[];
    surname: string[];
    email: string[];
    password: string[];
  };
}

export interface IUserActivity {
  activity: string;
  username: string;
}

export interface IUserActivityTable {
  users: IUser[];
  activities: IActivity[];
  done: IUserActivity[];
}

export interface IAttendace {
  attendance_day_id: number;
  username: string;
}

export interface IAttendanceDay {
  id: number;
  date: string;
}

export interface IAttendanceUserTable {
  users: IUser[];
  attendanceDays: IAttendanceDay[];
  attendance: IAttendace[];
}

export interface IGame {
  id: number;
  black: string;
  white: string;
  winner: string;
  pgn: string;
}

export interface ITournament {
  id: number;
  title: string;
  date: string;
  description: string;
  users_count?: number;
  users?: IUser[];
  games: IGame[];
}

export interface INews {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  text: string;
}

export interface IEvent {
  id: number;
  name: string;
  date: string;
  description: string;
}

export interface IEventResponse {
  upcoming: IEvent[];
  passed: IEvent[];
}

export interface IToken {
  token: string;
  username: string;
  role: string;
}

export interface ILoginResponse {
  data: IToken;
}

export interface IInfoTournament {
  id: string;
  title: string;
  date: string;
}

export interface IInfo {
  activities: IActivity[];
  doneActivities: { name: string; weight: number }[];
  attendance: IAttendanceDay[];
  attended: { id: number }[];
  tournaments: IInfoTournament[];
  order: number;
  points: number;
}

export interface IUsernamePoints {
  username: string;
  activities_sum_weight: number;
}
