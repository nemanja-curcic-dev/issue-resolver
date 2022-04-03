-- create database
CREATE DATABASE IF NOT EXISTS issueresolver;

-- create user
CREATE USER 'issueresolver'@'%' IDENTIFIED BY 'issueresolver';
GRANT ALL PRIVILEGES ON *.* TO 'issueresolver'@'%' IDENTIFIED BY 'issueresolver';

FLUSH PRIVILEGES;
