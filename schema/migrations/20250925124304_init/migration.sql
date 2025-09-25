-- CreateEnum
CREATE TYPE "dbo"."role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "dbo"."ArchivoAdjunto" (
    "id" SERIAL NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ext" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,

    CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."CargaMasivaArchivo" (
    "id" SERIAL NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3),
    "estado" TEXT NOT NULL,

    CONSTRAINT "CargaMasivaArchivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."CargaMasivaDetalle" (
    "id" SERIAL NOT NULL,
    "cargaMasivaArchivoId" INTEGER NOT NULL,
    "nombreHoja" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3),
    "estado" TEXT NOT NULL,
    "registrosCargado" INTEGER NOT NULL,
    "registrosConError" INTEGER NOT NULL,
    "totalRegistros" INTEGER NOT NULL,

    CONSTRAINT "CargaMasivaDetalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."CargaMasivaError" (
    "id" SERIAL NOT NULL,
    "cargaMasivaArchivoId" INTEGER NOT NULL,
    "linea" INTEGER NOT NULL,
    "columna" INTEGER NOT NULL,
    "nombreCampo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cargaMasivaDetalleId" INTEGER NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "CargaMasivaError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."CategoriaTransaccion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "formularioId" INTEGER NOT NULL,

    CONSTRAINT "CategoriaTransaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Comuna" (
    "id" SERIAL NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Comuna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Contacto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "rut" INTEGER NOT NULL,
    "digitoVerificador" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "tipoContactoId" INTEGER NOT NULL,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EmailConfig" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "plantilla" TEXT NOT NULL,
    "estadoEmailId" INTEGER NOT NULL,
    "fechaGeneracionEnvio" TIMESTAMP(3),
    "encuestaId" INTEGER,
    "listaEmpresas" TEXT NOT NULL,

    CONSTRAINT "EmailConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EmailLogs" (
    "id" SERIAL NOT NULL,
    "fechaHoraRegistro" TIMESTAMP(3) NOT NULL,
    "fechaHoraEnvio" TIMESTAMP(3),
    "estado" TEXT NOT NULL,
    "para" TEXT NOT NULL,
    "msje" TEXT NOT NULL,
    "emailConfigId" INTEGER,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "EmailLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Empresa" (
    "id" TEXT NOT NULL,
    "rut" INTEGER NOT NULL,
    "dv" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL,
    "sectorEnergeticoId" INTEGER NOT NULL,
    "sectorEconomicoId" INTEGER NOT NULL,
    "subSectorEconomicoId" INTEGER NOT NULL,
    "sectorEconomicoSiiId" INTEGER,
    "instensidadEnergiaFormObligada" BOOLEAN NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Encuesta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaTermino" TIMESTAMP(3),
    "margenError" INTEGER NOT NULL,
    "valorDolar" DOUBLE PRECISION,
    "activo" BOOLEAN NOT NULL,
    "archivoAdjuntoid" INTEGER,

    CONSTRAINT "Encuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EncuestaEmpresa" (
    "empresaId" TEXT NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "estadoEmpresaId" INTEGER NOT NULL,

    CONSTRAINT "EncuestaEmpresa_pkey" PRIMARY KEY ("empresaId","encuestaId")
);

-- CreateTable
CREATE TABLE "dbo"."EncuestaPlanta" (
    "encuestaId" INTEGER NOT NULL,
    "plantaId" INTEGER NOT NULL,
    "estadoProcesoId" INTEGER NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "fechaInicio" TIMESTAMP(3),
    "fechaTransaccion" TIMESTAMP(3),
    "fechaFinalizacion" TIMESTAMP(3),

    CONSTRAINT "EncuestaPlanta_pkey" PRIMARY KEY ("encuestaId","plantaId")
);

-- CreateTable
CREATE TABLE "dbo"."Energetico" (
    "id" SERIAL NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "libreDisposicion" BOOLEAN NOT NULL,
    "densidadValor" DOUBLE PRECISION,
    "densidadUnidadMedidaId" INTEGER,
    "poderCalorificoValor" DOUBLE PRECISION,
    "poderCalorificoUMedidaId" INTEGER,
    "pedirHumedad" BOOLEAN NOT NULL,
    "pedirPoderCalorifico" BOOLEAN NOT NULL,
    "energeticoGrupoId" INTEGER NOT NULL,

    CONSTRAINT "Energetico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EnergeticoGrupos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EnergeticoGrupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EnergeticoUnidadMedida" (
    "energeticoId" INTEGER NOT NULL,
    "unidadMedidaId" INTEGER NOT NULL,

    CONSTRAINT "EnergeticoUnidadMedida_pkey" PRIMARY KEY ("energeticoId","unidadMedidaId")
);

-- CreateTable
CREATE TABLE "dbo"."EstadoEmail" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EstadoEmpresa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EstadoProceso" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."EstadoReporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EstadoReporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."FactorConversion" (
    "id" SERIAL NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,
    "uOrigenId" INTEGER NOT NULL,
    "uDestinoId" INTEGER NOT NULL,

    CONSTRAINT "FactorConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Formulario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "codigoNav" TEXT NOT NULL,

    CONSTRAINT "Formulario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."IntensidadEnergEncuestaEmpresa" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "procesoTerminado" BOOLEAN NOT NULL,
    "fechaHoraRegistro" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntensidadEnergEncuestaEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Pais" (
    "id" SERIAL NOT NULL,
    "iso2" TEXT NOT NULL,
    "iso3" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "numeroIso" INTEGER NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Planta" (
    "id" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "comunaId" INTEGER NOT NULL,
    "empresaId" TEXT NOT NULL,

    CONSTRAINT "Planta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Provincia" (
    "id" SERIAL NOT NULL,
    "regionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Region" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "posicion" INTEGER NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Reporte" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "consultaSql" TEXT NOT NULL,
    "esStoredProcedure" BOOLEAN NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "fechaGeneracionArchivo" TIMESTAMP(3),
    "estadoReporteId" INTEGER NOT NULL,
    "encuestaId" INTEGER,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Role" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."SectorEconomico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "SectorEconomico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."SectorEconomicoSii" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,

    CONSTRAINT "SectorEconomicoSii_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."SectorEnergetico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoStr" TEXT NOT NULL,

    CONSTRAINT "SectorEnergetico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."SubSectorEconomico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "sectorEconomicoId" INTEGER NOT NULL,

    CONSTRAINT "SubSectorEconomico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Tecnologia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Tecnologia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TipoContacto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoContacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TipoOtroUso" (
    "id" SERIAL NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "TipoOtroUso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TipoPerdida" (
    "id" SERIAL NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "TipoPerdida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TipoTransporte" (
    "id" SERIAL NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "TipoTransporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TipoUsoProceso" (
    "id" SERIAL NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "TipoUsoProceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Transaccion" (
    "id" SERIAL NOT NULL,
    "cantidadIn" DOUBLE PRECISION NOT NULL,
    "cantidadOut" DOUBLE PRECISION NOT NULL,
    "cantidadTCalIn" DOUBLE PRECISION NOT NULL,
    "cantidadTCalOut" DOUBLE PRECISION NOT NULL,
    "categoriaTransaccionId" INTEGER NOT NULL,
    "energeticoInId" INTEGER,
    "energeticoOutId" INTEGER,
    "fechaIngreso" TIMESTAMP(3),
    "formularioId" INTEGER NOT NULL,
    "plantaId" INTEGER NOT NULL,
    "encuestaId" INTEGER NOT NULL,
    "unidadMedidaInId" INTEGER,
    "unidadMedidaOutId" INTEGER,
    "regionDestId" INTEGER,
    "sectorEconomicoDestId" INTEGER,
    "subSectorEconomicoDestId" INTEGER,
    "cantPoderCalorifico" DOUBLE PRECISION,
    "porcentajeHumedad" DOUBLE PRECISION,
    "nombreEmpresaOrigen" TEXT,
    "stockInicial" DOUBLE PRECISION,
    "stockFinal" DOUBLE PRECISION,
    "nombreEmpresaDestino" TEXT,
    "mercadoSpot" BOOLEAN,
    "localidad" TEXT,
    "tecnologiaId" INTEGER,
    "unidadMedidaNoAprovechadaId" INTEGER,
    "cantidadNoAprovechada" DOUBLE PRECISION,
    "unidadMedidaCapInstaladaId" INTEGER,
    "cantidadCapInstalada" DOUBLE PRECISION,
    "observacion" TEXT,
    "paisId" INTEGER,
    "subTecnologia" TEXT,
    "detalle" TEXT,
    "subCategoria" TEXT,
    "datos" JSONB NOT NULL DEFAULT '{}',
    "energeticoRegionDestId" INTEGER,

    CONSTRAINT "Transaccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."TransaccionIntensidadEnergia" (
    "id" SERIAL NOT NULL,
    "consumoEnergia" DOUBLE PRECISION NOT NULL,
    "ventaMonetariaAnual" DOUBLE PRECISION NOT NULL,
    "unidad" TEXT NOT NULL,
    "formularioId" INTEGER NOT NULL,
    "fechaHoraRegistro" TIMESTAMP(3) NOT NULL,
    "intensidadEnergEncuestaEmpresaId" INTEGER NOT NULL,

    CONSTRAINT "TransaccionIntensidadEnergia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."UnidadMedida" (
    "id" SERIAL NOT NULL,
    "codigoStr" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoUnidad" TEXT NOT NULL,
    "destinoId" INTEGER,
    "origenId" INTEGER,
    "visibleSelect" BOOLEAN NOT NULL,

    CONSTRAINT "UnidadMedida_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "surname" TEXT,
    "role" "dbo"."role" NOT NULL DEFAULT 'USER',
    "lastConnection" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."Usuario" (
    "id" TEXT NOT NULL,
    "habilitado" BOOLEAN NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "eliminado" BOOLEAN NOT NULL,
    "primerIngreso" BOOLEAN NOT NULL,
    "empresaId" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dbo"."UsuarioRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UsuarioRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "dbo"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_empresaId_key" ON "dbo"."Usuario"("empresaId");

-- AddForeignKey
ALTER TABLE "dbo"."CargaMasivaDetalle" ADD CONSTRAINT "CargaMasivaDetalle_cargaMasivaArchivoId_fkey" FOREIGN KEY ("cargaMasivaArchivoId") REFERENCES "dbo"."CargaMasivaArchivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."CargaMasivaError" ADD CONSTRAINT "CargaMasivaError_cargaMasivaDetalleId_fkey" FOREIGN KEY ("cargaMasivaDetalleId") REFERENCES "dbo"."CargaMasivaDetalle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."CategoriaTransaccion" ADD CONSTRAINT "CategoriaTransaccion_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "dbo"."Formulario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Comuna" ADD CONSTRAINT "Comuna_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "dbo"."Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Contacto" ADD CONSTRAINT "Contacto_tipoContactoId_fkey" FOREIGN KEY ("tipoContactoId") REFERENCES "dbo"."TipoContacto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Contacto" ADD CONSTRAINT "Contacto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EmailConfig" ADD CONSTRAINT "EmailConfig_estadoEmailId_fkey" FOREIGN KEY ("estadoEmailId") REFERENCES "dbo"."EstadoEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EmailLogs" ADD CONSTRAINT "EmailLogs_emailConfigId_fkey" FOREIGN KEY ("emailConfigId") REFERENCES "dbo"."EmailConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EmailLogs" ADD CONSTRAINT "EmailLogs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Empresa" ADD CONSTRAINT "Empresa_sectorEnergeticoId_fkey" FOREIGN KEY ("sectorEnergeticoId") REFERENCES "dbo"."SectorEnergetico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Empresa" ADD CONSTRAINT "Empresa_sectorEconomicoId_fkey" FOREIGN KEY ("sectorEconomicoId") REFERENCES "dbo"."SectorEconomico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Empresa" ADD CONSTRAINT "Empresa_subSectorEconomicoId_fkey" FOREIGN KEY ("subSectorEconomicoId") REFERENCES "dbo"."SubSectorEconomico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Empresa" ADD CONSTRAINT "Empresa_sectorEconomicoSiiId_fkey" FOREIGN KEY ("sectorEconomicoSiiId") REFERENCES "dbo"."SectorEconomicoSii"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Encuesta" ADD CONSTRAINT "Encuesta_archivoAdjuntoid_fkey" FOREIGN KEY ("archivoAdjuntoid") REFERENCES "dbo"."ArchivoAdjunto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaEmpresa" ADD CONSTRAINT "EncuestaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaEmpresa" ADD CONSTRAINT "EncuestaEmpresa_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "dbo"."Encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaEmpresa" ADD CONSTRAINT "EncuestaEmpresa_estadoEmpresaId_fkey" FOREIGN KEY ("estadoEmpresaId") REFERENCES "dbo"."EstadoEmpresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaPlanta" ADD CONSTRAINT "EncuestaPlanta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "dbo"."Encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaPlanta" ADD CONSTRAINT "EncuestaPlanta_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "dbo"."Planta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EncuestaPlanta" ADD CONSTRAINT "EncuestaPlanta_estadoProcesoId_fkey" FOREIGN KEY ("estadoProcesoId") REFERENCES "dbo"."EstadoProceso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Energetico" ADD CONSTRAINT "Energetico_poderCalorificoUMedidaId_fkey" FOREIGN KEY ("poderCalorificoUMedidaId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Energetico" ADD CONSTRAINT "Energetico_densidadUnidadMedidaId_fkey" FOREIGN KEY ("densidadUnidadMedidaId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Energetico" ADD CONSTRAINT "Energetico_energeticoGrupoId_fkey" FOREIGN KEY ("energeticoGrupoId") REFERENCES "dbo"."EnergeticoGrupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EnergeticoUnidadMedida" ADD CONSTRAINT "EnergeticoUnidadMedida_energeticoId_fkey" FOREIGN KEY ("energeticoId") REFERENCES "dbo"."Energetico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."EnergeticoUnidadMedida" ADD CONSTRAINT "EnergeticoUnidadMedida_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."FactorConversion" ADD CONSTRAINT "FactorConversion_uOrigenId_fkey" FOREIGN KEY ("uOrigenId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."FactorConversion" ADD CONSTRAINT "FactorConversion_uDestinoId_fkey" FOREIGN KEY ("uDestinoId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."IntensidadEnergEncuestaEmpresa" ADD CONSTRAINT "IntensidadEnergEncuestaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."IntensidadEnergEncuestaEmpresa" ADD CONSTRAINT "IntensidadEnergEncuestaEmpresa_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "dbo"."Encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Planta" ADD CONSTRAINT "Planta_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES "dbo"."Comuna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Planta" ADD CONSTRAINT "Planta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Reporte" ADD CONSTRAINT "Reporte_estadoReporteId_fkey" FOREIGN KEY ("estadoReporteId") REFERENCES "dbo"."EstadoReporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Reporte" ADD CONSTRAINT "Reporte_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "dbo"."Encuesta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."SubSectorEconomico" ADD CONSTRAINT "SubSectorEconomico_sectorEconomicoId_fkey" FOREIGN KEY ("sectorEconomicoId") REFERENCES "dbo"."SectorEconomico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_energeticoRegionDestId_fkey" FOREIGN KEY ("energeticoRegionDestId") REFERENCES "dbo"."Energetico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "dbo"."Planta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES "dbo"."Encuesta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES "dbo"."Formulario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_categoriaTransaccionId_fkey" FOREIGN KEY ("categoriaTransaccionId") REFERENCES "dbo"."CategoriaTransaccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_energeticoInId_fkey" FOREIGN KEY ("energeticoInId") REFERENCES "dbo"."Energetico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_energeticoOutId_fkey" FOREIGN KEY ("energeticoOutId") REFERENCES "dbo"."Energetico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_unidadMedidaInId_fkey" FOREIGN KEY ("unidadMedidaInId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_unidadMedidaOutId_fkey" FOREIGN KEY ("unidadMedidaOutId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_unidadMedidaNoAprovechadaId_fkey" FOREIGN KEY ("unidadMedidaNoAprovechadaId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_unidadMedidaCapInstaladaId_fkey" FOREIGN KEY ("unidadMedidaCapInstaladaId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_regionDestId_fkey" FOREIGN KEY ("regionDestId") REFERENCES "dbo"."Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_sectorEconomicoDestId_fkey" FOREIGN KEY ("sectorEconomicoDestId") REFERENCES "dbo"."SectorEconomico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_subSectorEconomicoDestId_fkey" FOREIGN KEY ("subSectorEconomicoDestId") REFERENCES "dbo"."SubSectorEconomico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_tecnologiaId_fkey" FOREIGN KEY ("tecnologiaId") REFERENCES "dbo"."Tecnologia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Transaccion" ADD CONSTRAINT "Transaccion_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES "dbo"."Pais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."TransaccionIntensidadEnergia" ADD CONSTRAINT "TransaccionIntensidadEnergia_intensidadEnergEncuestaEmpres_fkey" FOREIGN KEY ("intensidadEnergEncuestaEmpresaId") REFERENCES "dbo"."IntensidadEnergEncuestaEmpresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."UnidadMedida" ADD CONSTRAINT "UnidadMedida_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."UnidadMedida" ADD CONSTRAINT "UnidadMedida_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES "dbo"."UnidadMedida"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "dbo"."Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."UsuarioRole" ADD CONSTRAINT "UsuarioRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "dbo"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dbo"."UsuarioRole" ADD CONSTRAINT "UsuarioRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "dbo"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
