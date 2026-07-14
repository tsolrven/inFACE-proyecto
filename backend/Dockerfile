FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# genera el cliente de Prisma (solo necesita el schema, no la conexión a la BD)
RUN npx prisma generate

EXPOSE 80

# al arrancar el contenedor (ahí SÍ hay conexión a la BD):
# 1. sincroniza el schema con la base de datos
# 2. corre el seed (usa upsert, así que es seguro correrlo en cada arranque)
# 3. recién ahí levanta el servidor
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm start"]
