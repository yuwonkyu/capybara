"use client";

import { useMemo, useState } from "react";
import type { MemberInfo } from "@/lib/members";
import { MemberRole, ROLE_LABELS, ROLE_ORDER } from "@/lib/types";

type AdminMembersProps = {
  initialMembers: MemberInfo[];
  currentUserId: string;
};

const roleBadgeClass: Record<MemberRole, string> = {
  master: "bg-mint text-mintdeep",
  submaster: "bg-sky/50 text-skydeep",
  staff: "bg-sky/30 text-skydeep",
  veteran: "bg-amber-100 text-amber-700",
  member: "bg-cream text-ink/70",
  sprout: "bg-sand/40 text-ink/60",
};

const AdminMembers = ({
  initialMembers,
  currentUserId,
}: AdminMembersProps): JSX.Element => {
  const [members, setMembers] = useState<MemberInfo[]>(initialMembers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // 등급 배지를 눌러 해당 등급만 골라 본다 (null이면 전체)
  const [filterRole, setFilterRole] = useState<MemberRole | null>(null);

  const counts = useMemo(() => {
    const map = new Map<MemberRole, number>();
    for (const m of members) map.set(m.role, (map.get(m.role) ?? 0) + 1);
    return map;
  }, [members]);

  const visibleMembers = useMemo(
    () => (filterRole ? members.filter((m) => m.role === filterRole) : members),
    [members, filterRole]
  );

  const handleRoleChange = async (userId: string, role: MemberRole) => {
    setError(null);
    setNotice(null);
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "등급 변경에 실패했습니다.");
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role } : m))
      );
      setNotice("등급을 변경했어요.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등급 변경에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  const handleKick = async (member: MemberInfo) => {
    if (
      !window.confirm(
        `'${member.nickname}' 님을 추방할까요?\n추방하면 계정 정보가 삭제되며, 다시 로그인하면 새싹으로 재가입됩니다.`
      )
    ) {
      return;
    }

    setError(null);
    setNotice(null);
    setBusyId(member.userId);
    try {
      const res = await fetch(`/api/admin/members/${member.userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "추방에 실패했습니다.");
      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
      setNotice(`'${member.nickname}' 님을 추방했어요.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "추방에 실패했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="cute-card">
      <h1 className="title mb-1">길드원 관리</h1>
      <p className="font-body text-sm text-ink/60">
        가입한 길드원의 등급을 변경하거나 추방할 수 있어요. (총 {members.length}명)
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilterRole(null)}
          className={`font-body rounded-full px-3 py-1 text-xs font-semibold transition ${
            filterRole === null
              ? "bg-mintdeep text-white"
              : "border border-sand bg-white text-ink/60 hover:bg-cream"
          }`}
        >
          전체 {members.length}
        </button>

        {ROLE_ORDER.map((role) => {
          const selected = filterRole === role;
          return (
            <button
              key={role}
              type="button"
              // 같은 등급을 다시 누르면 전체로 돌아온다
              onClick={() => setFilterRole(selected ? null : role)}
              className={`font-body rounded-full px-3 py-1 text-xs font-semibold transition ${
                roleBadgeClass[role]
              } ${
                selected
                  ? "ring-2 ring-mintdeep ring-offset-1"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {ROLE_LABELS[role]} {counts.get(role) ?? 0}
            </button>
          );
        })}
      </div>

      {error && <p className="font-body mt-3 text-sm text-red-500">{error}</p>}
      {notice && <p className="font-body mt-3 text-sm text-mintdeep">{notice}</p>}

      {filterRole && (
        <p className="font-body mt-3 text-xs text-ink/50">
          <b className="text-mintdeep">{ROLE_LABELS[filterRole]}</b> 등급만 보는
          중이에요. 배지를 다시 누르면 전체가 보입니다.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {visibleMembers.length === 0 && (
          <p className="font-body p-6 text-center text-sm text-ink/50">
            해당 등급의 길드원이 없어요.
          </p>
        )}

        {visibleMembers.map((member) => {
          const isSelf = member.userId === currentUserId;
          return (
            <div
              key={member.userId}
              className="list-item flex flex-wrap items-center gap-3"
            >
              {member.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.avatarUrl}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full border border-sand object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-sand bg-cream font-display text-sm text-mintdeep">
                  {member.nickname.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-body truncate text-sm font-semibold text-ink">
                  {member.nickname}
                  {isSelf && <span className="ml-1 text-xs text-ink/40">(나)</span>}
                </p>
                <span
                  className={`font-body mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleBadgeClass[member.role]}`}
                >
                  {ROLE_LABELS[member.role]}
                </span>
              </div>

              <select
                value={member.role}
                disabled={busyId === member.userId}
                onChange={(e) =>
                  handleRoleChange(member.userId, e.target.value as MemberRole)
                }
                className="font-body rounded-lg border border-sand bg-white px-2 py-1.5 text-sm text-ink/80"
              >
                {ROLE_ORDER.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleKick(member)}
                disabled={busyId === member.userId || isSelf}
                className="font-body rounded-full border border-sand bg-white px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-50 disabled:opacity-40"
              >
                추방
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AdminMembers;
