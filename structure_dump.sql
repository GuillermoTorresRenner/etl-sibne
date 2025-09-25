--
-- PostgreSQL database dump
--

\restrict hK0PbcFO7djamqenPcSop8JBuATyiCPTZG0gIBaO1KnSBHWVuZ2qzRZ503zu2LK

-- Dumped from database version 17.6 (Debian 17.6-1.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY dbo."UsuarioToken" DROP CONSTRAINT IF EXISTS "UsuarioToken_userId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioRole" DROP CONSTRAINT IF EXISTS "UsuarioRole_UserId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioRole" DROP CONSTRAINT IF EXISTS "UsuarioRole_RoleId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioLogin" DROP CONSTRAINT IF EXISTS "UsuarioLogin_userId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."UnidadMedida" DROP CONSTRAINT IF EXISTS "UnidadMedida_origenId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."UnidadMedida" DROP CONSTRAINT IF EXISTS "UnidadMedida_destinoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_unidadMedidaOutId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_unidadMedidaNoAprovechadaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_unidadMedidaInId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_unidadMedidaCapInstaladaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_tecnologiaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_subSectorEconomicoDestId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_sectorEconomicoDestId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_regionDestId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_plantaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_paisId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_formularioId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_energeticoRegionDestId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_energeticoOutId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_energeticoInId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_encuestaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_categoriaTransaccionId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."TransaccionIntensidadEnergia" DROP CONSTRAINT IF EXISTS "TransaccionIntensidadEnergia_intensidadEnergEncuestaEmpres_fkey";
ALTER TABLE IF EXISTS ONLY dbo."SubSectorEconomico" DROP CONSTRAINT IF EXISTS "SubSectorEconomico_sectorEconomicoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Reporte" DROP CONSTRAINT IF EXISTS "Reporte_estadoReporteId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Reporte" DROP CONSTRAINT IF EXISTS "Reporte_encuestaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Planta" DROP CONSTRAINT IF EXISTS "Planta_empresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Planta" DROP CONSTRAINT IF EXISTS "Planta_comunaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."IntensidadEnergEncuestaEmpresa" DROP CONSTRAINT IF EXISTS "IntensidadEnergEncuestaEmpresa_encuestaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."IntensidadEnergEncuestaEmpresa" DROP CONSTRAINT IF EXISTS "IntensidadEnergEncuestaEmpresa_empresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."FactorConversion" DROP CONSTRAINT IF EXISTS "FactorConversion_uOrigenId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."FactorConversion" DROP CONSTRAINT IF EXISTS "FactorConversion_uDestinoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Energetico" DROP CONSTRAINT IF EXISTS "Energetico_poderCalorificoUMedidaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Energetico" DROP CONSTRAINT IF EXISTS "Energetico_energeticoGrupoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Energetico" DROP CONSTRAINT IF EXISTS "Energetico_densidadUnidadMedidaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EnergeticoUnidadMedida" DROP CONSTRAINT IF EXISTS "EnergeticoUnidadMedida_unidadMedidaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EnergeticoUnidadMedida" DROP CONSTRAINT IF EXISTS "EnergeticoUnidadMedida_energeticoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Encuesta" DROP CONSTRAINT IF EXISTS "Encuesta_archivoAdjuntoid_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaPlanta" DROP CONSTRAINT IF EXISTS "EncuestaPlanta_plantaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaPlanta" DROP CONSTRAINT IF EXISTS "EncuestaPlanta_estadoProcesoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaPlanta" DROP CONSTRAINT IF EXISTS "EncuestaPlanta_encuestaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaEmpresa" DROP CONSTRAINT IF EXISTS "EncuestaEmpresa_estadoEmpresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaEmpresa" DROP CONSTRAINT IF EXISTS "EncuestaEmpresa_encuestaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaEmpresa" DROP CONSTRAINT IF EXISTS "EncuestaEmpresa_empresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Empresa" DROP CONSTRAINT IF EXISTS "Empresa_subSectorEconomicoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Empresa" DROP CONSTRAINT IF EXISTS "Empresa_sectorEnergeticoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Empresa" DROP CONSTRAINT IF EXISTS "Empresa_sectorEconomicoSiiId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Empresa" DROP CONSTRAINT IF EXISTS "Empresa_sectorEconomicoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EmailLogs" DROP CONSTRAINT IF EXISTS "EmailLogs_empresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EmailLogs" DROP CONSTRAINT IF EXISTS "EmailLogs_emailConfigId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."EmailConfig" DROP CONSTRAINT IF EXISTS "EmailConfig_estadoEmailId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Contacto" DROP CONSTRAINT IF EXISTS "Contacto_tipoContactoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Contacto" DROP CONSTRAINT IF EXISTS "Contacto_empresaId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."Comuna" DROP CONSTRAINT IF EXISTS "Comuna_regionId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."CategoriaTransaccion" DROP CONSTRAINT IF EXISTS "CategoriaTransaccion_formularioId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."CargaMasivaError" DROP CONSTRAINT IF EXISTS "CargaMasivaError_cargaMasivaDetalleId_fkey";
ALTER TABLE IF EXISTS ONLY dbo."CargaMasivaDetalle" DROP CONSTRAINT IF EXISTS "CargaMasivaDetalle_cargaMasivaArchivoId_fkey";
ALTER TABLE IF EXISTS ONLY dbo._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY dbo."Usuario" DROP CONSTRAINT IF EXISTS "Usuario_pkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioToken" DROP CONSTRAINT IF EXISTS "UsuarioToken_pkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioRole" DROP CONSTRAINT IF EXISTS "UsuarioRole_pkey";
ALTER TABLE IF EXISTS ONLY dbo."UsuarioLogin" DROP CONSTRAINT IF EXISTS "UsuarioLogin_pkey";
ALTER TABLE IF EXISTS ONLY dbo."UnidadMedida" DROP CONSTRAINT IF EXISTS "UnidadMedida_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Transaccion" DROP CONSTRAINT IF EXISTS "Transaccion_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TransaccionIntensidadEnergia" DROP CONSTRAINT IF EXISTS "TransaccionIntensidadEnergia_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TipoUsoProceso" DROP CONSTRAINT IF EXISTS "TipoUsoProceso_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TipoTransporte" DROP CONSTRAINT IF EXISTS "TipoTransporte_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TipoPerdida" DROP CONSTRAINT IF EXISTS "TipoPerdida_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TipoOtroUso" DROP CONSTRAINT IF EXISTS "TipoOtroUso_pkey";
ALTER TABLE IF EXISTS ONLY dbo."TipoContacto" DROP CONSTRAINT IF EXISTS "TipoContacto_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Tecnologia" DROP CONSTRAINT IF EXISTS "Tecnologia_pkey";
ALTER TABLE IF EXISTS ONLY dbo."SubSectorEconomico" DROP CONSTRAINT IF EXISTS "SubSectorEconomico_pkey";
ALTER TABLE IF EXISTS ONLY dbo."SectorEnergetico" DROP CONSTRAINT IF EXISTS "SectorEnergetico_pkey";
ALTER TABLE IF EXISTS ONLY dbo."SectorEconomico" DROP CONSTRAINT IF EXISTS "SectorEconomico_pkey";
ALTER TABLE IF EXISTS ONLY dbo."SectorEconomicoSii" DROP CONSTRAINT IF EXISTS "SectorEconomicoSii_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Role" DROP CONSTRAINT IF EXISTS "Role_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Reporte" DROP CONSTRAINT IF EXISTS "Reporte_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Region" DROP CONSTRAINT IF EXISTS "Region_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Provincia" DROP CONSTRAINT IF EXISTS "Provincia_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Planta" DROP CONSTRAINT IF EXISTS "Planta_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Pais" DROP CONSTRAINT IF EXISTS "Pais_pkey";
ALTER TABLE IF EXISTS ONLY dbo."IntensidadEnergEncuestaEmpresa" DROP CONSTRAINT IF EXISTS "IntensidadEnergEncuestaEmpresa_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Formulario" DROP CONSTRAINT IF EXISTS "Formulario_pkey";
ALTER TABLE IF EXISTS ONLY dbo."FactorConversion" DROP CONSTRAINT IF EXISTS "FactorConversion_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EstadoReporte" DROP CONSTRAINT IF EXISTS "EstadoReporte_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EstadoProceso" DROP CONSTRAINT IF EXISTS "EstadoProceso_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EstadoEmpresa" DROP CONSTRAINT IF EXISTS "EstadoEmpresa_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EstadoEmail" DROP CONSTRAINT IF EXISTS "EstadoEmail_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Energetico" DROP CONSTRAINT IF EXISTS "Energetico_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EnergeticoUnidadMedida" DROP CONSTRAINT IF EXISTS "EnergeticoUnidadMedida_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EnergeticoGrupos" DROP CONSTRAINT IF EXISTS "EnergeticoGrupos_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Encuesta" DROP CONSTRAINT IF EXISTS "Encuesta_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaPlanta" DROP CONSTRAINT IF EXISTS "EncuestaPlanta_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EncuestaEmpresa" DROP CONSTRAINT IF EXISTS "EncuestaEmpresa_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Empresa" DROP CONSTRAINT IF EXISTS "Empresa_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EmailLogs" DROP CONSTRAINT IF EXISTS "EmailLogs_pkey";
ALTER TABLE IF EXISTS ONLY dbo."EmailConfig" DROP CONSTRAINT IF EXISTS "EmailConfig_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Contacto" DROP CONSTRAINT IF EXISTS "Contacto_pkey";
ALTER TABLE IF EXISTS ONLY dbo."Comuna" DROP CONSTRAINT IF EXISTS "Comuna_pkey";
ALTER TABLE IF EXISTS ONLY dbo."CategoriaTransaccion" DROP CONSTRAINT IF EXISTS "CategoriaTransaccion_pkey";
ALTER TABLE IF EXISTS ONLY dbo."CargaMasivaError" DROP CONSTRAINT IF EXISTS "CargaMasivaError_pkey";
ALTER TABLE IF EXISTS ONLY dbo."CargaMasivaDetalle" DROP CONSTRAINT IF EXISTS "CargaMasivaDetalle_pkey";
ALTER TABLE IF EXISTS ONLY dbo."CargaMasivaArchivo" DROP CONSTRAINT IF EXISTS "CargaMasivaArchivo_pkey";
ALTER TABLE IF EXISTS ONLY dbo."ArchivoAdjunto" DROP CONSTRAINT IF EXISTS "ArchivoAdjunto_pkey";
ALTER TABLE IF EXISTS dbo."UnidadMedida" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TransaccionIntensidadEnergia" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Transaccion" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TipoUsoProceso" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TipoTransporte" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TipoPerdida" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TipoOtroUso" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."TipoContacto" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Tecnologia" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."SubSectorEconomico" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."SectorEnergetico" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."SectorEconomicoSii" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."SectorEconomico" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Reporte" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Region" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Provincia" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Planta" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Pais" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."IntensidadEnergEncuestaEmpresa" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Formulario" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."FactorConversion" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EstadoReporte" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EstadoProceso" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EstadoEmpresa" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EstadoEmail" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EnergeticoGrupos" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Energetico" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Encuesta" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EmailLogs" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."EmailConfig" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Contacto" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."Comuna" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."CategoriaTransaccion" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."CargaMasivaError" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."CargaMasivaDetalle" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."CargaMasivaArchivo" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS dbo."ArchivoAdjunto" ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS dbo._prisma_migrations;
DROP TABLE IF EXISTS dbo."UsuarioToken";
DROP TABLE IF EXISTS dbo."UsuarioRole";
DROP TABLE IF EXISTS dbo."UsuarioLogin";
DROP TABLE IF EXISTS dbo."Usuario";
DROP SEQUENCE IF EXISTS dbo."UnidadMedida_id_seq";
DROP TABLE IF EXISTS dbo."UnidadMedida";
DROP SEQUENCE IF EXISTS dbo."Transaccion_id_seq";
DROP SEQUENCE IF EXISTS dbo."TransaccionIntensidadEnergia_id_seq";
DROP TABLE IF EXISTS dbo."TransaccionIntensidadEnergia";
DROP TABLE IF EXISTS dbo."Transaccion";
DROP SEQUENCE IF EXISTS dbo."TipoUsoProceso_id_seq";
DROP TABLE IF EXISTS dbo."TipoUsoProceso";
DROP SEQUENCE IF EXISTS dbo."TipoTransporte_id_seq";
DROP TABLE IF EXISTS dbo."TipoTransporte";
DROP SEQUENCE IF EXISTS dbo."TipoPerdida_id_seq";
DROP TABLE IF EXISTS dbo."TipoPerdida";
DROP SEQUENCE IF EXISTS dbo."TipoOtroUso_id_seq";
DROP TABLE IF EXISTS dbo."TipoOtroUso";
DROP SEQUENCE IF EXISTS dbo."TipoContacto_id_seq";
DROP TABLE IF EXISTS dbo."TipoContacto";
DROP SEQUENCE IF EXISTS dbo."Tecnologia_id_seq";
DROP TABLE IF EXISTS dbo."Tecnologia";
DROP SEQUENCE IF EXISTS dbo."SubSectorEconomico_id_seq";
DROP TABLE IF EXISTS dbo."SubSectorEconomico";
DROP SEQUENCE IF EXISTS dbo."SectorEnergetico_id_seq";
DROP TABLE IF EXISTS dbo."SectorEnergetico";
DROP SEQUENCE IF EXISTS dbo."SectorEconomico_id_seq";
DROP SEQUENCE IF EXISTS dbo."SectorEconomicoSii_id_seq";
DROP TABLE IF EXISTS dbo."SectorEconomicoSii";
DROP TABLE IF EXISTS dbo."SectorEconomico";
DROP TABLE IF EXISTS dbo."Role";
DROP SEQUENCE IF EXISTS dbo."Reporte_id_seq";
DROP TABLE IF EXISTS dbo."Reporte";
DROP SEQUENCE IF EXISTS dbo."Region_id_seq";
DROP TABLE IF EXISTS dbo."Region";
DROP SEQUENCE IF EXISTS dbo."Provincia_id_seq";
DROP TABLE IF EXISTS dbo."Provincia";
DROP SEQUENCE IF EXISTS dbo."Planta_id_seq";
DROP TABLE IF EXISTS dbo."Planta";
DROP SEQUENCE IF EXISTS dbo."Pais_id_seq";
DROP TABLE IF EXISTS dbo."Pais";
DROP SEQUENCE IF EXISTS dbo."IntensidadEnergEncuestaEmpresa_id_seq";
DROP TABLE IF EXISTS dbo."IntensidadEnergEncuestaEmpresa";
DROP SEQUENCE IF EXISTS dbo."Formulario_id_seq";
DROP TABLE IF EXISTS dbo."Formulario";
DROP SEQUENCE IF EXISTS dbo."FactorConversion_id_seq";
DROP TABLE IF EXISTS dbo."FactorConversion";
DROP SEQUENCE IF EXISTS dbo."EstadoReporte_id_seq";
DROP TABLE IF EXISTS dbo."EstadoReporte";
DROP SEQUENCE IF EXISTS dbo."EstadoProceso_id_seq";
DROP TABLE IF EXISTS dbo."EstadoProceso";
DROP SEQUENCE IF EXISTS dbo."EstadoEmpresa_id_seq";
DROP TABLE IF EXISTS dbo."EstadoEmpresa";
DROP SEQUENCE IF EXISTS dbo."EstadoEmail_id_seq";
DROP TABLE IF EXISTS dbo."EstadoEmail";
DROP SEQUENCE IF EXISTS dbo."Energetico_id_seq";
DROP TABLE IF EXISTS dbo."EnergeticoUnidadMedida";
DROP SEQUENCE IF EXISTS dbo."EnergeticoGrupos_id_seq";
DROP TABLE IF EXISTS dbo."EnergeticoGrupos";
DROP TABLE IF EXISTS dbo."Energetico";
DROP SEQUENCE IF EXISTS dbo."Encuesta_id_seq";
DROP TABLE IF EXISTS dbo."EncuestaPlanta";
DROP TABLE IF EXISTS dbo."EncuestaEmpresa";
DROP TABLE IF EXISTS dbo."Encuesta";
DROP TABLE IF EXISTS dbo."Empresa";
DROP SEQUENCE IF EXISTS dbo."EmailLogs_id_seq";
DROP TABLE IF EXISTS dbo."EmailLogs";
DROP SEQUENCE IF EXISTS dbo."EmailConfig_id_seq";
DROP TABLE IF EXISTS dbo."EmailConfig";
DROP SEQUENCE IF EXISTS dbo."Contacto_id_seq";
DROP TABLE IF EXISTS dbo."Contacto";
DROP SEQUENCE IF EXISTS dbo."Comuna_id_seq";
DROP TABLE IF EXISTS dbo."Comuna";
DROP SEQUENCE IF EXISTS dbo."CategoriaTransaccion_id_seq";
DROP TABLE IF EXISTS dbo."CategoriaTransaccion";
DROP SEQUENCE IF EXISTS dbo."CargaMasivaError_id_seq";
DROP TABLE IF EXISTS dbo."CargaMasivaError";
DROP SEQUENCE IF EXISTS dbo."CargaMasivaDetalle_id_seq";
DROP TABLE IF EXISTS dbo."CargaMasivaDetalle";
DROP SEQUENCE IF EXISTS dbo."CargaMasivaArchivo_id_seq";
DROP TABLE IF EXISTS dbo."CargaMasivaArchivo";
DROP SEQUENCE IF EXISTS dbo."ArchivoAdjunto_id_seq";
DROP TABLE IF EXISTS dbo."ArchivoAdjunto";
DROP SCHEMA IF EXISTS dbo;
--
-- Name: dbo; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA dbo;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ArchivoAdjunto; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."ArchivoAdjunto" (
    id integer NOT NULL,
    "nombreArchivo" text NOT NULL,
    tipo text NOT NULL,
    ext text NOT NULL,
    "FileName" text
);


--
-- Name: ArchivoAdjunto_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."ArchivoAdjunto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ArchivoAdjunto_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."ArchivoAdjunto_id_seq" OWNED BY dbo."ArchivoAdjunto".id;


--
-- Name: CargaMasivaArchivo; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."CargaMasivaArchivo" (
    id integer NOT NULL,
    "nombreArchivo" text NOT NULL,
    "fechaIngreso" timestamp(3) without time zone,
    estado text NOT NULL
);


--
-- Name: CargaMasivaArchivo_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."CargaMasivaArchivo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CargaMasivaArchivo_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."CargaMasivaArchivo_id_seq" OWNED BY dbo."CargaMasivaArchivo".id;


--
-- Name: CargaMasivaDetalle; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."CargaMasivaDetalle" (
    id integer NOT NULL,
    "cargaMasivaArchivoId" integer NOT NULL,
    "nombreHoja" text NOT NULL,
    "fechaIngreso" timestamp(3) without time zone,
    estado text NOT NULL,
    "registrosCargado" integer NOT NULL,
    "registrosConError" integer NOT NULL,
    "totalRegistros" integer NOT NULL
);


--
-- Name: CargaMasivaDetalle_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."CargaMasivaDetalle_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CargaMasivaDetalle_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."CargaMasivaDetalle_id_seq" OWNED BY dbo."CargaMasivaDetalle".id;


--
-- Name: CargaMasivaError; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."CargaMasivaError" (
    id integer NOT NULL,
    "cargaMasivaArchivoId" integer NOT NULL,
    linea integer NOT NULL,
    columna integer NOT NULL,
    "nombreCampo" text NOT NULL,
    descripcion text NOT NULL,
    "cargaMasivaDetalleId" integer NOT NULL,
    "empresaId" text NOT NULL
);


--
-- Name: CargaMasivaError_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."CargaMasivaError_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CargaMasivaError_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."CargaMasivaError_id_seq" OWNED BY dbo."CargaMasivaError".id;


--
-- Name: CategoriaTransaccion; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."CategoriaTransaccion" (
    id integer NOT NULL,
    nombre text NOT NULL,
    categoria text NOT NULL,
    "formularioId" integer NOT NULL
);


--
-- Name: CategoriaTransaccion_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."CategoriaTransaccion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: CategoriaTransaccion_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."CategoriaTransaccion_id_seq" OWNED BY dbo."CategoriaTransaccion".id;


--
-- Name: Comuna; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Comuna" (
    id integer NOT NULL,
    "provinciaId" integer NOT NULL,
    "regionId" integer NOT NULL,
    nombre text NOT NULL,
    "Old_Id" integer
);


--
-- Name: Comuna_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Comuna_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Comuna_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Comuna_id_seq" OWNED BY dbo."Comuna".id;


--
-- Name: Contacto; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Contacto" (
    id integer NOT NULL,
    nombre text NOT NULL,
    cargo text NOT NULL,
    email text NOT NULL,
    telefono text NOT NULL,
    rut integer NOT NULL,
    "digitoVerificador" text NOT NULL,
    "empresaId" text NOT NULL,
    "tipoContactoId" integer NOT NULL
);


--
-- Name: Contacto_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Contacto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Contacto_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Contacto_id_seq" OWNED BY dbo."Contacto".id;


--
-- Name: EmailConfig; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EmailConfig" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    asunto text NOT NULL,
    plantilla text NOT NULL,
    "estadoEmailId" integer NOT NULL,
    "fechaGeneracionEnvio" timestamp(3) without time zone,
    "encuestaId" integer,
    "listaEmpresas" text NOT NULL
);


--
-- Name: EmailConfig_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EmailConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EmailConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EmailConfig_id_seq" OWNED BY dbo."EmailConfig".id;


--
-- Name: EmailLogs; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EmailLogs" (
    id integer NOT NULL,
    "fechaHoraRegistro" timestamp(3) without time zone NOT NULL,
    "fechaHoraEnvio" timestamp(3) without time zone,
    estado text NOT NULL,
    para text NOT NULL,
    msje text NOT NULL,
    "emailConfigId" integer,
    "empresaId" text NOT NULL
);


--
-- Name: EmailLogs_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EmailLogs_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EmailLogs_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EmailLogs_id_seq" OWNED BY dbo."EmailLogs".id;


--
-- Name: Empresa; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Empresa" (
    id text NOT NULL,
    rut integer NOT NULL,
    dv text NOT NULL,
    nombre text NOT NULL,
    "razonSocial" text NOT NULL,
    direccion text NOT NULL,
    habilitado boolean NOT NULL,
    "sectorEnergeticoId" integer NOT NULL,
    "sectorEconomicoId" integer NOT NULL,
    "subSectorEconomicoId" integer NOT NULL,
    "sectorEconomicoSiiId" integer,
    "instensidadEnergiaFormObligada" boolean NOT NULL
);


--
-- Name: Encuesta; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Encuesta" (
    id integer NOT NULL,
    nombre text NOT NULL,
    anio integer NOT NULL,
    "fechaCreacion" timestamp(3) without time zone NOT NULL,
    "fechaInicio" timestamp(3) without time zone,
    "fechaTermino" timestamp(3) without time zone,
    "margenError" integer NOT NULL,
    "valorDolar" double precision,
    activo boolean NOT NULL,
    "archivoAdjuntoid" integer
);


--
-- Name: EncuestaEmpresa; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EncuestaEmpresa" (
    "empresaId" text NOT NULL,
    "encuestaId" integer NOT NULL,
    "estadoEmpresaId" integer NOT NULL
);


--
-- Name: EncuestaPlanta; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EncuestaPlanta" (
    "encuestaId" integer NOT NULL,
    "plantaId" integer NOT NULL,
    "estadoProcesoId" integer NOT NULL,
    "fechaAsignacion" timestamp(3) without time zone NOT NULL,
    "fechaInicio" timestamp(3) without time zone,
    "fechaTransaccion" timestamp(3) without time zone,
    "fechaFinalizacion" timestamp(3) without time zone
);


--
-- Name: Encuesta_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Encuesta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Encuesta_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Encuesta_id_seq" OWNED BY dbo."Encuesta".id;


--
-- Name: Energetico; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Energetico" (
    id integer NOT NULL,
    activo boolean NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    "libreDisposicion" boolean NOT NULL,
    "densidadValor" double precision,
    "densidadUnidadMedidaId" integer,
    "poderCalorificoValor" double precision,
    "poderCalorificoUMedidaId" integer,
    "pedirHumedad" boolean NOT NULL,
    "pedirPoderCalorifico" boolean NOT NULL,
    "energeticoGrupoId" integer NOT NULL
);


--
-- Name: EnergeticoGrupos; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EnergeticoGrupos" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: EnergeticoGrupos_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EnergeticoGrupos_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EnergeticoGrupos_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EnergeticoGrupos_id_seq" OWNED BY dbo."EnergeticoGrupos".id;


--
-- Name: EnergeticoUnidadMedida; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EnergeticoUnidadMedida" (
    "energeticoId" integer NOT NULL,
    "unidadMedidaId" integer NOT NULL
);


--
-- Name: Energetico_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Energetico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Energetico_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Energetico_id_seq" OWNED BY dbo."Energetico".id;


--
-- Name: EstadoEmail; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EstadoEmail" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: EstadoEmail_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EstadoEmail_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstadoEmail_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EstadoEmail_id_seq" OWNED BY dbo."EstadoEmail".id;


--
-- Name: EstadoEmpresa; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EstadoEmpresa" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: EstadoEmpresa_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EstadoEmpresa_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstadoEmpresa_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EstadoEmpresa_id_seq" OWNED BY dbo."EstadoEmpresa".id;


--
-- Name: EstadoProceso; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EstadoProceso" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: EstadoProceso_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EstadoProceso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstadoProceso_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EstadoProceso_id_seq" OWNED BY dbo."EstadoProceso".id;


--
-- Name: EstadoReporte; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."EstadoReporte" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: EstadoReporte_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."EstadoReporte_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: EstadoReporte_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."EstadoReporte_id_seq" OWNED BY dbo."EstadoReporte".id;


--
-- Name: FactorConversion; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."FactorConversion" (
    id integer NOT NULL,
    factor double precision NOT NULL,
    "uOrigenId" integer NOT NULL,
    "uDestinoId" integer NOT NULL
);


--
-- Name: FactorConversion_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."FactorConversion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: FactorConversion_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."FactorConversion_id_seq" OWNED BY dbo."FactorConversion".id;


--
-- Name: Formulario; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Formulario" (
    id integer NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL,
    "codigoNav" text NOT NULL
);


--
-- Name: Formulario_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Formulario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Formulario_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Formulario_id_seq" OWNED BY dbo."Formulario".id;


--
-- Name: IntensidadEnergEncuestaEmpresa; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."IntensidadEnergEncuestaEmpresa" (
    id integer NOT NULL,
    "empresaId" text NOT NULL,
    "encuestaId" integer NOT NULL,
    "procesoTerminado" boolean NOT NULL,
    "fechaHoraRegistro" timestamp(3) without time zone NOT NULL
);


--
-- Name: IntensidadEnergEncuestaEmpresa_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."IntensidadEnergEncuestaEmpresa_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: IntensidadEnergEncuestaEmpresa_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."IntensidadEnergEncuestaEmpresa_id_seq" OWNED BY dbo."IntensidadEnergEncuestaEmpresa".id;


--
-- Name: Pais; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Pais" (
    id integer NOT NULL,
    iso2 text NOT NULL,
    iso3 text NOT NULL,
    nombre text NOT NULL,
    "numeroIso" integer NOT NULL
);


--
-- Name: Pais_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Pais_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Pais_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Pais_id_seq" OWNED BY dbo."Pais".id;


--
-- Name: Planta; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Planta" (
    id integer NOT NULL,
    codigo integer NOT NULL,
    nombre text NOT NULL,
    activo boolean NOT NULL,
    "comunaId" integer NOT NULL,
    "empresaId" text NOT NULL
);


--
-- Name: Planta_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Planta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Planta_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Planta_id_seq" OWNED BY dbo."Planta".id;


--
-- Name: Provincia; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Provincia" (
    id integer NOT NULL,
    "regionId" integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: Provincia_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Provincia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Provincia_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Provincia_id_seq" OWNED BY dbo."Provincia".id;


--
-- Name: Region; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Region" (
    id integer NOT NULL,
    nombre text NOT NULL,
    numero integer NOT NULL,
    posicion integer NOT NULL
);


--
-- Name: Region_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Region_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Region_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Region_id_seq" OWNED BY dbo."Region".id;


--
-- Name: Reporte; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Reporte" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text NOT NULL,
    "consultaSql" text NOT NULL,
    "esStoredProcedure" boolean NOT NULL,
    activo boolean NOT NULL,
    "fechaGeneracionArchivo" timestamp(3) without time zone,
    "estadoReporteId" integer NOT NULL,
    "encuestaId" integer
);


--
-- Name: Reporte_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Reporte_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Reporte_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Reporte_id_seq" OWNED BY dbo."Reporte".id;


--
-- Name: Role; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Role" (
    id text NOT NULL,
    name text,
    "normalizedName" text,
    "concurrencyStamp" text
);


--
-- Name: SectorEconomico; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."SectorEconomico" (
    id integer NOT NULL,
    nombre text NOT NULL,
    "codigoStr" text NOT NULL,
    activo boolean NOT NULL
);


--
-- Name: SectorEconomicoSii; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."SectorEconomicoSii" (
    id integer NOT NULL,
    nombre text NOT NULL,
    "codigoStr" text NOT NULL,
    activo boolean NOT NULL
);


--
-- Name: SectorEconomicoSii_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."SectorEconomicoSii_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SectorEconomicoSii_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."SectorEconomicoSii_id_seq" OWNED BY dbo."SectorEconomicoSii".id;


--
-- Name: SectorEconomico_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."SectorEconomico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SectorEconomico_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."SectorEconomico_id_seq" OWNED BY dbo."SectorEconomico".id;


--
-- Name: SectorEnergetico; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."SectorEnergetico" (
    id integer NOT NULL,
    nombre text NOT NULL,
    "codigoStr" text NOT NULL
);


--
-- Name: SectorEnergetico_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."SectorEnergetico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SectorEnergetico_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."SectorEnergetico_id_seq" OWNED BY dbo."SectorEnergetico".id;


--
-- Name: SubSectorEconomico; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."SubSectorEconomico" (
    id integer NOT NULL,
    nombre text NOT NULL,
    activo boolean NOT NULL,
    "sectorEconomicoId" integer NOT NULL
);


--
-- Name: SubSectorEconomico_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."SubSectorEconomico_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SubSectorEconomico_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."SubSectorEconomico_id_seq" OWNED BY dbo."SubSectorEconomico".id;


--
-- Name: Tecnologia; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Tecnologia" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: Tecnologia_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Tecnologia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Tecnologia_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Tecnologia_id_seq" OWNED BY dbo."Tecnologia".id;


--
-- Name: TipoContacto; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TipoContacto" (
    id integer NOT NULL,
    nombre text NOT NULL
);


--
-- Name: TipoContacto_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TipoContacto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TipoContacto_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TipoContacto_id_seq" OWNED BY dbo."TipoContacto".id;


--
-- Name: TipoOtroUso; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TipoOtroUso" (
    id integer NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    activo boolean NOT NULL,
    orden integer NOT NULL
);


--
-- Name: TipoOtroUso_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TipoOtroUso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TipoOtroUso_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TipoOtroUso_id_seq" OWNED BY dbo."TipoOtroUso".id;


--
-- Name: TipoPerdida; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TipoPerdida" (
    id integer NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL
);


--
-- Name: TipoPerdida_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TipoPerdida_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TipoPerdida_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TipoPerdida_id_seq" OWNED BY dbo."TipoPerdida".id;


--
-- Name: TipoTransporte; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TipoTransporte" (
    id integer NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL
);


--
-- Name: TipoTransporte_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TipoTransporte_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TipoTransporte_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TipoTransporte_id_seq" OWNED BY dbo."TipoTransporte".id;


--
-- Name: TipoUsoProceso; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TipoUsoProceso" (
    id integer NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    orden integer NOT NULL
);


--
-- Name: TipoUsoProceso_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TipoUsoProceso_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TipoUsoProceso_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TipoUsoProceso_id_seq" OWNED BY dbo."TipoUsoProceso".id;


--
-- Name: Transaccion; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Transaccion" (
    id integer NOT NULL,
    "cantidadIn" double precision NOT NULL,
    "cantidadOut" double precision NOT NULL,
    "cantidadTCalIn" double precision NOT NULL,
    "cantidadTCalOut" double precision NOT NULL,
    "categoriaTransaccionId" integer NOT NULL,
    "energeticoInId" integer,
    "energeticoOutId" integer,
    "fechaIngreso" timestamp(3) without time zone,
    "formularioId" integer NOT NULL,
    "plantaId" integer NOT NULL,
    "encuestaId" integer NOT NULL,
    "unidadMedidaInId" integer,
    "unidadMedidaOutId" integer,
    "regionDestId" integer,
    "sectorEconomicoDestId" integer,
    "subSectorEconomicoDestId" integer,
    "cantPoderCalorifico" double precision,
    "porcentajeHumedad" double precision,
    "nombreEmpresaOrigen" text,
    "stockInicial" double precision,
    "stockFinal" double precision,
    "nombreEmpresaDestino" text,
    "mercadoSpot" boolean,
    localidad text,
    "tecnologiaId" integer,
    "unidadMedidaNoAprovechadaId" integer,
    "cantidadNoAprovechada" double precision,
    "unidadMedidaCapInstaladaId" integer,
    "cantidadCapInstalada" double precision,
    observacion text,
    "paisId" integer,
    "subTecnologia" text,
    detalle text,
    "subCategoria" text,
    datos jsonb DEFAULT '{}'::jsonb NOT NULL,
    "DatosStr" text,
    "energeticoRegionDestId" integer
);


--
-- Name: TransaccionIntensidadEnergia; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."TransaccionIntensidadEnergia" (
    id integer NOT NULL,
    "consumoEnergia" double precision NOT NULL,
    "ventaMonetariaAnual" double precision NOT NULL,
    unidad text NOT NULL,
    "formularioId" integer NOT NULL,
    "fechaHoraRegistro" timestamp(3) without time zone NOT NULL,
    "intensidadEnergEncuestaEmpresaId" integer NOT NULL
);


--
-- Name: TransaccionIntensidadEnergia_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."TransaccionIntensidadEnergia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: TransaccionIntensidadEnergia_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."TransaccionIntensidadEnergia_id_seq" OWNED BY dbo."TransaccionIntensidadEnergia".id;


--
-- Name: Transaccion_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."Transaccion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Transaccion_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."Transaccion_id_seq" OWNED BY dbo."Transaccion".id;


--
-- Name: UnidadMedida; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."UnidadMedida" (
    id integer NOT NULL,
    "codigoStr" text NOT NULL,
    nombre text NOT NULL,
    "tipoUnidad" text NOT NULL,
    "destinoId" integer,
    "origenId" integer,
    "visibleSelect" boolean NOT NULL
);


--
-- Name: UnidadMedida_id_seq; Type: SEQUENCE; Schema: dbo; Owner: -
--

CREATE SEQUENCE dbo."UnidadMedida_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UnidadMedida_id_seq; Type: SEQUENCE OWNED BY; Schema: dbo; Owner: -
--

ALTER SEQUENCE dbo."UnidadMedida_id_seq" OWNED BY dbo."UnidadMedida".id;


--
-- Name: Usuario; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."Usuario" (
    id text NOT NULL,
    "userName" text,
    "normalizedUserName" text,
    email text,
    "normalizedEmail" text,
    "emailConfirmed" boolean NOT NULL,
    "passwordHash" text,
    "securityStamp" text,
    "concurrencyStamp" text,
    "phoneNumber" text,
    "phoneNumberConfirmed" boolean NOT NULL,
    "twoFactorEnabled" boolean NOT NULL,
    "lockoutEnd" timestamp(3) without time zone,
    "lockoutEnabled" boolean NOT NULL,
    "accessFailedCount" integer NOT NULL,
    habilitado boolean NOT NULL,
    nombre text,
    apellido text,
    eliminado boolean NOT NULL,
    "primerIngreso" boolean NOT NULL
);


--
-- Name: UsuarioLogin; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."UsuarioLogin" (
    "loginProvider" text NOT NULL,
    "providerKey" text NOT NULL,
    "providerDisplayName" text,
    "userId" text NOT NULL
);


--
-- Name: UsuarioRole; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."UsuarioRole" (
    "UserId" text NOT NULL,
    "RoleId" text NOT NULL
);


--
-- Name: UsuarioToken; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo."UsuarioToken" (
    "userId" text NOT NULL,
    "loginProvider" text NOT NULL,
    name text NOT NULL,
    value text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: dbo; Owner: -
--

CREATE TABLE dbo._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: ArchivoAdjunto id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."ArchivoAdjunto" ALTER COLUMN id SET DEFAULT nextval('dbo."ArchivoAdjunto_id_seq"'::regclass);


--
-- Name: CargaMasivaArchivo id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaArchivo" ALTER COLUMN id SET DEFAULT nextval('dbo."CargaMasivaArchivo_id_seq"'::regclass);


--
-- Name: CargaMasivaDetalle id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaDetalle" ALTER COLUMN id SET DEFAULT nextval('dbo."CargaMasivaDetalle_id_seq"'::regclass);


--
-- Name: CargaMasivaError id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaError" ALTER COLUMN id SET DEFAULT nextval('dbo."CargaMasivaError_id_seq"'::regclass);


--
-- Name: CategoriaTransaccion id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CategoriaTransaccion" ALTER COLUMN id SET DEFAULT nextval('dbo."CategoriaTransaccion_id_seq"'::regclass);


--
-- Name: Comuna id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Comuna" ALTER COLUMN id SET DEFAULT nextval('dbo."Comuna_id_seq"'::regclass);


--
-- Name: Contacto id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Contacto" ALTER COLUMN id SET DEFAULT nextval('dbo."Contacto_id_seq"'::regclass);


--
-- Name: EmailConfig id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailConfig" ALTER COLUMN id SET DEFAULT nextval('dbo."EmailConfig_id_seq"'::regclass);


--
-- Name: EmailLogs id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailLogs" ALTER COLUMN id SET DEFAULT nextval('dbo."EmailLogs_id_seq"'::regclass);


--
-- Name: Encuesta id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Encuesta" ALTER COLUMN id SET DEFAULT nextval('dbo."Encuesta_id_seq"'::regclass);


--
-- Name: Energetico id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Energetico" ALTER COLUMN id SET DEFAULT nextval('dbo."Energetico_id_seq"'::regclass);


--
-- Name: EnergeticoGrupos id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EnergeticoGrupos" ALTER COLUMN id SET DEFAULT nextval('dbo."EnergeticoGrupos_id_seq"'::regclass);


--
-- Name: EstadoEmail id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoEmail" ALTER COLUMN id SET DEFAULT nextval('dbo."EstadoEmail_id_seq"'::regclass);


--
-- Name: EstadoEmpresa id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoEmpresa" ALTER COLUMN id SET DEFAULT nextval('dbo."EstadoEmpresa_id_seq"'::regclass);


--
-- Name: EstadoProceso id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoProceso" ALTER COLUMN id SET DEFAULT nextval('dbo."EstadoProceso_id_seq"'::regclass);


--
-- Name: EstadoReporte id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoReporte" ALTER COLUMN id SET DEFAULT nextval('dbo."EstadoReporte_id_seq"'::regclass);


--
-- Name: FactorConversion id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."FactorConversion" ALTER COLUMN id SET DEFAULT nextval('dbo."FactorConversion_id_seq"'::regclass);


--
-- Name: Formulario id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Formulario" ALTER COLUMN id SET DEFAULT nextval('dbo."Formulario_id_seq"'::regclass);


--
-- Name: IntensidadEnergEncuestaEmpresa id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."IntensidadEnergEncuestaEmpresa" ALTER COLUMN id SET DEFAULT nextval('dbo."IntensidadEnergEncuestaEmpresa_id_seq"'::regclass);


--
-- Name: Pais id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Pais" ALTER COLUMN id SET DEFAULT nextval('dbo."Pais_id_seq"'::regclass);


--
-- Name: Planta id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Planta" ALTER COLUMN id SET DEFAULT nextval('dbo."Planta_id_seq"'::regclass);


--
-- Name: Provincia id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Provincia" ALTER COLUMN id SET DEFAULT nextval('dbo."Provincia_id_seq"'::regclass);


--
-- Name: Region id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Region" ALTER COLUMN id SET DEFAULT nextval('dbo."Region_id_seq"'::regclass);


--
-- Name: Reporte id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Reporte" ALTER COLUMN id SET DEFAULT nextval('dbo."Reporte_id_seq"'::regclass);


--
-- Name: SectorEconomico id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEconomico" ALTER COLUMN id SET DEFAULT nextval('dbo."SectorEconomico_id_seq"'::regclass);


--
-- Name: SectorEconomicoSii id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEconomicoSii" ALTER COLUMN id SET DEFAULT nextval('dbo."SectorEconomicoSii_id_seq"'::regclass);


--
-- Name: SectorEnergetico id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEnergetico" ALTER COLUMN id SET DEFAULT nextval('dbo."SectorEnergetico_id_seq"'::regclass);


--
-- Name: SubSectorEconomico id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SubSectorEconomico" ALTER COLUMN id SET DEFAULT nextval('dbo."SubSectorEconomico_id_seq"'::regclass);


--
-- Name: Tecnologia id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Tecnologia" ALTER COLUMN id SET DEFAULT nextval('dbo."Tecnologia_id_seq"'::regclass);


--
-- Name: TipoContacto id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoContacto" ALTER COLUMN id SET DEFAULT nextval('dbo."TipoContacto_id_seq"'::regclass);


--
-- Name: TipoOtroUso id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoOtroUso" ALTER COLUMN id SET DEFAULT nextval('dbo."TipoOtroUso_id_seq"'::regclass);


--
-- Name: TipoPerdida id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoPerdida" ALTER COLUMN id SET DEFAULT nextval('dbo."TipoPerdida_id_seq"'::regclass);


--
-- Name: TipoTransporte id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoTransporte" ALTER COLUMN id SET DEFAULT nextval('dbo."TipoTransporte_id_seq"'::regclass);


--
-- Name: TipoUsoProceso id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoUsoProceso" ALTER COLUMN id SET DEFAULT nextval('dbo."TipoUsoProceso_id_seq"'::regclass);


--
-- Name: Transaccion id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion" ALTER COLUMN id SET DEFAULT nextval('dbo."Transaccion_id_seq"'::regclass);


--
-- Name: TransaccionIntensidadEnergia id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TransaccionIntensidadEnergia" ALTER COLUMN id SET DEFAULT nextval('dbo."TransaccionIntensidadEnergia_id_seq"'::regclass);


--
-- Name: UnidadMedida id; Type: DEFAULT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UnidadMedida" ALTER COLUMN id SET DEFAULT nextval('dbo."UnidadMedida_id_seq"'::regclass);


--
-- Name: ArchivoAdjunto ArchivoAdjunto_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."ArchivoAdjunto"
    ADD CONSTRAINT "ArchivoAdjunto_pkey" PRIMARY KEY (id);


--
-- Name: CargaMasivaArchivo CargaMasivaArchivo_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaArchivo"
    ADD CONSTRAINT "CargaMasivaArchivo_pkey" PRIMARY KEY (id);


--
-- Name: CargaMasivaDetalle CargaMasivaDetalle_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaDetalle"
    ADD CONSTRAINT "CargaMasivaDetalle_pkey" PRIMARY KEY (id);


--
-- Name: CargaMasivaError CargaMasivaError_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaError"
    ADD CONSTRAINT "CargaMasivaError_pkey" PRIMARY KEY (id);


--
-- Name: CategoriaTransaccion CategoriaTransaccion_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CategoriaTransaccion"
    ADD CONSTRAINT "CategoriaTransaccion_pkey" PRIMARY KEY (id);


--
-- Name: Comuna Comuna_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Comuna"
    ADD CONSTRAINT "Comuna_pkey" PRIMARY KEY (id);


--
-- Name: Contacto Contacto_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Contacto"
    ADD CONSTRAINT "Contacto_pkey" PRIMARY KEY (id);


--
-- Name: EmailConfig EmailConfig_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailConfig"
    ADD CONSTRAINT "EmailConfig_pkey" PRIMARY KEY (id);


--
-- Name: EmailLogs EmailLogs_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailLogs"
    ADD CONSTRAINT "EmailLogs_pkey" PRIMARY KEY (id);


--
-- Name: Empresa Empresa_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Empresa"
    ADD CONSTRAINT "Empresa_pkey" PRIMARY KEY (id);


--
-- Name: EncuestaEmpresa EncuestaEmpresa_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaEmpresa"
    ADD CONSTRAINT "EncuestaEmpresa_pkey" PRIMARY KEY ("empresaId", "encuestaId");


--
-- Name: EncuestaPlanta EncuestaPlanta_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaPlanta"
    ADD CONSTRAINT "EncuestaPlanta_pkey" PRIMARY KEY ("encuestaId", "plantaId");


--
-- Name: Encuesta Encuesta_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Encuesta"
    ADD CONSTRAINT "Encuesta_pkey" PRIMARY KEY (id);


--
-- Name: EnergeticoGrupos EnergeticoGrupos_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EnergeticoGrupos"
    ADD CONSTRAINT "EnergeticoGrupos_pkey" PRIMARY KEY (id);


--
-- Name: EnergeticoUnidadMedida EnergeticoUnidadMedida_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EnergeticoUnidadMedida"
    ADD CONSTRAINT "EnergeticoUnidadMedida_pkey" PRIMARY KEY ("energeticoId", "unidadMedidaId");


--
-- Name: Energetico Energetico_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Energetico"
    ADD CONSTRAINT "Energetico_pkey" PRIMARY KEY (id);


--
-- Name: EstadoEmail EstadoEmail_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoEmail"
    ADD CONSTRAINT "EstadoEmail_pkey" PRIMARY KEY (id);


--
-- Name: EstadoEmpresa EstadoEmpresa_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoEmpresa"
    ADD CONSTRAINT "EstadoEmpresa_pkey" PRIMARY KEY (id);


--
-- Name: EstadoProceso EstadoProceso_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoProceso"
    ADD CONSTRAINT "EstadoProceso_pkey" PRIMARY KEY (id);


--
-- Name: EstadoReporte EstadoReporte_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EstadoReporte"
    ADD CONSTRAINT "EstadoReporte_pkey" PRIMARY KEY (id);


--
-- Name: FactorConversion FactorConversion_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."FactorConversion"
    ADD CONSTRAINT "FactorConversion_pkey" PRIMARY KEY (id);


--
-- Name: Formulario Formulario_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Formulario"
    ADD CONSTRAINT "Formulario_pkey" PRIMARY KEY (id);


--
-- Name: IntensidadEnergEncuestaEmpresa IntensidadEnergEncuestaEmpresa_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."IntensidadEnergEncuestaEmpresa"
    ADD CONSTRAINT "IntensidadEnergEncuestaEmpresa_pkey" PRIMARY KEY (id);


--
-- Name: Pais Pais_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Pais"
    ADD CONSTRAINT "Pais_pkey" PRIMARY KEY (id);


--
-- Name: Planta Planta_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Planta"
    ADD CONSTRAINT "Planta_pkey" PRIMARY KEY (id);


--
-- Name: Provincia Provincia_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Provincia"
    ADD CONSTRAINT "Provincia_pkey" PRIMARY KEY (id);


--
-- Name: Region Region_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Region"
    ADD CONSTRAINT "Region_pkey" PRIMARY KEY (id);


--
-- Name: Reporte Reporte_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Reporte"
    ADD CONSTRAINT "Reporte_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SectorEconomicoSii SectorEconomicoSii_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEconomicoSii"
    ADD CONSTRAINT "SectorEconomicoSii_pkey" PRIMARY KEY (id);


--
-- Name: SectorEconomico SectorEconomico_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEconomico"
    ADD CONSTRAINT "SectorEconomico_pkey" PRIMARY KEY (id);


--
-- Name: SectorEnergetico SectorEnergetico_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SectorEnergetico"
    ADD CONSTRAINT "SectorEnergetico_pkey" PRIMARY KEY (id);


--
-- Name: SubSectorEconomico SubSectorEconomico_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SubSectorEconomico"
    ADD CONSTRAINT "SubSectorEconomico_pkey" PRIMARY KEY (id);


--
-- Name: Tecnologia Tecnologia_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Tecnologia"
    ADD CONSTRAINT "Tecnologia_pkey" PRIMARY KEY (id);


--
-- Name: TipoContacto TipoContacto_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoContacto"
    ADD CONSTRAINT "TipoContacto_pkey" PRIMARY KEY (id);


--
-- Name: TipoOtroUso TipoOtroUso_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoOtroUso"
    ADD CONSTRAINT "TipoOtroUso_pkey" PRIMARY KEY (id);


--
-- Name: TipoPerdida TipoPerdida_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoPerdida"
    ADD CONSTRAINT "TipoPerdida_pkey" PRIMARY KEY (id);


--
-- Name: TipoTransporte TipoTransporte_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoTransporte"
    ADD CONSTRAINT "TipoTransporte_pkey" PRIMARY KEY (id);


--
-- Name: TipoUsoProceso TipoUsoProceso_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TipoUsoProceso"
    ADD CONSTRAINT "TipoUsoProceso_pkey" PRIMARY KEY (id);


--
-- Name: TransaccionIntensidadEnergia TransaccionIntensidadEnergia_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TransaccionIntensidadEnergia"
    ADD CONSTRAINT "TransaccionIntensidadEnergia_pkey" PRIMARY KEY (id);


--
-- Name: Transaccion Transaccion_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_pkey" PRIMARY KEY (id);


--
-- Name: UnidadMedida UnidadMedida_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UnidadMedida"
    ADD CONSTRAINT "UnidadMedida_pkey" PRIMARY KEY (id);


--
-- Name: UsuarioLogin UsuarioLogin_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioLogin"
    ADD CONSTRAINT "UsuarioLogin_pkey" PRIMARY KEY ("loginProvider", "providerKey");


--
-- Name: UsuarioRole UsuarioRole_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioRole"
    ADD CONSTRAINT "UsuarioRole_pkey" PRIMARY KEY ("UserId", "RoleId");


--
-- Name: UsuarioToken UsuarioToken_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioToken"
    ADD CONSTRAINT "UsuarioToken_pkey" PRIMARY KEY ("userId", "loginProvider", name);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: CargaMasivaDetalle CargaMasivaDetalle_cargaMasivaArchivoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaDetalle"
    ADD CONSTRAINT "CargaMasivaDetalle_cargaMasivaArchivoId_fkey" FOREIGN KEY ("cargaMasivaArchivoId") REFERENCES dbo."CargaMasivaArchivo"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CargaMasivaError CargaMasivaError_cargaMasivaDetalleId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CargaMasivaError"
    ADD CONSTRAINT "CargaMasivaError_cargaMasivaDetalleId_fkey" FOREIGN KEY ("cargaMasivaDetalleId") REFERENCES dbo."CargaMasivaDetalle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CategoriaTransaccion CategoriaTransaccion_formularioId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."CategoriaTransaccion"
    ADD CONSTRAINT "CategoriaTransaccion_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES dbo."Formulario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Comuna Comuna_regionId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Comuna"
    ADD CONSTRAINT "Comuna_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES dbo."Region"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Contacto Contacto_empresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Contacto"
    ADD CONSTRAINT "Contacto_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES dbo."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Contacto Contacto_tipoContactoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Contacto"
    ADD CONSTRAINT "Contacto_tipoContactoId_fkey" FOREIGN KEY ("tipoContactoId") REFERENCES dbo."TipoContacto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailConfig EmailConfig_estadoEmailId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailConfig"
    ADD CONSTRAINT "EmailConfig_estadoEmailId_fkey" FOREIGN KEY ("estadoEmailId") REFERENCES dbo."EstadoEmail"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EmailLogs EmailLogs_emailConfigId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailLogs"
    ADD CONSTRAINT "EmailLogs_emailConfigId_fkey" FOREIGN KEY ("emailConfigId") REFERENCES dbo."EmailConfig"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EmailLogs EmailLogs_empresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EmailLogs"
    ADD CONSTRAINT "EmailLogs_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES dbo."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Empresa Empresa_sectorEconomicoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Empresa"
    ADD CONSTRAINT "Empresa_sectorEconomicoId_fkey" FOREIGN KEY ("sectorEconomicoId") REFERENCES dbo."SectorEconomico"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Empresa Empresa_sectorEconomicoSiiId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Empresa"
    ADD CONSTRAINT "Empresa_sectorEconomicoSiiId_fkey" FOREIGN KEY ("sectorEconomicoSiiId") REFERENCES dbo."SectorEconomicoSii"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Empresa Empresa_sectorEnergeticoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Empresa"
    ADD CONSTRAINT "Empresa_sectorEnergeticoId_fkey" FOREIGN KEY ("sectorEnergeticoId") REFERENCES dbo."SectorEnergetico"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Empresa Empresa_subSectorEconomicoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Empresa"
    ADD CONSTRAINT "Empresa_subSectorEconomicoId_fkey" FOREIGN KEY ("subSectorEconomicoId") REFERENCES dbo."SubSectorEconomico"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaEmpresa EncuestaEmpresa_empresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaEmpresa"
    ADD CONSTRAINT "EncuestaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES dbo."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaEmpresa EncuestaEmpresa_encuestaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaEmpresa"
    ADD CONSTRAINT "EncuestaEmpresa_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES dbo."Encuesta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaEmpresa EncuestaEmpresa_estadoEmpresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaEmpresa"
    ADD CONSTRAINT "EncuestaEmpresa_estadoEmpresaId_fkey" FOREIGN KEY ("estadoEmpresaId") REFERENCES dbo."EstadoEmpresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaPlanta EncuestaPlanta_encuestaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaPlanta"
    ADD CONSTRAINT "EncuestaPlanta_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES dbo."Encuesta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaPlanta EncuestaPlanta_estadoProcesoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaPlanta"
    ADD CONSTRAINT "EncuestaPlanta_estadoProcesoId_fkey" FOREIGN KEY ("estadoProcesoId") REFERENCES dbo."EstadoProceso"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EncuestaPlanta EncuestaPlanta_plantaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EncuestaPlanta"
    ADD CONSTRAINT "EncuestaPlanta_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES dbo."Planta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Encuesta Encuesta_archivoAdjuntoid_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Encuesta"
    ADD CONSTRAINT "Encuesta_archivoAdjuntoid_fkey" FOREIGN KEY ("archivoAdjuntoid") REFERENCES dbo."ArchivoAdjunto"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: EnergeticoUnidadMedida EnergeticoUnidadMedida_energeticoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EnergeticoUnidadMedida"
    ADD CONSTRAINT "EnergeticoUnidadMedida_energeticoId_fkey" FOREIGN KEY ("energeticoId") REFERENCES dbo."Energetico"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: EnergeticoUnidadMedida EnergeticoUnidadMedida_unidadMedidaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."EnergeticoUnidadMedida"
    ADD CONSTRAINT "EnergeticoUnidadMedida_unidadMedidaId_fkey" FOREIGN KEY ("unidadMedidaId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Energetico Energetico_densidadUnidadMedidaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Energetico"
    ADD CONSTRAINT "Energetico_densidadUnidadMedidaId_fkey" FOREIGN KEY ("densidadUnidadMedidaId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Energetico Energetico_energeticoGrupoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Energetico"
    ADD CONSTRAINT "Energetico_energeticoGrupoId_fkey" FOREIGN KEY ("energeticoGrupoId") REFERENCES dbo."EnergeticoGrupos"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Energetico Energetico_poderCalorificoUMedidaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Energetico"
    ADD CONSTRAINT "Energetico_poderCalorificoUMedidaId_fkey" FOREIGN KEY ("poderCalorificoUMedidaId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: FactorConversion FactorConversion_uDestinoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."FactorConversion"
    ADD CONSTRAINT "FactorConversion_uDestinoId_fkey" FOREIGN KEY ("uDestinoId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FactorConversion FactorConversion_uOrigenId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."FactorConversion"
    ADD CONSTRAINT "FactorConversion_uOrigenId_fkey" FOREIGN KEY ("uOrigenId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IntensidadEnergEncuestaEmpresa IntensidadEnergEncuestaEmpresa_empresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."IntensidadEnergEncuestaEmpresa"
    ADD CONSTRAINT "IntensidadEnergEncuestaEmpresa_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES dbo."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: IntensidadEnergEncuestaEmpresa IntensidadEnergEncuestaEmpresa_encuestaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."IntensidadEnergEncuestaEmpresa"
    ADD CONSTRAINT "IntensidadEnergEncuestaEmpresa_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES dbo."Encuesta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Planta Planta_comunaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Planta"
    ADD CONSTRAINT "Planta_comunaId_fkey" FOREIGN KEY ("comunaId") REFERENCES dbo."Comuna"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Planta Planta_empresaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Planta"
    ADD CONSTRAINT "Planta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES dbo."Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reporte Reporte_encuestaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Reporte"
    ADD CONSTRAINT "Reporte_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES dbo."Encuesta"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Reporte Reporte_estadoReporteId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Reporte"
    ADD CONSTRAINT "Reporte_estadoReporteId_fkey" FOREIGN KEY ("estadoReporteId") REFERENCES dbo."EstadoReporte"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SubSectorEconomico SubSectorEconomico_sectorEconomicoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."SubSectorEconomico"
    ADD CONSTRAINT "SubSectorEconomico_sectorEconomicoId_fkey" FOREIGN KEY ("sectorEconomicoId") REFERENCES dbo."SectorEconomico"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TransaccionIntensidadEnergia TransaccionIntensidadEnergia_intensidadEnergEncuestaEmpres_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."TransaccionIntensidadEnergia"
    ADD CONSTRAINT "TransaccionIntensidadEnergia_intensidadEnergEncuestaEmpres_fkey" FOREIGN KEY ("intensidadEnergEncuestaEmpresaId") REFERENCES dbo."IntensidadEnergEncuestaEmpresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaccion Transaccion_categoriaTransaccionId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_categoriaTransaccionId_fkey" FOREIGN KEY ("categoriaTransaccionId") REFERENCES dbo."CategoriaTransaccion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaccion Transaccion_encuestaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_encuestaId_fkey" FOREIGN KEY ("encuestaId") REFERENCES dbo."Encuesta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaccion Transaccion_energeticoInId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_energeticoInId_fkey" FOREIGN KEY ("energeticoInId") REFERENCES dbo."Energetico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_energeticoOutId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_energeticoOutId_fkey" FOREIGN KEY ("energeticoOutId") REFERENCES dbo."Energetico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_energeticoRegionDestId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_energeticoRegionDestId_fkey" FOREIGN KEY ("energeticoRegionDestId") REFERENCES dbo."Energetico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_formularioId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_formularioId_fkey" FOREIGN KEY ("formularioId") REFERENCES dbo."Formulario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaccion Transaccion_paisId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_paisId_fkey" FOREIGN KEY ("paisId") REFERENCES dbo."Pais"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_plantaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES dbo."Planta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaccion Transaccion_regionDestId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_regionDestId_fkey" FOREIGN KEY ("regionDestId") REFERENCES dbo."Region"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_sectorEconomicoDestId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_sectorEconomicoDestId_fkey" FOREIGN KEY ("sectorEconomicoDestId") REFERENCES dbo."SectorEconomico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_subSectorEconomicoDestId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_subSectorEconomicoDestId_fkey" FOREIGN KEY ("subSectorEconomicoDestId") REFERENCES dbo."SubSectorEconomico"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_tecnologiaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_tecnologiaId_fkey" FOREIGN KEY ("tecnologiaId") REFERENCES dbo."Tecnologia"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_unidadMedidaCapInstaladaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_unidadMedidaCapInstaladaId_fkey" FOREIGN KEY ("unidadMedidaCapInstaladaId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_unidadMedidaInId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_unidadMedidaInId_fkey" FOREIGN KEY ("unidadMedidaInId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_unidadMedidaNoAprovechadaId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_unidadMedidaNoAprovechadaId_fkey" FOREIGN KEY ("unidadMedidaNoAprovechadaId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Transaccion Transaccion_unidadMedidaOutId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."Transaccion"
    ADD CONSTRAINT "Transaccion_unidadMedidaOutId_fkey" FOREIGN KEY ("unidadMedidaOutId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnidadMedida UnidadMedida_destinoId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UnidadMedida"
    ADD CONSTRAINT "UnidadMedida_destinoId_fkey" FOREIGN KEY ("destinoId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UnidadMedida UnidadMedida_origenId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UnidadMedida"
    ADD CONSTRAINT "UnidadMedida_origenId_fkey" FOREIGN KEY ("origenId") REFERENCES dbo."UnidadMedida"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UsuarioLogin UsuarioLogin_userId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioLogin"
    ADD CONSTRAINT "UsuarioLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES dbo."Usuario"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UsuarioRole UsuarioRole_RoleId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioRole"
    ADD CONSTRAINT "UsuarioRole_RoleId_fkey" FOREIGN KEY ("RoleId") REFERENCES dbo."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UsuarioRole UsuarioRole_UserId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioRole"
    ADD CONSTRAINT "UsuarioRole_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES dbo."Usuario"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UsuarioToken UsuarioToken_userId_fkey; Type: FK CONSTRAINT; Schema: dbo; Owner: -
--

ALTER TABLE ONLY dbo."UsuarioToken"
    ADD CONSTRAINT "UsuarioToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES dbo."Usuario"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hK0PbcFO7djamqenPcSop8JBuATyiCPTZG0gIBaO1KnSBHWVuZ2qzRZ503zu2LK

