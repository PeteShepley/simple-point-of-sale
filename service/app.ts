import { App } from "@deepkit/app";
import { FrameworkModule } from "@deepkit/framework";
import { JSONTransport, Logger } from "@deepkit/logger";
import { AppConfig } from "./src/app/config";
import { MenuController } from "./src/controller/menu.http";
import { RecipeController } from "./src/controller/recipe.http";
import { MenuDatabase } from "./src/data/database";

async function main(): Promise<void> {
  const application = new App({
    config: AppConfig,
    controllers: [MenuController, RecipeController],
    providers: [MenuDatabase],
    imports: [
      new FrameworkModule({
        migrateOnStartup: true,
        debug: true,
      }),
    ],
  });

  application.loadConfigFromEnv({ envFilePath: ["production.env", ".env"] });

  application.setup(async (module, config: AppConfig) => {
    if (config.environment === "production") {
      //enable logging JSON messages instead of formatted strings
      module.configureProvider<Logger>((loggerProvider) =>
        loggerProvider.setTransport([new JSONTransport()]),
      );

      module
        .getImportedModuleByClass(FrameworkModule)
        .configure({ migrateOnStartup: false, debug: false });
    }
  });

  return application.run();
}

main()
  .then(() => console.log("Done."))
  .catch(console.error);
