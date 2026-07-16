import { GuildName } from "@/lib/donations";

const DISCORD_API = "https://discord.com/api/v10";

export type DiscordAttachment = {
  url: string;
  content_type?: string;
  filename?: string;
};

export type DiscordMessage = {
  id: string;
  content: string;
  timestamp: string;
  author: {
    id: string;
    username: string;
    global_name?: string | null;
    bot?: boolean;
  };
  member?: { nick?: string | null } | null;
  attachments: DiscordAttachment[];
};

// 길드별 투자 인증 채널 (Vercel 환경변수로 설정)
export const getChannelConfig = (): { guild: GuildName; channelId: string }[] => {
  const config: { guild: GuildName; channelId?: string }[] = [
    { guild: "카피", channelId: process.env.DISCORD_CHANNEL_CAPY },
    { guild: "카피랜드", channelId: process.env.DISCORD_CHANNEL_CAPYLAND },
  ];

  return config.filter(
    (c): c is { guild: GuildName; channelId: string } => Boolean(c.channelId)
  );
};

const discordFetch = async (path: string) => {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN 환경변수가 설정되지 않았습니다.");

  const res = await fetch(`${DISCORD_API}${path}`, {
    headers: { Authorization: `Bot ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`디스코드 API 오류 (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
};

export const fetchChannelMessages = async (
  channelId: string,
  limit = 100
): Promise<DiscordMessage[]> =>
  discordFetch(`/channels/${channelId}/messages?limit=${limit}`);

// 서버 닉네임(예: "전태영/저격수/104")을 가져온다. 실패하면 null.
export const fetchGuildNick = async (userId: string): Promise<string | null> => {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) return null;

  try {
    const member = await discordFetch(`/guilds/${guildId}/members/${userId}`);
    return (member?.nick as string) ?? null;
  } catch {
    return null;
  }
};

/**
 * 인증 메시지에서 투자 횟수를 읽는다.
 * 인정하는 양식: "!투자 2", "투자 2회", "투자2"
 * 매칭되지 않으면 null (일반 잡담은 무시)
 */
export const parseInvestCount = (content: string): number | null => {
  const match = content.match(/!?투자\s*(\d{1,3})\s*회?/);
  if (!match) return null;

  const count = Number(match[1]);
  if (!Number.isInteger(count) || count <= 0 || count > 100) return null;
  return count;
};

export const pickDisplayName = (message: DiscordMessage): string =>
  message.member?.nick ??
  message.author.global_name ??
  message.author.username;

/**
 * 길드 닉네임에서 게임 캐릭터명만 뽑아낸다.
 * 길드 규칙이 "닉네임/직업/레벨" 이라 앞부분만 사용한다.
 *
 * "전태영/저격수/104"   → "전태영"
 * "딘토 / 앜메 / 122"   → "딘토"
 * "깹비 보마 162"       → "깹비"   (공백 구분 + 끝이 레벨 숫자인 경우)
 * "친카피"              → "친카피" (구분자가 없으면 그대로)
 */
export const extractGameNick = (raw: string): string => {
  const value = raw.trim();

  // "닉네임/직업/레벨" (슬래시 앞뒤 공백 허용)
  if (value.includes("/")) {
    const first = value.split("/")[0].trim();
    if (first) return first;
  }

  // "닉네임 직업 레벨" 처럼 공백으로만 구분한 경우 (마지막이 레벨 숫자)
  const parts = value.split(/\s+/);
  if (parts.length >= 3 && /^\d{1,3}$/.test(parts[parts.length - 1])) {
    return parts[0];
  }

  return value;
};
