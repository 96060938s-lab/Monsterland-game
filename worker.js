
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
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

    if (url.pathname === "/api/status") {
      return respond({
        ok: true,
        server: "MonsterWorld",
        message: "Servidor funcionando"
      });
    }

    if (url.pathname === "/api/user" && request.method === "POST") {
      return respond({
        ok: false,
        message: "Registro pendiente de conectar con la base de datos"
      }, 501);
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
