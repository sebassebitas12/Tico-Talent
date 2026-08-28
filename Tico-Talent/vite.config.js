import { defineConfig, loadEnv } from "vite";

function createTicobotMiddleware(server) {
  return async (req, res, next) => {
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, service: "TicoBot API" }));
      return;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Método no permitido." }));
      return;
    }

    try {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      const rawBody = Buffer.concat(chunks).toString("utf8") || "{}";

      let body;

      try {
        body = JSON.parse(rawBody);
      } catch {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "El cuerpo de la solicitud no es JSON válido." }));
        return;
      }

      const messages = Array.isArray(body.messages) ? body.messages : [];

      const env = loadEnv(
        server.config?.mode || "development",
        process.cwd(),
        ""
      );

      // Acepta GROQ_API_KEY (recomendado, solo servidor) y el nombre
      // VITE_GROQ_API_KEY usado por configuraciones anteriores del proyecto.
      const apiKey = (
        env.GROQ_API_KEY ||
        env.VITE_GROQ_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.VITE_GROQ_API_KEY ||
        ""
      ).trim();

      if (!apiKey.trim()) {
        res.statusCode = 503;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({
          error: "Falta configurar una GROQ_API_KEY válida en el archivo .env. Reiniciá Vite después de guardarla."
        }));
        return;
      }

      const groqResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages,
            temperature: 0.7,
            max_completion_tokens: 600
          })
        }
      );

      const data = await groqResponse.json().catch(() => ({}));

      if (!groqResponse.ok) {
        console.error("Groq API:", data);

        res.statusCode = groqResponse.status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");

        res.end(
          JSON.stringify({
            error:
              data?.error?.message ||
              "Groq no pudo procesar la solicitud."
          })
        );

        return;
      }

      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        res.statusCode = 502;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(
          JSON.stringify({
            error: "Groq devolvió una respuesta vacía."
          })
        );
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          content,
          demo: false
        })
      );
    } catch (error) {
      console.error("TicoBot server error:", error);

      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");

      res.end(
        JSON.stringify({
          error: "No se pudo procesar la solicitud de TicoBot."
        })
      );
    }
  };
}

function ticobotApi() {
  return {
    name: "ticobot-api",

    configureServer(server) {
      server.middlewares.use("/api/ticobot", (req, res, next) => {
        createTicobotMiddleware(server)(req, res, next);
      });
    },

    configurePreviewServer(server) {
      /*
       * También permite que /api/ticobot exista al usar:
       * npm run preview
       */
      server.middlewares.use("/api/ticobot", (req, res, next) => {
        createTicobotMiddleware(server)(req, res, next);
      });
    }
  };
}

export default defineConfig({
  plugins: [ticobotApi()],
  server: {
    hmr: {
      overlay: false
    }
  }
});