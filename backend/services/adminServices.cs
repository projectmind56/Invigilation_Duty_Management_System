using backend.Context;
using backend.DTOs;
using backend.Interfaces;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace backend.Services
{
    public class AdminService : IAdminInterface
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AdminService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<List<StaffModel>> GetAllStaffAsync()
        {
            return await _context.StaffModel
                .Where(s => s.Role == "staff")
                .ToListAsync();
        }

        public async Task<bool> ApproveOrRejectStaffAsync(StaffApprovalDto dto)
        {
            var staff = await _context.StaffModel.FirstOrDefaultAsync(s => s.StaffId == dto.StaffId);
            if (staff == null) return false;

            if (dto.Status == "Accept")
            {
                var password = GenerateRandomPassword(6);
                staff.Password = password;
                staff.ApprovalStatus = "Accept";
                await SendAcceptanceEmailAsync(staff.Email, password);
            }
            else if (dto.Status == "Reject")
            {
                staff.ApprovalStatus = "Reject";
                await SendRejectionEmailAsync(staff.Email, dto.RejectionReason ?? "Not specified");
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateRandomPassword(int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private async Task SendAcceptanceEmailAsync(string toEmail, string password)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "templates", "StaffApprovalAccepted.html");

            if (!System.IO.File.Exists(templatePath))
                throw new FileNotFoundException("Approval template not found.");

            string html = await System.IO.File.ReadAllTextAsync(templatePath);
            html = html.Replace("{{Password}}", password);

            await SendEmailAsync(toEmail, "Your Staff Application is Approved", html);
        }

        private async Task SendRejectionEmailAsync(string toEmail, string reason)
        {
            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "templates", "StaffApprovalRejected.html");

            if (!System.IO.File.Exists(templatePath))
                throw new FileNotFoundException("Rejection template not found.");

            string html = await System.IO.File.ReadAllTextAsync(templatePath);
            html = html.Replace("{{Reason}}", reason);

            await SendEmailAsync(toEmail, "Your Staff Application was Rejected", html);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var message = new MailMessage
            {
                From = new MailAddress("no-reply@yourdomain.com"),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

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
