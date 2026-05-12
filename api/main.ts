import chalk from "chalk";
import type { Client } from "discord.js";
import express from "express";
import { readdirSync } from "fs";
import path from "path";
import passport from "passport";
import passportDiscord from "passport-discord";
import { request } from "undici";
import cors from "cors";

const discordEndpoint = "https://discord.com/api";
export default async function API(client: Client) {
  const app = express();

  const routesPath = path.join(process.cwd(), "api", "routes");
  const routesFiles = readdirSync(routesPath);

  const frontendRoot = process.env.APP_ROOT!;

  passport.use(
    new passportDiscord.Strategy(
      {
        clientID: client.user!.id,
        clientSecret: process.env.SECRET!,
        callbackURL: process.env.DISCORD_AUTH_CALLBACK!,
      },
      async (accessToken, refreshToken, profile, next) => {
        next(null, { ...profile, accessToken });
      },
    ),
  );

  app.use(express.json());
  app.use(express.urlencoded());

  app.use(cors());

  for (let filename of routesFiles) {
    const { default: router } = await import(path.join(routesPath, filename));

    app.use("/api/" + filename.replace(".ts", ""), router);
  }

  app.get(
    "/auth/discord",
    passport.authenticate("discord", { scope: ["identify"] }),
  );

  app.post("/auth/discord/exchange", async (req, res) => {
    const code = req.body.code;

    try {
      const tokenResponseData = await request(
        "https://discord.com/api/oauth2/token",
        {
          method: "POST",
          body: new URLSearchParams({
            client_id: client.user!.id,
            client_secret: process.env.SECRET!,
            code: code as string,
            grant_type: "authorization_code",
            redirect_uri: process.env.DISCORD_AUTH_CALLBACK!,
            scope: "identify",
          }).toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );
      const oauthData = (await tokenResponseData.body.json()) as {
        token_type: string;
        access_token: string;
      };

      res.json(oauthData);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  });

  app.get("/auth/discord/callback", async (req, res) => {
    const code = req.query.code;
    res.redirect(frontendRoot + "?code=" + code);
  });

  app.listen(process.env.PORT, () => {
    console.log(
      `${chalk.bgGreen.black("[STARTUP]")} Rest API (HTTP) Listening on port: ${process.env.PORT}`,
    );
  });

  return app;
}
