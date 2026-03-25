using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using POS.Main.Business.Admin.Services;
using POS.Main.Business.Menu.Interfaces;
using POS.Main.Business.Menu.Services;
using POS.Main.Business.HumanResource.Interfaces;
using POS.Main.Business.HumanResource.Services;
using POS.Main.Business.Authorization.Interfaces;
using POS.Main.Business.Authorization.Services;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Services;
using POS.Main.Business.Order.Interfaces;
using POS.Main.Business.Order.Services;
using POS.Main.Business.Notification.Interfaces;
using POS.Main.Business.Notification.Services;
using POS.Main.Business.Payment.Interfaces;
using POS.Main.Business.Payment.Services;
using RBMS.POS.WebAPI.Services;
using POS.Main.Core.Helpers;
using POS.Main.Core.Settings;
using POS.Main.Dal;
using POS.Main.Repositories.UnitOfWork;
using System.IO.Compression;
using RBMS.POS.WebAPI.DataSeed;
using RBMS.POS.WebAPI.Filters;
using RBMS.POS.WebAPI.Hubs;
using Amazon.S3;
using POS.Main.Business.Admin.Interfaces;
using POS.Main.Core.Interfaces;
using POS.Main.Core.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Kestrel — enforce TLS 1.2+
builder.WebHost.ConfigureKestrel(options =>
{
    options.ConfigureHttpsDefaults(httpsOptions =>
    {
        httpsOptions.SslProtocols = System.Security.Authentication.SslProtocols.Tls12
                                  | System.Security.Authentication.SslProtocols.Tls13;
    });
});

// Add services to the container.
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
})
    .AddNewtonsoftJson(o =>
        o.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore);
builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI Configuration
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "RBMS POS API",
        Version = "v2",
        Description = "Backend API for RBMS Point of Sale System",
        Contact = new OpenApiContact
        {
            Name = "RBMS Developer",
            Email = "turk.phakim.sgn@gmail.com"
        }
    });

    // JWT Authentication for Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    options.OperationFilter<CustomOperationIdFilter>();
});

// Compression
builder.Services.Configure<GzipCompressionProviderOptions>(o => o.Level = CompressionLevel.Optimal);
builder.Services.AddResponseCompression(o =>
{
    o.EnableForHttps = true;
    o.Providers.Add<GzipCompressionProvider>();
    o.Providers.Add<BrotliCompressionProvider>();
});

// Database connection
var conn = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<POSMainContext>(opt =>
    opt.UseSqlServer(conn)
       .EnableDetailedErrors());

// CORS
var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("dev", p => p
        .WithOrigins(origins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// HealthChecks
builder.Services.AddHealthChecks()
    .AddCheck("self", () => Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult.Healthy())
    .AddDbContextCheck<POSMainContext>("db");

// SignalR
builder.Services.AddSignalR();

// JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("JWT Secret is not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RBMS.POS.API";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RBMS.POS.Client";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // SignalR — ส่ง JWT token ผ่าน query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Repositories + UnitOfWork
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// S3 Storage
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var s3Config = new AmazonS3Config
    {
        ServiceURL = config["S3:ServiceUrl"],
        ForcePathStyle = config.GetValue<bool>("S3:ForcePathStyle")
    };
    return new AmazonS3Client(
        config["S3:AccessKey"],
        config["S3:SecretKey"],
        s3Config);
});

// SMTP Configuration
builder.Services.Configure<SmtpSettings>(builder.Configuration.GetSection("Smtp"));
builder.Services.AddScoped<IEmailService, EmailService>();

// ReCaptcha
builder.Services.Configure<ReCaptchaSettings>(builder.Configuration.GetSection("ReCaptcha"));
builder.Services.AddHttpClient<IReCaptchaService, ReCaptchaService>();

// Business Services
builder.Services.AddScoped<IS3StorageService, S3StorageService>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IServiceChargeService, ServiceChargeService>();
builder.Services.AddScoped<IMenuSubCategoryService, MenuSubCategoryService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOptionGroupService, OptionGroupService>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<IPositionService, PositionService>();
builder.Services.AddScoped<IShopSettingsService, ShopSettingsService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IZoneService, ZoneService>();
builder.Services.AddScoped<ITableService, TableService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IFloorObjectService, FloorObjectService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IKitchenService, KitchenService>();
builder.Services.AddScoped<IOrderNotificationService, OrderNotificationService>();
builder.Services.AddScoped<ICashierSessionService, CashierSessionService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<ICustomerService, CustomerService>();
builder.Services.AddScoped<ISelfOrderService, SelfOrderService>();
builder.Services.AddScoped<ISlipOcrService, SlipOcrService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<INotificationBroadcaster, NotificationBroadcaster>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// Background Services
builder.Services.AddHostedService<ReservationReminderService>();
builder.Services.AddHostedService<CleanupBackgroundService>();

// Caching
builder.Services.AddMemoryCache();

// Helper Services
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

builder.Services.AddHttpContextAccessor();

// HSTS Configuration
builder.Services.AddHsts(options =>
{
    options.MaxAge = TimeSpan.FromDays(365);
    options.IncludeSubDomains = true;
    options.Preload = true;
});

var app = builder.Build();

// Middleware pipeline
app.UseResponseCompression();

// HSTS (Production only — dev ใช้ self-signed cert)
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Security Headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.UseRouting();
app.UseCors("dev");

app.UseAuthentication();
app.UseAuthorization();

// Swagger - Enable for all environments
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v2/swagger.json", "RBMS POS API v2");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "RBMS POS API";
    options.EnableTryItOutByDefault();
    options.DefaultModelsExpandDepth(-1);
    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
    options.HeadContent = """
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
        .swagger-ui, .swagger-ui .opblock .opblock-summary-description, .swagger-ui .info .title,
        .swagger-ui .opblock-tag, .swagger-ui .btn { font-family:'Sarabun','Segoe UI',system-ui,sans-serif; }
        .swagger-ui .topbar, .swagger-ui .topbar .wrapper, .swagger-ui .topbar .topbar-wrapper,
        .swagger-ui .topbar .topbar-wrapper .link { background-color:#1e293b !important; }
        .swagger-ui .topbar { padding:10px 0; border-bottom:3px solid #f97316; }
        .swagger-ui .topbar .topbar-wrapper a, .swagger-ui .topbar .topbar-wrapper span,
        .swagger-ui .topbar .link { color:#f97316 !important; font-weight:700; font-size:18px; text-decoration:none; }
        .swagger-ui .topbar .download-url-wrapper .select-label { color:#e2e8f0; }
        .swagger-ui .topbar .download-url-wrapper input[type=text] { border-color:#475569; background:#334155; color:#f1f5f9; }
        html { background:#f8fafc; }
        .swagger-ui .wrapper { background:#f8fafc; }
        .swagger-ui .info .title { color:#1e293b; font-weight:700; }
        .swagger-ui .info .title small { display:none; }
        .swagger-ui .info .description p { color:#64748b; }
        .swagger-ui .opblock-tag { border-bottom:1px solid #e2e8f0; font-size:32px; color:#1e293b; font-weight:700; }
        .swagger-ui .opblock-tag:hover { background:#fff7ed; }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background:#14b8a6; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background:#f97316; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background:#fbbf24; color:#334155; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background:#f43f5e; }
        .swagger-ui .opblock.opblock-patch .opblock-summary-method { background:#8b5cf6; }
        .swagger-ui .opblock.opblock-get { border-color:#14b8a6; background:rgba(20,184,166,.04); }
        .swagger-ui .opblock.opblock-post { border-color:#f97316; background:rgba(249,115,22,.04); }
        .swagger-ui .opblock.opblock-put { border-color:#fbbf24; background:rgba(251,191,36,.04); }
        .swagger-ui .opblock.opblock-delete { border-color:#f43f5e; background:rgba(244,63,94,.04); }
        .swagger-ui .btn.execute { background-color:#f97316; border-color:#f97316; color:#fff; border-radius:6px; font-weight:600; }
        .swagger-ui .btn.execute:hover { background-color:#ea580c; }
        .swagger-ui .btn.authorize { color:#f97316; border-color:#f97316; border-radius:6px; }
        .swagger-ui .btn.authorize svg { fill:#f97316; }
        .swagger-ui .btn.cancel, .swagger-ui .try-out__btn { border-radius:6px; }
        .swagger-ui table thead tr td, .swagger-ui table thead tr th { color:#334155; border-bottom:1px solid #e2e8f0; }
        .swagger-ui section.models { border:1px solid #e2e8f0; border-radius:8px; }
        .swagger-ui .dialog-ux .modal-ux { border-radius:10px; border:1px solid #e2e8f0; }
        .swagger-ui .dialog-ux .modal-ux-header h3 { color:#1e293b; font-weight:700; }
        .swagger-ui input[type=text], .swagger-ui textarea { border-radius:6px; border-color:#e2e8f0; }
        .swagger-ui input[type=text]:focus, .swagger-ui textarea:focus { border-color:#f97316; outline:none; box-shadow:0 0 0 2px rgba(249,115,22,.15); }
        .swagger-ui select { border-radius:6px; border-color:#e2e8f0; }
        .swagger-ui .opblock .opblock-summary-path { color:#334155; }
        </style>
        """;
});

// Seed test data (Development only)
if (app.Environment.IsDevelopment())
{
    await TestDataSeeder.SeedTestUsersAsync(app.Services);
}

// Endpoints
app.MapControllers();
app.MapHealthChecks("/health");
app.MapHub<OrderHub>("/hubs/order");
app.MapHub<NotificationHub>("/hubs/notification");

app.Run();
