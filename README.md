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

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


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

➡️ Destino: URL almacenada en la DB para validar futuros accesos.

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