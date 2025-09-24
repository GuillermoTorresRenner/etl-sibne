# ========================================

# CONFIGURACIÓN DE MULTER - BACKEND

# ========================================

# Este archivo muestra cómo configurar el backend para usar

# los archivos extraídos con la nueva nomenclatura

# Ejemplo de configuración Node.js + Express + Multer

```javascript
import multer from "multer";
import { nanoid } from "nanoid";
import path from "path";

// Configuración de storage compatible con la migración
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar la misma ruta configurada en .env
    cb(null, process.env.FILE_RELATIVE_PATH || "uploads/files");
  },
  filename: (req, file, cb) => {
    // Generar nombre compatible con la extracción
    const nanoId = nanoid(10);
    const id = req.body.id || "new";
    const timestamp = new Date().toISOString().slice(0, 10);
    const extension = path.extname(file.originalname);

    // Formato: nanoid_id_fecha.extensión
    const filename = `${nanoId}_${id}_${timestamp}${extension}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Filtros de seguridad
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
});

// Endpoint de upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Guardar metadata en base de datos
    const fileData = {
      nombre_archivo: req.file.originalname,
      location: `${process.env.FILE_RELATIVE_PATH}/${req.file.filename}`, // ✨ Campo location
      nanoid: req.file.filename.split("_")[0], // Extraer nanoid del nombre
      tamano: req.file.size,
      checksum: await generateChecksum(req.file.path),
      tipo: req.file.mimetype,
      ext: path.extname(req.file.originalname),
    };

    // Insertar en base de datos
    const result = await db.ArchivoAdjunto.create(fileData);

    res.json({
      success: true,
      file: {
        id: result.id,
        location: fileData.location, // ✨ Frontend usa este campo
        url: `${process.env.FILE_BASE_URL}/${req.file.filename}`,
        filename: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de descarga
app.get("/files/:nanoid", async (req, res) => {
  try {
    // Buscar archivo por nanoid
    const file = await db.ArchivoAdjunto.findOne({
      where: { nanoid: req.params.nanoid },
    });

    if (!file) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }

    // Construir ruta física
    const filePath = path.join(process.cwd(), file.location);

    // Verificar existencia
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo físico no encontrado" });
    }

    // Enviar archivo
    res.download(filePath, file.nombre_archivo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

# ========================================

# VARIABLES DE ENTORNO PARA BACKEND

# ========================================

FILE_BASE_URL=http://localhost:3000/uploads
FILE_RELATIVE_PATH=uploads/files
UPLOADS_DIR=./uploads/files
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png,doc,docx
