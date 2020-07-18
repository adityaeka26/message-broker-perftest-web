FROM timbru31/java-node

RUN apt-get update
RUN apt-get install atop

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]