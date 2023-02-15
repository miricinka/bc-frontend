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

export interface ITournament {
  id: number;
  title: string;
  date: string;
  description: string;
  users_count?: number;
  users?: IUser[];
}
