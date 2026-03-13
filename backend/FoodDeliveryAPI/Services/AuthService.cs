using FoodDeliveryAPI.Data;
using FoodDeliveryAPI.DTOs.Auth;
using FoodDeliveryAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FoodDeliveryAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            var exists = await _db.Customers.AnyAsync(x => x.Email == request.Email);
            if (exists) throw new InvalidOperationException("Email already registered.");

            var customer = new Customer
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                IsActive = true
            };

            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();

            var token = GenerateToken(customer.Email, customer.Name, "Customer");

            return new AuthResponse { Token = token, Email = customer.Email, Name = customer.Name };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var customer = await _db.Customers.SingleOrDefaultAsync(x => x.Email == request.Email);
            if (customer == null) throw new InvalidOperationException("Invalid credentials.");

            var verified = BCrypt.Net.BCrypt.Verify(request.Password, customer.PasswordHash);
            if (!verified) throw new InvalidOperationException("Invalid credentials.");

            var token = GenerateToken(customer.Email, customer.Name, "Customer");
            return new AuthResponse { Token = token, Email = customer.Email, Name = customer.Name };
        }

        private string GenerateToken(string email, string name, string role)
        {
            var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
            var issuer = _config["Jwt:Issuer"] ?? "fooddelivery";
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: null,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
