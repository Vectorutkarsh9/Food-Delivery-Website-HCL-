using FoodDeliveryAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FoodDeliveryAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// ── 1. CONNECTION STRING ──────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// ── 2. DATABASE - MySQL via Pomelo ────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mySqlOptions => mySqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null
        )
    )
);

// ── AUTH SERVICES --------------------------------------------------------
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured. Use user-secrets or environment variables to set it.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "fooddelivery";

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = false,
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuerSigningKey = true
    };
});

builder.Services.AddAuthorization();

// ── 3. CONTROLLERS ────────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Keep enum names as strings in JSON responses
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// ── 4. SWAGGER ────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title       = "Food Delivery API",
        Version     = "v1",
        Description = "Online Food Delivery System - ASP.NET Core Web API (.NET 10)",
        Contact     = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name  = "Food Delivery System",
            Email = "admin@fooddelivery.com"
        }
    });
});

// ── 5. CORS - Allow Angular Frontend ─────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",   // Angular dev server
                "http://localhost:4201"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── 6. BUILD APP ──────────────────────────────────────────────────────────────
var app = builder.Build();

// ── 7. AUTO-VERIFY DB CONNECTION ON STARTUP ───────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.OpenConnection();
        db.Database.CloseConnection();
        Console.WriteLine("✅  MySQL connection verified successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌  MySQL connection failed: {ex.Message}");
    }
}

// ── 8. MIDDLEWARE PIPELINE ────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Food Delivery API v1");
        c.RoutePrefix      = string.Empty; // Swagger at root: http://localhost:5000
        c.DocumentTitle    = "Food Delivery API";
        c.DisplayRequestDuration();
    });
}

app.UseCors("AllowAngular");
// app.UseHttpsRedirection();  // Disabled for dev: prevents HTTP→HTTPS redirect that breaks CORS
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
