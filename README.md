# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.


## Estructura de componentes

A continuación se describe la función de cada componente principal de la app:

- **Collapsible.tsx**: Componente para mostrar secciones expandibles/colapsables, útil para agrupar información y mejorar la experiencia de usuario.
- **ExternalLink.tsx**: Renderiza enlaces externos con estilos y manejo seguro de navegación fuera de la app.
- **HapticTab.tsx**: Tab personalizado que agrega retroalimentación háptica al cambiar de pestaña.
- **HelloWave.tsx**: Componente visual animado para dar la bienvenida o mostrar mensajes amigables.
- **ParallaxScrollView.tsx**: ScrollView con efecto parallax para mostrar listas o detalles con animaciones modernas.
- **ThemedText.tsx**: Componente de texto que adapta el color y estilo según el tema (oscuro/claro) de la app.
- **ThemedView.tsx**: View que adapta el fondo y estilos según el tema seleccionado.
- **ui/IconSymbol.tsx & IconSymbol.ios.tsx**: Iconos personalizados para la barra de navegación y otros elementos visuales.
- **ui/TabBarBackground.tsx & TabBarBackground.ios.tsx**: Fondo personalizado para la barra de pestañas, adaptado a cada plataforma.

## Estructura de pantallas

- **app/(tabs)/index.tsx**: Pantalla principal tras el login, muestra el Home y navegación por pestañas.
- **app/(tabs)/explore.tsx**: Pantalla de exploración de datos o funcionalidades adicionales.
- **app/HelloWave.tsx**: Pantalla de bienvenida con animación.
- **app/_layout.tsx**: Define la estructura y navegación principal de la app.
- **app/(tabs)/_layout.tsx**: Estructura y navegación específica para las pestañas.

## Estructura de lógica y utilidades

- **constants/Colors.ts**: Define la paleta de colores y temas usados en la app.
- **hooks/useColorScheme.ts & useColorScheme.web.ts**: Detecta y gestiona el esquema de color del sistema (oscuro/claro).
- **hooks/useThemeColor.ts**: Permite obtener colores adaptados al tema actual.

## Flujo de datos para escalar el proyecto 


## Flujo de datos para escalar el proyecto 

1. Carga inicial (Entrenador)

El entrenador usa la app (iOS/Android o web).

Sube su base de datos de jugadores (ej: CSV, Excel o manual).

Ingresa los emails autorizados que podrán acceder.

La app envía estos datos al Backend API.

➡️ Destino: Los datos quedan guardados en la Base de Datos central (ej: PostgreSQL, Firebase, Supabase).

2. Generación de URL única


El Backend genera un token aleatorio (ej: xyz123).

Ese token se asocia al entrenador y a su dataset en la DB.

La app muestra al entrenador un link como:
https://miapp.com/access/xyz123

➡️ Destino: Esta URL se guarda en la base de datos, en la columna `url_random` de la tabla `teams`, para validar futuros accesos.

3. Acceso del jugador

El jugador abre el link que le pasó el entrenador.

La web pide al jugador su email.

La web envía email + token al Backend API para validar.

➡️ Destino: El Backend busca en la DB si ese email está autorizado para el dataset de xyz123.

4. Validación

Si el email está en la lista de autorizados → acceso concedido.

Si no está → acceso denegado.

➡️ Destino: Respuesta JSON de la API con authorized: true/false.

5. Visualización de datos

Si autorizado, la web hace una petición al Backend API para obtener la data del entrenador (/data/xyz123).

El Backend responde con los datos crudos (ej: JSON con métricas).

La web renderiza los gráficos dinámicos con esos datos (ej: Chart.js, Recharts, D3.js).

➡️ Destino: Datos nunca se guardan en el navegador, solo se muestran.