FROM python:3.9-slim
ENV PYTHONUNBUFFERED 1
RUN apt-get update && apt-get -y install gcc
COPY ./requirements_docker.txt /requirements_docker.txt
RUN pip install -r /requirements_docker.txt
RUN mkdir -p /app
COPY . /app
WORKDIR /app