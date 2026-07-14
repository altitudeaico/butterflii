import type { Database, EventMode, Role, TaskOrigin, TaskStatus } from './database'

export type { EventMode, Role, TaskOrigin, TaskStatus }
export type Profile = Database['hq']['Tables']['profiles']['Row']
export type Event = Database['hq']['Tables']['events']['Row']
export type Objective = Database['hq']['Tables']['objectives']['Row']
export type Task = Database['hq']['Tables']['tasks']['Row']

export type NewEvent = Database['hq']['Tables']['events']['Insert']
export type NewObjective = Database['hq']['Tables']['objectives']['Insert']
export type NewTask = Database['hq']['Tables']['tasks']['Insert']
