import { randomUUID } from "crypto";
import type { ApiUser } from "@/lib/api/auth";
import { execute, query } from "@/lib/db/pool";
import { popularSortSql } from "@/lib/catalog/rating";

export type PromptRow = {
  id: string;
  created_by: string | null;
  title: string;
  description: string;
  body: string;
  usage_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: Date | string;
  tool_types: string | null;
  categories: string | null;
  tags: string | null;
  is_favorite: number;
};

export type PromptListQuery = {
  q?: string;
  toolTypes?: string[];
  categories?: string[];
  sort?: "all" | "popular" | "new";
  favoritesOnly?: boolean;
};

function splitCsv(value: string | null) {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

const PROMPT_SELECT = `
  p.id, p.created_by, p.title, p.description, p.body,
  p.usage_count, p.rating_avg, p.rating_count, p.created_at,
  (SELECT GROUP_CONCAT(tt.slug) FROM prompt_tool_types ptt
    INNER JOIN tool_types tt ON tt.id = ptt.tool_type_id
    WHERE ptt.prompt_id = p.id) AS tool_types,
  (SELECT GROUP_CONCAT(c.slug) FROM prompt_categories pc
    INNER JOIN categories c ON c.id = pc.category_id
    WHERE pc.prompt_id = p.id) AS categories,
  (SELECT GROUP_CONCAT(t.name) FROM prompt_tags pt
    INNER JOIN tags t ON t.id = pt.tag_id
    WHERE pt.prompt_id = p.id) AS tags,
  EXISTS (
    SELECT 1 FROM favorites f
    WHERE f.prompt_id = p.id AND f.user_id = :userId
  ) AS is_favorite
`;

export function mapPrompt(row: PromptRow, user: ApiUser | null = null) {
  const createdBy = row.created_by ?? null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    body: row.body,
    usageCount: Number(row.usage_count),
    ratingAvg: Number(row.rating_avg),
    ratingCount: Number(row.rating_count),
    createdAt: new Date(row.created_at).toISOString(),
    toolTypes: splitCsv(row.tool_types),
    categories: splitCsv(row.categories),
    tags: splitCsv(row.tags),
    isFavorite: Boolean(row.is_favorite),
    createdBy,
    canDelete: true,
  };
}

function sortClause(sort: PromptListQuery["sort"]) {
  if (sort === "popular") return popularSortSql();
  if (sort === "new") return "p.created_at DESC";
  // ทั้งหมด: English A–Z first, then other scripts (e.g. Thai ก–ฮ)
  return `
    CASE
      WHEN LOWER(LEFT(p.title, 1)) BETWEEN 'a' AND 'z' THEN 0
      ELSE 1
    END ASC,
    p.title ASC,
    p.id ASC
  `;
}

export async function listPrompts(input: PromptListQuery, user: ApiUser | null) {
  const where: string[] = ["1=1"];
  const params: Record<string, string | number | boolean | null> = {
    userId: user?.id ?? null,
  };

  if (input.q?.trim()) {
    where.push(
      "(p.title LIKE :q OR p.description LIKE :q OR EXISTS (SELECT 1 FROM prompt_tags pt INNER JOIN tags t ON t.id = pt.tag_id WHERE pt.prompt_id = p.id AND t.name LIKE :q))"
    );
    params.q = `%${input.q.trim()}%`;
  }

  if (input.toolTypes?.length) {
    where.push(
      `EXISTS (
        SELECT 1 FROM prompt_tool_types ptt
        INNER JOIN tool_types tt ON tt.id = ptt.tool_type_id
        WHERE ptt.prompt_id = p.id AND tt.slug IN (${input.toolTypes
          .map((_, i) => `:tt${i}`)
          .join(",")})
      )`
    );
    input.toolTypes.forEach((slug, i) => {
      params[`tt${i}`] = slug;
    });
  }

  if (input.categories?.length) {
    where.push(
      `EXISTS (
        SELECT 1 FROM prompt_categories pc
        INNER JOIN categories c ON c.id = pc.category_id
        WHERE pc.prompt_id = p.id AND c.slug IN (${input.categories
          .map((_, i) => `:cat${i}`)
          .join(",")})
      )`
    );
    input.categories.forEach((slug, i) => {
      params[`cat${i}`] = slug;
    });
  }

  if (input.favoritesOnly) {
    where.push(
      "EXISTS (SELECT 1 FROM favorites f WHERE f.prompt_id = p.id AND f.user_id = :userId)"
    );
  }

  const rows = await query<PromptRow[]>(
    `SELECT ${PROMPT_SELECT}
     FROM prompts p
     WHERE ${where.join(" AND ")}
     ORDER BY ${sortClause(input.sort)}`,
    params
  );

  return rows.map((row) => mapPrompt(row, user));
}

export async function getPromptById(id: string, user: ApiUser | null) {
  const rows = await query<PromptRow[]>(
    `SELECT ${PROMPT_SELECT}
     FROM prompts p
     WHERE p.id = :id
     LIMIT 1`,
    { id, userId: user?.id ?? null }
  );

  return rows[0] ? mapPrompt(rows[0], user) : null;
}

export type CreatePromptInput = {
  title: string;
  description: string;
  body: string;
  tags: string[];
  toolTypes: string[];
  categories: string[];
  createdBy: string;
};

export async function createPrompt(input: CreatePromptInput) {
  const id = randomUUID();
  await query(
    `INSERT INTO prompts (id, created_by, title, description, body)
     VALUES (:id, :createdBy, :title, :description, :body)`,
    {
      id,
      createdBy: input.createdBy,
      title: input.title,
      description: input.description,
      body: input.body,
    }
  );

  for (const slug of input.toolTypes) {
    await query(
      `INSERT INTO prompt_tool_types (prompt_id, tool_type_id)
       SELECT :promptId, id FROM tool_types WHERE slug = :slug`,
      { promptId: id, slug }
    );
  }

  for (const slug of input.categories) {
    await query(
      `INSERT INTO prompt_categories (prompt_id, category_id)
       SELECT :promptId, id FROM categories WHERE slug = :slug`,
      { promptId: id, slug }
    );
  }

  for (const name of input.tags) {
    const existing = await query<{ id: string }[]>(
      `SELECT id FROM tags WHERE name = :name LIMIT 1`,
      { name }
    );
    const tagId = existing[0]?.id ?? randomUUID();
    if (!existing[0]) {
      await query(`INSERT INTO tags (id, name) VALUES (:id, :name)`, {
        id: tagId,
        name,
      });
    }
    await query(
      `INSERT IGNORE INTO prompt_tags (prompt_id, tag_id) VALUES (:promptId, :tagId)`,
      { promptId: id, tagId }
    );
  }

  return getPromptById(id, null);
}

export async function copyPrompt(promptId: string, user: ApiUser) {
  const rows = await query<{ id: string; body: string }[]>(
    `SELECT id, body FROM prompts WHERE id = :id LIMIT 1`,
    { id: promptId }
  );
  const prompt = rows[0];
  if (!prompt) return { status: "not_found" as const };

  const insertResult = await execute(
    `INSERT IGNORE INTO prompt_copies (id, user_id, prompt_id)
     VALUES (:id, :userId, :promptId)`,
    { id: randomUUID(), userId: user.id, promptId }
  );

  const counted = insertResult.affectedRows === 1;
  if (counted) {
    await query(
      `UPDATE prompts SET usage_count = usage_count + 1 WHERE id = :id`,
      { id: promptId }
    );
  }

  const updated = await getPromptById(promptId, user);
  return {
    status: "ok" as const,
    body: prompt.body,
    counted,
    prompt: updated,
  };
}

export async function toggleFavorite(promptId: string, userId: string) {
  const existing = await query<{ prompt_id: string }[]>(
    `SELECT prompt_id FROM favorites
     WHERE user_id = :userId AND prompt_id = :promptId
     LIMIT 1`,
    { userId, promptId }
  );

  if (existing[0]) {
    await query(
      `DELETE FROM favorites WHERE user_id = :userId AND prompt_id = :promptId`,
      { userId, promptId }
    );
    return { isFavorite: false };
  }

  await query(
    `INSERT INTO favorites (user_id, prompt_id) VALUES (:userId, :promptId)`,
    { userId, promptId }
  );
  return { isFavorite: true };
}

export async function deletePrompt(promptId: string) {
  const rows = await query<{ id: string }[]>(
    `SELECT id FROM prompts WHERE id = :id LIMIT 1`,
    { id: promptId }
  );
  if (!rows[0]) {
    return { status: "not_found" as const };
  }

  await query(`DELETE FROM prompts WHERE id = :id`, { id: promptId });
  return { status: "ok" as const };
}
