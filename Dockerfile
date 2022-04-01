FROM node:14.17.4-alpine

RUN mkdir /user && \
    echo 'nobody:x:65534:65534:nobody:/:' > /user/passwd && \
    echo 'nobody:x:65534:' > /user/group

COPY package.json package.json
RUN npm install

COPY start.sh .babelrc swagger.yaml ./
COPY src src
RUN npm run build \
  && rm -rf src

# Ensure we are not running as root
USER nobody:nobody