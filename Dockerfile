FROM node:14.17.4-alpine

RUN mkdir /user && \
    echo 'nobody:x:65534:65534:nobody:/:' > /user/passwd && \
    echo 'nobody:x:65534:' > /user/group

COPY package.json package.json
RUN npm install

COPY .babelrc ./
COPY src src
RUN npm run build \
  && rm -rf src

COPY src/issue-resolver/start.sh dist/issue-resolver/start.sh
COPY src/user-agent/start.sh dist/user-agent/start.sh
COPY src/issue-resolver/swagger.yaml dist/issue-resolver/swagger.yaml

# Ensure we are not running as root
USER nobody:nobody