export type Priority = 'High' | 'Medium' | 'Low';

export type Task = {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string; // ISO String
};

export type Column = {
  id: string;
  title: string;
};
