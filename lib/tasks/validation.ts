import { z } from "zod";

export const TASK_STATUSES = ["todo","in_progress","waiting","done","archived"] as const;
export const TASK_PRIORITIES = ["low","normal","high","urgent"] as const;

const optionalUuid = z.union([z.uuid(),z.literal(""),z.null()]).optional()
  .transform(value => value || null);
const day = z.union([z.iso.date(),z.literal(""),z.null()]).optional()
  .transform(value => value || null);
const clock = z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),z.literal(""),z.null()]).optional()
  .transform(value => value || null);
export const taskInputSchema = z.object({
  id: optionalUuid,
  title:z.string().trim().min(1).max(200),
  description:z.string().max(5000).default(""),
  businessId:optionalUuid,
  departmentId:optionalUuid,
  assigneeId:optionalUuid,
  status:z.enum(TASK_STATUSES).default("todo"),
  priority:z.enum(TASK_PRIORITIES).default("normal"),
  dueDate:day,
  dueTime:clock,
  categoryIds:z.array(z.uuid()).max(12).default([]),
}).superRefine((value,ctx)=>{
  if(value.departmentId && !value.businessId) ctx.addIssue({code:"custom",message:"事業部を選ぶ場合は事業を指定してください。",path:["departmentId"]});
  if(value.dueTime && !value.dueDate) ctx.addIssue({code:"custom",message:"期限時刻を設定する場合は日付を指定してください。",path:["dueDate"]});
});
export const taxonomyInputSchema = z.discriminatedUnion("kind",[
  z.object({kind:z.literal("business"),name:z.string().trim().min(1).max(100),color:z.enum(["slate","sky","emerald","amber","orange","rose","violet","cyan"]).default("sky")}),
  z.object({kind:z.literal("department"),name:z.string().trim().min(1).max(100),businessId:z.uuid()}),
  z.object({kind:z.literal("category"),name:z.string().trim().min(1).max(60),color:z.enum(["slate","sky","emerald","amber","orange","rose","violet","cyan"]).default("slate")}),
]);
