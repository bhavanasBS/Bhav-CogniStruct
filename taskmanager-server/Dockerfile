# ── Stage 1: Build ──────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["TaskManager.API.csproj", "."]
RUN dotnet restore "./TaskManager.API.csproj"

# Copy all source files and publish
COPY . .
RUN dotnet publish "./TaskManager.API.csproj" -c Release -o /app/publish

# ── Stage 2: Run ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Render assigns the PORT env variable automatically
ENV ASPNETCORE_URLS=http://+:${PORT:-5000}

ENTRYPOINT ["dotnet", "TaskManager.API.dll"]
