# Calculadora Histórica ENDES Perú 1996–2024

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![GitHub Pages](https://img.shields.io/badge/Hosted-GitHub%20Pages-blue)](#publicación-en-github-pages)

Herramienta web open-source para análisis epidemiológico de la **Encuesta Demográfica y de Salud Familiar del INEI**, cubriendo 23 años (1996, 2000, 2004–2024) y los 13 módulos principales.

**Autor**
Dr. Joshuan J. Barboza
Docente Investigador · Universidad Señor de Sipán
Investigador RENACYT · Nivel Distinguido
ORCID: [0000-0002-2896-1407](https://orcid.org/0000-0002-2896-1407)

---

## Características

- 70 outcomes clínicamente curados y operacionalizados
- 5 confusores estándar ajustados automáticamente
- Análisis univariado, bivariado y multivariado (logística + Poisson)
- Modo Explorador para variables crudas del catálogo armonizado
- Exportación a Excel con metadatos de citación
- Botón de "Solicitar ayuda" integrado para reportar errores
- Diseño muestral complejo manejado correctamente (strata + cluster + peso)
- 100% estático, sin servidor — alojable gratis en GitHub Pages

## Estructura de archivos

```
calculadora_github/
├── index.html        Estructura HTML
├── style.css         Estilos
├── data.js           Catálogo de 70 outcomes + generador de datos
├── app.js            Lógica de la calculadora
├── README.md         Este archivo
├── LICENSE           CC-BY 4.0
└── .nojekyll         Evita procesamiento Jekyll de GitHub
```

## Publicación en GitHub Pages

**Paso 1.** Crea un repositorio en GitHub (puede llamarse `endes-calculadora`, `calculadora-endes-peru`, o como prefieras).

**Paso 2.** Sube los archivos de esta carpeta a la raíz del repositorio. Puedes hacerlo con:

- **Interfaz web de GitHub:** Arrastra todos los archivos a `Add file → Upload files`.
- **Git:**
  ```bash
  git init
  git add .
  git commit -m "Calculadora ENDES Perú v1.0.0"
  git remote add origin https://github.com/[tu-usuario]/endes-calculadora.git
  git branch -M main
  git push -u origin main
  ```

**Paso 3.** Activa GitHub Pages:

1. En tu repositorio, ve a `Settings` → `Pages`.
2. En `Source`, selecciona `Deploy from a branch`.
3. Elige rama `main` y carpeta `/ (root)`.
4. Click `Save`.

**Paso 4.** En ~1 minuto la calculadora estará disponible en:

```
https://[tu-usuario].github.io/[nombre-repo]/
```

## Datos: estado actual y reemplazo

La versión actual usa un **generador procedural determinístico** que produce valores plausibles basados en rangos de la literatura peruana (RPMESP). Esto permite que la calculadora funcione completamente desde el día uno.

### Cómo reemplazar con datos reales

1. En tu Mac, abre la carpeta `BASE ENDES/R/` y corre el pipeline R:
   ```r
   source("00_setup.R")
   source("01_locate_files.R")
   source("02_load_and_harmonize.R")
   source("03_define_outcomes.R")
   source("04_run_analyses.R")
   source("05_export_for_calculator.R")
   ```

2. El pipeline genera archivos JSON en `BASE ENDES/calculadora_inputs/`:
   - `outcomes_meta.json` · metadata de los 70 outcomes
   - `results_univariado.json` · resultados univariados reales
   - `results_bivariado.json` · bivariados reales
   - `results_multivariado.json` · multivariados reales
   - `variable_catalog.json` · catálogo de variables (modo Explorador)
   - `variable_results.json` · descriptivos del Explorador

3. En `data.js`, sustituye las funciones `getUnivariate`, `getBivariate`, `getMultivariate` por lookups directos a los JSON.

   Hay un script auxiliar `R/07_export_calc_data_js.R` que genera un `data.js` listo para reemplazar el actual.

4. Sube el `data.js` nuevo a GitHub. La calculadora ahora usa datos reales.

## Personalización

- **Cambiar paleta de colores:** edita `:root` en `style.css`.
- **Agregar outcomes:** agrega entradas al array `OUTCOMES` en `data.js` siguiendo la plantilla existente, y al pipeline R en `03_define_outcomes.R`.
- **Cambiar dominio personalizado:** en `Settings → Pages → Custom domain` de tu repo.

## Cómo citar

> Barboza JJ. Calculadora Histórica ENDES Perú [Internet]. Universidad Señor de Sipán; 2026. Disponible en: https://[tu-usuario].github.io/endes-calculadora

## Licencia

Código y contenido bajo [Creative Commons Atribución 4.0 Internacional (CC-BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

Los datos originales pertenecen al **Instituto Nacional de Estadística e Informática (INEI)** del Perú y se utilizan bajo licencia abierta declarada en su portal de microdatos.

## Soporte

Reporta problemas o solicita análisis adicionales:
- Botón **📨 Solicitar ayuda** en la calculadora
- Correo: jbarbozameca@gmail.com
- ORCID: [0000-0002-2896-1407](https://orcid.org/0000-0002-2896-1407)
