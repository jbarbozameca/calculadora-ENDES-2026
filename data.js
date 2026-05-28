/* ============================================================
   data.js  -  Calculadora Histórica ENDES Perú
   Autor: Dr. Joshuan J. Barboza · Universidad Señor de Sipán
          Docente Investigador · RENACYT Distinguido
   ============================================================
   Contiene:
     - OUTCOMES   : 70 outcomes con metadata
     - COVARIATES : 5 confusores estándar y sus niveles
     - YEARS      : 23 años (1996, 2000, 2004-2024)
     - DATA       : valores precomputados o generados procedimentalmente
     - getResult(): API única para obtener cualquier resultado
   ============================================================
   Para reemplazar con datos reales del pipeline R, sustituye el
   objeto DATA por el JSON producido en `calculadora_inputs/`.
   ============================================================ */

const YEARS = [1996, 2000, 2004, 2005, 2006, 2007, 2008, 2009, 2010,
               2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019,
               2020, 2021, 2022, 2023, 2024];

// ============================================================
// CONFUSORES: set fijo de 5 variables usadas SIEMPRE para ajustar
// el multivariado. NO se eligen como exposición principal.
// ============================================================
const COVARIATES = [
  {id:"SEXO_CAT",    etiqueta:"Sexo",
   niveles:["Hombre","Mujer"]},
  {id:"EDAD_CAT",    etiqueta:"Grupo etario",
   niveles:["≤17","18-29","30-44","45-59","60+"]},
  {id:"AREA_CAT",    etiqueta:"Área de residencia",
   niveles:["Urbano","Rural"]},
  {id:"EDUC_CAT",    etiqueta:"Nivel educativo",
   niveles:["Sin educación","Primaria","Secundaria","Superior"]},
  {id:"QUINTIL_CAT", etiqueta:"Quintil de riqueza",
   niveles:["Q1","Q2","Q3","Q4","Q5"]}
];

// ============================================================
// VARIABLES PRINCIPALES DE EXPOSICIÓN
// 70+ variables que el usuario puede elegir como "exposición principal"
// en bivariado y multivariado. Cada una se ajusta por los 5 confusores.
// Agrupadas por dominio para la UI.
// ============================================================
const MAIN_VARS = [
  // === Sociodemográficas ===
  {id:"SEXO_CAT",     dominio:"Sociodemográfico", etiqueta:"Sexo",
   niveles:["Hombre","Mujer"]},
  {id:"EDAD_CAT",     dominio:"Sociodemográfico", etiqueta:"Grupo etario",
   niveles:["≤17","18-29","30-44","45-59","60+"]},
  {id:"AREA_CAT",     dominio:"Sociodemográfico", etiqueta:"Área de residencia",
   niveles:["Urbano","Rural"]},
  {id:"EDUC_CAT",     dominio:"Sociodemográfico", etiqueta:"Nivel educativo",
   niveles:["Sin educación","Primaria","Secundaria","Superior"]},
  {id:"QUINTIL_CAT",  dominio:"Sociodemográfico", etiqueta:"Quintil de riqueza",
   niveles:["Q1","Q2","Q3","Q4","Q5"]},
  {id:"DOMINIO_CAT",  dominio:"Sociodemográfico", etiqueta:"Dominio geográfico (8)",
   niveles:["Costa Norte","Costa Centro","Costa Sur","Sierra Norte",
            "Sierra Centro","Sierra Sur","Selva","Lima Metropolitana"]},
  {id:"REGION_CAT",   dominio:"Sociodemográfico", etiqueta:"Departamento (25)",
   niveles:["Amazonas","Áncash","Apurímac","Arequipa","Ayacucho","Cajamarca",
            "Callao","Cusco","Huancavelica","Huánuco","Ica","Junín",
            "La Libertad","Lambayeque","Lima","Loreto","Madre de Dios",
            "Moquegua","Pasco","Piura","Puno","San Martín","Tacna","Tumbes","Ucayali"]},
  {id:"LENGUA_MATERNA", dominio:"Sociodemográfico", etiqueta:"Lengua materna",
   niveles:["Castellano","Quechua","Aymara","Otra nativa","Lengua extranjera"]},
  {id:"RELIGION_CAT", dominio:"Sociodemográfico", etiqueta:"Religión",
   niveles:["Católica","Evangélica","Otra","Ninguna"]},
  {id:"ETNIA_AUTOID", dominio:"Sociodemográfico", etiqueta:"Auto-identificación étnica",
   niveles:["Quechua","Aymara","Nativo amazónico","Afroperuano","Mestizo","Blanco","Otro"]},
  {id:"ESTADO_CIVIL", dominio:"Sociodemográfico", etiqueta:"Estado civil",
   niveles:["Soltero/a","Casado/a","Conviviente","Separado/a","Viudo/a","Divorciado/a"]},
  {id:"TRABAJO_ACTUAL", dominio:"Sociodemográfico", etiqueta:"Trabajo actual",
   niveles:["No trabaja","Trabajo formal","Trabajo informal","Independiente","Familiar no remunerado"]},
  {id:"JEFE_HOGAR_MUJER", dominio:"Sociodemográfico", etiqueta:"Jefatura femenina del hogar",
   niveles:["Hombre jefe","Mujer jefe"]},
  {id:"EDAD_JEFE_CAT", dominio:"Sociodemográfico", etiqueta:"Edad del jefe del hogar",
   niveles:["<30","30-44","45-59","60+"]},
  {id:"N_MIEMBROS_CAT", dominio:"Sociodemográfico", etiqueta:"N° miembros del hogar",
   niveles:["1-3","4-5","6-7","8+"]},

  // === Reproductivas / Mujer ===
  {id:"PARIDAD_CAT", dominio:"Reproductivo", etiqueta:"Paridad (hijos nacidos vivos)",
   niveles:["0","1-2","3-4","5+"]},
  {id:"EDAD_PRIMER_PARTO_CAT", dominio:"Reproductivo", etiqueta:"Edad al primer parto",
   niveles:["<18","18-19","20-24","25-29","30+"]},
  {id:"EDAD_PRIMERA_RS_CAT", dominio:"Reproductivo", etiqueta:"Edad a primera relación sexual",
   niveles:["<15","15-17","18-19","20+"]},
  {id:"INTERVALO_INTERGENESICO", dominio:"Reproductivo", etiqueta:"Intervalo intergenésico",
   niveles:["<24m","24-35m","36-59m","60+m"]},
  {id:"DESEO_HIJOS", dominio:"Reproductivo", etiqueta:"Deseo de más hijos",
   niveles:["Quiere otro pronto","Quiere otro después","No quiere más","Esterilizada","No puede tener"]},
  {id:"EMBARAZO_ACTUAL", dominio:"Reproductivo", etiqueta:"Embarazo actual",
   niveles:["No embarazada","Embarazada","No segura"]},
  {id:"USO_ANTICONCEPTIVO_CAT", dominio:"Reproductivo", etiqueta:"Uso de anticonceptivo",
   niveles:["No usa","Método moderno","Método tradicional","Esterilizada"]},
  {id:"TIPO_METODO_ANTI", dominio:"Reproductivo", etiqueta:"Tipo de método anticonceptivo",
   niveles:["Píldora","Inyección","Implante","DIU","Preservativo","MELA","Ritmo","Esterilización femenina","Otro"]},
  {id:"ANTECEDENTE_CESAREA", dominio:"Reproductivo", etiqueta:"Antecedente de cesárea",
   niveles:["Sin cesárea previa","Una cesárea","≥2 cesáreas"]},
  {id:"TIEMPO_ULTIMO_PARTO", dominio:"Reproductivo", etiqueta:"Tiempo desde último parto",
   niveles:["<12m","12-23m","24-59m","≥60m","Sin partos"]},
  {id:"VIOLENCIA_HISTORIA", dominio:"Reproductivo", etiqueta:"Historia de violencia por pareja",
   niveles:["Nunca","Solo psicológica","Física","Sexual","Múltiple"]},

  // === Acceso a servicios de salud ===
  {id:"AFILIACION_SEGURO", dominio:"Acceso a salud", etiqueta:"Afiliación a seguro de salud",
   niveles:["Sin seguro","SIS","EsSalud","FF.AA./PNP","Privado","Otro"]},
  {id:"TIPO_ESTABLECIMIENTO", dominio:"Acceso a salud", etiqueta:"Tipo de establecimiento (último uso)",
   niveles:["Puesto/CS MINSA","Hospital MINSA","EsSalud","Privado","FF.AA./PNP","Otro"]},
  {id:"DISTANCIA_EESS", dominio:"Acceso a salud", etiqueta:"Distancia al EESS",
   niveles:["<30 min","30-60 min","1-2 h","≥2 h"]},
  {id:"BARRERA_ACCESO", dominio:"Acceso a salud", etiqueta:"Barreras de acceso reportadas",
   niveles:["Ninguna","Dinero","Distancia","Permiso","Cultural/idioma","Múltiples"]},
  {id:"CONSULTA_12M", dominio:"Acceso a salud", etiqueta:"Consulta en últimos 12 meses",
   niveles:["No","1-2 veces","3-5 veces","≥6 veces"]},

  // === Vivienda y hogar ===
  {id:"FUENTE_AGUA", dominio:"Hogar", etiqueta:"Fuente principal de agua",
   niveles:["Red intradomiciliaria","Red fuera vivienda","Pozo","Río/manantial","Camión cisterna","Otro"]},
  {id:"SANEAMIENTO", dominio:"Hogar", etiqueta:"Tipo de saneamiento",
   niveles:["Inodoro red","Letrina mejorada","Letrina simple","Campo abierto","Otro"]},
  {id:"COMBUSTIBLE", dominio:"Hogar", etiqueta:"Combustible para cocinar",
   niveles:["Gas/electricidad","Kerosene","Carbón/leña","Bosta/desechos","Otro"]},
  {id:"MATERIAL_PISO", dominio:"Hogar", etiqueta:"Material predominante del piso",
   niveles:["Parquet/madera","Cemento","Tierra","Otro"]},
  {id:"MATERIAL_PARED", dominio:"Hogar", etiqueta:"Material predominante de paredes",
   niveles:["Ladrillo","Adobe","Madera","Quincha","Estera","Otro"]},
  {id:"HACINAMIENTO_CAT", dominio:"Hogar", etiqueta:"Nivel de hacinamiento",
   niveles:["Sin hacinamiento","Leve (2-2.9 p/c)","Moderado (3-3.9)","Severo (≥4)"]},
  {id:"TIENE_INTERNET", dominio:"Hogar", etiqueta:"Hogar con internet",
   niveles:["Sin internet","Con internet"]},
  {id:"TIENE_CELULAR", dominio:"Hogar", etiqueta:"Hogar con celular",
   niveles:["Sin celular","Con celular"]},
  {id:"REGISTRO_NACIMIENTO", dominio:"Hogar", etiqueta:"Registro de nacimiento (niños)",
   niveles:["Sin registro","Con partida","Con DNI"]},

  // === Comportamentales (adultos salud) ===
  {id:"FUMA_ESTATUS", dominio:"Comportamental", etiqueta:"Estatus de tabaquismo",
   niveles:["Nunca fumó","Ex-fumador","Fumador ocasional","Fumador diario"]},
  {id:"ALCOHOL_FRECUENCIA", dominio:"Comportamental", etiqueta:"Frecuencia consumo de alcohol",
   niveles:["Nunca","Ocasional","Mensual","Semanal","Diario"]},
  {id:"AUDIT_CATEGORIA", dominio:"Comportamental", etiqueta:"AUDIT-C categoría de riesgo",
   niveles:["Bajo riesgo","Riesgo","Consumo perjudicial","Dependencia"]},
  {id:"ACTIVIDAD_FISICA", dominio:"Comportamental", etiqueta:"Nivel de actividad física",
   niveles:["Inactivo","Insuficiente","Suficiente","Alto"]},
  {id:"CONSUMO_FRUTAS", dominio:"Comportamental", etiqueta:"Consumo de frutas/día",
   niveles:["0","1-2","3-4","5+"]},
  {id:"CONSUMO_SAL", dominio:"Comportamental", etiqueta:"Consumo de sal alto",
   niveles:["Bajo","Moderado","Alto"]},
  {id:"IMC_CAT", dominio:"Comportamental", etiqueta:"Categoría de IMC",
   niveles:["Bajo peso","Normal","Sobrepeso","Obesidad I","Obesidad II+"]},

  // === Conocimientos / Actitudes ===
  {id:"CONOC_VIH", dominio:"Conocimientos", etiqueta:"Conocimiento de VIH/SIDA",
   niveles:["Nulo","Básico","Adecuado","Comprehensivo"]},
  {id:"CONOC_CACU", dominio:"Conocimientos", etiqueta:"Conocimiento de cáncer cervicouterino",
   niveles:["Nulo","Básico","Adecuado"]},
  {id:"CONOC_VPH", dominio:"Conocimientos", etiqueta:"Conocimiento sobre VPH",
   niveles:["No conoce","Oyó hablar","Conoce función causal"]},
  {id:"CONOC_METODOS_PF", dominio:"Conocimientos", etiqueta:"Conocimiento de métodos anticonceptivos",
   niveles:["≤2 métodos","3-5 métodos","6-8 métodos","≥9 métodos"]},
  {id:"DECISION_SALUD", dominio:"Conocimientos", etiqueta:"Decisión propia sobre salud",
   niveles:["Solo pareja","Conjunta","Solo ella","Otro"]},
  {id:"ACEPTA_VIOLENCIA", dominio:"Conocimientos", etiqueta:"Acepta justificación de violencia",
   niveles:["No","En 1 razón","En 2+ razones"]},

  // === Antropometría / Clínicas ===
  {id:"ANEMIA_NINOS_CAT", dominio:"Clínico", etiqueta:"Severidad anemia infantil",
   niveles:["Sin anemia","Leve","Moderada","Severa"]},
  {id:"DESNUTRICION_NINOS_CAT", dominio:"Clínico", etiqueta:"Estado nutricional T/E niños",
   niveles:["Normal","Talla baja","Talla baja severa"]},
  {id:"PA_CAT", dominio:"Clínico", etiqueta:"Categoría de presión arterial",
   niveles:["Óptima","Normal","Normal-alta","HTA grado 1","HTA grado 2+"]},
  {id:"HB_GESTANTE_CAT", dominio:"Clínico", etiqueta:"Anemia en gestantes",
   niveles:["Sin anemia","Leve","Moderada","Severa"]},
  {id:"DM_CONOCIDA", dominio:"Clínico", etiqueta:"Estatus de diabetes",
   niveles:["Sin DM","DM auto-reporte","DM auto-reporte + tx"]},

  // === Programas sociales / Política ===
  {id:"BENEF_JUNTOS", dominio:"Programas sociales", etiqueta:"Beneficiario de Juntos",
   niveles:["No","Sí"]},
  {id:"BENEF_QALI_WARMA", dominio:"Programas sociales", etiqueta:"Niño en Qali Warma",
   niveles:["No","Sí"]},
  {id:"BENEF_CUNA_MAS", dominio:"Programas sociales", etiqueta:"Niño en Cuna Más",
   niveles:["No","Sí"]},
  {id:"BENEF_PENSION_65", dominio:"Programas sociales", etiqueta:"Adulto mayor en Pensión 65",
   niveles:["No","Sí"]},
  {id:"CONTROL_CRED_NINO", dominio:"Programas sociales", etiqueta:"CRED en niño <3 años",
   niveles:["Incompleto","Completo para edad"]},

  // === APN / Atención obstétrica ===
  {id:"APN_NUMERO_VISITAS", dominio:"Atención obstétrica", etiqueta:"N° visitas prenatales",
   niveles:["0","1-3","4-5","6-7","≥8"]},
  {id:"APN_CAPTACION", dominio:"Atención obstétrica", etiqueta:"Captación prenatal",
   niveles:["Sin APN","2do-3er trim","1er trim"]},
  {id:"LUGAR_PARTO", dominio:"Atención obstétrica", etiqueta:"Lugar del parto",
   niveles:["Domicilio","Centro de salud","Hospital MINSA","EsSalud","Privado","Otro"]},
  {id:"PROFESIONAL_PARTO", dominio:"Atención obstétrica", etiqueta:"Quien atendió el parto",
   niveles:["Nadie/familiar","Partera tradicional","Enfermera","Obstetra","Médico"]}
];

// Para retrocompatibilidad
const REGION_LEGACY = MAIN_VARS.find(v => v.id === "REGION_CAT");

const OUTCOMES = [
  // === A. NIÑOS < 5 AÑOS (22 outcomes) ===
  {id:"anemia_ninos_total", tipo:"binario", nivel:"nino",
   etiqueta:"Anemia infantil 6-59m (cualquier severidad, Hb<11)",
   denominador:"Niños 6-59m con Hb medida",
   numerador:"Hb ajustada por altitud <11 g/dL",
   anio_min:2000, anio_max:2024, base_prev:0.42},
  {id:"anemia_ninos_leve", tipo:"binario", nivel:"nino",
   etiqueta:"Anemia infantil leve (Hb 10.0-10.9)",
   denominador:"Niños 6-59m con Hb medida",
   numerador:"Hb ajustada 10-10.9 g/dL",
   anio_min:2000, anio_max:2024, base_prev:0.26},
  {id:"anemia_ninos_moderada", tipo:"binario", nivel:"nino",
   etiqueta:"Anemia infantil moderada (Hb 7.0-9.9)",
   denominador:"Niños 6-59m con Hb medida",
   numerador:"Hb ajustada 7-9.9 g/dL",
   anio_min:2000, anio_max:2024, base_prev:0.15},
  {id:"anemia_ninos_severa", tipo:"binario", nivel:"nino",
   etiqueta:"Anemia infantil severa (Hb<7)",
   denominador:"Niños 6-59m con Hb medida",
   numerador:"Hb ajustada <7 g/dL",
   anio_min:2000, anio_max:2024, base_prev:0.01},
  {id:"desnutricion_cronica", tipo:"binario", nivel:"nino",
   etiqueta:"Desnutrición crónica (T/E z<-2 SD)",
   denominador:"Niños <5 años con talla medida",
   numerador:"HAZ <-2 SD",
   anio_min:2000, anio_max:2024, base_prev:0.13},
  {id:"desnutricion_cronica_severa", tipo:"binario", nivel:"nino",
   etiqueta:"Desnutrición crónica severa (T/E z<-3 SD)",
   denominador:"Niños <5 años con talla medida", numerador:"HAZ <-3 SD",
   anio_min:2000, anio_max:2024, base_prev:0.025},
  {id:"desnutricion_aguda", tipo:"binario", nivel:"nino",
   etiqueta:"Desnutrición aguda (P/T z<-2 SD)",
   denominador:"Niños <5 años con peso y talla", numerador:"WHZ <-2 SD",
   anio_min:2000, anio_max:2024, base_prev:0.012},
  {id:"desnutricion_global", tipo:"binario", nivel:"nino",
   etiqueta:"Desnutrición global (P/E z<-2 SD)",
   denominador:"Niños <5 años con peso medido", numerador:"WAZ <-2 SD",
   anio_min:2000, anio_max:2024, base_prev:0.035},
  {id:"sobrepeso_nino", tipo:"binario", nivel:"nino",
   etiqueta:"Sobrepeso infantil (P/T z>+2 SD)",
   denominador:"Niños <5 años con peso y talla", numerador:"WHZ >+2 SD",
   anio_min:2000, anio_max:2024, base_prev:0.075},
  {id:"bajo_peso_nacer", tipo:"binario", nivel:"nino",
   etiqueta:"Bajo peso al nacer (<2500g)",
   denominador:"Nacimientos últimos 5 años con peso reportado",
   numerador:"Peso al nacer <2500g",
   anio_min:2000, anio_max:2024, base_prev:0.075},
  {id:"lactancia_excl_6m", tipo:"binario", nivel:"nino",
   etiqueta:"Lactancia materna exclusiva en <6 meses",
   denominador:"Niños <6 meses vivos",
   numerador:"Solo leche materna últimas 24h",
   anio_min:2000, anio_max:2024, base_prev:0.65},
  {id:"lactancia_continuada_12m", tipo:"binario", nivel:"nino",
   etiqueta:"Lactancia continuada al año (12-15 meses)",
   denominador:"Niños 12-15 meses", numerador:"Recibe leche materna",
   anio_min:2000, anio_max:2024, base_prev:0.85},
  {id:"alimentacion_complementaria_oportuna", tipo:"binario", nivel:"nino",
   etiqueta:"Alimentación complementaria oportuna (6-8m)",
   denominador:"Niños 6-8 meses",
   numerador:"Recibe alimentos sólidos/semisólidos",
   anio_min:2000, anio_max:2024, base_prev:0.78},
  {id:"vacuna_bcg", tipo:"binario", nivel:"nino",
   etiqueta:"Vacunación BCG (12-23m)",
   denominador:"Niños 12-23 meses", numerador:"Recibió BCG",
   anio_min:2000, anio_max:2024, base_prev:0.93},
  {id:"vacuna_dpt3", tipo:"binario", nivel:"nino",
   etiqueta:"Vacunación DPT/Pentavalente 3ª dosis",
   denominador:"Niños 12-23 meses", numerador:"3 dosis DPT/pentavalente",
   anio_min:2000, anio_max:2024, base_prev:0.78},
  {id:"vacuna_polio3", tipo:"binario", nivel:"nino",
   etiqueta:"Vacunación Polio 3ª dosis",
   denominador:"Niños 12-23 meses", numerador:"3 dosis polio",
   anio_min:2000, anio_max:2024, base_prev:0.79},
  {id:"vacuna_sarampion", tipo:"binario", nivel:"nino",
   etiqueta:"Vacunación contra sarampión/SRP",
   denominador:"Niños 12-23 meses", numerador:"Recibió SRP",
   anio_min:2000, anio_max:2024, base_prev:0.82},
  {id:"vacuna_completa", tipo:"binario", nivel:"nino",
   etiqueta:"Esquema vacunación completa (12-23m)",
   denominador:"Niños 12-23 meses", numerador:"Todas las vacunas básicas",
   anio_min:2000, anio_max:2024, base_prev:0.72},
  {id:"ira_2sem", tipo:"binario", nivel:"nino",
   etiqueta:"IRA en últimas 2 semanas",
   denominador:"Niños <5 años", numerador:"Tos+respiración rápida",
   anio_min:2000, anio_max:2024, base_prev:0.16},
  {id:"ira_atencion", tipo:"binario", nivel:"nino",
   etiqueta:"Atención por IRA (últimas 2 sem)",
   denominador:"Niños con IRA últimas 2 sem", numerador:"Llevado a EESS",
   anio_min:2000, anio_max:2024, base_prev:0.63},
  {id:"eda_2sem", tipo:"binario", nivel:"nino",
   etiqueta:"EDA en últimas 2 semanas",
   denominador:"Niños <5 años", numerador:"Diarrea últimas 2 sem",
   anio_min:2000, anio_max:2024, base_prev:0.13},
  {id:"sro_en_eda", tipo:"binario", nivel:"nino",
   etiqueta:"Uso de SRO en niños con EDA",
   denominador:"Niños con EDA últimas 2 sem", numerador:"Recibió SRO",
   anio_min:2000, anio_max:2024, base_prev:0.58},

  // === B. MUJERES EN EDAD FÉRTIL (18 outcomes) ===
  {id:"embarazo_adolescente_15_19", tipo:"binario", nivel:"mujer",
   etiqueta:"Embarazo adolescente (15-19 años)",
   denominador:"Mujeres 15-19 años",
   numerador:"Alguna vez gestante o con hijos",
   anio_min:1996, anio_max:2024, base_prev:0.13},
  {id:"uso_anticonceptivo_moderno", tipo:"binario", nivel:"mujer",
   etiqueta:"Uso actual de método anticonceptivo MODERNO",
   denominador:"Mujeres unidas 15-49 años",
   numerador:"Método moderno actual (V313=3)",
   anio_min:1996, anio_max:2024, base_prev:0.55},
  {id:"uso_anticonceptivo_tradicional", tipo:"binario", nivel:"mujer",
   etiqueta:"Uso actual de método anticonceptivo TRADICIONAL",
   denominador:"Mujeres unidas 15-49 años",
   numerador:"Método tradicional (V313=2)",
   anio_min:1996, anio_max:2024, base_prev:0.18},
  {id:"no_uso_anticonceptivo", tipo:"binario", nivel:"mujer",
   etiqueta:"No uso actual de método anticonceptivo",
   denominador:"Mujeres unidas 15-49 años", numerador:"V313=0",
   anio_min:1996, anio_max:2024, base_prev:0.27},
  {id:"necesidad_insatisfecha_pf", tipo:"binario", nivel:"mujer",
   etiqueta:"Necesidad insatisfecha de PF",
   denominador:"Mujeres unidas en edad fértil",
   numerador:"V626A en categorías de necesidad insatisfecha",
   anio_min:2000, anio_max:2024, base_prev:0.08},
  {id:"apn_6mas", tipo:"binario", nivel:"mujer",
   etiqueta:"Atención prenatal ≥6 visitas",
   denominador:"Mujeres con nacimiento últimos 5 años",
   numerador:"M14 ≥6",
   anio_min:2000, anio_max:2024, base_prev:0.83},
  {id:"apn_4mas", tipo:"binario", nivel:"mujer",
   etiqueta:"Atención prenatal ≥4 visitas",
   denominador:"Mujeres con nacimiento últimos 5 años", numerador:"M14 ≥4",
   anio_min:1996, anio_max:2024, base_prev:0.93},
  {id:"apn_captacion_temprana", tipo:"binario", nivel:"mujer",
   etiqueta:"Captación prenatal en 1er trimestre",
   denominador:"Mujeres con nacimiento últimos 5 años con APN",
   numerador:"Primera APN antes del 4to mes",
   anio_min:2000, anio_max:2024, base_prev:0.79},
  {id:"apn_profesional", tipo:"binario", nivel:"mujer",
   etiqueta:"APN por profesional calificado",
   denominador:"Mujeres con nacimiento últimos 5 años",
   numerador:"APN por médico, obstetra o enfermera",
   anio_min:1996, anio_max:2024, base_prev:0.94},
  {id:"parto_institucional", tipo:"binario", nivel:"mujer",
   etiqueta:"Parto institucional",
   denominador:"Mujeres con nacimiento últimos 5 años",
   numerador:"Parto en EESS",
   anio_min:1996, anio_max:2024, base_prev:0.92},
  {id:"parto_profesional", tipo:"binario", nivel:"mujer",
   etiqueta:"Parto atendido por profesional calificado",
   denominador:"Mujeres con nacimiento últimos 5 años",
   numerador:"M3A=1",
   anio_min:1996, anio_max:2024, base_prev:0.93},
  {id:"cesarea", tipo:"binario", nivel:"mujer",
   etiqueta:"Parto por cesárea (último)",
   denominador:"Mujeres con nacimiento últimos 5 años", numerador:"M17=1",
   anio_min:2000, anio_max:2024, base_prev:0.36},
  {id:"violencia_fisica_pareja", tipo:"binario", nivel:"mujer",
   etiqueta:"Violencia física por pareja (alguna vez)",
   denominador:"Mujeres alguna vez unidas",
   numerador:"Empuje/cachetada/golpe por pareja",
   anio_min:2004, anio_max:2024, base_prev:0.31},
  {id:"violencia_sexual_pareja", tipo:"binario", nivel:"mujer",
   etiqueta:"Violencia sexual por pareja",
   denominador:"Mujeres alguna vez unidas", numerador:"D105H positivo",
   anio_min:2004, anio_max:2024, base_prev:0.075},
  {id:"violencia_psicologica_pareja", tipo:"binario", nivel:"mujer",
   etiqueta:"Violencia psicológica por pareja",
   denominador:"Mujeres alguna vez unidas",
   numerador:"D103A/B/C/D positivos",
   anio_min:2004, anio_max:2024, base_prev:0.55},
  {id:"papanicolaou_2anios", tipo:"binario", nivel:"mujer",
   etiqueta:"Papanicolaou últimos 2 años (≥30 años)",
   denominador:"Mujeres ≥30 años", numerador:"S119=1 y tiempo ≤24m",
   anio_min:2014, anio_max:2024, base_prev:0.52},
  {id:"prueba_vih_alguna_vez", tipo:"binario", nivel:"mujer",
   etiqueta:"Prueba de VIH alguna vez",
   denominador:"Mujeres en edad fértil sexualmente activas",
   numerador:"V781=1",
   anio_min:2000, anio_max:2024, base_prev:0.46},
  {id:"fand", tipo:"binario", nivel:"mujer",
   etiqueta:"Fecundidad adicional no deseada (FAND)",
   denominador:"Mujeres 40-49 años alguna vez unidas",
   numerador:"Paridad > deseada",
   anio_min:2000, anio_max:2024, base_prev:0.72},

  // === C. ADULTOS - SALUD (13 outcomes) ===
  {id:"hta_medida", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"HTA medida (PAS≥140 o PAD≥90)",
   denominador:"Adultos ≥15 con PA medida",
   numerador:"PAS≥140 o PAD≥90",
   anio_min:2014, anio_max:2024, base_prev:0.21},
  {id:"hta_diagnostico", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"HTA diagnosticada previamente",
   denominador:"Adultos ≥15 entrevistados", numerador:"QS23=1",
   anio_min:2014, anio_max:2024, base_prev:0.16},
  {id:"hta_combinada", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"HTA (medida o dx con tratamiento)",
   denominador:"Adultos ≥15",
   numerador:"PAS≥140/PAD≥90 o dx+tx actual",
   anio_min:2014, anio_max:2024, base_prev:0.25},
  {id:"sobrepeso_adultos", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Sobrepeso adultos (IMC 25.0-29.9)",
   denominador:"Adultos ≥18 con peso y talla", numerador:"IMC 25-30",
   anio_min:2014, anio_max:2024, base_prev:0.38},
  {id:"obesidad_adultos", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Obesidad adultos (IMC ≥30)",
   denominador:"Adultos ≥18 con peso y talla", numerador:"IMC ≥30",
   anio_min:2014, anio_max:2024, base_prev:0.235},
  {id:"obesidad_severa", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Obesidad severa (IMC ≥35)",
   denominador:"Adultos ≥18 con peso y talla", numerador:"IMC ≥35",
   anio_min:2014, anio_max:2024, base_prev:0.058},
  {id:"bajo_peso_adulto", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Bajo peso adulto (IMC <18.5)",
   denominador:"Adultos ≥18 con peso y talla", numerador:"IMC <18.5",
   anio_min:2014, anio_max:2024, base_prev:0.011},
  {id:"diabetes_autoreport", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Diabetes auto-reportada",
   denominador:"Adultos ≥15", numerador:"QS26=1",
   anio_min:2014, anio_max:2024, base_prev:0.038},
  {id:"fumador_actual", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Fumador actual (≥15 años)",
   denominador:"Adultos ≥15", numerador:"Fuma diario u ocasional",
   anio_min:2014, anio_max:2024, base_prev:0.082},
  {id:"alcohol_30d", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Consumo de alcohol últimos 30 días",
   denominador:"Adultos ≥15", numerador:"QS208=1",
   anio_min:2014, anio_max:2024, base_prev:0.32},
  {id:"uso_serv_odonto_6m", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Uso servicios odontológicos últimos 6m",
   denominador:"Adultos ≥18", numerador:"Consulta dental últimos 6m",
   anio_min:2014, anio_max:2024, base_prev:0.295},
  {id:"tamizaje_dm", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Tamizaje glucemia/diabetes alguna vez",
   denominador:"Adultos ≥15", numerador:"Se hizo prueba de glucosa",
   anio_min:2014, anio_max:2024, base_prev:0.41},
  {id:"tamizaje_hta", tipo:"binario", nivel:"adulto_salud",
   etiqueta:"Medición de PA en últimos 12 meses",
   denominador:"Adultos ≥15", numerador:"PA medida últimos 12m",
   anio_min:2014, anio_max:2024, base_prev:0.62},

  // === D. HOGAR (8 outcomes) ===
  {id:"agua_potable", tipo:"binario", nivel:"hogar",
   etiqueta:"Acceso a agua potable mejorada (OMS)",
   denominador:"Hogares con respuesta HV201",
   numerador:"Fuente mejorada",
   anio_min:1996, anio_max:2024, base_prev:0.89},
  {id:"agua_red_intradomiciliaria", tipo:"binario", nivel:"hogar",
   etiqueta:"Agua por red pública dentro de la vivienda",
   denominador:"Todos los hogares", numerador:"HV201=11",
   anio_min:2000, anio_max:2024, base_prev:0.76},
  {id:"saneamiento_mejorado", tipo:"binario", nivel:"hogar",
   etiqueta:"Saneamiento mejorado (OMS)",
   denominador:"Hogares con respuesta HV205",
   numerador:"Inodoro con descarga o letrina mejorada",
   anio_min:1996, anio_max:2024, base_prev:0.78},
  {id:"combustible_limpio", tipo:"binario", nivel:"hogar",
   etiqueta:"Combustible limpio para cocinar",
   denominador:"Hogares con respuesta HV226",
   numerador:"Gas, electricidad o biogás",
   anio_min:2000, anio_max:2024, base_prev:0.78},
  {id:"electricidad_hogar", tipo:"binario", nivel:"hogar",
   etiqueta:"Hogar con electricidad",
   denominador:"Todos los hogares", numerador:"HV206=1",
   anio_min:1996, anio_max:2024, base_prev:0.95},
  {id:"internet_hogar", tipo:"binario", nivel:"hogar",
   etiqueta:"Hogar con acceso a internet",
   denominador:"Todos los hogares", numerador:"SH123F=1",
   anio_min:2014, anio_max:2024, base_prev:0.48},
  {id:"hacinamiento", tipo:"binario", nivel:"hogar",
   etiqueta:"Hacinamiento (≥3 personas por cuarto)",
   denominador:"Hogares con HV012 y HV216",
   numerador:"HV012/HV216 ≥3",
   anio_min:1996, anio_max:2024, base_prev:0.105},
  {id:"afiliacion_sis", tipo:"binario", nivel:"hogar",
   etiqueta:"Afiliación a SIS (al menos un miembro)",
   denominador:"Hogares con datos de seguro",
   numerador:"Algún miembro afiliado a SIS",
   anio_min:2008, anio_max:2024, base_prev:0.51},

  // === E. CONTINUOS (9 outcomes) ===
  {id:"hb_ninos_continuo", tipo:"continuo", nivel:"nino",
   etiqueta:"Hemoglobina infantil ajustada (g/dL)",
   denominador:"Niños 6-59m con Hb medida",
   numerador:"Hb ajustada por altitud",
   anio_min:2000, anio_max:2024, base_mean:11.2, base_sd:1.3, unit:"g/dL"},
  {id:"haz_zscore", tipo:"continuo", nivel:"nino",
   etiqueta:"Z-score Talla/Edad (HAZ)",
   denominador:"Niños <5 años con talla", numerador:"HAZ",
   anio_min:2000, anio_max:2024, base_mean:-0.85, base_sd:1.1, unit:"SD"},
  {id:"whz_zscore", tipo:"continuo", nivel:"nino",
   etiqueta:"Z-score Peso/Talla (WHZ)",
   denominador:"Niños <5 años con peso y talla", numerador:"WHZ",
   anio_min:2000, anio_max:2024, base_mean:0.45, base_sd:1.0, unit:"SD"},
  {id:"imc_adulto", tipo:"continuo", nivel:"adulto_salud",
   etiqueta:"IMC adulto (kg/m²)",
   denominador:"Adultos ≥18 con peso y talla", numerador:"IMC",
   anio_min:2014, anio_max:2024, base_mean:26.8, base_sd:4.6, unit:"kg/m²"},
  {id:"pas_continuo", tipo:"continuo", nivel:"adulto_salud",
   etiqueta:"Presión arterial sistólica (mmHg)",
   denominador:"Adultos ≥15 con PA medida", numerador:"PAS",
   anio_min:2014, anio_max:2024, base_mean:121, base_sd:18, unit:"mmHg"},
  {id:"pad_continuo", tipo:"continuo", nivel:"adulto_salud",
   etiqueta:"Presión arterial diastólica (mmHg)",
   denominador:"Adultos ≥15 con PA medida", numerador:"PAD",
   anio_min:2014, anio_max:2024, base_mean:75, base_sd:11, unit:"mmHg"},
  {id:"paridad_continua", tipo:"continuo", nivel:"mujer",
   etiqueta:"Número total de hijos nacidos vivos",
   denominador:"Mujeres en edad fértil", numerador:"V201",
   anio_min:1996, anio_max:2024, base_mean:2.3, base_sd:1.9, unit:"hijos"},
  {id:"edad_primer_parto", tipo:"continuo", nivel:"mujer",
   etiqueta:"Edad al primer parto (años)",
   denominador:"Mujeres alguna vez con hijos", numerador:"V212",
   anio_min:1996, anio_max:2024, base_mean:21.6, base_sd:4.3, unit:"años"},
  {id:"n_visitas_prenatal", tipo:"continuo", nivel:"mujer",
   etiqueta:"Número de visitas prenatales (último embarazo)",
   denominador:"Mujeres con nacimiento últimos 5 años", numerador:"M14",
   anio_min:1996, anio_max:2024, base_mean:7.4, base_sd:3.1, unit:"visitas"}
];

/* ============================================================
   GENERADOR PROCEDURAL DETERMINÍSTICO DE VALORES
   ============================================================
   Para cada (outcome, año, covariable, modelo), produce un valor
   plausible que se mantiene consistente entre cargas de la página.
   Mientras se monta el pipeline R real, esto da a la calculadora
   datos coherentes con la literatura para todos los cruces.

   Cuando se reemplace por datos reales (de calculadora_inputs/
   *.json producidos por el pipeline R), basta sobrescribir las
   funciones univariado/bivariado/multivariado.
   ============================================================ */

// Hash determinístico simple (mulberry32)
function mulberry32(seed) {
  return function() {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFor(key) { return mulberry32(hashStr(key)); }

// Tendencia temporal típica para cada outcome (suave hacia un objetivo)
function trendFactor(outcome, year) {
  // outcomes que mejoran con el tiempo
  const improvers = ["lactancia_excl_6m","vacuna_completa","vacuna_bcg",
    "vacuna_dpt3","vacuna_polio3","vacuna_sarampion","apn_6mas","apn_4mas",
    "apn_profesional","parto_institucional","parto_profesional",
    "agua_potable","saneamiento_mejorado","combustible_limpio",
    "electricidad_hogar","internet_hogar","afiliacion_sis","papanicolaou_2anios",
    "uso_serv_odonto_6m","tamizaje_dm","tamizaje_hta","uso_anticonceptivo_moderno",
    "prueba_vih_alguna_vez"];
  // outcomes que disminuyen con el tiempo
  const decreasers = ["anemia_ninos_total","anemia_ninos_leve","anemia_ninos_moderada",
    "anemia_ninos_severa","desnutricion_cronica","desnutricion_cronica_severa",
    "desnutricion_aguda","desnutricion_global","bajo_peso_nacer",
    "ira_2sem","eda_2sem","embarazo_adolescente_15_19",
    "violencia_fisica_pareja","violencia_sexual_pareja","violencia_psicologica_pareja",
    "necesidad_insatisfecha_pf","fand","no_uso_anticonceptivo","hacinamiento"];
  // outcomes que aumentan (epidemia ECNT)
  const ncd_up = ["hta_medida","hta_diagnostico","hta_combinada",
    "sobrepeso_adultos","obesidad_adultos","obesidad_severa",
    "diabetes_autoreport","cesarea","sobrepeso_nino"];

  const t = (year - 2010) / 14;   // -1 (2000) → +1 (2024)
  if (improvers.includes(outcome))  return 1 + 0.45 * t;
  if (decreasers.includes(outcome)) return 1 - 0.40 * t;
  if (ncd_up.includes(outcome))     return 1 + 0.55 * t;
  return 1;
}

// Gradiente por covariable (Q5 vs Q1, urbano vs rural, etc.)
// Devuelve multiplicador sobre la prevalencia base
const COV_GRADIENT = {
  AREA_CAT: {  // outcomes peores en rural
    "Urbano": 1.0, "Rural": 1.0  // se sobrescribe por outcome
  },
  QUINTIL_CAT: {"Q1":1.0,"Q2":0.85,"Q3":0.70,"Q4":0.55,"Q5":0.40},
  EDUC_CAT: {"Sin educación":1.4,"Primaria":1.15,"Secundaria":0.85,"Superior":0.60},
  SEXO_CAT: {"Hombre":1.0,"Mujer":1.0},
  EDAD_CAT: {"≤17":1.0,"18-29":1.0,"30-44":1.0,"45-59":1.0,"60+":1.0}
};

// Gradientes específicos por outcome (ajustes finos basados en literatura)
function gradientFor(outcome, cov, level) {
  // anemia infantil: rural > urbano, Q1 > Q5
  if (outcome.startsWith("anemia_ninos") || outcome.startsWith("desnutricion")) {
    if (cov === "AREA_CAT") return {"Urbano":0.75,"Rural":1.45}[level] || 1;
    if (cov === "QUINTIL_CAT") return {"Q1":1.5,"Q2":1.2,"Q3":1.0,"Q4":0.75,"Q5":0.45}[level] || 1;
  }
  if (outcome.startsWith("hta") || outcome.startsWith("obesidad") || outcome === "diabetes_autoreport") {
    if (cov === "SEXO_CAT") return {"Hombre":1.0,"Mujer":1.1}[level] || 1;
    if (cov === "EDAD_CAT") return {"≤17":0.05,"18-29":0.25,"30-44":0.7,"45-59":1.3,"60+":2.1}[level] || 1;
    if (cov === "AREA_CAT") return {"Urbano":1.25,"Rural":0.75}[level] || 1;
  }
  if (outcome.startsWith("violencia")) {
    if (cov === "QUINTIL_CAT") return {"Q1":1.25,"Q2":1.15,"Q3":1.05,"Q4":0.85,"Q5":0.70}[level] || 1;
    if (cov === "EDUC_CAT") return {"Sin educación":1.3,"Primaria":1.15,"Secundaria":0.95,"Superior":0.75}[level] || 1;
  }
  if (outcome === "embarazo_adolescente_15_19" || outcome === "fand") {
    if (cov === "AREA_CAT") return {"Urbano":0.65,"Rural":1.55}[level] || 1;
    if (cov === "EDUC_CAT") return {"Sin educación":2.0,"Primaria":1.6,"Secundaria":1.0,"Superior":0.40}[level] || 1;
  }
  if (outcome.startsWith("vacuna") || outcome.startsWith("apn") ||
      outcome === "parto_institucional" || outcome === "parto_profesional") {
    if (cov === "AREA_CAT") return {"Urbano":1.10,"Rural":0.88}[level] || 1;
    if (cov === "QUINTIL_CAT") return {"Q1":0.78,"Q2":0.88,"Q3":0.98,"Q4":1.05,"Q5":1.10}[level] || 1;
  }
  if (outcome === "cesarea") {
    if (cov === "QUINTIL_CAT") return {"Q1":0.30,"Q2":0.55,"Q3":0.95,"Q4":1.35,"Q5":1.85}[level] || 1;
    if (cov === "AREA_CAT") return {"Urbano":1.30,"Rural":0.55}[level] || 1;
  }
  if (outcome.startsWith("agua_") || outcome === "saneamiento_mejorado" ||
      outcome === "electricidad_hogar" || outcome === "internet_hogar") {
    if (cov === "AREA_CAT") return {"Urbano":1.15,"Rural":0.65}[level] || 1;
    if (cov === "QUINTIL_CAT") return {"Q1":0.55,"Q2":0.78,"Q3":0.95,"Q4":1.08,"Q5":1.15}[level] || 1;
  }
  return COV_GRADIENT[cov]?.[level] ?? 1.0;
}

// ============================================================
// API PÚBLICA: getResult({tipo, outcome, anio, covariable, modelo, nivel})
// ============================================================
function _clip(p) { return Math.max(0.001, Math.min(0.999, p)); }

function getUnivariate(outcome, year, stratLevel = null) {
  const od = OUTCOMES.find(o => o.id === outcome);
  if (!od) return null;
  const rng = rngFor(`uni:${outcome}:${year}:${stratLevel ?? ""}`);
  if (od.tipo === "binario") {
    let p = od.base_prev * trendFactor(outcome, year);
    if (stratLevel) {
      // sin gradient específico, multiplier = 1
      p *= 1.0;
    }
    p += (rng() - 0.5) * 0.04;  // ruido ±2%
    p = _clip(p);
    const n = Math.floor(2000 + rng() * 8000);
    const se = Math.sqrt(p * (1 - p) / n);
    return {
      tipo_outcome: "binario",
      n_total: n, n_evento: Math.round(n * p),
      estimador: "proporcion",
      valor: p,
      ic_inf: _clip(p - 1.96 * se),
      ic_sup: _clip(p + 1.96 * se)
    };
  } else {
    let m = od.base_mean;
    // tendencia: si es paridad o hijos, baja con tiempo; si IMC sube, etc.
    if (outcome === "paridad_continua") m -= (year - 2000) * 0.025;
    if (outcome === "imc_adulto")      m += (year - 2014) * 0.10;
    if (outcome === "edad_primer_parto") m += (year - 2000) * 0.05;
    if (outcome === "hb_ninos_continuo") m += (year - 2000) * 0.018;
    m += (rng() - 0.5) * 0.3;
    const n = Math.floor(2000 + rng() * 8000);
    const se = od.base_sd / Math.sqrt(n);
    return {
      tipo_outcome: "continuo",
      n_total: n, estimador: "media",
      valor: m,
      ic_inf: m - 1.96 * se,
      ic_sup: m + 1.96 * se,
      unit: od.unit
    };
  }
}

function _findVar(id) {
  // Busca en MAIN_VARS primero, luego en COVARIATES (compatibilidad)
  return MAIN_VARS.find(v => v.id === id) || COVARIATES.find(c => c.id === id);
}

function getBivariate(outcome, year, cov) {
  const od = OUTCOMES.find(o => o.id === outcome);
  const cd = _findVar(cov);
  if (!od || !cd) return null;
  const rng = rngFor(`bi:${outcome}:${year}:${cov}`);
  const tFactor = trendFactor(outcome, year);
  const rows = cd.niveles.map(lev => {
    if (od.tipo === "binario") {
      const grad = gradientFor(outcome, cov, lev);
      let p = od.base_prev * tFactor * grad;
      p += (rng() - 0.5) * 0.04;
      p = _clip(p);
      const n = Math.floor(800 + rng() * 3500);
      const se = Math.sqrt(p * (1 - p) / n);
      return {nivel: lev, n: n, valor: p,
              ic_inf: _clip(p - 1.96 * se),
              ic_sup: _clip(p + 1.96 * se)};
    } else {
      const grad = gradientFor(outcome, cov, lev);
      let m = od.base_mean * grad;
      if (outcome === "paridad_continua")   m -= (year - 2000) * 0.025;
      if (outcome === "imc_adulto")        m += (year - 2014) * 0.10;
      m += (rng() - 0.5) * 0.4;
      const n = Math.floor(800 + rng() * 3500);
      const se = od.base_sd / Math.sqrt(n);
      return {nivel: lev, n: n, valor: m,
              ic_inf: m - 1.96 * se, ic_sup: m + 1.96 * se};
    }
  });
  // chi-cuadrado p-value (simulado pero coherente con la heterogeneidad)
  const vals = rows.map(r => r.valor);
  const range = Math.max(...vals) - Math.min(...vals);
  const p_val = range > 0.10 ? 0.0001 :
                range > 0.05 ? 0.005 :
                range > 0.02 ? 0.04 : 0.21;
  return {covariable: cov, niveles: rows, chi_p: p_val};
}

// getMultivariate ahora acepta UN ID o un ARRAY de IDs.
// Si recibe array, devuelve {variables: [{var:..., niveles:[...]}, ...], confusores: [...]}
function getMultivariate(outcome, year, mainVar) {
  // Si es un array → modo multi-variable
  if (Array.isArray(mainVar)) {
    return getMultivariateMulti(outcome, year, mainVar);
  }
  const od = OUTCOMES.find(o => o.id === outcome);
  const cd = _findVar(mainVar);
  if (!od || !cd) return null;
  const rng = rngFor(`multi:${outcome}:${year}:${mainVar}`);
  // Tomar la primera categoría como referencia
  const ref = cd.niveles[0];
  const niveles = cd.niveles.map((lev, i) => {
    if (i === 0) {
      return {nivel: lev, ORa: 1.0, ORa_lo: null, ORa_hi: null,
              RPa: 1.0, RPa_lo: null, RPa_hi: null, p: null, ref: true};
    }
    let grad = gradientFor(outcome, mainVar, lev);
    // ajustar el gradiente por confusores estándar (atenuación del 15%)
    grad = 1 + (grad - 1) * 0.85;
    const ORa = grad + (rng() - 0.5) * 0.08;
    const RPa = (od.tipo === "continuo") ? grad : 1 + (grad - 1) * 0.78;  // Poisson atenúa OR
    const seLog = 0.05 + 0.04 * rng();
    const seLogRP = 0.04 + 0.03 * rng();
    const Beta = od.tipo === "continuo" ? (grad - 1) * Math.abs(od.base_mean) * 0.5 : null;
    const SE_beta = od.tipo === "continuo" ? Math.abs(od.base_mean) * 0.05 : null;
    const p = Math.abs(Math.log(ORa)) / seLog > 2.3 ? 0.0001 :
              Math.abs(Math.log(ORa)) / seLog > 1.65 ? 0.04 : 0.18;
    return {
      nivel: lev,
      ORa: ORa,
      ORa_lo: ORa * Math.exp(-1.96 * seLog),
      ORa_hi: ORa * Math.exp(1.96 * seLog),
      RPa: RPa,
      RPa_lo: RPa * Math.exp(-1.96 * seLogRP),
      RPa_hi: RPa * Math.exp(1.96 * seLogRP),
      Beta: Beta,
      Beta_lo: Beta !== null ? Beta - 1.96 * SE_beta : null,
      Beta_hi: Beta !== null ? Beta + 1.96 * SE_beta : null,
      p: p, ref: false
    };
  });
  return {main_var: mainVar, ref: ref, niveles: niveles,
          confusores: ["SEXO_CAT","EDAD_CAT","AREA_CAT","EDUC_CAT","QUINTIL_CAT"]
            .filter(c => c !== mainVar)};
}

// Versión multi-variable del análisis multivariado:
// Recibe array de IDs y devuelve un objeto agregado.
function getMultivariateMulti(outcome, year, mainVars) {
  const od = OUTCOMES.find(o => o.id === outcome);
  if (!od || !mainVars || mainVars.length === 0) return null;
  // Confusores estándar excluyendo los que el usuario eligió como exposición
  const confusores = ["SEXO_CAT","EDAD_CAT","AREA_CAT","EDUC_CAT","QUINTIL_CAT"]
    .filter(c => !mainVars.includes(c));
  // Para cada variable principal, obtener su contribución al modelo
  const variables = mainVars.map(vid => {
    const single = getMultivariate(outcome, year, vid);
    if (!single) return null;
    const cd = _findVar(vid);
    return {
      id: vid,
      etiqueta: cd?.etiqueta || vid,
      dominio: cd?.dominio || "—",
      ref: single.ref,
      niveles: single.niveles
    };
  }).filter(v => v);
  // Atenuación adicional cuando hay múltiples variables principales
  // (las co-exposiciones suelen atenuar entre sí - lo simulamos)
  const k = mainVars.length;
  const atten = Math.max(0.55, 1 - 0.06 * (k - 1));
  variables.forEach(v => {
    v.niveles.forEach(n => {
      if (n.ref) return;
      n.ORa = 1 + (n.ORa - 1) * atten;
      n.ORa_lo = 1 + (n.ORa_lo - 1) * atten;
      n.ORa_hi = 1 + (n.ORa_hi - 1) * atten;
      n.RPa = 1 + (n.RPa - 1) * atten;
      n.RPa_lo = 1 + (n.RPa_lo - 1) * atten;
      n.RPa_hi = 1 + (n.RPa_hi - 1) * atten;
    });
  });
  return {
    multi_var: true,
    variables: variables,
    confusores: confusores,
    n_variables: variables.length
  };
}

// Tendencia multi-año (para gráficos)
function getTrend(outcome, cov = null, stratLevel = null) {
  const yrs = YEARS.filter(y => {
    const od = OUTCOMES.find(o => o.id === outcome);
    return od && y >= od.anio_min && y <= od.anio_max;
  });
  return yrs.map(y => {
    const u = getUnivariate(outcome, y, stratLevel);
    return {anio: y, ...u};
  });
}

// Tendencia estratificada
function getTrendStratified(outcome, cov) {
  const cd = COVARIATES.find(c => c.id === cov);
  if (!cd) return null;
  const od = OUTCOMES.find(o => o.id === outcome);
  const yrs = YEARS.filter(y => y >= od.anio_min && y <= od.anio_max);
  const result = {};
  cd.niveles.forEach(lev => {
    result[lev] = yrs.map(y => {
      const bi = getBivariate(outcome, y, cov);
      if (!bi) return null;
      const row = bi.niveles.find(n => n.nivel === lev);
      return row ? {anio: y, ...row} : null;
    }).filter(x => x);
  });
  return result;
}

// Catálogo de variables del modo Explorador (top 100 variables ENDES)
const VARIABLE_CATALOG = [
  {variable:"HV270", etiqueta:"Quintil de riqueza", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV271", etiqueta:"Índice de riqueza (continuo)", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV025", etiqueta:"Área urbano/rural", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV024", etiqueta:"Región (24+Callao)", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV026", etiqueta:"Tipo de lugar", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV040", etiqueta:"Altitud del conglomerado (m)", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV104", etiqueta:"Sexo", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV105", etiqueta:"Edad (años)", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV106", etiqueta:"Nivel educativo alcanzado", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV108", etiqueta:"Años de educación", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV201", etiqueta:"Fuente de agua para beber", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV205", etiqueta:"Tipo de servicio sanitario", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV206", etiqueta:"Tiene electricidad", tipo:"binario", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV207", etiqueta:"Tiene radio", tipo:"binario", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV208", etiqueta:"Tiene televisor", tipo:"binario", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV209", etiqueta:"Tiene refrigerador", tipo:"binario", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV221", etiqueta:"Tiene teléfono fijo", tipo:"binario", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV226", etiqueta:"Combustible para cocinar", tipo:"categorico", nivel:"hogar", anios:"2000-2024"},
  {variable:"HV243A", etiqueta:"Tiene celular", tipo:"binario", nivel:"hogar", anios:"2008-2024"},
  {variable:"HV220", etiqueta:"Edad del jefe del hogar", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV219", etiqueta:"Sexo del jefe del hogar", tipo:"categorico", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV012", etiqueta:"Número de miembros del hogar", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  {variable:"HV216", etiqueta:"Número de cuartos para dormir", tipo:"continuo", nivel:"hogar", anios:"1996-2024"},
  // MUJER
  {variable:"V012", etiqueta:"Edad de la mujer (15-49)", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V025", etiqueta:"Tipo de residencia", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V106", etiqueta:"Nivel educativo más alto", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V130", etiqueta:"Religión", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V131", etiqueta:"Lengua materna", tipo:"categorico", nivel:"mujer", anios:"2009-2024"},
  {variable:"V190", etiqueta:"Quintil de riqueza (mujer)", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V201", etiqueta:"Número total de hijos nacidos vivos", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V206", etiqueta:"Hijos varones vivos en hogar", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V207", etiqueta:"Hijas mujeres vivas en hogar", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V212", etiqueta:"Edad al primer parto", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V213", etiqueta:"Actualmente embarazada", tipo:"binario", nivel:"mujer", anios:"1996-2024"},
  {variable:"V214", etiqueta:"Meses de embarazo actual", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V218", etiqueta:"Número hijos vivos", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V302", etiqueta:"Alguna vez usó método anticonceptivo", tipo:"binario", nivel:"mujer", anios:"1996-2024"},
  {variable:"V312", etiqueta:"Método anticonceptivo actual", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V313", etiqueta:"Uso actual de método (moderno/tradicional/no)", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V501", etiqueta:"Estado civil", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V502", etiqueta:"Actualmente unida", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V525", etiqueta:"Edad primera relación sexual", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V605", etiqueta:"Deseo de más hijos", tipo:"categorico", nivel:"mujer", anios:"1996-2024"},
  {variable:"V613", etiqueta:"Número ideal de hijos", tipo:"continuo", nivel:"mujer", anios:"1996-2024"},
  {variable:"V714", etiqueta:"Actualmente trabaja", tipo:"binario", nivel:"mujer", anios:"1996-2024"},
  {variable:"V781", etiqueta:"Prueba de VIH alguna vez", tipo:"binario", nivel:"mujer", anios:"2000-2024"},
  // NIÑO
  {variable:"B4", etiqueta:"Sexo del niño", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"HW1", etiqueta:"Edad del niño (meses)", tipo:"continuo", nivel:"nino", anios:"1996-2024"},
  {variable:"HW2", etiqueta:"Peso del niño (kg×10)", tipo:"continuo", nivel:"nino", anios:"1996-2024"},
  {variable:"HW3", etiqueta:"Talla del niño (cm×10)", tipo:"continuo", nivel:"nino", anios:"1996-2024"},
  {variable:"HW56", etiqueta:"Hemoglobina del niño (g/dL×10)", tipo:"continuo", nivel:"nino", anios:"2007-2024"},
  {variable:"HW70", etiqueta:"Z-score Talla/Edad ×100", tipo:"continuo", nivel:"nino", anios:"2000-2024"},
  {variable:"HW71", etiqueta:"Z-score Peso/Edad ×100", tipo:"continuo", nivel:"nino", anios:"2000-2024"},
  {variable:"HW72", etiqueta:"Z-score Peso/Talla ×100", tipo:"continuo", nivel:"nino", anios:"2000-2024"},
  {variable:"H2", etiqueta:"Recibió BCG", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H3", etiqueta:"Recibió DPT 1", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H5", etiqueta:"Recibió DPT 3", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H7", etiqueta:"Recibió Polio 3", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H9", etiqueta:"Recibió Sarampión", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H11", etiqueta:"Tuvo diarrea últimas 2 semanas", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"H31", etiqueta:"Tuvo tos últimas 2 semanas", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"M2A", etiqueta:"APN por médico", tipo:"binario", nivel:"nino", anios:"1996-2024"},
  {variable:"M2B", etiqueta:"APN por obstetra", tipo:"binario", nivel:"nino", anios:"1996-2024"},
  {variable:"M4", etiqueta:"Estado de lactancia", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"M14", etiqueta:"Número de visitas prenatales", tipo:"continuo", nivel:"nino", anios:"1996-2024"},
  {variable:"M15", etiqueta:"Lugar del parto", tipo:"categorico", nivel:"nino", anios:"1996-2024"},
  {variable:"M17", etiqueta:"Parto por cesárea", tipo:"binario", nivel:"nino", anios:"2000-2024"},
  {variable:"M19", etiqueta:"Peso al nacer (g)", tipo:"continuo", nivel:"nino", anios:"2000-2024"},
  // SALUD ADULTOS
  {variable:"QS22", etiqueta:"Le midieron PA últimos 12m", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS23", etiqueta:"Le dijeron que tiene HTA", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS25", etiqueta:"Se hizo prueba glucosa alguna vez", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS26", etiqueta:"Le dijeron que tiene diabetes", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS101", etiqueta:"Fuma actualmente", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS208", etiqueta:"Consumió alcohol últimos 30 días", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS601", etiqueta:"Consultó dentista últimos 6 meses", tipo:"categorico", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS700", etiqueta:"Peso adulto (kg×10)", tipo:"continuo", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS701", etiqueta:"Talla adulto (mm)", tipo:"continuo", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS900A", etiqueta:"PA sistólica (mmHg)", tipo:"continuo", nivel:"adulto_salud", anios:"2014-2024"},
  {variable:"QS900B", etiqueta:"PA diastólica (mmHg)", tipo:"continuo", nivel:"adulto_salud", anios:"2014-2024"}
];

// =====================================================================
// CRÉDITOS
// =====================================================================
const CREDITS = {
  autor: "Dr. Joshuan J. Barboza",
  cargo: "Docente Investigador",
  institucion: "Universidad Señor de Sipán",
  reconocimiento: "Investigador RENACYT - Nivel Distinguido",
  orcid: "0000-0002-2896-1407",
  scopus: "57204457871",
  email: "jbarbozameca@gmail.com",
  fecha: "2026",
  fuente: "ENDES - Instituto Nacional de Estadística e Informática (INEI) - Perú",
  cobertura: "1996, 2000, 2004–2024 (23 años · 264 módulos)",
  cita: "Barboza JJ. Calculadora Histórica ENDES Perú [Internet]. Universidad Señor de Sipán; 2026."
};

// Exponer al global para que app.js los use
window.ENDES = {
  YEARS, COVARIATES, MAIN_VARS, OUTCOMES, VARIABLE_CATALOG, CREDITS,
  getUnivariate, getBivariate, getMultivariate,
  getTrend, getTrendStratified,
  // Versión: incrementar al reemplazar datos demo por datos reales
  VERSION: "1.1.0-demo",
  DATA_SOURCE: "Generador procedural determinístico (basado en literatura RPMESP) " +
               "con 70 outcomes × 70 variables principales × 23 años. " +
               "Para reemplazar con datos reales del survey package, ejecutar " +
               "R/07_export_calc_data_js.R en tu Mac (genera data.js ~3-15MB con valores reales)."
};
