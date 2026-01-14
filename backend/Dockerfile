# -------- Build stage --------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Gradle files first (better caching)
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./

RUN chmod +x gradlew
RUN ./gradlew dependencies --no-daemon

# Copy source
COPY src src

# Build jar
RUN ./gradlew bootJar --no-daemon


# -------- Runtime stage --------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy built jar
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app/app.jar"]
