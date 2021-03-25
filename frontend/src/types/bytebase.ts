import { ResourceObject } from "./jsonapi";
import { BBNotificationStyle } from "../bbkit/types";
import { TaskFieldId } from "../plugins";

export const UNKNOWN_ID = "-1";

// These ID format may change in the future, so we encapsulate with a type.
// Also good for readability.
export type UserId = string;

// For now, Principal is equal to UserId, in the future it may contain other id such as application, bot etc.
export type PrincipalId = UserId;

export type RoleMappingId = string;

export type BookmarkId = string;

export type StageId = string;

export type TaskId = string;

export type ActivityId = string;

export type EnvironmentId = string;

export type InstanceId = string;

export type DataSourceId = string;

export type DatabaseId = string;
// This is a placeholder database id which will later be converted to
// the actual database id referencing all databases.
export const ALL_DATABASE_PLACEHOLDER_ID = "0";
export const ALL_DATABASE_NAME: string = "*";

export type CommandId = string;
export type CommandRegisterId = string;

// Persistent State Models

// RoleMapping
export type RoleType = "OWNER" | "DBA" | "DEVELOPER" | "GUEST";

export type RoleMapping = {
  id: RoleMappingId;
  createdTs: number;
  lastUpdatedTs: number;
  role: RoleType;
  principalId: PrincipalId;
  updaterId: PrincipalId;
};

export type RoleMappingNew = {
  principalId: PrincipalId;
  email: string;
  role: RoleType;
  updaterId: PrincipalId;
};

export type RoleMappingPatch = {
  id: RoleMappingId;
  role: RoleType;
};

// Principal
// This is a facet of the underlying identity entity.
// For now, there is only user type. In the future,
// we may support application/bot identity.
export type PrincipalStatus = "UNKNOWN" | "INVITED" | "ACTIVE";

export type Principal = {
  id: PrincipalId;
  status: PrincipalStatus;
  name: string;
  email: string;
  role: RoleType;
};

export type PrincipalNew = {
  email: string;
};

export type PrincipalPatch = {
  id: PrincipalId;
  name?: string;
};

export type User = {
  id: UserId;
  status: PrincipalStatus;
  name: string;
  email: string;
};
export type NewUser = Omit<User, "id">;

// Bookmark
export type Bookmark = {
  id: BookmarkId;
  name: string;
  link: string;
  creatorId: UserId;
};
export type BookmarkNew = Omit<Bookmark, "id">;

// Stage
export type StageType = "SIMPLE" | "ENVIRONMENT";

export type StageStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED" | "SKIPPED";

export type StageRunnable = {
  auto: boolean;
  run: () => void;
};

export type Stage = {
  id: StageId;
  name: string;
  type: StageType;
  environmentId?: EnvironmentId;
  runnable?: StageRunnable;
};

export type StageProgress = Stage & {
  status: StageStatus;
};

export type StageProgressPatch = {
  id: StageId;
  status: StageStatus;
};

// Task
type TaskTypeGeneral = "bytebase.general";

type TaskTypeDatabase =
  | "bytebase.database.request"
  | "bytebase.database.schema.update";

type TaskTypeDataSource = "bytebase.datasource.request";

export type TaskType = TaskTypeGeneral | TaskTypeDatabase | TaskTypeDataSource;

export type TaskStatus = "OPEN" | "DONE" | "CANCELED";

export type TaskPayload = { [key: string]: any };

export type Task = {
  id: TaskId;
  name: string;
  createdTs: number;
  lastUpdatedTs: number;
  status: TaskStatus;
  type: TaskType;
  description: string;
  stageProgressList: StageProgress[];
  creator: Principal;
  assignee?: Principal;
  subscriberList: Principal[];
  payload: TaskPayload;
};

export type TaskNew = {
  name: string;
  type: TaskType;
  description: string;
  stageProgressList: StageProgress[];
  creatorId: PrincipalId;
  assigneeId?: PrincipalId;
  subscriberIdList: PrincipalId[];
  payload: TaskPayload;
};

export type TaskPatch = {
  name?: string;
  status?: TaskStatus;
  description?: string;
  assigneeId?: PrincipalId;
  stageProgress?: StageProgressPatch;
  payload?: TaskPayload;
  comment?: string;
};

export type TaskStatusTransitionType = "RESOLVE" | "ABORT" | "REOPEN";

export interface TaskStatusTransition {
  type: TaskStatusTransitionType;
  actionName: string;
  to: TaskStatus;
}

export const TASK_STATUS_TRANSITION_LIST: Map<
  TaskStatusTransitionType,
  TaskStatusTransition
> = new Map([
  [
    "RESOLVE",
    {
      type: "RESOLVE",
      actionName: "Resolve",
      to: "DONE",
    },
  ],
  [
    "ABORT",
    {
      type: "ABORT",
      actionName: "Abort",
      to: "CANCELED",
    },
  ],
  [
    "REOPEN",
    {
      type: "REOPEN",
      actionName: "Reopen",
      to: "OPEN",
    },
  ],
]);

export type StageStatusTransitionType = "RUN" | "RETRY" | "STOP" | "SKIP";

export interface StageStatusTransition {
  type: StageStatusTransitionType;
  actionName: string;
  requireRunnable: boolean;
  to: StageStatus;
}

export const STAGE_TRANSITION_LIST: Map<
  StageStatusTransitionType,
  StageStatusTransition
> = new Map([
  [
    "RUN",
    {
      type: "RUN",
      actionName: "Run",
      requireRunnable: true,
      to: "RUNNING",
    },
  ],
  [
    "RETRY",
    {
      type: "RETRY",
      actionName: "Rerun",
      requireRunnable: true,
      to: "RUNNING",
    },
  ],
  [
    "STOP",
    {
      type: "STOP",
      actionName: "Stop",
      requireRunnable: true,
      to: "PENDING",
    },
  ],
  [
    "SKIP",
    {
      type: "SKIP",
      actionName: "Skip",
      requireRunnable: false,
      to: "SKIPPED",
    },
  ],
]);

// Activity
export type TaskActionType =
  | "bytebase.task.create"
  | "bytebase.task.comment.create"
  | "bytebase.task.field.update";

export type ActionType = TaskActionType;

export type ActionTaskFieldUpdatePayload = {
  changeList: {
    fieldId: TaskFieldId;
    oldValue?: string;
    newValue?: string;
  }[];
};

export type ActionPayloadType = ActionTaskFieldUpdatePayload;

export type Activity = {
  id: ActivityId;
  createdTs: number;
  lastUpdatedTs: number;
  actionType: ActionType;
  // The object where this activity belongs
  // e.g if actionType is "bytebase.task.xxx", then this field refers to the corresponding task's id.
  containerId: TaskId;
  creator: Principal;
  comment: string;
  payload?: ActionPayloadType;
};
export type ActivityNew = Omit<Activity, "id">;

export type ActivityPatch = {
  payload: any;
};

// Environment
export type Environment = {
  id: EnvironmentId;
  name: string;
  order: number;
};
export type EnvironmentNew = Omit<Environment, "id">;

// Instance
export type Instance = {
  id: InstanceId;
  createdTs: number;
  lastUpdatedTs: number;
  name: string;
  environment: Environment;
  externalLink?: string;
  host: string;
  port?: string;
};
export type InstanceNew = Omit<Instance, "id" | "createdTs" | "lastUpdatedTs">;

export type DataSourceType = "RW" | "RO";
// Data Source
export type DataSource = {
  id: DataSourceId;
  instanceId: InstanceId;
  name: string;
  createdTs: number;
  lastUpdatedTs: number;
  type: DataSourceType;
  // In mysql, username can be empty which means anonymous user
  username?: string;
  password?: string;
  // TODO: unlike other objects like environment, here we don't expand
  // to the database object, this is due to timing issue during rendering.
  // Unlike environment which is a global state that we can load upon
  // startup, the database info is per instance, and the author haven't
  // figured out a elegant way to guarantee it's loaded before the router
  // fetches the specific data source and requires the database info for
  // the conversion
  databaseId: DatabaseId;
  // Returns the member list directly because we need it quite frequently in order
  // to do various access check.
  memberList: DataSourceMember[];
};

export type DataSourceNew = {
  name: string;
  type: DataSourceType;
  databaseId: string;
  username?: string;
  password?: string;
  memberList: DataSourceMemberNew[];
};

export type DataSourceMember = {
  principal: Principal;
  taskId?: TaskId;
  createdTs: number;
};

export type DataSourceMemberNew = {
  principalId: PrincipalId;
  taskId?: TaskId;
};

// We periodically sync the underlying db schema and stores those info
// in the "database" object.

// "OK" means find the exact match
// "MISMATCH" means we find the database with the same name, but the fingerprint is different,
//            this usually indicates the underlying database has been recreated (might for a entirely different purpose)
// "NOT_FOUND" means no matching database name found, this ususally means someone changes
//            the underlying db name.
export type DatabaseSyncStatus = "OK" | "MISMATCH" | "NOT_FOUND";
// Database
export type Database = {
  id: DatabaseId;
  name: string;
  createdTs: number;
  lastUpdatedTs: number;
  ownerId: PrincipalId;
  syncStatus: DatabaseSyncStatus;
  lastSuccessfulSyncTs: number;
  fingerprint: string;
  instance: Instance;
};

export type DatabaseNew = {
  name: string;
  instanceId: InstanceId;
  ownerId: PrincipalId;
  creatorId: PrincipalId;
  taskId?: TaskId;
};

export type DatabasePatch = {
  ownerId: PrincipalId;
};

// Auth
export type LoginInfo = {
  email: string;
  password: string;
};

export type SignupInfo = {
  email: string;
  password: string;
  name: string;
};

export type ActivateInfo = {
  email: string;
  password: string;
  name: string;
  token: string;
};

// UI State Models
export type RouterSlug = {
  taskSlug?: string;
  instanceSlug?: string;
  databaseSlug?: string;
  dataSourceSlug?: string;
  principalId?: PrincipalId;
};

export type Notification = {
  id: string;
  createdTs: number;
  module: string;
  style: BBNotificationStyle;
  title: string;
  description?: string;
  link?: string;
  linkTitle?: string;
  manualHide?: boolean;
};

export type Command = {
  id: CommandId;
  registerId: CommandRegisterId;
  run: () => void;
};

// Notification
// "id" and "createdTs" is auto generated upon the notification store
// receives.
export type NewNotification = Omit<Notification, "id" | "createdTs">;

export type NotificationFilter = {
  module: string;
  id?: string;
};

// Quick Action Type
export type EnvironmentQuickActionType =
  | "quickaction.bytebase.environment.create"
  | "quickaction.bytebase.environment.reorder";
export type InstanceQuickActionType = "quickaction.bytebase.instance.create";
export type UserQuickActionType = "quickaction.bytebase.user.manage";
export type DatabaseQuickActionType =
  | "quickaction.bytebase.database.request"
  | "quickaction.bytebase.database.create"
  | "quickaction.bytebase.database.schema.update"
  | "quickaction.bytebase.database.troubleshoot";

export type QuickActionType =
  | EnvironmentQuickActionType
  | InstanceQuickActionType
  | UserQuickActionType
  | DatabaseQuickActionType;

// Store
export interface AuthState {
  currentUser: Principal;
}

export interface RoleMappingState {
  roleMappingList: RoleMapping[];
}

export interface PrincipalState {
  principalList: Principal[];
}

export interface BookmarkState {
  bookmarkListByUser: Map<UserId, Bookmark[]>;
}

export interface ActivityState {
  activityListByUser: Map<UserId, Activity[]>;
  activityListByTask: Map<TaskId, Activity[]>;
}

export interface TaskState {
  taskListByUser: Map<UserId, Task[]>;
  taskById: Map<TaskId, Task>;
}

export interface EnvironmentState {
  environmentList: Environment[];
}

export interface InstanceState {
  instanceById: Map<InstanceId, Instance>;
}

export interface DataSourceState {
  dataSourceListByInstanceId: Map<InstanceId, DataSource[]>;
}

export interface DatabaseState {
  databaseListByInstanceId: Map<InstanceId, Database[]>;
  // It would be quite expensive to find user's data source list
  // if iterating through dataSourceListByInstanceId. so we create
  // a separate map for quick access.
  // NOTE: For the same database, we don't reconcile the state between
  // the 2 maps, which means each map may contain a different state for
  // that database.
  databaseListByUserId: Map<UserId, Database[]>;
  // Similar to databaseListByUserId
  databaseListByEnvironmentId: Map<EnvironmentId, Database[]>;
}

export interface NotificationState {
  notificationByModule: Map<string, Notification[]>;
}

export interface CommandState {
  commandListById: Map<CommandId, Command[]>;
}
