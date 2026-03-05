// Injection des credentials locaux avant tout require
process.env.DB_HOST = "127.0.0.1";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "localdev";
process.env.DB_NAME = "meteion_local";

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Re-injecter après dotenv (qui pourrait écraser les valeurs)
process.env.DB_HOST = "127.0.0.1";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "localdev";
process.env.DB_NAME = "meteion_local";

// Charger uniquement sequelize sans passer par models/index.js
// (qui lance des inserts avant que les tables existent)
const Sequelize = require("sequelize");
const sequelize = new Sequelize("meteion_local", "root", "localdev", {
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
  define: { timestamps: false },
});

// Définir les modèles dans l'ordre des dépendances
const Setting = require("../src/Infrastructure/models/Setting.js")(
  sequelize,
  Sequelize,
);
const Choice = require("../src/Infrastructure/models/Choice.js")(
  sequelize,
  Sequelize,
);

async function main() {
  await sequelize.sync({ force: false });
  console.log("Tables créées.");

  await Choice.bulkCreate(
    [
      { choice_id: 1, choice_name: "Participant" },
      { choice_id: 2, choice_name: "Indécis" },
      { choice_id: 3, choice_name: "Réserviste" },
      { choice_id: 4, choice_name: "Absent" },
    ],
    { ignoreDuplicates: true },
  );

  await Setting.bulkCreate(
    [
      {
        setting_id: 1,
        setting_name: "auto_close_event",
        setting_display_name: "Suppression automatique des événements",
        activated_by_default: "TRUE",
      },
      {
        setting_id: 2,
        setting_name: "event_reminder",
        setting_display_name: "Envoie d'un message de rappel",
        activated_by_default: "TRUE",
      },
    ],
    { ignoreDuplicates: true },
  );

  console.log("Données initiales insérées.");
  await sequelize.close();
}

main().catch((err) => {
  console.error("Erreur sync-db:", err);
  process.exit(1);
});
