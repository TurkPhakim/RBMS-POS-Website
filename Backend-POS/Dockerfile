# ═══════════════════════════════════════════════════════════════
# RBMS-POS Backend — Multi-stage Dockerfile (.NET 9)
# ═══════════════════════════════════════════════════════════════

# --- Stage 1: Build ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution + project files (cache layer)
COPY RBMS.POS.sln ./
COPY POS.Main/POS.Main.Core/POS.Main.Core.csproj POS.Main/POS.Main.Core/
COPY POS.Main/POS.Main.Dal/POS.Main.Dal.csproj POS.Main/POS.Main.Dal/
COPY POS.Main/POS.Main.Repositories/POS.Main.Repositories.csproj POS.Main/POS.Main.Repositories/
COPY POS.Main/POS.Main.Business.Admin/POS.Main.Business.Admin.csproj POS.Main/POS.Main.Business.Admin/
COPY POS.Main/POS.Main.Business.Menu/POS.Main.Business.Menu.csproj POS.Main/POS.Main.Business.Menu/
COPY POS.Main/POS.Main.Business.HumanResource/POS.Main.Business.HumanResource.csproj POS.Main/POS.Main.Business.HumanResource/
COPY POS.Main/POS.Main.Business.Authorization/POS.Main.Business.Authorization.csproj POS.Main/POS.Main.Business.Authorization/
COPY POS.Main/POS.Main.Business.Table/POS.Main.Business.Table.csproj POS.Main/POS.Main.Business.Table/
COPY POS.Main/POS.Main.Business.Order/POS.Main.Business.Order.csproj POS.Main/POS.Main.Business.Order/
COPY POS.Main/POS.Main.Business.Payment/POS.Main.Business.Payment.csproj POS.Main/POS.Main.Business.Payment/
COPY POS.Main/POS.Main.Business.Notification/POS.Main.Business.Notification.csproj POS.Main/POS.Main.Business.Notification/
COPY POS.Main/RBMS.POS.WebAPI/RBMS.POS.WebAPI.csproj POS.Main/RBMS.POS.WebAPI/

# Restore dependencies (cached if csproj files unchanged)
RUN dotnet restore

# Copy all source code
COPY POS.Main/ POS.Main/

# Publish release build
RUN dotnet publish POS.Main/RBMS.POS.WebAPI/RBMS.POS.WebAPI.csproj \
    -c Release -o /app/publish --no-restore

# --- Stage 2: Runtime ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Set environment
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "RBMS.POS.WebAPI.dll"]
