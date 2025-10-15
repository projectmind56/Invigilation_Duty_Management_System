using backend.Context;
using backend.Interfaces;
using backend.Models;
using backend.Dto;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class StaffService : IStaffInterface
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StaffService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<bool> RegisterAsync(RegisterDto registerDto)
        {
            var existingStaff = await _context.StaffModel.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
            if (existingStaff != null) return false;

            var newStaff = new StaffModel
            {
                Email = registerDto.Email,
                Department = registerDto.Department,
                Role = "staff",
                Password = "", // default or generate
                ApprovalStatus = "Pending"
            };

            _context.StaffModel.Add(newStaff);
            await _context.SaveChangesAsync();

            await SendRegistrationNotificationEmailAsync(newStaff);

            return true;
        }

        public async Task<string?> LoginAsync(LoginDto loginDto)
        {
            var staff = await _context.StaffModel.FirstOrDefaultAsync(u =>
                u.Email == loginDto.Email && u.Password == loginDto.Password);

            if (staff == null) return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "YourVeryStrongKeyHere");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, staff.StaffId.ToString()),
                    new Claim(ClaimTypes.Email, staff.Email ?? string.Empty),
                    new Claim(ClaimTypes.Role, staff.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task SendRegistrationNotificationEmailAsync(StaffModel staff)
        {
            Console.WriteLine("Sending registration email...");
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "templates", "StaffRegistrationNotification.html");

            if (!System.IO.File.Exists(templatePath))
                return;

            string emailHtml = await System.IO.File.ReadAllTextAsync(templatePath);
            emailHtml = emailHtml.Replace("{{Email}}", staff.Email)
                                 .Replace("{{Department}}", staff.Department ?? "N/A");

            var adminEmail = _configuration["Admin:Email"] ?? "admin@example.com";

            var message = new MailMessage
            {
                From = new MailAddress("no-reply@yourdomain.com"), // change
                Subject = "New Staff Registration Request",
                Body = emailHtml,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(adminEmail));

            using var smtp = new SmtpClient
            {
                Host = _configuration["Smtp:Host"],
                Port = int.Parse(_configuration["Smtp:Port"] ?? "587"),
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    _configuration["Smtp:Username"],
                    _configuration["Smtp:Password"])
            };

            await smtp.SendMailAsync(message);
        }
    }
}
