
const encoder = new TextEncoder();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Telegram-Init-Data, X-Reset-Key"
};

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

async function hmacSha256(keyBytes, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    typeof message === "string" ? encoder.encode(message) : message
  );

  return new Uint8Array(signature);
}

function toHex(bytes) {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

async function authenticateTelegram(request, env) {
  if (!env.BOT_TOKEN) {
    return { error: "Telegram no está configurado", status: 503 };
  }

  const authorization = request.headers.get("Authorization") || "";
  const initData =
    authorization.startsWith("tma ")
      ? authorization.slice(4)
      : request.headers.get("X-Telegram-Init-Data") || "";

  if (!initData) {
    return { error: "Falta la autenticación de Telegram", status: 401 };
  }

  try {
    const params = new URLSearchParams(initData);
    const receivedHash = params.get("hash");

    if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
      return { error: "Datos de Telegram inválidos", status: 401 };
    }

    const authDate = Number(params.get("auth_date"));
    const now = Math.floor(Date.now() / 1000);

    if (
      !Number.isFinite(authDate) ||
      authDate > now + 60 ||
      now - authDate > 86400
    ) {
      return { error: "La sesión de Telegram ha caducado", status: 401 };
    }

    const checkString = Array.from(params.entries())
      .filter(([key]) => key !== "hash")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Telegram Web Apps: HMAC con la clave BOT_TOKEN
    // y el mensaje "WebAppData".
    const secretKey = await hmacSha256(
      encoder.encode(env.BOT_TOKEN),
      "WebAppData"
    );

    const calculatedHash = toHex(
      await hmacSha256(secretKey, checkString)
    );

    if (!safeEqual(calculatedHash, receivedHash.toLowerCase())) {
      return { error: "No se pudo verificar la identidad de Telegram", status: 401 };
    }

    const userText = params.get("user");
    if (!userText) {
      return { error: "Telegram no proporcionó el usuario", status: 401 };
    }

    const user = JSON.parse(userText);

    if (!user.id) {
      return { error: "ID de Telegram inválido", status: 401 };
    }

    return {
      user: {
        telegramId: String(user.id),
        username: typeof user.username === "string" ? user.username : null
      }
    };
  } catch (error) {
    return { error: "No se pudieron validar los datos de Telegram", status: 401 };
  }
}

function createInitialSave() {
  return {
    coins: 1000,
    starterEggClaimed: false,
    eggs: [
      {
        id: "starter-egg",
        type: "starter",
        createdAt: Date.now()
      }
    ],
    owned: [],
    monsterProgress: {},
    monsterNames: {},
    production: {},
    needs: {},
    care: {},
    sleep: {},
    lastDaily: "",
    trainerProgress: { level: 1, xp: 0 },
    inventory: {},
    incubating: [],
    spaceCount: 1,
    monsterSlots: {},
    xpBoostUntil: 0
  };
}

function parseSave(value) {
  try {
    const parsed = JSON.parse(value);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed;
    }
  } catch (error) {
    // Se usa un estado inicial si el contenido guardado no es válido.
  }

  return createInitialSave();
}

async function ensurePlayer(env, user) {
  const initial = createInitialSave();

  await env.DB.prepare(`
    INSERT OR IGNORE INTO players
      (telegram_id, username, coins, level, monster_data)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    user.telegramId,
    user.username,
    initial.coins,
    initial.trainerProgress.level,
    JSON.stringify(initial)
  ).run();

  await env.DB.prepare(`
    UPDATE players
    SET username = COALESCE(?, username),
        updated_at = CURRENT_TIMESTAMP
    WHERE telegram_id = ?
  `).bind(user.username, user.telegramId).run();

  const row = await env.DB.prepare(`
    SELECT telegram_id, username, coins, level, monster_data
    FROM players
    WHERE telegram_id = ?
  `).bind(user.telegramId).first();

  return row;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (path === "/api/status") {
      return respond({
        ok: true,
        server: "MonsterWorld",
        message: "Servidor funcionando",
        db: env.DB ? "connected" : "not configured",
        telegramConfigured: Boolean(env.BOT_TOKEN),
        resetKeyConfigured: Boolean(env.RESET_KEY)
      });
    }

    if (path.startsWith("/api/")) {
      if (!env.DB) {
        return respond({
          ok: false,
          message: "Base de datos no configurada"
        }, 503);
      }

      // Registro e inicio de sesión del jugador de Telegram.
      if (path === "/api/user") {
        if (request.method !== "POST") {
          return respond({ ok: false, message: "Método no permitido" }, 405);
        }

        const auth = await authenticateTelegram(request, env);
        if (!auth.user) {
          return respond({ ok: false, message: auth.error }, auth.status);
        }

        const row = await ensurePlayer(env, auth.user);

        return respond({
          ok: true,
          user: {
            telegramId: row.telegram_id,
            username: row.username,
            coins: row.coins,
            level: row.level
          },
          data: parseSave(row.monster_data)
        });
      }

      // Consultar y guardar el progreso del jugador autenticado.
      if (path === "/api/progress") {
        if (request.method !== "GET" && request.method !== "POST") {
          return respond({ ok: false, message: "Método no permitido" }, 405);
        }

        const auth = await authenticateTelegram(request, env);
        if (!auth.user) {
          return respond({ ok: false, message: auth.error }, auth.status);
        }

        if (request.method === "GET") {
          const row = await ensurePlayer(env, auth.user);

          return respond({
            ok: true,
            playerId: row.telegram_id,
            data: parseSave(row.monster_data)
          });
        }

        let body;
        try {
          body = await request.json();
        } catch (error) {
          return respond({ ok: false, message: "JSON inválido" }, 400);
        }

        const save = body?.data;

        if (
          !save ||
          typeof save !== "object" ||
          Array.isArray(save) ||
          typeof save.coins !== "number" ||
          !Number.isFinite(save.coins) ||
          save.coins < 0
        ) {
          return respond({ ok: false, message: "Progreso inválido" }, 400);
        }

        const level = Number(save.trainerProgress?.level);
        const safeLevel =
          Number.isInteger(level) && level >= 1 ? level : 1;

        await ensurePlayer(env, auth.user);

        await env.DB.prepare(`
          UPDATE players
          SET coins = ?,
              level = ?,
              monster_data = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE telegram_id = ?
        `).bind(
          save.coins,
          safeLevel,
          JSON.stringify(save),
          auth.user.telegramId
        ).run();

        return respond({
          ok: true,
          playerId: auth.user.telegramId,
          message: "Progreso guardado correctamente"
        });
      }

      // Estas rutas administrativas requieren una clave secreta configurada
      // en Cloudflare como RESET_KEY. No existe una clave predeterminada.
      if (path === "/api/reset-player" || path === "/api/reset-all") {
        if (request.method !== "POST") {
          return respond({ ok: false, message: "Método no permitido" }, 405);
        }

        const providedKey = request.headers.get("X-Reset-Key") || "";

        if (!env.RESET_KEY || !safeEqual(providedKey, env.RESET_KEY)) {
          return respond({
            ok: false,
            message: "Clave administrativa inválida o no configurada"
          }, 401);
        }

        const initial = createInitialSave();
        const initialJson = JSON.stringify(initial);

        if (path === "/api/reset-player") {
          let body;

          try {
            body = await request.json();
          } catch (error) {
            return respond({ ok: false, message: "JSON inválido" }, 400);
          }

          const telegramId = String(body?.telegramId || "");

          if (!/^\d+$/.test(telegramId)) {
            return respond({
              ok: false,
              message: "Debes indicar un telegramId válido"
            }, 400);
          }

          const result = await env.DB.prepare(`
            UPDATE players
            SET coins = ?,
                level = 1,
                monster_data = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE telegram_id = ?
          `).bind(initial.coins, initialJson, telegramId).run();

          return respond({
            ok: true,
            message: "Progreso reiniciado",
            changes: result.meta?.changes ?? 0
          });
        }

        const result = await env.DB.prepare(`
          UPDATE players
          SET coins = ?,
              level = 1,
              monster_data = ?,
              updated_at = CURRENT_TIMESTAMP
        `).bind(initial.coins, initialJson).run();

        return respond({
          ok: true,
          message: "Progreso reiniciado para todos los jugadores",
          changes: result.meta?.changes ?? 0
        });
      }

      return respond({ ok: false, message: "Ruta no encontrada" }, 404);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return respond({
      ok: false,
      message: "Servicio de archivos del juego no configurado"
    }, 503);
  }
};
