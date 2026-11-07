"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, FolderKanban, Plus, Save, Search, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TaskBusiness, TaskCategory, TaskDepartment, TaskMember, TaskRecord } from "@/lib/tasks/server";

type Props = { tasks:TaskRecord[]; businesses:TaskBusiness[]; departments:TaskDepartment[]; categories:TaskCategory[]; members:TaskMember[] };
type Draft = {
  id:string; title:string; description:string; businessId:string; departmentId:string; assigneeId:string;
  status:TaskRecord["status"]; priority:TaskRecord["priority"]; dueDate:string; dueTime:string; categoryIds:string[];
};
const statusLabels = {todo:"未着手",in_progress:"進行中",waiting:"確認待ち",done:"完了",archived:"アーカイブ"} as const;
const priorityLabels = {low:"低",normal:"通常",high:"高",urgent:"緊急"} as const;
const empty:Draft = {id:"",title:"",description:"",businessId:"",departmentId:"",assigneeId:"",status:"todo",priority:"normal",dueDate:"",dueTime:"",categoryIds:[]};
const selectClass = "admin-field h-10 w-full rounded-xl border border-border bg-background px-3 text-sm";
const labelClass = "mb-1.5 block text-xs font-semibold text-foreground/80";

function toDraft(t:TaskRecord):Draft {
  return {id:t.id,title:t.title,description:t.description,businessId:t.business_id||"",
    departmentId:t.department_id||"",assigneeId:t.assignee_id||"",status:t.status,priority:t.priority,
    dueDate:t.due_date||"",dueTime:t.due_time?.slice(0,5)||"",categoryIds:[...t.category_ids]};
}
function todayJst() {
  return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tokyo",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
}
function currentTimeJst() {
  return new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tokyo",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date());
}
async function post(url:string,body:unknown) {
  const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await response.json() as {id?:string;error?:string};
  if(!response.ok) throw new Error(data.error||"保存に失敗しました。");
  return data;
}

export function TaskWorkspace({tasks,businesses,departments,categories,members}:Props) {
  const router=useRouter();
  const [draft,setDraft]=React.useState<Draft|null>(null);
  const [taxonomyOpen,setTaxonomyOpen]=React.useState(false);
  const [taxonomyKind,setTaxonomyKind]=React.useState<"business"|"department"|"category">("business");
  const [taxonomyName,setTaxonomyName]=React.useState("");
  const [taxonomyBusiness,setTaxonomyBusiness]=React.useState("");
  const [taxonomyColor,setTaxonomyColor]=React.useState("sky");
  const [filter,setFilter]=React.useState({query:"",status:"active",business:"",category:"",assignee:""});
  const [view,setView]=React.useState<"list"|"business">("list");
  const [working,setWorking]=React.useState(false);
  const [error,setError]=React.useState("");
  const today=todayJst(),now=currentTimeJst();
  const active=tasks.filter(t=>t.status!=="done"&&t.status!=="archived");
  const dueToday=active.filter(t=>t.due_date===today).length;
  const overdue=active.filter(t=>Boolean(t.due_date&&(t.due_date<today||(t.due_date===today&&t.due_time&&t.due_time.slice(0,5)<now)))).length;
  const filtered=tasks.filter(t=>{
    if(filter.status==="active"&&(t.status==="done"||t.status==="archived"))return false;
    if(filter.status!=="active"&&filter.status!=="all"&&filter.status!==t.status)return false;
    if(filter.business&&filter.business!==t.business_id)return false;
    if(filter.category&&!t.category_ids.includes(filter.category))return false;
    if(filter.assignee&&filter.assignee!==t.assignee_id)return false;
    if(filter.query&&!((t.title+" "+t.description).toLowerCase().includes(filter.query.toLowerCase())))return false;
    return true;
  }).sort((a,b)=>{
    const aa=Number(a.status==="done"||a.status==="archived");
    const bb=Number(b.status==="done"||b.status==="archived");
    if(aa!==bb)return aa-bb;
    const day=(a.due_date||"9999-12-31").localeCompare(b.due_date||"9999-12-31");
    if(day)return day;
    const time=(a.due_time||"23:59").localeCompare(b.due_time||"23:59");
    if(time)return time;
    const ranks={urgent:0,high:1,normal:2,low:3};
    return ranks[a.priority]-ranks[b.priority]||b.created_at.localeCompare(a.created_at);
  });
  const memberName=(id:string|null)=>members.find(m=>m.user_id===id)?.display_name||"担当者なし";
  const businessName=(id:string|null)=>businesses.find(b=>b.id===id)?.name||"事業未設定";
  const departmentName=(id:string|null)=>departments.find(b=>b.id===id)?.name||"";
  const openTask=(task?:TaskRecord)=>{
    setError("");setTaxonomyOpen(false);setDraft(task?toDraft(task):{...empty,categoryIds:[]});
  };
  const save=async(e:React.FormEvent)=>{
    e.preventDefault();if(!draft||working)return;
    setWorking(true);setError("");
    try{await post("/api/admin/tasks",draft);setDraft(null);router.refresh();}
    catch(e){setError(e instanceof Error?e.message:"保存に失敗しました。");}
    finally{setWorking(false);}
  };
  const createTaxonomy=async(e:React.FormEvent)=>{
    e.preventDefault();if(working)return;
    setWorking(true);setError("");
    try{
      await post("/api/admin/tasks/taxonomy",{kind:taxonomyKind,name:taxonomyName,
        ...(taxonomyKind==="department"?{businessId:taxonomyBusiness}:{color:taxonomyColor})});
      setTaxonomyName("");router.refresh();
    }catch(e){setError(e instanceof Error?e.message:"分類を保存できませんでした。");}
    finally{setWorking(false);}
  };
  const row=(t:TaskRecord)=>(
    <button key={t.id} type="button" onClick={()=>openTask(t)}
      className="flex w-full flex-col gap-2 border-b border-border/70 px-5 py-4 text-left last:border-0 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-5">
      <span className="hidden shrink-0 text-muted-foreground sm:block">{t.status==="done"?<CheckCircle2 className="size-5 text-emerald-600"/>:<span className="block size-5 rounded-full border-2 border-border"/>}</span>
      <span className="min-w-0 flex-1">
        <span className={"block text-sm font-semibold "+(t.status==="done"?"text-muted-foreground line-through":"")}>{t.title}</span>
        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{businessName(t.business_id)}</span>
          {t.department_id?<span>/ {departmentName(t.department_id)}</span>:null}
          <span>· {statusLabels[t.status]}</span>
          {t.assignee_id?<span>· {memberName(t.assignee_id)}</span>:null}
          {t.category_ids.map(id=>{const cat=categories.find(c=>c.id===id);return cat?<span key={id} className="rounded bg-muted px-1.5 py-0.5">{cat.name}</span>:null;})}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-4 text-xs">
        <span className={t.priority==="urgent"?"font-semibold text-rose-600":t.priority==="high"?"font-semibold text-amber-600":"text-muted-foreground"}>{priorityLabels[t.priority]}</span>
        <span className={"flex min-w-28 items-center gap-1 font-medium "+(t.status!=="done"&&t.due_date&&(t.due_date<today||(t.due_date===today&&t.due_time&&t.due_time.slice(0,5)<now))?"text-rose-600":t.due_date===today&&t.status!=="done"?"text-amber-600":"text-muted-foreground")}>
          <CalendarDays className="size-3.5"/>{t.due_date||"期限なし"} {t.due_time?.slice(0,5)||""}
        </span>
      </span>
    </button>
  );
  const updateDraft=(fields:Partial<Draft>)=>setDraft(prev=>prev?{...prev,...fields}:prev);
  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-semibold tracking-widest text-primary">OPERATIONS / TASKS</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold"><FolderKanban className="size-8 text-primary"/>タスク管理</h1>
      <p className="mt-2 text-sm text-muted-foreground">事業・事業部・カテゴリ別の分類と、日付・時刻まで指定できる期限管理。</p></div>
      <div className="flex gap-2"><Button type="button" variant="outline" className="h-10 rounded-xl" onClick={()=>{setError("");setDraft(null);setTaxonomyOpen(!taxonomyOpen);}}><Settings2 className="size-4"/>分類管理</Button><Button type="button" className="h-10 rounded-xl" onClick={()=>openTask()}><Plus className="size-4"/>タスクを追加</Button></div>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["未完了",active.length],["今日が期限",dueToday],["期限超過",overdue],["完了",tasks.filter(t=>t.status==="done").length]].map(([name,count])=>
        <div key={name} className="admin-surface p-5"><p className="text-xs text-muted-foreground">{name}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{count}</p></div>
      )}
    </div>

    {taxonomyOpen?<section className="admin-surface space-y-4 p-5">
      <div className="flex justify-between"><div><h2 className="font-semibold">事業・事業部・カテゴリを追加</h2><p className="text-xs text-muted-foreground">事業に事業部を紐付け、カテゴリはタスクに複数設定できます。</p></div><button type="button" aria-label="閉じる" onClick={()=>setTaxonomyOpen(false)}><X className="size-5"/></button></div>
      <form onSubmit={createTaxonomy} className="grid gap-3 sm:grid-cols-[160px_1fr_180px_auto] sm:items-end">
        <label><span className={labelClass}>種類</span><select className={selectClass} value={taxonomyKind} onChange={e=>setTaxonomyKind(e.target.value as typeof taxonomyKind)}><option value="business">事業</option><option value="department">事業部</option><option value="category">カテゴリ</option></select></label>
        <label><span className={labelClass}>名称</span><Input className="h-10 rounded-xl" value={taxonomyName} onChange={e=>setTaxonomyName(e.target.value)} required maxLength={100}/></label>
        {taxonomyKind==="department"?<label><span className={labelClass}>所属事業</span><select className={selectClass} value={taxonomyBusiness} onChange={e=>setTaxonomyBusiness(e.target.value)} required><option value="">選択してください</option>{businesses.filter(b=>b.is_active).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>:<label><span className={labelClass}>カラー</span><select className={selectClass} value={taxonomyColor} onChange={e=>setTaxonomyColor(e.target.value)}>{["slate","sky","emerald","amber","orange","rose","violet","cyan"].map(c=><option key={c} value={c}>{c}</option>)}</select></label>}
        <Button type="submit" className="h-10 rounded-xl" disabled={working}>{working?"保存中…":"追加する"}</Button>
      </form>
      <div className="grid gap-3 border-t border-border pt-3 text-xs text-muted-foreground sm:grid-cols-3">
        <p><strong className="block text-foreground">事業</strong>{businesses.map(x=>x.name).join("・")||"未登録"}</p>
        <p><strong className="block text-foreground">事業部</strong>{departments.map(x=>x.name).join("・")||"未登録"}</p>
        <p><strong className="block text-foreground">カテゴリ</strong>{categories.map(x=>x.name).join("・")||"未登録"}</p>
      </div>
      {error?<p role="alert" className="text-sm text-rose-600">{error}</p>:null}
    </section>:null}

    {draft?<section className="admin-surface overflow-hidden">
      <div className="flex justify-between border-b border-border p-5"><div><h2 className="text-lg font-semibold">{draft.id?"タスクを編集":"新しいタスク"}</h2><p className="text-xs text-muted-foreground">期限は日付のみ、または日付＋時刻を選べます。</p></div><button type="button" aria-label="編集を閉じる" onClick={()=>setDraft(null)}><X className="size-5"/></button></div>
      <form onSubmit={save} className="space-y-5 p-5">
        <label className="block"><span className={labelClass}>タスク名 *</span><Input className="h-10 rounded-xl" autoFocus value={draft.title} maxLength={200} onChange={e=>updateDraft({title:e.target.value})} required/></label>
        <label className="block"><span className={labelClass}>詳細・メモ</span><Textarea value={draft.description} maxLength={5000} onChange={e=>updateDraft({description:e.target.value})} rows={3}/></label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label><span className={labelClass}>事業</span><select className={selectClass} value={draft.businessId} onChange={e=>updateDraft({businessId:e.target.value,departmentId:""})}><option value="">未設定</option>{businesses.filter(b=>b.is_active||b.id===draft.businessId).map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label><span className={labelClass}>事業部</span><select className={selectClass} value={draft.departmentId} disabled={!draft.businessId} onChange={e=>updateDraft({departmentId:e.target.value})}><option value="">未設定</option>{departments.filter(d=>d.business_id===draft.businessId&&(d.is_active||d.id===draft.departmentId)).map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <label><span className={labelClass}>担当者</span><select className={selectClass} value={draft.assigneeId} onChange={e=>updateDraft({assigneeId:e.target.value})}><option value="">未割当</option>{members.map(m=><option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}</select></label>
          <label><span className={labelClass}>状態</span><select className={selectClass} value={draft.status} onChange={e=>updateDraft({status:e.target.value as Draft["status"]})}>{Object.entries(statusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label><span className={labelClass}>優先度</span><select className={selectClass} value={draft.priority} onChange={e=>updateDraft({priority:e.target.value as Draft["priority"]})}>{Object.entries(priorityLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
          <label><span className={labelClass}>期限日</span><Input type="date" className="h-10 rounded-xl" value={draft.dueDate} onChange={e=>updateDraft({dueDate:e.target.value,dueTime:e.target.value?draft.dueTime:""})}/></label>
          <label><span className={labelClass}>期限時刻（任意）</span><Input type="time" className="h-10 rounded-xl" disabled={!draft.dueDate} value={draft.dueTime} onChange={e=>updateDraft({dueTime:e.target.value})}/><span className="mt-1 block text-xs text-muted-foreground">日本時間</span></label>
        </div>
        <div><p className={labelClass}>カテゴリ（複数選択可能）</p><div className="flex flex-wrap gap-2">{categories.filter(c=>c.is_active||draft.categoryIds.includes(c.id)).map(c=><label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"><input type="checkbox" checked={draft.categoryIds.includes(c.id)} onChange={e=>updateDraft({categoryIds:e.target.checked?[...draft.categoryIds,c.id]:draft.categoryIds.filter(id=>id!==c.id)})}/>{c.name}</label>)}{!categories.length?<p className="text-xs text-muted-foreground">「分類管理」からカテゴリを追加できます。</p>:null}</div></div>
        {error?<p role="alert" className="text-sm text-rose-600">{error}</p>:null}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" className="h-10 rounded-xl" onClick={()=>setDraft(null)}>キャンセル</Button><Button type="submit" className="h-10 rounded-xl" disabled={working}><Save className="size-4"/>{working?"保存中…":"保存する"}</Button></div>
      </form>
    </section>:null}

    <section className="admin-surface overflow-hidden">
      <div className="space-y-4 border-b border-border p-5">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">タスク一覧</h2><p className="text-xs text-muted-foreground">期日・時刻・優先度の順に並べ替え</p></div><select aria-label="表示方法" className={selectClass+" max-w-36"} value={view} onChange={e=>setView(e.target.value as typeof view)}><option value="list">リスト表示</option><option value="business">事業別表示</option></select></div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"/><Input aria-label="タスク名で検索" placeholder="検索" className="h-10 rounded-xl pl-9" value={filter.query} onChange={e=>setFilter({...filter,query:e.target.value})}/></label>
          <select aria-label="事業で絞り込み" className={selectClass} value={filter.business} onChange={e=>setFilter({...filter,business:e.target.value})}><option value="">すべての事業</option>{businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <select aria-label="状態で絞り込み" className={selectClass} value={filter.status} onChange={e=>setFilter({...filter,status:e.target.value})}><option value="active">未完了のみ</option><option value="all">すべての状態</option>{Object.entries(statusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
          <select aria-label="カテゴリで絞り込み" className={selectClass} value={filter.category} onChange={e=>setFilter({...filter,category:e.target.value})}><option value="">すべてのカテゴリ</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select aria-label="担当者で絞り込み" className={selectClass} value={filter.assignee} onChange={e=>setFilter({...filter,assignee:e.target.value})}><option value="">すべての担当者</option>{members.map(m=><option key={m.user_id} value={m.user_id}>{m.display_name}</option>)}</select>
        </div>
      </div>
      <p className="px-5 py-3 text-xs text-muted-foreground">{filtered.length}件表示 / Asia/Tokyo基準</p>
      {!filtered.length?<div className="px-6 py-16 text-center"><p className="font-semibold">該当するタスクはありません</p><p className="mt-1 text-sm text-muted-foreground">新規タスクを追加するか、絞り込み条件を変更してください。</p></div>:
        view==="list"?<div>{filtered.map(row)}</div>:
        <div className="grid gap-4 p-4 lg:grid-cols-2">{[...businesses.map(b=>({id:b.id,name:b.name})),{id:"",name:"事業未設定"}].map(b=>{
          const list=filtered.filter(t=>(t.business_id||"")===b.id);
          return list.length?<div key={b.id} className="overflow-hidden rounded-xl border border-border"><p className="border-b border-border bg-muted/30 px-5 py-3 text-sm font-semibold">{b.name} · {list.length}件</p>{list.map(row)}</div>:null;
        })}</div>}
      {tasks.length===1000?<p className="border-t border-border p-4 text-xs text-muted-foreground">最新1,000件を表示しています。</p>:null}
    </section>
  </div>;
}
