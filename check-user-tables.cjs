const sql = require("mssql");
require("dotenv").config();

// Configuración de SQL Server usando las variables del .env
const sqlConfig = {
  user: "sa",
  password: process.env.SA_PASSWORD,
  server: process.env.SQL_HOST,
  port: parseInt(process.env.SQL_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function checkUserTables() {
  try {
    console.log("🔌 Conectando a SQL Server...");
    console.log(`   - Host: ${process.env.SQL_HOST}:${process.env.SQL_PORT}`);
    console.log(`   - Database: ${process.env.DB_NAME}`);
    await sql.connect(sqlConfig);

    console.log("🔍 Buscando tablas relacionadas con usuarios...\n");

    // Buscar todas las tablas que contengan 'user' o 'usuario' en el nombre
    const result = await sql.query(`
            SELECT 
                TABLE_SCHEMA,
                TABLE_NAME,
                TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME LIKE '%user%' 
               OR TABLE_NAME LIKE '%User%'
               OR TABLE_NAME LIKE '%usuario%'
               OR TABLE_NAME LIKE '%Usuario%'
               OR TABLE_NAME LIKE '%role%'
               OR TABLE_NAME LIKE '%Role%'
               OR TABLE_NAME LIKE '%AspNet%'
            ORDER BY TABLE_NAME
        `);

    if (result.recordset.length > 0) {
      console.log("📋 Tablas encontradas:");
      result.recordset.forEach((table) => {
        console.log(
          `   - ${table.TABLE_SCHEMA}.${table.TABLE_NAME} (${table.TABLE_TYPE})`
        );
      });
    } else {
      console.log(
        "❌ No se encontraron tablas relacionadas con usuarios/roles"
      );
    }

    console.log("\n🔍 Analizando estructura de tablas ASP.NET Identity...\n");

    // Analizar estructura de AspNetUsers
    try {
      const usersSchema = await sql.query(`
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    CHARACTER_MAXIMUM_LENGTH,
                    COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'AspNetUsers'
                ORDER BY ORDINAL_POSITION
            `);

      console.log("📋 Estructura de AspNetUsers:");
      usersSchema.recordset.forEach((col) => {
        console.log(
          `   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${
            col.CHARACTER_MAXIMUM_LENGTH
              ? `(${col.CHARACTER_MAXIMUM_LENGTH})`
              : ""
          } ${col.IS_NULLABLE === "NO" ? "NOT NULL" : "NULL"}`
        );
      });

      // Contar registros
      const userCount = await sql.query(
        `SELECT COUNT(*) as total FROM AspNetUsers`
      );
      console.log(`   📊 Total usuarios: ${userCount.recordset[0].total}`);
    } catch (error) {
      console.log(`❌ Error analizando AspNetUsers: ${error.message}`);
    }

    console.log("\n");

    // Analizar estructura de AspNetRoles
    try {
      const rolesSchema = await sql.query(`
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'AspNetRoles'
                ORDER BY ORDINAL_POSITION
            `);

      console.log("📋 Estructura de AspNetRoles:");
      rolesSchema.recordset.forEach((col) => {
        console.log(
          `   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${
            col.CHARACTER_MAXIMUM_LENGTH
              ? `(${col.CHARACTER_MAXIMUM_LENGTH})`
              : ""
          } ${col.IS_NULLABLE === "NO" ? "NOT NULL" : "NULL"}`
        );
      });

      // Contar registros y mostrar algunos roles
      const roleCount = await sql.query(
        `SELECT COUNT(*) as total FROM AspNetRoles`
      );
      console.log(`   📊 Total roles: ${roleCount.recordset[0].total}`);

      const sampleRoles = await sql.query(
        `SELECT TOP 5 Id, Name FROM AspNetRoles`
      );
      if (sampleRoles.recordset.length > 0) {
        console.log("   � Roles de ejemplo:");
        sampleRoles.recordset.forEach((role) => {
          console.log(`      - ${role.Name} (${role.Id})`);
        });
      }
    } catch (error) {
      console.log(`❌ Error analizando AspNetRoles: ${error.message}`);
    }

    console.log("\n");

    // Analizar estructura de AspNetUserRoles
    try {
      const userRolesSchema = await sql.query(`
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    CHARACTER_MAXIMUM_LENGTH
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'AspNetUserRoles'
                ORDER BY ORDINAL_POSITION
            `);

      console.log("📋 Estructura de AspNetUserRoles:");
      userRolesSchema.recordset.forEach((col) => {
        console.log(
          `   - ${col.COLUMN_NAME}: ${col.DATA_TYPE}${
            col.CHARACTER_MAXIMUM_LENGTH
              ? `(${col.CHARACTER_MAXIMUM_LENGTH})`
              : ""
          } ${col.IS_NULLABLE === "NO" ? "NOT NULL" : "NULL"}`
        );
      });

      // Contar registros
      const userRoleCount = await sql.query(
        `SELECT COUNT(*) as total FROM AspNetUserRoles`
      );
      console.log(
        `   📊 Total asignaciones: ${userRoleCount.recordset[0].total}`
      );
    } catch (error) {
      console.log(`❌ Error analizando AspNetUserRoles: ${error.message}`);
    }

    console.log("\n🔍 Listando TODAS las tablas de la base de datos...\n");

    // Listar todas las tablas para tener una vista completa
    const allTablesResult = await sql.query(`
            SELECT 
                TABLE_SCHEMA,
                TABLE_NAME,
                TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

    console.log(
      `📋 Total de tablas en la base de datos: ${allTablesResult.recordset.length}`
    );
    console.log("Lista completa:");
    allTablesResult.recordset.forEach((table, index) => {
      console.log(
        `   ${(index + 1).toString().padStart(2, "0")}. ${table.TABLE_SCHEMA}.${
          table.TABLE_NAME
        }`
      );
    });

    await sql.close();
    console.log("\n🔌 Conexión cerrada");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

checkUserTables();
