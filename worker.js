export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-reset-key"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8"
        }
      });

    const requireResetKey = () => {
      const headerKey = request.headers.get("x-reset-key");
      const queryKey = url.searchParams.get("key");
      const provided = headerKey || queryKey || "";
      const expected = env.RESET_KEY || "monsterland-reset";
      return provided === expected;
    };

    const ensureDatabase = async () => {
      if (!env.DB) {
        return false;
      }

      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS player_progress (
          player_id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();

      return true;
    };

    if (url.pathname === "/api/status") {
      const dbReady = !!env.DB;
      return respond({
        ok: true,
        server: "MonsterWorld",
        message: "Servidor funcionando",
        db: dbReady ? "connected" : "not configured",
        resetKeyConfigured: !!env.RESET_KEY,
        defaultResetKey: env.RESET_KEY || "monsterland-reset"
      });
    }

    if (url.pathname === "/api/progress") {
      await ensureDatabase();

      if (request.method === "GET") {
        if (!env.DB) {
          return respond({ ok: false, message: "Base de datos no configurada" }, 503);
        }

        const playerId = url.searchParams.get("playerId") || "local";
        const row = await env.DB.prepare(
          "SELECT data FROM player_progress WHERE player_id = ?"
        ).bind(playerId).first();

        return respond({
          ok: true,
          playerId,
          data: row ? JSON.parse(row.data) : null
        });
      }

      if (request.method === "POST") {
        if (!env.DB) {
          return respond({ ok: false, message: "Base de datos no configurada" }, 503);
        }

        let body = {};
        try {
          body = await request.json();
        } catch (error) {
          return respond({ ok: false, message: "JSON inválido" }, 400);
        }

        const playerId = body.playerId || "local";
        const saveData = body.data ?? {};

        await env.DB.prepare(`
          INSERT INTO player_progress (player_id, data, updated_at)
          VALUES (?, ?, ?)
          ON CONFLICT(player_id) DO UPDATE SET
            data = excluded.data,
            updated_at = excluded.updated_at
        `).bind(playerId, JSON.stringify(saveData), new Date().toISOString()).run();

        return respond({
          ok: true,
          playerId,
          message: "Progreso guardado correctamente"
        });
      }
    }

    if (url.pathname === "/api/reset-player") {
      if (request.method !== "POST") {
        return respond({ ok: false, message: "Método no permitido" }, 405);
      }

      if (!requireResetKey()) {
        return respond({ ok: false, message: "Clave de reinicio inválida o faltante" }, 401);
      }

      if (!env.DB) {
        return respond({ ok: false, message: "Base de datos no configurada" }, 503);
      }

      const body = await request.json().catch(() => ({}));
      const playerId = body.playerId || "local";

      await ensureDatabase();
      await env.DB.prepare("DELETE FROM player_progress WHERE player_id = ?").bind(playerId).run();

      return respond({
        ok: true,
        playerId,
        message: "Se reinició el progreso del jugador solicitado."
      });
    }

    if (url.pathname === "/api/reset-all") {
      if (request.method !== "POST") {
        return respond({ ok: false, message: "Método no permitido" }, 405);
      }

      if (!requireResetKey()) {
        return respond({ ok: false, message: "Clave de reinicio inválida o faltante" }, 401);
      }

      if (!env.DB) {
        return respond({ ok: false, message: "Base de datos no configurada" }, 503);
      }

      await ensureDatabase();
      const result = await env.DB.prepare("DELETE FROM player_progress").run();

      return respond({
        ok: true,
        message: "Se reinició el progreso de todos los jugadores.",
        changes: result.meta?.changes ?? 0
      });
    }

    if (url.pathname.startsWith("/api/")) {
      return respond({
        ok: false,
        message: "Ruta no encontrada"
      }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
