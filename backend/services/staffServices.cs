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
using backend.Dtos;
using YourNamespace.Models;
using backend.DTOs;
using backend.DTO;

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

        public async Task<IEnumerable<StaffTimeTableModel>> GetAllAsync()
        {
            return await _context.StaffTimeTable.ToListAsync();
        }

        public async Task<IEnumerable<StaffTimeTableModel>> GetByStaffIdAsync(int staffId)
        {
            return await _context.StaffTimeTable
                .Where(t => t.StaffId == staffId)
                .ToListAsync();
        }

        public async Task<StaffTimeTableModel> CreateAsync(StaffTimeTableDto dto)
        {
            var entry = new StaffTimeTableModel
            {
                StaffId = dto.StaffId,
                SubjectName = dto.SubjectName,
                Day = dto.Day,
                Period = dto.Period
            };

            _context.StaffTimeTable.Add(entry);
            await _context.SaveChangesAsync();

            return entry;
        }

        public async Task<StaffTimeTableModel?> UpdateAsync(int id, StaffTimeTableDto dto)
        {
            var entry = await _context.StaffTimeTable.FindAsync(id);
            if (entry == null) return null;

            entry.StaffId = dto.StaffId;
            entry.SubjectName = dto.SubjectName;
            entry.Day = dto.Day;
            entry.Period = dto.Period;

            await _context.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entry = await _context.StaffTimeTable.FindAsync(id);
            if (entry == null) return false;

            _context.StaffTimeTable.Remove(entry);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AcceptExamTimeTableAllocationAsync(int allocationId)
        {
            var allocation = await _context.ExamTimeTable.FirstOrDefaultAsync(e => e.Id == allocationId);
            if (allocation == null) return false;

            allocation.Status = "accepted";
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Returns available staff for a given session and date.
        /// If session == "Forenoon" → first 4 periods must be free.
        /// If session == "Afternoon" → last 3 periods must be free.
        /// </summary>


        public async Task<List<StaffInfoDto>> GetAvailableStaffAsync(string session, DateTime examDate, int allocationId)
        {
            // 1️⃣ Get all approved staff
            var allStaff = await _context.StaffModel
    .Where(s => s.ApprovalStatus.ToLower() == "accept" && s.Role.ToLower() != "admin")
    .ToListAsync();

            // 2️⃣ Get all timetables for that day (match Day of week)
            string dayName = examDate.DayOfWeek.ToString();
            var timeTables = await _context.StaffTimeTable
                .Where(t => t.Day.ToLower() == dayName.ToLower())
                .Select(t => new
                {
                    t.Id,
                    t.Day,
                    t.Period,
                    t.StaffId,
                    SubjectName = t.SubjectName ?? string.Empty // convert null to empty
                })
                .ToListAsync();

            // 3️⃣ Define which periods are occupied for each staff
            var busyMap = timeTables
                .Where(t => !string.IsNullOrEmpty(t.SubjectName)) // only consider periods with a subject assigned
                .GroupBy(t => t.StaffId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(t => t.Period).ToList()
                );

            // 4️⃣ Determine free staff based on session
            List<int> requiredFreePeriods = session.ToLower() == "forenoon"
                ? new List<int> { 1, 2, 3, 4 }  // FN = 4 periods
                : new List<int> { 5, 6, 7 };    // AN = 3 periods

            // 5️⃣ Get all reallocation requests for this allocation
            var reallocationRequests = await _context.ReallocationRequests
                .Where(r => r.AllocationId == allocationId)
                .ToListAsync();

            // 6️⃣ Filter available staff and include reallocation status
            var availableStaff = allStaff
                .Where(staff =>
                {
                    if (busyMap.ContainsKey(staff.StaffId))
                    {
                        var busyPeriods = busyMap[staff.StaffId];
                        bool hasConflict = requiredFreePeriods.Any(p => busyPeriods.Contains(p));
                        if (hasConflict) return false;
                    }
                    return true;
                })
                .Select(staff =>
                {
                    var request = reallocationRequests.FirstOrDefault(r => r.ToStaffId == staff.StaffId);

                    return new StaffInfoDto
                    {
                        StaffId = staff.StaffId,
                        Email = staff.Email,
                        Department = staff.Department,
                        ReallocationStatus = request?.Status
                    };
                })
                .ToList();

            return availableStaff;
        }


        public async Task<bool> ReallocateExamTimeTableAllocationAsync(int allocationId, int newStaffId)
        {
            var allocation = await _context.ExamTimeTable.FirstOrDefaultAsync(e => e.Id == allocationId);
            if (allocation == null) return false;

            allocation.StaffId = newStaffId;
            allocation.Status = "pending"; // reset to pending
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<(bool Success, string Message)> CreateReallocationRequestAsync(int allocationId, int fromStaffId, List<int> toStaffIds, int examId)
        {
            if (toStaffIds == null || !toStaffIds.Any())
                return (false, "No staff selected for reallocation.");

            // Find already requested staff
            var existingRequests = await _context.ReallocationRequests
                .Where(r => r.AllocationId == allocationId
                            && r.ExamId == examId
                            && r.FromStaffId == fromStaffId
                            && toStaffIds.Contains(r.ToStaffId))
                .Select(r => r.ToStaffId)
                .ToListAsync();

            // Filter out duplicates
            var newRequests = toStaffIds.Except(existingRequests)
                .Select(toStaffId => new ReallocationRequest
                {
                    AllocationId = allocationId,
                    ExamId = examId,
                    FromStaffId = fromStaffId,
                    ToStaffId = toStaffId,
                    RequestDate = DateTime.UtcNow,
                    Status = "pending"
                })
                .ToList();

            if (!newRequests.Any())
            {
                return (false, $"Request already sent for staff ID(s): {string.Join(", ", existingRequests)}");
            }

            await _context.ReallocationRequests.AddRangeAsync(newRequests);
            await _context.SaveChangesAsync();

            // Fetch exam details
            var exam = await _context.ExamTimeTable.FirstOrDefaultAsync(e => e.Id == examId);
            if (exam != null)
            {
                foreach (var toStaffId in newRequests.Select(r => r.ToStaffId))
                {
                    var staff = await _context.StaffModel.FirstOrDefaultAsync(s => s.StaffId == toStaffId);
                    if (staff != null && !string.IsNullOrEmpty(staff.Email))
                    {
                        await SendReallocationRequestEmailAsync(staff.Email, exam, fromStaffId);
                    }
                }
            }

            string message = "Reallocation request sent successfully.";
            if (existingRequests.Any())
            {
                message += $" Note: Request already existed for staff ID(s): {string.Join(", ", existingRequests)}";
            }

            return (true, message);
        }

        // New method to send reallocation email
        private async Task SendReallocationRequestEmailAsync(string toEmail, ExamTimeTableModel exam, int fromStaffId)
        {
            var fromStaff = await _context.StaffModel.FirstOrDefaultAsync(s => s.StaffId == fromStaffId);
            if (fromStaff == null) return;

            string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "templates", "ReallocationRequest.html");

            if (!System.IO.File.Exists(templatePath))
                return;

            string emailHtml = await System.IO.File.ReadAllTextAsync(templatePath);
            emailHtml = emailHtml.Replace("{{ToEmail}}", toEmail)
                                 .Replace("{{FromStaffEmail}}", fromStaff.Email ?? "N/A")
                                 .Replace("{{Session}}", exam.Session)
                                 .Replace("{{Semester}}", exam.Semester.ToString())
                                 .Replace("{{SubjectCode}}", exam.SubjectCode)
                                 .Replace("{{SubjectName}}", exam.SubjectName)
                                 .Replace("{{Department}}", exam.DepartmentName)
                                 .Replace("{{ClassName}}", exam.ClassName)
                                 .Replace("{{Branch}}", exam.BranchName)
                                 .Replace("{{Year}}", exam.Year.ToString())
                                 .Replace("{{ExamDate}}", exam.ExamDate.ToString("yyyy-MM-dd"));

            var message = new MailMessage
            {
                From = new MailAddress("no-reply@yourdomain.com"), // change
                Subject = "New Exam Reallocation Request",
                Body = emailHtml,
                IsBodyHtml = true
            };
            message.To.Add(new MailAddress(toEmail));

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

        public async Task<List<ReallocationRequest>> GetAllRequestsAsync()
        {
            return await _context.ReallocationRequests.ToListAsync();
        }

        public async Task<List<ReallocationRequest>> GetRequestsByStaffIdAsync(int staffId)
        {
            return await _context.ReallocationRequests
                .Where(r => r.FromStaffId == staffId)
                .ToListAsync();
        }

        public async Task<List<ExamTimeTableModel>> GetAllExamTimeTableAllocationsByStaffId(int staffId)
        {
            return await _context.ExamTimeTable
                .Where(e => e.StaffId == staffId)
                .ToListAsync();
        }

        public async Task<List<ReallocationRequestResponseDto>> GetReallocationRequestsForStaffAsync(int toStaffId)
        {
            var allowedStatuses = new List<string> { "pending", "approved", "canceled" };
            // Get pending requests for the given staff
            var requests = await _context.ReallocationRequests
    .Where(r => r.ToStaffId == toStaffId && allowedStatuses.Contains(r.Status))
    .ToListAsync();

            var responseList = new List<ReallocationRequestResponseDto>();

            foreach (var request in requests)
            {
                // Get allocation details
                var allocation = await _context.ExamTimeTable
                    .FirstOrDefaultAsync(e => e.Id == request.AllocationId);

                // Get staff emails
                var fromStaff = await _context.StaffModel
                    .FirstOrDefaultAsync(s => s.StaffId == request.FromStaffId);

                if (allocation != null && fromStaff != null)
                {
                    responseList.Add(new ReallocationRequestResponseDto
                    {
                        RequestId = request.Id,
                        AllocationId = request.AllocationId,
                        ExamId = request.ExamId,
                        FromStaffEmail = fromStaff.Email,
                        Session = allocation.Session,
                        Semester = allocation.Semester,
                        SubjectCode = allocation.SubjectCode,
                        SubjectName = allocation.SubjectName,
                        Department = allocation.DepartmentName,
                        ClassName = allocation.ClassName,
                        Branch = allocation.BranchName,
                        Year = allocation.Year,
                        AllocationStatus = allocation.Status,
                        ExamDate = allocation.ExamDate,
                        RequestStatus = request.Status,
                        RequestDate = request.RequestDate
                    });
                }
            }

            return responseList;
        }

        public async Task<bool> UpdatePasswordAsync(UpdatePasswordRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.UserId))
                return false;

            var user = await _context.StaffModel
                .FirstOrDefaultAsync(u => u.StaffId.ToString() == request.UserId);

            if (user == null)
                return false;

            // 🔐 Hash password using simple hash (use Identity for stronger hashing)
            user.Password = request.NewPassword;

            _context.StaffModel.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AcceptReallocationRequestAsync(int requestId)
        {
            var request = await _context.ReallocationRequests.FirstOrDefaultAsync(r => r.Id == requestId);
            if (request == null) return false;

            // Update the ExamTimeTableModel with the new staff
            var allocation = await _context.ExamTimeTable.FirstOrDefaultAsync(e => e.Id == request.AllocationId);
            if (allocation == null) return false;

            // 1️⃣ Update the allocation to the accepted staff
            allocation.ReallocatedStaffId = request.ToStaffId;
            allocation.Status = "pending"; // or "allocated" based on your logic

            // 2️⃣ Mark this request as approved
            request.Status = "approved";

            // 3️⃣ Reject all other requests for the same AllocationId
            var otherRequests = await _context.ReallocationRequests
                .Where(r => r.AllocationId == request.AllocationId && r.Id != requestId)
                .ToListAsync();

            foreach (var r in otherRequests)
            {
                r.Status = "canceled";
            }

            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> RejectReallocationRequestAsync(int requestId)
        {
            var request = await _context.ReallocationRequests.FirstOrDefaultAsync(r => r.Id == requestId);
            if (request == null) return false;

            request.Status = "rejected";
            await _context.SaveChangesAsync();
            return true;
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
