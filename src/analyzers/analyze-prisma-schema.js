import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear modelos de Prisma
function parseModel(modelContent) {
  const modelMatch = modelContent.match(/model\s+(\w+)\s*{([^}]+)}/);
  if (!modelMatch) return null;

  const modelName = modelMatch[1];
  const fields = modelMatch[2];

  // Extraer relaciones (campos que referencian otras tablas)
  const relations = [];
  const relationRegex =
    /(\w+)\s+(\w+)(?:\[\])?\s+@relation\(.*?fields:\s*\[(\w+)\]/g;
  let match;

  while ((match = relationRegex.exec(fields)) !== null) {
    const fieldName = match[1];
    const relatedModel = match[2];
    const foreignKey = match[3];

    // Solo agregar si el campo realmente existe como FK
    if (
      fields.includes(`${foreignKey}\s+Int`) ||
      fields.includes(`${foreignKey}\s+String`)
    ) {
      relations.push({
        field: fieldName,
        relatedModel: relatedModel,
        foreignKey: foreignKey,
      });
    }
  }

  // También buscar FK directos sin @relation explícito
  const fkRegex = /(\w+Id)\s+(Int|String)(?:\?)?/g;
  while ((match = fkRegex.exec(fields)) !== null) {
    const fkField = match[1];
    const fkType = match[2];

    // Inferir el modelo relacionado del nombre del campo (remove 'Id' suffix)
    const inferredModel = fkField.replace(/Id$/, "");

    // Capitalizar primera letra para match con nombres de modelos
    const modelName =
      inferredModel.charAt(0).toUpperCase() + inferredModel.slice(1);

    // Evitar duplicados
    const exists = relations.some((r) => r.foreignKey === fkField);
    if (!exists) {
      relations.push({
        field: fkField,
        relatedModel: modelName,
        foreignKey: fkField,
        inferred: true,
      });
    }
  }

  return {
    name: modelName,
    relations: relations,
  };
}

// Función para leer todos los modelos de Prisma
function readPrismaModels() {
  const schemaDir = path.join(__dirname, "../../schema");
  const models = {};

  console.log("📋 Leyendo modelos de Prisma...\n");

  // Leer archivos .prisma individuales
  const prismaFiles = fs
    .readdirSync(schemaDir)
    .filter((file) => file.endsWith(".prisma") && file !== "schema.prisma");

  for (const file of prismaFiles) {
    const filePath = path.join(schemaDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    const model = parseModel(content);
    if (model) {
      models[model.name] = model;
      console.log(
        `✅ Modelo ${model.name}: ${model.relations.length} relaciones encontradas`
      );
      if (model.relations.length > 0) {
        model.relations.forEach((rel) => {
          const type = rel.inferred ? "(inferida)" : "";
          console.log(`   - ${rel.foreignKey} -> ${rel.relatedModel} ${type}`);
        });
      }
    }
  }

  return models;
}

// Función para crear grafo de dependencias
function createDependencyGraph(models) {
  const graph = {};
  const inDegree = {};

  // Inicializar todos los nodos
  Object.keys(models).forEach((modelName) => {
    graph[modelName] = [];
    inDegree[modelName] = 0;
  });

  // Construir el grafo
  Object.values(models).forEach((model) => {
    model.relations.forEach((relation) => {
      const targetModel = relation.relatedModel;

      // Solo agregar la dependencia si el modelo objetivo existe
      if (models[targetModel]) {
        // model depende de targetModel
        if (!graph[targetModel].includes(model.name)) {
          graph[targetModel].push(model.name);
          inDegree[model.name]++;
        }
      }
    });
  });

  return { graph, inDegree };
}

// Función para detectar ciclos y obtener orden topológico
function topologicalSort(graph, inDegree) {
  const result = [];
  const queue = [];
  const visited = new Set();
  const currentInDegree = { ...inDegree };

  // Encontrar nodos sin dependencias (in-degree = 0)
  Object.keys(currentInDegree).forEach((node) => {
    if (currentInDegree[node] === 0) {
      queue.push(node);
    }
  });

  console.log("🔍 Iniciando ordenamiento topológico...\n");
  console.log(`📊 Nodos independientes iniciales: ${queue.join(", ")}\n`);

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);
    visited.add(current);

    console.log(`✅ Procesando: ${current}`);

    // Reducir in-degree de nodos dependientes
    graph[current].forEach((dependent) => {
      currentInDegree[dependent]--;
      console.log(
        `   - ${dependent}: in-degree ahora es ${currentInDegree[dependent]}`
      );

      if (currentInDegree[dependent] === 0) {
        queue.push(dependent);
        console.log(`   - ${dependent} agregado a la cola`);
      }
    });
  }

  // Detectar ciclos
  const remainingNodes = Object.keys(currentInDegree).filter(
    (node) => !visited.has(node)
  );
  const hasCycles = remainingNodes.length > 0;

  if (hasCycles) {
    console.log("\n⚠️  CICLOS DETECTADOS:");
    remainingNodes.forEach((node) => {
      console.log(`   - ${node} (in-degree: ${currentInDegree[node]})`);
    });
  }

  return {
    order: result,
    hasCycles,
    cyclicNodes: remainingNodes,
  };
}

// Función para generar reporte de migración
function generateMigrationPlan(models, sortResult) {
  const plan = {
    timestamp: new Date().toISOString(),
    totalModels: Object.keys(models).length,
    independentModels: sortResult.order.filter((modelName) => {
      const model = models[modelName];
      return model.relations.length === 0;
    }),
    dependentModels: sortResult.order.filter((modelName) => {
      const model = models[modelName];
      return model.relations.length > 0;
    }),
    migrationOrder: sortResult.order,
    hasCycles: sortResult.hasCycles,
    cyclicModels: sortResult.cyclicNodes,
    dependencies: {},
  };

  // Agregar información detallada de dependencias
  Object.values(models).forEach((model) => {
    plan.dependencies[model.name] = {
      relations: model.relations,
      dependsOn: model.relations
        .map((r) => r.relatedModel)
        .filter((relModel) => models[relModel]),
    };
  });

  return plan;
}

// Función principal
async function main() {
  try {
    console.log(
      "🚀 Analizando esquemas de Prisma para generar plan de migración...\n"
    );
    console.log("=" * 60);

    // Leer modelos de Prisma
    const models = readPrismaModels();

    console.log(
      `\n📊 Total de modelos encontrados: ${Object.keys(models).length}`
    );

    // Crear grafo de dependencias
    console.log("\n🔗 Creando grafo de dependencias...");
    const { graph, inDegree } = createDependencyGraph(models);

    console.log("\n📈 Estadísticas de dependencias:");
    const dependencyStats = Object.entries(inDegree)
      .map(([model, degree]) => ({
        model,
        dependencies: degree,
      }))
      .sort((a, b) => a.dependencies - b.dependencies);

    dependencyStats.forEach(({ model, dependencies }) => {
      console.log(`   ${model}: ${dependencies} dependencias`);
    });

    // Realizar ordenamiento topológico
    console.log("\n🔄 Realizando ordenamiento topológico...");
    const sortResult = topologicalSort(graph, inDegree);

    // Generar plan de migración
    const migrationPlan = generateMigrationPlan(models, sortResult);

    // Guardar plan
    const planPath = path.join(__dirname, "../../prisma-migration-plan.json");
    fs.writeFileSync(planPath, JSON.stringify(migrationPlan, null, 2));

    console.log("\n" + "=" * 60);
    console.log("📋 RESUMEN DEL PLAN DE MIGRACIÓN:");
    console.log("=" * 60);
    console.log(`Total de modelos: ${migrationPlan.totalModels}`);
    console.log(
      `Modelos independientes: ${migrationPlan.independentModels.length}`
    );
    console.log(
      `Modelos dependientes: ${migrationPlan.dependentModels.length}`
    );
    console.log(`Tiene ciclos: ${migrationPlan.hasCycles ? "SÍ" : "NO"}`);

    if (migrationPlan.hasCycles) {
      console.log(
        `Modelos con ciclos: ${migrationPlan.cyclicModels.join(", ")}`
      );
    }

    console.log("\n🔄 ORDEN DE MIGRACIÓN SUGERIDO:");
    migrationPlan.migrationOrder.forEach((model, index) => {
      const dependencies =
        migrationPlan.dependencies[model]?.dependsOn?.length || 0;
      console.log(
        `${(index + 1)
          .toString()
          .padStart(2, "0")}. ${model} (${dependencies} deps)`
      );
    });

    if (migrationPlan.cyclicModels.length > 0) {
      console.log("\n⚠️  MODELOS CON DEPENDENCIAS CIRCULARES:");
      migrationPlan.cyclicModels.forEach((model) => {
        const deps = migrationPlan.dependencies[model];
        console.log(`   - ${model}: depende de [${deps.dependsOn.join(", ")}]`);
      });
      console.log(
        "\n💡 Estos modelos requerirán manejo especial de constraints."
      );
    }

    console.log(`\n📄 Plan completo guardado en: ${planPath}`);
  } catch (error) {
    console.error("❌ Error generando plan de migración:", error);
    throw error;
  }
}

// Ejecutar si es el módulo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n💥 ERROR:", error.message);
    process.exit(1);
  });
}

// Exportar función principal
export default main;
export {
  readPrismaModels,
  createDependencyGraph,
  topologicalSort,
  generateMigrationPlan,
};
