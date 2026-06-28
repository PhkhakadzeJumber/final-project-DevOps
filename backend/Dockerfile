# Stage 1: Build the JAR
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# 🚀 ADD THIS LINE RIGHT HERE TO PATCH THE BASE OS VULNERABILITIES:
RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]