FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# genera el cliente de Prisma (solo necesita el schema, no la conexión a la BD)
RUN npx prisma generate

EXPOSE 80

# al arrancar el contenedor (ahí SÍ hay conexión a la BD): sincroniza el schema
# con la base de datos y recién ahí levanta el servidor
CMD ["sh", "-c", "npx prisma db push && npm start"]